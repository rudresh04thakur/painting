require('dotenv').config();
const mongoose = require('mongoose');
const { Testimonial } = require('./models/Testimonial');
const { Article } = require('./models/Article');
const { Feature } = require('./models/Feature');
const { Auction } = require('./models/Auction');
const { Painting } = require('./models/Painting');
const { Config } = require('./models/Config');
const { User } = require('./models/User');
const { Faq } = require('./models/Faq');

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/painting_gallery';
  await mongoose.connect(mongoUri);
  console.log('Connected to DB');

  // Clear collections
  await Testimonial.deleteMany({});
  await Article.deleteMany({});
  await Feature.deleteMany({});
  await Auction.deleteMany({});
  await Painting.deleteMany({});
  await Faq.deleteMany({});
  await User.deleteMany({ role: 'artist' }); // Clear artists to re-seed them with images
  // await Config.deleteMany({}); 

  // 1. Create Artists (based on Home1ArtistSection)
  const artistsData = [
    { name: 'Frida Kahlo', country: 'Mexico', image: '/assets/img/home1/artist-img1.png', years: '1907-1954' },
    { name: 'Pablo Picasso', country: 'Spain', image: '/assets/img/home1/artist-img2.png', years: '1881-1973' },
    { name: 'Leonardo da Vinci', country: 'Italy', image: '/assets/img/home1/artist-img3.png', years: '1452-1519' },
    { name: 'Andy Warhol', country: 'USA', image: '/assets/img/home1/artist-img4.png', years: '1928-1987' },
    { name: 'Gustav Klimt', country: 'Austria', image: '/assets/img/home1/artist-img5.png', years: '1862-1918' },
    { name: 'Henri Matisse', country: 'France', image: '/assets/img/home1/artist-img6.png', years: '1869-1954' },
    { name: 'Diego Rivera', country: 'Mexico', image: '/assets/img/home1/artist-img7.png', years: '1886-1957' },
    { name: 'Joan Miró', country: 'Spain', image: '/assets/img/home1/artist-img8.png', years: '1893-1983' },
    { name: 'Yayoi Kusama', country: 'Japan', image: '/assets/img/home1/artist-img9.png', years: '1929' }
  ];

  const artistUsers = [];
  for (const a of artistsData) {
    const user = await User.create({
      name: a.name,
      email: `${a.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      passwordHash: 'password123',
      role: 'artist',
      country: a.country,
      image: a.image
      // Note: 'years' is not in User model, we'll just store name/country/image for now.
      // If needed, we can add a 'bio' or 'years' field to User or ArtistProfile.
      // For now, we'll assume the client might not show years if not in DB, or we add it to 'country' field temporarily like "Mexico (1907-1954)"
    });
    artistUsers.push(user);
  }
  console.log('Artists seeded');

  // 2. Testimonials
  const testimonials = [
    {
      name: "Miss. Abelam",
      role: "Artist",
      content: "I purchased a beautiful painting from this site, and the quality is incredible. The buying process was seamless, and the delivery was prompt. Highly recommend for anyone looking to buy unique art.",
      rating: 5,
      image: "/assets/img/home1/testimonial-author-img1.png",
      active: true,
      order: 1
    },
    {
      name: "John Doe",
      role: "Collector",
      content: "The auction experience was thrilling! I managed to secure a rare piece at a great price. The transparency and ease of use are unmatched.",
      rating: 5,
      image: "/assets/img/home1/testimonial-author-img2.png",
      active: true,
      order: 2
    },
    {
      name: "Sarah Smith",
      role: "Curator",
      content: "As a curator, I appreciate the diverse collection available here. It's a fantastic platform for discovering new talent.",
      rating: 4,
      image: "/assets/img/home1/testimonial-author-img3.png",
      active: true,
      order: 3
    }
  ];
  await Testimonial.insertMany(testimonials);
  console.log('Testimonials seeded');

  // 3. Articles
  const articles = [
    {
      title: "The Future of Digital Art",
      slug: "the-future-of-digital-art",
      content: "Digital art is rapidly evolving with the advent of NFTs and blockchain technology...",
      author: "Alice Johnson",
      tags: ["Digital Art", "NFT", "Trends"],
      publishedAt: new Date(),
      image: "/assets/img/home1/blog-img1.jpg"
    },
    {
      title: "Understanding Abstract Expressionism",
      slug: "understanding-abstract-expressionism",
      content: "Abstract Expressionism is a post-World War II art movement in American painting...",
      author: "Bob Williams",
      tags: ["Abstract", "History", "Art Movements"],
      publishedAt: new Date(),
      image: "/assets/img/home1/blog-img2.jpg"
    },
    {
      title: "Collecting 101: A Guide for Beginners",
      slug: "collecting-101-a-guide-for-beginners",
      content: "Starting an art collection can be daunting. Here are some tips to get you started...",
      author: "Charlie Davis",
      tags: ["Collecting", "Guide", "Tips"],
      publishedAt: new Date(),
      image: "/assets/img/home1/blog-img3.jpg"
    }
  ];
  await Article.insertMany(articles);
  console.log('Articles seeded');

  // 4. Features
  const features = [
    {
      title: "Support Artists",
      description: "Supporting their creative endeavors helps them continue to produce extraordinary works.",
      icon: "/assets/img/home1/icon/feature-icon1.svg",
      order: 1,
      active: true
    },
    {
      title: "Authenticity Guaranteed",
      description: "Every piece of art is verified for authenticity, ensuring you get exactly what you pay for.",
      icon: "/assets/img/home1/icon/feature-icon2.svg",
      order: 2,
      active: true
    },
    {
      title: "Secure Transactions",
      description: "Our platform uses top-tier security measures to protect your financial information.",
      icon: "/assets/img/home1/icon/feature-icon3.svg",
      order: 3,
      active: true
    },
    {
      title: "Global Shipping",
      description: "We ship art worldwide with specialized packaging to ensure safe delivery.",
      icon: "/assets/img/home1/icon/feature-icon4.svg",
      order: 4,
      active: true
    }
  ];
  await Feature.insertMany(features);
  console.log('Features seeded');

  // 5. Paintings — artistName must exactly match the User artist names created above
  const paintings = [
    {
      title: "Dancing Colors on a Summer Breeze",
      artistId: artistUsers[7]._id, // Joan Miró
      artistName: "Joan Miró",
      price: { USD: 200, original: 250 },
      images: ["/assets/img/gallery/abstract.png"],
      style: "Abstract",
      year: 2023,
      medium: "Oil on Canvas",
      description: "A vibrant abstract piece capturing the essence of summer.",
      stock: 1,
      featured: true
    },
    {
      title: "Silent Echoes of the Mountains",
      artistId: artistUsers[0]._id, // Frida Kahlo
      artistName: "Frida Kahlo",
      price: { USD: 350, original: 400 },
      images: ["/assets/img/gallery/landscape.png"],
      style: "Landscape",
      year: 2022,
      medium: "Photography",
      description: "A stunning photograph of mountain peaks.",
      stock: 1,
      featured: true
    },
    {
      title: "Urban Rhythms at Night",
      artistId: artistUsers[1]._id, // Pablo Picasso
      artistName: "Pablo Picasso",
      price: { USD: 500 },
      images: ["/assets/img/gallery/urban.png"],
      style: "Street Art",
      year: 2024,
      medium: "Spray Paint",
      description: "A provocative piece exploring urban life.",
      stock: 1,
      featured: true
    },
    {
      title: "The Solitude of the Sea",
      artistId: artistUsers[2]._id, // Leonardo da Vinci
      artistName: "Leonardo da Vinci",
      price: { USD: 1200 },
      images: ["/assets/img/gallery/landscape.png"],
      style: "Realism",
      year: 2021,
      medium: "Watercolor",
      description: "A serene seascape depicting the calmness of the ocean.",
      stock: 1,
      featured: true
    },
    {
      title: "Golden Fields at Sunset",
      artistId: artistUsers[3]._id, // Andy Warhol
      artistName: "Andy Warhol",
      price: { USD: 800 },
      images: ["/assets/img/gallery/landscape.png"],
      style: "Impressionism",
      year: 2020,
      medium: "Oil on Canvas",
      description: "Capturing the golden hour in a field of wheat.",
      stock: 1,
      featured: true
    },
    {
      title: "Portrait of a Lady",
      artistId: artistUsers[4]._id, // Gustav Klimt
      artistName: "Gustav Klimt",
      price: { USD: 1500 },
      images: ["/assets/img/gallery/portrait.png"],
      style: "Art Nouveau",
      year: 2019,
      medium: "Oil and Gold Leaf",
      description: "An elegant portrait with intricate details.",
      stock: 1,
      featured: true
    },
    {
      title: "The Dance of Colors",
      artistId: artistUsers[5]._id, // Henri Matisse
      artistName: "Henri Matisse",
      price: { USD: 950, original: 1200 },
      images: ["/assets/img/gallery/abstract.png"],
      style: "Fauvism",
      year: 2022,
      medium: "Oil on Canvas",
      description: "Explosive colors and free brushwork celebrating pure expression.",
      stock: 1,
      featured: true
    },
    {
      title: "Rivera's Vision",
      artistId: artistUsers[6]._id, // Diego Rivera
      artistName: "Diego Rivera",
      price: { USD: 2200 },
      images: ["/assets/img/gallery/urban.png"],
      style: "Muralism",
      year: 2021,
      medium: "Fresco",
      description: "A monumental work depicting the spirit of the people.",
      stock: 1,
      featured: false
    },
    {
      title: "Infinity Nets",
      artistId: artistUsers[8]._id, // Yayoi Kusama
      artistName: "Yayoi Kusama",
      price: { USD: 3500 },
      images: ["/assets/img/gallery/abstract.png"],
      style: "Contemporary",
      year: 2023,
      medium: "Acrylic on Canvas",
      description: "Obsessive dot patterns creating an infinite visual universe.",
      stock: 1,
      featured: true
    }
  ];
  const createdPaintings = await Painting.insertMany(paintings);
  console.log('Paintings seeded');

  // 6. Auctions
  const auctions = [
    {
      title: "Modern Art Masterpiece",
      paintingId: createdPaintings[0]._id,
      startTime: new Date(Date.now() - 86400000), // Started yesterday
      endTime: new Date(Date.now() + 86400000 * 2), // Ends in 2 days
      status: 'live',
      startingBid: 100,
      currentBid: 150,
      featured: true
    },
    {
      title: "Vintage Landscape",
      paintingId: createdPaintings[1]._id,
      startTime: new Date(Date.now() + 86400000), // Starts tomorrow
      endTime: new Date(Date.now() + 86400000 * 3),
      status: 'upcoming',
      startingBid: 200,
      featured: true
    },
    {
      title: "Abstract Dreams",
      paintingId: createdPaintings[2]._id,
      startTime: new Date(Date.now() - 86400000 * 2),
      endTime: new Date(Date.now() + 86400000 * 5),
      status: 'live',
      startingBid: 300,
      currentBid: 450,
      featured: true
    }
  ];
  await Auction.insertMany(auctions);
  console.log('Auctions seeded');

  // 7. FAQs
  const faqs = [
    {
      question: "How do I participate in an auction?",
      answer: "To participate, simply create an account, browse our upcoming or live auctions, and place your bid. You will be notified if you are outbid.",
      order: 1,
      active: true
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards, PayPal, and bank transfers. All transactions are secure and encrypted.",
      order: 2,
      active: true
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship worldwide. Shipping costs and delivery times vary depending on the destination and the artwork's size.",
      order: 3,
      active: true
    },
    {
      question: "Can I return an item if I'm not satisfied?",
      answer: "We offer a 14-day return policy for most items. Please check the specific terms for each auction or direct sale.",
      order: 4,
      active: true
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach our support team via email at support@artmart.com or through our contact form on the website.",
      order: 5,
      active: true
    }
  ];
  await Faq.insertMany(faqs);
  console.log('FAQs seeded');

  // 8. Configs

  // About Section
  const aboutConfig = {
    key: 'home_about_section',
    value: {
      title: 'Discover Our Essence',
      description: 'At Artmart, we are passionate art enthusiasts dedicated to connecting artists and collectors through dynamic and exciting auctions. Our platform celebrates the creativity and diversity of artists from around the world, providing a space where their works can be appreciated and acquired by',
      image1: 'assets/img/home1/about-img1.jpg',
      image2: 'assets/img/home1/about-img2.jpg',
      features: ['Integrity', 'Diversity', 'Accessibility', 'Support'],
      stats: [
        { label: 'Customers', value: 65, suffix: 'k' },
        { label: 'Collections', value: 1.5, suffix: 'k' },
        { label: 'Auctions', value: 800, suffix: '' },
        { label: 'Bidders', value: 1, suffix: 'k' }
      ]
    }
  };
  await Config.findOneAndUpdate({ key: aboutConfig.key }, aboutConfig, { upsert: true, new: true });

  // Artistic Section
  const artisticConfig = {
    key: 'home_artistic_section',
    value: {
      title: 'Our Artistic Endeavor',
      description: 'At Artmart, our mission is to revolutionize the art experience We are committed to:',
      image: 'assets/img/home1/artistic-img.png',
      items: [
        'Empowering Artists',
        'Connecting Collectors',
        'Fostering Diversity',
        'Ensuring Integrity',
        'Building Community'
      ]
    }
  };
  await Config.findOneAndUpdate({ key: artisticConfig.key }, artisticConfig, { upsert: true, new: true });

  // About Page Config
  const pageAboutConfig = {
    key: 'page_about',
    value: {
      hero: {
        title: 'Our Story',
        subtitle: '"Art enables us to find ourselves and lose ourselves at the same time."',
        backgroundImage: '/assets/img/inner-page/breadcrumb-image2.jpg'
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
  await Config.findOneAndUpdate({ key: pageAboutConfig.key }, pageAboutConfig, { upsert: true, new: true });

  // Contact Page Config
  const pageContactConfig = {
    key: 'page_contact',
    value: {
      hero: {
        title: 'Get in Touch',
        description: 'We\'d love to hear from you. Whether you have a question about art, shipping, or just want to say hello.',
        backgroundImage: '/assets/img/inner-page/contact-bg.jpg'
      },
      info: {
        visit: {
          title: 'Visit Us',
          address1: '123 Art Gallery Avenue',
          address2: 'Creative District, NY 10012'
        },
        call: {
          title: 'Call Us',
          phone: '+1 (555) 123-4567',
          hours: 'Mon-Fri: 9am - 6pm'
        },
        email: {
          title: 'Email Us',
          email: 'hello@galleria.com',
          response: 'Response within 24h'
        }
      }
    }
  };
  await Config.findOneAndUpdate({ key: pageContactConfig.key }, pageContactConfig, { upsert: true, new: true });

  // FAQ Page Config
  const pageFaqConfig = {
    key: 'page_faq',
    value: {
      hero: {
        subtitle: 'Help Center',
        title: 'Frequently Asked Questions',
        description: 'Everything you need to know about buying art, shipping, and our policies.'
      }
    }
  };
  await Config.findOneAndUpdate({ key: pageFaqConfig.key }, pageFaqConfig, { upsert: true, new: true });

  // Artists Page Config
  const pageArtistsConfig = {
    key: 'page_artists',
    value: {
      hero: {
        title: 'Our Artists',
        description: '"Every artist dips his brush in his own soul, and paints his own nature into his pictures."',
        backgroundImage: '/assets/img/inner-page/artists-bg.jpg'
      }
    }
  };
  await Config.findOneAndUpdate({ key: pageArtistsConfig.key }, pageArtistsConfig, { upsert: true, new: true });

  // Gallery Page Config
  const pageGalleryConfig = {
    key: 'page_gallery',
    value: {
      title: 'Art Gallery',
      description: 'Explore our curated collection of masterpieces, from classical to contemporary.',
      backgroundImage: '/assets/img/inner-page/breadcrumb-image2.jpg'
    }
  };
  await Config.findOneAndUpdate({ key: pageGalleryConfig.key }, pageGalleryConfig, { upsert: true, new: true });

  // Auctions Page Config
  const pageAuctionsConfig = {
    key: 'page_auctions',
    value: {
      title: 'Live & Upcoming Auctions',
      description: 'Participate in our exclusive auctions and bid on rare and unique artworks.',
      backgroundImage: '/assets/img/inner-page/breadcrumb-image2.jpg'
    }
  };
  await Config.findOneAndUpdate({ key: pageAuctionsConfig.key }, pageAuctionsConfig, { upsert: true, new: true });

  // Site Config
  const siteConfig = {
    key: 'site_config',
    value: {
      title: 'Seasons by Ritu | Curated Art Gallery',
      brandName: 'SEASONS',
      brandSubtitle: 'BY RITU',
      description: 'Discover exceptional masterpieces from around the world. Authenticity guaranteed.',
      shippingText: 'Shipping Worldwide 🌍',
      footerBlurb: 'Connecting art lovers with exceptional masterpieces from around the world. Authenticity guaranteed.',
      copyright: 'Seasons by Ritu. All rights reserved.'
    }
  };
  await Config.findOneAndUpdate({ key: siteConfig.key }, siteConfig, { upsert: true, new: true });

  // Home Sections Configs
  const homeSections = [
    {
      key: 'home_testimonial_section',
      value: {
        title: 'Client Acknowledgment',
        description: 'Join us for an exhilarating live auction experience where art meets excitement.'
      }
    },
    {
      key: 'home_feature_section',
      value: {
        title: 'What Makes Us Special',
        description: 'An unparalleled art auction experience where quality, integrity, and passion for art come together.',
        image: '/assets/img/home1/feature-img.jpg'
      }
    },
    {
      key: 'home_upcoming_auction_section',
      value: {
        title: 'Upcoming Auctions',
        description: 'Join us for an exhilarating live auction experience where art meets excitement.'
      }
    },
    {
      key: 'home_auction_slider_section',
      value: {
        title: 'Streaming Auctions',
        description: 'Join us for an exhilarating live auction experience where art meets excitement.'
      }
    },
    {
      key: 'home_artist_section',
      value: {
        title: 'Feature Artists',
        description: 'Join us for an exhilarating live auction experience where art meets excitement.'
      }
    },
    {
      key: 'home_article_section',
      value: {
        title: 'Latest Article',
        description: 'Our Article is your go-to resource for all things related to art, auctions, and the vibrant community of artists and collectors.'
      }
    },
    {
      key: 'home_general_art_section',
      value: {
        title: 'General Artwork',
        description: 'Join us for an exhilarating live auction experience where art meets excitement.'
      }
    },
    {
      key: 'home_faq_section',
      value: {
        title: 'Frequently Asked Questions',
        description: 'It refers to a list of common questions and their corresponding answers that are typically provided on websites'
      }
    }
  ];

  const homeAboutComponentConfig = {
    key: 'home_about_component',
    value: {
      subtitle: 'Our Story',
      title: 'We are an Art Gallery',
      description1: 'Founded in 2024, we are dedicated to bringing the finest art to collectors worldwide.',
      description2: 'Our collection spans centuries and styles, ensuring there is something for everyone.',
      buttonText: 'Read More',
      buttonLink: '/about',
      thumbnail: '/assets/img/home1/about-img.jpg',
      year: 2024,
      author: 'Ritu',
      role: 'Founder'
    }
  };
  await Config.findOneAndUpdate({ key: homeAboutComponentConfig.key }, homeAboutComponentConfig, { upsert: true, new: true });

  for (const section of homeSections) {
    await Config.findOneAndUpdate({ key: section.key }, section, { upsert: true, new: true });
  }

  // Banner Slider
  const bannerConfig = {
    key: 'home_banner_slider',
    value: [
      {
        subtitle: 'Welcome To ArtMart',
        title: 'Discover, Bid, And Collect Rare Artworks',
        description: 'Experience the thrill of the auction from the comfort of your home.',
        btnText: 'Explore Now',
        btnLink: '/auctions',
        backgroundImage: 'assets/img/home1/home1-banner-bg1.jpg'
      },
      {
        subtitle: 'Curated Collections',
        title: 'Find Your Perfect Piece',
        description: 'Browse our exclusive selection of contemporary and classic art.',
        btnText: 'View Collections',
        btnLink: '/gallery',
        backgroundImage: 'assets/img/home1/home1-banner-bg2.jpg'
      },
      {
        subtitle: 'Masterpiece Auctions',
        title: 'Bid on History',
        description: 'Own a piece of history with our verified antique collection.',
        btnText: 'Start Bidding',
        btnLink: '/auctions',
        backgroundImage: 'assets/img/home1/home1-banner-bg3.jpg'
      }
    ]
  };
  await Config.findOneAndUpdate({ key: bannerConfig.key }, bannerConfig, { upsert: true, new: true });

  console.log('Configs seeded');

  console.log('Dynamic data seeding complete');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
