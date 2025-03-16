const cookieParser = require('cookie-parser');
const express = require('express');
const userModel = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const router = express.Router();
app.use(cookieParser()); // Use cookie-parser middleware


// Middleware for body parsing
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

const salt = bcrypt.genSaltSync(10);
const secret = 'sjkdfcshdbsbhjvdjbzzbchjbsahdzjbhxcj';

// Utility function for error handling
function handleError(res, status, message) {
  return res.status(status).json({ success: false, message });
}


// Register Route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await userModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.username === username ? 'Username already exists. Try Again' : 'Email already exists. Try Again',
      });
    }

    const hashedPassword = bcrypt.hashSync(password, salt);
    const newUser = await userModel.create({ username, email, password: hashedPassword });

    // Generate JWT token upon successful registration
    jwt.sign({ username: newUser.username, id: newUser._id ,email : newUser.email }, secret, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err);
        return handleError(res, 500, 'Internal Server Error');
      }

      // Set token as a cookie for auto-login
      res
        .cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' })
        .status(201)
        .json({ success: true, user: newUser, message: 'Registered and logged in successfully' });
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return handleError(res, 500, 'Internal Server Error');
  }
});


// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userDoc = await userModel.findOne({ email });
    if (!userDoc) {
      return handleError(res, 400, 'User not found');
    }

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (!passOk) {
      return handleError(res, 401, 'Incorrect password');
    }

    // Fix JWT sign issue
    jwt.sign({ username: userDoc.username, id: userDoc._id ,email : userDoc.email }, secret, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err);
        return handleError(res, 500, 'Internal Server Error');
      }

      // Correct way to send cookie and response together
      res
        .cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' })
        .status(200)
        .json({ success: true, message: 'Login successful' });
    });
    // console.log(token);
  } catch (error) {
    console.error('Error logging in:', error);
    return handleError(res, 500, 'Internal Server Error');
  }
});


router.get('/user', (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, secret, (err, info) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
    res.json({ success: true, user: info });
  });
});


// Logout Route
router.post('/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
