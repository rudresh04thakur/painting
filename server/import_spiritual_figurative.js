const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Painting } = require('./models/Painting');
const { Media } = require('./models/Media');
const Category = require('./models/Category');
const { Config } = require('./models/Config');
const { User } = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/painting_gallery';
const SOURCE_DIR = path.join('e:', 'PAINTING', '5');
const UPLOAD_DIR = path.join(__dirname, 'uploads', 'spiritual');
const FOLDER_NAME = 'spiritual';

const CATEGORY_NAME = "Spiritual Figurative Art";
const SUB_CATEGORIES = [
  "Warrior-Saint Portrait Art",
  "Devotional Sculpture Art",
  "Indian Heritage & Valor Art"
];
const DESCRIPTION = "It represents an idealized warrior-leader figure, shown with spiritual symbols rather than focusing on a specific individual.";

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

async function importData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    // Get Admin User for artistId
    const adminUser = await User.findOne({ role: 'admin' }) || await User.findOne({});
    if (!adminUser) {
      throw new Error('No user found to assign as artist. Please run seed script first.');
    }
    console.log(`Using artist: ${adminUser.name} (${adminUser._id})`);

    // 1. Create/Update Category
    let category = await Category.findOne({ name: CATEGORY_NAME });
    if (!category) {
      category = await Category.create({
        name: CATEGORY_NAME,
        subCategories: SUB_CATEGORIES,
        description: DESCRIPTION,
        active: true,
        featured: true
      });
      console.log(`Created Category: ${CATEGORY_NAME}`);
    } else {
      category.subCategories = SUB_CATEGORIES;
      category.description = DESCRIPTION;
      category.featured = true;
      await category.save();
      console.log(`Updated Category: ${CATEGORY_NAME}`);
    }

    // 2. Process Images
    const files = fs.readdirSync(SOURCE_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    console.log(`Found ${files.length} images to process.`);

    const createdPaintings = [];

    for (let i = 0; i < files.length; i++) {
      const fileName = files[i];
      const sourcePath = path.join(SOURCE_DIR, fileName);
      const ext = path.extname(fileName);
      const newFileName = `spiritual_art_${i + 1}${ext}`;
      const destPath = path.join(UPLOAD_DIR, newFileName);
      const publicPath = `/uploads/${FOLDER_NAME}/${newFileName}`;

      // Copy file
      fs.copyFileSync(sourcePath, destPath);

      // Create Media
      const media = await Media.create({
        url: publicPath,
        type: 'image',
        folder: FOLDER_NAME,
        filename: newFileName
      });
      console.log(`Created Media: ${newFileName}`);

      // Create Painting
      const subCategory = SUB_CATEGORIES[i % SUB_CATEGORIES.length];
      const painting = await Painting.create({
        title: `${subCategory} ${Math.floor(i / 3) + 1}`,
        description: DESCRIPTION,
        price: {
          USD: 800 + (i * 50), // Varied prices
          INR: (800 + (i * 50)) * 83
        },
        category: CATEGORY_NAME,
        subcategory: subCategory,
        images: [publicPath],
        dimensions: { height: 30, width: 20, unit: 'in' },
        medium: "Oil on Canvas",
        style: "Realism",
        subject: "Spiritual",
        yearCreated: 2025,
        artistId: adminUser._id,
        artistName: adminUser.name,
        inStock: true,
        featured: i < 3 // Feature first 3
      });
      console.log(`Created Painting: ${painting.title} (${subCategory})`);
      createdPaintings.push(painting);
    }

    // 3. Update Home Banner Config
    // We want to add one of the new images to the home banner
    if (createdPaintings.length > 0) {
      const bannerImage = createdPaintings[0].images[0];
      const bannerSlide = {
        title: CATEGORY_NAME,
        subtitle: "New Collection",
        description: "Idealized warrior-leader figures shown with spiritual symbols.",
        backgroundImage: bannerImage,
        btnLink: `/gallery?category=${encodeURIComponent(CATEGORY_NAME)}`,
        btnText: "Explore Collection"
      };

      let bannerConfig = await Config.findOne({ key: 'home_banner_slider' });
      
      if (!bannerConfig) {
        // Create new config
        // Add some default slides + our new one
        bannerConfig = await Config.create({
          key: 'home_banner_slider',
          value: [bannerSlide]
        });
        console.log('Created home_banner_slider config with new slide');
      } else {
        // Append to existing slides
        // Ensure value is an array
        let slides = Array.isArray(bannerConfig.value) ? bannerConfig.value : [];
        
        // Check if we already added this slide (avoid duplicates on re-run)
        const exists = slides.some(s => s.title === CATEGORY_NAME);
        if (!exists) {
          // Add to beginning
          slides.unshift(bannerSlide);
          // Limit to 5 slides
          if (slides.length > 5) slides = slides.slice(0, 5);
          
          bannerConfig.value = slides;
          // Mark as modified because Mixed type changes aren't always detected
          bannerConfig.markModified('value');
          await bannerConfig.save();
          console.log('Updated home_banner_slider config with new slide');
        } else {
          console.log('Slide already exists in home_banner_slider');
        }
      }
    }

    console.log('Import completed successfully.');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

importData();
