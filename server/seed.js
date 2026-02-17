require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models/User');
const { Painting } = require('./models/Painting');

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/painting_gallery';
  await mongoose.connect(mongoUri);

  await User.deleteMany({});
  await Painting.deleteMany({});

  const bcrypt = require('bcryptjs');
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@painting.gallery',
    passwordHash: await bcrypt.hash('Admin123!', 10),
    role: 'admin'
  });
  const artist = await User.create({
    name: 'Alice Artist',
    email: 'alice@painting.gallery',
    passwordHash: await bcrypt.hash('Artist123!', 10),
    role: 'artist'
  });
  const artist2 = await User.create({
    name: 'Vincent Van Goat',
    email: 'vincent@painting.gallery',
    passwordHash: await bcrypt.hash('Artist123!', 10),
    role: 'artist'
  });
  const artist3 = await User.create({
    name: 'Pablo Pick-asso',
    email: 'pablo@painting.gallery',
    passwordHash: await bcrypt.hash('Artist123!', 10),
    role: 'artist'
  });
  const customer = await User.create({
    name: 'Bob Customer',
    email: 'bob@example.com',
    passwordHash: await bcrypt.hash('Customer123!', 10),
    role: 'customer'
  });

  const samplePaintings = [
    {
      title: 'Sunset Over Sea',
      artistId: artist._id,
      artistName: 'Alice Artist',
      style: 'Impressionism',
      medium: 'Oil',
      description: 'Warm sunset colors over a calm sea.',
      price: { USD: 1200, EUR: 1100, INR: 99000 },
      stock: 1,
      images: ['https://placehold.co/600x400.png?text=Sunset+Over+Sea'],
      averageRating: 4.6,
      ratingsCount: 128,
      featured: true
    },
    {
      title: 'Forest Path',
      artistId: artist._id,
      artistName: 'Alice Artist',
      style: 'Realism',
      medium: 'Acrylic',
      description: 'A winding path through a dense forest.',
      price: { USD: 800, EUR: 750, INR: 66000 },
      stock: 1,
      images: ['https://placehold.co/600x400.png?text=Forest+Path'],
      averageRating: 4.1,
      ratingsCount: 73
    },
    {
      title: 'City Lights',
      artistId: artist._id,
      artistName: 'Alice Artist',
      style: 'Abstract',
      medium: 'Watercolor',
      description: 'Vibrant cityscape at night.',
      price: { USD: 950, EUR: 900, INR: 80000 },
      stock: 1,
      images: ['https://placehold.co/600x400.png?text=City+Lights'],
      averageRating: 3.7,
      ratingsCount: 42
    },
    {
      title: 'Starry Meadow',
      artistId: artist2._id,
      artistName: 'Vincent Van Goat',
      style: 'Post-Impressionism',
      medium: 'Oil',
      description: 'A beautiful meadow under the stars.',
      price: { USD: 2500, EUR: 2300, INR: 200000 },
      stock: 1,
      images: ['https://placehold.co/600x400.png?text=Starry+Meadow'],
      averageRating: 4.8,
      ratingsCount: 210,
      featured: true
    },
    {
      title: 'Sunflower Vase',
      artistId: artist2._id,
      artistName: 'Vincent Van Goat',
      style: 'Still Life',
      medium: 'Oil',
      description: 'Bright sunflowers in a rustic vase.',
      price: { USD: 1800, EUR: 1650, INR: 150000 },
      stock: 1,
      images: ['https://placehold.co/600x400.png?text=Sunflower+Vase'],
      averageRating: 4.3,
      ratingsCount: 98
    },
    {
      title: 'Abstract Cubism',
      artistId: artist3._id,
      artistName: 'Pablo Pick-asso',
      style: 'Cubism',
      medium: 'Acrylic',
      description: 'Geometric shapes forming a face.',
      price: { USD: 3000, EUR: 2800, INR: 250000 },
      stock: 1,
      images: ['https://placehold.co/600x400.png?text=Abstract+Cubism'],
      averageRating: 4.5,
      ratingsCount: 156,
      featured: true
    },
    {
      title: 'The Blue Period',
      artistId: artist3._id,
      artistName: 'Pablo Pick-asso',
      style: 'Expressionism',
      medium: 'Oil',
      description: 'Melancholic blue tones depicting a musician.',
      price: { USD: 3200, EUR: 2950, INR: 265000 },
      stock: 1,
      images: ['https://placehold.co/600x400.png?text=The+Blue+Period'],
      averageRating: 3.9,
      ratingsCount: 61
    },
    {
      title: 'Modern Art 1',
      artistId: artist3._id,
      artistName: 'Pablo Pick-asso',
      style: 'Modern',
      medium: 'Mixed Media',
      description: 'A mix of various materials on canvas.',
      price: { USD: 500, EUR: 450, INR: 41000 },
      stock: 1,
      images: ['https://placehold.co/600x400.png?text=Modern+Art+1'],
      averageRating: 3.2,
      ratingsCount: 24
    },
    {
      title: 'Mountain Peak',
      artistId: artist2._id,
      artistName: 'Vincent Van Goat',
      style: 'Realism',
      medium: 'Oil',
      description: 'Snowy peak under a clear blue sky.',
      price: { USD: 1500, EUR: 1400, INR: 125000 },
      stock: 1,
      images: ['https://placehold.co/600x400.png?text=Mountain+Peak'],
      averageRating: 4.0,
      ratingsCount: 35
    },
    {
      title: 'River Flow',
      artistId: artist._id,
      artistName: 'Alice Artist',
      style: 'Impressionism',
      medium: 'Watercolor',
      description: 'Calm river flowing through the valley.',
      price: { USD: 700, EUR: 650, INR: 58000 },
      stock: 1,
      images: ['https://placehold.co/600x400.png?text=River+Flow'],
      averageRating: 3.5,
      ratingsCount: 19
    }
  ];

  await Painting.insertMany(samplePaintings);

  console.log('Seed completed:', {
    admin: admin.email,
    artist: artist.email,
    customer: customer.email,
    paintings: samplePaintings.length
  });

  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
