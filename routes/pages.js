const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();
router.get('/', authController.isLoggedIn, (req, res) => {
    res.sendFile("main.html", { root: './public/' })
});
router.get('/register', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.redirect(200, "profile")
    }
    else {
        res.sendFile("register.html", { root: './public/' })
    }
});
router.get('/login', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.redirect(200, "profile")
    } else {
        res.sendFile("login.html", { root: './public/' });
    }
});
router.get('/profile', authController.isLoggedIn, (req, res) => {
    console.log("request from page.js", req.user);
    if (req.user) {
        res.sendFile("profile.html", { root: './public/' })
    } else {
        res.sendFile("login.html", { root: './public/' });
    }
})
router.get('/logout', authController.logout, (req, res) => {
    console.log("request from page.js", req.user);
    if (req.user) {
        res.sendFile("profile.html", { root: './public/' })
    } else {
        res.redirect(200,"login");
    }
})
module.exports = router;