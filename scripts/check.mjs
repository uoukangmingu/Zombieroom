import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
for(const dir of ['client','server','shared','scripts'])for(const name of readdirSync(new URL('../'+dir+'/',import.meta.url))){
 if(!/\.(mjs|js)$/.test(name)||name==='game.bundle.js')continue;
 const path=new URL('../'+dir+'/'+name,import.meta.url);const r=spawnSync(process.execPath,['--check',path.pathname],{stdio:'inherit'});if(r.status)process.exit(r.status);
}
console.log('Source syntax: passed');
