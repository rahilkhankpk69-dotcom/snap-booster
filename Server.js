  const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Supabase Postgres connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// Tables banao (pehle baar chalega)
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS scores (
    username TEXT PRIMARY KEY REFERENCES users(username),
    score INTEGER DEFAULT 0
  );
`).catch(err => console.log(err));

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Sab daal!' });

  try {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
    await pool.query('INSERT INTO scores (username) VALUES ($1)', [username]);
    res.json({ success: true, message: 'Registered! Ab login kar.' });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Username pehle se hai!' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
  if (result.rows.length === 0) return res.status(401).json({ error: 'Galat credentials!' });

  const scoreResult = await pool.query('SELECT score FROM scores WHERE username = $1', [username]);
  const score = scoreResult.rows[0]?.score || 0;
  res.json({ success: true, username, score });
});

// Boost
app.post('/api/boost', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username chahiye' });

  const increase = Math.floor(Math.random() * 15000) + 3000;
  await pool.query('UPDATE scores SET score = score + $1 WHERE username = $2', [increase, username]);

  const newScoreResult = await pool.query('SELECT score FROM scores WHERE username = $1', [username]);
  const newScore = newScoreResult.rows[0]?.score || 0;

  res.json({ success: true, newScore, increase });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chal raha hai!`));
