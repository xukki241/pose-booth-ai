'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export function SaveGallery({ image }: { image: string }) {
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [qr, setQr] = useState<string | null>(null);
  const token = useRef<string | null>(null);
  const imageKey = useRef({ image, key: crypto.randomUUID() });
  useEffect(() => { imageKey.current = { image, key: crypto.randomUUID() }; setMessage(''); }, [image]);
  useEffect(() => () => { if (qr) URL.revokeObjectURL(qr); }, [qr]);
  async function save() {
    setBusy(true); setMessage('');
    try {
      if (!token.current) {
        const response = await fetch('/api/v1/sessions', { method: 'POST' });
        if (!response.ok) throw new Error('Gallery chưa sẵn sàng. Bạn vẫn có thể tải ảnh trực tiếp.');
        const session = await response.json(); token.current = session.token;
      }
      const headers = { Authorization: `Bearer ${token.current}`, 'Content-Type': 'application/json' };
      const response = await fetch('/api/v1/assets', { method: 'POST', headers, body: JSON.stringify({ image, client_key: imageKey.current.key }) });
      if (!response.ok) throw new Error(`Không lưu được ảnh (${response.status}). Hãy tải ảnh về máy trước.`);
      const qrResponse = await fetch('/api/v1/share/qr', { method: 'POST', headers });
      if (!qrResponse.ok) throw new Error('Ảnh đã lưu nhưng chưa tạo được QR. Có thể bấm lưu lại an toàn.');
      setQr(URL.createObjectURL(await qrResponse.blob()));
      setMessage('Đã lưu local. Hết hạn sau 24 giờ kể từ khi tạo phiên. QR mới thay thế QR cũ của phiên.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Lỗi lưu ảnh'); }
    finally { setBusy(false); }
  }
  async function revoke() {
    if (!token.current) return;
    setBusy(true);
    try {
      const response = await fetch('/api/v1/session/revoke', { method: 'POST', headers: { Authorization: `Bearer ${token.current}` } });
      if (!response.ok) throw new Error('Chưa thu hồi được phiên');
      token.current = null; setQr(null); setMessage('Đã thu hồi quyền truy cập. Worker sẽ xóa ảnh của phiên.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Lỗi thu hồi'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-3">
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={approved} onChange={event => setApproved(event.target.checked)} />
      Tôi đồng ý lưu ảnh trên máy studio tối đa 24 giờ để nhận qua QR. Không dùng để training. Người có QR có thể xem ảnh của phiên.</label>
    <div className="flex flex-wrap gap-2">
      <Button disabled={!approved || busy} onClick={save}>{busy ? 'Đang xử lý…' : 'Lưu local và tạo QR'}</Button>
      {qr && <Button variant="outline" disabled={busy} onClick={revoke}>Thu hồi và xóa phiên</Button>}
    </div>
    <p role="status" className="text-sm text-muted-foreground">{message}</p>
    {qr && <img src={qr} alt="QR nhận ảnh, chỉ chia sẻ với người được phép xem" className="h-48 w-48" />}
  </div>;
}
