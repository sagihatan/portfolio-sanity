import React from 'react';
import {Composition,registerRoot,useCurrentFrame,staticFile} from 'remotion';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t)};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const point=(t:number,keys:number[][])=>{let x=keys[0][1],y=keys[0][2];for(let i=0;i<keys.length-1;i++){const a=keys[i],b=keys[i+1];if(t>=a[0]){const q=smooth((t-a[0])/(b[0]-a[0]));x=mix(a[1],b[1],q);y=mix(a[2],b[2],q)}}return{x,y}};
function Film(){
 const t=useCurrentFrame()/30,p=(a:number,b:number)=>smooth((t-a)/(b-a));
 const headline=p(.85,1.75), visual=p(1.65,2.7),button=p(3.2,4.2),slide=p(6.9,8);
 const teamOpacity=1-p(6.25,6.65),join=p(2.25,2.55);
 const maya=point(t,[[0,235,275],[.65,235,275],[.85,235,275],[1.75,219,267],[2.15,219,267],[2.65,172,395]]);
 const alex=point(t,[[0,757,349],[1.2,757,349],[1.65,757,349],[2.7,737,331],[3.1,737,331],[3.6,790,411]]);
 const sagi=point(t,[[0,904,480],[2.25,904,480],[2.95,335,395],[3.2,335,395],[4.2,283,349],[4.6,283,349],[5.2,403,394]]);
 const cursor=(name:string,x:number,y:number,active:boolean,alpha=1)=> <g transform={`translate(${x} ${y+18})`} opacity={alpha}>
 <path d="M0 0 V25 L7 19 L12 30 L17 28 L12 17 H23 Z" fill={active?'url(#brand)':'#858087'} stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
 <rect x="16" y="27" width={active?57:58} height="25" rx="7" fill={active?'url(#brand)':'#858087'}/>
 <text x="27" y="44" fontSize="13" fontWeight="700" fill="white">{name}</text>
 </g>;
 const card=(original:boolean)=>{
 const h=original?0:headline,v=original?0:visual,b=original?0:button;
 const bx=mix(250,198,b),by=mix(376,330,b);
 return <g>
 <rect x="140" y="96" width="680" height="348" rx="12" fill="white" stroke="#EAECF0" filter="url(#shadow)"/>
 <path d="M209 137 Q211 146 220 148 Q211 150 209 159 Q207 150 198 148 Q207 146 209 137Z" fill="url(#brand)"/>
 <text x="229" y="154" fontSize="17" fontWeight="700" letterSpacing="-.5" fill="#0B0B0F">Luma</text>
 <g transform={`translate(${16*(1-h)} ${8*(1-h)})`}>
 <text x="198" y="240" fontSize="39" fontWeight="700" letterSpacing="-1.5" fill="#0B0B0F">Great things</text>
 <text x="198" y="284" fontSize="39" fontWeight="700" letterSpacing="-1.5" fill="#0B0B0F">start here.</text>
 {!original && <rect x="192" y="203" width="258" height="90" fill="none" stroke="#9A959D" strokeWidth="1.2" opacity={p(.65,.8)*(1-p(1.8,2))}/>}
 </g>
 <g transform={`translate(${20*(1-v)} ${18*(1-v)})`}>
 <svg x="536" y="164" width="238" height="219">
 <defs><clipPath id={original?'next':'current'}><rect width="238" height="219" rx="14"/></clipPath></defs>
 <g clipPath={`url(#${original?'next':'current'})`}><rect width="238" height="219" fill="url(#brand)"/><circle cx="226" cy="18" r="128" fill="white" opacity=".13"/></g>
 </svg>
 {!original && <rect x="532" y="160" width="246" height="227" fill="none" stroke="#9A959D" strokeWidth="1.2" opacity={p(1.45,1.6)*(1-p(2.75,2.95))}/>}
 </g>
 {!original && <g opacity={p(2.95,3.2)}>
 <rect x={bx} y={by} width="126" height="38" rx="19" fill="url(#brand)"/>
 <text x={bx+19} y={by+24} fontSize="12" fontWeight="700" fill="white">Get started →</text>
 <g opacity={1-p(4.4,4.65)} stroke="#B52752" fill="white" strokeWidth="1.25">
 <rect x={bx-4} y={by-4} width="134" height="46" fill="none"/>
 {[[bx-4,by-4],[bx+130,by-4],[bx-4,by+42],[bx+130,by+42]].map(([x,y],i)=><rect key={i} x={x-3} y={y-3} width="6" height="6"/>)}
 </g>
 </g>}
 </g>;
 };
 return <div style={{width:960,height:576,background:'#FAF8F8',fontFamily:'Satoshi,sans-serif'}}>
 <style>{`@font-face{font-family:Satoshi;src:url('${staticFile('fonts/Satoshi-700.woff2')}');font-weight:700}`}</style>
 <svg width="960" height="576" viewBox="0 0 960 576">
 <defs>
 <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".85" fill="#B5ABB3" opacity=".14"/></pattern>
 <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#D4532E"/><stop offset=".5" stopColor="#B52752"/><stop offset="1" stopColor="#42075A"/></linearGradient>
 <filter id="shadow" x="-30%" y="-30%" width="170%" height="190%"><feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#42075A" floodOpacity=".10"/></filter>
 </defs>
 <rect width="960" height="576" fill="url(#dots)"/>
 <g transform={`translate(${-960*slide} 18)`}>{card(false)}</g>
 <g transform={`translate(${960*(1-slide)} 18)`}>{card(true)}</g>
 {cursor('Maya',maya.x,maya.y,false,teamOpacity)}
 {cursor('Alex',alex.x,alex.y,false,teamOpacity)}
 {cursor('Sagi',sagi.x,sagi.y,true,join*teamOpacity)}
 {cursor('Maya',235,275,false,p(8,8.35))}
 {cursor('Alex',757,349,false,p(8,8.35))}
 </svg></div>;
}
registerRoot(()=> <Composition id="JoinYourTeam" component={Film} durationInFrames={264} fps={30} width={960} height={576}/>);
