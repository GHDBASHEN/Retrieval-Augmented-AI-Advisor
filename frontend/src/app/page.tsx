import React from 'react';

export default function Home() {
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
          <div className="flex gap-4">
            <button className="text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-200">Documentation</button>
            <button className="text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-200 border border-white/5">Sign In</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 space-y-6">
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
                  placeholder="e.g. Customer Support Bot"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-neutral-600 shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="What does this bot do?"
                  rows={3}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-neutral-600 shadow-inner resize-none"
                />
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider">Knowledge Sources</label>

                {/* Upload Options */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-neutral-400 group">
                    <svg className="w-6 h-6 mb-2 text-neutral-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium">Upload PDF/CSV</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-neutral-400 group">
                    <svg className="w-6 h-6 mb-2 text-neutral-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-sm font-medium">Add Website URL</span>
                  </button>
                </div>
              </div>
            </div>

            <button className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
              <span>Create and Train Bot</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Column: Preview/Widget Demo */}
        <div className="lg:col-span-7 lg:pl-8 flex flex-col h-[70vh]">
          <div className="flex-1 rounded-3xl border border-white/10 bg-black/40 relative overflow-hidden flex items-center justify-center p-4">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-black/50 to-purple-950/20 pointer-events-none" />

            <div className="relative z-10 w-full max-w-[400px] h-full bg-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden shadow-indigo-500/10">
              <iframe src="/widget" className="w-full h-full border-none rounded-2xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
