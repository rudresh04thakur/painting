import dbConnect from '../../lib/dbConnect';
import { Config } from '../../server/models/Config';

// This is a temporary secret.
const SECRET_KEY = 'temp_secret_for_seeding';

export default async function handler(req, res) {
  const { method } = req;
  const { secret } = req.query;

  if (secret !== SECRET_KEY) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

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

  const pageGalleryData = {
    key: 'page_gallery',
    value: {
      title: 'Art Gallery',
      description: 'Explore our curated collection of masterpieces, from classical to contemporary.',
    },
  };

  const pageArtistsData = {
    key: 'page_artists',
    value: {
      title: 'Our Artists',
      description: '"Every artist dips his brush in his own soul, and paints his own nature into his pictures."',
    },
  };

  const pageAboutData = {
    key: 'page_about',
    value: {
      hero: {
        title: 'Our Story',
        subtitle: '"Art enables us to find ourselves and lose ourselves at the same time."',
        backgroundImage: '/assets/img/inner-page/breadcrumb-image.jpg'
      },
      vision: {
        title: 'The Vision',
        heading: 'Curating the Exceptional',
        content: [
          'Founded in 2024, Galleria was born from a simple yet profound belief: that art is not merely decoration, but a vital dialogue between the creator and the beholder.',
          'Our collection is meticulously curated, focusing on works that demonstrate not only technical mastery but also emotional resonance.',
          'We are committed to authenticity and transparency, ensuring that every acquisition is a seamless journey from discovery to ownership.'
        ],
        image: '/assets/img/about/vision.jpg'
      },
      values: [
        { title: 'Authenticity', description: 'Every piece is verified and comes with a signed Certificate of Authenticity.' },
        { title: 'Global Reach', description: 'Connecting local talent with a worldwide audience of collectors.' },
        { title: 'Curatorial Excellence', description: 'Selected by experts with decades of experience in the art world.' }
      ],
      location: {
        title: 'Visit Our Gallery',
        description: 'While we operate globally online, our physical space offers an immersive experience for local art enthusiasts.',
        address: '123 Art District Blvd, Creative City, NY 10012',
        hours: ['Mon - Fri: 10am - 7pm', 'Sat - Sun: 11am - 5pm'],
        contact: {
          email: 'hello@galleria.com',
          phone: '+1 (555) 123-4567'
        }
      }
    }
  };

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

      await Config.updateOne(
        { key: pageGalleryData.key },
        { $set: pageGalleryData },
        { upsert: true }
      );

      await Config.updateOne(
        { key: pageArtistsData.key },
        { $set: pageArtistsData },
        { upsert: true }
      );

      await Config.updateOne(
        { key: pageAboutData.key },
        { $set: pageAboutData },
        { upsert: true }
      );

      res.status(200).json({ success: true, message: 'All configs seeded successfully.' });
    } catch (error) {
      res.status(500).json({ success: false, error: `Server error: ${error.message}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
