


const fs = require('fs');
const User = require('./models/user');
const mongoose = require('mongoose');
const dotenv = require('dotenv')

// koad env vars
dotenv.config({ path: './config/config.env'});

//load models


// connect to DB

mongoose.connect('mongodb://localhost:27017/yelp_camp', {
	useNewUrlParser: true,
     useFindAndModify: false,
     useCreateIndex: true,
     useUnifiedTopology: true
 })
 
 
 // Read JSON files


const user = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/user.json`, 'utf-8')
);




 // Import into DB
 const importData = async () => {
   try {
     
     await User.create(user);

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

     console.log('Data Destroyed...');
     process.exit();
   } catch (err) {
     console.error(err);
   }
 };
 

 // call function default node proccess
 if (process.argv[2] === 'install') {
   importData();
 } else if (process.argv[2] === 'delete') {
   deleteData();
 }
 