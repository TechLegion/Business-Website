const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Route for index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for other HTML files
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/view-contacts', (req, res) => {
  res.sendFile(path.join(__dirname, 'view-contacts.html'));
});

app.get('/business-card', (req, res) => {
  res.sendFile(path.join(__dirname, 'business-card.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Frontend server running on http://localhost:${PORT}`);
  console.log(`📄 Serving static files from: ${__dirname}`);
});

