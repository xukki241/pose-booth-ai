import React from 'react';
import { motion } from 'framer-motion';
import { Video, Music, Clock, Camera, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export function StoryboardViewer({ storyboard }) {
  if (!storyboard) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-purple-500/30 uppercase">
              AI Storyboard Plan
            </span>
            <h2 className="text-xl font-bold font-outfit text-slate-100">{storyboard.title}</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">{storyboard.concept_summary}</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-semibold text-pink-300">
          <Music className="w-4 h-4 text-pink-400" />
          <span>Vibe Nhạc: {storyboard.recommended_music_vibe}</span>
        </div>
      </div>

      {/* Shot-by-shot timeline list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storyboard.shots.map((shot, idx) => (
          <motion.div
            key={shot.shot_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between gap-3 relative overflow-hidden"
          >
            {/* Top header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold font-outfit text-xs flex items-center justify-center">
                  #{shot.shot_id}
                </span>
                <h3 className="text-sm font-bold font-outfit text-slate-200">{shot.title}</h3>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold bg-slate-900/60 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{shot.duration_sec}s</span>
              </div>
            </div>

            {/* Camera angle & action breakdown */}
            <div className="space-y-2 bg-slate-900/40 p-3 rounded-xl border border-white/5 text-xs">
              <div className="flex items-start gap-2">
                <Camera className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-300">Góc đặt máy:</strong>{' '}
                  <span className="text-slate-200">{shot.camera_angle}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Video className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-300">Hành động tạo dáng:</strong>{' '}
                  <span className="text-slate-200">{shot.pose_action}</span>
                </div>
              </div>
            </div>

            {/* AI Real-time Tip Banner */}
            <div className="bg-purple-500/10 border border-purple-500/30 p-2.5 rounded-xl flex items-start gap-2 text-[11px] text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Chỉ dẫn AI:</strong> {shot.ai_guidance_tip}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
