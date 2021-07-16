const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByUsername, getUserByID) {
    const authenticateUser = async (username, password, done) => { // since list holds task data, updating list in database
        const user = getUserByUsername(username)
        if(user == null) {
            console.log(`No user found with username: ${username}`)
            return done(null, false, {message: 'No user with that username'})
        }
        
        try {
            if(await bcrypt.compare(password, user.password)) {
                console.log(`Successful login for username: ${username}`)
                return done(null, user)
            } else {
                console.log(`Incorrect password attempt for username: ${username}`)
                return done(null, false, {message: 'Password incorrect'})
            }
        } catch(e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy(
        authenticateUser // sets callback to our own authentication method so passport can call it whenever it wants to authenticate
    ))
    passport.serializeUser((user, done) => done(null, user.id)) // sets callback to start session with user id
    passport.deserializeUser((id, done) => done(null, getUserByID(id))) // sets callback to end session by grabbing user by their id
}

module.exports = initialize // exports the initialize function, as defined above