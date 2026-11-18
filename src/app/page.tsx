import Link from "next/link";
import { ArrowDownRight, ArrowRight, AudioLines, Aperture, Bookmark, Search, WandSparkles, Waypoints, FlaskConical } from "lucide-react";
import { Brand } from "@/components/Brand";
import { Orb } from "@/components/Orb";

const capabilities = [
  { index: "01", name: "Voice", icon: AudioLines, description: "Begin with a thought. Speak naturally, read the transcript, and hear the answer.", prompt: "Help me think through a new idea.", mode: "voice" },
  { index: "02", name: "Vision", icon: Aperture, description: "Bring an image into the conversation and ask what matters in it.", prompt: "What should I notice in this image?", mode: "vision" },
  { index: "03", name: "Workspace", icon: Bookmark, description: "Keep the useful parts of a session close and export them when you're done.", prompt: "Organize my best ideas.", mode: "workspace" },
  { index: "04", name: "Research", icon: Search, description: "Explore a question with live sources you can open and inspect.", prompt: "Compare what recent sources say.", mode: "research" },
  { index: "05", name: "Studio", icon: WandSparkles, description: "Shape a rough thought into writing you can revise and take away.", prompt: "Turn these notes into a short brief.", mode: "studio" },
  { index: "06", name: "Coach", icon: Waypoints, description: "Break a goal into steps and get clear, useful feedback.", prompt: "Help me practice a presentation.", mode: "coach" },
  { index: "07", name: "Lab", icon: FlaskConical, description: "Try a curated experiment and see how an approach changes the result.", prompt: "Compare two ways to explain this.", mode: "lab" },
];

export default function Home() {
  return <main className="landing" id="top">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-header">
      <Brand />
      <div className="site-header__right"><span className="header-kicker">A public AI experiment<br />Voice · Vision · Ideas</span><nav aria-label="Main navigation"><a href="#capabilities">Capabilities</a><Link href="/app" prefetch={false} className="header-cta">Open assistant <ArrowUpRightIcon /></Link></nav></div>
    </header>

    <section className="hero" id="main-content" aria-labelledby="hero-title">
      <div className="hero__eyebrow"><span className="eyebrow-line" /> A NEW SPACE TO THINK</div>
      <div className="hero__grid">
        <div className="hero__title-block"><p className="hero__italic">Let curiosity</p><h1 id="hero-title">TAKE<br /><span>SHAPE.</span></h1></div>
        <div className="hero__visual"><Orb hero /><div className="hero__visual-label">FIG 01. / SIGNAL VESSEL</div></div>
        <div className="hero__aside"><span className="hero__index">[ 001 — 007 ]</span><p>Speak. Show. Explore.<br />A more fluid way to move from a question to something useful.</p><Link className="button button--light" href="/app" prefetch={false}>Enter the assistant <ArrowRight size={18} /></Link><span className="hero__note">No account required · Public demo</span></div>
      </div>
      <div className="hero__bottom"><span>AN INTERFACE FOR IDEAS IN MOTION</span><a href="#capabilities" aria-label="Scroll to capabilities">SCROLL TO EXPLORE <ArrowDownRight size={17} /></a></div>
    </section>

    <section className="intro-section" aria-labelledby="intro-title"><div className="section-meta"><span>THE PREMISE</span><span>01 / 04</span></div><div className="intro-section__grid"><h2 id="intro-title">A conversation can become <em>a way forward.</em></h2><p>One place to ask aloud, look closer, investigate a question, and turn a rough thought into a useful result. The interface stays quiet so your ideas can lead.</p></div></section>

    <section className="capabilities-section" id="capabilities" aria-labelledby="capabilities-title"><div className="section-meta"><span>WHAT IT CAN DO</span><span>02 / 04</span></div><div className="capabilities-heading"><h2 id="capabilities-title">Seven ways<br /><em>to begin.</em></h2><p>Choose a direction. Change it whenever your thinking changes.</p></div><div className="capabilities-list">{capabilities.map(({index,name,icon:Icon,description,prompt,mode}) => <Link key={name} prefetch={false} className="capability-row" href={`/app?mode=${mode}`}><span className="capability-row__index">{index} /</span><span className="capability-row__icon"><Icon size={22} strokeWidth={1.4} /></span><span className="capability-row__name">{name}</span><span className="capability-row__description">{description}<small>Try: “{prompt}”</small></span><ArrowDownRight size={25} strokeWidth={1.3} className="capability-row__arrow" /></Link>)}</div></section>

    <section className="experience-section" aria-labelledby="experience-title"><div className="section-meta"><span>THE EXPERIENCE</span><span>03 / 04</span></div><div className="experience-section__grid"><div><h2 id="experience-title">Nothing between<br />you and <em>the idea.</em></h2><p>Begin with a sentence or a voice note. Add an image. Explore a source. Keep the part that matters. Each step stays in one calm workspace.</p><Link className="text-link" href="/app" prefetch={false}>Try it for yourself <ArrowRight size={18} /></Link></div><div className="product-window" aria-label="Representative interface preview"><div className="product-window__top"><span className="mini-mark">◌</span><span>ASSISTANT / RESEARCH</span><span>EXAMPLE VIEW</span></div><div className="product-window__body"><div className="product-window__prompt">What can we learn from this idea?</div><div className="product-window__answer"><span>◌ &nbsp; ASSISTANT</span><h3>Start with the question.<br />Then follow the evidence.</h3><p>A good first step is to separate what you know from what you still need to find out. Ask for sources when the answer depends on current facts.</p><div className="product-window__source">↗ Sources appear here when live research is used</div></div><div className="product-window__composer">Ask anything <span>↗</span></div></div></div></div></section>

    <section className="trust-section" aria-labelledby="trust-title"><div className="section-meta"><span>BUILT WITH INTENTION</span><span>04 / 04</span></div><div className="trust-section__grid"><h2 id="trust-title">Curiosity deserves <em>clarity.</em></h2><div><p>Microphone and image access happen only when you choose them. Research shows sources when it uses them. Your workspace stays in this browser, and you can clear or export it.</p><p className="trust-section__muted">This is a bounded public demo. Live AI features depend on provider availability and usage limits; the app shows their current status before you use them.</p></div></div></section>

    <footer className="site-footer"><div className="site-footer__main"><span>THOUGHTS IN.<br /><em>POSSIBILITIES OUT.</em></span><Link href="/app" prefetch={false} className="footer-cta" aria-label="Open assistant"><ArrowRight size={38} strokeWidth={1.2}/></Link></div><div className="site-footer__bottom"><Brand compact /><span>AN EXPERIMENTAL PORTFOLIO PROJECT</span><a href="#top">BACK TO TOP ↑</a></div></footer>
  </main>;
}

function ArrowUpRightIcon(){ return <ArrowRight size={15} style={{transform:"rotate(-45deg)"}} />; }
