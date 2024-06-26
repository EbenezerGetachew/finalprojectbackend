const {
	Register,
	Login,
	Read,
	ReadMany,
	Change,
	Erase,
	ResidentInKebele,
	ResidentMyId,
	ChangePassword,
	ResetPassword,
	ForgetPassword
} = require("./../Controllers/residentController");
const {protect, protectAdmin} = require("./../Middleware/authorization");
const router = require("express").Router();
router.route("/").get(ReadMany).post(Register);
// ? get resident in my kebele.
router.get("/in-my-kebele", protect, protectAdmin, ResidentInKebele)
router.post("/login/", Login);
router.get("/my-id", protect, ResidentMyId);
router.route("/:id/").get(Read).patch(Change).delete(Erase);

// password management
router.patch("/change-password/:id", ChangePassword);
router.post("/forget-password", ForgetPassword);
router.post("/reset-password/:token", ResetPassword);
module.exports = router;
