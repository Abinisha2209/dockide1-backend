module.exports = function (data) {
  // Skip header
  const rows = data.slice(1);

  let survived = 0;
  let total = rows.length;

  rows.forEach(row => {
    const survivedCol = parseInt(row[1]); // Titanic dataset: 2nd col = Survived
    if (survivedCol === 1) survived++;
  });

  const rate = (survived / total).toFixed(2);
  return `Survival rate: ${rate}`;
};
