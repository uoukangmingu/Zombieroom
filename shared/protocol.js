export const PROTOCOL_VERSION = 3;

export const CLIENT_TO_SERVER = {
  CREATE_ROOM: 'createRoom',
  JOIN_ROOM: 'joinRoom',
  SET_READY: 'setReady',
  START_GAME: 'startGame',
  PLAYER_INPUT: 'playerInput',
  PLAYER_ACTION: 'playerAction',
  PICKUP_ITEM: 'pickupItem',
  CHOOSE_REWARD: 'chooseReward'
};

export const SERVER_TO_CLIENT = {
  ROOM_CREATED: 'roomCreated',
  ROOM_JOINED: 'roomJoined',
  LOBBY_UPDATE: 'lobbyUpdate',
  LOBBY_ERROR: 'lobbyError',
  GAME_START: 'gameStart',
  REMOTE_INPUT: 'remoteInput',
  REMOTE_ACTION: 'remoteAction',
  STATE_SNAPSHOT: 'stateSnapshot'
};

export function sanitizeRoomCode(code = '') {
  return String(code).trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export function sanitizeSettings(settings = {}) {
  const maps = new Set(['box', 'lane', 'castle', 'maze']);
  const diffs = new Set(['normal', 'hard', 'hell']);
  const qualities = new Set(['low', 'mid', 'high']);
  const wave = Math.max(1, Math.min(30, Number(settings.startWave || 1) || 1));
  return {
    map: maps.has(settings.map) ? settings.map : 'box',
    diff: diffs.has(settings.diff) ? settings.diff : 'normal',
    quality: qualities.has(settings.quality) ? settings.quality : 'mid',
    startWave: String(wave)
  };
}
