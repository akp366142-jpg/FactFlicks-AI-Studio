export default async function handler(req,res){
if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
if(!process.env.GEMINI_API_KEY) return res.status(503).json({error:"Add GEMINI_API_KEY in Vercel Environment Variables."});
try{
const topic=req.body&&req.body.topic;
if(typeof topic!=="string"||topic.trim().length<2||topic.length>180) return res.status(400).json({error:"Enter a topic between 2 and 180 characters."});
const prompt="Research this topic using Google Search grounding. Write an accurate Hindi YouTube Short script of about 80 seconds in Devanagari. Use only verifiable facts; never invent dates, names, numbers, quotes, or claims. Make 5-7 short scenes with an honest hook and concise ending. Return ONLY JSON: {\"title\":\"...\",\"scenes\":[{\"heading\":\"...\",\"narration\":\"one or two Hindi sentences\",\"caption\":\"short subtitle phrase\"}],\"sources\":[{\"title\":\"...\",\"url\":\"https://...\"}]}. Include 3-6 trustworthy source URLs. Topic: "+topic.trim();
const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="+encodeURIComponent(process.env.GEMINI_API_KEY),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],tools:[{google_search:{}}],generationConfig:{temperature:0.35}})});
const data=await r.json();
if(!r.ok) return res.status(r.status).json({error:data.error?.message||"Gemini request failed."});
const raw=(data.candidates?.[0]?.content?.parts||[]).map(p=>p.text||"").join("").trim();
const result=JSON.parse(raw);
if(!Array.isArray(result.scenes)||!result.scenes.length) throw new Error("AI returned no scenes.");
const chunks=data.candidates?.[0]?.groundingMetadata?.groundingChunks||[];
const grounded=chunks.map(x=>x.web).filter(x=>x&&x.uri).map(x=>({title:x.title||"Google Search",url:x.uri}));
const sources=[...(result.sources||[]),...grounded].filter((s,i,a)=>s.url&&a.findIndex(t=>t.url===s.url)===i).slice(0,8);
return res.status(200).json({title:result.title||topic,scenes:result.scenes,sources});
}catch(e){return res.status(500).json({error:e.message||"Script generation failed."});}
}