const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const port = process.env.PORT || 3000;
const rootDir = __dirname;
const dataDir = path.join(rootDir, 'data');
const messagesFile = path.join(dataDir, 'contact-messages.json');

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const recipientEmail = process.env.RECIPIENT_EMAIL || 'kunalbhatt937@gmail.com';

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, '[]', 'utf8');
}

function readMessages() {
  try {
    const raw = fs.readFileSync(messagesFile, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function writeMessages(messages) {
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), 'utf8');
}

async function sendEmail(message) {
  if (!smtpUser || !smtpPass) {
    return { success: false, message: 'SMTP credentials are not configured.' };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  const mailOptions = {
    from: smtpUser,
    to: recipientEmail,
    subject: `Portfolio Contact: ${message.subject}`,
    text: `Name: ${message.name}\nEmail: ${message.email}\n\nMessage:\n${message.message}`
  };

  await transporter.sendMail(mailOptions);
  return { success: true };
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain; charset=utf-8'
  };
  return types[ext] || 'application/octet-stream';
}

function parseBody(body) {
  try {
    return JSON.parse(body);
  } catch {
    const params = new URLSearchParams(body);
    return Object.fromEntries(params.entries());
  }
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && reqUrl.pathname === '/api/contact') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const payload = parseBody(body);
        const message = {
          name: String(payload.name || '').trim(),
          email: String(payload.email || '').trim(),
          subject: String(payload.subject || '').trim(),
          message: String(payload.message || '').trim(),
          createdAt: new Date().toISOString(),
          ip: req.socket.remoteAddress || 'unknown'
        };

        if (!message.name || !message.email || !message.subject || !message.message) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, message: 'All fields are required.' }));
          return;
        }

        const messages = readMessages();
        messages.push(message);
        writeMessages(messages);

        const emailResult = await sendEmail(message);

        if (!emailResult.success) {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, message: 'Message saved locally, but email delivery is not configured yet.' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, message: 'Message sent and saved securely.' }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, message: 'Could not save message.' }));
      }
    });
    return;
  }

  let safePath = reqUrl.pathname === '/' ? '/index.html' : reqUrl.pathname;
  safePath = safePath.replace(/\/+/g, '/');
  const filePath = path.join(rootDir, safePath);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, () => {
  console.log(`Portfolio server running at http://localhost:${port}`);
});
