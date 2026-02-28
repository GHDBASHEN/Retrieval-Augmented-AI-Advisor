'use client';
import React, { useState, useRef, useEffect } from 'react';

export default function Home() {
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

  const fetchBots = async (key: string) => {
    try {
      const res = await fetch('http://localhost:8000/bots/', {
        headers: { 'X-API-Key': key }
      });
      if (res.ok) {
        setBots(await res.json());
      }
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async (botId: number, key: string) => {
    try {
      const res = await fetch(`http://localhost:8000/conversations/${botId}/history`, {
        headers: { 'X-API-Key': key }
      });
      if (res.ok) {
        setChatHistory(await res.json());
      }
    } catch (e) { setChatHistory([]); }
  };

  useEffect(() => {
    if (selectedBotId && apiKey) {
      fetchHistory(selectedBotId, apiKey);
    }
  }, [selectedBotId, apiKey]);

  const handleRegisterOrLogin = async () => {
    if (!email) return;
    try {
      const endpoint = isLoginMode ? 'http://localhost:8000/users/login' : 'http://localhost:8000/users/';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.api_key);
        setIsLoggedIn(true);
        fetchBots(data.api_key);
      } else {
        const err = await res.json();
        alert(err.detail || "Error authenticating. Try a different email.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBot = async () => {
    if (!botName || !apiKey) {
      alert("Bot name is required");
      return;
    }

    setIsTraining(true);
    setStatusMsg('Creating bot in database...');
    try {
      const botRes = await fetch('http://localhost:8000/bots/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ name: botName, description })
      });

      if (!botRes.ok) {
        const errData = await botRes.json();
        throw new Error(errData.detail || "Failed to create bot");
      }

      const botData = await botRes.json();
      const botId = botData.id;

      if (files.length > 0) {
        for (const f of files) {
          setStatusMsg(`Uploading and parsing ${f.name}...`);
          const formData = new FormData();
          formData.append('file', f);
          const fileRes = await fetch(`http://localhost:8000/bots/${botId}/ingest-file`, {
            method: 'POST',
            headers: { 'X-API-Key': apiKey },
            body: formData
          });
          if (!fileRes.ok) throw new Error(`Failed to process file ${f.name}`);
        }
      }

      if (url) {
        setStatusMsg(`Scraping and processing URL...`);
        const urlRes = await fetch(`http://localhost:8000/bots/${botId}/ingest-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          },
          body: JSON.stringify({ url })
        });
        if (!urlRes.ok) throw new Error("Failed to process URL");
      }

      setStatusMsg('Bot created successfully!');
      setBotName('');
      setDescription('');
      setUrl('');
      setFiles([]);
      await fetchBots(apiKey);
      setSelectedBotId(botId);
    } catch (err: any) {
      console.error(err);
      setStatusMsg(err.message || 'An error occurred during training.');
    }
    setIsTraining(false);
  };

  const activeBot = bots.find(b => b.id === selectedBotId);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-indigo-500/30">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">R</div>
            <h1 className="text-xl font-semibold tracking-tight text-white drop-shadow-sm">RAG as a Service</h1>
          </div>
          {isLoggedIn && (
            <div className="text-sm text-neutral-400">
              {email}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 flex gap-6">
        {!isLoggedIn ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="p-8 w-full max-w-md rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-32 bg-indigo-500/10 blur-[60px] pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>
                  <p className="text-neutral-400 text-sm mt-1">{isLoginMode ? 'Login to manage your bots' : 'Register to get your API key'}</p>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-neutral-600 shadow-inner"
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-neutral-600 shadow-inner"
                />
                <button
                  onClick={handleRegisterOrLogin}
                  disabled={!email || !password}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
                >
                  {isLoginMode ? 'Login' : 'Register & Get Key'}
                </button>
                <div className="text-center text-sm text-neutral-400">
                  {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-indigo-400 hover:text-indigo-300">
                    {isLoginMode ? 'Register here' : 'Login here'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Sidebar Dashboard */}
            <div className="w-64 flex flex-col gap-4 border-r border-white/10 pr-6">
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-sm mb-4">
                <p className="text-[10px] text-indigo-300 uppercase font-semibold tracking-wider mb-2">API Key</p>
                <div className="bg-black/50 border border-indigo-500/20 rounded-md p-2 overflow-x-auto">
                  <code className="text-xs font-mono text-indigo-100 break-all">{apiKey}</code>
                </div>
              </div>

              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Your Bots</h3>

              <button
                onClick={() => setSelectedBotId(null)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all \${!selectedBotId ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30' : 'text-neutral-400 hover:bg-white/5 border border-transparent'}`}
              >
                + Create New Bot
              </button>

              <div className="flex flex-col gap-2 overflow-y-auto">
                {bots.map(bot => (
                  <button
                    key={bot.id}
                    onClick={() => setSelectedBotId(bot.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm truncate transition-all \${selectedBotId === bot.id ? 'bg-white/10 text-white border border-white/20' : 'text-neutral-400 hover:bg-white/5 border border-transparent'}`}
                  >
                    {bot.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-8 pl-4">
              {/* Center Column */}
              <div className="flex-1 max-w-2xl flex flex-col overflow-y-auto pr-4 space-y-8">
                {!selectedBotId ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-semibold tracking-tight text-white">Create a new Bot</h2>
                      <p className="text-neutral-400 text-sm">Configure your custom AI assistant and upload knowledge sources.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col gap-6 relative overflow-hidden">
                      <div className="space-y-4 relative z-10">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider">Bot Name</label>
                          <input type="text" value={botName} onChange={e => setBotName(e.target.value)} placeholder="e.g. Sales Bot" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider">Description</label>
                          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this bot do?" rows={3} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" />
                        </div>
                        <div className="space-y-3 pt-4 border-t border-white/10">
                          <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider">Knowledge Sources</label>
                          <div className="space-y-3">
                            <input type="file" accept=".pdf,.csv,.txt" multiple className="hidden" ref={fileInputRef} onChange={(e) => { if (e.target.files?.length) setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]) }} />
                            <button onClick={() => fileInputRef.current?.click()} className="w-full flex justify-center p-4 rounded-xl border border-dashed border-white/20 hover:border-indigo-500/50 text-neutral-400">
                              <span className="text-sm font-medium">{files.length > 0 ? `${files.length} file(s) selected` : 'Click to Upload Multiple Files'}</span>
                            </button>
                            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Provide an optional Web URL to scrape" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner" />
                          </div>
                        </div>
                      </div>
                      {statusMsg && <div className={`text-xs font-medium ${statusMsg.includes('error') || statusMsg.includes('Failed') || statusMsg.includes('exists') ? 'text-red-400' : 'text-indigo-400'}`}>{statusMsg}</div>}
                      <button onClick={handleCreateBot} disabled={isTraining || !botName} className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                        {isTraining ? 'Training...' : 'Create Bot'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-semibold tracking-tight text-white">{activeBot?.name}</h2>
                      <p className="text-neutral-400 mt-1">{activeBot?.description || "No description provided."}</p>
                    </div>

                    <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-sm">
                      <p className="text-xs text-indigo-300 uppercase font-semibold tracking-wider mb-2">Integration Code Snippet</p>
                      <div className="bg-black/50 border border-indigo-500/20 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-xs font-mono text-indigo-100">
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

                    {/* Chat History View */}
                    <div className="pt-4 border-t border-white/10">
                      <h3 className="text-sm font-semibold text-neutral-300 mb-4">Past Conversations</h3>
                      {chatHistory.length === 0 ? (
                        <p className="text-xs text-neutral-500 italic">No chat history available for this bot.</p>
                      ) : (
                        <div className="space-y-4">
                          {chatHistory.map((h, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
                              <div className="text-sm font-medium text-indigo-300">Q: {h.user_query}</div>
                              <div className="text-sm text-neutral-300 whitespace-pre-wrap">{h.bot_response}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Demo Widget */}
              <div className="w-[400px] h-[75vh] flex-shrink-0">
                <div className="h-full rounded-3xl border border-white/10 bg-black/40 relative overflow-hidden flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-black/50 to-purple-950/20 pointer-events-none" />
                  <div className="relative z-10 w-full h-full bg-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden shadow-indigo-500/10 flex flex-col items-center justify-center">
                    {selectedBotId ? (
                      <iframe src={`/widget?botId=${selectedBotId}&apiKey=${apiKey}`} className="w-full h-full border-none rounded-2xl bg-neutral-900" />
                    ) : (
                      <div className="text-neutral-500 text-sm text-center px-8">
                        <div className="w-12 h-12 rounded-full border border-white/10 mx-auto mb-4 flex items-center justify-center text-xl">🤖</div>
                        Select a bot or create a new one to test it here.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div >
  );
}
