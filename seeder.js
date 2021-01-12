


const fs = require('fs');
const User = require('./models/user');
const Kost = require('./models/kost');
const mongoose = require('mongoose');
const dotenv = require('dotenv')

// koad env vars
dotenv.config({ path: './config/config.env'});

//load models


// connect to DB

mongoose.connect('mongodb://localhost:27017/KostKita', {
	useNewUrlParser: true,
     useFindAndModify: false,
     useCreateIndex: true,
     useUnifiedTopology: true
 })
 
 
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
 