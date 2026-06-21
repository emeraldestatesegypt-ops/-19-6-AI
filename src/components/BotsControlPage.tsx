import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/apiClient';
import { motion } from 'motion/react';
import {
  Bot, RefreshCw, Play, Square, RotateCcw, Zap, Power, PowerOff,
  Activity, Clock, AlertTriangle, CheckCircle
} from 'lucide-react';

interface Bot {
  id: string;
  status: 'active' | 'syncing' | 'error' | 'idle' | 'offline';
  lastPulse?: string;
  lastError?: string;
  enabled?: boolean;
  lastCommand?: string;
  lastCommandAt?: string;
  config?: Record<string, any>;
  stats?: Record<string, any>;
}

interface BotsControlPageProps {
  T: (key: string) => string;
  isAr?: boolean;
}

const STATUS_CONFIG = {
  active: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Online', icon: CheckCircle },
  syncing: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Running', icon: Activity },
  error: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Error', icon: AlertTriangle },
  idle: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Idle', icon: Clock },
  offline: { color: 'text-slate-500', bg: 'bg-slate-700/50', label: 'Offline', icon: PowerOff },
};

const BOT_DESCRIPTIONS: Record<string, { en: string; ar: string; emoji: string }> = {
  'whatsapp-scraper': {
    en: 'Live broker-group lead ingestion bot',
    ar: 'بوت استخراج العملاء من مجموعات الوسلاط',
    emoji: '📲',
  },
  'n8n-orchestrator': {
    en: 'Workflow automation engine (Docker, port 5678)',
    ar: 'محرك أتمتة سير العمل',
    emoji: '⚡',
  },
  'scribe-agent': {
    en: 'AI listing normalization (S1-S2)',
    ar: 'تطبيع قوائم الذكاء الاصطناعي',
    emoji: '✍️',
  },
  'curator-agent': {
    en: 'AI portfolio curation (S3-S5)',
    ar: 'تنسيق محفظة الذكاء الاصطناعي',
    emoji: '🎨',
  },
  'closer-agent': {
    en: 'Fail-safe lead follow-up (Stage 9)',
    ar: 'متابعة العملاء الآمنة',
    emoji: '🤝',
  },
  'matchmaker-agent': {
    en: 'Lead-to-property matching',
    ar: 'مطابقة العملاء بالعقارات',
    emoji: '💘',
  },
};

export default function BotsControlPage({ T, isAr = false }: BotsControlPageProps) {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { success, bots, error: apiError } = await api.get<{ success: boolean; bots: Bot[]; error?: string }>(
        '/api/admin/bots'
      );
      if (!success) throw new Error(apiError || 'Failed to fetch');
      setBots(bots || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBots();
    // Auto-refresh every 30s
    const interval = setInterval(fetchBots, 30000);
    return () => clearInterval(interval);
  }, [fetchBots]);

  const sendCommand = async (botId: string, command: string) => {
    setActionLoading(`${botId}:${command}`);
    try {
      await api.post('/api/admin/bots', { botId, command });
      // Immediate refresh to show the pending command
      setTimeout(fetchBots, 500);
    } catch (err: any) {
      alert(`Command failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="text-cyan-400" size={24} />
          <div>
            <h2 className="text-lg font-bold text-white">
              {isAr ? 'مركز التحكم بالبوتات' : 'Bots Control Center'}
            </h2>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'مراقبة وتحكم بالبوتات والوكلاء الآليين'
                : 'Monitor and control background bots and AI agents'}
            </p>
          </div>
        </div>
        <button
          onClick={fetchBots}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {isAr ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      <p className="text-[10px] text-slate-500">
        {isAr ? 'يتحدث كل 30 ثانية' : 'Auto-refreshes every 30s'}
      </p>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Bots grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading && bots.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500">
            <RefreshCw className="animate-spin mx-auto mb-2" size={20} />
            {isAr ? 'جارٍ التحميل…' : 'Loading...'}
          </div>
        ) : (
          bots.map((bot) => {
            const config = STATUS_CONFIG[bot.status] || STATUS_CONFIG.offline;
            const StatusIcon = config.icon;
            const desc = BOT_DESCRIPTIONS[bot.id] || { en: bot.id, ar: bot.id, emoji: '🤖' };
            const enabled = bot.enabled !== false;

            return (
              <motion.div
                key={bot.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-slate-900 border rounded-lg p-4 ${
                  bot.status === 'error' ? 'border-red-500/40' : 'border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{desc.emoji}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{bot.id}</h3>
                      <p className="text-[10px] text-slate-500">
                        {isAr ? desc.ar : desc.en}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${config.bg}`}>
                    <StatusIcon size={10} className={config.color} />
                    <span className={`text-[10px] font-bold uppercase ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-[10px] text-slate-500 space-y-1 mb-3">
                  {bot.lastPulse && (
                    <div>
                      <span className="text-slate-600">{isAr ? 'آخر نبضة:' : 'Last pulse:'}</span>{' '}
                      <span className="text-slate-400">
                        {new Date(bot.lastPulse).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {bot.lastError && (
                    <div className="text-red-400/80">
                      <span className="text-red-500">{isAr ? 'خطأ:' : 'Error:'}</span>{' '}
                      {bot.lastError.slice(0, 80)}
                    </div>
                  )}
                  {bot.stats && Object.keys(bot.stats).length > 0 && (
                    <div className="font-mono text-slate-400">
                      {Object.entries(bot.stats).slice(0, 3).map(([k, v]) => (
                        <div key={k}>{k}: {String(v)}</div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => sendCommand(bot.id, 'run_now')}
                    disabled={actionLoading === `${bot.id}:run_now` || !enabled}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-[10px] font-bold uppercase tracking-wider disabled:opacity-30 transition"
                    title="Run now"
                  >
                    <Zap size={10} />
                    {isAr ? 'تشغيل' : 'Run'}
                  </button>
                  <button
                    onClick={() => sendCommand(bot.id, 'restart')}
                    disabled={actionLoading === `${bot.id}:restart`}
                    className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-[10px] font-bold uppercase tracking-wider transition"
                    title="Restart"
                  >
                    <RotateCcw size={10} />
                    {isAr ? 'إعادة' : 'Restart'}
                  </button>
                  {enabled ? (
                    <button
                      onClick={() => sendCommand(bot.id, 'disable')}
                      disabled={actionLoading === `${bot.id}:disable`}
                      className="flex items-center gap-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-[10px] font-bold uppercase tracking-wider transition"
                      title="Disable"
                    >
                      <PowerOff size={10} />
                      {isAr ? 'إيقاف' : 'Disable'}
                    </button>
                  ) : (
                    <button
                      onClick={() => sendCommand(bot.id, 'enable')}
                      disabled={actionLoading === `${bot.id}:enable`}
                      className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-[10px] font-bold uppercase tracking-wider transition"
                      title="Enable"
                    >
                      <Power size={10} />
                      {isAr ? 'تفعيل' : 'Enable'}
                    </button>
                  )}
                </div>

                {/* Last command */}
                {bot.lastCommand && (
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                    {isAr ? 'آخر أمر:' : 'Last cmd:'}{' '}
                    <span className="font-mono text-cyan-400">{bot.lastCommand}</span>
                    {bot.lastCommandAt && (
                      <span className="text-slate-600 ml-1">
                        {new Date(bot.lastCommandAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
