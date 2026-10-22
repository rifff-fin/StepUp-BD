// All marketing copy lives here. Items marked TODO(client) need StepUp BD to confirm them.

export const site = {
  name: 'StepUp BD',
  tagline: 'Premium, but Affordable.',
  email: 'hello@stepupbd.example', // TODO(client): real support email
  phoneDisplay: '+880 1700-000000', // TODO(client): real phone
  // WhatsApp number in international format without "+" (VITE_WHATSAPP_NUMBER overrides)
  whatsapp: (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || '8801700000000',
  whatsappMessage: 'Hi StepUp BD! I have a question about a pair of sneakers.',
  address: 'House 12, Road 7, Dhanmondi, Dhaka 1205', // TODO(client): real address
  hours: 'Sat–Thu, 10 AM – 9 PM', // TODO(client): real opening hours
  socials: [
    // TODO(client): real profile links
    { id: 'facebook', label: 'Facebook', href: 'https://facebook.com/' },
    { id: 'instagram', label: 'Instagram', href: 'https://instagram.com/' },
    { id: 'tiktok', label: 'TikTok', href: 'https://tiktok.com/' },
    { id: 'youtube', label: 'YouTube', href: 'https://youtube.com/' },
  ],
  builtBy: { label: 'Fin Projukti', href: 'https://finprojukti.tech' },
} as const;

export const nav = {
  links: [
    { href: '#top', label: 'Home' },
    { href: '#shop', label: 'Shop' },
    { href: '#trending', label: 'Trending' },
    { href: '#why', label: 'Why Us' },
    { href: '#reviews', label: 'Reviews' },
    { href: '#faq', label: 'FAQ' },
  ],
};

export const hero = {
  titleSolid: 'StepUp',
  titleAccent: 'BD',
  tagline: 'Premium, but',
  taglineAccent: 'Affordable.',
  lede: 'Authentic Nike, Jordan, Adidas, Puma and New Balance pairs from ৳3,000, delivered to your door anywhere in Bangladesh.',
  cta: 'Shop Now',
  ctaSecondary: 'Trending',
  colorLabel: 'Pick a colourway',
  dragHint: 'Drag to rotate',
  fallbackNote: '3D preview unavailable on this device',
  // TODO(client): confirm these numbers
  stats: [
    { value: '10K', accent: '+', label: 'Pairs sold' },
    { value: '4.9', accent: '★', label: 'Avg rating' },
    { value: '64', accent: '', label: 'Districts' },
  ],
};

export const marquee = ['Nike', 'Jordan', 'Air Force', 'Adidas', 'Puma', 'New Balance', 'Asics'];

export const why = {
  eyebrow: 'Why StepUp BD',
  title: 'Built on',
  titleAccent: 'trust',
  lede: 'Thousands of sneakerheads across Bangladesh buy from us because we keep it simple: real pairs, fair prices, zero hassle.',
  items: [
    {
      icon: 'shield',
      title: '100% Authentic',
      // TODO(client): confirm the authenticity guarantee terms
      text: 'Every pair is checked by hand before it ships. If a pair is not genuine, you get a full refund.',
    },
    {
      icon: 'cash',
      title: 'Cash on Delivery',
      text: 'Pay when the box is in your hands. Available in all 64 districts. bKash and Nagad too.',
    },
    {
      icon: 'return',
      title: '7-Day Easy Return',
      text: 'Wrong size or changed your mind? Return or exchange within 7 days, no questions asked.',
    },
    {
      icon: 'truck',
      title: 'Fast Dhaka Delivery',
      text: 'Order before 5 PM for delivery in 24 to 48 hours inside Dhaka. 3 to 5 days elsewhere.',
    },
  ],
};

export const trending = {
  eyebrow: 'Hot right now',
  title: 'Trending',
  titleAccent: 'drops',
};

export const shop = {
  eyebrow: 'The collection',
  title: 'Shop the',
  titleAccent: 'drop',
  lede: 'Filter by brand, size, colour and budget. Every price includes VAT.',
  searchPlaceholder: 'Search Jordan, Dunk, Samba…',
  tabs: ['All', 'Sneakers', 'Running', 'Lifestyle', 'Basketball'],
  sorts: [
    { value: 'popular', label: 'Popular' },
    { value: 'new', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
  ],
  emptyTitle: 'No pairs found',
  emptyText: 'Try a different search or clear a few filters.',
  slowServer: 'Waking up the server, this can take a few seconds…',
  loadError: "We couldn't load the shoes. Check your connection and try again.",
};

// Sample content: shown with a clear "sample reviews" label until real reviews exist.
export const reviews = {
  eyebrow: 'Customer love',
  title: 'Real talk',
  sampleLabel: 'Sample reviews: illustrative content, not real customers',
  items: [
    {
      name: 'Rafiq H.',
      place: 'Dhanmondi, Dhaka',
      rating: 5,
      text: 'Ordered the AJ1 Bred at 2 PM and it was at my door the next morning. Box was perfect, the pair was legit. COD made it stress-free.',
    },
    {
      name: 'Nusrat J.',
      place: 'Chattogram',
      rating: 5,
      text: 'Was scared about buying sneakers online but StepUp checked everything. Samba fits true to size. Will buy again for sure!',
    },
    {
      name: 'Tanvir A.',
      place: 'Sylhet',
      rating: 4,
      text: 'Great price for the Pegasus, cheaper than anywhere I checked. Delivery took 4 days to Sylhet but they kept me updated.',
    },
    {
      name: 'Mehjabin K.',
      place: 'Uttara, Dhaka',
      rating: 5,
      text: "Exchanged my size within 2 days, super easy. The Dunk Panda is my everyday shoe now. Love this shop's vibe.",
    },
    {
      name: 'Shakib R.',
      place: 'Rajshahi',
      rating: 5,
      text: 'Used STEPUP10 and got the AF1 for less than the mall price. Packaging was premium too. 10/10.',
    },
    {
      name: 'Arif M.',
      place: 'Khulna',
      rating: 4,
      text: 'NB 550 looks even better in person. Support on WhatsApp answered my size question in minutes.',
    },
  ],
};

// Sample per-product reviews for the quick view (3 are picked per product, labelled "sample")
export const productReviews = {
  title: 'What buyers say',
  sampleLabel: 'Sample reviews',
  names: [
    'Sadia R.',
    'Imran H.',
    'Farhan K.',
    'Tasnim A.',
    'Rakib S.',
    'Jannat F.',
    'Nafis M.',
    'Ayesha B.',
    'Sabbir T.',
    'Priya D.',
  ],
  places: [
    'Mirpur',
    'Gulshan',
    'Uttara',
    'Chattogram',
    'Sylhet',
    'Khulna',
    'Bashundhara',
    'Cumilla',
  ],
  texts: [
    'Exactly like the pictures. Fits true to size and the box arrived without a dent.',
    'Super comfortable from day one, no break-in needed. Already planning my next pair.',
    'Got so many compliments at university. Quality is way better than I expected for the price.',
    'Delivery was quick and the rider called before coming. Paid cash, zero hassle.',
    'Ordered my usual size and it fits perfectly. Stitching and sole feel premium.',
    'Colour is even nicer in person. Wore them all week and they still look new.',
    'Exchanged for a bigger size within two days. Great service from the team.',
    'Light on the feet and great for long days. Worth every taka.',
  ],
};

export const faq = {
  eyebrow: 'Questions',
  title: 'Got',
  titleAccent: 'questions?',
  lede: "Can't find your answer? Message us on WhatsApp, we usually reply within minutes.",
  items: [
    {
      q: 'Are your sneakers 100% authentic?',
      // TODO(client): confirm sourcing and refund terms
      a: 'Yes. We source from authorised distributors and verified sellers, and every pair is checked by hand before it ships. If a pair is ever found not to be genuine, you get a full refund.',
    },
    {
      q: 'How long does delivery take?',
      a: 'Inside Dhaka: 24 to 48 hours (৳100). Outside Dhaka: 3 to 5 working days (৳150). You get a call from the courier before delivery.',
    },
    {
      q: 'Can I pay with Cash on Delivery?',
      a: 'Yes, Cash on Delivery is available all over Bangladesh. You can also pay with bKash, Nagad or a card.',
    },
    {
      q: 'What is your return and exchange policy?',
      a: 'You have 7 days from delivery to return or exchange unworn shoes in their original box. Size exchanges are free inside Dhaka.',
    },
    {
      q: 'How do I choose the right size?',
      a: 'All sizes are EU. Most of our customers wear their usual size; for Jordan 1 and Dunk, half a size down is fine for narrow feet. Not sure? Ask us on WhatsApp.',
    },
    {
      q: 'Do you have discount codes?',
      a: 'Use STEPUP10 at checkout for 10% off your order. Join the newsletter to get early access to drops and member-only deals.',
    },
  ],
};

export const newsletter = {
  title: 'Never miss a drop',
  lede: 'New arrivals, restocks and member-only deals. One email a week, no spam.',
  placeholder: 'Your email address',
  button: 'Subscribe',
};

export const footer = {
  about:
    'Premium sneakers at fair prices for Bangladesh. Authentic pairs, Cash on Delivery and 7-day easy returns.',
  columns: { shop: 'Shop', help: 'Help', contact: 'Contact' },
  shopLinks: [
    { href: '#shop', label: 'All sneakers' },
    { href: '#trending', label: 'Trending' },
    { href: '#shop', label: 'New arrivals' },
  ],
  helpLinks: [
    { href: '/track', label: 'Track your order' },
    { href: '#faq', label: 'Delivery & returns' },
    { href: '#faq', label: 'Size guide' },
  ],
  demoNote: 'Demo store, no real orders are fulfilled and no real payments are taken.',
  crafted: 'Website by',
};

export const checkout = {
  demoBanner: 'DEMO MODE: no real payment is processed',
  steps: ['Shipping', 'Payment', 'Review', 'Done'],
  testCardNote:
    'Demo only. Use test card 4242 4242 4242 4242, any future expiry and any 3-digit CVC. Never enter a real card: nothing is stored or sent.',
  walletNote: 'Demo PIN is 12345. Never enter your real PIN here: nothing is stored or sent.',
};
