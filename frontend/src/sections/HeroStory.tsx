import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { FiArrowRight, FiBox, FiCheck, FiMove, FiPlay } from 'react-icons/fi';
import { hero, story } from '../content/copy';
import { ShoeArt } from '../components/product/ShoeArt';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';
import { HERO_COLORWAYS } from '../three/colorways';
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
 * The hero and the scroll story share one sticky 3D stage. The hero shows the giant title,
 * the AJ1 "Bred" spinning in front of it and the shop CTAs; scrolling on, the shoe glides
 * to the side and turns to each detail while the story steps scroll past. Without WebGL a
 * drawn shoe stands in.
 */
export function HeroStory() {
  const storyRef = useRef<HTMLDivElement>(null);
  const [colorway, setColorway] = useState(HERO_COLORWAYS[0]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const inView = useInView(storyRef, '100px');
  const reduced = useReducedMotion();
  const webgl = hasWebGL();
  const show3d = webgl && !failed;
  const pair = flagship;
  // OS asks for reduced motion and the visitor hasn't chosen: offer to turn motion on
  const offerMotion = reduced && getMotionPref() === 'auto';

  // --sp: screens scrolled into the story (the title fades out in the first one)
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = storyRef.current;
      if (!el) return;
      const sp = Math.max(0, -el.getBoundingClientRect().top / (window.innerHeight || 1));
      el.style.setProperty('--sp', sp.toFixed(3));
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

  const openPair = () => pair && useUi.getState().openQuickView(pair);

  return (
    <div id="top" ref={storyRef} className="story theme-dark" data-nav-dark>
      {/* sticky stage: title behind, 3D shoe in front */}
      <div className="story-stage">
        <div className="stage-bg" aria-hidden="true" />
        <h1 id="hero-title" className="hero-title display">
          <span className="solid">{hero.titleSolid}</span>{' '}
          <span className="accent">{hero.titleAccent}</span>
        </h1>
        <div className={`stage-3d ${ready && show3d ? 'is-3d' : ''}`}>
          <div className="hero-fallback">
            <ShoeArt
              palette={colorway.palette}
              label={`Air Jordan 1 High OG in ${colorway.label}`}
            />
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
        <div className="container hero-bottom">
          <div className="hero-copy intro-up" style={{ '--i': 0 } as CSSProperties}>
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
              <button type="button" className="btn btn-ghost" onClick={openPair}>
                <FiBox aria-hidden="true" /> {story.final.cta}
              </button>
            </div>
          </div>

          <div className="hero-swatches intro-up" style={{ '--i': 1 } as CSSProperties}>
            <p className="drag-hint" aria-hidden="true">
              <FiMove /> {hero.dragHint}
            </p>
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
            {offerMotion && (
              <button type="button" className="motion-offer" onClick={() => setMotionPref('on')}>
                <FiPlay aria-hidden="true" /> {story.motionOff} · <b>{story.motionOn}</b>
              </button>
            )}
          </div>

          <div className="hero-stats intro-up" style={{ '--i': 2 } as CSSProperties}>
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

      {/* 2–4 · the story: the shoe turns to each detail */}
      <section className="story-steps" aria-label="The Air Jordan 1 High OG Bred, in detail">
        {story.steps.map((step, i) => (
          <article className="story-step" key={step.eyebrow}>
            <div className="container">
              <div className="story-copy" data-reveal>
                <span className="eyebrow">{step.eyebrow}</span>
                {i === 0 ? (
                  <h2 className="display">
                    {step.title} <em>{step.titleAccent}</em>
                  </h2>
                ) : (
                  <h3 className="display">
                    {step.title} <em>{step.titleAccent}</em>
                  </h3>
                )}
                <p>{step.text}</p>
              </div>
            </div>
          </article>
        ))}

        <article className="story-step story-final">
          <div className="container">
            <div className="story-copy" data-reveal>
              <span className="eyebrow">{story.final.eyebrow}</span>
              <h3 className="display">
                {story.final.title} <em>{story.final.titleAccent}</em>
              </h3>
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
                <a
                  href="#shop"
                  className="btn btn-ghost"
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToId('shop');
                  }}
                >
                  {story.final.ctaSecondary}
                </a>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
