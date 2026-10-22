import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { FiArrowRight, FiMove } from 'react-icons/fi';
import { hero } from '../content/copy';
import { ShoeArt } from '../components/product/ShoeArt';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';
import { HERO_COLORWAYS } from '../three/colorways';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { hasWebGL } from '../lib/webgl';
import { scrollToId } from '../lib/lenis';
import { flagship } from '../lib/flagship';
import { formatTaka } from '../lib/format';
import { useUi } from '../store/uiStore';

// three + R3F + drei load in their own chunk, after the page is interactive
const HeroScene = lazy(() => import('../three/HeroScene'));

/**
 * Giant headline with a live 3D sneaker in front of it. Until the 3D frame is drawn (and
 * for good if WebGL is missing or fails) a drawn SVG sneaker stands in.
 */
export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [colorway, setColorway] = useState(HERO_COLORWAYS[0]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const inView = useInView(stageRef, '120px');
  const reduced = useReducedMotion();
  const webgl = hasWebGL();
  const show3d = webgl && !failed;
  const pair = flagship;

  // Headline fades and lifts as the hero scrolls away (CSS reads --hp)
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = heroRef.current;
      if (!el) return;
      const progress = Math.min(1, Math.max(0, window.scrollY / (el.offsetHeight * 0.9)));
      el.style.setProperty('--hp', progress.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="top" className="hero" ref={heroRef} aria-labelledby="hero-title">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <div className="container hero-center">
        <h1 id="hero-title" className="hero-title display">
          <span className="solid">{hero.titleSolid}</span>{' '}
          <span className="accent">{hero.titleAccent}</span>
        </h1>

        <div className={`hero-stage ${ready && show3d ? 'is-3d' : ''}`} ref={stageRef}>
          <div className="hero-fallback">
            <ShoeArt palette={colorway.palette} label={`StepUp BD sneaker in ${colorway.label}`} />
            {!show3d && <p className="fallback-note">{hero.fallbackNote}</p>}
          </div>
          {show3d && (
            <div className="hero-canvas">
              <ErrorBoundary fallback={null} onError={() => setFailed(true)}>
                <Suspense fallback={null}>
                  <HeroScene
                    colorway={colorway}
                    active={inView}
                    reduced={reduced}
                    heroRef={heroRef}
                    onReady={() => setReady(true)}
                    onContextLost={() => setFailed(true)}
                  />
                </Suspense>
              </ErrorBoundary>
            </div>
          )}
          <p className="drag-hint" aria-hidden="true">
            <FiMove /> {hero.dragHint}
          </p>
        </div>
      </div>

      <div className="container hero-bottom">
        <div className="hero-copy">
          <p className="tagline">
            {hero.tagline} <em>{hero.taglineAccent}</em>
          </p>
          <p>{hero.lede}</p>
          <div className="hero-ctas">
            <a
              href="#shop"
              className="btn btn-primary"
              onClick={(event) => {
                event.preventDefault();
                scrollToId('shop');
              }}
            >
              {hero.cta} <FiArrowRight aria-hidden="true" />
            </a>
            <a
              href="#trending"
              className="btn btn-ghost"
              onClick={(event) => {
                event.preventDefault();
                scrollToId('trending');
              }}
            >
              {hero.ctaSecondary}
            </a>
          </div>
        </div>

        <div className="hero-swatches">
          <p className="swatch-label" id="swatch-label">
            {hero.colorLabel}
          </p>
          <div className="swatches" role="group" aria-labelledby="swatch-label">
            {HERO_COLORWAYS.map((c) => (
              <button
                key={c.id}
                type="button"
                className="swatch"
                aria-pressed={c.id === colorway.id}
                onClick={() => setColorway(c)}
              >
                <span
                  className="swatch-dot"
                  aria-hidden="true"
                  style={{ '--a': c.swatch[0], '--b': c.swatch[1] } as CSSProperties}
                />
                {c.label}
              </button>
            ))}
          </div>
          {pair && (
            <button
              type="button"
              className="shop-pair"
              onClick={() => useUi.getState().openQuickView(pair)}
            >
              {hero.shopPair} · {formatTaka(pair.price)} <FiArrowRight aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="hero-stats">
          {hero.stats.map((stat) => (
            <div key={stat.label}>
              <b>
                {stat.value}
                <em>{stat.accent}</em>
              </b>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true">
        <i />
      </div>
    </section>
  );
}
