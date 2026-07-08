const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Admin = require('../models/Admin');
const Category = require('../models/Category');
const Genre = require('../models/Genre');
const Language = require('../models/Language');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Movie = require('../models/Movie');
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ott_platform';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Seeder connected to MongoDB.');

    // Clear all existing collections
    await User.deleteMany();
    await Admin.deleteMany();
    await Category.deleteMany();
    await Genre.deleteMany();
    await Language.deleteMany();
    await SubscriptionPlan.deleteMany();
    await Movie.deleteMany();
    await Series.deleteMany();
    await Episode.deleteMany();
    await Coupon.deleteMany();
    await Banner.deleteMany();
    console.log('Cleared existing collections.');

    // 1. Seed Categories
    const categories = await Category.insertMany([
      { name: 'Movies', description: 'Feature films across various genres' },
      { name: 'Web Series', description: 'Episodic television and web shows' },
      { name: 'Documentaries', description: 'Real world facts and accounts' },
      { name: 'Kids', description: 'Child-friendly cartoons and animation' },
    ]);
    console.log('Categories seeded.');

    // 2. Seed Genres
    const genres = await Genre.insertMany([
      { name: 'Action', description: 'High energy stunts and battles' },
      { name: 'Comedy', description: 'Humorous storylines and jokes' },
      { name: 'Sci-Fi & Fantasy', description: 'Space, technology, and magic' },
      { name: 'Drama', description: 'Emotional character studies' },
      { name: 'Thriller', description: 'Suspenseful plots and mysteries' },
    ]);
    console.log('Genres seeded.');

    // 3. Seed Languages
    const languages = await Language.insertMany([
      { name: 'English', code: 'en' },
      { name: 'Spanish', code: 'es' },
      { name: 'Hindi', code: 'hi' },
      { name: 'French', code: 'fr' },
    ]);
    console.log('Languages seeded.');

    // 4. Seed Subscription Plans
    const plans = await SubscriptionPlan.insertMany([
      {
        name: 'Basic',
        description: 'Watch on 1 screen in standard definition.',
        price: 199,
        durationDays: 30,
        resolution: 'SD',
        simultaneousScreens: 1,
      },
      {
        name: 'Standard',
        description: 'Watch on 2 screens simultaneously in Full HD (1080p).',
        price: 499,
        durationDays: 30,
        resolution: 'FHD',
        simultaneousScreens: 2,
      },
      {
        name: 'Premium',
        description: 'Watch on 4 screens simultaneously in Ultra HD (4K) + HDR.',
        price: 999,
        durationDays: 365,
        resolution: 'UHD/4K',
        simultaneousScreens: 4,
      },
    ]);
    console.log('Subscription Plans seeded.');

    // 5. Seed Admins
    await Admin.create([
      {
        name: 'Super Admin User',
        email: 'superadmin@ott.com',
        password: 'adminpassword123',
        role: 'Super Admin',
      },
      {
        name: 'Content Lead',
        email: 'content@ott.com',
        password: 'adminpassword123',
        role: 'Content Manager',
      },
      {
        name: 'Finance Lead',
        email: 'finance@ott.com',
        password: 'adminpassword123',
        role: 'Finance Manager',
      },
      {
        name: 'Support Representative',
        email: 'support@ott.com',
        password: 'adminpassword123',
        role: 'Support Manager',
      },
    ]);
    console.log('Admin accounts seeded (Password: adminpassword123).');

    // 6. Seed Clients (Users)
    const clientUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'userpassword123',
    });
    console.log('Standard user account seeded (john@example.com / userpassword123).');

    // 7. Seed Movies
    const movies = await Movie.insertMany([
      {
        title: 'Cyberpunk Renegades',
        description: 'In a neon-drenched futuristic metropolis, a hacker uncovers a conspiracy that controls the minds of millions.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9',
        bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e',
        trailerUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 124,
        releaseYear: 2288,
        categories: [categories[0]._id], // Movies
        genres: [genres[0]._id, genres[2]._id], // Action, Sci-Fi
        languages: [languages[0]._id], // English
        isPublished: true,
        isFeatured: true,
        isTrending: true,
      },
      {
        title: 'Laugh Out Loud',
        description: 'A mockumentary about the daily lives of stand-up comedians trying to make it big in New York City.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814',
        bannerUrl: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b',
        trailerUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 98,
        releaseYear: 2024,
        categories: [categories[0]._id], // Movies
        genres: [genres[1]._id], // Comedy
        languages: [languages[0]._id, languages[2]._id], // English, Hindi
        isPublished: true,
        isTrending: true,
      },
    ]);
    console.log('Movies seeded.');

    // 8. Seed Series & Episodes
    const series = await Series.create({
      title: 'Detective Holmes: Origins',
      description: 'Before he was the master detective, young Sherlock Holmes cracks his very first mysteries in high school.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406',
      bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5',
      releaseYear: 2023,
      categories: [categories[1]._id], // Web Series
      genres: [genres[3]._id, genres[4]._id], // Drama, Thriller
      languages: [languages[0]._id],
      isPublished: true,
      isFeatured: true,
      cast: ['Sherlock Holmes', 'John Watson', 'Irene Adler'],
      creator: 'Sir Arthur Conan Doyle',
    });

    await Episode.insertMany([
      {
        series: series._id,
        seasonNumber: 1,
        episodeNumber: 1,
        title: 'The Study in Pink',
        description: 'Holmes investigates a series of suicides that appear to be related to a mysterious serial killer.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 45,
      },
      {
        series: series._id,
        seasonNumber: 1,
        episodeNumber: 2,
        title: 'The Blind Banker',
        description: 'A mysterious cipher leads Sherlock and Watson to a Chinese smuggling ring operating in London.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 52,
      },
    ]);
    console.log('Series and Episodes seeded.');

    // 9. Seed Coupons
    await Coupon.insertMany([
      {
        code: 'WELCOME50',
        discountType: 'percentage',
        discountValue: 50,
        maxDiscountAmount: 200,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        maxUses: 1000,
      },
      {
        code: 'FLAT100',
        discountType: 'flat',
        discountValue: 100,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        maxUses: 500,
      },
    ]);
    console.log('Discount coupons seeded.');

    // 10. Seed Homepage Banners
    await Banner.insertMany([
      {
        title: 'Cyberpunk Renegades Now Streaming',
        description: 'Watch the critically acclaimed science fiction masterpiece now.',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e',
        linkUrl: `/movie/${movies[0]._id}`,
        order: 1,
      },
      {
        title: 'Premium Subscription Discount',
        description: 'Get 50% off on our Annual Premium subscription plan. Use code WELCOME50.',
        imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36',
        linkUrl: '/subscriptions',
        order: 2,
      },
    ]);
    console.log('Homepage banners seeded.');

    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeder Error: ', error);
    process.exit(1);
  }
};

seedDatabase();
