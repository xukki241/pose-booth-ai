'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Owns one stream; late permissions and unmounts cannot leak a live camera. */
export function useCamera(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const stream = useRef<MediaStream | null>(null);
  const generation = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const release = useCallback(() => {
    generation.current++;
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    if (videoRef.current) { videoRef.current.onloadedmetadata = null; videoRef.current.srcObject = null; }
  }, [videoRef]);
  const stop = useCallback(() => { release(); setReady(false); setLoading(false); }, [release]);
  useEffect(() => release, [release]);
  const start = useCallback(async (facingMode: 'user' | 'environment' = 'user', deviceId?: string) => {
    release();
    const id = generation.current;
    setReady(false); setLoading(true); setError(null); setDevices([]);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera cần HTTPS được thiết bị tin cậy hoặc localhost.'); setLoading(false); return;
    }
    timeout.current = setTimeout(() => {
      if (id !== generation.current) return;
      release(); setReady(false); setLoading(false);
      setError('Chưa nhận được camera. Kiểm tra yêu cầu cấp quyền trên trình duyệt rồi bấm thử lại.');
    }, 20000);
    try {
      const acquired = await navigator.mediaDevices.getUserMedia({ audio: false, video: {
        ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: facingMode } }),
        width: { ideal: 1280 }, height: { ideal: 720 },
      } });
      if (id !== generation.current) { acquired.getTracks().forEach(track => track.stop()); return; }
      stream.current = acquired;
      const video = videoRef.current;
      if (!video) {
        release(); setLoading(false);
        setError('Không tìm thấy vùng xem camera. Mở lại phòng chụp rồi thử lại.');
        return;
      }
      const play = async () => {
        if (id !== generation.current) return;
        try {
          await video.play();
          if (id !== generation.current) return;
          if (timeout.current) clearTimeout(timeout.current);
          timeout.current = null;
          setReady(true); setLoading(false);
        } catch {
          if (id === generation.current) { release(); setReady(false); setLoading(false); setError('Không phát được camera. Đóng ứng dụng đang chiếm camera rồi thử lại.'); }
          return;
        }
        // Device discovery is optional: its failure must not tear down working video.
        try {
          const available = await navigator.mediaDevices.enumerateDevices();
          if (id === generation.current) setDevices(available.filter(device => device.kind === 'videoinput'));
        } catch {
          if (id === generation.current) setDevices([]);
        }
      };
      video.onloadedmetadata = () => { void play(); };
      video.srcObject = acquired;
      acquired.getVideoTracks().forEach(track => track.addEventListener('ended', () => {
        if (id === generation.current) { release(); setReady(false); setLoading(false); setError('Camera đã ngắt kết nối.'); }
      }, { once: true }));
    } catch (exc) {
      if (id !== generation.current) return;
      release(); setReady(false); setLoading(false);
      const name = exc instanceof DOMException ? exc.name : '';
      setError(name === 'NotAllowedError' ? 'Chưa được cấp quyền camera. Cho phép tại biểu tượng camera của trình duyệt.' :
        name === 'NotFoundError' ? 'Không tìm thấy camera. Kết nối webcam hoặc mở trên điện thoại.' :
        name === 'OverconstrainedError' ? 'Camera được chọn không còn khả dụng. Chọn camera khác.' : 'Không mở được camera. Kiểm tra thiết bị và ứng dụng đang sử dụng camera.');
    }
  }, [release, videoRef]);
  return { ready, loading, error, devices, start, stop };
}
