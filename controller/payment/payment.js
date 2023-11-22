const Stripe = require("stripe")

exports.userPayment = async (req, res) => {
    console.log("user ", req)
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const {products} = req.body;
  const lineItems = products.map((product)=>({
      price_data:{
          currency:"usd",
          product_data:{
              name:product.dish,
              images:[product.imgdata]
          },
          unit_amount:product.price * 100,
      },
      quantity:product.qnty
  }));

  const session = await stripe.checkout.sessions.create({
      line_items:lineItems,
      mode:"payment",
      success_url:"http://localhost:3000/sucess",
      cancel_url:"http://localhost:3000/cancel",
  });

  res.json({id:session.id})
  };
  