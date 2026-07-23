'use client';

import React, { useState, useEffect } from 'react';
import { Copy, QrCode, BarChart3, Sparkles, Link as LinkIcon, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LinkData {
  id: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  summary: string;
  createdAt: string;
}

const generateShortUrl = (url: string): string => {
  const hash = btoa(url).slice(0, 8).replace(/[^a-zA-Z0-9]/g, '');
  return `spark.link/${hash}`;
};

const mockAISummary = (url: string): string => {
  const summaries = [
    "This page discusses the latest advancements in AI technology and their impact on productivity.",
    "A comprehensive guide to building modern web applications with Next.js and Tailwind.",
    "Explore innovative startup ideas and tech trends for 2026.",
    "Detailed analysis of market trends in sustainable energy solutions."
  ];
  return summaries[Math.floor(Math.random() * summaries.length)];
};

export default function SparkLink() {
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState<LinkData[]>([]);
  const [selectedLink, setSelectedLink] = useState<LinkData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    const savedLinks = localStorage.getItem('sparkLinks');
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sparkLinks', JSON.stringify(links));
  }, [links]);

  const shortenUrl = async () => {
    if (!url) return;

    setIsLoading(true);
    const shortUrl = generateShortUrl(url);
    const summary = mockAISummary(url);

    const newLink: LinkData = {
      id: Date.now().toString(),
      originalUrl: url,
      shortUrl,
      clicks: Math.floor(Math.random() * 100) + 10,
      summary,
      createdAt: new Date().toISOString(),
    };

    setLinks(prev => [newLink, ...prev]);
    setSelectedLink(newLink);
    setUrl('');

    // Generate QR
    try {
      const qr = await import('qrcode');
      const dataUrl = await qr.toDataURL(`https://${shortUrl}`, { width: 300 });
      setQrCode(dataUrl);
    } catch (e) {
      console.error('QR error', e);
    }

    setIsLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Toast would be nice, but simple alert for demo
    alert('Copied to clipboard!');
  };

  const deleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
    if (selectedLink?.id === id) setSelectedLink(null);
  };

  const incrementClick = (id: string) => {
    setLinks(prev => prev.map(l => 
      l.id === id ? { ...l, clicks: l.clicks + 1 } : l
    ));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter">SparkLink</h1>
          </div>
          <nav className="flex gap-8 text-sm uppercase tracking-widest">
            <a href="#shorten" className="hover:text-violet-400 transition-colors">Shorten</a>
            <a href="#dashboard" className="hover:text-violet-400 transition-colors">Dashboard</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero / Shortener */}
        <section id="shorten" className="mb-20">
          <div className="text-center mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-bold tracking-tighter mb-4"
            >
              Shorten Smarter.<br />Analyze Deeper.
            </motion.h2>
            <p className="text-xl text-zinc-400 max-w-md mx-auto">AI-powered links with insights and analytics</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your long URL here..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-violet-500 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && shortenUrl()}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={shortenUrl}
                disabled={isLoading || !url}
                className="bg-white text-black px-10 rounded-2xl font-medium flex items-center gap-2 hover:bg-zinc-200 disabled:opacity-50"
              >
                {isLoading ? 'Forging...' : 'Spark It'}
              </motion.button>
            </div>
            <p className="text-center text-xs text-zinc-500 mt-3">Free • No sign up • Instant</p>
          </div>
        </section>

        {/* Results */}
        {selectedLink && (
          <section className="mb-20 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="text-sm text-zinc-400 mb-1">YOUR SHORT LINK</div>
                <div className="text-4xl font-mono tracking-tighter text-violet-400 break-all">{selectedLink.shortUrl}</div>
              </div>
              <button onClick={() => copyToClipboard(`https://${selectedLink.shortUrl}`)} className="flex items-center gap-2 text-sm hover:text-white text-zinc-400">
                <Copy className="w-4 h-4" /> Copy
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2"><QrCode className="w-5 h-5" /> QR Code</h3>
                {qrCode && <img src={qrCode} alt="QR" className="border border-zinc-700 rounded-2xl p-4 bg-white mx-auto" />}
                <button onClick={() => copyToClipboard(qrCode)} className="mt-4 text-sm text-zinc-400 hover:text-white">Download QR</button>
              </div>

              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5" /> AI Summary</h3>
                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 text-zinc-300 leading-relaxed">
                  {selectedLink.summary}
                </div>
                <button 
                  onClick={() => alert('In full version, this would regenerate with real AI!')}
                  className="mt-4 text-xs flex items-center gap-1 text-violet-400 hover:underline"
                >
                  <Sparkles className="w-3 h-3" /> Regenerate with AI
                </button>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-800 flex gap-4">
              <button 
                onClick={() => incrementClick(selectedLink.id)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
              >
                <BarChart3 className="w-5 h-5" /> Simulate Click ({selectedLink.clicks})
              </button>
              <button onClick={() => deleteLink(selectedLink.id)} className="flex items-center gap-2 px-8 text-red-400 hover:bg-red-950/50 rounded-2xl">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </section>
        )}

        {/* Dashboard */}
        <section id="dashboard" className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-bold tracking-tight">Your Links</h2>
            <div className="text-sm text-zinc-400">Total links: {links.length}</div>
          </div>

          {links.length === 0 ? (
            <div className="text-center py-20 text-zinc-400">
              No links yet. Shorten one above!
            </div>
          ) : (
            <div className="grid gap-4">
              {links.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-violet-500/50 group flex flex-col md:flex-row md:items-center gap-6 cursor-pointer"
                  onClick={() => setSelectedLink(link)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-violet-400 truncate">{link.shortUrl}</div>
                    <div className="text-zinc-400 text-sm truncate mt-1">{link.originalUrl}</div>
                  </div>
                  <div className="flex items-center gap-8 text-sm">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      {link.clicks} clicks
                    </div>
                    <div className="text-xs text-zinc-500">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteLink(link.id); }} className="opacity-0 group-hover:opacity-100 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-zinc-800 py-12 mt-20 text-center text-xs text-zinc-500">
        Built with ❤️ using Next.js • Max effort demo by Grok • Deployed on Vercel
      </footer>
    </div>
  );
}
