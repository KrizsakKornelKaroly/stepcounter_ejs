const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const db = require('./db');
const moment = require('moment');

// Dashboard route

router.get('/', loginCheck, (req, res) => {
    req.session.error = '';
    req.session.severity = '';

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

// Calendar route

router.get('/calendar', loginCheck, (req, res) => {
    req.session.error = '';
    req.session.severity = '';

    db.query('SELECT date, steps FROM steps WHERE user_id = ?', [req.session.user.id], (err, results) => {
        if (err) {
            console.log(err);
            req.session.error = 'Hiba történt az adatbázis lekérdezése során.';
            req.session.severity = 'danger';
            return res.redirect('/steps');
        }

        const stepData = [];

        results.forEach(row => {
            stepData.push({
                title: "Lépésszám: " + row.steps,
                start: moment(row.date).format('YYYY-MM-DD')
            });
        });

        req.session.stepData = stepData;

        ejs.renderFile('views/steps/calendar.ejs', { session: req.session }, (err, html) => {
            if (err) {
                console.log(err);
                return;
            }
            res.send(html);
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
        req.session.body = '';
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

    if (steps < 0) {
        req.session.error = 'A lépésszám csak pozitív szám lehet!';
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


});

// Delete step entry
// SELECT + DELETE user_id feltétel: csak a saját lépésadatokat lehessen törölni és lekérdezni 

router.get('/delete/:id', loginCheck, (req, res) => {
        req.session.error = '';
    req.session.severity = '';
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

//Edit step entry

router.get('/edit/:id', loginCheck, (req, res) => {

    req.session.error = '';
    req.session.severity = '';
    const stepId = req.params.id;

    db.query('SELECT * FROM steps WHERE id = ? AND user_id = ?', [stepId, req.session.user.id], (err, results) => {
        if (err) {
            req.session.error = 'Hiba történt az adatbázis lekérdezése során.';
            req.session.severity = 'danger';
            return res.redirect('/steps');
        }

        ejs.renderFile('views/steps/steps-edit.ejs', { session: req.session, stepItem: results[0], moment: moment }, (err, html) => {
            if (err) {
                console.log(err);
                return;
            }
            req.session.error = '';
            req.session.body = '';
            res.send(html);
        });
    });
});


router.post('/edit/:id', loginCheck, (req, res) => {
    const stepId = req.params.id;
    const { date, steps } = req.body;
    req.session.body = req.body;

    if (!date || !steps) {
        req.session.error = 'Kérlek, töltsd ki az összes mezőt!';
        req.session.severity = 'warning';
        return res.redirect(`/steps/edit/${stepId}`);
    }

    if (steps < 0) {
        req.session.error = 'A lépésszám csak pozitív szám lehet!';
        req.session.severity = 'warning';
        return res.redirect(`/steps/edit/${stepId}`);
    }

    db.query('SELECT id, date FROM steps WHERE user_id = ? AND id <> ?', [req.session.user.id, stepId], (err, results) => {
        if (err) {
            console.log(err);
            req.session.error = 'Hiba történt az adatbázis lekérdezése során.';
            req.session.severity = 'danger';
            return res.redirect('/steps/new');
        }
        const existingDates = results.map(row => moment(row.date).format('YYYY-MM-DD'));

        if (existingDates.includes(date)) {
            req.session.error = 'Ezen a dátumon már létezik lépésadat!';
            req.session.severity = 'warning';
            return res.redirect(`/steps/edit/${stepId}`);
        }


        db.query('UPDATE steps SET date = ?, steps = ? WHERE id = ? AND user_id = ?', [date, steps, stepId, req.session.user.id], (err, result) => {
            if (err) {
                console.log(err);
                req.session.error = 'Hiba történt a művelet során.';
                req.session.severity = 'danger';
                return res.redirect(`/steps/edit/${stepId}`);
            }
            req.session.error = 'Lépésadat sikeresen frissítve!';
            req.session.severity = 'success';
            req.session.body = '';
            res.redirect('/steps/steps');

        });
    });
});

//
router.get('/statistics', loginCheck, (req, res) => {
    req.session.error = '';
    req.session.severity = '';

    db.query('SELECT date, steps FROM steps WHERE user_id = ? ORDER BY date ASC', [req.session.user.id], (err, results) => {
        if (err) {
            console.log(err);
            req.session.error = 'Hiba történt az adatbázis lekérdezése során.';
            req.session.severity = 'danger';
            return res.redirect('/steps');
        }
        stepData = results;

        stepData.forEach(row => {
            row.date = moment(row.date).format('YYYY-MM-DD');
        });

        now = moment();

        stepDataMonth = stepData.filter(item => moment(item.date).isAfter(now.clone().subtract(1, 'months')));
        stepDataWeek = stepData.filter(item => moment(item.date).isAfter(now.clone().subtract(7, 'days')));
        stepDataYear = stepData.filter(item => moment(item.date).isAfter(now.clone().subtract(1, 'years')));

        ejs.renderFile('views/steps/charts.ejs', { session: req.session, moment: moment, stepData: stepData, stepDataMonth: stepDataMonth, stepDataWeek: stepDataWeek, stepDataYear: stepDataYear }, (err, html) => {
            if (err) {
                console.log(err);
                return;
            }
            res.send(html);
        });

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