import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, ShieldAlert, Copy, Check } from 'lucide-react';
import { usePhotoboothStore } from '../store/usePhotoboothStore';

export function ShareModal() {
  const { isShareModalOpen, setIsShareModalOpen, combinedStripUrl } = usePhotoboothStore();
  const [copied, setCopied] = React.useState(false);

  if (!isShareModalOpen) return null;

  // Temporary mock share URL
  const tempShareUrl = combinedStripUrl || 'https://posebooth.ai/share/ex101-demo-4cut';

  const handleCopy = () => {
    navigator.clipboard.writeText(tempShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-panel max-w-md w-full p-6 rounded-3xl border border-white/10 shadow-2xl relative flex flex-col items-center text-center"
        >
          {/* Close button */}
          <button
            onClick={() => setIsShareModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/60 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 mb-3 glow-cyan">
            <QrCode className="w-8 h-8 text-cyan-400" />
          </div>

          <h3 className="text-xl font-bold font-outfit text-slate-100 mb-1">
            Mã QR Tải Bộ Ảnh Về Điện Thoại
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Dùng camera điện thoại quét mã QR bên dưới để xem lại & tải về máy tức thì.
          </p>

          {/* QR Code Container */}
          <div className="bg-white p-4 rounded-2xl border-4 border-cyan-500/40 shadow-xl mb-4">
            <QRCodeSVG value={tempShareUrl} size={180} level="H" />
          </div>

          {/* Expiration Notice */}
          <div className="flex items-center gap-2 text-[11px] text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 mb-6">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>Liên kết tải ảnh tạm thời tự động hủy sau 24 giờ</span>
          </div>

          {/* Direct Copy Link Button */}
          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 rounded-xl glass-card font-semibold text-xs text-slate-200 hover:text-white flex items-center justify-center gap-2 border border-white/10"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Đã Sao Chép Liên Kết!' : 'Sao Chép Link Tải Ảnh'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
