const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email)
    if (user == null) {
      return done(null, false, { message: 'Il y a aucun utilisateur avec cet e-mail' })
    }

    try {
      if (await bcrypt.compare(password, user.password) && user.isActive == true) {
        return done(null, user)
      } else {
        return done(null, false, {
          message: 'Mot de pass incorrect ou vous n\'êtes pas autorisé à vous connecter '
        })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = initialize