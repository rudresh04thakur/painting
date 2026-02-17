require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Media } = require('./models/Media');
const { Painting } = require('./models/Painting');
const { User } = require('./models/User');
const Category = require('./models/Category');

// Configuration
const SOURCE_DIR = 'e:\\PAINTING\\2';
const CATEGORY_NAME = 'Handcrafted painting';
const SUBCATEGORY_NAME = 'Abstract painting';
const TARGET_FOLDER = 'handcrafted';
const BASE_PRICE = 450;

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/painting_gallery';
  await mongoose.connect(mongoUri);
  console.log('Connected to DB');

  // 1. Ensure Category and Subcategory Exist
  let category = await Category.findOne({ name: CATEGORY_NAME });
  if (!category) {
    category = await Category.create({
      name: CATEGORY_NAME,
      description: "Unique handcrafted artworks created with passion and precision.",
      subCategories: [SUBCATEGORY_NAME],
      active: true,
      featured: true
    });
    console.log(`Created Category: ${CATEGORY_NAME}`);
  } else {
    if (!category.subCategories.includes(SUBCATEGORY_NAME)) {
      category.subCategories.push(SUBCATEGORY_NAME);
      await category.save();
      console.log(`Added subcategory '${SUBCATEGORY_NAME}' to '${CATEGORY_NAME}'`);
    }
  }

  // 2. Get Admin/Artist User
  // Try to find a user with role 'artist' or 'admin' to assign paintings to
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
    const cleanName = `handcrafted_abstract_${i + 1}${ext}`;
    const targetPath = path.join(uploadDir, cleanName);
    const publicUrl = `/api/media/file/${TARGET_FOLDER}/${cleanName}`; // Serving via API route for protected/local files

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

    // Create Painting Entry
    const title = `Handcrafted Abstract ${i + 1}`;
    let painting = await Painting.findOne({ title: title });
    
    if (!painting) {
        await Painting.create({
            title: title,
            description: `A unique ${SUBCATEGORY_NAME} from our ${CATEGORY_NAME} collection.`,
            artistId: artist._id,
            artistName: artist.name,
            price: { USD: BASE_PRICE + (Math.floor(Math.random() * 500)) }, // Random price between 450-950
            stock: 1,
            images: [publicUrl],
            category: CATEGORY_NAME,
            subcategory: SUBCATEGORY_NAME,
            style: "Abstract",
            medium: "Mixed Media",
            year: new Date().getFullYear(),
            featured: i < 5, // Feature first 5
            active: true
        });
        console.log(`Created Painting: ${title}`);
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