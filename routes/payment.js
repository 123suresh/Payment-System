const express = require('express');
const router = express.Router();

const {userPayment} = require('../controller/payment/payment')

router.route('/create-checkout-session').post(userPayment);

module.exports = router;