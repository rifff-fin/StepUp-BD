import { lazy, Suspense, useRef, useState, type CSSProperties } from 'react';
import { FiArrowRight, FiCheck, FiCopy, FiMove, FiPlay, FiTag } from 'react-icons/fi';
import { hero, story } from '../content/copy';
import { ShoeArt } from '../components/product/ShoeArt';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';
import { DEFAULT_HERO_COLORWAY, HERO_COLORWAYS } from '../three/colorways';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { hasWebGL } from '../lib/webgl';
import { scrollToId } from '../lib/lenis';
import { getMotionPref, setMotionPref } from '../lib/motion';
import { useUi } from '../store/uiStore';

// three + R3F + drei load in their own chunk, after the page is interactive
const HeroScene = lazy(() => import('../three/HeroScene'));

/**
 * The hero and a short scroll story share one sticky 3D stage. The 3D shoe is there for
 * the look (it is not a product for sale): the hero sells the store (offer, shop buttons,
 * quick brand chips), the shoe spins up, and three short steps turn it to its details.
 * Until the 3D shoe is ready the stage stays empty, so a reload never flashes a stand-in;
 * the drawn shoe only shows on devices without WebGL.
 */
export function HeroStory() {
  const storyRef = useRef<HTMLDivElement>(null);
  const [colorway, setColorway] = useState(DEFAULT_HERO_COLORWAY);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const inView = useInView(storyRef, '100px');
  const reduced = useReducedMotion();
  const show3d = hasWebGL() && !failed;
  // OS asks for reduced motion and the visitor hasn't chosen: offer to turn motion on
  const offerMotion = reduced && getMotionPref() === 'auto';

  const go = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    scrollToId(id);
  };
  const shopBrand = (brand: string) => {
    useUi.getState().requestBrand(brand);
    scrollToId('shop');
  };
  const copyCode = () => {
    void navigator.clipboard?.writeText(hero.offer.code).catch(() => {});
    setCopied(true);
    useUi.getState().toast(`Code ${hero.offer.code} copied: use it at checkout`);
  };

  return (
    <div id="top" ref={storyRef} className="story">
      {/* sticky stage: the 3D shoe on a studio backdrop */}
      <div className="story-stage">
        <div className="stage-bg" aria-hidden="true" />
        <div className={`stage-3d ${ready && show3d ? 'is-3d' : ''}`}>
          {!show3d && (
            <div className="hero-fallback">
              <ShoeArt palette={colorway.palette} label={`${hero.model} in ${colorway.label}`} />
              <p className="fallback-note">{hero.fallbackNote}</p>
            </div>
          )}
          {show3d && !ready && <div className="stage-loading" aria-hidden="true" />}
          {show3d && (
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
              className="offer-pill glass intro-up"
              onClick={copyCode}
              aria-label={`Copy code ${hero.offer.code}: ${hero.offer.text}`}
            >
              <FiTag aria-hidden="true" />
              <b>{hero.offer.code}</b> {hero.offer.text}
              {copied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
            </button>
            <h1
              id="hero-title"
              className="hero-title display intro-up"
              style={{ '--i': 1 } as CSSProperties}
            >
              {hero.title}
            </h1>
            <p className="intro-up" style={{ '--i': 2 } as CSSProperties}>
              {hero.lede}
            </p>
            <div className="hero-ctas intro-up" style={{ '--i': 3 } as CSSProperties}>
              <a href="#shop" className="btn btn-primary" onClick={go('shop')}>
                {hero.cta} <FiArrowRight aria-hidden="true" />
              </a>
              <a href="#trending" className="btn btn-glass" onClick={go('trending')}>
                {hero.ctaSecondary}
              </a>
            </div>
            <ul
              className="quick-brands intro-up"
              style={{ '--i': 4 } as CSSProperties}
              aria-label="Shop by brand"
            >
              {hero.quickBrands.map((brand) => (
                <li key={brand}>
                  <button type="button" className="glass" onClick={() => shopBrand(brand)}>
                    {brand}
                  </button>
                </li>
              ))}
            </ul>
            <ul className="hero-trust intro-up" style={{ '--i': 5 } as CSSProperties}>
              {hero.trust.map((item) => (
                <li key={item}>
                  <FiCheck aria-hidden="true" /> {item}
                </li>
              ))}
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
                    className="swatch-dot"
                    aria-hidden="true"
                    style={{ '--a': c.swatch[0], '--b': c.swatch[1] } as CSSProperties}
                  />
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
      </section>

      {/* 2–4 · a short story: the shoe turns to each detail */}
      <div className="story-steps">
        {story.steps.map((step, i) => (
          <section className="story-step" key={step.eyebrow} aria-label={step.title}>
            <div className="container">
              <div className="story-copy glass" data-reveal>
                <span className="eyebrow">{step.eyebrow}</span>
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
