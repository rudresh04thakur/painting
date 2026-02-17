
export async function getServerSideProps({ res }) {
  const mongoose = require('mongoose');
  const { Painting } = require('../server/models/Painting');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Ensure DB connection if not already
  if (mongoose.connection.readyState === 0) {
     await mongoose.connect(process.env.MONGODB_URI);
  }

  // Fetch all visible paintings
  const paintings = await Painting.find({ visible: true }, '_id updatedAt').lean();

  const staticPages = [
    '',
    '/about',
    '/artists',
    '/contact',
    '/faq',
    '/gallery',
    '/privacy',
    '/refund',
    '/shipping',
    '/support',
    '/terms',
    '/login',
    '/signup'
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticPages
        .map((url) => {
          return `
            <url>
              <loc>${baseUrl}${url}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>daily</changefreq>
              <priority>0.7</priority>
            </url>
          `;
        })
        .join('')}
      ${paintings
        .map(({ _id, updatedAt }) => {
          return `
            <url>
              <loc>${baseUrl}/painting/${_id}</loc>
              <lastmod>${updatedAt ? new Date(updatedAt).toISOString() : new Date().toISOString()}</lastmod>
              <changefreq>weekly</changefreq>
              <priority>0.8</priority>
            </url>
          `;
        })
        .join('')}
    </urlset>
  `;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function Sitemap() {
  return null;
}
