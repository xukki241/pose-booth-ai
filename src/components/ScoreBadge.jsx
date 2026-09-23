import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export function ScoreBadge({ score = 0, feedback = '' }) {
  const isReady = score >= 75;
  const isMedium = score >= 50 && score < 75;

  const colorClass = isReady
    ? 'from-emerald-500 to-teal-400 text-emerald-300 border-emerald-500/40 glow-cyan'
    : isMedium
    ? 'from-amber-500 to-yellow-400 text-amber-300 border-amber-500/40'
    : 'from-rose-500 to-red-400 text-rose-300 border-rose-500/40';

  const badgeBg = isReady
    ? 'bg-emerald-500/20 text-emerald-300'
    : isMedium
    ? 'bg-amber-500/20 text-amber-300'
    : 'bg-rose-500/20 text-rose-300';

  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
      {/* Top score & status bar */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${badgeBg} border border-white/10`}>
            {isReady ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-pulse" />
            ) : (
              <Sparkles className="w-6 h-6 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
            )}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Điểm Khớp Dáng AI
            </div>
            <div className="text-sm font-medium text-slate-200 truncate max-w-[200px]">
              {isReady ? 'Sẵn sàng bấm máy!' : 'Đang chỉnh dáng...'}
            </div>
          </div>
        </div>

        {/* Big animated score display */}
        <div className="flex items-baseline gap-1">
          <motion.span
            key={score}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-4xl font-extrabold font-outfit bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}
          >
            {score}
          </motion.span>
          <span className="text-xs text-slate-400 font-semibold">/100</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5 border border-white/5">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Real-time Vietnamese Feedback Banner */}
      {feedback && (
        <motion.div
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card px-4 py-2.5 rounded-xl text-xs sm:text-sm text-center font-medium text-slate-200 border border-white/10 flex items-center justify-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>{feedback}</span>
        </motion.div>
      )}
    </div>
  );
}
