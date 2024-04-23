
const jwt = require("jsonwebtoken");
const musql = require("mysql2");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const pool = require("../db/database");
const path = require("path")

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.redirect("/login", 400)
        }
        pool.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
            console.log(results);
            if (!results || !await bcrypt.compare(password, results[0].password)) {
                return res.redirect("/login", 400)
            } else {
                const id = results[0].userId;

                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log("the token is " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }
                res.cookie('userSave', token, cookieOptions);
                return res.redirect("/profile", 200, {
                    message: 'Email or Password is correct'
                });
            }
        })
    } catch (err) {
        console.log(err);
    }
}
exports.register = (req, res) => {
    const { name, email, password, passwordConfirm } = req.body;
    console.log("name, email, password, passwordConfirm", name, email, password, passwordConfirm);
    pool.query('SELECT email from user WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.log("err1", err);
        } else {
            if (results.length > 0) {
                return res.redirect("/login", 300, {
                    message: 'The email is already in use'
                })
            } else if (password != passwordConfirm) {
                return res.redirect("/login", 200);
            }
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log("hashedPassword", hashedPassword);

        pool.query('INSERT INTO user SET ?', { username: name, email: email, password: hashedPassword }, (err, results) => {
            if (err) {
                console.log(err);
            } else {
                console.log("inserted");
                return res.redirect("/login", 200, {
                    message: 'The email is already in use'
                });
            }
        })
    })
    // res.send("Form submitted");
}

exports.isLoggedIn = async (req, res, next) => {
    console.log("request", req.cookies.userSave);
    if (req.cookies.userSave) {
        try {
            // 1. Verify the token
            const decoded = jwt.verify(req.cookies.userSave,
                process.env.JWT_SECRET
            );
            console.log("decoded", decoded);

            // 2. Check if the user still exist
            pool.query('SELECT * FROM user WHERE userId = ?', [decoded.id], (err, results) => {
                console.log(results);
                if (!results) {
                    return next();
                }
                req.user = results[0];
                return next();
            });
        } catch (err) {
            console.log(err)
            return next();
        }
    } else {
        next();
    }
}

exports.logout = (req, res) => {
    res.cookie('userSave', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).redirect("/login");
}