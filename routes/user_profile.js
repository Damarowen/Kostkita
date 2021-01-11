var express = require("express"),
	router = express.Router({
		mergeParams: true
	}),
	User = require("../models/user"),
	Campground = require("../models/campground_export"),
	Middleware = require("../middleware/index")




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





module.exports = router;