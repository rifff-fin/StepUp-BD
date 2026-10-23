const jwt = require('jsonwebtoken');

/**
 * Protects the admin API: requires `Authorization: Bearer <token>` signed with JWT_SECRET
 * (issued by POST /api/admin/login) and an admin role.
 */
const adminAuth = (req, res, next) => {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || !process.env.JWT_SECRET) {
    return res.status(401).json({ message: 'Please log in' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') throw new Error('not admin');
    req.admin = { email: payload.sub };
    next();
  } catch {
    res.status(401).json({ message: 'Your session has expired, please log in again' });
  }
};

module.exports = { adminAuth };
