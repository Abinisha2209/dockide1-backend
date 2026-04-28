const pool = require('../db');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

exports.submitSolution = async (req, res) => {
    const { email, questionId, code } = req.body;
    if (!email || !questionId || !code) {
        return res.status(400).json({ error: 'Email, questionId, and code are required' });
    }
    try {
        // Fetch question and testcases
        const [questions] = await pool.query('SELECT * FROM questions WHERE id = ?', [questionId]);
        if (!questions.length) return res.status(404).json({ error: 'Question not found' });
        const question = questions[0];
        const testcases = JSON.parse(question.testcases);

        // Write solution.py and testcases.json in student's container workspace
        const workspace = `/containers/dockide_${email}/workspace`;
        await fs.writeFile(path.join(workspace, 'solution.py'), code);
        await fs.writeFile(path.join(workspace, 'testcases.json'), JSON.stringify(testcases));

        // Run evaluator.py inside container
        exec(
            `docker exec dockide_${email} python3 /workspace/evaluator.py`,
            (err, stdout, stderr) => {
                if (err) return res.status(500).json({ error: stderr });
                try {
                    const rawResults = JSON.parse(stdout);
                    // Only return pass/fail for each test
                    const results = rawResults.map(r => ({ passed: !!r.passed }));
                    res.json({ results });
                } catch (e) {
                    res.status(500).json({ error: 'Evaluator error', details: stdout });
                }
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};