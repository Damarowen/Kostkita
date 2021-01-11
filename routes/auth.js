var express = require("express"),
	router = express.Router({
		mergeParams: true
	}),
	passport = require("passport"),
	User = require("../models/user")



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



// logout route
router.get("/logout", (req, res) => {
	req.logout()
	res.redirect("/campground")
})



module.exports = router;