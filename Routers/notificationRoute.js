const {getMyNotification} = require("../Controllers/notificationController");
const {protect} = require("./../Middleware/authorization");

const router = require("express").Router();
router.route("/").get(protect, getMyNotification);
module.exports = router;
