const fs = require('fs');
const path = require('path');

exports.errorHandler = (err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  try {
    const logPath = path.join(__dirname, '../server_error.log');
    const logEntry = `[${new Date().toISOString()}] ${err.message}\nStack: ${err.stack}\n\n`;
    fs.appendFileSync(logPath, logEntry);
  } catch (logErr) {
    console.error("Failed to write to log file:", logErr);
  }

  res.status(500).json({
    error: 'Server error',
    message: err.message,
    stack: err.stack
  });
};
