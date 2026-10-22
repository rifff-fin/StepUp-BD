const Subscriber = require('../models/Subscriber');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// @desc    Subscribe an email to the newsletter (idempotent)
// @route   POST /api/newsletter   { email }
// @access  Public (rate limited)
const subscribe = async (req, res) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();

    if (!EMAIL_RE.test(email) || email.length > 254) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Upsert, so subscribing twice is not an error and does not reveal who is subscribed
    await Subscriber.updateOne(
      { email },
      { $setOnInsert: { email, source: 'newsletter-section' } },
      { upsert: true },
    );

    res.status(201).json({ message: "You're on the list! Watch your inbox for new drops." });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { subscribe };
