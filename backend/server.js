// server.js

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Allow server to accept JSON data

// --- ?? UPDATE YOUR DATABASE CONNECTION DETAILS HERE ---
const db = mysql.createPool({
  host: 'localhost',      // Your MySQL host (usually 'localhost')
  user: 'root',           // Your MySQL username
  password: '6299', // Your MySQL password
  database: 'safety_hub'
}).promise();


// ===================================
//      API ROUTES
// ===================================

// 1. User Sign Up Route
app.post('/api/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'Please fill all fields.' });
  }

  try {
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = 'INSERT INTO users (full_name, email, phone, password) VALUES (?, ?, ?, ?)';
    await db.query(query, [name, email, phone, hashedPassword]);

    res.status(201).json({ message: '✅ Account created successfully! Welcome ' + name });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: '❌ Server error during account creation.' });
  }
});


// 2. User Sign In Route
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter Email and Password.' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: '❌ Invalid credentials. User not found.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '❌ Invalid credentials. Incorrect password.' });
    }

    res.status(200).json({
      message: '✅ Welcome back, ' + user.full_name,
      user: {
        name: user.full_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signin Error:', error);
    res.status(500).json({ message: '❌ Server error during sign-in.' });
  }
});


// 3. Help Request Route
app.post('/api/help', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Please fill all fields.' });
    }

    try {
        const query = 'INSERT INTO help_requests (name, email, message) VALUES (?, ?, ?)';
        await db.query(query, [name, email, message]);
        res.status(201).json({ message: '✅ Help request submitted! We will get back to you shortly.' });
    } catch (error) {
        console.error('Help Request Error:', error);
        res.status(500).json({ message: '❌ Server error during help request submission.' });
    }
});

// 4. Get Security Alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 10');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts' });
  }
});

// 5. World Chat - Send Message
app.post('/api/chat', async (req, res) => {
    const { user_name, user_email, message } = req.body;
    console.log(`📩 Chat Request received from ${user_name}: ${message}`);

    if (!user_name || !user_email || !message) {
        console.log('❌ Invalid chat data');
        return res.status(400).json({ message: 'Missing chat data.' });
    }

    try {
        const query = 'INSERT INTO messages (user_name, user_email, message) VALUES (?, ?, ?)';
        await db.query(query, [user_name, user_email, message]);
        res.status(201).json({ message: 'Message sent!' });
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ message: 'Error sending message.' });
    }
});

// 6. World Chat - Get Messages
app.get('/api/chat', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 50');
        res.json(rows.reverse()); // Reverse to show latest at bottom
    } catch (error) {
        console.error('Chat Fetch Error:', error);
        res.status(500).json({ message: 'Error fetching chat history.' });
    }
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});