const express = require('express');
const app = express();
const cors=require("cors");
const bodyParser = require('body-parser');

app.use(bodyParser.raw({ type: 'application/json' }));

app.use(express.json());
const corsOptions ={
    origin:'*', 
    credentials:true,
    optionSuccessStatus:200,
 }

const payment = require('./routes/payment')

app.use('/payment', payment)

app.use(cors(corsOptions))

module.exports = app;