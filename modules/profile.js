const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const db = require('./db');
const moment = require('moment');
const passwdRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
const SHA1 = require('crypto-js/sha1');


router.get('/', loginCheck, (req, res) => {
    ejs.renderFile('views/profile/index.ejs', { session: req.session, moment: moment }, (err, html) => {
        if (err) {
            console.log(err);
        }
        else{
            res.send(html);
        }
    });
});

router.post('/update', loginCheck, (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        req.session.error = 'Minden mező kitöltése kötelező.';
        req.session.severity = 'danger';
        return res.redirect('/profile');
    }


    db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.session.user.id], (err, result) => {
        if (err) {
            console.log(err);
            req.session.error = 'Hiba történt az adatok frissítése során.';
            req.session.severity = 'danger';
            return res.redirect('/profile');
        }


        req.session.user.name = name;
        req.session.user.email = email;
        req.session.error = 'Adatok sikeresen frissítve.';
        req.session.severity = 'success';
        return res.redirect('/profile');
    });
});

router.post('/password', loginCheck, (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        req.session.error = 'Minden mező kitöltése kötelező.';
        req.session.severity = 'danger';
        return res.redirect('/profile');
    }

    if (!passwdRegExp.test(newPassword)) {
        req.session.error = 'A jelszónak legalább 8 karakter hosszúnak kell lennie, és tartalmaznia kell legalább egy nagybetűt, egy kisbetűt és egy számot.';
        req.session.severity = 'danger';
        return res.redirect('/profile');
    }

    if(currentPassword === newPassword) {
        req.session.error = 'Az új jelszó nem egyezhet meg a jelenlegi jelszóval.';
        req.session.severity = 'danger';
        return res.redirect('/profile');
    }
    
    if (newPassword !== confirmNewPassword) {
        req.session.error = 'Az új jelszavak nem egyeznek.';
        req.session.severity = 'danger';
        return res.redirect('/profile');
    }

    if (SHA1(currentPassword).toString() !== req.session.user.password) {
        req.session.error = 'Hibás jelenlegi jelszó!';
        req.session.severity = 'danger';
        return res.redirect('/profile');
    }

    db.query('UPDATE users SET password = ? WHERE id = ?', [SHA1(newPassword).toString(), req.session.user.id], (err, result) => {
        if (err) {
            console.log(err);
            req.session.error = 'Hiba történt a jelszó módosítása során.';
            req.session.severity = 'danger';
            return res.redirect('/profile');
        }
        req.session.error = 'Jelszó sikeresen módosítva.';
        req.session.severity = 'success';
        return res.redirect('/profile');
    });
});



function loginCheck(req, res, next) {
    if (req.session.user) {
        return next();
    }
    return res.redirect('/users/login');
}

module.exports = router;