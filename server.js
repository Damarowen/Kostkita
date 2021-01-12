require('dotenv').config()



const express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	methodOverride = require("method-override"),
	passport = require("passport"),
	localStrategy = require("passport-local"),
	User = require("./models/User"),
	flash = require("connect-flash"),
	path = require('path')



//requiring routes
const kostKitaRoutes = require("./routes/kostKita")
const commentRoutes = require("./routes/comment")
const reviewRoutes = require("./routes/reviews")
const indexRoutes = require("./routes/auth")
const userProfileRoutes = require("./routes/user_profile")

const connectDB = require('./config/db')


// database setup cloud
connectDB();




app.use(bodyParser.urlencoded({
	extended: true
}));


app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride("_method"));
mongoose.set('useFindAndModify', false); //supaya ga error untuk findByidAndUpdate dan Delete nya
app.set("view engine", "ejs")
app.use(flash())




//PASSPORT CONFIGURATION

app.use(require("express-session")({ //passing ke app use
	secret: "xx",
	resave: false,
	saveUninitialized: false
}))

app.use(passport.initialize()); //passing ke app use
app.use(passport.session()); //passing ke app use
passport.use(new localStrategy(User.authenticate())); //passport.authenticate << untuk itu
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//END

//MIDDLEWARE//

app.use(function (req, res, next) { //passing ke app use
	res.locals.currentUser = req.user //untuk display user di nav -- nama currentUser bisa apa aja
	res.locals.error = req.flash("error")
	res.locals.success = req.flash("success")
	app.locals.moment = require('moment'); //moment configuration
	next()

})


app.use(flash()); 



//END//

//ROUTERS
app.use("/", indexRoutes, userProfileRoutes); //parameter pertama akan menimpa url
app.use("/kost", kostKitaRoutes);
app.use("/kost/:id/comment", commentRoutes);
app.use("/kost/:id/reviews", reviewRoutes);


// ** 404 not found page
app.all('*', (req, res, next) => {
    res.status('404').send('404 Not Found')
})

///server


const PORT = 5000;


app.listen(PORT, () => console.log(`Server Running in ${process.env.NODE_ENV} mode on port ${PORT}`))

