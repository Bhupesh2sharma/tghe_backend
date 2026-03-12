const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { ApiError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV !== 'test') {
  console.warn('JWT_SECRET is not set. Admin auth will fail.');
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET || '');
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
  Admin.findById(decoded.sub)
    .then((admin) => {
      if (!admin) return next(new ApiError(401, 'Admin not found'));
      req.admin = admin;
      next();
    })
    .catch(next);
}

module.exports = { requireAuth };
