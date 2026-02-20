require('dotenv').config();
const mongoose = require('mongoose');
const { Config } = require('./models/Config');

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('Error: MONGODB_URI is not defined in your .env file.');
  process.exit(1);
}

const defaultConfig = {
  key: 'site_config',
  value: {
    title: 'ArtMart - Your Premier Online Art Gallery',
    description: 'Discover, collect, and bid on unique artworks from talented artists around the world. Your journey into the art world starts here.',
    logoUrl: '/assets/img/logo/logo.svg',
    contact: {
      email: 'support@artmart.com',
      phone: '+1 (555) 123-4567',
    },
    social: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    }
  }
};

async function seedSiteConfig() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    console.log('Checking for existing site_config...');
    const existingConfig = await Config.findOne({ key: 'site_config' });

    if (existingConfig) {
      console.log('site_config already exists. No action taken.');
    } else {
      console.log('No site_config found. Creating a new one...');
      await Config.create(defaultConfig);
      console.log('Successfully created default site_config.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during site_config seeding:', err);
    process.exit(1);
  } finally {
    mongoose.disconnect();
  }
}

seedSiteConfig();
