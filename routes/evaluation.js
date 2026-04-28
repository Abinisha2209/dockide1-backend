const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');

router.post('/submit', evaluationController.submitSolution);
router.get('/results/:id', evaluationController.getResults);

module.exports = router;