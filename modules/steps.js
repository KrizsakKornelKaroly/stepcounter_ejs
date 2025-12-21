const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const db = require('./db');
const moment = require('moment');

router.get('/', loginCheck, (req, res) => {
    db.query('SELECT * FROM statistics WHERE uId = ?', [req.session.user.id], (err, results) => {
        if (err) {
            console.log(err);
            req.session.error = 'Hiba történt az adatbázis lekérdezése során.';
            req.session.severity = 'danger';
            return res.redirect('/steps');
        }


        statistics = results[0];


        if (statistics.maxStepDate) {
            statistics.maxStepDate = moment(statistics.maxStepDate).format('YYYY-MM-DD');
        }
        else{
            statistics.maxStepDate = 'N/A';
        }

        ejs.renderFile('views/steps/dashboard.ejs', { session: req.session, moment: moment, statistics: statistics }, (err, html) => {
            if (err) {
                console.log(err);
            } else {
                res.send(html);
            }
        });


    });




});

router.get('/steps', loginCheck, (req, res) => {    
    db.query('SELECT * FROM steps WHERE user_id = ? ORDER BY date DESC', [req.session.user.id], (err, results) => {
        if (err) {
            console.log(err);
            req.session.error = 'Hiba történt az adatbázis lekérdezése során.';
            req.session.severity = 'danger';
            return res.redirect('/steps');
        }




        stepList = results;

        stepList.forEach(step => {
            step.date = moment(step.date).format('YYYY-MM-DD');
        });

        ejs.renderFile('views/steps/steps.ejs', { session: req.session, stepList: stepList }, (err, html) => {
            if (err) {
                console.log(err);
            } else {
                res.send(html);
            }
        });
    });

});


function loginCheck(req, res, next) {
    if (req.session.user) {
        return next();
    }
    return res.redirect('/users/login');
}

module.exports = router;