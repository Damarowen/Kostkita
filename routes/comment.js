const express = require("express"),
	router = express.Router({
		mergeParams: true
	}),
	Kost = require("../models/Kost"),
	Comment = require("../models/Kost"),
	Middleware = require("../middleware/index")



//*comment route new
router.get("/new", Middleware.checkCommentExistence, (req, res) => {
	Kost.findById(req.params.id, (err, data) => {
		if (err || !data) { //handle error jika data tdk ketemu
			req.flash("error", "Comment Not Found COMMENT")
			res.redirect("back")
			console.log(!data)
		} else {
			res.render("comment/new", {
				kost: data
			})
		}
	})
})

//*add new comment
router.post("/", Middleware.checkCommentExistence, (req, res) => {

	Kost.findById(req.params.id, (err, data) => {
		if (err) {
			console.log(err)
			res.redirect("/kost")
		} else {
			let body_comment = req.body.comment
			let new_comment = new Comment(body_comment)
			//define id and author
			new_comment.author.id = req.user._id
			new_comment.author.username = req.user.username
			//save comment
			new_comment.save()
			console.log(new_comment)
			data.comment.push(new_comment)
			data.save()
				.then(() => req.flash("success", "New Comment Added To " + data.name))
				.then(() => res.redirect('/kost/' + data._id))
		}

	})

})

//*EDIT COMMENT
///*kost/:id/comment/comment_id/edit
router.get("/:comment_id/edit", Middleware.checkCommentOwner, (req, res) => {
	const id_kost = req.params.id
	const id_comment = req.params.comment_id
	Kost.findById(id_kost, (err, data) => {

		if (err || !data) {
			req.flash("error", "Kost Not Found")
			console.log(data)
			return res.redirect("back")
		}
	})
	Comment.findById(id_comment, (err, data) => {
		if (err) {
			console.log(err)
		} else {
			res.render("comment/edit", {
				kost: kost,
				comment: data
			})
		}
	})
})

//*UPDATE COMMENT
///*kost/:id/comment/comment_id/
router.put("/:comment_id", Middleware.checkCommentOwner, (req, res) => {
	const id_kost = req.params.id
	const id_comment = req.params.comment_id
	const data_new = req.body.commentEdit
	Comment.findByIdAndUpdate(id_comment, data_new)
		.then(() => req.flash("success", "Comment Succeed Update"))
		.then(() => res.redirect(`/kost/${id_kost}`))
		.catch(error => console.log(error.message))


})

//*DELETE COMMENT
///*kost/:id/comment/comment_id/
router.delete("/:comment_id", Middleware.checkCommentOwner, (req, res) => {

	const id_kost = req.params.id
	const id_comment = req.params.comment_id


	//*delete review in kost first
	Kost.findByIdAndUpdate(id_kost, {
		$pull: {
			comment: id_comment
		}
	}, {
		new: true
	}).exec(function (err, kost) {
		if (err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
	})


	//* delete comment
	Comment.findByIdAndRemove(id_comment)
		.then(() => req.flash("success", "Comment Succeed Delete"))
		.then(() => res.redirect(`/kost/" + ${id_kost}`))
		.catch(error => console.log(error.message))




})



module.exports = router;