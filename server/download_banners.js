const https = require('https');
const fs = require('fs');
const path = require('path');

const downloads = [
  { id: 437654, path: '../public/assets/img/inner-page/breadcrumb-image2.jpg' }, // Renoir
  { id: 435882, path: '../public/assets/img/inner-page/contact-bg.jpg' }, // Cezanne
  { id: 436528, path: '../public/assets/img/inner-page/artists-bg.jpg' }, // Van Gogh Bedroom
  { id: 437329, path: '../public/assets/img/inner-page/faq-bg.jpg' }, // Seurat
  { id: 436121, path: '../public/assets/img/home1/about-img1.jpg' }, // Monet
  { id: 437980, path: '../public/assets/img/home1/about-img2.jpg' }, // Van Gogh
  { id: 435809, path: '../public/assets/img/home1/feature-img.jpg' }, // Renoir
  { id: 437998, path: '../public/assets/img/home1/artistic-img.png' }, // Van Gogh (save as png for filename compat)
  { id: 436535, path: '../public/assets/img/home1/home1-banner-bg1.jpg' }, // Van Gogh - Wheat Field
  { id: 438000, path: '../public/assets/img/home1/home1-banner-bg2.jpg' }, // Bruegel - Harvesters
  { id: 437984, path: '../public/assets/img/home1/home1-banner-bg3.jpg' }, // El Greco - Toledo
];

const getUrl = (id) => `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;

async function run() {
  for (const item of downloads) {
    console.log(`Fetching info for ${item.id}...`);
    try {
      const data = await new Promise((resolve, reject) => {
        https.get(getUrl(item.id), res => {
          let body = '';
          res.on('data', c => body += c);
          res.on('end', () => {
              try {
                  resolve(JSON.parse(body));
              } catch (e) {
                  reject(e);
              }
          });
          res.on('error', reject);
        });
      });

      const imgUrl = data.primaryImage;
      if (!imgUrl) {
        console.error(`No image for ${item.id}`);
        continue;
      }

      console.log(`Downloading ${imgUrl} to ${item.path}...`);
      const dest = path.join(__dirname, item.path);
      
      // Ensure directory exists
      const dir = path.dirname(dest);
      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir, { recursive: true });
      }

      await new Promise((resolve, reject) => {
        https.get(imgUrl, res => {
          if (res.statusCode !== 200) {
              reject(new Error(`Status ${res.statusCode}`));
              return;
          }
          const file = fs.createWriteStream(dest);
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
          file.on('error', err => {
              fs.unlink(dest, () => {});
              reject(err);
          });
        }).on('error', reject);
      });
      console.log('Done.');

    } catch (e) {
      console.error(`Error for ${item.id}:`, e.message);
    }
  }
}

run();
