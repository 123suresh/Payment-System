const Stripe = require("stripe");
const express = require("express");
const app1 = express();
const bodyParser = require("body-parser");
app1.use(bodyParser.raw({ type: "application/json" }));

const createPool = require("../../config/database");
const pool = createPool();

var http = require('http');

let sessionID;

// Endpoint for creating a Checkout Session
exports.userPayment = async (req, res) => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    userID = req.headers["x-user-id"];
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "rich dad and poor dad",
            images: [],
          },
          unit_amount: 10 * 100,
        },
        quantity: 12,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    const text =
      "INSERT INTO payment(userid, email, session_id, payment_id, amount, status) VALUES($1, $2, $3, $4, $5, $6) RETURNING *";
    const values = [
      req.headers["x-user-id"],
      req.headers["x-user-email"],
      session.id,
      null,
      lineItems[0].price_data.unit_amount,
      "pending",
    ];

    pool.query(text, values, (error, results) => {
      if (error) {
        throw error;
      }
    });

    sessionID = session.id;
    res.json({ id: session.id });
    // res.status(201).send(`Payment added with session id: ${session.id}`);
  } catch (error) {
    console.error("Error creating Checkout Session:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Webhook endpoint for handling events
exports.webhooks = async (req, res) => {
  let event;
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      "whsec_l5SN9IhXxJLpvRGIqk8H8UJoEzYjtyGt"
    );
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const paymentIntentId = session.payment_intent;

      // Retrieve the PaymentIntent and perform further actions
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId
        );

        const updateText =
          "UPDATE payment SET status = $1, payment_id = $2 WHERE session_id = $3 RETURNING *";
        const updateValues = [paymentIntent.status, paymentIntentId, sessionID];

        pool.query(updateText, updateValues, (updateError, updateResults) => {
          if (updateError) {
            throw updateError;
          }
          // Handle the results of the update query if needed
        });

        var data = {
          details:"hello this is noti"
        };

        var postData = JSON.stringify(data);
      
        var options = {
          host: 'localhost',
          port: 8082,
          path: '/notification',
          method: 'POST',
          // headers: {
          //   'Content-Type': 'application/x-www-form-urlencoded',
          //   'Content-Length': Buffer.byteLength(postData)
          // }
        };
      
        var httpreq = http.request(options);
        httpreq.write(postData);
        httpreq.end();
        //http post request to notification server start

        // Updating notification through proxy
        // app.notifyProxy();
        
      } catch (error) {
        console.error("Error retrieving PaymentIntent:", error);
      }

      break;

    // Handle other event types as needed

    default:
      return res.status(400).end();
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).end();
};
