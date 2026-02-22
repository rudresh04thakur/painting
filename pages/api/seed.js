import dbConnect from '../../lib/dbConnect';
import { Config } from '../../server/models/Config';

// This is a temporary secret.
const SECRET_KEY = 'temp_secret_for_seeding';

const siteConfigData = {
  key: 'site_config',
  value: {
    logo: '/images/logo.png',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      instagram: '#',
      linkedin: '#',
    },
    contact: {
      phone: '+1234567890',
      email: 'info@example.com',
      address: '123 Art Gallery St, Art City, USA',
    },
    footerText: '© 2024 Painting Gallery. All Rights Reserved.',
  },
};

export default async function handler(req, res) {
  const { method } = req;
  const { secret } = req.query;

  if (secret !== SECRET_KEY) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  await dbConnect();

  if (method === 'POST') {
    try {
      // Use updateOne with upsert: true to prevent duplicates
      // This will create the document if it doesn't exist, or update it if it does.
      await Config.updateOne(
        { key: siteConfigData.key },
        { $set: siteConfigData },
        { upsert: true }
      );

      res.status(200).json({ success: true, message: 'Site config seeded successfully.' });
    } catch (error) {
      res.status(500).json({ success: false, error: `Server error: ${error.message}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
