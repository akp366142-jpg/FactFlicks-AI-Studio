export default async function handler(req,res){
if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
try{
const topic=String(req.query?.topic||"").slice(0,120);
const api="https://commons.wikimedia.org/w/api.php";
async function search(q,limit){
const u=api+"?"+new URLSearchParams({action:"query",generator:"search",gsrsearch:q,gsrnamespace:"6",gsrlimit:String(limit),prop:"imageinfo",iiprop:"url|extmetadata",iiurlwidth:"1000",format:"json",origin:"*"});
const r=await fetch(u,{headers:{"User-Agent":"FactFlicksAIStudio/1.0 (educational video creator)"}});
if(!r.ok)throw new Error("Wikimedia Commons search failed");
const j=await r.json();
return Object.values(j.query?.pages||{}).map(p=>{
const info=p.imageinfo?.[0]||{};const meta=info.extmetadata||{};
return{title:p.title,thumb:info.thumburl||info.url,url:info.url,description:meta.ImageDescription?.value||"",artist:meta.Artist?.value||"Unknown author",license:meta.LicenseShortName?.value||"Check original file page",licenseUrl:meta.LicenseUrl?.value||"",page:"https://commons.wikimedia.org/wiki/"+encodeURIComponent(p.title.replace(/ /g,"_")),mime:info.mime||""};
}).filter(x=>x.url);
}
const images=await search(topic+" photograph",8);
const audio=await search("filetype:audio instrumental music",12);
const tracks=audio.filter(x=>/^audio\/(mpeg|ogg|wav|flac)/i.test(x.mime)).slice(0,4);
return res.status(200).json({images:images.slice(0,8),tracks});
}catch(e){return res.status(500).json({error:e.message||"Media search failed"});}
}