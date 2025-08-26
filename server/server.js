const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const bikesRouter = require('./routes/bikes');
const submissionRoutes = require('./routes/submissions');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());


// Serve uploaded files
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bikes', bikesRouter);
app.use('/api/submissions', submissionRoutes);
app.use('/api/slider-images', require('./routes/sliderImages'));
//app.use('/api', require('./routes/sliderImagesRoute')); // Adjust path



mongoose.connect('mongodb://localhost:27017/lankabuyandsell')
  .then(() => app.listen(5000, () => console.log('Server started on port 5000')))
  .catch(err => console.log(err));
