export default async function handler(req,res){
if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
try{
const topic=String(req.query?.topic||"").trim().slice(0,120);
if(!topic)return res.status(400).json({error:"Topic is required."});
const api="https://commons.wikimedia.org/w/api.php";
async function search(q,limit){
const u=api+"?"+new URLSearchParams({action:"query",generator:"search",gsrsearch:q,gsrnamespace:"6",gsrlimit:String(limit),prop:"imageinfo",iiprop:"url|extmetadata",iiurlwidth:"1000",format:"json"});
const r=await fetch(u,{headers:{"User-Agent":"FactFlicksAIStudio/1.0 (educational video creator; contact: project repository)"}});
if(!r.ok)throw new Error("Wikimedia Commons search failed");
const j=await r.json();
return Object.values(j.query?.pages||{}).map(p=>{
const info=p.imageinfo?.[0]||{};const meta=info.extmetadata||{};
const clean=v=>String(v?.value||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
return{title:p.title,thumb:info.thumburl||info.url,url:info.url,description:clean(meta.ImageDescription),artist:clean(meta.Artist)||"Unknown author",license:clean(meta.LicenseShortName)||"Check original file page",licenseUrl:meta.LicenseUrl?.value||"",page:"https://commons.wikimedia.org/wiki/"+encodeURIComponent(p.title.replace(/ /g,"_")),mime:info.mime||""};
}).filter(x=>x.url);
}
const images=await search(topic+" photograph",10);
let audio=[];
for(const q of ["filetype:audio instrumental music","filetype:audio background instrumental","filetype:audio music"]){
audio=audio.concat(await search(q,12));
if(audio.some(x=>/^audio\/(mpeg|ogg|wav|flac|opus)/i.test(x.mime)))break;
}
const seen=new Set();
const tracks=audio.filter(x=>/^audio\/(mpeg|ogg|wav|flac|opus)/i.test(x.mime)&&!seen.has(x.url)&&seen.add(x.url)).slice(0,4);
return res.status(200).json({images:images.slice(0,8),tracks});
}catch(e){return res.status(500).json({error:e.message||"Media search failed"});}
}