const {
	Create,
	Read,
	ReadMany,
	Change,
	Erase,
	IdInKebele
} = require("./../Controllers/idController");
const {protect, protectAdmin} = require("./../Middleware/authorization");
const router = require("express").Router();
router.route("/").get(ReadMany).post(Create);
// ? id in my kebele
router.get("/in-my-kebele", protect, protectAdmin, IdInKebele)
router.route("/:id").get(Read).patch(Change).delete(Erase);
module.exports = router;
