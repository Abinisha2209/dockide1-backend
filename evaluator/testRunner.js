const fs = require('fs');
const { exec } = require('child_process');

function runTest(studentCodePath, testCasePath, expectedSolutionPath) {
    const testCases = JSON.parse(fs.readFileSync(testCasePath));
    const expectedSolution = fs.readFileSync(expectedSolutionPath, 'utf8');

    testCases.forEach(testCase => {
        const inputData = testCase.input;
        const expectedOutput = testCase.expected;

        exec(`python ${studentCodePath} "${inputData}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing student's code: ${stderr}`);
                return;
            }

            const actualOutput = stdout.trim();
            if (actualOutput === expectedOutput) {
                console.log(`Test case passed for input: ${inputData}`);
            } else {
                console.log(`Test case failed for input: ${inputData}. Expected: ${expectedOutput}, but got: ${actualOutput}`);
            }
        });
    });
}

module.exports = { runTest };