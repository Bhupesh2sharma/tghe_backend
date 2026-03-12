const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const testRoutes = require('./routes/test');
const adminRoutes = require('./routes/admin');
const categoriesRoutes = require('./routes/categories');
const destinationsRoutes = require('./routes/destinations');
const packagesRoutes = require('./routes/packages');
const itineraryTemplatesRoutes = require('./routes/itineraryTemplates');
const inclusionExclusionSetsRoutes = require('./routes/inclusionExclusionSets');
const paymentRefundPolicyTemplatesRoutes = require('./routes/paymentRefundPolicyTemplates');
const termsConditionTemplatesRoutes = require('./routes/termsConditionTemplates');
const uploadRoutes = require('./routes/upload');
const newsletterRoutes = require('./routes/newsletter');
const enquiriesRoutes = require('./routes/enquiries');
const contactsRoutes = require('./routes/contacts');
const analyticsRoutes = require('./routes/analytics');
const notificationsRoutes = require('./routes/notifications');
const { errorHandler } = require('./utils/errors');

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

const app = express();

// Behind Vercel/other proxies, trust the first proxy so that
// express-rate-limit and other middleware can safely use X-Forwarded-For.
app.set('trust proxy', 1);

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());

// Ensure a DB connection exists before handling any route. In serverless
// environments this will reuse the cached connection from ./db.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/test', testRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/destinations', destinationsRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/itinerary-templates', itineraryTemplatesRoutes);
app.use('/api/inclusion-exclusion-sets', inclusionExclusionSetsRoutes);
app.use('/api/payment-policies', paymentRefundPolicyTemplatesRoutes);
app.use('/api/terms-conditions', termsConditionTemplatesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/enquiries', enquiriesRoutes);
app.use('/api/contacts', contactsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Simple debug endpoint to verify that MONGODB_URI is visible to the server.
// Hit /check-env in your browser or via curl; remove or protect this in production.
app.get('/check-env', (req, res) => {
  res.send(process.env.MONGODB_URI ? 'ENV OK' : 'ENV MISSING');
});

app.use(errorHandler);

module.exports = app;
