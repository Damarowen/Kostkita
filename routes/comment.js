const express = require("express"),
	router = express.Router({
		mergeParams: true
	}),
	Kost = require("../models/Kost"),
	Comment = require("../models/Comment"),
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
router.post("/", Middleware.checkCommentExistence, async function (req, res) {

	try {
		const kost = await Kost.findById(req.params.id)

		let new_comment = new Comment(req.body.comment)
		//define id and author
		new_comment.author.id = req.user._id
		new_comment.author.username = req.user.username
		new_comment.kost = kost
		//save comment
		new_comment.save()
		console.log(req.body.comment)
		kost.comment.push(new_comment)
		kost.save()
		.then(() => req.flash("success", "New Comment Added To " + kost.name))
	    .then(() => res.redirect('/kost/' + kost._id))

	} catch (err) {
		console.log(err)
		req.flash("error", "something error")
		res.redirect('/kost/' + kost._id)
	}


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
router.delete("/:comment_id", Middleware.checkCommentOwner, async function (req, res) {

	const id_kost = req.params.id
	const id_comment = req.params.comment_id


//* delete comment
	await Comment.findByIdAndDelete(id_comment)
		.then(() => console.log("this is comment id" + id_comment))
		.then(() => console.log("this is id kost" + id_kost))
		.then(() => req.flash("success", "Comment Succeed Delete"))
		.then(() => res.redirect(`/kost/" + ${id_kost}`))
		.catch(error => console.log(error.message))


	//*delete review in kost first
	await Kost.findByIdAndUpdate(id_kost, {
		$pull: {
			comment: id_comment
		}
	}, {
		new: true
	})

	




})



module.exports = router;