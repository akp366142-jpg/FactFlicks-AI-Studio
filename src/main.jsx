import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Sparkles, Film, Clapperboard, Languages, Clock3, Mic2, WandSparkles, Copy, Check, Play, Lightbulb, Download, Volume2, LoaderCircle } from 'lucide-react';
import './style.css';

function App() {
 const [topic,setTopic]=useState(''); const [kind,setKind]=useState('Mystery'); const [language,setLanguage]=useState('Hindi');
 const [length,setLength]=useState('Short · 70 sec'); const [voice,setVoice]=useState('Male'); const [result,setResult]=useState('');
 const [copied,setCopied]=useState(false); const [busy,setBusy]=useState(false); const [status,setStatus]=useState(''); const [videoUrl,setVideoUrl]=useState(''); const [music,setMusic]=useState(true); const [visuals,setVisuals]=useState([]);
 function generateDraft(){
  if(!topic.trim()) return;
  const title=topic.trim();
  const hook=language==='Hindi'?'क्या आप जानते हैं '+title+' के पीछे की कहानी? आज हम जानेंगे एक ऐसा तथ्य जो आपको हैरान कर सकता है.':'What is the real story behind '+title+'? Here is a surprising detail you may not know.';
  const body=language==='Hindi'?'सबसे पहले, इस विषय को समझते हैं। '+title+' से जुड़ी जानकारी को भरोसेमंद स्रोतों से जाँचना ज़रूरी है। फिर इसके सबसे दिलचस्प पहलू को आसान भाषा में समझें.':"First, let's understand the topic. Information about "+title+" should be checked against reliable sources. Then we'll explain its most interesting angle in simple language.";
  const ending=language==='Hindi'?'आपकी राय क्या है? ऐसे और वीडियो के लिए जुड़े रहें।':'What do you think? Follow for more videos like this.';
  setResult([hook,body,ending].join('\n\n'));setVideoUrl('');
 }
 async function copyText(){await navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),1800);}
 function speakScript(){
  if(!('speechSynthesis' in window)){setStatus('This browser does not support voice preview.');return;}
  window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(result);u.lang=language==='Hindi'?'hi-IN':'en-US';u.rate=.95;
  const vs=window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith(language==='Hindi'?'hi':'en'));
  if(vs.length)u.voice=vs.find(v=>voice==='Female'?/female|woman/i.test(v.name):/male|man/i.test(v.name))||vs[0];
  u.onstart=()=>setStatus('Voice preview playing…');u.onend=()=>setStatus('Voice preview complete.');u.onerror=()=>setStatus('Voice preview unavailable on this device.');window.speechSynthesis.speak(u);
 }
 async function findVisuals(){\n  const q=encodeURIComponent(topic+' '+kind+' photograph');\n  try{const r=await fetch('https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch='+q+'&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url&iiurlwidth=1000&format=json&origin=*');const j=await r.json();const pages=Object.values(j.query?.pages||{});const urls=pages.map(p=>p.imageinfo?.[0]?.thumburl||p.imageinfo?.[0]?.url).filter(Boolean);const imgs=await Promise.all(urls.map(src=>new Promise(resolve=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src;})));setVisuals(imgs.filter(Boolean));return imgs.filter(Boolean);}catch(e){setStatus('Images fetch nahi ho paaye; fallback visuals use honge.');return []; }\n }\n function drawScene(ctx,c,heading,caption,index,elapsed,imgs=[]){
  const w=c.width,h=c.height;const im=imgs[index%Math.max(imgs.length,1)];if(im){const scale=Math.max(w/im.width,h/im.height),iw=im.width*scale,ih=im.height*scale;ctx.drawImage(im,(w-iw)/2,(h-ih)/2,iw,ih);}else{const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,['#111b3b','#251344','#102c36'][index%3]);g.addColorStop(1,['#46206c','#111827','#3b1c42'][index%3]);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
  ctx.fillStyle='rgba(3,7,18,.62)';ctx.fillRect(0,0,w,h);ctx.globalAlpha=.16;ctx.fillStyle='#c4b5fd';for(let i=0;i<9;i++){ctx.beginPath();ctx.arc((i*113+elapsed*16)%w,(i*197+80)%h,30+(i%3)*25,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  ctx.textAlign='center';ctx.fillStyle='#c4b5fd';ctx.font='bold 24px Arial';ctx.fillText('FACTFLICKS  •  '+kind.toUpperCase(),w/2,120);
  ctx.fillStyle='#fff';ctx.font='bold 58px Arial';const words=heading.split(' ');let lines=[''];words.forEach(word=>{let n=lines.length-1;if(ctx.measureText(lines[n]+' '+word).width>w-100)lines.push(word);else lines[n]+=(lines[n]?' ':'')+word;});const start=h*.39-(lines.length-1)*38;lines.forEach((line,i)=>ctx.fillText(line,w/2,start+i*78));
  ctx.fillStyle='#ddd6fe';ctx.font='30px Arial';const cw=caption.split(' ');let cl=[''];cw.forEach(word=>{let n=cl.length-1;if(ctx.measureText(cl[n]+' '+word).width>w-100)cl.push(word);else cl[n]+=(cl[n]?' ':'')+word;});cl.forEach((line,i)=>ctx.fillText(line,w/2,h*.69+i*44));
  ctx.fillStyle='#ffffffaa';ctx.font='22px Arial';ctx.fillText('FOLLOW FOR MORE',w/2,h-90);
 }
 async function exportVideo(){
  if(!result.trim()){setStatus('Generate the script first.');return;}if(!window.MediaRecorder){setStatus('Use a recent Chrome or Edge browser for video export.');return;}
  setBusy(true);setVideoUrl('');setStatus('Topic ke liye images dhoondh raha hoon…');let stream;let audioCtx;let musicOsc=[];
  try{
   const imgs=await findVisuals();const canvas=document.createElement('canvas');canvas.width=720;canvas.height=1280;const ctx=canvas.getContext('2d');stream=canvas.captureStream(30);\n   if(music){audioCtx=new (window.AudioContext||window.webkitAudioContext)();const dest=audioCtx.createMediaStreamDestination();const master=audioCtx.createGain();master.gain.value=.035;master.connect(dest);[110,164.81,220].forEach((hz,i)=>{const o=audioCtx.createOscillator();const g=audioCtx.createGain();o.type='sine';o.frequency.value=hz;g.gain.value=[.5,.25,.15][i];o.connect(g);g.connect(master);o.start();musicOsc.push(o);});dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));}
   const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t))||'';
   const rec=new MediaRecorder(stream,mime?{mimeType:mime}:{});const chunks=[];rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   const scenes=result.split(/\n\n+/).filter(Boolean).slice(0,3);const titles=[topic||'FactFlicks','THE STORY','DID YOU KNOW?'];const secs=length.includes('60')?60:length.includes('80')?80:70;const each=secs/scenes.length;
   const done=new Promise((resolve,reject)=>{rec.onstop=()=>resolve(new Blob(chunks,{type:rec.mimeType||'video/webm'}));rec.onerror=()=>reject(new Error('Recording failed'));});
   rec.start();for(let i=0;i<scenes.length;i++){const start=performance.now();while(performance.now()-start<each*1000){drawScene(ctx,canvas,titles[i],scenes[i],i,(performance.now()-start)/1000,imgs);await new Promise(r=>setTimeout(r,33));}}
   rec.stop();const webm=await done;stream.getTracks().forEach(t=>t.stop());musicOsc.forEach(o=>{try{o.stop()}catch{}});if(audioCtx)await audioCtx.close();setStatus('Loading MP4 encoder…');
   const ff=new FFmpeg();await ff.load({coreURL:'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js'});
   await ff.writeFile('input.webm',await fetchFile(webm));await ff.exec(['-i','input.webm','-vf','scale=720:1280','-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p','-movflags','+faststart','output.mp4']);
   const data=await ff.readFile('output.mp4');setVideoUrl(URL.createObjectURL(new Blob([data.buffer],{type:'video/mp4'})));setStatus('MP4 ready! Download it below.');await ff.terminate();
  }catch(e){if(stream)stream.getTracks().forEach(t=>t.stop());if(narrationAudio){narrationAudio.pause();URL.revokeObjectURL(narrationAudio.src);}setStatus('Export failed: '+(e.message||'Browser memory or compatibility issue. Try Chrome.'));}
  finally{setBusy(false);}
 }
 return <div className="app-shell"><header className="topbar"><a className="brand" href="#"><span className="brand-icon"><Film size={20}/></span><span>FACT<span className="accent">FLICKS</span><small>AI STUDIO</small></span></a><span className="phase">CREATOR BETA · PHASE 2</span></header><main>
  <section className="hero"><div className="eyebrow"><Sparkles size={14}/> YOUR CREATIVE VIDEO WORKSPACE</div><h1>Ideas ko banao<br/><span>scroll-stopping stories.</span></h1><p>Topic likho, script banao aur 60–80 second ka vertical video export karo.</p></section>
  <section className="workspace"><div className="panel form-panel"><div className="panel-heading"><div><span className="step">01 / CREATE</span><h2>Start your video</h2></div><Clapperboard size={23}/></div>
   <label className="field-label">VIDEO TOPIC</label><textarea value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Example: Bermuda Triangle ke rahasya..." rows="3"/>
   <div className="grid-two"><div><label className="field-label">VIDEO STYLE</label><select value={kind} onChange={e=>setKind(e.target.value)}>{['Mystery','Facts','Documentary','Cinematic','Animation'].map(x=><option key={x}>{x}</option>)}</select></div>
   <div><label className="field-label"><Languages size={13}/> LANGUAGE</label><select value={language} onChange={e=>setLanguage(e.target.value)}><option>Hindi</option><option>English</option></select></div>
   <div><label className="field-label"><Clock3 size={13}/> LENGTH</label><select value={length} onChange={e=>setLength(e.target.value)}><option>Short · 60 sec</option><option>Short · 70 sec</option><option>Short · 80 sec</option></select></div>
   <div><label className="field-label"><Mic2 size={13}/> AI VOICE PREFERENCE</label><select value={voice} onChange={e=>setVoice(e.target.value)}><option>Male</option><option>Female</option></select></div></div>
   <label className="music-toggle"><input type="checkbox" checked={music} onChange={e=>setMusic(e.target.checked)}/> Background music on video</label><button className="generate" onClick={generateDraft}><WandSparkles size={18}/> Generate script draft <span>↗</span></button><p className="note"><Lightbulb size={14}/> Script template-based hai. Facts ko publish karne se pehle verify karo.</p>
  </div><div className="panel output-panel"><div className="panel-heading"><div><span className="step">02 / YOUR STORY</span><h2>Script & video</h2></div><span className="live-dot">● READY</span></div>
   {result?<><pre className="result">{result}</pre><div className="action-row"><button className="copy" onClick={copyText}>{copied?<Check size={16}/>:<Copy size={16}/>} {copied?'Copied':'Copy script'}</button><button className="copy" onClick={speakScript}><Volume2 size={16}/> Voice preview</button></div>
   <button className="generate export" onClick={exportVideo} disabled={busy}>{busy?<LoaderCircle className="spin" size={18}/>:<Film size={18}/>} {busy?'Creating video…':'Create & export MP4'}</button>
   {status&&<p className="status">{status}</p>}{videoUrl&&<div className="download-wrap"><video src={videoUrl} controls playsInline/><a className="download" href={videoUrl} download="factflicks-video.mp4"><Download size={17}/> Download MP4</a></div>}</>
   :<div className="empty"><div className="empty-icon"><Play size={25}/></div><h3>Your next video starts here.</h3><p>Topic likho aur <b>Generate script draft</b> dabao. Script yahan dikhegi.</p><div className="mini-tags"><span>HOOK</span><span>SCENES</span><span>VOICEOVER</span></div></div>}
  </div></section><footer><span>FACTFLICKS AI STUDIO</span><span>60–80 SECOND SHORTS CREATOR · 2026</span></footer></main></div>;
}
createRoot(document.getElementById('root')).render(<App />);
