'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

const TIMELINE = [
  { phase: 'Phase 0', date: 'Sep 2026 W1', title: 'Project Kickoff', desc: 'EXE101 startup project defined at FPT University. 2,197 AI skills installed. GitHub repo created at xukki241/pose-booth-ai. CLAUDE.md, .rules/, and skills/ initialized.' },
  { phase: 'Phase 1', date: 'Sep 2026 W2', title: 'AI Backend (FastAPI + YOLOv8)', desc: 'FastAPI server deployed with endpoints: /api/pose/analyze, /api/pose/score, /api/pose/suggest. YOLOv8s-pose.pt (22.4 MB) downloaded. Routers: pose.py, score.py, suggest.py.' },
  { phase: 'Phase 2', date: 'Sep 2026 W2', title: 'MediaPipe Integration', desc: 'pose_landmarker_lite.task (5.5 MB) downloaded to public/models/. Hook usePoseDetection.ts updated with local-first loading + CDN fallback. WASM runtime configured.' },
  { phase: 'Phase 3', date: 'Sep 2026 W3', title: 'Frontend SPA (Next.js 16)', desc: 'Next.js 16 App Router SPA with 5 routes: /, /booth, /pose-studio, /frames, /about. GSAP 3 + @gsap/react installed. Nginx config for reverse proxy.' },
  { phase: 'Phase 4', date: 'Sep 2026 W3', title: 'Dark Prism Redesign', desc: 'Full frontend redesign: Dark Glassmorphism + Prism accents. Space Grotesk + Space Mono fonts. GSAP 3D transitions (page rotateX, card flip, parallax). Stitch AI used for design mockups.' },
];

const HARDWARE = [
  { label: 'Laptop (Dev Machine)', gpu: 'RTX 4050 6GB', cpu: 'i5-13500HX 14C', ram: '16GB DDR5', fps: '45–60 FPS', model: 'YOLOv8n-pose', color: 'var(--prism-cyan)' },
  { label: 'Desktop (AI Machine)', gpu: 'RTX 3060 12GB', cpu: 'R7 5700X 8C', ram: '32GB DDR4', fps: '60+ FPS', model: 'YOLOv8s-pose', color: 'var(--prism-violet)' },
];

const STACK = [
  { cat: 'AI / ML', items: ['YOLOv8s-pose (Ultralytics 8.4)', 'MediaPipe Pose Landmarker Lite', 'OpenCV', 'NumPy', 'PyTorch 2.14'] },
  { cat: 'Backend', items: ['FastAPI', 'Python 3.14', 'Uvicorn ASGI', 'Pydantic v2', 'CORS Middleware'] },
  { cat: 'Frontend', items: ['Next.js 16 (App Router)', 'TypeScript 5', 'GSAP 3 + ScrollTrigger', 'Tailwind CSS 4', 'Space Grotesk / Space Mono'] },
  { cat: 'Infrastructure', items: ['Nginx (SPA reverse proxy)', 'Git + GitHub (xukki241)', 'PowerShell scripts', 'Next.js standalone build'] },
];

const PIPELINE = [
  { label: 'Camera', sub: 'MediaPipe WASM', icon: '📷', color: 'var(--prism-cyan)' },
  { label: 'Pose Detection', sub: 'YOLOv8s-pose', icon: '🦾', color: 'var(--prism-violet)' },
  { label: 'Score API', sub: 'FastAPI :8000', icon: '📊', color: 'var(--prism-pink)' },
  { label: 'UI Feedback', sub: 'Next.js :3000', icon: '✨', color: 'var(--accent-emerald)' },
];

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.about-hero-content', { opacity: 0, y: 40, duration: 0.9, ease: 'power3.out' });
    gsap.from('.pipeline-node', {
      scrollTrigger: { trigger: '.pipeline-section', start: 'top 80%' },
      opacity: 0, scale: 0.7, stagger: 0.12, duration: 0.7, ease: 'back.out(1.4)',
    });
    gsap.from('.timeline-item', {
      scrollTrigger: { trigger: '.timeline-section', start: 'top 80%' },
      opacity: 0, x: -50, stagger: 0.15, duration: 0.7, ease: 'power3.out',
    });
    gsap.from('.hw-card', {
      scrollTrigger: { trigger: '.hw-section', start: 'top 80%' },
      opacity: 0, y: 40, scale: 0.9, stagger: 0.2, duration: 0.7, ease: 'back.out(1.2)',
    });
    gsap.from('.stack-card', {
      scrollTrigger: { trigger: '.stack-section', start: 'top 80%' },
      opacity: 0, y: 30, stagger: 0.1, duration: 0.6, ease: 'power3.out',
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 50% 40% at 70% 20%, rgba(168,85,247,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 35% at 20% 80%, rgba(6,182,212,0.06) 0%, transparent 70%)' }} />

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,15,0.78)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
          📸 <span className="prism-text">Pose-Booth AI</span>
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {([['Booth', '/booth'], ['Pose Studio', '/pose-studio'], ['Frames', '/frames']] as [string, string][]).map(([l, h]) => (
            <Link key={h} href={h} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>{l}</Link>
          ))}
          <Link href="/booth" className="btn-prism-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Open Booth</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: '9rem', paddingBottom: '5rem', paddingLeft: '2rem', paddingRight: '2rem', maxWidth: '880px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="about-hero-content">
          <span className="glass-pill" style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
            <span className="dot dot-pulse" />EXE101 · FPT University 2026
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,3.75rem)', fontWeight: 700, letterSpacing: '-0.04em', margin: '1rem 0' }}>
            About <span className="prism-text">Pose-Booth AI</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.75, maxWidth: '580px', margin: '0 auto' }}>
            An AI-powered photobooth that uses computer vision to guide users into perfect poses in real-time.
            Built as an EXE101 startup capstone at FPT University, 2026.
          </p>
        </div>
      </section>

      {/* AI PIPELINE */}
      <section className="pipeline-section" style={{ padding: '2rem 2rem 5rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 700, textAlign: 'center', marginBottom: '2.5rem' }}>AI <span className="prism-text">Pipeline</span> Architecture</h2>
        <div className="glass-card" style={{ padding: '2.5rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: '560px', justifyContent: 'center' }}>
            {PIPELINE.map((node, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <div className="pipeline-node" style={{ textAlign: 'center', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.04)', border: `1px solid ${node.color}40`, borderRadius: '0.75rem', minWidth: '120px' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{node.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: node.color }}>{node.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-space-mono,monospace)', marginTop: '0.25rem' }}>{node.sub}</div>
                </div>
                {i < PIPELINE.length - 1 && <div style={{ padding: '0 0.625rem', color: 'var(--text-muted)', fontSize: '1.25rem', flexShrink: 0 }}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="timeline-section" style={{ padding: '2rem 2rem 5rem', maxWidth: '780px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 700, textAlign: 'center', marginBottom: '3rem' }}>Development <span className="prism-text">Timeline</span></h2>
        <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
          <div style={{ position: 'absolute', left: '0.5rem', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(180deg, var(--prism-violet), var(--prism-cyan))' }} />
          {TIMELINE.map((item, i) => (
            <div key={i} className="timeline-item" style={{ position: 'relative', marginBottom: '2.5rem' }}>
              <div style={{ position: 'absolute', left: '-2.5rem', top: '1.1rem', width: '12px', height: '12px', borderRadius: '50%', background: i % 2 === 0 ? 'var(--prism-violet)' : 'var(--prism-cyan)', boxShadow: `0 0 10px ${i % 2 === 0 ? 'var(--prism-violet)' : 'var(--prism-cyan)'}`, zIndex: 1 }} />
              <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="glass-pill" style={{ fontSize: '0.72rem', color: 'var(--prism-violet)' }}>{item.phase}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-space-mono,monospace)' }}>{item.date}</span>
                </div>
                <h3 style={{ fontWeight: 600, fontSize: '1rem', margin: '0 0 0.5rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HARDWARE */}
      <section className="hw-section" style={{ padding: '2rem 2rem 5rem', maxWidth: '880px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 700, textAlign: 'center', marginBottom: '2.5rem' }}>Hardware <span className="prism-text">Specs</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.5rem' }}>
          {HARDWARE.map((hw, i) => (
            <div key={i} className="hw-card glass-card" style={{ padding: '2rem', borderColor: `${hw.color}40` }}>
              <span className="glass-pill" style={{ display: 'inline-flex', marginBottom: '1.25rem', color: hw.color, borderColor: `${hw.color}40` }}>{hw.label}</span>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {([['GPU', hw.gpu], ['CPU', hw.cpu], ['RAM', hw.ram], ['Target FPS', hw.fps], ['Model', hw.model]] as [string, string][]).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-space-mono,monospace)' }}>{k}</span>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section className="stack-section" style={{ padding: '2rem 2rem 5rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 700, textAlign: 'center', marginBottom: '2.5rem' }}>Tech <span className="prism-text">Stack</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.25rem' }}>
          {STACK.map((cat, i) => (
            <div key={i} className="stack-card glass-card" style={{ padding: '1.5rem' }}>
              <span className="prism-text-lr" style={{ fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>{cat.cat}</span>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {cat.items.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: 'var(--prism-cyan)', boxShadow: '0 0 5px var(--prism-cyan)', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1 }}>
        <Link href="/booth" className="btn-prism-primary" style={{ display: 'inline-flex', marginBottom: '2rem' }}>Try Pose-Booth AI →</Link>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Pose-Booth AI © 2026 · EXE101 FPT University</p>
      </footer>
    </div>
  );
}
