require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Movie = require('./models/Movie');
const Review = require('./models/Review');

const moviesData = [
  {
    title: 'Inception',
    genre: 'Sci-Fi',
    year: 2010,
    poster: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.'
  },
  {
    title: 'The Dark Knight',
    genre: 'Action',
    year: 2008,
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.'
  },
  {
    title: 'Interstellar',
    genre: 'Sci-Fi',
    year: 2014,
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.'
  },
  {
    title: 'Pulp Fiction',
    genre: 'Crime',
    year: 1994,
    poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption in Los Angeles.'
  },
  {
    title: 'The Shawshank Redemption',
    genre: 'Drama',
    year: 1994,
    poster: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    description: 'Over the course of several years, two convicts form a friendship, seeking solace and, eventually, redemption through basic compassion in the notorious Shawshank prison.'
  },
  {
    title: 'Spirited Away',
    genre: 'Animation',
    year: 2001,
    poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.'
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    genre: 'Animation',
    year: 2023,
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash, Miles must redefine what it means to be a hero.'
  },
  {
    title: 'Oppenheimer',
    genre: 'Drama',
    year: 2023,
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project.'
  },
  {
    title: 'Gladiator',
    genre: 'Action',
    year: 2000,
    poster: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
    description: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.'
  },
  {
    title: 'The Matrix',
    genre: 'Sci-Fi',
    year: 1999,
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    description: 'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.'
  },
  {
    title: 'Parasite',
    genre: 'Thriller',
    year: 2019,
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.'
  },
  {
    title: 'Whiplash',
    genre: 'Drama',
    year: 2014,
    poster: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    description: 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student\'s potential.'
  },
  {
    title: 'Avengers: Endgame',
    genre: 'Action',
    year: 2019,
    poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    description: 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions.'
  },
  {
    title: 'The Grand Budapest Hotel',
    genre: 'Comedy',
    year: 2014,
    poster: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
    description: 'A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel\'s glorious years under an exceptional concierge.'
  }
];

const seedDatabase = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flexi_movies';

  try {
    console.log(`\nConnecting to MongoDB: ${mongoURI}`);
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully for seeding.');

    // Clear existing collections
    console.log('Clearing existing data...');
    await Review.deleteMany({});
    await Movie.deleteMany({});
    await User.deleteMany({});
    console.log('Cleaned old records.');

    // 1. Create Admin Account
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const adminUser = await User.create({
      name: 'Flexi Admin',
      email: 'admin@flexi.com',
      password: adminPasswordHash,
      role: 'admin',
      watchlist: []
    });
    console.log(`Created Admin user: admin@flexi.com (Role: admin)`);

    // 2. Create Regular Student User
    const studentPasswordHash = await bcrypt.hash('Aryan@123', 10);
    const regularUser = await User.create({
      name: 'Aryan Sharma',
      email: 'aryan@flexi.com',
      password: studentPasswordHash,
      role: 'user',
      watchlist: []
    });
    console.log(`Created Sample user: aryan@flexi.com (Role: user)`);

    // 3. Insert Movies
    const insertedMovies = await Movie.insertMany(moviesData);
    console.log(`Inserted ${insertedMovies.length} movies successfully.`);

    // 4. Seed Sample Reviews
    const reviewsToSeed = [
      {
        movie: insertedMovies[0]._id, // Inception
        user: regularUser._id,
        rating: 5,
        comment: 'A mind-bending masterpiece! Christopher Nolan and Hans Zimmer created pure cinematic magic.'
      },
      {
        movie: insertedMovies[0]._id, // Inception
        user: adminUser._id,
        rating: 5,
        comment: 'Incredible cinematography and sound design. Truly an iconic sci-fi benchmark.'
      },
      {
        movie: insertedMovies[1]._id, // The Dark Knight
        user: regularUser._id,
        rating: 5,
        comment: 'Heath Ledger gave the greatest villain performance in history. Legendary film!'
      },
      {
        movie: insertedMovies[2]._id, // Interstellar
        user: regularUser._id,
        rating: 5,
        comment: 'Emotional, scientifically ambitious, and visually stunning. The docking scene still gives goosebumps.'
      },
      {
        movie: insertedMovies[6]._id, // Spider-Man Across the Spider-Verse
        user: regularUser._id,
        rating: 5,
        comment: 'Groundbreaking animation style and an unbelievable soundtrack. 10/10!'
      },
      {
        movie: insertedMovies[10]._id, // Parasite
        user: regularUser._id,
        rating: 4,
        comment: 'Phenomenal screenplay and social commentary. Bong Joon-ho deserved every Oscar.'
      }
    ];

    await Review.insertMany(reviewsToSeed);
    console.log(`Inserted ${reviewsToSeed.length} sample reviews.`);

    // 5. Add initial movies to regular user's watchlist
    regularUser.watchlist = [insertedMovies[0]._id, insertedMovies[2]._id, insertedMovies[6]._id];
    await regularUser.save();
    console.log(`Added initial 3 movies to aryan@flexi.com watchlist.`);

    console.log('\n======================================================');
    console.log(' SEEDING COMPLETE! You can now verify in MongoDB Compass:');
    console.log(' Connection String: mongodb://127.0.0.1:27017');
    console.log(' Database Name:     flexi_movies');
    console.log(' Collections:       users, movies, reviews');
    console.log('------------------------------------------------------');
    console.log(' Default Admin:  admin@flexi.com  /  Admin@123');
    console.log(' Default User:   aryan@flexi.com  /  Aryan@123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();

