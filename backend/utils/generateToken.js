const jwt = require('jsonwebtoken');

const generateToken = (userId, req, res) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: req.secure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

module.exports = generateToken;
