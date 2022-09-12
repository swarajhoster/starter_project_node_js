const express = require("express");
const router = express.Router();

const {getAllUsers, newUser} = require("../controllers/auth.controller.js");

router.route("/get-all-users").get(getAllUsers);
router.route("/newuser").post(newUser);

module.exports = router;