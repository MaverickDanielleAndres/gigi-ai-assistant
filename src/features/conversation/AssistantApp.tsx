"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, AudioLines, Aperture, Bookmark, Check, ChevronDown, CircleHelp, Copy, Download, FlaskConical, Globe2, ImagePlus, Menu, Mic, Pause, Search, Square, Trash2, Volume2, WandSparkles, Waypoints, X } from "lucide-react";
import { modes, type Mode } from "@/shared/modes";
import type { Artifact, ChatEvent, Turn } from "@/shared/contracts";
import { clearSession, loadSession, saveSession } from "./storage";
import "./assistant.css";

type Capabilities = { ai: boolean; voice: boolean; vision: boolean; research: boolean; reason: string | null; turnstileSiteKey: string | null; turnstileRequired: boolean };
type VoiceState = "idle" | "permission" | "listening" | "thinking" | "speaking" | "error";
const icons = { voice: AudioLines, vision: Aperture, workspace: Bookmark, research: Search, studio: WandSparkles, coach: Waypoints, lab: FlaskConical };
const descriptions: Record<Mode, string> = { voice: "Think out loud", vision: "Look closer", workspace: "Keep what matters", research: "Follow the evidence", studio: "Shape an idea", coach: "Find the next step", lab: "Explore approaches" };
const descriptionsFil: Record<Mode, string> = { voice: "Sabihin ang iniisip", vision: "Tumingin nang mas malapitan", workspace: "Itago ang mahalaga", research: "Suriin ang mga sanggunian", studio: "Bumuo ng ideya", coach: "Hanapin ang susunod na hakbang", lab: "Ihambing ang mga paraan" };
const starters: { mode: Mode; label: string; text: string }[] = [
  { mode: "voice", label: "Voice", text: "Help me think through an idea I've been putting off." },
  { mode: "vision", label: "Vision", text: "What should I notice in this image?" },
  { mode: "research", label: "Research", text: "What are the latest developments in accessible web design?" },
  { mode: "studio", label: "Studio", text: "Turn a rough idea into a concise project brief." },
];
const startersFil: Record<Mode, string> = { voice: "Tulungan akong pag-isipan ang isang ideyang ipinagpapaliban ko.", vision: "Ano ang dapat kong mapansin sa larawang ito?", workspace: "Ayusin ang mahahalagang ideya ko.", research: "Ano ang pinakabagong pagbabago sa accessible na web design?", studio: "Gawing maikling project brief ang isang magaspang na ideya.", coach: "Tulungan akong magsanay para sa presentasyon.", lab: "Ihambing ang dalawang paraan ng pagpapaliwanag nito." };
const labels = {
  en: { start: "A place for your next thought.", intro: "Ask a question, speak naturally, or bring an image into the conversation.", placeholder: "Ask anything or describe what you're working on...", send: "Send message", attach: "Attach image", listen: "Start voice", stop: "Stop listening", thinking: "Thinking", ready: "Ready when you are", session: "Session", workspace: "Saved work", noItems: "Pin an answer to keep it here.", clear: "Clear conversation", export: "Export session", unavailable: "Live AI is awaiting setup. You can explore the interface and keep local notes.", speak: "Read aloud", pin: "Pin to workspace", copied: "Copied", mode: "Mode", ways: "WAYS TO BEGIN", startSomewhere: "START SOMEWHERE", yourSpace: "YOUR SPACE", workspaceInfo: "Answers you pin and notes you write stay on this device. Export your session when you want to take it with you.", quickNote: "QUICK NOTE", notePlaceholder: "Write something worth keeping...", saveNote: "SAVE NOTE", copy: "COPY", remove: "REMOVE", edit: "EDIT", save: "SAVE", cancel: "CANCEL", setup: "SETUP REQUIRED" },
  fil: { start: "Lugar para sa susunod mong ideya.", intro: "Magtanong, magsalita, o magdagdag ng larawan sa usapan.", placeholder: "Magtanong o ilarawan ang ginagawa mo...", send: "Ipadala", attach: "Magdagdag ng larawan", listen: "Magsalita", stop: "Ihinto ang pakikinig", thinking: "Nag-iisip", ready: "Handa kapag ikaw ay handa", session: "Usapan", workspace: "Naka-save", noItems: "I-pin ang sagot para manatili rito.", clear: "Burahin ang usapan", export: "I-export ang usapan", unavailable: "Hindi pa nakakonekta ang live AI. Maaari mong tuklasin ang interface at magtago ng lokal na tala.", speak: "Basahin nang malakas", pin: "I-pin sa workspace", copied: "Nakopya", mode: "Mode", ways: "MGA PARAAN UPANG MAGSIMULA", startSomewhere: "PUMILI NG SIMULA", yourSpace: "IYONG LUGAR", workspaceInfo: "Mananatili sa device na ito ang mga sagot at talang itinatago mo. I-export ang usapan para makakuha ng kopya.", quickNote: "MAIKLING TALA", notePlaceholder: "Isulat ang ideyang nais mong itago...", saveNote: "ITAGO ANG TALA", copy: "KOPYAHIN", remove: "ALISIN", edit: "BAGUHIN", save: "ITAGO", cancel: "KANSELAHIN", setup: "KAILANGANG I-SET UP" },
};

declare global { interface Window { turnstile?: { render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void }) => string; reset: (id?: string) => void } } }

export function AssistantApp({ brand }: { brand: ReactNode }) {
  const [mode, setMode] = useState<Mode>("voice");
  const [locale, setLocale] = useState<"en" | "fil">("en");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [editingArtifactId, setEditingArtifactId] = useState<string | null>(null);
  const [artifactEditText, setArtifactEditText] = useState("");
  const [draft, setDraft] = useState("");
  const [image, setImage] = useState<{ name: string; dataUrl: string } | null>(null);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [remainingUnits, setRemainingUnits] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [streamSources, setStreamSources] = useState<{ title: string; url: string }[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const turnsRef = useRef<Turn[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const microphoneRef = useRef<MediaStream | null>(null);
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const helpDialogRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const t = labels[locale];
  const aiReady = capabilities?.ai === true;

  useEffect(() => {
    const queryMode = new URLSearchParams(window.location.search).get("mode");
    Promise.all([loadSession().catch(() => null), fetch("/api/capabilities").then(r => r.json()).catch(() => null)]).then(([saved, caps]) => {
      if (queryMode && modes.includes(queryMode as Mode)) setMode(queryMode as Mode);
      if (saved) { setTurns(saved.turns || []); turnsRef.current = saved.turns || []; setArtifacts(saved.artifacts || []); setLocale(saved.locale || "en"); }
      setCapabilities(caps);
      refreshLimits();
      loadedRef.current = true;
    });
  }, []);
  useEffect(() => { turnsRef.current = turns; if (loadedRef.current) saveSession({ turns, artifacts, locale }).catch(() => {}); }, [turns, artifacts, locale]);
  useEffect(() => { document.documentElement.lang = locale === "fil" ? "fil" : "en"; }, [locale]);
  useEffect(() => { if (pending) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [pending, streamText]);
  useEffect(() => {
    if (!helpOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = helpDialogRef.current;
    dialog?.querySelector<HTMLElement>("button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setHelpOpen(false); return; }
      if (event.key !== "Tab" || !dialog) return;
      const buttons = Array.from(dialog.querySelectorAll<HTMLElement>("button:not([disabled])"));
      if (!buttons.length) return;
      const first = buttons[0]; const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); previous?.focus(); };
  }, [helpOpen]);
  useEffect(() => () => { abortRef.current?.abort(); if (recorderRef.current) { recorderRef.current.onstop = null; if (recorderRef.current.state === "recording") recorderRef.current.stop(); } microphoneRef.current?.getTracks().forEach(track => track.stop()); if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current); audioRef.current?.pause(); if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current); }, []);

  useEffect(() => {
    if (!capabilities?.turnstileSiteKey) return;
    if (window.turnstile) { queueMicrotask(() => setTurnstileReady(true)); return; }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => setTurnstileReady(true);
    script.onerror = () => setError("The visitor check could not load. Please refresh and try again.");
    document.head.appendChild(script);
    return () => { script.onload = null; script.onerror = null; script.remove(); };
  }, [capabilities?.turnstileSiteKey]);

  useEffect(() => {
    if (!turnstileReady || !capabilities?.turnstileSiteKey || !widgetRef.current || !window.turnstile || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(widgetRef.current, { sitekey: capabilities.turnstileSiteKey, callback: setTurnstileToken, "expired-callback": () => setTurnstileToken("") });
  }, [turnstileReady, capabilities]);

  const resetChallenge = () => { setTurnstileToken(""); if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current); };
  const refreshLimits = () => { fetch("/api/limits").then(response => response.json()).then(data => setRemainingUnits(typeof data.remainingUnits === "number" ? data.remainingUnits : null)).catch(() => {}); };
  const selectMode = (next: Mode) => { setMode(next); setMenuOpen(false); window.history.replaceState(null, "", `/app?mode=${next}`); };
  const saveTurn = (turn: Turn) => { setTurns(prev => [...prev, turn]); };

  const speak = useCallback(async (text: string) => {
    if (!capabilities?.voice) return;
    audioRef.current?.pause();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    setVoiceState("speaking");
    try {
      const response = await fetch("/api/voice/speak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: text.slice(0, 1800), turnstileToken }) });
      resetChallenge();
      if (!response.ok) throw new Error((await response.json()).message || "Spoken reply unavailable.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob); audioUrlRef.current = url;
      const audio = new Audio(url); audioRef.current = audio;
      audio.onended = () => setVoiceState("idle");
      await audio.play();
    } catch (reason) { setVoiceState("error"); setError(reason instanceof Error ? reason.message : "Spoken reply unavailable."); }
  }, [capabilities?.voice, turnstileToken]);

  const send = useCallback(async (text = draft, fromVoice = false) => {
    const clean = text.trim();
    if (!clean || pending) return;
    setError("");
    if (!aiReady) { setError(t.unavailable); return; }
    const requestId = crypto.randomUUID();
    const userTurn: Turn = { id: requestId, role: "user", text: clean + (image ? `\n[Image: ${image.name}]` : ""), createdAt: Date.now(), mode };
    const history = turnsRef.current.slice(-8).map(({ role, text }) => ({ role, text: text.slice(0, 3000) }));
    saveTurn(userTurn); setDraft(""); setImage(null); setPending(true); setStreamText(""); setStreamSources([]); setStatus("Thinking");
    const abort = new AbortController(); abortRef.current = abort;
    let answer = ""; let completed = false; let paintFrame = 0; const sources: { title: string; url: string }[] = [];
    try {
      const response = await fetch("/api/chat/stream", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId, mode, locale, text: clean, history, image, turnstileToken }), signal: abort.signal });
      if (!response.ok) { const data = await response.json(); throw new Error(data.message || "The assistant is unavailable."); }
      if (!response.body) throw new Error("The response stream was empty.");
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line) continue;
          const event = JSON.parse(line) as ChatEvent;
          if (event.type === "status") setStatus(event.label);
          if (event.type === "text_delta") {
            if (!answer) setStatus("");
            answer += event.text;
            if (!paintFrame) paintFrame = requestAnimationFrame(() => { paintFrame = 0; setStreamText(answer); });
          }
          if (event.type === "citation") { sources.push({ title: event.title, url: event.url }); setStreamSources([...sources]); }
          if (event.type === "done") completed = true;
          if (event.type === "error") throw new Error(event.message);
        }
      }
      if (!completed) throw new Error("The answer was interrupted. Please try again.");
      if (!answer) throw new Error("No answer was returned. Please try again.");
      saveTurn({ id: crypto.randomUUID(), role: "assistant", text: answer, mode, createdAt: Date.now(), sources });
      if (fromVoice) void speak(answer);
    } catch (reason) {
      if ((reason as Error).name !== "AbortError") setError(reason instanceof Error ? reason.message : "Something went wrong.");
      if (answer) saveTurn({ id: crypto.randomUUID(), role: "assistant", text: `${answer}\n\n[Answer interrupted]`, mode, createdAt: Date.now(), sources });
    } finally { if (paintFrame) cancelAnimationFrame(paintFrame); abortRef.current = null; setPending(false); setStreamText(""); setStreamSources([]); setStatus(""); setVoiceState(current => current === "thinking" ? "idle" : current); refreshLimits(); }
  }, [draft, pending, aiReady, t.unavailable, turnstileToken, image, mode, locale, speak]);

  const stopVoice = () => { if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current); if (recorderRef.current?.state === "recording") recorderRef.current.stop(); microphoneRef.current?.getTracks().forEach(track => track.stop()); setVoiceState("thinking"); setPartialTranscript("Transcribing your voice…"); };
  const startVoice = async () => {
    setError("");
    if (!capabilities?.voice) { setError("Voice is awaiting ElevenLabs configuration."); return; }
    if (capabilities.turnstileRequired && !turnstileToken) { setError("Complete the visitor check first."); return; }
    setVoiceState("permission"); setPartialTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      microphoneRef.current = stream;
      if (typeof MediaRecorder === "undefined") throw new Error("This browser cannot record audio. Please type your message.");
      const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus"].find(type => MediaRecorder.isTypeSupported(type));
      if (!mime) { stream.getTracks().forEach(track => track.stop()); throw new Error("This browser cannot record a supported audio format. Please type your message."); }
      const recorder = new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: 64_000 });
      recorderRef.current = recorder;
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop()); microphoneRef.current = null; recorderRef.current = null;
        const blob = new Blob(chunks, { type: mime });
        if (!blob.size) { setVoiceState("idle"); setPartialTranscript(""); setError("No audio was recorded. Please try again."); return; }
        try {
          const form = new FormData(); form.set("audio", blob, mime.startsWith("audio/mp4") ? "voice.mp4" : mime.startsWith("audio/ogg") ? "voice.ogg" : "voice.webm"); form.set("turnstileToken", turnstileToken);
          const response = await fetch("/api/voice/transcribe", { method: "POST", body: form });
          resetChallenge();
          if (!response.ok) throw new Error((await response.json()).message || "Transcription failed.");
          const data = (await response.json()) as { text: string };
          setPartialTranscript("");
          if (data.text.trim()) { setVoiceState("thinking"); void send(data.text, true); }
          else { setVoiceState("idle"); setError("I could not hear that clearly. Try again or type it."); }
        } catch (reason) { setVoiceState("error"); setPartialTranscript(""); setError(reason instanceof Error ? reason.message : "Transcription failed."); }
      };
      recorder.start(); setVoiceState("listening"); setPartialTranscript("Recording your voice · 30 seconds maximum");
      voiceTimerRef.current = setTimeout(() => { if (recorder.state === "recording") { setVoiceState("thinking"); setPartialTranscript("Transcribing your voice…"); recorder.stop(); } }, 30_000);
    } catch (reason) { microphoneRef.current?.getTracks().forEach(track => track.stop()); microphoneRef.current = null; setVoiceState("error"); setError(reason instanceof Error ? reason.message : "Voice could not start."); }
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 5_000_000) { setError("Use a PNG, JPEG, or WebP image under 5 MB."); return; }
    const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); });
    setImage({ name: file.name, dataUrl }); setMode("vision"); setError("");
  };
  const pin = (turn: Turn) => { const title = turn.text.split("\n")[0].slice(0, 54) || "Saved answer"; setArtifacts(prev => [{ id: crypto.randomUUID(), title, text: turn.text, mode: turn.mode || mode, createdAt: Date.now(), sources: turn.sources }, ...prev]); setWorkspaceOpen(true); };
  const addNote = () => { const text = noteDraft.trim(); if (!text) return; setArtifacts(prev => [{ id: crypto.randomUUID(), title: text.split("\n")[0].slice(0, 54), text, mode: "workspace", createdAt: Date.now() }, ...prev]); setNoteDraft(""); };
  const editArtifact = (artifact: Artifact) => { setEditingArtifactId(artifact.id); setArtifactEditText(artifact.text); };
  const saveArtifactEdit = () => { const text = artifactEditText.trim(); if (!text || !editingArtifactId) return; setArtifacts(prev => prev.map(item => item.id === editingArtifactId ? { ...item, text, title: text.split("\n")[0].slice(0, 54) } : item)); setEditingArtifactId(null); setArtifactEditText(""); };
  const copy = async (turn: Turn) => { await navigator.clipboard.writeText(turn.text); setCopiedId(turn.id); setTimeout(() => setCopiedId(""), 1800); };
  const exportSession = () => { const lines = ["# Signal Vessel session", "", "## Saved work", "", ...artifacts.flatMap(a => [`### ${a.title}`, "", a.text, ""]), "## Conversation", "", ...turns.flatMap(turn => [`## ${turn.role === "user" ? "You" : "Assistant"} · ${new Date(turn.createdAt).toLocaleString()}`, "", turn.text, "", ...(turn.sources?.length ? ["Sources:", ...turn.sources.map(s => `- [${s.title}](${s.url})`), ""] : [])])]; const blob = new Blob([lines.join("\n")], { type: "text/markdown" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "assistant-session.md"; anchor.click(); URL.revokeObjectURL(url); };
  const clearAll = async () => { if (!window.confirm("Clear this conversation and all saved work from this browser?")) return; abortRef.current?.abort(); await clearSession(); setTurns([]); turnsRef.current = []; setArtifacts([]); setWorkspaceOpen(false); };
  const activeIcon = icons[mode]; const ActiveIcon = activeIcon;
  const orbState = voiceState === "listening" || voiceState === "speaking" || voiceState === "thinking" || voiceState === "error" ? voiceState : pending ? "thinking" : "idle";

  return <div className="app-shell">
    <header className="app-header"><div className="app-header__left"><button className="icon-button mobile-menu" aria-label="Open modes" onClick={() => setMenuOpen(true)}><Menu size={21}/></button>{brand}<span className="app-header__divider"/><span className="app-header__product">THE ASSISTANT <span className={`live-dot ${aiReady ? "" : "live-dot--off"}`}/></span></div><div className="app-header__right"><span className="app-header__edition">A PUBLIC EXPERIMENT / 001</span><button className="app-header__language" onClick={() => setLocale(locale === "en" ? "fil" : "en")} aria-label={locale === "en" ? "EN, switch language to Filipino" : "FIL, switch language to English"}><Globe2 size={15}/>{locale === "en" ? "EN" : "FIL"}<ChevronDown size={12}/></button><button className="icon-button" aria-label="Help and privacy" onClick={() => setHelpOpen(true)}><CircleHelp size={20}/></button><Link href="/" className="app-header__back"><ArrowLeft size={15}/> HOME</Link></div></header>
    <div className="app-layout">
      <aside className={`mode-sidebar ${menuOpen ? "mode-sidebar--open" : ""}`} aria-label="Assistant modes"><div className="mode-sidebar__mobile"><span>MODES</span><button className="icon-button" aria-label="Close modes" onClick={() => setMenuOpen(false)}><X size={20}/></button></div><p className="sidebar-label">{t.ways} <span>07</span></p><nav className="mode-nav">{modes.map(item => { const Icon = icons[item]; return <button key={item} className={`mode-item ${item === mode ? "mode-item--active" : ""}`} onClick={() => selectMode(item)} aria-current={item === mode ? "page" : undefined}><span className="mode-item__icon"><Icon size={18} strokeWidth={1.7}/></span><span><strong>{item[0].toUpperCase()+item.slice(1)}</strong><small>{locale === "fil" ? descriptionsFil[item] : descriptions[item]}</small></span>{item === mode && <span className="mode-item__active-line"/>}</button>; })}</nav><div className="mode-sidebar__bottom"><button onClick={() => setWorkspaceOpen(true)}><Bookmark size={16}/> {t.workspace} <span>{artifacts.length}</span></button><button onClick={exportSession} disabled={!turns.length && !artifacts.length}><Download size={16}/> {t.export}</button><button onClick={clearAll} disabled={!turns.length && !artifacts.length}><Trash2 size={16}/> {t.clear}</button></div></aside>
      {menuOpen && <button className="mobile-scrim" aria-label="Close modes" onClick={() => setMenuOpen(false)} />}
      <section id="conversation" className="conversation" aria-label="Conversation"><div className="conversation__top"><span>SESSION / {mode.toUpperCase()}{aiReady && remainingUnits !== null ? ` · ${remainingUnits} UNITS LEFT TODAY` : ""}</span><div><span className={`status-orb status-orb--${orbState}`} aria-hidden="true" />{aiReady ? "LIVE ASSISTANT" : t.setup}</div></div>
        <div className={`conversation__content ${turns.length ? "conversation__content--active" : ""}`}>
          {!turns.length && <div className="empty-state"><div className="empty-state__copy"><span className="eyebrow">AN OPEN SPACE FOR IDEAS</span><h1>{t.start.split(" ").slice(0,-2).join(" ")}<br/><em>{t.start.split(" ").slice(-2).join(" ")}</em></h1><p>{t.intro}</p></div><div className="starter-list"><div className="starter-list__label"><span>{t.startSomewhere}</span><span>↘</span></div>{starters.map((starter,index) => <button key={starter.mode} onClick={() => { selectMode(starter.mode); setDraft(locale === "fil" ? startersFil[starter.mode] : starter.text); document.getElementById("message-input")?.focus(); }}><span>0{index+1}</span><strong>{locale === "fil" ? startersFil[starter.mode] : starter.text}</strong><ArrowUp size={16} style={{transform:"rotate(45deg)"}}/></button>)}</div></div>}
          {!!turns.length && <div className="turn-list">{turns.map(turn => <article key={turn.id} className={`turn turn--${turn.role}`}><div className="turn__meta"><span>{turn.role === "user" ? "YOU" : "ASSISTANT"}</span><span>{new Date(turn.createdAt).toLocaleTimeString(locale === "fil" ? "fil-PH" : "en-US", { hour: "numeric", minute: "2-digit" })}</span></div><div className="turn__text">{turn.text}</div>{turn.sources && turn.sources.length > 0 && <div className="turn__sources"><span>SOURCES</span>{turn.sources.map(source => <a href={source.url} key={source.url} target="_blank" rel="noopener noreferrer">↗ {source.title}</a>)}</div>}{turn.role === "assistant" && <div className="turn__actions"><button onClick={() => copy(turn)} aria-label="Copy answer">{copiedId === turn.id ? <Check size={15}/> : <Copy size={15}/>} {copiedId === turn.id ? t.copied : "Copy"}</button><button onClick={() => pin(turn)} aria-label="Pin answer"><Bookmark size={15}/> {t.pin}</button>{capabilities?.voice && <button onClick={() => void speak(turn.text)}><Volume2 size={15}/> {t.speak}</button>}</div>}</article>)}{pending && <article className="turn turn--assistant turn--stream"><div className="turn__meta"><span>ASSISTANT</span><span>{status || "RESPONDING"}</span></div><div className="turn__text">{streamText || <span className="typing-dots">● ● ●</span>}</div>{streamSources.length > 0 && <div className="turn__sources">{streamSources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">↗ {source.title}</a>)}</div>}</article>}<div ref={bottomRef}/></div>}
        </div>
        <div className="composer-zone"><div className="composer-zone__inner">{!aiReady && <div className="setup-notice"><span>○</span>{locale === "fil" ? t.unavailable : capabilities?.reason || t.unavailable}</div>}{error && <div className="error-notice" role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={16}/></button></div>}{partialTranscript && <div className="transcript-preview" role="status">{partialTranscript}</div>}{image && <div className="attachment-preview"><ImagePlus size={16}/><span>{image.name}</span><button onClick={() => setImage(null)} aria-label="Remove image"><X size={16}/></button></div>}
          <div className="composer"><div className="composer__mode"><ActiveIcon size={15}/><span>{mode.toUpperCase()}</span><span className="composer__mode-divider"/><span>{t.ready}</span></div><textarea id="message-input" value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} rows={2} placeholder={t.placeholder} aria-label="Message" maxLength={12000}/><div className="composer__bottom"><div className="composer__tools"><input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={event => { void onFile(event.target.files?.[0]); event.target.value = ""; }}/><button title={t.attach} aria-label={t.attach} onClick={() => fileInputRef.current?.click()}><ImagePlus size={18}/><span>IMAGE</span></button>{voiceState === "listening" ? <button title={t.stop} aria-label={t.stop} onClick={stopVoice} className="tool-active"><Square size={17}/><span>STOP</span></button> : <button title={t.listen} aria-label={t.listen} onClick={startVoice} disabled={!capabilities?.voice || pending}><Mic size={17}/><span>VOICE</span></button>}{voiceState === "speaking" && <button onClick={() => { audioRef.current?.pause(); setVoiceState("idle"); }} aria-label="Stop speaking"><Pause size={17}/><span>MUTE</span></button>}</div>{pending ? <button className="send-button" onClick={() => abortRef.current?.abort()} aria-label="Stop generating"><Square size={17}/></button> : <button className="send-button" onClick={() => void send()} disabled={!draft.trim() || !aiReady} aria-label={t.send}><ArrowUp size={20}/></button>}</div></div><div className="composer-foot"><span>ENTER TO SEND · SHIFT + ENTER FOR NEW LINE</span><span>YOUR WORKSPACE STAYS IN THIS BROWSER</span></div>{capabilities?.turnstileRequired && capabilities.turnstileSiteKey && <div className="visitor-check"><span>VISITOR CHECK</span><div ref={widgetRef}/>{turnstileToken && <Check size={16}/>}</div>}</div></div>
      </section>
      <aside className={`workspace-panel ${workspaceOpen ? "workspace-panel--open" : ""}`} aria-label="Workspace"><div className="workspace-panel__head"><div><span className="eyebrow">{t.yourSpace}</span><h2>{t.workspace}</h2></div><button aria-label="Close workspace" onClick={() => setWorkspaceOpen(false)}><X size={18}/></button></div><p>{t.workspaceInfo}</p><div className="workspace-note"><label htmlFor="workspace-note-input">{t.quickNote}</label><textarea id="workspace-note-input" value={noteDraft} onChange={event => setNoteDraft(event.target.value)} placeholder={t.notePlaceholder} rows={3}/><button onClick={addNote} disabled={!noteDraft.trim()}>{t.saveNote} <ArrowRight size={14}/></button></div>{!artifacts.length ? <div className="workspace-empty"><Bookmark size={27} strokeWidth={1.2}/><span>{t.noItems}</span></div> : <div className="artifact-list">{artifacts.map(artifact => <article key={artifact.id}><small>{artifact.mode.toUpperCase()} / {new Date(artifact.createdAt).toLocaleDateString()}</small><h3>{artifact.title}</h3>{editingArtifactId === artifact.id ? <div className="artifact-editor"><textarea aria-label="Edit saved item" value={artifactEditText} onChange={event => setArtifactEditText(event.target.value)} rows={7}/><div><button onClick={saveArtifactEdit} disabled={!artifactEditText.trim()}><Check size={14}/> {t.save}</button><button onClick={() => setEditingArtifactId(null)}><X size={14}/> {t.cancel}</button></div></div> : <><p>{artifact.text.slice(0,180)}{artifact.text.length>180?"…":""}</p><div><button onClick={() => navigator.clipboard.writeText(artifact.text)}><Copy size={14}/> {t.copy}</button><button onClick={() => editArtifact(artifact)}><WandSparkles size={14}/> {t.edit}</button><button onClick={() => setArtifacts(prev => prev.filter(item => item.id !== artifact.id))}><Trash2 size={14}/> {t.remove}</button></div></>}</article>)}</div>}</aside>
    </div>
    {helpOpen && <div className="dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setHelpOpen(false); }}><div ref={helpDialogRef} className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title"><button className="help-dialog__close" onClick={() => setHelpOpen(false)} aria-label="Close help"><X size={20}/></button><span className="eyebrow">HOW IT WORKS</span><h2 id="help-title">A little clarity<br/><em>goes a long way.</em></h2><p>This is a public, limited AI experiment. You can chat by text without an account. Microphone access starts only when you press Voice; image data is sent only when you submit a message with an image.</p><p>Conversation and saved work stay in this browser through local storage. Use Clear conversation to remove them or Export session to keep a copy. Provider services process submitted text, images, or audio to generate responses. Research links appear only when a live search returns sources.</p><p>AI can be mistaken. Check cited sources and avoid submitting sensitive personal information.</p><button className="button button--light" onClick={() => setHelpOpen(false)}>Continue <ArrowRight size={17}/></button></div></div>}
  </div>;
}
