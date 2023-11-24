const express = require('express');
const router = express.Router();

const {userPayment, webhooks} = require('../controller/payment/payment')

router.route('/create-checkout-session').post(userPayment);
router.route('/webhooks').post(webhooks);

module.exports = router;