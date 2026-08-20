const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5173;
const BASE = path.join(__dirname, '.');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  try {
    let url = decodeURIComponent(req.url.split('?')[0]);
    if (url === '/') url = '/index.html';
    const file = path.join(BASE, url);
    if (!file.startsWith(BASE)) return res.endStatus?.(403) || (res.statusCode = 403, res.end('Forbidden'));
    fs.readFile(file, (err, data) => {
      if (err) return (res.statusCode = 404, res.end('Not found'));
      const ext = path.extname(file);
      res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
      res.end(data);
    });
  } catch (e) {
    res.statusCode = 500; res.end('Server error');
  }
}).listen(PORT, () => console.log(`Serving ./ on http://localhost:${PORT}`));
