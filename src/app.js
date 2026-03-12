const express = require('express');
const cors = require('cors');
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
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());

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

app.use(errorHandler);

module.exports = app;
