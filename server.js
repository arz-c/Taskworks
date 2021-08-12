if(process.env.NODE_ENV !== 'production')
    require('dotenv').config()

const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const path = require('path')
const fs = require('fs')
const qs = require('qs')
const favicon = require('serve-favicon');

const getUserByUsername = username => users.find(user => user.username === username)
const getUserByID = id => users.find(user => user.id === id)

const initializePassport = require('./passport-config')
initializePassport(passport, getUserByUsername, getUserByID)

// const newDayResets = require('./new-day-resets') // see new-day-resets.js for why this is disabled

const app = express()
const port = process.env.PORT

let users
fs.readFile('database.json', 'utf-8', (err, data) => {
    if(err) throw err
    users = JSON.parse(data)
    main()
})

function updateDB() {
    fs.writeFile(
        'database.json',
        JSON.stringify(users),
        (err) => {
            if(err) throw err
            //fs.readFile('database.json', 'utf-8', (err, data) => console.log(data))
        }
    )
}

function main() {
    /*// INITIAL TIMEOUT SETUP
    // See new-day-resets.js for why this is disabled
    // Setting initial new day reset timeout to tomorrow's day start
    let rightNow =  new Date()
    let timeDiff = -1 * 4 * 60 * 60 * 1000 // -4 hours (GMT -> PST)
    rightNow.setTime(rightNow.getTime() + timeDiff)
    let tomorrow =  new Date()
    tomorrow.setTime(tomorrow.getTime() + timeDiff) // doing this again because there's no easy way to clone instances in Javascript
    tomorrow.setDate(tomorrow.getDate() + 1);
    // setting to day start
    tomorrow.setHours(0);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);
    tomorrow.setMilliseconds(0);
    let deltaT = tomorrow.getTime() - rightNow.getTime();
    console.log(`New day resets being checked in ${Math.floor(deltaT / 1000 / 60 / 60)} hours and ${Math.round(deltaT / 1000 / 60 % 60)} minutes`)
    setTimeout(function() { newDayResets(users, updateDB) }, deltaT);*/

    // EXPRESS SETUP
    app.set('view-engine', 'ejs') // ejs (embedded js) allows dynamic changes to otherwise static html elements
    // app.use(express.urlencoded({extended: false})) // extended: false so that url-encoded data will be parsed with the querystring library instead of qs
    app.use(express.urlencoded({extended: true})) // extended: true because qs supports nested objects, which is needed for the complex List and Task objects
    app.use(flash()) // initialize flash
    app.use(session({ // sessions are like cookies, but instead of only getting stored on the client, they get stored on the server & the client; is used to keep user logged in
        secret: process.env.SESSION_SECRET, // is used to hash the session; the longer the string, the more secure the session will be
        resave: false, // don't resave same values to variables
        saveUninitialized: false // don't save blanks for uninitialized variables
    }))
    app.use(passport.initialize()) // initialize passport
    app.use(passport.session()) // initialize session
    app.use(methodOverride('_method')) // the method override variable will be '_method' (used in index.ejs to make an HTTP DELETE request)
    app.use(favicon(__dirname + '/assets/favicon.ico'));

    app.use('/assets', express.static('assets'))
    app.use('/code/account/css', express.static('views/account/css'))
    app.use('/code/list-view/js', express.static('views/app/list-view/js'))
    app.use('/code/list-view/css', express.static('views/app/list-view/css'))
    app.use('/code/calendar-view/js', express.static('views/app/calendar-view/js'))
    app.use('/code/calendar-view/css', express.static('views/app/calendar-view/css'))

    // ENTRIES
    app.get('/', checkAuthenticated, (req, res) => { // check is user is logged in first,
        console.log('Home GET request recieved')
        res.redirect('/app/list-view')
    })

    app.get('/app/list-view', checkAuthenticated, (req, res) => { // check is user is logged in first,
        res.render('app/list-view/index.ejs', {username: req.user.username, id: req.user.id}) // then render scheduler app (sending it name for display and ID for verification when communicating with database)
    })

        app.get('/app/calendar-view', checkAuthenticated, (req, res) => { // check is user is logged in first,
        res.render('app/calendar-view/index.ejs', {username: req.user.username, id: req.user.id}) // then render scheduler app (sending it name for display and ID for verification when communicating with database)
    })

    app.get('/login', checkNotAuthenticated, (req, res) => { // check is user is not logged in first,
        res.render('account/login.ejs') // then render login page (login.ejs)
    })

    app.post('/login',
        checkNotAuthenticated, // check is user is not logged in first,
        passport.authenticate('local', { // then call authenticate user callback (authenticateUser in passport-config.js)
                successRedirect: '/', // if a user successfully logs in, send them to the home page
                failureRedirect: '/login', // if a user fails the log in, send them back to the log in page
                failureFlash: true // display flash messages (messages.error in login.ejs)
        })
    )

    app.get('/register', checkNotAuthenticated, (req, res) => { // check is user is not logged in first,
        res.render('account/register.ejs') // then render register page (register.ejs)
    })

    app.post('/register', checkNotAuthenticated, async (req, res) => { // check is user is not logged in first,
        console.log('Register POST request recieved')
        try { // then save new user's info
            const hashedPassword = await bcrypt.hash(req.body.password, 10) // 10 is the complexity (for lack of a better term) of the hash
            let user = {
                id: Date.now().toString(), // this Date obj serves as a unique ID for every user
                username: req.body.username,
                password: hashedPassword,
                data: {
                    labels: [],
                    lists: [],
                }
            }
            users.push(user)
            updateDB()
            console.log(`New user registered: '${JSON.stringify(user, null, '  ')}'`)
            res.redirect('/login') // if successful, redirect to login
        } catch(e) {
            throw e
            res.redirect('/register') // if unsuccessful, redirect back to register
        }
    })

    app.delete('/logout', (req, res) => { // on HTTP DELETE request on /logout ('/logout?_method=DELETE' in index.ejs),
        console.log('Logut DELETE request recieved')
        req.logOut() // call passport's logOut on req
        res.redirect('/login') // redirect to login
    })

    app.get('/database', checkAuthenticated, async (req, res) => { // opening for fetching from database
        console.log('Database GET request received')
        try { // putting try-catch here so server doesn't crash if someone attempts to directly access /database
            res.send(getUserByID(req.query.id).data)
        } catch(e) {
            console.log('ERROR:', e)
        }
    })

    app.post('/database', checkAuthenticated, async (req, res) => { // opening for editing database
        try { // putting try-catch here so server doesn't crash if someone attempts to directly access /database
            let header = req.query.header
            let payload = qs.parse(req.query.payload)
            console.log('Database POST request received:')
            console.log(
                (
                    `Header:\n` + 
                    `${JSON.stringify(header, null, '  ')}\n` +
                    `Payload:\n` +
                    `${JSON.stringify(payload, null, '  ')}`
                ).replace(/^/gm, '  ') // tab in
            ) 

            if(header.type == 'tasks') { // when tasks are being directly changed, they require 2 indicies, which is why they are a special case
                switch(header.action) {
                    case 'add':
                        getUserByID(header.id)['data']['lists'][parseInt(payload.index.list)]['tasks'].push(payload.object)
                        break
                    case 'edit':
                        getUserByID(header.id)['data']['lists'][parseInt(payload.index.list)]['tasks'][parseInt(payload.index.task)] = payload.object
                        break
                    case 'remove':
                        getUserByID(header.id)['data']['lists'][parseInt(payload.index.list)]['tasks'].splice(parseInt(payload.index.task), 1)
                        break
                }
            } else if(header.type == 'lists' && header.action == 'editTaskOrder') { // adjusting task order is more efficient than saving an entirely new list
                let oldTasks = getUserByID(header.id)['data']['lists'][parseInt(payload.index)]['tasks'];
                let newTasks = [];
                let comparativeArray = payload.comparativeArray;
                for(let e of comparativeArray) {
                    newTasks[parseInt(e[1])] = (e != undefined) ? oldTasks[parseInt(e[0])] : undefined;
                }
                getUserByID(header.id)['data']['lists'][parseInt(payload.index)]['tasks'] = newTasks;
            } else {
                switch(header.action) {
                    case 'add':
                        getUserByID(header.id)['data'][header.type].push(payload.object)
                        break
                    case 'edit':
                        getUserByID(header.id)['data'][header.type][parseInt(payload.index)] = payload.object
                        break
                    case 'remove':
                        getUserByID(header.id)['data'][header.type].splice(parseInt(payload.index), 1)
                        break
                }
            }

            updateDB();
            res.send('Saved to DB')
        } catch(e) {
            console.log('ERROR:', e)
        }
    })

    // AUTHENTICATION FUNCTIONS
    function checkAuthenticated(req, res, next) {
        if(req.isAuthenticated()) { // if user is authenticated
            return next() // continue the flow to the next callback
        }
        res.redirect('/login') // else, redirect to login
    }

    function checkNotAuthenticated(req, res, next) {
        if(req.isAuthenticated()) { // if user is authenticated
            return res.redirect('/') // redirect to login
            
        }
        next() // else, continue the flow to the next callback
    }

    // SERVER START
    app.listen(port, function() {
        console.log(`Server successfully started! Listening to port ${port}...`)
    })
}