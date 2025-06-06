// Example backend endpoint for ImageKit authentication
// This should be implemented in your miropet-server

const crypto = require("crypto");

// POST /api/imagekit-auth
const getImageKitAuth = (req, res) => {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY; // from your .env

  const token = req.body.token || Date.now().toString();
  const expire = req.body.expire || Date.now() + 3600 * 1000; // 1 hour from now

  // Create signature
  const signature = crypto
    .createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  res.json({
    token,
    expire,
    signature,
  });
};

module.exports = { getImageKitAuth };

// Usage in Express:
// app.post('/api/imagekit-auth', getImageKitAuth);
