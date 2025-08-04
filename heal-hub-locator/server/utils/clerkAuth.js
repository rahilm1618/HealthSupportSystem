const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://causal-baboon-16.clerk.accounts.dev/.well-known/jwks.json', // <-- Clerk domain replaced
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

const clerkAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token', error: err.message });
      }
      req.clerkUser = decoded;
      req.userId = decoded.sub; // Clerk user id
      next();
    });
  } catch (error) {
    console.error('Clerk auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = clerkAuth;
