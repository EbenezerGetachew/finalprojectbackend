const {
	Create,
	Read,
	ReadMany,
	Change,
	Erase
} = require("./../Controllers/contactController");

const router = require("express").Router();
router.route("/").get(ReadMany).post(Create);
// ? contact reviews for my kebele
router.route("/:id").get(Read).patch(Change).delete(Erase);
module.exports = router;
