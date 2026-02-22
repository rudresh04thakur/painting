const next = require('next');
const path = require('path');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const serverApp = require('./app');
const { initCloudinary } = require('./util/cloudinary');

async function start() {
  await app.prepare();
  initCloudinary();

  // Use the API routes defined in app.js
  // Next.js pages/api are not used when running with this custom server,
  // but we keep consistency by routing through serverApp.

  // The serverApp already has /api routes.
  // We attach the Next.js handler for everything else.
  serverApp.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  serverApp.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}

start();
