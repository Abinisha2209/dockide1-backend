const student = require("/workspace/solution.js");
const fs = require("fs");

// Load dataset
const data = fs.readFileSync("/datasets/titanic.csv", "utf8")
  .trim()
  .split("\n")
  .map(line => line.split(","));

// Expected output: survival rate
const expected = "Survival rate: 0.38";
console.log("✅ Evaluator is running correctly!");

try {
  const output = student(data);
  if (output === expected) {
    console.log("✅ Test Passed!");
    process.exit(0);
  } else {
    console.log(`❌ Test Failed! Got: ${output}, Expected: ${expected}`);
    process.exit(1);
  }
} catch (err) {
  console.error("❌ Runtime Error:", err.message);
  process.exit(1);
}
