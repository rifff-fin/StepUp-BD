import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { FiHeart, FiSearch, FiShoppingBag } from 'react-icons/fi';
import { nav } from '../../content/copy';
import { Logo } from './Logo';
import { useSectionLink } from './useSectionLink';
import { selectCartCount, useCart } from '../../store/cartStore';
import { useUi } from '../../store/uiStore';
import { useWishlist } from '../../store/wishlistStore';

/** Sticky navbar: logo, section links, search, wishlist and cart (with bouncing badges). */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(true);
  const { pathname } = useLocation();
  const panel = useUi((s) => s.panel);
  const cartPulse = useUi((s) => s.cartPulse);
  const wishPulse = useUi((s) => s.wishPulse);
  const cartCount = useCart(selectCartCount);
  const wishCount = useWishlist((s) => s.items.length);
  const { href, onClick, onHome } = useSectionLink();
  const menuOpen = panel === 'menu';

  // Scrolled state, and whether the bar sits over an ink section ([data-nav-dark]): the
  // bar takes that section's dark theme so it never reads as a light strip over the hero
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const y = 34; // the middle of the bar
      const dark = Array.from(document.querySelectorAll('[data-nav-dark]')).some((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top <= y && rect.bottom > y;
      });
      setOverDark(dark);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  // Escape closes the mobile menu
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') useUi.getState().closePanel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const openSearch = (event: React.MouseEvent) => {
    onClick(event, '#shop');
    const focus = () => document.getElementById('catalog-search')?.focus({ preventScroll: true });
    window.setTimeout(focus, onHome ? 700 : 1200);
  };

  const links = nav.links.map((link) => (
    <a key={link.label} href={href(link.href)} onClick={(event) => onClick(event, link.href)}>
      {link.label}
    </a>
  ));

  return (
    <>
      <header
        className={`nav ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''} ${overDark ? 'theme-dark' : ''}`}
      >
        <div className="container nav-inner">
          <a
            href={href('#top')}
            onClick={(event) => onClick(event, '#top')}
            aria-label="StepUp BD home"
          >
            <Logo />
          </a>
          <nav className="nav-links" aria-label="Main">
            {links}
          </nav>
          <div className="nav-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label="Search sneakers"
              onClick={openSearch}
            >
              <FiSearch />
            </button>
            <button
              type="button"
              key={`wish-${wishPulse}`}
              className={`icon-btn ${wishPulse ? 'bump' : ''}`}
              aria-label={`Wishlist, ${wishCount} ${wishCount === 1 ? 'item' : 'items'}`}
              onClick={() => useUi.getState().openPanel('wishlist')}
            >
              <FiHeart />
              <span
                className={`count ${wishCount ? 'has' : ''} ${wishPulse ? 'bump' : ''}`}
                aria-hidden="true"
              >
                {wishCount}
              </span>
            </button>
            <button
              type="button"
              key={`cart-${cartPulse}`}
              className={`icon-btn ${cartPulse ? 'bump' : ''}`}
              aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
              onClick={() => useUi.getState().openPanel('cart')}
            >
              <FiShoppingBag />
              <span
                className={`count ${cartCount ? 'has' : ''} ${cartPulse ? 'bump' : ''}`}
                aria-hidden="true"
              >
                {cartCount}
              </span>
            </button>
            <button
              type="button"
              className="icon-btn burger"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => useUi.getState().togglePanel('menu')}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      <nav
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? 'open' : ''} ${overDark ? 'theme-dark' : ''}`}
        aria-label="Mobile"
        aria-hidden={!menuOpen}
      >
        {links}
        <a href="/track" onClick={(event) => onClick(event, '/track')}>
          Track order
        </a>
      </nav>
    </>
  );
}
