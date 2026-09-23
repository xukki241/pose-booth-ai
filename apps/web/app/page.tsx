'use client';

import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { ProductFlowStoryboard } from '@/components/hero/ProductFlowStoryboard';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    title: 'Real-time Detection',
    desc: 'YOLOv8 & MediaPipe detect your full body skeleton at 60 FPS with zero-latency inference.',
    back: 'Powered by YOLOv8s-pose with 17 keypoint detection. Runs locally on your GPU — no cloud needed.',
    glowColor: 'rgba(168,85,247,0.5)',
    badge: 'YOLOv8',
    icon: '🦾',
  },
  {
    title: 'Pose Library',
    desc: '7+ curated poses with AI-guided skeleton overlay. From K-Pop to editorial runway styles.',
    back: 'Poses: K-Pop Heart · Editorial Runway · Dynamic Jump · Vogue Chic · Duo Mirror · Casual Lean · Power Stance.',
    glowColor: 'rgba(6,182,212,0.45)',
    badge: '7+ Poses',
    icon: '🎭',
  },
  {
    title: 'Smart Scoring',
    desc: 'AI compares your pose to the reference and gives a 0–100 accuracy score with live feedback.',
    back: 'Uses cosine similarity on joint angle vectors. Feedback categories: Excellent · Good · Needs Work.',
    glowColor: 'rgba(240,171,252,0.4)',
    badge: 'AI Score',
    icon: '📊',
  },
  {
    title: 'Multiple Frames',
    desc: 'Film-strip, holographic, Y2K, polaroid — choose your style before exporting.',
    back: 'Frames are applied in real-time as CSS overlays. Export as PNG with frame composited.',
    glowColor: 'rgba(16,185,129,0.4)',
    badge: 'Film Strip',
    icon: '🎞️',
  },
];

const STEPS = [
  { num: '01', icon: '📷', title: 'Point Camera', desc: 'Position yourself in frame. Auto lighting calibration ensures accurate skeleton detection.' },
  { num: '02', icon: '🤖', title: 'AI Analyzes', desc: 'YOLOv8 detects your skeleton in real-time at 60 FPS with sub-20ms latency.' },
  { num: '03', icon: '✨', title: 'Perfect Shot', desc: 'Capture with AI-guided pose accuracy. Score your match and choose your frame style.' },
];

const TECH = ['YOLOv8', 'MediaPipe', 'FastAPI', 'Next.js 16', 'GSAP 3', 'Python 3.14', 'TypeScript', 'RTX 4050'];

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [flippedIdx, setFlippedIdx] = useState<number | null>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(heroRef.current, { rotateX: 12, scale: 0.93, opacity: 0, duration: 1.2, transformOrigin: 'center 60%' })
      .from('.hero-badge', { opacity: 0, y: -20, duration: 0.5 }, '-=0.6')
      .from('.hero-line-1', { opacity: 0, y: 40, duration: 0.7 }, '-=0.4')
      .from('.hero-line-2', { opacity: 0, y: 40, duration: 0.7 }, '-=0.5')
      .from('.hero-sub', { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
      .from('.hero-ctas', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
      .from('.hero-viewport', { opacity: 0, scale: 0.88, rotateY: 8, duration: 0.9, ease: 'back.out(1.2)' }, '-=0.4');

    gsap.to('.particle', {
      y: 'random(-30,30)', x: 'random(-20,20)',
      duration: 'random(3,6)', repeat: -1, yoyo: true,
      ease: 'sine.inOut', stagger: { each: 0.3, from: 'random' },
    });

    gsap.from('.step-card', {
      scrollTrigger: { trigger: '.steps-section', start: 'top 80%', toggleActions: 'play none none reverse' },
      opacity: 0, y: 50, rotateX: 15, stagger: 0.15, duration: 0.8, ease: 'power3.out',
    });

    gsap.from('.feature-card', {
      scrollTrigger: { trigger: '.features-section', start: 'top 75%', toggleActions: 'play none none reverse' },
      opacity: 0, y: 60, scale: 0.9, stagger: 0.1, duration: 0.7, ease: 'back.out(1.4)',
    });

    gsap.from('.tech-badge', {
      scrollTrigger: { trigger: '.tech-section', start: 'top 85%' },
      opacity: 0, scale: 0.7, stagger: 0.05, duration: 0.5, ease: 'back.out(2)',
    });

    gsap.to('.hero-viewport', {
      scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1.5 },
      y: 80, rotateX: -5,
    });
  }, { scope: containerRef });

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('.tilt-card');
    const cleanups: Array<() => void> = [];
    cards.forEach(card => {
      const onMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        gsap.to(card, { rotateY: dx * 10, rotateX: -dy * 10, duration: 0.4, ease: 'power2.out' });
      };
      const onLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      cleanups.push(() => { card.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onLeave); });
    });
    return () => cleanups.forEach(fn => fn());
  }, []);

  const navStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(10,10,15,0.75)', backdropFilter: 'blur(24px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '0 2rem', height: '64px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  };

  return (
    <div ref={containerRef} style={{ background: 'var(--bg-base)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Ambient bg */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(168,85,247,0.08) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(6,182,212,0.07) 0%, transparent 70%)' }} />

      {/* Particles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="particle" style={{
          position: 'fixed',
          width: `${Math.random() * 2.5 + 1}px`, height: `${Math.random() * 2.5 + 1}px`,
          borderRadius: '50%',
          background: i % 3 === 0 ? '#A855F7' : i % 3 === 1 ? '#06B6D4' : '#F0ABFC',
          opacity: Math.random() * 0.35 + 0.1,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          pointerEvents: 'none', zIndex: 0,
          boxShadow: `0 0 6px currentColor`,
        }} />
      ))}

      {/* NAV */}
      <nav style={navStyle}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.4rem' }}>📸</span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Pose-Booth <span className="prism-text">AI</span>
          </span>
        </Link>
        <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
          {([['Booth', '/booth'], ['Pose Studio', '/pose-studio'], ['Frames', '/frames'], ['About', '/about']] as [string,string][]).map(([label, href]) => (
            <Link key={href} href={href} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>
              {label}
            </Link>
          ))}
          <Link href="/booth" className="btn-prism-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Open Booth ✦</Link>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="bg-grid" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '7rem 2rem 5rem', position: 'relative', zIndex: 1, textAlign: 'center', transformStyle: 'preserve-3d' }}>
        <div className="hero-badge glass-pill" style={{ marginBottom: '2rem' }}>
          <span className="dot dot-pulse" />
          EXE101 · FPT University 2026
        </div>
        <h1 className="hero-line-1" style={{ fontSize: 'clamp(2.8rem,7.5vw,5.5rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05, margin: 0, color: 'var(--text-primary)' }}>AI Pose Detection</h1>
        <h1 className="hero-line-2 prism-text" style={{ fontSize: 'clamp(2.8rem,7.5vw,5.5rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05, margin: '0 0 1.5rem' }}>Made Beautiful</h1>
        <p className="hero-sub" style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '540px', lineHeight: 1.7, margin: '0 auto 2.5rem' }}>
          Real-time AI pose guidance with glassmorphism photobooth.<br />Strike the perfect pose, every time.
        </p>
        <div className="hero-ctas" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
          <Link href="/booth" className="btn-prism-primary">Open Photobooth →</Link>
          <Link href="/pose-studio" className="btn-glass">Explore Poses</Link>
        </div>

        {/* Interactive Storyboard Viewport */}
        <div className="hero-viewport w-full max-w-4xl">
          <ProductFlowStoryboard />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="steps-section" style={{ padding: '6rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="glass-pill" style={{ display: 'inline-flex', marginBottom: '1rem' }}>How It Works</span>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.75rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: '1rem 0 0' }}>
              Streamlined <span className="prism-text">3-Step</span> AI Capture
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '18%', right: '18%', height: '1px', background: 'linear-gradient(90deg,rgba(168,85,247,0.3),rgba(6,182,212,0.3))', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            {STEPS.map((step, i) => (
              <div key={i} className="step-card glass-card tilt-card" style={{ padding: '2rem', textAlign: 'center', transformStyle: 'preserve-3d' }}>
                <div className="num-mono" style={{ fontSize: '0.7rem', color: 'var(--prism-violet)', letterSpacing: '0.12em', marginBottom: '1rem', textTransform: 'uppercase' }}>{step.num}</div>
                <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>{step.icon}</div>
                <h3 style={{ fontWeight: 600, fontSize: '1.1rem', margin: '0 0 0.75rem', color: 'var(--text-primary)' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" style={{ padding: '4rem 2rem 6rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="glass-pill" style={{ display: 'inline-flex', marginBottom: '1rem' }}>Features</span>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.75rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: '1rem 0 0' }}>
              Built for <span className="prism-text">Precision</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.5rem' }}>
            {FEATURES.map((feat, i) => (
              <div key={i} className="feature-card flip-card" style={{ height: '220px', cursor: 'pointer' }} onClick={() => setFlippedIdx(flippedIdx === i ? null : i)}>
                <div className="flip-card-inner" style={{ transform: flippedIdx === i ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                  <div className="flip-card-front glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: `var(--shadow-elevated), 0 0 30px -12px ${feat.glowColor}` }}>
                    <div>
                      <span style={{ fontSize: '2rem' }}>{feat.icon}</span>
                      <h3 style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0.75rem 0 0.5rem' }}>{feat.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                      <span className="glass-pill" style={{ fontSize: '0.75rem' }}>{feat.badge}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Click to flip →</span>
                    </div>
                  </div>
                  <div className="flip-card-back glass-card" style={{ padding: '1.75rem', background: 'rgba(168,85,247,0.07)', borderColor: `rgba(168,85,247,0.25)` }}>
                    <h3 className="prism-text" style={{ fontWeight: 600, fontSize: '0.95rem', margin: '0 0 1rem' }}>Technical Details</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{feat.back}</p>
                    <p style={{ marginTop: '1rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Click to flip back ↩</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="tech-section" style={{ padding: '3rem 2rem', position: 'relative', zIndex: 1 }}>
        <hr className="glass-divider" />
        <div style={{ maxWidth: '900px', margin: '3rem auto', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: 'var(--font-space-mono,monospace)' }}>Powered By</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {TECH.map(t => <span key={t} className="tech-badge">{t}</span>)}
          </div>
        </div>
        <hr className="glass-divider" />
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '2.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', position: 'relative', zIndex: 1 }}>
        <p style={{ marginBottom: '0.5rem' }}><span className="prism-text" style={{ fontWeight: 600 }}>Pose-Booth AI</span> © 2026 · EXE101 FPT University</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--prism-cyan)', boxShadow: '0 0 6px var(--prism-cyan)' }} />
          <span style={{ fontFamily: 'var(--font-space-mono,monospace)', fontSize: '0.75rem' }}>Neural Engine Online</span>
        </div>
      </footer>
    </div>
  );
}
