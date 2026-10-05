// Breath + irregular glottal pulses through vocal-tract resonators. Generated
// once per species/mood, so a horde does not synthesize PCM on every footstep.
export const CREATURE_VOICES=Object.freeze({
  zombie:{pitch:69,formants:[410,970,1880],breath:.20,rough:.28,duration:1.22},
  runner:{pitch:153,formants:[720,1740,2840],breath:.55,rough:.14,duration:.68},
  tank:{pitch:37,formants:[190,475,1150],breath:.12,rough:.62,duration:1.52},
  devil:{pitch:87,formants:[330,1290,2430],breath:.42,rough:.44,duration:1.67},
  bomber:{pitch:108,formants:[810,1470,3100],breath:.78,rough:.32,duration:1.08},
  shield:{pitch:77,formants:[275,660,1260],breath:.35,rough:.21,duration:1.14}
});
export function creaturePCM(type='zombie',mood='idle',sampleRate=24000) {
  const p=CREATURE_VOICES[type] || CREATURE_VOICES.zombie;
  const duration=p.duration*(mood==='attack'?.53:mood==='death'?.91:1);
  const data=new Float32Array(Math.ceil(sampleRate*duration));
  let seed=17+Math.round(p.pitch)*913,phase=0,low=0,peak=0;
  const bands=p.formants.map((f,i)=>{const r=Math.exp(-Math.PI*(65+i*75)/sampleRate);return {r,r2:r*r,c:2*r*Math.cos(2*Math.PI*f/sampleRate),a:0,b:0};});
  for(let i=0;i<data.length;i++){
    const t=i/sampleRate,u=i/data.length;
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;const white=seed/2147483648-1;low+=.09*(white-low);
    const bend=mood==='death'?1.16-u*.64:mood==='attack'?1.13+Math.sin(u*Math.PI)*.18:1+Math.sin(u*5.8)*.12;
    const pitch=p.pitch*bend*(1+Math.sin(t*71)*p.rough*.07+low*.06);
    phase=(phase+pitch/sampleRate)%1;
    const pulse=Math.pow(Math.max(0,Math.sin(phase*Math.PI*2)),9)-.13;
    const breath=type==='runner'?(.25+.75*Math.pow(Math.max(0,Math.sin(t*21)),2)):type==='bomber'?.55+.45*Math.sin(t*15)**2:1;
    const excitation=pulse*(1+low*p.rough*3)+white*p.breath*.20;
    let voice=0;
    for(let j=0;j<bands.length;j++){const b=bands[j],y=excitation*(1-b.r)+b.c*b.a-b.r2*b.b;b.b=b.a;b.a=y;voice+=y/(j+1);}
    if(type==='devil')voice+=Math.sin(t*p.pitch*.503*Math.PI*2)*.13+white*.025;
    if(type==='tank')voice+=Math.sin(phase*Math.PI*2)*.12;
    if(type==='bomber')voice+=(white-low)*.10;
    const env=Math.min(1,u/.07)*Math.pow(Math.max(0,1-u),.62)*(.78+.22*Math.sin(t*8.7));
    data[i]=(voice+low*p.breath*.08)*env*breath;peak=Math.max(peak,Math.abs(data[i]));
  }
  const gain=.82/Math.max(.001,peak);for(let i=0;i<data.length;i++)data[i]*=gain;
  return data;
}
