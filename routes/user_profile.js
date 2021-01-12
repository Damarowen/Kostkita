const express = require("express"),
	router = express.Router({
		mergeParams: true
	}),
	User = require("../models/User"),
	Kost = require("../models/Kost"),
	Middleware = require("../middleware/index")




router.get('/users/:id', Middleware.isLogggedIn, (req, res) => {

	User.findById(req.params.id, (err, foundUser) => {
		if (err) {
			req.flash("error", "wrong")
			return res.redirect("/kost")
		}
		//* where and equals query
		Kost.find().where('author.id').equals(foundUser.id).exec(function (err, foundKost) {

			if (err) {
				console.log(err)
				req.flash("error", "Somthing wrong with Kost Find Route")
				return res.redirect("/kost")
			}
			res.render("users/show-users", {
				user: foundUser,
				kost: foundKost
			})

		})
	})
})


router.get('/users/:id/edit', Middleware.checkUser, (req, res) => {

	User.findById(req.params.id, (err, foundUser) => {
		if (err) {
			req.flash("error", "wrong")
			return res.redirect("/kost")
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