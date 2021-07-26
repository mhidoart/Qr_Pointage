const dotenv = require('dotenv')
dotenv.config({ path: './.env' })

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const expressLayouts = require('express-ejs-layouts')
const mysql = require('mysql')
//controllers
const QrGenerator = require('./controller/qr_generator.js')
const qr_generator = new QrGenerator(process.env.URL)

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.db_PASS,
  database: process.env.DATABASE

})
db.connect((err) => {
  if (err) {
    console.log('can\'t establish connexion with mysql err: ' + err);
  } else {
    console.log('connected to my sql :) ');
  }
});

const users = []

// Static Files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/qr', express.static(__dirname + 'public/qr'))
app.use('/img', express.static(__dirname + 'public/img'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())


app.use(expressLayouts)

app.set('layout', './layouts/full-width')

app.set('view engine', 'ejs')


app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


//json tests

app.get('/users', (req, res) => res.json(users))
// auth area
app.get('/', checkAuthenticated, (req, res) => {
  const profession = req.user.isTutor ? 'Tutor' : 'Stagaire';

  res.render('index', { title: 'Home Page', users: users, userName: req.user.name, typeOfUser: profession, layout: './layouts/default' })
})
//auth area
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login', { title: 'Page Login', layout: './layouts/login-layout' })
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))


app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register', { title: 'register', layout: './layouts/login-layout' })
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    let st = {
      id: Date.now().toString(),
      cin: req.body.cin,
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      isActive: false,
      isTutor: false,
      qrPath: '',
      dateCreation: new Date()
    };
    qr_generator.generateStagaireQrCode(st);
    users.push(st)
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})
app.get('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}
//fin auth area
//profile area
app.get('/profile', checkAuthenticated, (req, res) => {

  usr = users.find(user => user.id === req.query.id);
  console.log("profiile scan");
  console.log(req);
  res.render('profile', {
    title: 'profile', target: usr, userName: req.user.name, typeOfUser: req.user.isTutor ? 'Tutor' : 'Stagaire', layout: './layouts/Default'
  })
})
app.post('/profile_activator', checkAuthenticated, (req, res) => {
  usr = users.find(user => user.cin === req.body.cin);
  usr.isActive = !usr.isActive;

  res.json({
    "isActive": usr.isActive
  })
})

//end profile area



//super admin
pre_conf = async () => {
  const hashedPassword = await bcrypt.hash('123', 10)
  users.push({
    id: Date.now().toString(),
    cin: 'CB152244',
    name: 'super admin',
    email: 'mehdiassbbane@gmail.com',
    password: hashedPassword,
    isActive: true,
    isTutor: true,
    qrPath: '',
    dateCreation: new Date()
  })
}

pre_conf();

const port = 5000

app.listen(port, () => console.info(`App listening on port ${port}`))