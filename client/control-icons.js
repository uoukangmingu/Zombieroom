const paths={
 fire:'M12 3v4m0 10v4M3 12h4m10 0h4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
 adsFire:'M12 3v3m0 12v3M3 12h3m12 0h3M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM10 12h4m-2-2v4',
 aim:'M4 8V4h4m8 0h4v4M4 16v4h4m8 0h4v-4M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
 jump:'m6 11 6-7 6 7M12 4v14M5 20h14',sprint:'m7 6 5 5-5 5m6-10 5 5-5 5',
 reload:'M5 8a8 8 0 1 1-1 7M5 3v5h5',heal:'M9 4h6v5h5v6h-5v5H9v-5H4V9h5Z',
 interact:'M6 12V7a2 2 0 0 1 4 0v5-8a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v7l-3 6H8l-4-5a2 2 0 0 1 2-3Z',
 weapon:'M3 8h18v4h-6l-3 7H8l2-7H3ZM5 5h6',pause:'M8 5v14M16 5v14',none:'M6 6l12 12M18 6 6 18',
 pistol:'M3 8h17v4h-6l-2 7H8l2-7H3ZM5 5h11',smg:'M2 8h19v5H11v7H8v-7H3ZM5 5h9m3 3V5',
 shotgun:'M2 10h20m-20 3h19M6 10v7h4l2-4M13 9v6',grenade:'M10 3h5v4l3 4v8l-3 2H9l-3-2v-8l4-4ZM15 4l4 4M7 13h10',
 barrel:'M3 14h18v4H3ZM7 10h10v4M10 7h4v3',wall:'M4 4h16v13H4ZM8 21h8m-4-4v4M7 8h10m-10 4h7',
 rocket:'M3 9h16l3 3-3 3H3ZM7 15v5h3v-5M6 6h7v3',railgun:'M2 8h18v3H8l-2 8H3l2-8M10 6v8m4-8v8m4-8v8',
 molotov:'M10 7V3h4v4l3 4v10H7V11ZM14 3l3-2 2 3M8 15h8'
};
export function controlIcon(name){return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name] || paths.weapon}"/></svg>`;}
export function joystickAxis(dx,dy,radius,deadzone=.12){const length=Math.hypot(dx,dy),unit=Math.min(1,length/Math.max(1,radius));if(unit<=deadzone)return{x:0,z:0};const amount=(unit-deadzone)/(1-deadzone);return{x:dx/length*amount,z:dy/length*amount};}
