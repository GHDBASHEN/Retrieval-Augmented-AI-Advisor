'use client';
import React, { useState, useRef } from 'react';

export default function Home() {
  const [botName, setBotName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [createdBotId, setCreatedBotId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRegister = async () => {
    if (!email) return;
    try {
      const res = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.api_key);
        setIsLoggedIn(true);
      } else {
        alert("Email might already be registered. Try a different one for this demo.");
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
      // 2. Create Bot
      const botRes = await fetch('http://localhost:8000/bots/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ name: botName, description })
      });
      const botData = await botRes.json();
      const botId = botData.id;
      setCreatedBotId(botId);

      // 3. Upload files if exist
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

      // 4. Ingest URL if exists
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

      setStatusMsg('Bot created and trained successfully! You can now test the widget.');
    } catch (err) {
      console.error(err);
      setStatusMsg('An error occurred during training.');
    }
    setIsTraining(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              R
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-white drop-shadow-sm">RAG as a Service</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 space-y-6">
          {!isLoggedIn ? (
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-32 bg-indigo-500/10 blur-[60px] pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Get your API Key</h2>
                  <p className="text-neutral-400 text-sm mt-1">Register an email to get an API key and start building bots.</p>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-neutral-600 shadow-inner"
                />
                <button
                  onClick={handleRegister}
                  disabled={!email}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  Register & Get Key
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Show API Key */}
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-sm">
                <p className="text-xs text-indigo-300 uppercase font-semibold tracking-wider mb-2">Your Secret API Key</p>
                <div className="bg-black/50 border border-indigo-500/20 rounded-lg p-3 overflow-x-auto">
                  <code className="text-sm font-mono text-indigo-100 break-all">{apiKey}</code>
                </div>
                <p className="text-xs text-neutral-400 mt-2">Pass this in the <code>X-API-Key</code> header to authenticate your requests.</p>
              </div>

              {createdBotId && (
                <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-sm">
                  <p className="text-xs text-indigo-300 uppercase font-semibold tracking-wider mb-2">Integration Code Snippet</p>
                  <div className="bg-black/50 border border-indigo-500/20 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs font-mono text-indigo-100">
                      {`const response = await fetch('http://localhost:8000/conversations/${createdBotId}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': '${apiKey}'
  },
  body: JSON.stringify({ user_query: 'Hello bot' })
});
const data = await response.json();
console.log(data.bot_response);`}
                    </pre>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight text-white">Create a new Bot</h2>
                <p className="text-neutral-400 text-sm">Configure your custom AI assistant and upload knowledge sources.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col gap-6 relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-32 bg-indigo-500/10 blur-[60px] pointer-events-none" />

                {/* Form Fields */}
                <div className="space-y-4 relative z-10">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider">Bot Name</label>
                    <input
                      type="text"
                      value={botName}
                      onChange={e => setBotName(e.target.value)}
                      placeholder="e.g. Customer Support Bot"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-neutral-600 shadow-inner"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider">Description</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="What does this bot do?"
                      rows={3}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-neutral-600 shadow-inner resize-none"
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider">Knowledge Sources</label>

                    {/* Upload Options */}
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept=".pdf,.csv,.txt"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
                          }
                        }}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-neutral-400 group"
                      >
                        <span className="text-sm font-medium">
                          {files.length > 0 ? `${files.length} file(s) selected (Click to add more)` : 'Click to Upload Multiple Files'}
                        </span>
                        {files.length > 0 && (
                          <span className="text-xs text-indigo-400 mt-1">
                            {files.map(f => f.name).join(', ')}
                          </span>
                        )}
                      </button>

                      <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Provide an optional Web URL to scrape"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-neutral-600 shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {statusMsg && (
                  <div className="text-xs text-indigo-400 font-medium">
                    {statusMsg}
                  </div>
                )}

                <button
                  onClick={handleCreateBot}
                  disabled={isTraining || !botName}
                  className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  <span>{isTraining ? 'Training...' : 'Create and Train Bot'}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Preview/Widget Demo */}
        <div className="lg:col-span-7 lg:pl-8 flex flex-col h-[70vh]">
          <div className="flex-1 rounded-3xl border border-white/10 bg-black/40 relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-black/50 to-purple-950/20 pointer-events-none" />

            <div className="relative z-10 w-full max-w-[400px] h-full bg-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden shadow-indigo-500/10 flex flex-col items-center justify-center">
              {createdBotId ? (
                <iframe src={`/widget?botId=${createdBotId}&apiKey=${apiKey}`} className="w-full h-full border-none rounded-2xl" />
              ) : (
                <div className="text-neutral-500 text-sm text-center px-8">
                  <div className="w-12 h-12 rounded-full border border-white/10 mx-auto mb-4 flex items-center justify-center">
                    🤖
                  </div>
                  Create and train a bot to test it in this widget.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
