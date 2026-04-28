const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all questions
router.get('/', async (req, res) => {
  try {
    const [questions] = await pool.query('SELECT * FROM questions ORDER BY id');
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get specific question by ID
router.get('/:id', async (req, res) => {
  try {
    const [questions] = await pool.query('SELECT * FROM questions WHERE id = ?', [req.params.id]);
    if (questions.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(questions[0]);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

module.exports = router;
