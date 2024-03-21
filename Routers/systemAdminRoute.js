const {
	Register,
	Login,
	Read,
	ReadMany,
	StartSystem,
	Change,
	Erase
} = require("./../Controllers/adminController");

const router = require("express").Router();
router.route("/").get(ReadMany).post(Register);
router.route("/start-system").post(StartSystem);
router.post("/login/", Login);
router.route("/:id/").get(Read).patch(Change).delete(Erase);
module.exports = router;
