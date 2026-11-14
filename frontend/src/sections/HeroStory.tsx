import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { FiArrowRight, FiArrowRightCircle, FiCheck, FiMove, FiPlay } from 'react-icons/fi';
import { LuGem, LuShieldCheck, LuTruck, LuZap } from 'react-icons/lu';
import { hero, story } from '../content/copy';
import { ShoeArt } from '../components/product/ShoeArt';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';
import { DEFAULT_HERO_COLORWAY, HERO_COLORWAYS } from '../three/colorways';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { hasWebGL } from '../lib/webgl';
import { scrollToId } from '../lib/lenis';
import { getMotionPref, setMotionPref } from '../lib/motion';
import { onRevealed } from '../lib/reveal';
import { useUi } from '../store/uiStore';

const TRUST_ICONS = { cod: LuTruck, return: LuShieldCheck, authentic: LuGem, fast: LuZap } as const;

// three + R3F + drei load in their own chunk, after the page is interactive
const HeroScene = lazy(() => import('../three/HeroScene'));

/**
 * The hero and a short scroll story share one sticky 3D stage. The 3D shoe is there for
 * the look (it is not a product for sale): the hero sells the store (offer, shop buttons,
 * quick brand chips), the shoe spins up, then one short step turns it to the Wings logo.
 * Until the 3D shoe is ready the stage stays empty, so a reload never flashes a stand-in;
 * the drawn shoe only shows on devices without WebGL.
 */
export function HeroStory() {
  const storyRef = useRef<HTMLDivElement>(null);
  const [colorway, setColorway] = useState(DEFAULT_HERO_COLORWAY);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [load3d, setLoad3d] = useState(false);
  const inView = useInView(storyRef, '100px');
  const reduced = useReducedMotion();
  const show3d = hasWebGL() && !failed;
  // OS asks for reduced motion and the visitor hasn't chosen: offer to turn motion on
  const offerMotion = reduced && getMotionPref() === 'auto';

  // The 3D chunk (~290 kB) and the model (~0.9 MB) start downloading once the page is
  // revealed and the browser is idle, so on phones the copy, buttons and shop load first
  useEffect(() => {
    let idle = 0;
    const cancelReveal = onRevealed(() => {
      const start = () => setLoad3d(true);
      idle =
        'requestIdleCallback' in window
          ? window.requestIdleCallback(start, { timeout: 1500 })
          : setTimeout(start, 300);
    });
    return () => {
      cancelReveal();
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
    };
  }, []);

  const go = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    scrollToId(id);
  };
  const copyCode = () => {
    void navigator.clipboard?.writeText(hero.offer.code).catch(() => {});
    setCopied(true);
    useUi.getState().toast(`Code ${hero.offer.code} copied: use it at checkout`);
  };

  return (
    <div id="top" ref={storyRef} className="story theme-dark" data-nav-dark>
      {/* sticky stage: the 3D shoe on a studio backdrop */}
      <div className="story-stage">
        <div className="stage-bg" aria-hidden="true">
          <StageGraphics />
        </div>
        <div className={`stage-3d ${ready && show3d ? 'is-3d' : ''}`}>
          {!show3d && (
            <div className="hero-fallback">
              <ShoeArt palette={colorway.palette} label={`${hero.model} in ${colorway.label}`} />
              <p className="fallback-note">{hero.fallbackNote}</p>
            </div>
          )}
          {show3d && load3d && (
            <div className="hero-canvas">
              <ErrorBoundary fallback={null} onError={() => setFailed(true)}>
                <Suspense fallback={null}>
                  <HeroScene
                    colorway={colorway}
                    active={inView}
                    reduced={reduced}
                    storyRef={storyRef}
                    onReady={() => setReady(true)}
                    onContextLost={() => setFailed(true)}
                  />
                </Suspense>
              </ErrorBoundary>
            </div>
          )}
        </div>
      </div>

      {/* 1 · hero */}
      <section className="hero-panel" aria-labelledby="hero-title">
        <div className="container hero-bottom">
          <div className="hero-copy">
            <button
              type="button"
              className="offer-pill intro-up"
              onClick={copyCode}
              aria-label={`Copy code ${hero.offer.code}: ${hero.offer.text}`}
            >
              <span className="offer-code">
                <i aria-hidden="true" />
                {hero.offer.code}
              </span>
              <span className="offer-text">{hero.offer.text}</span>
              {copied ? <FiCheck aria-hidden="true" /> : <FiArrowRightCircle aria-hidden="true" />}
            </button>
            <h1
              id="hero-title"
              className="hero-title display intro-up"
              style={{ '--i': 1 } as CSSProperties}
            >
              <span className="title-1">{hero.titleLines[0]}</span>{' '}
              <span className="title-2">
                {hero.titleLines[1]}
                <svg
                  className="brush"
                  viewBox="0 0 420 26"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M6 17 C 110 7, 250 5, 414 13" pathLength={1} />
                  <path d="M40 22 C 150 15, 280 14, 380 18" className="brush-2" pathLength={1} />
                </svg>
              </span>
            </h1>
            <p className="intro-up" style={{ '--i': 2 } as CSSProperties}>
              {hero.lede}
            </p>
            <div className="hero-ctas intro-up" style={{ '--i': 3 } as CSSProperties}>
              <a href="#shop" className="btn btn-primary" onClick={go('shop')}>
                {hero.cta} <FiArrowRight aria-hidden="true" />
              </a>
              <a href="#trending" className="btn btn-outline" onClick={go('trending')}>
                {hero.ctaSecondary} <FiPlay aria-hidden="true" />
              </a>
            </div>
            <ul className="hero-trust intro-up" style={{ '--i': 4 } as CSSProperties}>
              {hero.trust.map((item) => {
                const Icon = TRUST_ICONS[item.icon as keyof typeof TRUST_ICONS];
                return (
                  <li key={item.label}>
                    <Icon aria-hidden="true" /> {item.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="hero-swatches glass intro-up" style={{ '--i': 3 } as CSSProperties}>
            <p className="swatch-model">{hero.model}</p>
            <p className="swatch-label" id="swatch-label">
              {hero.colorLabel}: <b>{colorway.label}</b>
            </p>
            <div className="swatches" role="group" aria-labelledby="swatch-label">
              {HERO_COLORWAYS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="swatch"
                  aria-pressed={c.id === colorway.id}
                  aria-label={c.label}
                  title={c.label}
                  onClick={() => setColorway(c)}
                >
                  <span
                    className="swatch-shoe"
                    aria-hidden="true"
                    style={{ '--a': c.swatch[0], '--b': c.swatch[1] } as CSSProperties}
                  >
                    <ShoeArt palette={c.palette} silhouette="high" />
                  </span>
                </button>
              ))}
            </div>
            <p className="drag-hint" aria-hidden="true">
              <FiMove /> {hero.dragHint}
            </p>
            {offerMotion && (
              <button type="button" className="motion-offer" onClick={() => setMotionPref('on')}>
                <FiPlay aria-hidden="true" /> {story.motionOff} · <b>{story.motionOn}</b>
              </button>
            )}
          </div>
        </div>
        <a href="#details" className="scroll-cue intro-up" onClick={go('details')}>
          <span className="mouse" aria-hidden="true">
            <i />
          </span>
          {hero.scrollHint}
        </a>
      </section>

      {/* 2 · a short story: the shoe turns to each detail */}
      <div className="story-steps">
        {story.steps.map((step, i) => (
          <section
            className="story-step"
            key={step.title}
            id={i === 0 ? 'details' : undefined}
            aria-label={step.title}
          >
            <div className="container">
              <div className="story-copy" data-reveal>
                <h2 className="display">{step.title}</h2>
                <p>{step.text}</p>
                {i === story.steps.length - 1 && (
                  <a href="#trending" className="btn btn-primary btn-sm" onClick={go('trending')}>
                    {story.cta} <FiArrowRight aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/** A soft shade over the set photo where the copy sits (the photo is the set itself). */
function StageGraphics() {
  return <div className="stage-vignette" />;
}
