const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
export const MISSION_LINES={CLEAR:'구역을 확보하세요. 남은 적을 모두 처치하십시오.',RUNNERS:'빠른 개체가 접근합니다. 측면을 주의하세요.',SURVIVE:'포위되었습니다. 제한 시간 동안 생존하세요.',CORES:'감염원을 찾아 파괴하세요.',ELITE:'중장갑 개체 확인. 공격을 피하며 집중 사격하세요.',CAPTURE:'표시된 거점을 확보하고 유지하세요.',RUSH:'폭발 개체가 접근합니다. 거리를 유지하세요.',RELAYS:'중계기를 찾아 작동시키세요.','LOW POWER':'전력이 끊겼습니다. 발소리를 듣고 생존하세요.',BOSS:'균열 지휘체 출현. 투사체를 피하세요.'};
export class Narrator {
  constructor({synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance,clock=()=>Date.now(),onCaption=()=>{},onStatus=()=>{},onSpeaking=()=>{}}={}){
    this.synth=synth;this.Utterance=Utterance;this.clock=clock;this.onCaption=onCaption;this.onStatus=onStatus;this.onSpeaking=onSpeaking;
    this.enabled=true;this.subtitles=true;this.volume=.85;this.master=1;this.voiceURI='';this.unlocked=false;this.hidden=false;
    this.voices=[];this.queue=[];this.recent=new Map();this.current=null;this.generation=0;this.captionTimer=null;this.speechTimer=null;
    this.refreshVoices=this.refreshVoices.bind(this);this.synth?.addEventListener?.('voiceschanged',this.refreshVoices);this.refreshVoices();
  }
  refreshVoices(){this.voices=(this.synth?.getVoices?.() || []).filter(v=>/^ko(?:[-_]|$)/i.test(v.lang));this.status();this.drain();}
  status(message='') {this.onStatus(message || (!this.enabled?'나레이션 꺼짐':!this.synth||!this.Utterance?'이 브라우저는 음성 안내를 지원하지 않습니다. 자막으로 안내합니다.':!this.voices.length?'한국어 음성을 찾는 중입니다. 기기의 한국어 읽어주기 음성을 설치하면 음성도 재생됩니다.':`한국어 음성 준비 · ${(this.voice() || this.voices[0]).name}`),this.voices);}
  voice(){return this.voices.find(v=>v.voiceURI===this.voiceURI) || this.voices.find(v=>v.localService) || this.voices[0];}
  unlock(){this.unlocked=true;this.refreshVoices();}
  configure({enabled=this.enabled,subtitles=this.subtitles,volume=this.volume,master=this.master,voiceURI=this.voiceURI}={}){
    const stop=(!enabled&&this.enabled)||(clamp(volume)*clamp(master)===0)||(voiceURI!==this.voiceURI);
    this.enabled=!!enabled;this.subtitles=!!subtitles;this.volume=clamp(volume);this.master=clamp(master);this.voiceURI=String(voiceURI || '');
    if(stop)this.stop();if(!this.subtitles)this.onCaption('');this.status();
  }
  setHidden(hidden){this.hidden=!!hidden;if(hidden)this.stop();}
  say(key,text,{priority=1,cooldown=12000,force=false}={}){
    if(this.hidden || (!this.enabled&&!this.subtitles) || !text)return false;
    const now=this.clock();if(!force && now-(this.recent.get(key) ?? -Infinity)<cooldown)return false;
    this.recent.set(key,now);if(this.recent.size>96)this.recent.delete(this.recent.keys().next().value);
    const item={key,text,priority,expires:now+6000};
    if(this.current && priority>this.current.priority){this.stop();}
    this.queue=this.queue.filter(q=>q.key!==key);
    if(this.queue.length>=2)this.queue.shift();this.queue.push(item);this.queue.sort((a,b)=>b.priority-a.priority);this.drain();return true;
  }
  drain(){
    if(this.current || this.hidden)return;
    this.queue=this.queue.filter(q=>q.expires>this.clock());const item=this.queue.shift();if(!item)return;
    this.current=item;const generation=++this.generation;
    const captionTime=Math.min(6500,Math.max(2300,item.text.length*95));
    if(this.subtitles){this.onCaption(item.text);clearTimeout(this.captionTimer);this.captionTimer=setTimeout(()=>{if(generation===this.generation)this.onCaption('');},captionTime);}
    const finish=()=>{if(generation!==this.generation)return;clearTimeout(this.speechTimer);this.current=null;this.onSpeaking(false);this.drain();};
    if(!this.enabled || !this.unlocked || !this.voice() || !this.Utterance || this.volume*this.master===0){this.speechTimer=setTimeout(finish,captionTime);return;}
    const utterance=new this.Utterance(item.text);utterance.lang='ko-KR';utterance.voice=this.voice();utterance.volume=this.volume*this.master;utterance.rate=1.04;utterance.pitch=.92;
    this.utterance=utterance;utterance.onstart=()=>{if(generation===this.generation)this.onSpeaking(true);};utterance.onend=finish;
    utterance.onerror=event=>{if(generation!==this.generation)return;this.status(event.error==='not-allowed'?'음성 확인 버튼을 눌러 안내를 켜주세요.':'음성을 재생하지 못했습니다. 자막 안내는 유지됩니다.');finish();};
    this.speechTimer=setTimeout(()=>{if(generation===this.generation){this.synth?.cancel();finish();}},10000);
    try{this.synth.speak(utterance);}catch{finish();this.status('음성 재생을 시작할 수 없어 자막으로 안내합니다.');}
  }
  stop(){this.generation++;clearTimeout(this.captionTimer);clearTimeout(this.speechTimer);this.queue=[];this.current=null;this.utterance=null;this.synth?.cancel?.();this.onCaption('');this.onSpeaking(false);}
  reset(){this.stop();this.recent.clear();}
  dispose(){this.stop();this.synth?.removeEventListener?.('voiceschanged',this.refreshVoices);}
}
