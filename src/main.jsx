import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Sparkles, Film, Clapperboard, Languages, Clock3, Mic2, WandSparkles, Copy, Check, Play, Lightbulb } from 'lucide-react';
import './style.css';

function App() {
  const [topic, setTopic] = useState('');
  const [kind, setKind] = useState('Mystery');
  const [language, setLanguage] = useState('Hindi');
  const [length, setLength] = useState('Short · 45 sec');
  const [voice, setVoice] = useState('Male');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  function generateDraft() {
    if (!topic.trim()) return;
    const title = topic.trim();
    const isHindi = language === 'Hindi';
    const hook = isHindi
      ? `क्या आप जानते हैं ${title} के पीछे की कहानी? आज हम जानेंगे एक ऐसा तथ्य जो आपको हैरान कर सकता है।`
      : `What is the real story behind ${title}? Here is a surprising detail you may not know.`;
    const body = isHindi
      ? `सबसे पहले, इस विषय को समझते हैं। ${title} से जुड़ी जानकारी को भरोसेमंद स्रोतों से जाँचना ज़रूरी है। फिर इसके सबसे दिलचस्प पहलू को आसान भाषा में समझें।`
      : `First, let's understand the topic. Information about ${title} should be checked against reliable sources. Then we'll explain its most interesting angle in simple language.`;
    const ending = isHindi ? 'आपकी राय क्या है? ऐसे और वीडियो के लिए जुड़े रहें।' : 'What do you think? Follow for more videos like this.';
    setResult(`TITLE: ${title}\nSTYLE: ${kind}  |  LANGUAGE: ${language}  |  LENGTH: ${length}  |  VOICE: ${voice}\n\nSCENE 1 — HOOK (0–5 sec)\nVISUAL: विषय का cinematic close-up, तेज़ opening text.\nVOICEOVER: ${hook}\n\nSCENE 2 — EXPLANATION\nVISUAL: संबंधित फोटो/वीडियो, छोटे captions और smooth transitions.\nVOICEOVER: ${body}\n\nSCENE 3 — OUTRO\nVISUAL: सवाल स्क्रीन पर, हल्का music fade-out.\nVOICEOVER: ${ending}\n\nEDITOR NOTES: 9:16 vertical for Shorts; subtitles on; use copyright-safe music. Verify factual claims before publishing.`);
  }

  async function copyText() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-icon"><Film size={20}/></span><span>FACT<span className="accent">FLICKS</span><small>AI STUDIO</small></span></a><span className="phase">EARLY ACCESS · PHASE 1</span></header>
    <main>
      <section className="hero"><div className="eyebrow"><Sparkles size={14}/> YOUR CREATIVE VIDEO WORKSPACE</div><h1>Ideas ko banao<br/><span>scroll-stopping stories.</span></h1><p>Topic likho. Apne video ka style chuno. FactFlicks tumhare liye pehla script draft taiyaar karega.</p></section>
      <section className="workspace">
        <div className="panel form-panel">
          <div className="panel-heading"><div><span className="step">01 / CREATE</span><h2>Start your video</h2></div><Clapperboard size={23}/></div>
          <label className="field-label">VIDEO TOPIC</label>
          <textarea value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Example: Bermuda Triangle ke rahasya..." rows="3"/>
          <div className="grid-two">
            <div><label className="field-label">VIDEO STYLE</label><select value={kind} onChange={e=>setKind(e.target.value)}>{['Mystery','Facts','Documentary','Cinematic','Animation'].map(x=><option>{x}</option>)}</select></div>
            <div><label className="field-label"><Languages size={13}/> LANGUAGE</label><select value={language} onChange={e=>setLanguage(e.target.value)}><option>Hindi</option><option>English</option></select></div>
            <div><label className="field-label"><Clock3 size={13}/> LENGTH</label><select value={length} onChange={e=>setLength(e.target.value)}><option>Short · 45 sec</option><option>Short · 60 sec</option><option>Long · 3 min</option><option>Long · 5 min</option><option>Long · 10 min</option></select></div>
            <div><label className="field-label"><Mic2 size={13}/> VOICE</label><select value={voice} onChange={e=>setVoice(e.target.value)}><option>Male</option><option>Female</option></select></div>
          </div>
          <button className="generate" onClick={generateDraft}><WandSparkles size={18}/> Generate script draft <span>↗</span></button>
          <p className="note"><Lightbulb size={14}/> Phase 1: script drafting. AI voice, visuals aur MP4 rendering next stages mein add honge.</p>
        </div>
        <div className="panel output-panel">
          <div className="panel-heading"><div><span className="step">02 / YOUR STORY</span><h2>Script preview</h2></div><span className="live-dot">● READY</span></div>
          {result ? <><pre className="result">{result}</pre><button className="copy" onClick={copyText}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? 'Copied' : 'Copy script'}</button></> : <div className="empty"><div className="empty-icon"><Play size={25}/></div><h3>Your next video starts here.</h3><p>Left side par topic likho aur <b>Generate script draft</b> dabao. Tumhara storyboard yahan dikhega.</p><div className="mini-tags"><span>HOOK</span><span>SCENES</span><span>VOICEOVER</span></div></div>}
        </div>
      </section>
      <footer><span>FACTFLICKS AI STUDIO</span><span>Built for curious minds · 2026</span></footer>
    </main>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);