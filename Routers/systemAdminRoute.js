const {
	Register,
	Login,
	Read,
	ReadMany,
	StartSystem,
	Change,
	Erase,
	ChangePassword,
	ResetPassword,
	ForgetPassword
} = require("./../Controllers/adminController");

const router = require("express").Router();
router.route("/").get(ReadMany).post(Register);
router.route("/start-system").post(StartSystem);
router.post("/login/", Login);
router.route("/:id/").get(Read).patch(Change).delete(Erase);


// password management
router.patch("/change-password/:id", ChangePassword);
router.post("/forget-password", ForgetPassword);
router.post("/reset-password/:token", ResetPassword);
module.exports = router;
