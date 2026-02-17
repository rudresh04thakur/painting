require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Media } = require('./models/Media');
const { Painting } = require('./models/Painting');
const { User } = require('./models/User');
const Category = require('./models/Category');

// Configuration
const SOURCE_DIR = 'e:\\PAINTING\\4';
const CATEGORY_NAME = 'Cubism';
const SUBCATEGORIES = ['Abstract Figurative Art', 'Modern Expressionist Art'];
const TARGET_FOLDER = 'cubism';
const BASE_PRICE = 550;

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/painting_gallery';
  await mongoose.connect(mongoUri);
  console.log('Connected to DB');

  // 1. Ensure Category and Subcategories Exist
  let category = await Category.findOne({ name: CATEGORY_NAME });
  if (!category) {
    category = await Category.create({
      name: CATEGORY_NAME,
      description: "Avant-garde art movement that revolutionized European painting and sculpture.",
      subCategories: SUBCATEGORIES,
      active: true,
      featured: true
    });
    console.log(`Created Category: ${CATEGORY_NAME}`);
  } else {
    let updated = false;
    for (const sub of SUBCATEGORIES) {
        if (!category.subCategories.includes(sub)) {
            category.subCategories.push(sub);
            updated = true;
        }
    }
    if (updated) {
        await category.save();
        console.log(`Updated subcategories for '${CATEGORY_NAME}'`);
    }
  }

  // 2. Get Admin/Artist User
  let artist = await User.findOne({ role: 'artist' });
  if (!artist) artist = await User.findOne({ role: 'admin' });
  if (!artist) {
      console.error("No artist or admin user found. Please seed users first.");
      process.exit(1);
  }

  // 3. Process Images
  if (!fs.existsSync(SOURCE_DIR)) {
      console.error(`Source directory not found: ${SOURCE_DIR}`);
      process.exit(1);
  }

  const uploadDir = path.join(__dirname, 'uploads', TARGET_FOLDER);
  if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
  }

  const files = fs.readdirSync(SOURCE_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  console.log(`Found ${files.length} images to process.`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const sourcePath = path.join(SOURCE_DIR, file);
    
    // Create a clean filename
    const ext = path.extname(file);
    const cleanName = `cubism_art_${i + 1}${ext}`;
    const targetPath = path.join(uploadDir, cleanName);
    const publicUrl = `/api/media/file/${TARGET_FOLDER}/${cleanName}`;

    // Copy file
    fs.copyFileSync(sourcePath, targetPath);

    // Create Media Entry
    let media = await Media.findOne({ url: publicUrl });
    if (!media) {
        media = await Media.create({
            url: publicUrl,
            type: 'image',
            folder: TARGET_FOLDER,
            filename: cleanName
        });
        console.log(`Created Media: ${cleanName}`);
    }

    // Determine Subcategory (Alternating)
    const subcategory = SUBCATEGORIES[i % SUBCATEGORIES.length];

    // Create Painting Entry
    const title = `Cubism Composition ${i + 1}`;
    let painting = await Painting.findOne({ title: title });
    
    if (!painting) {
        await Painting.create({
            title: title,
            description: `A stunning ${subcategory} piece exploring geometric forms.`,
            artistId: artist._id,
            artistName: artist.name,
            price: { USD: BASE_PRICE + (Math.floor(Math.random() * 450)) }, // 550-1000
            stock: 1,
            images: [publicUrl],
            category: CATEGORY_NAME,
            subcategory: subcategory,
            style: "Cubism",
            medium: "Acrylic on Canvas",
            year: new Date().getFullYear(),
            featured: i < 3, // Feature first 3
            active: true
        });
        console.log(`Created Painting: ${title} (${subcategory})`);
    } else {
        console.log(`Painting exists: ${title}`);
    }
  }

  console.log('Import completed successfully.');
  process.exit();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});