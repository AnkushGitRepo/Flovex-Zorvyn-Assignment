const express = require('express');
const router = express.Router();
const {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  processDue,
} = require('../controllers/subscriptionController');

// Must be defined before /:id to avoid route collision
router.post('/process-due', processDue);

router.route('/').get(getSubscriptions).post(createSubscription);
router.route('/:id').get(getSubscription).put(updateSubscription).delete(deleteSubscription);

module.exports = router;
