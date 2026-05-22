const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allows loading media from external sources
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get music library (optional - can be extended later)
app.get('/api/library', (req, res) => {
  const library = require('./library.json');
  res.json(library);
});

// Download endpoint (proxies downloads to avoid CORS issues)
app.get('/api/download', async (req, res) => {
  const { url, filename } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  try {
    const response = await fetch(url);
    const buffer = await response.buffer();
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', response.headers.get('content-type'));
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});

// Health check endpoint for Heroku
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CopperFlorence Music App is running on port ${PORT}`);
  console.log(`📱 Access it at http://localhost:${PORT}`);
  console.log(`✨ Ready for Heroku deployment!`);
});
