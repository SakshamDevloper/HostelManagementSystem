const generateReceiptNo = () => {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `RCP-${y}${m}${d}-${rand}`;
};

const generatePassNo = () => {
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `PASS-${rand}`;
};

module.exports = { generateReceiptNo, generatePassNo };
