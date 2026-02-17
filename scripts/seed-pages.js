const mongoose = require('mongoose');
const { Config } = require('../server/models/Config');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/painting_gallery';

const pages = [
  {
    key: 'page_terms',
    content: `
      <h2>1. Introduction</h2>
      <p>Welcome to Painting Gallery. By accessing our website, you agree to these Terms and Conditions.</p>
      
      <h2>2. Intellectual Property</h2>
      <p>All content on this website, including images, text, and graphics, is the property of Painting Gallery or its artists and is protected by copyright laws.</p>
      
      <h2>3. Purchases and Payments</h2>
      <p>All purchases are subject to availability. Prices are subject to change without notice. We accept major credit cards and other payment methods as indicated.</p>
      
      <h2>4. User Accounts</h2>
      <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.</p>
      
      <h2>5. Governing Law</h2>
      <p>These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate.</p>
    `
  },
  {
    key: 'page_support',
    content: `
      <h2>How can we help you?</h2>
      <p>Our support team is available Monday through Friday, 9am to 6pm EST.</p>
      
      <h3>Frequently Asked Questions</h3>
      <ul>
        <li><strong>How do I track my order?</strong><br>You can track your order in the "Orders" section of your dashboard.</li>
        <li><strong>Do you ship internationally?</strong><br>Yes, we ship to most countries worldwide. Shipping costs will be calculated at checkout.</li>
        <li><strong>What is your return policy?</strong><br>We accept returns within 30 days of delivery. Please see our <a href="/refund">Return Policy</a> for more details.</li>
      </ul>
      
      <h3>Contact Support</h3>
      <p>If you can't find the answer you're looking for, please contact us at <a href="mailto:support@painting.gallery">support@painting.gallery</a> or call +1 (234) 567-890.</p>
    `
  },
  {
    key: 'page_privacy',
    content: `
      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
      
      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to process transactions, provide customer support, and improve our services.</p>
      
      <h2>3. Sharing of Information</h2>
      <p>We do not sell your personal information. We may share your information with third-party service providers who help us operate our business (e.g., payment processors, shipping carriers).</p>
      
      <h2>4. Security</h2>
      <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access.</p>
      
      <h2>5. Cookies</h2>
      <p>We use cookies to help us improve our services and your experience. You can adjust your browser settings to refuse cookies.</p>
    `
  }
];

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    for (const page of pages) {
      await Config.findOneAndUpdate(
        { key: page.key },
        { value: { content: page.content } },
        { upsert: true, new: true }
      );
      console.log(`Updated ${page.key}`);
    }

    console.log('Done seeding pages');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding pages:', err);
    process.exit(1);
  }
}

seed();
