const express = require('express');
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

const payment = require('./routes/payment')

app.use('/api', payment)

module.exports = app;