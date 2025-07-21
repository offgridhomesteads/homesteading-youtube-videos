// Minimal test endpoint
module.exports = (req, res) => {
  return res.status(200).json({ 
    message: "Basic function works",
    timestamp: new Date().toISOString()
  });
}
