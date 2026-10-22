import { useSyncExternalStore } from 'react';
import { isReducedMotion, subscribeMotion } from '../lib/motion';

/** True when motion is reduced (OS setting, or the visitor's Motion switch). Updates live. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribeMotion, isReducedMotion, () => false);
}
