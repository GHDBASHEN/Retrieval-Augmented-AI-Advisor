'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

function ChatInterface() {
    const searchParams = useSearchParams();
    const botId = searchParams.get('botId') || '1';
    const apiKey = searchParams.get('apiKey') || '';

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I am your custom AI assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
        setIsTyping(true);

        try {
            const response = await api.chat(botId, userMessage, apiKey);
            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: data.bot_response
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "Sorry, I encountered an error communicating with the server."
                }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Sorry, I couldn't connect to the server."
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-neutral-900 font-sans shadow-2xl overflow-hidden text-neutral-100">
            {/* Widget Header */}
            <div className="px-4 py-3 bg-neutral-950 border-b border-white/10 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <div className="w-2h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-semibold tracking-wide">Custom Bot</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                            : 'bg-white/5 border border-white/10 text-neutral-200 rounded-tl-sm shadow-sm'
                            }`}>
                            <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" />
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce [animation-delay:-.15s]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce [animation-delay:-.3s]" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 bg-neutral-950 border-t border-white/10">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder:text-neutral-600 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-2.5 aspect-square flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ChatWidget() {
    return (
        <Suspense fallback={<div className="text-white p-4">Loading widget...</div>}>
            <ChatInterface />
        </Suspense>
    );
}
