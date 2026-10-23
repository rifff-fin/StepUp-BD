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
  // the floating "built by" card (bottom-left)
  credit: {
    short: 'Built by Fin Projukti',
    title: 'Want a website like this?',
    text: 'Fin Projukti builds online stores, 3D product pages, admin panels and apps for Bangladeshi businesses.',
    cta: 'Contact Fin Projukti',
  },
} as const;

export const nav = {
  links: [
    { href: '#shop', label: 'Shop all' },
    { href: '#trending', label: 'Trending' },
    { href: '#brands', label: 'Brands' },
    { href: '#reviews', label: 'Reviews' },
    { href: '#faq', label: 'Help' },
  ],
  // the announcement bar above the navbar (phones show the first message only)
  announcement: [
    'Cash on Delivery in all 64 districts',
    '৳100 delivery inside Dhaka',
    '7-day exchange',
  ],
  track: 'Track order',
};

export const hero = {
  offer: { code: 'STEPUP10', text: '10% off your first order' },
  title: 'Premium, but Affordable.',
  lede: 'Air Jordan, Dunk, Air Force 1, Samba and New Balance from ৳3,500. Cash on Delivery anywhere in Bangladesh.',
  cta: 'Shop the collection',
  ctaSecondary: 'Trending now',
  // quick brand chips under the buttons: each filters the shop
  quickBrands: ['Jordan', 'Nike', 'Air Force', 'Adidas', 'New Balance'],
  trust: ['Cash on Delivery', '7-day exchange', 'All 64 districts'],
  model: 'Air Jordan 1 High OG',
  colorLabel: 'Colourway',
  dragHint: 'Drag to turn',
  fallbackNote: '3D preview unavailable on this device',
};

// The short scroll story under the hero: the 3D shoe turns to each detail. The 3D shoe is
// for the look only; it is not a product for sale.
export const story = {
  steps: [
    {
      eyebrow: '01 / 03',
      title: 'The 1985 original',
      text: 'The Air Jordan 1 High OG silhouette: leather upper, Air unit in the heel.',
    },
    {
      eyebrow: '02 / 03',
      title: 'Perforated toe box',
      text: 'Perforations across the toe for airflow, framed by the toe overlay.',
    },
    {
      eyebrow: '03 / 03',
      title: 'Wings on the collar',
      text: 'The Wings logo pressed into the ankle collar, with a padded lining.',
    },
  ],
  cta: 'Find your pair',
  motionOff: 'Animations are off on this device',
  motionOn: 'Turn on motion',
};

// The service strip under the hero
export const why = {
  title: 'Why shop with StepUp BD',
  items: [
    {
      icon: 'shield',
      title: 'Checked by hand',
      // TODO(client): confirm the authenticity guarantee terms
      text: 'Every pair is inspected before it ships. Not genuine? Full refund.',
    },
    {
      icon: 'cash',
      title: 'Pay on delivery',
      text: 'Cash on Delivery in all 64 districts, or bKash, Nagad and card.',
    },
    {
      icon: 'return',
      title: '7-day exchange',
      text: 'Wrong size? Exchange or return unworn pairs within 7 days.',
    },
    {
      icon: 'truck',
      title: 'Dhaka in 24–48 hours',
      text: 'Order by 5 PM. 3 to 5 days to the rest of Bangladesh.',
    },
  ],
};

export const trending = {
  title: 'Trending now',
  link: 'Shop all',
};

// "Shop by brand" tiles: each filters the catalog to that brand
export const brands = {
  title: 'Shop by brand',
  items: [
    { brand: 'Jordan', models: 'AJ1 High, Mid and Low', image: 'air-jordan-1-high-og-chicago' },
    { brand: 'Nike', models: 'Dunk Low', image: 'nike-dunk-low-grey-fog' },
    { brand: 'Air Force', models: 'Air Force 1 Low', image: 'air-force-1-low-panda' },
    { brand: 'Adidas', models: 'Samba, Campus 00s', image: 'adidas-samba-og-white-black' },
    { brand: 'New Balance', models: '550, 530', image: 'nb-550-white-green' },
  ],
};

export const shop = {
  title: 'All sneakers',
  lede: 'Every pair ships with Cash on Delivery.',
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
  title: 'Reviews',
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
  title: 'Help & FAQ',
  lede: "Can't find your answer? Message us on WhatsApp.",
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
  title: 'New arrivals by email',
  lede: 'Restocks and new pairs, once a week. No spam.',
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
  // CC BY 4.0 requires this credit for the 3D model
  modelCredit: {
    text: '3D model: “Air Jordan 1” by makoto, CC BY 4.0, recoloured and adapted',
    href: 'https://sketchfab.com/3d-models/air-jordan-1-a4b434181fbb48008ad460722fd53725',
    license: 'https://creativecommons.org/licenses/by/4.0/',
  },
};

export const checkout = {
  demoBanner: 'DEMO MODE: no real payment is processed',
  steps: ['Shipping', 'Payment', 'Review', 'Done'],
  testCardNote:
    'Demo only. Use test card 4242 4242 4242 4242, any future expiry and any 3-digit CVC. Never enter a real card: nothing is stored or sent.',
  walletNote: 'Demo PIN is 12345. Never enter your real PIN here: nothing is stored or sent.',
};
