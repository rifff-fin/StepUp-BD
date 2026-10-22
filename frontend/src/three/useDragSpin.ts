import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Drag (mouse or finger) left/right on the canvas to spin the shoe, with inertia.
 * Vertical swipes still scroll the page on phones (the canvas wrapper has
 * `touch-action: pan-y`). Read `spin.current.angle` each frame and call `step(delta)`.
 */
export function useDragSpin() {
  const gl = useThree((state) => state.gl);
  const spin = useRef({ angle: 0, velocity: 0, dragging: false, lastX: 0, lastT: 0 });

  useEffect(() => {
    const el = gl.domElement;
    const s = spin.current;

    const down = (event: PointerEvent) => {
      s.dragging = true;
      s.lastX = event.clientX;
      s.lastT = performance.now();
      s.velocity = 0;
      el.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!s.dragging) return;
      const now = performance.now();
      const dx = event.clientX - s.lastX;
      const dt = Math.max(1, now - s.lastT) / 1000;
      s.angle += dx * 0.012;
      s.velocity = (dx * 0.012) / dt;
      s.lastX = event.clientX;
      s.lastT = now;
    };
    const up = (event: PointerEvent) => {
      s.dragging = false;
      if (performance.now() - s.lastT > 80) s.velocity = 0; // held still before letting go
      if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
    };

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [gl]);

  /** Advance inertia and auto-rotation; returns the current angle. */
  const step = (delta: number, autoSpeed: number) => {
    const s = spin.current;
    if (!s.dragging) {
      s.velocity *= Math.exp(-delta * 3.5);
      s.angle += s.velocity * delta + autoSpeed * delta;
    }
    return s.angle;
  };

  return step;
}
