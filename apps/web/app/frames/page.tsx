'use client';

import { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { FRAMES } from '@/lib/frames';
import Link from 'next/link';

/* ── Category filter config ─────────────────────────────────── */
const CATEGORIES = [
  { id: 'all', label: 'All Frames' },
  { id: 'Pinky', label: 'Pinky' },
  { id: 'Red', label: 'Red' },
  { id: 'Standard', label: 'Standard' },
];

type Frame = {
  id: string;
  name: string;
  overlayPath: string | null;
  thumbnailPath: string | null;
  category?: string;
};

export default function FramesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const displayFrames: Frame[] = (FRAMES as Frame[]).filter((f) => f.id !== 'none');
  const filtered = activeCategory === 'all'
    ? displayFrames
    : displayFrames.filter((f) => (f.category ?? 'Standard') === activeCategory);

  useGSAP(() => {
    gsap.from('.frames-hero-content', { opacity: 0, y: 36, duration: 0.8, ease: 'power3.out' });
    gsap.from('.frame-card', {
      opacity: 0,
      y: 32,
      scale: 0.94,
      stagger: 0.09,
      duration: 0.6,
      ease: 'back.out(1.3)',
      delay: 0.15,
    });
  }, { scope: containerRef, dependencies: [activeCategory] });

  return (
    <div
      ref={containerRef}
      style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background:
            'radial-gradient(ellipse 55% 40% at 80% 15%, rgba(168,85,247,0.07) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 40% 35% at 15% 85%, rgba(6,182,212,0.06) 0%, transparent 70%)',
        }}
      />

      {/* ── NAV ── */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'color-mix(in oklab, var(--background) 85%, transparent)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--border)',
          padding: '0 2rem', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', textDecoration: 'none' }}
        >
          📸 <span className="prism-text">Pose-Booth AI</span>
        </Link>
        <div className="legacy-route-nav" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {([['Booth', '/booth'], ['Pose Studio', '/pose-studio'], ['About', '/about']] as [string, string][]).map(([label, href]) => (
            <Link
              key={href}
              href={href}
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}
            >
              {label}
            </Link>
          ))}
          <Link href="/booth" className="btn-prism-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
            Open Booth
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          paddingTop: '9rem', paddingBottom: '4rem', paddingLeft: '2rem', paddingRight: '2rem',
          maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1,
        }}
      >
        <div className="frames-hero-content">
          <span className="glass-pill" style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
            <span className="dot dot-pulse" />Frame Library
          </span>
          <h1 style={{ fontSize: 'clamp(2rem,4.5vw,3.25rem)', fontWeight: 700, letterSpacing: '-0.04em', margin: '1rem 0' }}>
            Choose Your <span className="prism-text">Frame</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.75, maxWidth: '520px', margin: '0 auto' }}>
            Browse our collection of photo frames crafted for the 3-photo strip and 4-photo grid layouts.
            Pick one, open the Booth, and shoot.
          </p>
        </div>
      </section>

      {/* ── FILTER PILLS ── */}
      <div
        style={{
          display: 'flex', gap: '0.625rem', flexWrap: 'wrap', justifyContent: 'center',
          padding: '0 2rem 3rem', position: 'relative', zIndex: 1,
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                cursor: 'pointer',
                border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: isActive ? 'var(--primary)' : 'var(--secondary)',
                color: isActive ? 'var(--primary-foreground)' : 'var(--secondary-foreground)',
                borderRadius: '9999px',
                padding: '0.35rem 1rem',
                fontSize: '0.825rem',
                fontWeight: isActive ? 600 : 500,
                fontFamily: 'inherit',
                boxShadow: isActive ? '0 8px 20px -14px color-mix(in oklab, var(--primary) 70%, transparent)' : 'none',
                transition: 'all 0.2s ease',
                letterSpacing: '0.01em',
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── FRAMES GRID ── */}
      <main
        style={{
          maxWidth: '1100px', margin: '0 auto', padding: '0 2rem 6rem',
          position: 'relative', zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filtered.map((frame) => (
            <div
              key={frame.id}
              className="frame-card glass-card glass-card-interactive"
              style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              {/* Preview area */}
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '3/4',
                  background: 'rgba(0,0,0,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Shimmer sweep on hover */}
                <div
                  className="animate-shimmer"
                  style={{
                    position: 'absolute', inset: 0, opacity: 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                />
                {frame.thumbnailPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={frame.thumbnailPath}
                    alt={frame.name}
                    style={{
                      maxHeight: '100%', maxWidth: '100%', objectFit: 'contain',
                      transition: 'transform 0.35s ease',
                      position: 'relative', zIndex: 1,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '70%', height: '85%',
                      border: '2px dashed rgba(168,85,247,0.25)',
                      borderRadius: '0.5rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-muted)', fontSize: '0.8rem',
                      fontFamily: 'var(--font-space-mono,monospace)',
                    }}
                  >
                    no preview
                  </div>
                )}
                {/* Prism border glow overlay */}
                <div
                  style={{
                    position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
                    boxShadow: 'inset 0 0 40px rgba(168,85,247,0.08)',
                    borderRadius: 'inherit',
                  }}
                />
              </div>

              {/* Card footer */}
              <div style={{ padding: '1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', margin: 0 }}>{frame.name}</h3>
                  <span
                    className="tech-badge"
                    style={{
                      fontSize: '0.7rem', padding: '0.2rem 0.65rem', flexShrink: 0,
                      borderColor: 'rgba(168,85,247,0.25)', color: 'var(--prism-violet)',
                    }}
                  >
                    {frame.category ?? 'Standard'}
                  </span>
                </div>

                <Link
                  href={`/booth?frame=${frame.id}`}
                  className="btn-glass"
                  style={{
                    width: '100%', justifyContent: 'center',
                    padding: '0.6rem 1rem', fontSize: '0.85rem',
                  }}
                >
                  Use This Frame →
                </Link>
              </div>
            </div>
          ))}

          {/* Custom frame CTA card */}
          <div
            className="frame-card glass-card"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', padding: '3rem 2rem', gap: '0.875rem',
              border: '1.5px dashed rgba(168,85,247,0.2)',
              minHeight: '380px',
            }}
          >
            <div
              style={{
                width: '52px', height: '52px', borderRadius: '0.875rem',
                background: 'rgba(168,85,247,0.12)',
                border: '1px solid rgba(168,85,247,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', marginBottom: '0.25rem',
              }}
            >
              ✦
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', margin: 0 }}>Design Custom Frame</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', maxWidth: '200px', lineHeight: 1.6, margin: 0 }}>
              Upload a transparent PNG (1200×1800) to use as a custom overlay.
            </p>
            <Link
              href="/booth"
              className="btn-prism-primary"
              style={{ marginTop: '0.5rem', padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
            >
              Open Booth
            </Link>
          </div>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No frames in this category yet.
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer
        style={{
          padding: '2.5rem 2rem', textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          position: 'relative', zIndex: 1,
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Pose-Booth AI © 2026 · EXE101 FPT University
        </p>
      </footer>
    </div>
  );
}
