import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Sparkles, Play, Camera, Film, Layers, CheckCircle } from 'lucide-react';
import { usePhotoboothStore } from '../store/usePhotoboothStore';
import { StoryboardViewer } from './StoryboardViewer';

export function VideoGuideStudio() {
  const [themeInput, setThemeInput] = useState('Fashion Walk & Turn');
  const [platform, setPlatform] = useState('TikTok');
  const [loading, setLoading] = useState(false);
  const [storyboardData, setStoryboardData] = useState(null);

  const fetchStoryboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/storyboard/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: themeInput,
          target_platform: platform,
          duration: 15
        })
      });
      if (res.ok) {
        const data = await res.json();
        setStoryboardData(data);
      } else {
        throw new Error('API server returned error status');
      }
    } catch (err) {
      console.warn('Backend API offline, using local fallback generator:', err);
      // Fallback local mock storyboard generator
      setStoryboardData({
        storyboard_id: 'sb_local_01',
        title: `Kịch Bản Video Ngắn: ${themeInput}`,
        concept_summary: `Hướng dẫn thực hành các góc quay và chuyển động cho nền tảng ${platform} (15 giây).`,
        recommended_music_vibe: 'Lo-Fi Chill Hop / Fashion Beat',
        shots: [
          {
            shot_id: 1,
            title: 'Bước đi tự nhiên進 lại gần camera',
            camera_angle: 'Đặt điện thoại góc 0.5x tầm ngực',
            pose_action: 'Bước 3-4 bước chậm rãi, tay vuốt nhẹ tóc',
            duration_sec: 4,
            ai_guidance_tip: 'AI nhận diện chuyển động bước đi. Giữ vai thẳng và nhìn vào góc máy.'
          },
          {
            shot_id: 2,
            title: 'Xoay người 360° khoe bộ trang phục',
            camera_angle: 'Máy ngang tầm mắt',
            pose_action: 'Xoay 1 vòng 360 độ từ tốn để quay chi tiết áo & quần',
            duration_sec: 5,
            ai_guidance_tip: 'AI nhắc nhở duy trì khoảng cách cố định với ống kính.'
          },
          {
            shot_id: 3,
            title: 'Ngoảnh mặt lại thần thái',
            camera_angle: 'Góc nghiêng 45°',
            pose_action: 'Ngoảnh mặt chậm qua vai nhìn camera smile',
            duration_sec: 3,
            ai_guidance_tip: 'AI cảnh báo giữ góc nghiêng thần thánh.'
          },
          {
            shot_id: 4,
            title: 'Pose kết V-Sign nháy mắt',
            camera_angle: 'Cận cảnh 1:1',
            pose_action: 'Đưa ngón tay nháy mắt nhẹ kết thúc video',
            duration_sec: 3,
            ai_guidance_tip: 'AI chấm điểm hoàn thành 95%.'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            AI Storyboard & Hướng Dẫn Quay Video Ngắn
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Tạo kịch bản quay theo từng phân cảnh (Shot-by-shot) cho TikTok và Reels kèm chỉ dẫn góc máy AI.
          </p>
        </div>
      </div>

      {/* Generator Control Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Chủ đề & Phong cách Video:</label>
            <select
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
              className="bg-slate-900/90 text-slate-100 text-sm rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-400"
            >
              <option value="Fashion Walk & Turn">Fashion Walk & Outfit Check (Bước đi & Xoay 360°)</option>
              <option value="Travel Vlog Scenic">Travel Vlog (Cảnh nền du lịch & Ngoảnh mặt nghệ thuật)</option>
              <option value="Streetwear Cool">Y2K Streetwear & Attitude (Phong cách dạo phố)</option>
              <option value="Couple Vibe">Couple Cute Moments (Dành cho cặp đôi)</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Nền tảng xuất bản:</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="bg-slate-900/90 text-slate-100 text-sm rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-400"
            >
              <option value="TikTok">TikTok (Tỷ lệ 9:16)</option>
              <option value="Instagram Reels">Instagram Reels (9:16)</option>
              <option value="YouTube Shorts">YouTube Shorts</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              onClick={fetchStoryboard}
              disabled={loading}
              className="glass-button w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> {loading ? 'Đang AI Sinh Storyboard...' : 'Sinh Kịch Bản AI'}
            </button>
          </div>
        </div>
      </div>

      {/* Storyboard Render View */}
      {storyboardData ? (
        <StoryboardViewer storyboard={storyboardData} />
      ) : (
        <div className="glass-card p-12 rounded-3xl border border-white/10 text-center flex flex-col items-center justify-center text-slate-400">
          <Film className="w-12 h-12 text-purple-400/60 mb-3 animate-pulse" />
          <h3 className="text-lg font-bold font-outfit text-slate-200 mb-1">
            Chưa có Kịch bản Storyboard nào
          </h3>
          <p className="text-xs max-w-md">
            Hãy chọn chủ đề và bấm <strong className="text-purple-300">"Sinh Kịch Bản AI"</strong> để AI tự động lên danh sách phân cảnh quay và chỉ dẫn góc máy.
          </p>
        </div>
      )}
    </div>
  );
}
