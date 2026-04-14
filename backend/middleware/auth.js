import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const auth  = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      console.warn('[auth] No Bearer token in request to', req.path);
      return res.status(401).json({ message: 'Not authorized — no token provided' });
    }

    const token = auth.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      console.warn('[auth] JWT verify failed:', jwtErr.message);
      return res.status(401).json({ message: 'Not authorized — token expired or invalid' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.warn('[auth] User not found for id:', decoded.id);
      return res.status(401).json({ message: 'Not authorized — user not found' });
    }

    req.user = user;
    next();
  } catch (e) {
    console.error('[auth] Unexpected error:', e.message);
    res.status(401).json({ message: 'Not authorized' });
  }
};
