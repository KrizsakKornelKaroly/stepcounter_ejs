const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const db = require('./db');
const passwdRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

router.get('/login', (req, res) => {
    ejs.renderFile('views/users/login.ejs', {session: req.session}, (err, html) => {
        if (err) {
            console.log(err);
        }
        req.session.error = '';
        req.session.body = undefined;
        res.send(html);
    });

});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    req.session.body = req.body;

    if (email == '' || password == '') {
        req.session.error = 'Minden mező kitöltése kötelező!';
        req.session.severity = 'danger';
        return res.redirect('/users/login');
    }

    db.query('SELECT * FROM users WHERE email = ? AND password = SHA1(?)', [email, password], (err, results) => {
        if (err) {
            console.log(err);
            req.session.error = 'Hiba történt az adatbázis lekérdezése során.';
            req.session.severity = 'danger';
            return res.redirect('/users/login');
        }
        if (results.length == 0) {
            req.session.error = 'Hibás email cím vagy jelszó!';
            req.session.severity = 'danger';
            return res.redirect('/users/login');
        }
        req.session.user = results[0];
        res.redirect('/steps');
    });
});


router.get('/registration', (req, res) => {
    ejs.renderFile('views/users/registration.ejs', {session: req.session}, (err, html) => {
        if (err) {
            console.log(err);
        }
        req.session.error = '';
        req.session.body = undefined;
        res.send(html);
    });
});

router.post('/registration', (req, res) => {
    const { name, email, password, confirm } = req.body;

    req.session.body = req.body;

    if (password != confirm) {
        req.session.error = 'A jelszavak nem egyeznek!';
        req.session.severity = 'danger';
        return res.redirect('/users/registration');
    }

    if (name == '' || email == '' || password == '' || confirm == '') {
        req.session.error = 'Minden mező kitöltése kötelező!';
        req.session.severity = 'danger';
        return res.redirect('/users/registration');
    }

    if (password.match(passwdRegExp)) {
        req.session.error = 'A jelszónak legalább 8 karakter hosszúnak kell lennie, és tartalmaznia kell legalább egy nagybetűt, egy kisbetűt és egy számot!'
        req.session.severity = 'danger';
        return res.redirect('/users/registration');
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.log(err);
            req.session.error = 'Hiba történt az adatbázis lekérdezése során.';
            req.session.severity = 'danger';
            return res.redirect('/users/registration');
        }

        if (results.length != 0) {
            req.session.error = 'Ez az email cím már foglalt!';
            req.session.severity = 'danger';
            return res.redirect('/users/registration');
        }

        db.query('INSERT INTO users (name, email, password) VALUES (?, ?, SHA1(?))', [name, email, password], (err, results) => {
            if (err) {
                console.log(err);
                req.session.error = 'Hiba történt az adatbázis lekérdezése során.';
                req.session.severity = 'danger';
                return res.redirect('/users/registration');
            }
            req.session.error = 'Sikeres regisztráció!';
            req.session.severity = 'success';
            return res.redirect('/users/login');
        });
    });

});

router.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/users/login');
});

module.exports = router;