export function normalizeServerUrl(value) {
  const url=new URL(String(value).trim());
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error('http:// 또는 https:// 서버 주소를 입력하세요.');
  return url.origin;
}
export function isLoopback(host) {return ['localhost','127.0.0.1','[::1]','::1'].includes(host);}
export function inviteUrl(endpoint,roomCode,serverInfo={}) {
  let base=normalizeServerUrl(endpoint);
  if(serverInfo.publicUrl)base=normalizeServerUrl(serverInfo.publicUrl);
  else if(isLoopback(new URL(base).hostname) && serverInfo.lanUrls?.length)base=normalizeServerUrl(serverInfo.lanUrls[0]);
  const url=new URL(base);url.searchParams.set('room',roomCode);return url.href;
}
