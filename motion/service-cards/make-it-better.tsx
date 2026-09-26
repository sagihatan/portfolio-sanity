import React from 'react';
import {Composition,registerRoot,useCurrentFrame,staticFile} from 'remotion';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t)};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const blue='#0D99FF';
function Film(){
 const t=useCurrentFrame()/30;
 const p=(a:number,b:number)=>smooth((t-a)/(b-a));
 const moveImage=p(1.6,2.65), moveButton=p(3.4,4.35), color=p(4.55,5.25),slide=p(7.0,8.1);
 const ix=mix(198,536,moveImage),iy=mix(294,164,moveImage),iw=mix(246,238,moveImage),ih=mix(110,219,moveImage);
 const bx=mix(604,198,moveButton),by=mix(259,330,moveButton);
 const imageSelect=p(1.35,1.5)*(1-p(2.75,2.95));
 const buttonSelect=p(3.15,3.3)*(1-p(4.45,4.65));
 const keys=[[0,850,475],[.75,850,475],[1.25,321,349],[1.6,321,349],[2.65,655,273.5],[2.85,655,273.5],[3.1,657,278],[3.4,657,278],[4.35,251,349],[4.6,251,349],[5.05,850,475]];
 let x=850,y=475;
 for(let i=0;i<keys.length-1;i++){const a=keys[i],b=keys[i+1];if(t>=a[0]){const q=smooth((t-a[0])/(b[0]-a[0]));x=mix(a[1],b[1],q);y=mix(a[2],b[2],q);}}
 const cursorOpacity=p(.55,.8)*(1-p(5.15,5.4));
 const card=(original:boolean)=>{
 const q=original?0:color,px=original?198:ix,py=original?294:iy,pw=original?246:iw,ph=original?110:ih;
 const buttonX=original?604:bx,buttonY=original?259:by;
 const clip=original?'next-clip':'current-clip';
 return <g>
 <rect x="140" y="96" width="680" height="348" rx="12" fill="white" stroke="#EAECF0" filter="url(#shadow)"/>
 <path d="M209 137 Q211 146 220 148 Q211 150 209 159 Q207 150 198 148 Q207 146 209 137Z" fill="#999399"/>
 <path d="M209 137 Q211 146 220 148 Q211 150 209 159 Q207 150 198 148 Q207 146 209 137Z" fill="url(#brand)" opacity={q}/>
 <text x="229" y="154" fontSize="17" fontWeight="700" letterSpacing="-.5" fill="#0B0B0F">Luma</text>
 <text x="198" y="240" fontSize="39" fontWeight="700" letterSpacing="-1.5" fill="#0B0B0F">Great things</text>
 <text x="198" y="284" fontSize="39" fontWeight="700" letterSpacing="-1.5" fill="#0B0B0F">start here.</text>
 <svg x={px} y={py} width={pw} height={ph} viewBox={`0 0 ${pw} ${ph}`}>
 <defs><clipPath id={clip}><rect width={pw} height={ph} rx="14"/></clipPath></defs>
 <g clipPath={`url(#${clip})`}>
 <rect width={pw} height={ph} fill="url(#gray)"/>
 <rect width={pw} height={ph} fill="url(#brand)" opacity={q}/>
 <circle cx={pw-12} cy="18" r="128" fill="white" opacity=".13"/>
 </g></svg>
 <rect x={buttonX} y={buttonY} width="126" height="38" rx="19" fill="#777177"/>
 <rect x={buttonX} y={buttonY} width="126" height="38" rx="19" fill="url(#brand)" opacity={q}/>
 <text x={buttonX+19} y={buttonY+24} fontSize="12" fontWeight="700" fill="white">Get started →</text>
 {!original && <>
 <g opacity={imageSelect} fill="white" stroke={blue} strokeWidth="1.5">
 <rect x={px-4} y={py-4} width={pw+8} height={ph+8} fill="none"/>
 {[[px-4,py-4],[px+pw+4,py-4],[px-4,py+ph+4],[px+pw+4,py+ph+4]].map(([xx,yy],i)=><rect key={i} x={xx-3} y={yy-3} width="6" height="6"/>)}
 </g>
 <g opacity={buttonSelect} fill="white" stroke={blue} strokeWidth="1.5">
 <path d="M198 193 V390" fill="none" strokeDasharray="4 4" opacity=".5"/>
 <rect x={buttonX-4} y={buttonY-4} width="134" height="46" fill="none"/>
 {[[buttonX-4,buttonY-4],[buttonX+130,buttonY-4],[buttonX-4,buttonY+42],[buttonX+130,buttonY+42]].map(([xx,yy],i)=><rect key={i} x={xx-3} y={yy-3} width="6" height="6"/>)}
 </g>
 </>}
 </g>;
 };
 return <div style={{width:960,height:576,background:'#FAF8F8',fontFamily:'Satoshi,sans-serif'}}>
 <style>{`@font-face{font-family:Satoshi;src:url('${staticFile('fonts/Satoshi-700.woff2')}');font-weight:700}`}</style>
 <svg width="960" height="576" viewBox="0 0 960 576">
 <defs>
 <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".85" fill="#B5ABB3" opacity=".14"/></pattern>
 <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#D4532E"/><stop offset=".5" stopColor="#B52752"/><stop offset="1" stopColor="#42075A"/></linearGradient>
 <linearGradient id="gray" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#BCB8BC"/><stop offset="1" stopColor="#625D62"/></linearGradient>
 <filter id="shadow" x="-30%" y="-30%" width="170%" height="190%"><feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#42075A" floodOpacity=".10"/></filter>
 </defs>
 <rect width="960" height="576" fill="url(#dots)"/>
 <g transform={`translate(${-960*slide} 18)`}>{card(false)}</g>
 <g transform={`translate(${960*(1-slide)} 18)`}>{card(true)}</g>
 <g transform={`translate(${x} ${y+18})`} opacity={cursorOpacity}>
 <path d="M0 0 V25 L7 19 L12 30 L17 28 L12 17 H23 Z" fill="#17131D" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
 </g>
 </svg></div>;
}
registerRoot(()=> <Composition id="MakeItBetter" component={Film} durationInFrames={258} fps={30} width={960} height={576}/>);
