import React,{useState}from"react";
import{createRoot}from"react-dom/client";
import{FFmpeg}from"@ffmpeg/ffmpeg";
import{fetchFile}from"@ffmpeg/util";
import{Film,Sparkles,Download,LoaderCircle,ExternalLink,Image as ImageIcon,Music2}from"lucide-react";
import"./style.css";
function App(){
const[topic,setTopic]=useState("");const[busy,setBusy]=useState(false);const[status,setStatus]=useState("");const[story,setStory]=useState(null);const[voiceUrl,setVoiceUrl]=useState("");const[videoUrl,setVideoUrl]=useState("");const[media,setMedia]=useState(null);
async function renderVideo(data,voiceBlob,assets){
let stream,audioCtx;
try{
setStatus("Asli photos, Hindi voice aur background music ko video mein mix kar raha hoon…");
const canvas=document.createElement("canvas");canvas.width=720;canvas.height=1280;const ctx=canvas.getContext("2d");
const imageList=await Promise.all((assets.images||[]).slice(0,8).map(item=>new Promise(resolve=>{const im=new Image();im.crossOrigin="anonymous";im.onload=()=>resolve({im,item});im.onerror=()=>resolve(null);im.src=item.thumb;})));
const usable=imageList.filter(Boolean);
const narrationBuffer=await voiceBlob.arrayBuffer();
audioCtx=new(window.AudioContext||window.webkitAudioContext)();
const narration=await audioCtx.decodeAudioData(narrationBuffer);
const destination=audioCtx.createMediaStreamDestination();
const voiceSource=audioCtx.createBufferSource();voiceSource.buffer=narration;
const voiceGain=audioCtx.createGain();voiceGain.gain.value=1;voiceSource.connect(voiceGain);voiceGain.connect(destination);
let musicSource=null;
try{
const track=(assets.tracks||[]).find(t=>t.url);
if(track){
const response=await fetch(track.url);if(!response.ok)throw new Error("Music download unavailable");
const musicBuffer=await audioCtx.decodeAudioData(await response.arrayBuffer());
musicSource=audioCtx.createBufferSource();musicSource.buffer=musicBuffer;musicSource.loop=true;
const musicGain=audioCtx.createGain();musicGain.gain.value=0.12;musicSource.connect(musicGain);musicGain.connect(destination);
}
}catch(err){console.warn("Background music could not be loaded",err);}
stream=canvas.captureStream(30);destination.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
const mime=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].find(t=>MediaRecorder.isTypeSupported(t))||"";
const recorder=new MediaRecorder(stream,mime?{mimeType:mime}:{});const chunks=[];
recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
const scenes=data.scenes;const duration=narration.duration;const per=duration/scenes.length;
const sources=(data.sources||[]).slice(0,3);const credits=(usable.slice(0,3).map(x=>x.item.artist+" · "+x.item.license));
const trackInfo=(assets.tracks||[])[0];
const done=new Promise((resolve,reject)=>{recorder.onstop=()=>resolve(new Blob(chunks,{type:recorder.mimeType||"video/webm"}));recorder.onerror=()=>reject(new Error("Video recording failed"));});
function wrap(text,max=27){const words=String(text||"").split(/\s+/);const lines=[""];words.forEach(word=>{let n=lines.length-1;if(ctx.measureText(lines[n]+" "+word).width>max*20)lines.push(word);else lines[n]+=(lines[n]?" ":"")+word;});return lines.slice(0,4);}
function frame(elapsed){
const w=canvas.width,h=canvas.height;const idx=Math.min(scenes.length-1,Math.floor(elapsed/per));const scene=scenes[idx];const photo=usable[idx%Math.max(usable.length,1)];
if(photo){const im=photo.im;const scale=Math.max(w/im.width,h/im.height);const iw=im.width*scale,ih=im.height*scale;const drift=Math.min(1,(elapsed%per)/per)*18;ctx.drawImage(im,(w-iw)/2-drift,(h-ih)/2,iw,ih);}else{const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,"#17213d");g.addColorStop(1,"#40204d");ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
const shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,"rgba(3,7,18,.35)");shade.addColorStop(.45,"rgba(3,7,18,.48)");shade.addColorStop(1,"rgba(3,7,18,.88)");ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
ctx.textAlign="center";ctx.fillStyle="#c4b5fd";ctx.font="bold 24px Arial";ctx.fillText("FACTFLICKS  •  FACTS",w/2,100);
ctx.fillStyle="#fff";ctx.font="bold 47px Arial";wrap(scene.heading,27).forEach((line,i)=>ctx.fillText(line,w/2,430+i*58));
ctx.fillStyle="#fff";ctx.font="bold 29px Arial";const caption=wrap(scene.caption||scene.narration,32);caption.forEach((line,i)=>{ctx.fillStyle="rgba(0,0,0,.56)";ctx.fillRect(34,760+i*48,w-68,42);ctx.fillStyle="#fff";ctx.fillText(line,w/2,790+i*48);});
ctx.fillStyle="#ddd6fe";ctx.font="21px Arial";ctx.fillText("FOLLOW FOR MORE",w/2,h-70);
if(elapsed>duration-5){ctx.fillStyle="rgba(0,0,0,.75)";ctx.fillRect(20,h-250,w-40,150);ctx.fillStyle="#fff";ctx.font="bold 18px Arial";ctx.fillText("PHOTO CREDITS",w/2,h-218);ctx.font="13px Arial";credits.slice(0,2).forEach((x,i)=>ctx.fillText(x.replace(/<[^>]*>/g,"").slice(0,76),w/2,h-190+i*24));if(trackInfo)ctx.fillText("Music: "+trackInfo.title.replace(/<[^>]*>/g,"").slice(0,65),w/2,h-138);}
}
recorder.start();voiceSource.start();if(musicSource)musicSource.start();const start=performance.now();
await new Promise(resolve=>{function tick(){const elapsed=(performance.now()-start)/1000;frame(elapsed);if(elapsed<duration)requestAnimationFrame(tick);else resolve();}tick();});
recorder.stop();const webm=await done;stream.getTracks().forEach(t=>t.stop());voiceSource.stop();if(musicSource)musicSource.stop();await audioCtx.close();
setStatus("MP4 encoder load ho raha hai…");
const ff=new FFmpeg();await ff.load({coreURL:"https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js"});
await ff.writeFile("input.webm",await fetchFile(webm));await ff.exec(["-i","input.webm","-c:v","libx264","-c:a","aac","-pix_fmt","yuv420p","-movflags","+faststart","output.mp4"]);
const out=await ff.readFile("output.mp4");setVideoUrl(URL.createObjectURL(new Blob([out.buffer],{type:"video/mp4"})));await ff.terminate();setStatus("Tumhara narrated MP4 ready hai! Download karo.");
}catch(e){if(stream)stream.getTracks().forEach(t=>t.stop());if(audioCtx&&audioCtx.state!=="closed")await audioCtx.close();throw e;}
}
async function create(){
if(!topic.trim())return setStatus("Pehle topic likho.");
setBusy(true);setStory(null);setVideoUrl("");setVoiceUrl("");
try{
setStatus("1/4 Gemini research karke verified script bana raha hai…");
const gr=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic:topic.trim()})});const gd=await gr.json();if(!gr.ok)throw new Error(gd.error||"Gemini request failed.");
if(!gd.scenes?.length)throw new Error("Script scenes nahi mile.");
setStory(gd);
setStatus("2/4 Sarvam Bulbul Hindi AI voice bana raha hai…");
const narration=gd.scenes.map(s=>s.narration).join(" ");if(narration.length>2400)throw new Error("Narration 2400 characters se zyada hai. Topic ko chhota karke try karo.");
const vr=await fetch("/api/voice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:narration,voice:"shubh"})});const vd=await vr.json();if(!vr.ok)throw new Error(vd.error||"Sarvam voice failed.");
const bytes=Uint8Array.from(atob(vd.audio),c=>c.charCodeAt(0));const voiceBlob=new Blob([bytes],{type:"audio/wav"});const url=URL.createObjectURL(voiceBlob);setVoiceUrl(url);
setStatus("3/4 Topic ke real photos aur royalty/licence details wala music dhoondh raha hoon…");
const mr=await fetch("/api/media?topic="+encodeURIComponent(topic.trim()));const md=await mr.json();if(!mr.ok)throw new Error(md.error||"Media search failed.");setMedia(md);
setStatus("4/4 Final video assemble ho raha hai…");
await renderVideo(gd,voiceBlob,md);
}catch(e){setStatus("Error: "+e.message);}
finally{setBusy(false);}
}
return <div className="app-shell"><header className="topbar"><a className="brand" href="#"><span className="brand-icon"><Film size={20}/></span><span>FACT<span className="accent">FLICKS</span><small>AI STUDIO</small></span></a><span className="phase">AUTO VIDEO CREATOR</span></header><main><section className="hero"><div className="eyebrow"><Sparkles size={14}/> ONE TOPIC. COMPLETE VIDEO.</div><h1>Ideas ko banao<br/><span>scroll-stopping stories.</span></h1><p>Topic likho. Research, Hindi AI voice, real photos, music aur MP4 — sab ek hi button se.</p></section><section className="workspace"><div className="panel form-panel"><div className="panel-heading"><div><span className="step">01 / TOPIC</span><h2>Create your Short</h2></div><Sparkles/></div><label className="field-label">VIDEO TOPIC</label><textarea value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Example: Bermuda Triangle ke rahasya..." rows="4"/><button className="generate" onClick={create} disabled={busy||!topic.trim()}>{busy?<LoaderCircle className="spin"/>:<Sparkles size={18}/>} {busy?"Video ban raha hai…":"Create complete 80-sec video"}</button><p className="note"><ImageIcon size={14}/> Wikimedia Commons se photos aur music search hota hai. License/author details credit mein dikhengi.</p><p className="note"><Music2 size={14}/> Music track available na hua ya browser ne block kiya to narration-only export ho sakta hai.</p>{status&&<p className="status">{status}</p>}</div><div className="panel output-panel"><div className="panel-heading"><div><span className="step">02 / FINAL VIDEO</span><h2>{story?.title||"Your video will appear here"}</h2></div><span className="live-dot">● AUTO</span></div>{story?<><div className="result">{story.scenes.map((s,i)=><p key={i}><b>{s.heading}</b><br/>{s.narration}</p>)}</div>{voiceUrl&&<audio controls src={voiceUrl} style={{width:"100%",marginTop:12}}/>}{videoUrl&&<div className="download-wrap"><video src={videoUrl} controls playsInline/><a className="download" href={videoUrl} download="factflicks-video.mp4"><Download size={17}/> Download MP4</a></div>}{story.sources?.length>0&&<div className="sources"><b>Research sources</b>{story.sources.map((s,i)=><a key={i} href={s.url} target="_blank" rel="noreferrer">{s.title||s.url}<ExternalLink size={12}/></a>)}</div>}{media&&<div className="sources"><b>Media credits & licences</b>{(media.images||[]).slice(0,8).map((m,i)=><a key={"img"+i} href={m.page} target="_blank" rel="noreferrer">{m.title} — {m.artist} · {m.license}<ExternalLink size={12}/></a>)}{(media.tracks||[]).slice(0,4).map((m,i)=><a key={"audio"+i} href={m.page} target="_blank" rel="noreferrer">Music: {m.title} — {m.artist} · {m.license}<ExternalLink size={12}/></a>)}</div>}</>:<div className="empty"><div className="empty-icon"><Film size={25}/></div><h3>Ready for your next Short?</h3><p>Sirf topic likho. Ek button dabate hi full video banega.</p></div>}</div></section><footer><span>FACTFLICKS AI STUDIO</span><span>GEMINI · SARVAM · COMMONS MEDIA</span></footer></main></div>;
}
createRoot(document.getElementById("root")).render(<App/>);