const {
	Create,
	Read,
	ReadMany,
	Change,
	Erase
} = require("./../Controllers/serviceController");

const router = require("express").Router();
router.route("/").get(ReadMany).post(Create);
// ? service reviews for my kebele
router.route("/:id").get(Read).patch(Change).delete(Erase);
module.exports = router;
