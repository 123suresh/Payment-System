const Stripe = require("stripe")
const express = require('express');
const app1 = express();
const bodyParser = require('body-parser');
app1.use(bodyParser.raw({ type: 'application/json' }));

// exports.userPayment = async (req, res) => {
//   const products = req.body.products
//   const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
//   const lineItems = products.map((product)=>({
//       price_data:{
//           currency:"usd",
//           product_data:{
//               name:product.dish,
//               images:[product.imgdata]
//           },
//           unit_amount:product.price * 100,
//       },
//       quantity:product.qnty
//   }));

//   const session = await stripe.checkout.sessions.create({
//       line_items:lineItems,
//       mode:"payment",
//       success_url:"http://localhost:3000/sucess",
//       cancel_url:"http://localhost:3000/cancel",
//   });

//   res.json({id:session.id})
//   };

// Endpoint for creating a Checkout Session
exports.userPayment= async (req, res) => {
      const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  try {
  const products = req.body.products

//   const lineItems = products.map((product)=>({
//       price_data:{
//           currency:"usd",
//           product_data:{
//               name:product.dish,
//               images:[product.imgdata]
//           },
//           unit_amount:product.price * 100,
//       },
//       quantity:product.qnty
//   }));
  
const lineItems = [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: "book",
          images: []
        },
        unit_amount: 10 * 100,
      },
      quantity: 12,
    },
  ];
  
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    console.log('Created session with ID:', session.id);

    res.json({ id: session.id }); // Respond with the session ID
  } catch (error) {
    console.error('Error creating Checkout Session:', error);
    res.status(500).send('Internal Server Error');
  }
}

// exports.userPayment = async (req, res) => {


//   const session = await stripe.checkout.sessions.create({
//       line_items:lineItems,
//       mode:"payment",
//       success_url:"http://localhost:3000/sucess",
//       cancel_url:"http://localhost:3000/cancel",
//   });

//   res.json({id:session.id})
//   };

// Webhook endpoint for handling events
exports.webhooks= async (req, res) => {
  let event;
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  console.log("con",req.headers['stripe-signature'])
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_l5SN9IhXxJLpvRGIqk8H8UJoEzYjtyGt');
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const paymentIntentId = session.payment_intent;
      console.log('PaymentIntent ID:', paymentIntentId);

      // Retrieve the PaymentIntent and perform further actions
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        console.log('PaymentIntent Status:', paymentIntent.status);
        // Perform additional actions based on the PaymentIntent status
      } catch (error) {
        console.error('Error retrieving PaymentIntent:', error);
      }

      break;

    // Handle other event types as needed

    default:
      return res.status(400).end();
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).end();
}

