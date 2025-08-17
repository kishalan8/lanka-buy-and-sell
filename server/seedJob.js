const mongoose = require('mongoose');
const Job = require('./models/Job'); // adjust path if needed
require('dotenv').config();

const ADMIN_ID = '688b4d1260b37332165e8d43';

const jobs = [
  {
    title: 'Frontend Developer',
    company: 'Tech Solutions',
    location: 'Colombo',
    country: 'Sri Lanka',
    type: 'Full-time',
    description: 'Build and maintain web applications using React.',
    benefits: ['Health insurance', 'Paid leave', 'Flexible hours'],
    requirements: ['2+ years experience', 'Proficiency in React', 'Good communication'],
    skills: ['JavaScript', 'React', 'CSS'],
    salary: 120000,
    postedBy: ADMIN_ID,
    ageLimit: { min: 20, max: 35 },
    postedAt: new Date(),
    expiringAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
  {
    title: 'Backend Developer',
    company: 'Innovative Tech',
    location: 'New York',
    country: 'USA',
    type: 'Full-time',
    description: 'Develop REST APIs and work with databases.',
    benefits: ['Health insurance', 'Work from home', 'Performance bonus'],
    requirements: ['3+ years experience', 'Node.js, Express, MongoDB'],
    skills: ['Node.js', 'Express', 'MongoDB'],
    salary: 130000,
    postedBy: ADMIN_ID,
    ageLimit: { min: 22, max: 40 },
    postedAt: new Date(),
    expiringAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
  {
    title: 'Data Scientist',
    company: 'Analytics Hub',
    location: 'London',
    country: 'UK',
    type: 'Full-time',
    description: 'Analyze data, build models, and deliver insights.',
    benefits: ['Health insurance', 'Bonus', 'Remote work'],
    requirements: ['2+ years experience', 'Python, Machine Learning, SQL'],
    skills: ['Python', 'ML', 'SQL'],
    salary: 150000,
    postedBy: ADMIN_ID,
    ageLimit: { min: 23, max: 40 },
    postedAt: new Date(),
    expiringAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
  {
    title: 'Marketing Manager',
    company: 'SalesPro',
    location: 'Sydney',
    country: 'Australia',
    type: 'Full-time',
    description: 'Lead marketing campaigns and strategy.',
    benefits: ['Bonus', 'Paid leave', 'Training'],
    requirements: ['5+ years experience', 'Leadership skills', 'SEO knowledge'],
    skills: ['SEO', 'Leadership', 'Content Marketing'],
    salary: 140000,
    postedBy: ADMIN_ID,
    ageLimit: { min: 25, max: 45 },
    postedAt: new Date(),
    expiringAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
  {
    title: 'UI/UX Designer',
    company: 'Creative Minds',
    location: 'Toronto',
    country: 'Canada',
    type: 'Contract',
    description: 'Design interfaces and enhance user experience.',
    benefits: ['Flexible hours', 'Portfolio building'],
    requirements: ['2+ years experience', 'Figma, Adobe XD'],
    skills: ['Figma', 'Adobe XD', 'Creativity'],
    salary: 90000,
    postedBy: ADMIN_ID,
    ageLimit: { min: 20, max: 35 },
    postedAt: new Date(),
    expiringAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
  {
    title: 'HR Executive',
    company: 'PeopleFirst',
    location: 'Singapore',
    country: 'Singapore',
    type: 'Full-time',
    description: 'Handle recruitment, employee relations, and HR processes.',
    benefits: ['Health insurance', 'Bonus', 'Training'],
    requirements: ['2+ years experience', 'Good communication skills'],
    skills: ['Recruitment', 'Employee Relations', 'Communication'],
    salary: 90000,
    postedBy: ADMIN_ID,
    ageLimit: { min: 22, max: 40 },
    postedAt: new Date(),
    expiringAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
  {
    title: 'Graphic Designer',
    company: 'Design Studio',
    location: 'Berlin',
    country: 'Germany',
    type: 'Contract',
    description: 'Create visual designs for marketing and web projects.',
    benefits: ['Flexible hours', 'Portfolio building'],
    requirements: ['2+ years experience', 'Photoshop, Illustrator'],
    skills: ['Photoshop', 'Illustrator', 'Creativity'],
    salary: 80000,
    postedBy: ADMIN_ID,
    ageLimit: { min: 20, max: 35 },
    postedAt: new Date(),
    expiringAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
  {
    title: 'Remote Content Writer',
    company: 'WriteAway',
    location: 'Remote',
    country: 'USA',
    type: 'Remote',
    description: 'Create engaging content for websites and blogs.',
    benefits: ['Work from home', 'Flexible hours', 'Performance bonus'],
    requirements: ['1+ year experience', 'Excellent writing skills'],
    skills: ['SEO', 'Content Writing', 'Research'],
    salary: 50000,
    postedBy: ADMIN_ID,
    ageLimit: { min: 18, max: 35 },
    postedAt: new Date(),
    expiringAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
  {
    title: 'Project Manager',
    company: 'BuildIt Ltd.',
    location: 'Dubai',
    country: 'UAE',
    type: 'Full-time',
    description: 'Manage projects and coordinate between teams.',
    benefits: ['Health insurance', 'Bonus', 'Training'],
    requirements: ['5+ years experience', 'Leadership skills'],
    skills: ['Leadership', 'Communication', 'Planning'],
    salary: 150000,
    postedBy: ADMIN_ID,
    ageLimit: { min: 25, max: 45 },
    postedAt: new Date(),
    expiringAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
  {
    title: 'Intern – Software Development',
    company: 'NextGen Labs',
    location: 'Bangalore',
    country: 'India',
    type: 'Internship',
    description: 'Assist in software development projects and learn on the job.',
    benefits: ['Mentorship', 'Stipend', 'Flexible hours'],
    requirements: ['Currently studying IT/CS', 'Basic programming knowledge'],
    skills: ['Python', 'JavaScript', 'Git'],
    salary: 20000,
    postedBy: ADMIN_ID,
    ageLimit: { min: 18, max: 25 },
    postedAt: new Date(),
    expiringAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
];

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Job.deleteMany({});
    console.log('Existing jobs removed');

    await Job.insertMany(jobs);
    console.log('10 jobs seeded successfully');

    process.exit();
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
};

seedJobs();
