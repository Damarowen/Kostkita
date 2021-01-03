var express = require("express"),
	router = express.Router({
		mergeParams: true
	}),
	Campground_Model = require("../models/campground_export"),
	Comment = require("../models/comment_export"),
	Middleware = require("../middleware/index")



//comment route new
router.get("/new", Middleware.checkCommentExistence, (req, res) => {
	Campground_Model.findById(req.params.id, (err, data) => {
		if (err || !data) { //handle error jika data tdk ketemu
			req.flash("error", "Comment Not Found COMMENT")
			res.redirect("back")
			console.log(!data)
		} else {
			res.render("comment/new", {
				camp_comment: data
			})
		}
	})
})

//add new comment
router.post("/", Middleware.checkCommentExistence, (req, res) => {

	Campground_Model.findById(req.params.id, (err, data) => {


		if (err) {
			console.log(err)
			res.redirect("/campground")
		} else {
			var body_comment = req.body.comment
			var new_comment = new Comment(body_comment)
			//define id and author
			new_comment.author.id = req.user._id
			new_comment.author.username = req.user.username
			//save comment
			new_comment.save()
			console.log(new_comment)
			data.comment.push(new_comment)
			data.save()
				.then(() => req.flash("success", "New Comment Added To " + data.name))
				.then(() => res.redirect('/campground/' + data._id))
		}

	})

})

//EDIT COMMENT
///campground/:id/comment/comment_id/edit
router.get("/:comment_id/edit", Middleware.checkCommentOwner, (req, res) => {
	var id_campground = req.params.id
	var id_comment = req.params.comment_id
	Campground_Model.findById(id_campground, (err, data) => {

		if (err || !data) {
			req.flash("error", "Campground Not Found COMMENT II")
			console.log(data)
			return res.redirect("back")
		}
	})
	Comment.findById(id_comment, (err, data) => {
		if (err) {
			console.log(err)
		} else {
			res.render("comment/edit", {
				campground_id: id_campground,
				comment: data
			})
		}
	})
})

//UPDATE COMMENT
///campground/:id/comment/comment_id/
router.put("/:comment_id", Middleware.checkCommentOwner, (req, res) => {
	var id_campground = req.params.id
	var id_comment = req.params.comment_id
	var data_new = req.body.commentEdit
	Comment.findByIdAndUpdate(id_comment, data_new)
		.then(() => req.flash("success", "Comment Succeed Update"))
		.then(() => res.redirect("/campground/" + id_campground))
		.catch(error => console.log(error.message))


})

//DELETE COMMENT
///campground/:id/comment/comment_id/
router.delete("/:comment_id", Middleware.checkCommentOwner, (req, res) => {

	var id_campground = req.params.id
	var id_comment = req.params.comment_id


	//delete review in campground first
	Campground_Model.findByIdAndUpdate(req.params.id, {
		$pull: {
			comment: id_comment
		}
	}, {
		new: true
	}).exec(function (err, campground) {
		if (err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
	})


	// delete comment
	Comment.findByIdAndRemove(id_comment)
		.then(() => req.flash("success", "Comment Succeed Delete"))
		.then(() => res.redirect("/campground/" + id_campground))
		.catch(error => console.log(error.message))




})



module.exports = router;