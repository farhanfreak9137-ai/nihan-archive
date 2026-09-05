import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Key,
  AlertCircle,
  Loader2,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import { DailyStats, Message } from '../../types/archive';

interface AiDaySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  stats?: DailyStats;
  messages: Message[];
}

export const AiDaySummaryModal: React.FC<AiDaySummaryModalProps> = ({
  isOpen,
  onClose,
  date,
  stats,
  messages,
}) => {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('nila_gemini_api_key') || '';
  });
  const [isEditingKey, setIsEditingKey] = useState(!apiKey);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('nila_gemini_api_key', apiKey.trim());
      setIsEditingKey(false);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('nila_gemini_api_key');
    setApiKey('');
    setIsEditingKey(true);
    setSummaryText(null);
  };

  const generateSummary = async () => {
    if (!apiKey.trim()) {
      setIsEditingKey(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Extract a privacy-safe representative sample (up to 30 messages spread throughout the day)
      // to keep prompt small, fast, and private
      const step = Math.max(1, Math.floor(messages.length / 30));
      const sampledMessages = [];
      for (let i = 0; i < messages.length && sampledMessages.length < 30; i += step) {
        const m = messages[i];
        if (m.content && m.content.length > 2) {
          sampledMessages.push(
            `[${m.time}] ${m.senderDisplay}: ${m.content.slice(0, 150)}`
          );
        }
      }

      const prompt = `You are a respectful, neutral conversation analyst examining an archive for date ${date}.
ARCHIVE FACTS for this day:
- Total messages: ${stats?.totalMessages || messages.length}
- NILA: ${stats?.nilaMessages || 0} (${stats?.nilaPercentage || 50}%)
- FARHAN: ${stats?.farhanMessages || 0} (${stats?.farhanPercentage || 50}%)
- Shares: ${stats?.shares || 0}
- Reactions: ${stats?.reactions || 0}
- Active duration: ${stats ? Math.round(stats.activeDurationMinutes / 60) : 0} hours

Here is a privacy-scoped snippet sample of messages from this day:
${sampledMessages.join('\n')}

Provide:
1. A concise, neutral 2-3 paragraph summary of the day's conversational rhythm, topics discussed, and interactions.
2. A bullet list of 3-5 major topics/themes identified.
Keep your analysis objective and factual. Do not fabricate emotional conclusions.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 600,
            },
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Gemini API call failed');
      }

      const resData = await response.json();
      const generatedText =
        resData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

      setSummaryText(generatedText);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI summary');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-[#12161c] border border-[#21262d] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#21262d] bg-[#0b0d10]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-lg text-white font-medium">
                  AI Day Summary
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Opt-In Gemini Layer
                </span>
              </div>
              <p className="text-xs text-[#8b949e] font-mono">{date}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#161b22] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Privacy & Factual Disclaimer */}
          <div className="p-3.5 rounded-xl bg-[#0b0d10] border border-[#21262d] flex items-start gap-3 text-xs text-[#8b949e]">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-white font-medium">Privacy-First Architecture</p>
              <p className="text-[11px] leading-relaxed">
                Your archive is never sent in bulk. AI requests are restricted solely to a small, sampled context of the selected day. Your API key is stored locally in your browser only.
              </p>
            </div>
          </div>

          {/* API Key Management */}
          {isEditingKey ? (
            <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d] space-y-3">
              <label className="text-xs font-mono text-[#8b949e] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>Enter Google Gemini API Key</span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 rounded-lg bg-[#0b0d10] border border-[#21262d] text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
              <div className="flex items-center justify-between text-[11px] text-[#8b949e]">
                <span>Get a free key from Google AI Studio</span>
                <button
                  onClick={handleSaveKey}
                  disabled={!apiKey.trim()}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-mono text-xs"
                >
                  Save Key
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#161b22] border border-[#21262d] text-xs">
              <div className="flex items-center gap-2 text-[#8b949e] font-mono">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Gemini API Key configured</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingKey(true)}
                  className="text-xs text-purple-400 hover:underline"
                >
                  Change
                </button>
                <span className="text-[#30363d]">•</span>
                <button
                  onClick={handleClearKey}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results: Facts vs AI Summary */}
          {summaryText && (
            <div className="space-y-4 pt-2">
              {/* Archive Facts Header */}
              <div className="p-3 rounded-xl bg-[#0b0d10] border border-[#21262d] space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
                  Verified Archive Facts
                </div>
                <div className="text-xs text-[#8b949e] font-mono">
                  {stats?.totalMessages.toLocaleString()} Messages • {stats?.nilaMessages} from NILA • {stats?.farhanMessages} from FARHAN • {stats?.shares} Shares • {stats?.reactions} Reactions
                </div>
              </div>

              {/* AI Generated Analysis */}
              <div className="p-4 rounded-xl bg-[#161b22] border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-purple-300 font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Generated Analysis</span>
                </div>
                <div className="text-xs leading-relaxed text-[#f0f6fc] whitespace-pre-wrap selection:bg-purple-500/30">
                  {summaryText}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#21262d] bg-[#0b0d10] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-[#8b949e] hover:text-white"
          >
            Close
          </button>

          <button
            onClick={generateSummary}
            disabled={isLoading || !apiKey.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-mono transition-colors shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Day...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{summaryText ? 'Regenerate Analysis' : 'Generate Day Summary'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
