import { lazy, Suspense, useRef, useState, type CSSProperties } from 'react';
import { FiArrowRight, FiCheck, FiMove, FiPlay } from 'react-icons/fi';
import { hero, story } from '../content/copy';
import { ShoeArt } from '../components/product/ShoeArt';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';
import { DEFAULT_HERO_COLORWAY, HERO_COLORWAYS } from '../three/colorways';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { hasWebGL } from '../lib/webgl';
import { scrollToId } from '../lib/lenis';
import { flagship } from '../lib/flagship';
import { formatTaka } from '../lib/format';
import { getMotionPref, setMotionPref } from '../lib/motion';
import { useUi } from '../store/uiStore';

// three + R3F + drei load in their own chunk, after the page is interactive
const HeroScene = lazy(() => import('../three/HeroScene'));

/**
 * The hero and the scroll story share one sticky 3D stage, lit like a product shoot. The
 * hero shows the AJ1 "Bred" with the tagline, the shop buttons and the colourways; scrolling
 * on, the shoe moves to the side and turns to each detail while the story steps scroll
 * past. Without WebGL a drawn shoe stands in.
 */
export function HeroStory() {
  const storyRef = useRef<HTMLDivElement>(null);
  const [colorway, setColorway] = useState(DEFAULT_HERO_COLORWAY);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const inView = useInView(storyRef, '100px');
  const reduced = useReducedMotion();
  const webgl = hasWebGL();
  const show3d = webgl && !failed;
  const pair = flagship;
  // OS asks for reduced motion and the visitor hasn't chosen: offer to turn motion on
  const offerMotion = reduced && getMotionPref() === 'auto';

  const openPair = () => pair && useUi.getState().openQuickView(pair);
  const toShop = (event: React.MouseEvent) => {
    event.preventDefault();
    scrollToId('shop');
  };
  const shopModel = () => {
    useUi.getState().requestBrand(hero.brandTag);
    scrollToId('shop');
  };

  return (
    <div id="top" ref={storyRef} className="story">
      {/* sticky stage: the 3D shoe on a studio backdrop */}
      <div className="story-stage">
        <div className="stage-bg" aria-hidden="true" />
        <div className={`stage-3d ${ready && show3d ? 'is-3d' : ''}`}>
          <div className="hero-fallback">
            <ShoeArt palette={colorway.palette} label={`Air Jordan 1 High OG in ${colorway.label}`} />
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
        <div className="container">
          <ul className="tags intro-up" aria-label="Featured pair">
            <li>{hero.brandTag}</li>
            <li>
              {hero.model} "{colorway.label}"
            </li>
          </ul>
        </div>

        <div className="container hero-bottom">
          <div className="hero-copy intro-up" style={{ '--i': 1 } as CSSProperties}>
            <h1 id="hero-title" className="hero-title display">
              {hero.title}
            </h1>
            <p>{hero.lede}</p>
            <div className="hero-ctas">
              <button type="button" className="btn btn-primary" onClick={shopModel}>
                {hero.ctaModel} <FiArrowRight aria-hidden="true" />
              </button>
              <a href="#shop" className="btn btn-ghost" onClick={toShop}>
                {hero.cta}
              </a>
            </div>
          </div>

          <div className="hero-swatches intro-up" style={{ '--i': 2 } as CSSProperties}>
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

      {/* 2–4 · the story: the shoe turns to each detail */}
      <div className="story-steps">
        {story.steps.map((step) => (
          <section className="story-step" key={step.eyebrow} aria-label={step.title}>
            <div className="container">
              <div className="story-copy" data-reveal>
                <span className="eyebrow">{step.eyebrow}</span>
                <h2 className="display">{step.title}</h2>
                <p>{step.text}</p>
              </div>
            </div>
          </section>
        ))}

        <section className="story-step story-final" aria-label={story.final.title}>
          <div className="container">
            <div className="story-copy" data-reveal>
              <span className="eyebrow">{story.final.eyebrow}</span>
              <h2 className="display">{story.final.title}</h2>
              <ul className="story-points">
                {story.final.points.map((point) => (
                  <li key={point}>
                    <FiCheck aria-hidden="true" /> {point}
                  </li>
                ))}
              </ul>
              {pair && (
                <p className="story-price">
                  <strong>{formatTaka(pair.price)}</strong>
                  <s>
                    <span className="sr-only">Was </span>
                    {formatTaka(pair.originalPrice)}
                  </s>
                  <span className="badge badge-off">-{pair.discountPercent}%</span>
                </p>
              )}
              <div className="hero-ctas">
                <button type="button" className="btn btn-primary" onClick={openPair}>
                  {story.final.cta} <FiArrowRight aria-hidden="true" />
                </button>
                <a href="#shop" className="btn btn-ghost" onClick={toShop}>
                  {story.final.ctaSecondary}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
