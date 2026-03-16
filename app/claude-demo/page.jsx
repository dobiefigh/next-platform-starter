'use client';

import { useState, useRef, useEffect } from 'react';

const MODES = [
    { id: 'chat', label: 'Chat', icon: '💬', description: 'Ask anything' },
    { id: 'code', label: 'Code', icon: '💻', description: 'Generate & explain code' },
    { id: 'creative', label: 'Creative', icon: '✨', description: 'Writing & storytelling' }
];

const EXAMPLE_PROMPTS = {
    chat: [
        'Explain how the internet works in simple terms',
        'What are 3 tips for being more productive?',
        'What is the difference between AI and machine learning?'
    ],
    code: [
        'Write a React hook that fetches data with loading and error states',
        'Explain how async/await works in JavaScript',
        'Write a Python function to find all prime numbers up to n'
    ],
    creative: [
        'Write a short story about a robot discovering music for the first time',
        'Write a haiku about software engineering',
        'Describe a futuristic city in 3 vivid sentences'
    ]
};

export default function ClaudeDemo() {
    const [mode, setMode] = useState('chat');
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const textareaRef = useRef(null);
    const responseRef = useRef(null);

    useEffect(() => {
        if (responseRef.current && isLoading) {
            responseRef.current.scrollTop = responseRef.current.scrollHeight;
        }
    }, [response, isLoading]);

    async function handleSubmit(e) {
        e?.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError('');
        setResponse('');

        try {
            const res = await fetch('/claude-demo/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt.trim(), mode })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Something went wrong');
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                setResponse((prev) => prev + decoder.decode(value, { stream: true }));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    function handleExampleClick(example) {
        setPrompt(example);
        textareaRef.current?.focus();
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
        }
    }

    function renderResponse(text) {
        const lines = text.split('\n');
        const elements = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            if (line.startsWith('```')) {
                const lang = line.slice(3).trim();
                const codeLines = [];
                i++;
                while (i < lines.length && !lines[i].startsWith('```')) {
                    codeLines.push(lines[i]);
                    i++;
                }
                elements.push(
                    <div key={i} className="my-3">
                        {lang && (
                            <div className="bg-neutral-700 text-neutral-300 text-xs px-3 py-1 rounded-t font-mono">
                                {lang}
                            </div>
                        )}
                        <pre className={`bg-neutral-900 p-4 overflow-x-auto text-sm font-mono text-yellow-200 ${lang ? 'rounded-b' : 'rounded'}`}>
                            <code>{codeLines.join('\n')}</code>
                        </pre>
                    </div>
                );
            } else if (line.startsWith('### ')) {
                elements.push(<h3 key={i} className="text-lg font-bold mt-4 mb-2 text-white">{line.slice(4)}</h3>);
            } else if (line.startsWith('## ')) {
                elements.push(<h2 key={i} className="text-xl font-bold mt-5 mb-2 text-white">{line.slice(3)}</h2>);
            } else if (line.startsWith('# ')) {
                elements.push(<h1 key={i} className="text-2xl font-bold mt-6 mb-3 text-white">{line.slice(2)}</h1>);
            } else if (line.startsWith('- ') || line.startsWith('* ')) {
                elements.push(
                    <li key={i} className="ml-4 list-disc">{renderInline(line.slice(2))}</li>
                );
            } else if (/^\d+\. /.test(line)) {
                elements.push(
                    <li key={i} className="ml-4 list-decimal">{renderInline(line.replace(/^\d+\. /, ''))}</li>
                );
            } else if (line === '') {
                elements.push(<br key={i} />);
            } else {
                elements.push(<p key={i} className="my-1">{renderInline(line)}</p>);
            }

            i++;
        }

        return elements;
    }

    function renderInline(text) {
        const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={i} className="px-1 py-0.5 font-mono rounded bg-neutral-900 text-yellow-200 text-sm">{part.slice(1, -1)}</code>;
            }
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={i}>{part.slice(1, -1)}</em>;
            }
            return part;
        });
    }

    return (
        <div className="flex flex-col gap-8">
            <section>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold text-lg">
                        C
                    </div>
                    <div>
                        <h1 className="mb-0">Claude AI Demo</h1>
                        <p className="text-neutral-400 text-sm">Powered by Claude Opus 4.6 with adaptive thinking</p>
                    </div>
                </div>
                <p className="text-lg text-neutral-300">
                    Experience Claude's capabilities — chat, code generation, and creative writing — all with real-time streaming.
                </p>
            </section>

            <div className="flex flex-col gap-6">
                {/* Mode selector */}
                <div className="flex gap-2 flex-wrap">
                    {MODES.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => { setMode(m.id); setResponse(''); setError(''); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                mode === m.id
                                    ? 'bg-primary text-primary-content'
                                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                            }`}
                        >
                            <span>{m.icon}</span>
                            <span>{m.label}</span>
                            <span className="hidden sm:inline text-xs opacity-70">— {m.description}</span>
                        </button>
                    ))}
                </div>

                {/* Example prompts */}
                <div className="flex flex-col gap-2">
                    <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        {EXAMPLE_PROMPTS[mode].map((example) => (
                            <button
                                key={example}
                                onClick={() => handleExampleClick(example)}
                                className="text-sm px-3 py-1.5 rounded border border-neutral-700 text-neutral-300 hover:border-primary hover:text-primary transition-colors text-left"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Ask Claude anything... (${MODES.find(m => m.id === mode)?.description})`}
                            rows={4}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-primary resize-none font-sans text-sm"
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-neutral-500">
                            ⌘+Enter to send
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => { setPrompt(''); setResponse(''); setError(''); }}
                            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                        >
                            Clear
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                            className="btn px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>Send to Claude →</>
                            )}
                        </button>
                    </div>
                </form>

                {/* Response area */}
                {(response || error || isLoading) && (
                    <div className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-700 bg-neutral-900">
                            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-primary animate-pulse' : response ? 'bg-green-400' : 'bg-red-400'}`} />
                            <span className="text-xs text-neutral-400 font-medium">
                                {isLoading ? 'Claude is thinking...' : response ? 'Response' : 'Error'}
                            </span>
                        </div>
                        <div
                            ref={responseRef}
                            className="p-5 max-h-[500px] overflow-y-auto text-sm text-neutral-200 leading-relaxed"
                        >
                            {error ? (
                                <div className="text-red-400 flex items-start gap-2">
                                    <span>⚠️</span>
                                    <span>{error}</span>
                                </div>
                            ) : (
                                <div>{renderResponse(response)}</div>
                            )}
                            {isLoading && !response && (
                                <div className="flex gap-1 items-center text-neutral-500">
                                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Feature cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                {[
                    { icon: '🧠', title: 'Adaptive Thinking', desc: 'Claude dynamically decides when and how deeply to reason about your question.' },
                    { icon: '⚡', title: 'Real-time Streaming', desc: 'Responses stream token-by-token so you see Claude\'s answer as it\'s generated.' },
                    { icon: '🎯', title: 'Multi-modal Modes', desc: 'Switch between chat, code generation, and creative writing with one click.' }
                ].map((card) => (
                    <div key={card.title} className="bg-neutral-800 rounded-lg p-5 border border-neutral-700">
                        <div className="text-2xl mb-2">{card.icon}</div>
                        <h3 className="text-base font-semibold mb-1 text-white">{card.title}</h3>
                        <p className="text-sm text-neutral-400">{card.desc}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}
