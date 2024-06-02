const {
	Register,
	Login,
	Read,
	ReadMany,
	Change,
	Erase,
	ResidentInKebele
} = require("./../Controllers/residentController");
const {protect, protectAdmin} = require("./../Middleware/authorization");
const router = require("express").Router();
router.route("/").get(ReadMany).post(Register);
// ? get resident in my kebele.
router.get("/in-my-kebele", protect, protectAdmin, ResidentInKebele)
router.post("/login/", Login);
router.route("/:id/").get(Read).patch(Change).delete(Erase);
module.exports = router;
