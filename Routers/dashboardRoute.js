const {Summary, SummaryInKebele} = require("./../Controllers/dashboardController");
const {protect, protectAdmin} = require("./../Middleware/authorization");

const router = require("express").Router();
router.route("/kebele").get(Summary);
router.route("/summary-in-Kebele").get(protect, protectAdmin, SummaryInKebele);
module.exports = router;
