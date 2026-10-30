export default async function handler(req,res){
if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
if(!process.env.SARVAM_API_KEY) return res.status(503).json({error:"Add SARVAM_API_KEY in Vercel Environment Variables."});
try{
const body=req.body||{};
if(typeof body.text!=="string"||!body.text.trim()||body.text.length>2400) return res.status(400).json({error:"Narration must be 1-2400 characters."});
const allowed=["shubh","ashutosh","aditya","rahul","priya","neha","pooja","simran","ishita","shreya","suhani"];
const speaker=allowed.includes(body.voice)?body.voice:"shubh";
const r=await fetch("https://api.sarvam.ai/text-to-speech",{method:"POST",headers:{"Content-Type":"application/json","api-subscription-key":process.env.SARVAM_API_KEY},body:JSON.stringify({text:body.text,language_code:"hi-IN",model:"bulbul:v3",speaker,pace:1.03,speech_sample_rate:24000,output_audio_codec:"wav"})});
const data=await r.json();
if(!r.ok) return res.status(r.status).json({error:data.error?.message||data.message||"Sarvam request failed."});
if(!data.audios||!data.audios[0]) throw new Error("Sarvam returned no audio.");
return res.status(200).json({audio:data.audios[0],mimeType:"audio/wav",speaker});
}catch(e){return res.status(500).json({error:e.message||"Voice generation failed."});}
}