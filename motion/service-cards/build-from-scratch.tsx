import React from 'react';
import {Composition,registerRoot,useCurrentFrame,staticFile} from 'remotion';
const C={blue:'#0D99FF',ink:'#0B0B0F',muted:'#BEB9BE'};
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>1-Math.pow(1-clamp(v),3);
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const tracks=[[1.0,820,444],[1.35,209,148],[1.65,209,148],[1.95,198,222],[2.35,198,222],[2.7,536,164],[3.15,536,164],[3.45,198,342],[4.35,198,342],[4.9,852,450]];
function Preview(){
 const f=useCurrentFrame(), actualTime=f/30;
 const t=actualTime;
 const p=(a:number,b:number)=>ease((t-a)/(b-a));
 const finish=p(4.1,4.8);
 const sparkFinish=p(4.05,4.5), visualFinish=p(4.2,4.7), buttonFinish=p(4.35,4.85);
 const smooth=(v:number)=>{const q=clamp(v);return q*q*(3-2*q);};
 const collapse=smooth((actualTime-6.95)/.85);
 const remaining=1-collapse;
 const selected=Math.max(1-finish,ease((actualTime-6.72)/.2));
 const contentOpacity=1-smooth((collapse-.35)/.6);
 // Cursor positions follow the three elements, in seconds.
 const cf=t;
 let x=140,y=96;
 for(let i=0;i<tracks.length-1;i++){const a=tracks[i],b=tracks[i+1];if(cf>=a[0]){const q=ease((cf-a[0])/(b[0]-a[0]));x=mix(a[1],b[1],q);y=mix(a[2],b[2],q);}}
 const drag=ease((actualTime-.22)/.78);
 const frameWidth=680*drag*remaining, frameHeight=348*drag*remaining;
 if(actualTime<1.0){x=140+frameWidth;y=96+frameHeight;}
 if(actualTime>=6.35){const approach=smooth((actualTime-6.35)/.5);x=mix(852,820,approach);y=mix(450,444,approach);}
 if(actualTime>=6.95){x=140+frameWidth;y=96+frameHeight;}
 const opacity=(a:number,b=a+.3)=>p(a,b);
 const cursorOpacity=Math.max(1-p(5.05,5.3),ease((actualTime-6.35)/.2));
 const pressAt=[1.48,2.05,2.8,3.55];
 const press=pressAt.reduce((v,a)=>Math.max(v,Math.sin(Math.PI*clamp((t-a)/.18))),0);
 const line=(xx:number,yy:number,w:number,h:number,a:number)=> <rect x={xx} y={yy} width={w} height={h} rx={h/2} fill={C.muted} opacity={opacity(a)*(1-finish)}/>;
 return <div style={{width:960,height:576,background:'#FAF8F8',fontFamily:'Satoshi, sans-serif'}}>
 <style>{`@font-face{font-family:Satoshi;src:url('${staticFile('fonts/Satoshi-400.woff2')}')} @font-face{font-family:Satoshi;src:url('${staticFile('fonts/Satoshi-700.woff2')}');font-weight:700}`}</style>
 <svg width="960" height="576" viewBox="0 0 960 576">
 <defs>
 <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".85" fill="#B5ABB3" opacity=".14"/></pattern>
 <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#D4532E"/><stop offset=".5" stopColor="#B52752"/><stop offset="1" stopColor="#42075A"/></linearGradient>
 <filter id="shadow" x="-30%" y="-30%" width="170%" height="190%"><feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#42075A" floodOpacity=".10"/></filter>
 <clipPath id="visualClip"><rect x="536" y="164" width="238" height="219" rx="14"/></clipPath>
 </defs>
 <rect width="960" height="576" fill="url(#dots)"/>
 <g transform="translate(0 18)">

 <rect x="140" y="96" width={frameWidth} height={frameHeight} rx={12*finish*remaining} fill="white" opacity={opacity(.22,.4)} filter="url(#shadow)"/>
 <rect x="140" y="96" width={frameWidth} height={frameHeight} rx={12*remaining} fill="none" stroke="#EAECF0" opacity={finish*(1-selected)}/>
 <rect x="140" y="96" width={frameWidth} height={frameHeight} fill="none" stroke={C.blue} strokeWidth="1.8" opacity={selected}/>
 {[[140,96],[140+frameWidth,96],[140+frameWidth,96+frameHeight],[140,96+frameHeight]].map(([xx,yy],i)=><rect key={i} x={xx-4} y={yy-4} width="8" height="8" fill="white" stroke={C.blue} strokeWidth="1.5" opacity={selected}/>)}
 <g opacity={contentOpacity} transform={`translate(140 96) scale(${remaining}) translate(-140 -96)`}>
 <g opacity={opacity(1.48,1.68)}>
 <path d="M209 137 Q211 146 220 148 Q211 150 209 159 Q207 150 198 148 Q207 146 209 137Z" fill="#BEB9BE" opacity={1-sparkFinish}/>
 <path d="M209 137 Q211 146 220 148 Q211 150 209 159 Q207 150 198 148 Q207 146 209 137Z" fill="url(#brand)" opacity={sparkFinish}/>
 <text x="229" y="154" fontSize="17" fontWeight="700" letterSpacing="-.5" fill={C.ink}>Luma</text>
 </g>
 {line(198,211,247,19,2.05)}{line(198,252,224,19,2.18)}
 <g opacity={finish} fill={C.ink}>
 <text x="198" y="240" fontWeight="700" fontSize="39" letterSpacing="-1.5">Great things</text>
 <text x="198" y="284" fontWeight="700" fontSize="39" letterSpacing="-1.5">start here.</text>
 </g>
 <g opacity={opacity(2.8,3.05)}>
 <rect x="536" y="164" width="238" height="219" rx="16" stroke="#CCC5CE" fill="none" opacity={1-visualFinish}/>
 <path d="M542 170 L768 377 M768 170 L542 377" stroke="#D9D3DA" opacity={1-visualFinish}/>
 <g clipPath="url(#visualClip)" opacity={visualFinish}>
 <rect x="536" y="164" width="238" height="219" fill="url(#brand)"/>
 <circle cx="762" cy="182" r="128" fill="white" opacity=".13"/>
 </g>
 </g>
 <g opacity={opacity(3.55,3.8)}>
 <rect x="198" y="330" width="126" height="38" rx="19" fill="none" stroke="#C4BCC5" opacity={1-buttonFinish}/>
 <rect x="198" y="330" width="126" height="38" rx="19" fill="url(#brand)" opacity={buttonFinish}/>
 <text x="217" y="354" fontSize="12" fontWeight="700" fill="white" opacity={buttonFinish}>Get started →</text>
 </g>
 <g opacity={opacity(3.55,3.7)*(1-buttonFinish)} stroke={C.blue} fill="white">
 <rect x="194" y="326" width="134" height="46" fill="none"/>
 {[[194,326],[328,326],[194,372],[328,372]].map(([xx,yy],i)=><rect key={i} x={xx-3} y={yy-3} width="6" height="6"/>)}
 </g>
 </g>
 <g transform={`translate(${x} ${y}) scale(${1-.1*press})`} opacity={cursorOpacity}>
 <path d="M0 0 V25 L7 19 L12 30 L17 28 L12 17 H23 Z" fill="#17131D" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
 </g>
 </g>

 </svg></div>
}
registerRoot(()=> <Composition id="BuildFromScratch" component={Preview} durationInFrames={246} fps={30} width={960} height={576}/>);
