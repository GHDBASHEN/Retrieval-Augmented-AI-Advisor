'use client';

import React, { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Brain, FileText, MessageSquare, Shield, Zap, Globe, Bot, Menu, X, Upload, Cpu, MessageCircle, User, Send } from 'lucide-react';

const features = [
  { icon: Brain, title: "Intelligent RAG Pipeline", description: "Documents are chunked, embedded, and stored in a vector database for lightning-fast semantic retrieval." },
  { icon: MessageSquare, title: "Conversational AI Bots", description: "Create multiple bots, each specialized on different document sets. Chat naturally and get accurate answers." },
  { icon: FileText, title: "Multi-Format Ingestion", description: "Upload PDFs, text files, and more. Our ingestion pipeline handles parsing and chunking automatically." },
  { icon: Zap, title: "Groq-Powered Speed", description: "Responses generated at blazing speed using Groq's LPU inference engine for near-instant AI replies." },
  { icon: Shield, title: "Private & Secure", description: "Your documents stay yours. Self-hosted architecture ensures complete data privacy and control." },
  { icon: Globe, title: "Embeddable Widget", description: "Deploy your AI advisor as a chat widget on any website with a single script tag." },
];

const steps = [
  { icon: Upload, step: "01", title: "Upload Documents", description: "Upload your PDFs, text files, or any documents. They're automatically parsed, chunked, and embedded." },
  { icon: Cpu, step: "02", title: "Create a Bot", description: "Configure an AI bot with a custom system prompt. Link it to your uploaded documents for context." },
  { icon: MessageCircle, step: "03", title: "Start Asking", description: "Chat with your bot and get precise, cited answers from your documents in real time." },
];

const demoMessages = [
  { role: "user" as const, text: "What are the key findings in the Q4 report?" },
  { role: "bot" as const, text: "Based on the Q4 report, revenue grew 23% YoY to $4.2M, with SaaS subscriptions accounting for 68% of total revenue. Customer churn decreased to 3.1%." },
  { role: "user" as const, text: "What recommendations were made?" },
  { role: "bot" as const, text: "The report recommends: 1) Expanding the enterprise sales team by 40%, 2) Investing in product-led growth, and 3) Launching APAC operations by Q2 2026." },
];

// Extracted to prevent re-rendering the whole page during the animation
const ChatPreviewWidget = () => {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount < demoMessages.length) {
      const timer = setTimeout(() => setVisibleCount((c) => c + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [visibleCount]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-border/60 bg-card shadow-2xl glow-box overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4 bg-background/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Q4 Report Advisor</p>
            <p className="text-xs text-muted-foreground">Online • 3 documents indexed</p>
          </div>
          <span className="ml-auto h-2 w-2 rounded-full bg-primary animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
        </div>
        <div className="flex flex-col gap-3 p-5 h-72 overflow-y-auto bg-card">
          {demoMessages.slice(0, visibleCount).map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-secondary" : "bg-primary/10"}`}>
                {msg.role === "user" ? <User className="h-3.5 w-3.5 text-secondary-foreground" /> : <Bot className="h-3.5 w-3.5 text-primary" />}
              </div>
              <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground font-medium" : "bg-secondary text-secondary-foreground"}`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {visibleCount < demoMessages.length && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10"><Bot className="h-3.5 w-3.5 text-primary" /></div>
              <div className="flex items-center gap-1 rounded-xl bg-secondary px-4 py-3">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce delay-100" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce delay-200" />
              </div>
            </motion.div>
          )}
        </div>
        <div className="border-t border-border/60 px-4 py-3 bg-background/50">
          <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2.5">
            <span className="flex-1 text-xs text-muted-foreground">Ask anything about your docs...</span>
            <Send className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  
  // --- STATE MANAGEMENT ---
  const [botName, setBotName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Dashboard states
  const [bots, setBots] = useState<any[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- API LOGIC ---
  const fetchBots = async (key: string) => {
    try {
      const res = await api.getBots(key);
      if (res.ok) setBots(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async (botId: number, key: string) => {
    try {
      const res = await api.getHistory(botId, key);
      if (res.ok) setChatHistory(await res.json());
    } catch (e) { setChatHistory([]); }
  };

  useEffect(() => {
    if (selectedBotId && apiKey) fetchHistory(selectedBotId, apiKey);
  }, [selectedBotId, apiKey]);

  const handleLogout = () => {
    setIsLoggedIn(false); setEmail(''); setPassword(''); setApiKey('');
    setBots([]); setSelectedBotId(null); setChatHistory([]);
  };

  const handleRegisterOrLogin = async () => {
    if (!email) return;
    try {
      const res = isLoginMode ? await api.login(email, password) : await api.register(email, password);
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.api_key); setIsLoggedIn(true); fetchBots(data.api_key);
      } else {
        const err = await res.json();
        alert(err.detail || "Error authenticating. Try a different email.");
      }
    } catch (e) { console.error(e); }
  };

  const handleCreateBot = async () => {
    if (!botName || !apiKey) { alert("Bot name is required"); return; }
    setIsTraining(true); setStatusMsg('Creating bot in database...');
    try {
      const botRes = await api.createBot(botName, description, apiKey);
      if (!botRes.ok) throw new Error((await botRes.json()).detail || "Failed to create bot");
      
      const botId = (await botRes.json()).id;
      if (files.length > 0) {
        for (const f of files) {
          setStatusMsg(`Uploading and parsing ${f.name}...`);
          if (!(await api.ingestFile(botId, f, apiKey)).ok) throw new Error(`Failed to process file ${f.name}`);
        }
      }
      if (url) {
        setStatusMsg(`Scraping and processing URL...`);
        if (!(await api.ingestUrl(botId, url, apiKey)).ok) throw new Error("Failed to process URL");
      }
      setStatusMsg('Bot created successfully!');
      setBotName(''); setDescription(''); setUrl(''); setFiles([]);
      await fetchBots(apiKey); setSelectedBotId(botId);
    } catch (err: any) { setStatusMsg(err.message || 'An error occurred during training.'); }
    setIsTraining(false);
  };

  const activeBot = bots.find(b => b.id === selectedBotId);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 relative overflow-hidden scroll-smooth">
      
      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-6 max-w-[1400px]">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 glow-border">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">RAG Advisor</span>
          </div>

          {!isLoggedIn ? (
            <>
              <div className="hidden items-center gap-8 md:flex">
                <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-white">Features</a>
                <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-white">How it Works</a>
                <a href="#demo" className="text-sm font-medium text-muted-foreground transition-colors hover:text-white">Demo</a>
              </div>
              <button className="md:hidden text-foreground" onClick={() => setNavOpen(!navOpen)}>
                {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="opacity-80 hidden sm:block font-medium">{email}</span>
              <button onClick={handleLogout} className="px-4 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all font-medium text-xs">
                Logout
              </button>
            </div>
          )}
        </div>

        {navOpen && !isLoggedIn && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden overflow-hidden">
            <div className="flex flex-col gap-4 p-6">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-white" onClick={() => setNavOpen(false)}>Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-white" onClick={() => setNavOpen(false)}>How it Works</a>
              <a href="#demo" className="text-sm font-medium text-muted-foreground hover:text-white" onClick={() => setNavOpen(false)}>Demo</a>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {!isLoggedIn ? (
        <main className="flex-1 relative z-10 w-full overflow-y-auto pt-16">
          <div className="absolute inset-0 gradient-mesh" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
          
          <motion.div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(175 80% 50% / 0.3) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* HERO SECTION */}
          <section className="relative pt-16 pb-20">
            <div className="container relative mx-auto px-6 pt-12 pb-20 lg:pt-24 max-w-[1400px]">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                
                <div className="max-w-xl">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
                  >
                    <Sparkles className="h-3 w-3" />
                    Powered by RAG + Groq LLM
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl text-white"
                  >
                    Your Documents,{" "}
                    <span className="glow-text">Instantly Intelligent</span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="mt-6 text-lg leading-relaxed text-muted-foreground"
                  >
                    Upload any document and get an AI advisor that understands your content deeply. Ask questions, get precise answers with source citations — powered by retrieval-augmented generation.
                  </motion.p>
                </div>

                {/* Embedded Auth Form */}
                <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.7 }} className="w-full flex justify-end">
                  <div className="p-8 w-full max-w-md rounded-2xl bg-card border border-border/50 shadow-2xl backdrop-blur-xl flex flex-col gap-6 relative overflow-hidden glow-box">
                    <div className="relative z-10 space-y-4">
                      <div>
                        <h2 className="text-2xl font-semibold text-white">{isLoginMode ? 'Welcome Back' : 'Start Building'}</h2>
                        <p className="text-muted-foreground text-sm mt-1">{isLoginMode ? 'Login to manage your knowledge base' : 'Register to get your API key instantly'}</p>
                      </div>
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground text-white"
                      />
                      <input
                        type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground text-white"
                      />
                      <button
                        onClick={handleRegisterOrLogin} disabled={!email || !password}
                        className="w-full py-3.5 flex justify-center items-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                      >
                        {isLoginMode ? 'Login to Dashboard' : 'Create Account'}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <div className="text-center text-sm text-muted-foreground">
                        {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-primary hover:text-primary/80 font-medium cursor-pointer transition-colors">
                          {isLoginMode ? 'Register here' : 'Login here'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>
          </section>

          {/* FEATURES */}
          <section id="features" className="relative py-28 border-t border-border/50 bg-card/30">
            <div className="container mx-auto px-6 max-w-[1400px]">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
                  Everything you need to build <span className="glow-text">AI knowledge bases</span>
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">A complete platform for creating retrieval-augmented AI advisors from your own documents.</p>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, i) => (
                  <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group rounded-xl border border-border/60 bg-card p-6 transition-all hover:border-primary/30 hover:glow-border">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section id="how-it-works" className="relative py-28 border-t border-border/50">
            <div className="container relative mx-auto px-6 max-w-[1400px]">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
                  Three steps to <span className="glow-text">intelligent answers</span>
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Go from raw documents to a fully functional AI advisor in minutes.</p>
              </motion.div>

              <div className="grid gap-8 md:grid-cols-3">
                {steps.map((step, i) => (
                  <motion.div key={step.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative text-center">
                    {i < steps.length - 1 && <div className="absolute right-0 top-12 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-primary/40 to-transparent md:block" />}
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
                      <step.icon className="h-7 w-7 text-primary" />
                    </div>
                    <span className="mb-2 block font-mono text-xs font-semibold text-primary">{step.step}</span>
                    <h3 className="mb-3 text-xl font-bold text-white">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* DEMO SECTION */}
          <section id="demo" className="relative py-28 border-t border-border/50 bg-card/20 overflow-hidden">
            <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />
            <div className="container relative mx-auto px-6 max-w-[1400px]">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
                  See it in <span className="glow-text">action</span>
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Watch how the RAG Advisor provides precise, cited answers from uploaded documents.</p>
              </motion.div>
              
              <ChatPreviewWidget />
            </div>
          </section>

          {/* CTA SECTION */}
          <section className="relative py-28 border-t border-border/50">
            <div className="container mx-auto px-6 max-w-[1400px]">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-12 text-center glow-box sm:p-16">
                <div className="absolute inset-0 gradient-mesh pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-white">
                    Ready to make your documents <span className="glow-text">talk back?</span>
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                    Deploy your own RAG-powered AI advisor today. Open source, self-hosted, and endlessly customizable.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 py-3.5 text-base font-bold transition-opacity hover:opacity-90 cursor-pointer">
                      Start Building Free
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <a href="https://github.com/GHDBASHEN/Retrieval-Augmented-AI-Advisor" target="_blank" rel="noreferrer" className="flex items-center justify-center rounded-full border border-border bg-transparent text-white px-8 py-3.5 text-base font-semibold transition-colors hover:bg-secondary cursor-pointer">
                      Star on GitHub
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="border-t border-border/50 py-12 bg-background relative z-10">
            <div className="container mx-auto flex flex-col items-center gap-4 px-6 text-center sm:flex-row sm:justify-between sm:text-left max-w-[1400px]">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-white">RAG Advisor</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                © {new Date().getFullYear()} RAG Advisor. Built with FastAPI, Groq & Next.js.
              </p>
            </div>
          </footer>
        </main>
      ) : (
        // DASHBOARD VIEW
        <main className="flex-1 relative z-10 max-w-[1400px] w-full mx-auto p-6 flex gap-6 pt-24">
          <div className="w-64 flex flex-col gap-4 border-r border-border/50 pr-6">
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 glow-border mb-4">
              <p className="text-[10px] text-primary uppercase font-bold tracking-wider mb-2">API Key</p>
              <div className="bg-background border border-primary/20 rounded-md p-2 overflow-x-auto">
                <code className="text-xs font-mono text-primary break-all">{apiKey}</code>
              </div>
            </div>

            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Bots</h3>
            <button onClick={() => setSelectedBotId(null)} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all font-medium ${!selectedBotId ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-card border border-transparent'}`}>
              + Create New Bot
            </button>
            <div className="flex flex-col gap-2 overflow-y-auto">
              {bots.map(bot => (
                <button key={bot.id} onClick={() => setSelectedBotId(bot.id)} className={`w-full text-left px-4 py-3 rounded-xl text-sm truncate transition-all font-medium ${selectedBotId === bot.id ? 'bg-card text-foreground border border-border/50 glow-border' : 'text-muted-foreground hover:bg-card/50 border border-transparent'}`}>
                  {bot.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex gap-8 pl-4">
            <div className="flex-1 max-w-2xl flex flex-col overflow-y-auto pr-4 space-y-8 pb-10">
              {!selectedBotId ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Create a new Bot</h2>
                    <p className="text-muted-foreground text-sm font-medium">Configure your custom AI assistant and upload knowledge sources.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-card border border-border/60 glow-box flex flex-col gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bot Name</label>
                        <input type="text" value={botName} onChange={e => setBotName(e.target.value)} placeholder="e.g. Sales Bot" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this bot do?" rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-white" />
                      </div>
                      <div className="space-y-3 pt-4 border-t border-border/50">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Knowledge Sources</label>
                        <div className="space-y-3">
                          <input type="file" accept=".pdf,.csv,.txt" multiple className="hidden" ref={fileInputRef} onChange={(e) => { if (e.target.files?.length) setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]) }} />
                          <button onClick={() => fileInputRef.current?.click()} className="w-full flex justify-center p-4 rounded-xl border border-dashed border-primary/30 hover:bg-primary/5 text-muted-foreground transition-colors cursor-pointer">
                            <span className="text-sm font-semibold text-primary">{files.length > 0 ? `${files.length} file(s) selected` : 'Click to Upload Multiple Files'}</span>
                          </button>
                          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Provide an optional Web URL to scrape" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white" />
                        </div>
                      </div>
                    </div>
                    {statusMsg && <div className={`text-xs font-bold ${statusMsg.includes('error') || statusMsg.includes('Failed') ? 'text-red-400' : 'text-primary'}`}>{statusMsg}</div>}
                    <button onClick={handleCreateBot} disabled={isTraining || !botName} className="w-full py-3.5 mt-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer">
                      {isTraining ? 'Training...' : 'Create Bot'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">{activeBot?.name}</h2>
                    <p className="text-muted-foreground mt-1 font-medium">{activeBot?.description || "No description provided."}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 glow-border">
                    <p className="text-xs text-primary uppercase font-bold tracking-wider mb-2">Integration Code Snippet</p>
                    <div className="bg-background border border-primary/20 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-xs font-mono text-primary/80">
{`const response = await fetch('http://localhost:8000/conversations/${selectedBotId}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': '${apiKey}'
  },
  body: JSON.stringify({user_query: 'Hello bot' })
});
const data = await response.json();
console.log(data.bot_response);`}
                      </pre>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Past Conversations</h3>
                    {chatHistory.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic font-medium">No chat history available for this bot.</p>
                    ) : (
                      <div className="space-y-4">
                        {chatHistory.map((h, i) => (
                          <div key={i} className="bg-card border border-border/60 p-4 rounded-xl space-y-2 shadow-sm">
                            <div className="text-sm font-bold text-primary">Q: {h.user_query}</div>
                            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{h.bot_response}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-[400px] h-[75vh] flex-shrink-0 sticky top-24">
              <div className="h-full rounded-3xl border border-border/60 bg-card/40 relative overflow-hidden flex items-center justify-center p-4 glow-box">
                <div className="relative z-10 w-full h-full bg-background rounded-2xl border border-border/60 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
                  {selectedBotId ? (
                    <iframe src={`/widget?botId=${selectedBotId}&apiKey=${apiKey}`} className="w-full h-full border-none rounded-2xl bg-background" />
                  ) : (
                    <div className="text-muted-foreground text-sm text-center px-8 font-medium">
                      <div className="w-12 h-12 rounded-full border border-primary/20 bg-primary/5 mx-auto mb-4 flex items-center justify-center text-primary text-xl"><Bot size={24}/></div>
                      Select a bot or create a new one to test it here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

//this is for test jenkins 1
//test 3
//test4