const {
	Register,
	Login,
	Read,
	ReadMany,
	Change,
	Erase
} = require("./../Controllers/residentController");

const router = require("express").Router();
router.route("/").get(ReadMany).post(Register);
router.post("/login/", Login);
router.route("/:id/").get(Read).patch(Change).delete(Erase);
module.exports = router;
