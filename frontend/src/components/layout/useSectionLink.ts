import type { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { scrollToId } from '../../lib/lenis';
import { useUi } from '../../store/uiStore';

/**
 * Links to home-page sections ('#shop') that work from any page: on the home page they
 * scroll there smoothly; elsewhere they navigate to '/#shop' (HomePage scrolls on arrival).
 * Paths ('/track') navigate normally.
 */
export function useSectionLink() {
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === '/';

  const href = (target: string) => (target.startsWith('#') && !onHome ? `/${target}` : target);

  const onClick = (event: MouseEvent, target: string) => {
    useUi.getState().closePanel();
    if (event.metaKey || event.ctrlKey || event.shiftKey) return; // new tab etc.
    event.preventDefault();
    if (!target.startsWith('#')) {
      navigate(target);
      window.scrollTo(0, 0);
      return;
    }
    if (onHome) scrollToId(target);
    else navigate({ pathname: '/', hash: target });
  };

  return { href, onClick, onHome };
}
