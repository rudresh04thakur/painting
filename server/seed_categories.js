require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/painting_gallery';
  await mongoose.connect(mongoUri);
  console.log('Connected to DB');

  const categories = [
    {
      name: "Flow of Emotions",
      description: "A journey through the spectrum of human feelings, expressed in color and form.",
      subCategories: ["Crimson Drift", "Silent Movement", "Energy in Motion", "Whispers in Liquid", "Abstract Soul"],
      active: true,
      featured: true
    },
    {
      name: "India Day",
      description: "Celebrating the vibrant culture and heritage of India.",
      subCategories: ["Culture", "History", "Modern India", "Festivals"],
      active: true,
      featured: true
    },
    {
        name: "Abstract",
        description: "Non-objective art that does not attempt to represent an accurate depiction of a visual reality.",
        subCategories: ["Geometric", "Fluid", "Minimalist"],
        active: true
    },
    {
        name: "Landscape",
        description: "Depiction of natural scenery such as mountains, valleys, trees, rivers, and forests.",
        subCategories: ["Nature", "Urban", "Seascape"],
        active: true
    }
  ];

  for (const cat of categories) {
    const exists = await Category.findOne({ name: cat.name });
    if (!exists) {
      await Category.create(cat);
      console.log(`Created category: ${cat.name}`);
    } else {
      // Update subcategories if needed, but for now just skip or log
      // We might want to ensure subcategories exist
      let updated = false;
      for (const sub of cat.subCategories) {
          if (!exists.subCategories.includes(sub)) {
              exists.subCategories.push(sub);
              updated = true;
          }
      }
      if (updated) {
          await exists.save();
          console.log(`Updated category: ${cat.name} with new subcategories`);
      } else {
          console.log(`Category exists: ${cat.name}`);
      }
    }
  }

  console.log('Done');
  process.exit();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});