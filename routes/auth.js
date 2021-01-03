var express = require("express"),
	router = express.Router({
		mergeParams: true
	}),
	passport = require("passport"),
	User = require("../models/user"),
	Campground = require("../models/campground_export"),
	Middleware = require("../middleware/index")




//HOME ROUTE 
router.get("/", function (req, res) {

	res.render("landing")

})


//----------///
///AUTHENTICATION ROUTE

// show register form
router.get("/register", (req, res) => {

	res.render("register")

})

//handle sign up logic
router.post("/register", (req, res) => {

	var name = req.body.username
	var pass = req.body.password
	var email = req.body.email
	var avatar = "https://252radio.com/wp-content/uploads/2016/11/default-user-image.png"
	var newData = new User({
		username: name,
		email: email,
		avatar: avatar
	})

	User.register(newData, pass, (err) => {
		if (err) {
			console.log(err)
			req.flash("error", err.message)
			res.redirect("/register")
		} else {
			req.flash("success", `Welcome Aboard. ${name}`)
			passport.authenticate("local")(req, res, () => {
				res.redirect("/campground")
				console.log("New User Created")
			})
		}
	})
})

//show login form
router.get("/login", (req, res) => {
	res.render("login")
})


//handling login logic
router.post("/login", passport.authenticate("local", { //<<  middleware

	
	failureRedirect: "/login",
	failureFlash: 'Invalid username or password.'

}), (req, res) => {
	if (req.user.isAdmin) {
		//admin only accesss /adminlogin
		req.logout()
		req.flash("error", "User and Password is for ADMIN")
		res.redirect("/campground")
	} else {
		req.flash("success", `HI  ${req.user.username}   Welcome To The YelpCamp`)
		res.redirect("/campground")

	}

});



//for admin
router.get("/admin", (req, res) => {
	res.render("admin-login")
})


//handling login logic
router.post("/adminlogin", passport.authenticate("local", { //<<  middleware

	// successRedirect: "/campground",
	// successFlash: "success"
	failureRedirect: "/login",
	failureFlash: 'Invalid username or password.'

}), (req, res) => {

	req.flash("success", `Your Login as ${req.user.username} Status: ADMIN`)
	res.redirect("/campground")


});


router.get('/users/:id', Middleware.isLogggedIn, (req, res) => {

	User.findById(req.params.id, (err, foundUser) => {
		if (err) {
			req.flash("error", "wrong")
			return res.redirect("/campground")
		}
		Campground.find().where('author.id').equals(foundUser.id).exec(function (err, foundCamp) {

			if (err) {
				req.flash("error", "wrong")
				return res.redirect("/campground")
			}
			res.render("users/show-users", {
				user: foundUser,
				camp: foundCamp
			})

		})
	})
})


router.get('/users/:id/edit', Middleware.checkUser, (req, res) => {

	User.findById(req.params.id, (err, foundUser) => {
		if (err) {
			req.flash("error", "wrong")
			return res.redirect("/campground")
		}
		res.render("users/edit-users", {
			user: foundUser
		})
	})
})

//UPDATE User
//user/:id
router.put("/users/:id", (req, res) => {
	var id_user = req.params.id
	var data_new = req.body.editUser
	User.findByIdAndUpdate(id_user, data_new)
		.then(() => req.flash("success", "User Succeed Update"))
		.then(() => res.redirect("/users/" + id_user))
		.catch(error => console.log(error.message))

})



// logout route
router.get("/logout", (req, res) => {
	req.logout()
	res.redirect("/campground")
})



module.exports = router;