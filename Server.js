  const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // frontend files yahan se serve honge

// Files
const USERS_FILE = path.join(__dirname, 'users.json');
const SCORES_FILE = path.join(__dirname, 'scores.json');

// Empty files bana do agar nahi hain
if (!fs.existsSync(USERS_FILE)) fs.writeJsonSync(USERS_FILE, {});
if (!fs.existsSync(SCORES_FILE)) fs.writeJsonSync(SCORES_FILE, {});

function readJson(file) {
  try { return fs.readJsonSync(file); } catch { return {}; }
}

function writeJson(file, data) {
  fs.writeJsonSync(file, data, { spaces: 2 });
}

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username aur password daal!' });

  const users = readJson(USERS_FILE);
  if (!users[username] || users[username] !== password) {
    return res.status(401).json({ error: 'Galat credentials!' });
  }

  const scores = readJson(SCORES_FILE);
  const score = scores[username] || 0;

  res.json({ success: true, username, score });
});

// Register API (fake/demo)
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Sab daal!' });

  const users = readJson(USERS_FILE);
  if (users[username]) return res.status(409).json({ error: 'Username already taken!' });

  users[username] = password;
  writeJson(USERS_FILE, users);

  const scores = readJson(SCORES_FILE);
  scores[username] = 0;
  writeJson(SCORES_FILE, scores);

  res.json({ success: true });
});

// Get Score
app.get('/api/score/:username', (req, res) => {
  const { username } = req.params;
  const scores = readJson(SCORES_FILE);
  res.json({ score: scores[username] || 0 });
});

// Boost Score
app.post('/api/boost', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username chahiye' });

  const scores = readJson(SCORES_FILE);
  let score = scores[username] || 0;
  const increase = Math.floor(Math.random() * 15000) + 3000;
  score += increase;
  scores[username] = score;
  writeJson(SCORES_FILE, scores);

  res.json({ success: true, newScore: score, increase });
});

app.listen(PORT, () => {
  console.log(`Server chal raha hai port ${PORT}`);
});
