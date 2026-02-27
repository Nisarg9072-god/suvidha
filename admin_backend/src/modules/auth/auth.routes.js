const express = require("express");
const { me } = require("./auth.controller");
const auth = require("../../middlewares/auth");

const router = express.Router();

router.get("/me", auth, me);

module.exports = router;
