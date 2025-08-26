const mongoose = require('mongoose');
const Bike = require('./models/Bike');
const Reservation = require('./models/Reservation');
const Submission = require('./models/Submission');

async function seed() {
  try {
    await mongoose.connect('mongodb://localhost:27017/lankabuyandsell');

    // Clear existing data
    await Bike.deleteMany({});
    await Reservation.deleteMany({});
    await Submission.deleteMany({});

    // Insert bikes
    await Bike.insertMany([
      { brand: 'Honda', model: 'CBR500R', stock: 5 },
      { brand: 'Yamaha', model: 'MT-07', stock: 3 },
      { brand: 'Kawasaki', model: 'Ninja 400', stock: 4 },
    ]);

    // Insert reservations
    await Reservation.insertMany([
      { bikeId: null, userId: null, status: 'pending' }, // You can replace bikeId, userId later
      { bikeId: null, userId: null, status: 'pending' },
    ]);

    // Insert submissions
    await Submission.insertMany([
      {
        userId: null,
        bikeDetails: {
          brand: 'Suzuki',
          model: 'GSX-R600',
          year: 2019,
          price: 7000,
          description: 'Used Suzuki GSX-R600, excellent condition',
        },
        status: 'new',
      },
    ]);

    console.log('Seeding complete');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
