const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const db = require('./db');
const moment = require('moment');

// Dashboard route

router.get('/', loginCheck, (req, res) => {
    db.query('SELECT * FROM statistics WHERE uId = ?', [req.session.user.id], (err, results) => {
        if (err) {
            console.log(err);
            req.session.error = 'Hiba történt az adatbázis lekérdezése során.';
            req.session.severity = 'danger';
            return res.redirect('/steps');
        }


        const statistics = results[0] || {};


        if (statistics.maxStepDate) {
            statistics.maxStepDate = moment(statistics.maxStepDate).format('YYYY-MM-DD');
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

// New step entry 

router.get('/new', loginCheck, (req, res) => {
    ejs.renderFile('views/steps/steps-new.ejs', { session: req.session, moment: moment }, (err, html) => {
        if (err) {
            console.log(err);
            return;
        }
        req.session.error = '';
        req.session.body = undefined;
        res.send(html);
    });
});

router.post('/new', loginCheck, (req, res) => {
    const { date = moment().format('YYYY-MM-DD'), steps } = req.body;

    req.session.body = req.body;

    if (!date || !steps) {
        req.session.error = 'Kérlek, töltsd ki az összes mezőt!';
        req.session.severity = 'warning';
        return res.redirect('/steps/new');
    }

    db.query('SELECT date FROM steps WHERE user_id = ? ', [req.session.user.id], (err, results) => {
        if (err) {
            console.log(err);
            req.session.error = 'Hiba történt az adatbázis lekérdezése során.';
            req.session.severity = 'danger';
            return res.redirect('/steps/new');
        }
        const existingDates = results.map(row => moment(row.date).format('YYYY-MM-DD'));

        if (existingDates.includes(date)) {
            req.session.error = 'Erre a dátumra már rögzítettél lépésadatot!';
            req.session.severity = 'warning';
            return res.redirect('/steps/new');
        }
    });

    db.query('INSERT INTO steps (user_id, date, steps) VALUES (?, ?, ?)', [req.session.user.id, date, steps], (err, result) => {
        if (err) {
            console.log(err);
            req.session.error = 'Hiba történt az adatbázis lekérdezése során.';
            req.session.severity = 'danger';
            return res.redirect('/steps/new');
        }
        req.session.error = 'Lépésadat sikeresen hozzáadva!';
        req.session.severity = 'success';
        req.session.body = undefined;
        return res.redirect('/steps/steps');
    });
});

// Delete step entry
// SELECT + DELETE user_id feltétel: csak a saját lépésadatokat lehessen törölni és lekérdezni 

router.get('/delete/:id', loginCheck, (req, res) => {
    const stepId = req.params.id;

    db.query('SELECT * FROM steps WHERE id = ? AND user_id = ?', [stepId, req.session.user.id], (err, results) => {
        if (err) {
            console.log(err);
            req.session.error = 'Hiba történt az adatbázis lekérdezése során.';
            req.session.severity = 'danger';
            return res.redirect('/steps');
        }

        if (results.length == 0) {
            req.session.error = 'A megadott lépésadat nem található.';
            req.session.severity = 'warning';
            return res.redirect('/steps');
        }

        let stepItem = results[0];
        stepItem.date = moment(stepItem.date).format('YYYY-MM-DD');

        ejs.renderFile('views/steps/steps-delete.ejs', { session: req.session, stepItem: stepItem }, (err, html) => {
            if (err) {
                console.log(err);
                return;
            }
            res.send(html);
        });
    });
});

router.post('/delete/:id', loginCheck, (req, res) => {
    const stepId = req.params.id;
    db.query('DELETE FROM steps WHERE id = ? AND user_id = ?', [stepId, req.session.user.id], (err, result) => {
        if (err) {
            console.log(err);
            req.session.error = 'Hiba történt az adatbázis lekérdezése során.';
            req.session.severity = 'danger';
            return res.redirect('/steps');
        }
        req.session.error = 'Lépésadat sikeresen törölve!';
        req.session.severity = 'success';
        return res.redirect('/steps/steps');
    });
});


// loginCheck middleware

function loginCheck(req, res, next) {
    if (req.session.user) {
        return next();
    }
    return res.redirect('/users/login');
}

module.exports = router;