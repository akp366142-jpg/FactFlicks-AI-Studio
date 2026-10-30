export default async function handler(req,res){
if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
if(!process.env.GEMINI_API_KEY) return res.status(503).json({error:"Add GEMINI_API_KEY in Vercel Environment Variables."});
try{
const topic=req.body&&req.body.topic;
if(typeof topic!=="string"||topic.trim().length<2||topic.length>180) return res.status(400).json({error:"Enter a topic between 2 and 180 characters."});
const prompt="Research this topic using Google Search grounding. Write an accurate Hindi YouTube Short script of about 80 seconds in Devanagari. Use only verifiable facts; never invent dates, names, numbers, quotes, or claims. Make 5-7 short scenes with an honest hook and concise ending. Return ONLY valid JSON with this shape: {\\"title\\":\\"...\\",\\"scenes\\":[{\\"heading\\":\\"...\\",\\"narration\\":\\"one or two Hindi sentences\\",\\"caption\\":\\"short subtitle phrase\\"}],\\"sources\\":[{\\"title\\":\\"...\\",\\"url\\":\\"https://...\\"}]}. Include 3-6 trustworthy source URLs. Topic: "+topic.trim();
const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="+encodeURIComponent(process.env.GEMINI_API_KEY),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],tools:[{google_search:{}}],generationConfig:{temperature:0.35}})});
const data=await r.json();
if(!r.ok) return res.status(r.status).json({error:data.error?.message||"Gemini request failed."});
const raw=(data.candidates?.[0]?.content?.parts||[]).map(p=>p.text||"").join("").trim();
if(!raw) throw new Error("AI ne khaali response diya. Dobara try karo.");
const cleaned=raw.replace(/^\uFEFF/,"").replace(/^\s*```(?:json)?\s*/i,"").replace(/\s*```\s*$/,"").trim();
const start=cleaned.indexOf("{"),end=cleaned.lastIndexOf("}");
if(start<0||end<=start) throw new Error("AI response valid JSON nahi tha. Dobara try karo.");
const result=JSON.parse(cleaned.slice(start,end+1));
if(!Array.isArray(result.scenes)||result.scenes.length<4) throw new Error("AI returned too few scenes. Dobara try karo.");
const scenes=result.scenes.slice(0,7).map(s=>({
heading:String(s.heading||"").slice(0,100),
narration:String(s.narration||"").slice(0,700),
caption:String(s.caption||s.heading||"").slice(0,140)
})).filter(s=>s.heading&&s.narration);
if(scenes.length<4) throw new Error("Script scenes incomplete hain. Dobara try karo.");
const chunks=data.candidates?.[0]?.groundingMetadata?.groundingChunks||[];
const grounded=chunks.map(x=>x.web).filter(x=>x&&x.uri&&/^https?:\/\//i.test(x.uri)).map(x=>({title:x.title||"Google Search",url:x.uri}));
const supplied=Array.isArray(result.sources)?result.sources:[];
const sources=[...supplied,...grounded].filter((s,i,a)=>s&&typeof s.url==="string"&&/^https?:\/\//i.test(s.url)&&a.findIndex(t=>t.url===s.url)===i).slice(0,8);
return res.status(200).json({title:String(result.title||topic).slice(0,120),scenes,sources});
}catch(e){return res.status(500).json({error:e.message||"Script generation failed."});}
}