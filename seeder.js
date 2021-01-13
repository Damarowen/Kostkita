require('dotenv').config()



const fs = require('fs');
const User = require('./models/User');
const Kost = require('./models/Kost');
const Review = require('./models/Review');
const Comment = require('./models/Comment');

// connect to DB
const connectDB = require('./config/db')

// database setup cloud
connectDB();
 
 // Read JSON files
const user = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/user.json`, 'utf-8')
);

const kost = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/kost.json`, 'utf-8')
);



 // Import into DB
 const importData = async () => {
   try {
     
     await User.create(user);
     await Kost.create(kost);


     console.log('Data Imported...');
     process.exit();
   } catch (err) {
     console.error(err);
   }
 };
 
 // Delete data
 const deleteData = async () => {
   try {
     await User.deleteMany();
     await Kost.deleteMany();
     await Review.deleteMany();
     await Comment.deleteMany();


     console.log('Data Destroyed...');
     process.exit();
   } catch (err) {
     console.error(err);
   }
 };
 

 // call function default node proccess
 if (process.argv[2] === 'i') {
   importData();
 } else if (process.argv[2] === 'd') {
   deleteData();
 }
 