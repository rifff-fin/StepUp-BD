import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Hero } from '../sections/Hero';
import { BrandMarquee } from '../sections/BrandMarquee';
import { FeaturedBred } from '../sections/FeaturedBred';
import { WhyUs } from '../sections/WhyUs';
import { Trending } from '../sections/Trending';
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
      <Hero />
      <BrandMarquee />
      <FeaturedBred />
      <WhyUs />
      <Trending />
      <Shop />
      <Reviews />
      <Faq />
      <Newsletter />
    </>
  );
}
