import { create } from 'zustand';

export const POSE_PRESETS = [
  {
    id: 'korean_vibe',
    name: 'Bốn Kiểu Hàn Quốc Cute',
    category: 'Korean Style',
    description: 'Bộ 4 dáng tự nhiên, siêu dễ thương dành cho cặp đôi hoặc chụp đơn.',
    poses: [
      { id: 'p1', name: 'Bắn Tim Nhỏ', tip: 'Nghiêng đầu nhẹ 15°, hai ngón tay tạo hình tim nhỏ sát má', targetScore: 80 },
      { id: 'p2', name: 'Má Phúng Phính', tip: 'Đưa 2 ngón trỏ ấn nhẹ 2 bên má, cười mỉm', targetScore: 80 },
      { id: 'p3', name: 'Che Một Mắt', tip: 'Đưa bàn tay xòe che nhẹ 1 bên mắt, mắt còn lại nháy nhẹ', targetScore: 75 },
      { id: 'p4', name: 'Tay Dưới Cằm (Wink)', tip: 'Đặt bàn tay xòe dưới cằm làm hoa, cười tươi', targetScore: 85 }
    ]
  },
  {
    id: 'cool_y2k',
    name: 'Phong Cách Y2K Cool Ngầu',
    category: 'Y2K Streetwear',
    description: 'Dáng chụp phá cách, thần thái sắc lạnh đậm chất Y2K.',
    poses: [
      { id: 'p5', name: 'Tay Vuốt Kính', tip: 'Đưa 1 tay vuốt gọng kính, ánh nhìn tự tin hướng thẳng camera', targetScore: 80 },
      { id: 'p6', name: 'Khoanh Tay Sắc Lạnh', tip: 'Khoanh 2 tay trước ngực, hạ cằm xuống 10°', targetScore: 80 },
      { id: 'p7', name: 'Giơ 2 Ngón Tay Chéo', tip: 'Đưa tay giơ chữ V sát mắt, nghiêng vai trái lên', targetScore: 75 },
      { id: 'p8', name: 'Nhìn Nhích Lên', tip: 'Đầu hơi ngửa ra sau 15°, ánh mắt nhìn xuống nhẹ', targetScore: 80 }
    ]
  },
  {
    id: 'aesthetic_portrait',
    name: 'Chân Dung Nghệ Thuật',
    category: 'Portrait',
    description: 'Tối ưu góc mặt 3/4, nhẹ nhàng thanh lịch.',
    poses: [
      { id: 'p9', name: 'Góc Mặt 3/4 Trái', tip: 'Xoay đầu sang phải 30°, nhìn nhẹ vào ống kính', targetScore: 80 },
      { id: 'p10', name: 'Tựa Cằm Vào Tay', tip: 'Chống tay tựa nhẹ cằm, mắt nhìn mộng mơ', targetScore: 80 },
      { id: 'p11', name: 'Ngoảnh Mặt Chậm', tip: 'Vai thẳng, ngoảnh mặt nhẹ qua vai', targetScore: 75 },
      { id: 'p12', name: 'Cười Tự Nhiên', tip: 'Thả lỏng vai, cười rạng rỡ tự nhiên', targetScore: 85 }
    ]
  }
];

export const FRAME_THEMES = [
  { id: 'korean-purple', name: 'Korean Lavender', bgGradient: 'from-purple-900 to-indigo-900', border: '#8b5cf6', badge: 'Hàn Quốc' },
  { id: 'korean-pink', name: 'Pastel Cherry', bgGradient: 'from-pink-900 to-rose-900', border: '#ec4899', badge: 'Pastel' },
  { id: 'y2k-cyber', name: 'Y2K Cyberpunk', bgGradient: 'from-cyan-900 to-blue-900', border: '#06b6d4', badge: 'Y2K' },
  { id: 'vintage-sepia', name: 'Classic Vintage', bgGradient: 'from-amber-950 to-stone-900', border: '#d97706', badge: 'Vintage' },
  { id: 'minimal-dark', name: 'Studio Dark Mode', bgGradient: 'from-slate-950 to-gray-900', border: '#64748b', badge: 'Minimal' }
];

export const usePhotoboothStore = create((set, get) => ({
  // Navigation & View Mode
  activeTab: 'camera', // 'camera' | 'photobooth' | 'videoguide' | 'studio'
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Presets & Active Selection
  selectedPreset: POSE_PRESETS[0],
  setSelectedPreset: (preset) => set({ selectedPreset: preset, currentPoseIndex: 0 }),

  currentPoseIndex: 0,
  setCurrentPoseIndex: (idx) => set({ currentPoseIndex: idx }),

  // Live Detection State
  currentScore: 0,
  setCurrentScore: (score) => set({ currentScore: score }),
  feedbackText: 'Hãy đưa cơ thể vào khung hình...',
  setFeedbackText: (text) => set({ feedbackText: text }),

  // Photobooth Snapshots (4 shots)
  snapshots: [null, null, null, null], // array of 4 base64 strings
  setSnapshot: (index, dataUrl) => {
    const snaps = [...get().snapshots];
    snaps[index] = dataUrl;
    set({ snapshots: snaps });
  },
  resetSnapshots: () => set({ snapshots: [null, null, null, null], currentPoseIndex: 0 }),

  // Countdown State
  isCountingDown: false,
  countdownSec: 5,
  setIsCountingDown: (val) => set({ isCountingDown: val }),
  setCountdownSec: (sec) => set({ countdownSec: sec }),

  // Frame Studio Settings
  selectedFrameTheme: FRAME_THEMES[0],
  setSelectedFrameTheme: (theme) => set({ selectedFrameTheme: theme }),

  combinedStripUrl: null,
  setCombinedStripUrl: (url) => set({ combinedStripUrl: url }),

  // AI Auto Retouching
  autoRetouchEnabled: true,
  retouchLevel: 65,
  setAutoRetouchEnabled: (val) => set({ autoRetouchEnabled: val }),
  setRetouchLevel: (val) => set({ retouchLevel: val }),

  // Storyboard State
  storyboards: [],
  setStoryboards: (list) => set({ storyboards: list }),

  // QR Modal Share State
  isShareModalOpen: false,
  setIsShareModalOpen: (val) => set({ isShareModalOpen: val }),
}));
