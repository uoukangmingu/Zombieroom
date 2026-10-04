import {io} from './vendor/socket.io.js';

export class NetAdapter {
  constructor(game, ui) {
    this.game=game; this.ui=ui; this.connected=false; this.enabled=false;
    this.socket=null; this.room=null; this.pingMs=null; this.lastInputAt=0; this.seq=0;
    try { this.session=JSON.parse(sessionStorage.getItem('boxhead_session_v1') || 'null'); } catch { this.session=null; }
    this.playerToken=this.session?.token || ('p_'+(globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)+Date.now()));
    this.serverUrl=String(new URLSearchParams(location.search).get('server') || window.BHFPS_CONFIG?.SERVER_URL || '').trim().replace(/\/$/,'');
    this.serverUrl=this.serverUrl && /^https?:\/\//.test(this.serverUrl) ? this.serverUrl : '';
    this.inputTimer=setInterval(()=>this.sendInput(),33);
  }

  status(state,text) {
    if(this.ui.netState){this.ui.netState.className='net-state '+state;this.ui.netState.textContent=state==='connected'?'온라인 연결됨':state==='error'?'연결 확인 필요':'연결 대기';}
    if(this.ui.netStatusText)this.ui.netStatusText.textContent=text;
    this.game.updateLobbyUI();
  }

  restoreSession() {
    const invite=new URLSearchParams(location.search).get('room');
    if(this.session?.roomCode || invite) {
      if(this.ui.roomCodeInput)this.ui.roomCodeInput.value=this.session?.roomCode || invite.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
      this.game.setPlayMode('coop');
      if(this.session?.roomCode)this.pendingJoin=this.session.roomCode;
      this.connect();
    }
  }

  connect() {
    if(this.socket){if(!this.socket.connected)this.socket.connect();return;}
    if(location.protocol==='file:' && !this.serverUrl) {
      this.status('error','온라인 협동은 서버 주소에서 접속하세요. 압축 안의 온라인_서버실행.bat로 서버를 시작할 수 있습니다.');return;
    }
    this.status('offline','온라인 서버에 연결하는 중…');
    this.socket=io(this.serverUrl || location.origin,{
      transports:window.BHFPS_CONFIG?.FORCE_WEBSOCKET?['websocket']:['websocket','polling'],
      timeout:6000,reconnection:true,reconnectionDelay:500,reconnectionDelayMax:4000,
      auth:{playerToken:this.playerToken}
    });
    this.socket.on('connect',()=>{
      this.connected=true;this.enabled=true;this.seq=0;
      this.status('connected','방을 만들거나 친구의 6자리 코드로 입장하세요.');
      this.startPingLoop();
      const code=this.pendingJoin || this.session?.roomCode || this.game.lobby.roomCode;
      if(code){this.pendingJoin=null;this.socket.emit('joinRoom',{roomCode:code,playerToken:this.playerToken,reconnect:true});}
    });
    this.socket.on('disconnect',()=>{
      this.connected=false;this.pingMs=null;clearInterval(this.pingTimer);
      this.status('offline','연결이 끊겨 자동으로 다시 연결하고 있습니다.');
      if(this.game.running && this.game.lobby.mode==='coop')this.game.setConnectionBlocked(true,'연결 복구 중','서버에 다시 연결하고 있습니다. 게임 진행은 잠시 대기합니다.');
    });
    this.socket.on('connect_error',()=>{this.connected=false;this.status('error','서버에 연결할 수 없습니다. 같은 서버 주소로 접속했는지 확인하세요.');});
    for(const event of ['roomCreated','roomJoined','lobbyUpdate'])this.socket.on(event,p=>this.applyRoom(p));
    this.socket.on('lobbyError',p=>{
      this.game.updateLobbyUI(p?.message || '방 요청에 실패했습니다.');
      if(p?.code==='NOT_FOUND' && this.session?.roomCode){this.clearSession();if(this.game.running)this.game.returnToMainMenu();}
      this.game.showToast(p?.message || '방 요청 실패');
    });
    this.socket.on('gameStart',p=>this.startSession(p));
    this.socket.on('stateSnapshot',p=>{if(p.roomCode===this.game.lobby.roomCode)this.game.applyNetworkSnapshot(p);});
    this.socket.on('remoteAction',p=>this.game.applyRemoteAction(p.playerId,p.action || {}));
    this.socket.on('roomLeft',()=>{this.clearSession();this.room=null;this.game.resetLobby();});
    this.socket.on('returnToLobby',p=>{this.game.resetToMainMenuState();this.game.setConnectionBlocked(false);this.applyRoom(p);});
  }

  applyRoom(payload={}) {
    const room=payload.room || payload;
    if(!room.roomCode)return;
    this.room=room;
    const me=room.players.find(p=>p.id===this.socket?.id);
    const other=room.players.find(p=>p.id!==this.socket?.id);
    this.game.lobby={mode:'coop',role:me?.role || 'guest',roomCode:room.roomCode,ready:!!me?.ready,remoteReady:!!other?.ready,remoteSeen:!!other,remoteConnected:!!other?.connected,playerId:this.socket?.id};
    this.session={token:this.playerToken,roomCode:room.roomCode};
    try{sessionStorage.setItem('boxhead_session_v1',JSON.stringify(this.session));}catch{}
    this.game.setPlayMode('coop');
    if(this.ui.roomCodeInput)this.ui.roomCodeInput.value=room.roomCode;
    if(room.settings){if(this.ui.map)this.ui.map.value=room.settings.map;if(this.ui.diff)this.ui.diff.value=room.settings.diff;if(this.ui.startWave)this.ui.startWave.value=room.settings.startWave;}
    this.game.drawStartMapPreview();this.game.renderLevelGuide();
    if(payload.snapshot && room.phase==='playing')this.startSession({...payload,settings:room.settings,gameId:payload.snapshot.game?.id});
    this.game.updateLobbyUI(payload.message || '');
  }

  startSession(payload={}) {
    const settings=payload.settings || payload.room?.settings || {};
    if(payload.room)this.applyRoom({room:payload.room});
    if(this.ui.map && settings.map)this.ui.map.value=settings.map;
    if(this.ui.diff && settings.diff)this.ui.diff.value=settings.diff;
    if(this.ui.startWave && settings.startWave)this.ui.startWave.value=settings.startWave;
    const id=payload.gameId || payload.snapshot?.game?.id;
    if(!this.game.running || (id && id!==this.game.networkGameId)){
      this.game.networkGameId=id;
      this.game.runMode='survival';this.game.startFromMenu(true);
      this.game.serverEnemyAuthority=true;
    }
    this.game.setConnectionBlocked(false);
    if(payload.snapshot)this.game.applyNetworkSnapshot(payload.snapshot);
  }

  clearSession(){this.session=null;try{sessionStorage.removeItem('boxhead_session_v1');}catch{}}
  createRoom(settings){if(!this.connected){this.connect();this.game.updateLobbyUI('서버 연결 후 방 만들기를 눌러주세요.');return false;}this.socket.emit('createRoom',{settings,playerToken:this.playerToken});return true;}
  joinRoom(code){if(!this.connected){this.pendingJoin=code;this.connect();return true;}this.socket.emit('joinRoom',{roomCode:code,playerToken:this.playerToken});return true;}
  setReady(ready){if(!this.connected)return false;this.socket.emit('setReady',{roomCode:this.game.lobby.roomCode,ready});return true;}
  startGame(settings){if(!this.connected)return false;this.socket.emit('startGame',{roomCode:this.game.lobby.roomCode,settings});return true;}
  leaveRoom(){if(this.connected)this.socket.emit('leaveRoom');this.clearSession();this.room=null;}
  returnToLobby(){if(this.connected)this.socket.emit('returnToLobby',{roomCode:this.game.lobby.roomCode});}
  updateSettings(settings){if(this.connected && this.game.lobby.role==='host')this.socket.emit('updateSettings',{roomCode:this.game.lobby.roomCode,settings});}
  startPingLoop(){clearInterval(this.pingTimer);const ping=()=>{if(!this.connected)return;const t=performance.now();this.socket.timeout(2500).emit('latencyPing',{},err=>{this.pingMs=err?null:Math.round(performance.now()-t);if(this.ui.pingText)this.ui.pingText.textContent=this.pingMs==null?'PING —':`PING ${this.pingMs}ms`;});};ping();this.pingTimer=setInterval(ping,2500);}

  sendInput(force=false) {
    const g=this.game;
    if(!this.connected || !g.running || g.gameOver || g.lobby.mode!=='coop')return;
    const t=performance.now();if(!force && t-this.lastInputAt<30)return;this.lastInputAt=t;
    const blocked=g.paused || g.rewardOpen || g.connectionBlocked;
    const keys={};
    if(!blocked)for(const [action,code]of Object.entries({forward:'KeyW',backward:'KeyS',left:'KeyA',right:'KeyD',jump:'Space',sprint:'ShiftLeft',interact:'KeyF'}))if(g.input.actionDown(action))keys[code]=true;
    this.socket.volatile.emit('playerInput',{
      roomCode:g.lobby.roomCode,seq:++this.seq,keys,look:{yaw:g.yaw,pitch:g.pitch},weapon:g.selectedWeapon,
      flags:{fire:!blocked&&g.input.actionDown('fire'),ads:!blocked&&g.input.actionDown('aim'),assist:!blocked&&g.input.actionDown('heal'),interact:!blocked&&g.input.actionDown('interact'),move:blocked?0:g.moveIntensity}
    });
  }
  sendAction(actionType,weapon,extra={}){
    const g=this.game;if(!this.connected || !g.running || g.lobby.mode!=='coop' || g.connectionBlocked)return false;
    if(g.paused && actionType!=='chooseReward')return false;
    this.socket.emit('playerAction',{roomCode:g.lobby.roomCode,actionType,seq:++this.seq,weapon:typeof weapon==='string'?weapon:weapon?.id || g.selectedWeapon,look:{yaw:g.yaw,pitch:g.pitch},ads:g.ads>.45,...extra});return true;
  }
}
