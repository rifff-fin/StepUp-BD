import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { HeroStory } from '../sections/HeroStory';
import { Trending } from '../sections/Trending';
import { Brands } from '../sections/Brands';
import { Shop } from '../sections/Shop';
import { Reviews } from '../sections/Reviews';
import { Faq } from '../sections/Faq';
import { Newsletter } from '../sections/Newsletter';
import { scrollToId } from '../lib/lenis';

export function HomePage() {
  const { hash } = useLocation();

  // Arriving from another page at '/#shop': go to the section once it has rendered
  useEffect(() => {
    if (!hash) return;
    const timer = window.setTimeout(() => scrollToId(hash), 350);
    return () => window.clearTimeout(timer);
  }, [hash]);

  return (
    <>
      <HeroStory />
      <Trending />
      <Brands />
      <Shop />
      <Reviews />
      <Faq />
      <Newsletter />
    </>
  );
}
