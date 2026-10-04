// A cached grid guarantees objectives and spawns stay in the player's component.
// Server enemies share breadth-first flow fields instead of doing an A* per enemy.
export class Navigation {
  constructor(map, radius=.80) {
    this.map=map;this.step=1.25;this.half=map.size/2;this.width=Math.floor(map.size/this.step)+1;
    const size=this.width*this.width;this.walk=new Uint8Array(size);this.edges=Array.from({length:size},()=>[]);this.flows=new Map();
    for(let id=0;id<size;id++){const p=this.point(id);if(!this.collides(p.x,p.z,radius))this.walk[id]=1;}
    for(let id=0;id<size;id++){
      if(!this.walk[id])continue;const x=id%this.width,z=Math.floor(id/this.width),a=this.point(id);
      for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=x+dx,nz=z+dz;if(nx<0||nz<0||nx>=this.width||nz>=this.width)continue;const n=nz*this.width+nx;if(!this.walk[n])continue;
        const b=this.point(n);if(this.clear(a,b,radius))this.edges[id].push(n);
      }
    }
    this.start=this.closest(map.player[0],map.player[1]);this.reachable=this.flood(this.start);
    this.points=[];for(let id=0;id<size;id++)if(this.reachable[id])this.points.push(this.point(id));
  }
  collides(x,z,r=.46) {
    if(Math.abs(x)>this.half-1-r || Math.abs(z)>this.half-1-r)return true;
    return this.map.obstacles.some(([ox,oz,w,d])=>Math.abs(x-ox)<w/2+r && Math.abs(z-oz)<d/2+r);
  }
  clear(a,b,r=.65){const d=Math.hypot(b.x-a.x,b.z-a.z),count=Math.ceil(d/.38);for(let i=0;i<=count;i++){const k=count?i/count:0;if(this.collides(a.x+(b.x-a.x)*k,a.z+(b.z-a.z)*k,r))return false;}return true;}
  point(id){return {x:(id%this.width)*this.step-this.half,z:Math.floor(id/this.width)*this.step-this.half,id};}
  closest(x,z,reachable=false) {
    const ix=Math.round((x+this.half)/this.step),iz=Math.round((z+this.half)/this.step);let best=-1,distance=Infinity;
    for(let ring=0;ring<10;ring++){
      for(let dx=-ring;dx<=ring;dx++)for(let dz=-ring;dz<=ring;dz++){
        const xx=ix+dx,zz=iz+dz;if(xx<0||zz<0||xx>=this.width||zz>=this.width)continue;const id=zz*this.width+xx;
        if(!this.walk[id] || (reachable && !this.reachable[id]))continue;
        const p=this.point(id),d=Math.hypot(x-p.x,z-p.z);if(d<distance){best=id;distance=d;}
      }
      if(best>=0)return best;
    }
    return this.start ?? 0;
  }
  flood(start) {const seen=new Uint8Array(this.walk.length),q=[start];seen[start]=1;for(let i=0;i<q.length;i++)for(const n of this.edges[q[i]])if(!seen[n]){seen[n]=1;q.push(n);}return seen;}
  flow(x,z) {
    const target=this.closest(x,z,true);if(this.flows.has(target))return this.flows.get(target);
    const distance=new Int32Array(this.walk.length).fill(-1),q=[target];distance[target]=0;
    for(let i=0;i<q.length;i++)for(const n of this.edges[q[i]])if(distance[n]<0){distance[n]=distance[q[i]]+1;q.push(n);}
    if(this.flows.size>=6)this.flows.delete(this.flows.keys().next().value);this.flows.set(target,distance);return distance;
  }
  direction(x,z,tx,tz) {
    if(this.clear({x,z},{x:tx,z:tz},.8)){const len=Math.hypot(tx-x,tz-z)||1;return{x:(tx-x)/len,z:(tz-z)/len};}
    const id=this.closest(x,z,true),field=this.flow(tx,tz);let best=id,bestD=field[id];
    for(const n of this.edges[id])if(field[n]>=0 && (bestD<0 || field[n]<bestD)){best=n;bestD=field[n];}
    const p=this.point(best),len=Math.hypot(p.x-x,p.z-z)||1;return{x:(p.x-x)/len,z:(p.z-z)/len};
  }
  safePoint({from=null,minDistance=6,maxDistance=40,existing=[],clearance=1.2,random=Math.random}={}) {
    from=from || this.point(this.start);const candidates=this.points.filter(p=>{
      const d=Math.hypot(p.x-from.x,p.z-from.z);
      return d>=minDistance && d<=maxDistance && !this.collides(p.x,p.z,clearance) && existing.every(o=>Math.hypot(p.x-o.x,p.z-o.z)>=8);
    });
    if(candidates.length)return candidates[Math.floor(random()*candidates.length)];
    const fallback=this.points.filter(p=>!this.collides(p.x,p.z,.8) && existing.every(o=>Math.hypot(p.x-o.x,p.z-o.z)>=4)).sort((a,b)=>Math.hypot(b.x-from.x,b.z-from.z)-Math.hypot(a.x-from.x,a.z-from.z));
    return fallback[0] || this.point(this.start);
  }
}
