const http = require('http');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');
const rateLimit = require("express-rate-limit");

// pb avec connect password cluster avant
mongoose.connect('mongodb+srv://armelle:J7ZLDLzv8RXKbEq9@cluster0.bra5w.mongodb.net/piiquante?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use('/images', express.static(path.join(__dirname, 'images')));
// app.use(express.static(__dirname + '/images'));
// app.use('/images', express.static(__dirname + '/images'));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Creating a limiter by calling rateLimit function with options:
// max contains the maximum number of request and windowMs 
// Time in millisecond so only max amount of 
// request can be made in windowMS time.
const limiter = rateLimit({
  max: 10,
  windowMs: 1000,
  message: "Too many request from this IP"
});

app.use(limiter);
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;