import React,{useState} from "react";
import{createRoot}from"react-dom/client";
import{FFmpeg}from"@ffmpeg/ffmpeg";
import{fetchFile}from"@ffmpeg/util";
import{Film,Sparkles,Download,LoaderCircle,ExternalLink,Volume2}from"lucide-react";
import"./style.css";

function App(){
 const[topic,setTopic]=useState("");const[busy,setBusy]=useState(false);const[status,setStatus]=useState("");const[story,setStory]=useState(null);const[audioUrl,setAudioUrl]=useState("");const[videoUrl,setVideoUrl]=useState("");
 async function create(){
  if(!topic.trim())return setStatus("Pehle video ka topic likho.");
  setBusy(true);setStory(null);setAudioUrl("");setVideoUrl("");
  try{
   setStatus("Gemini research karke fact-checked script bana raha hai…");
   const gr=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic:topic.trim()})});
   const gd=await gr.json();if(!gr.ok)throw new Error(gd.error||"Gemini script generation failed.");
   setStory(gd);
   const narration=gd.scenes.map(s=>s.narration).join(" ");
   if(narration.length>2400)throw new Error("Script Sarvam voice limit se lambi hai. Dobara generate karo.");
   setStatus("Sarvam AI Hindi narration bana raha hai…");
   const vr=await fetch("/api/voice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:narration,voice:"shubh"})});
   const vd=await vr.json();if(!vr.ok)throw new Error(vd.error||"Sarvam voice generation failed.");
   const bytes=Uint8Array.from(atob(vd.audio),c=>c.charCodeAt(0));
   const blob=new Blob([bytes],{type:"audio/wav"});setAudioUrl(URL.createObjectURL(blob));
   setStatus("Script aur Hindi AI voice ready! Neeche preview suno.");
  }catch(e){setStatus("Error: "+e.message);}
  finally{setBusy(false);}
 }
 async function exportVideo(){
  if(!story||!audioUrl)return;
  setBusy(true);setStatus("Video render ho raha hai…");
  let stream,audioCtx,source;
  try{
   const narration=await fetch(audioUrl).then(r=>r.arrayBuffer());
   audioCtx=new(window.AudioContext||window.webkitAudioContext)();
   const decoded=await audioCtx.decodeAudioData(narration);
   const src=audioCtx.createBufferSource();src.buffer=decoded;
   const dest=audioCtx.createMediaStreamDestination();const gain=audioCtx.createGain();gain.gain.value=1;src.connect(gain);gain.connect(dest);
   const canvas=document.createElement("canvas");canvas.width=720;canvas.height=1280;const ctx=canvas.getContext("2d");
   stream=canvas.captureStream(30);dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
   const mime=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].find(t=>MediaRecorder.isTypeSupported(t))||"";
   const rec=new MediaRecorder(stream,mime?{mimeType:mime}:{});const chunks=[];
   rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   const duration=decoded.duration;const scenes=story.scenes;const per=duration/scenes.length;
   const done=new Promise((resolve,reject)=>{rec.onstop=()=>resolve(new Blob(chunks,{type:rec.mimeType||"video/webm"}));rec.onerror=()=>reject(new Error("Recording failed"));});
   const draw=()=>{const w=canvas.width,h=canvas.height;const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,"#101a35");g.addColorStop(1,"#392052");ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle="#c4b5fd";ctx.textAlign="center";ctx.font="bold 25px Arial";ctx.fillText("FACTFLICKS  •  FACTS",w/2,120);ctx.fillStyle="#fff";ctx.font="bold 54px Arial";ctx.fillText(story.title.slice(0,26),w/2,310);ctx.fillStyle="#ddd6fe";ctx.font="bold 36px Arial";ctx.fillText("80 SECOND STORY",w/2,390);ctx.fillStyle="#fff";ctx.font="32px Arial";ctx.fillText("Hindi AI narration + captions",w/2,760);ctx.fillStyle="#a78bfa";ctx.font="24px Arial";ctx.fillText("FOLLOW FOR MORE",w/2,h-100);};
   rec.start();src.start();const start=performance.now();
   await new Promise(resolve=>{function frame(){const elapsed=(performance.now()-start)/1000;const idx=Math.min(scenes.length-1,Math.floor(elapsed/per));const s=scenes[idx];draw();ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font="bold 42px Arial";ctx.fillText((s.heading||"").slice(0,32),360,560);ctx.font="30px Arial";const words=(s.caption||s.narration||"").split(" ");let lines=[""];words.forEach(word=>{let n=lines.length-1;if(ctx.measureText(lines[n]+" "+word).width>620)lines.push(word);else lines[n]+=(lines[n]?" ":"")+word;});lines.slice(0,3).forEach((line,i)=>ctx.fillText(line,360,650+i*42));if(elapsed<duration){requestAnimationFrame(frame);}else resolve();}frame();});
   rec.stop();await done;stream.getTracks().forEach(t=>t.stop());src.stop();await audioCtx.close();
   setStatus("MP4 encoder load ho raha hai…");const ff=new FFmpeg();await ff.load({coreURL:"https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js"});
   const webm=chunks.length?new Blob(chunks,{type:"video/webm"}):null;if(!webm)throw new Error("Video recording empty.");
   await ff.writeFile("input.webm",await fetchFile(webm));await ff.exec(["-i","input.webm","-c:v","libx264","-c:a","aac","-pix_fmt","yuv420p","-movflags","+faststart","output.mp4"]);
   const data=await ff.readFile("output.mp4");setVideoUrl(URL.createObjectURL(new Blob([data.buffer],{type:"video/mp4"})));await ff.terminate();setStatus("MP4 ready! Download karo.");
  }catch(e){if(stream)stream.getTracks().forEach(t=>t.stop());if(audioCtx&&audioCtx.state!=="closed")await audioCtx.close();setStatus("Video export error: "+e.message);}
  finally{setBusy(false);}
 }
 return <div className="app-shell"><header className="topbar"><a className="brand" href="#"><span className="brand-icon"><Film size={20}/></span><span>FACT<span className="accent">FLICKS</span><small>AI STUDIO</small></span></a><span className="phase">AI CREATOR</span></header><main><section className="hero"><div className="eyebrow"><Sparkles size={14}/> ONE TOPIC. COMPLETE STORY.</div><h1>Ideas ko banao<br/><span>scroll-stopping stories.</span></h1><p>Sirf topic likho. Gemini research aur script karega, Sarvam Hindi AI voice banayega.</p></section><section className="workspace"><div className="panel form-panel"><div className="panel-heading"><div><span className="step">01 / TOPIC</span><h2>What is your video about?</h2></div><Sparkles/></div><label className="field-label">VIDEO TOPIC</label><textarea value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Example: Bermuda Triangle ke rahasya..." rows="4"/><button className="generate" onClick={create} disabled={busy||!topic.trim()}>{busy?<LoaderCircle className="spin"/>:<Sparkles size={18}/>} {busy?"Creating your video…":"Create my 80-sec video"}</button><p className="note">Gemini facts research karega. Sarvam Bulbul Hindi narration banayega. API keys secure server par rakho.</p>{status&&<p className="status">{status}</p>}</div><div className="panel output-panel"><div className="panel-heading"><div><span className="step">02 / YOUR VIDEO</span><h2>{story?.title||"Your story appears here"}</h2></div><span className="live-dot">● AI</span></div>{story?<><div className="result">{story.scenes.map((s,i)=><p key={i}><b>{s.heading}</b><br/>{s.narration}</p>)}</div><div className="action-row">{audioUrl&&<audio controls src={audioUrl} style={{width:"100%",marginTop:12}}/>}</div><button className="generate export" onClick={exportVideo} disabled={busy||!audioUrl}><Film size={18}/> Render MP4</button>{videoUrl&&<div className="download-wrap"><video src={videoUrl} controls playsInline/><a className="download" href={videoUrl} download="factflicks-video.mp4"><Download size={17}/> Download MP4</a></div>}{story.sources?.length>0&&<div className="sources"><b>Research sources</b>{story.sources.map((s,i)=><a key={i} href={s.url} target="_blank" rel="noreferrer">{s.title||s.url} <ExternalLink size={12}/></a>)}</div>}</>:<div className="empty"><div className="empty-icon"><Volume2 size={25}/></div><h3>Ready for your next Short?</h3><p>Topic enter karo. Script, research aur AI voice automatically generate honge.</p></div>}</div></section><footer><span>FACTFLICKS AI STUDIO</span><span>GEMINI + SARVAM BULBUL</span></footer></main></div>;
}
createRoot(document.getElementById("root")).render(<App/>);