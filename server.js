const dotenv = require('dotenv')
dotenv.config({ path: './.env' })
const uuid = require('uuid');


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
const seances = []

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
app.get('/s', (req, res) => res.json(seances))
// auth area
app.get('/', checkAuthenticated, (req, res) => {
  const profession = req.user.isTutor ? 'Tutor' : 'Stagaire';

  res.render('index', { title: 'Home Page', seances: seances, users: users, userName: req.user.name, typeOfUser: profession, layout: './layouts/default' })
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
  res.render('register', { title: 'register', error: '', layout: './layouts/login-layout' })
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  if (users.find(user => user.cin === req.body.cin)) {
    res.render('register', { title: 'register', error: 'Cin exist déja !', layout: './layouts/login-layout' })

  } else if (users.find(user => user.email === req.body.email)) {
    res.render('register', { title: 'register', error: 'Email exist déja !', layout: './layouts/login-layout' })

  } else {
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
  // console.log("profiile scan");
  //console.log(req);
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
app.post('/update_profile', checkAuthenticated, async (req, res) => {
  console.log(req.body);
  try {
    usr = users.find(user => user.id === req.body.id);
    usr.name = req.body.name;
    usr.email = req.body.email;
    usr.isActive = req.body.isActive == 'true' ? true : false;
    usr.isTutor = req.body.isTutor;
    usr.dateCreation = new Date();
    console.log("user is");
    console.log(usr);

    if (usr.cin != req.body.cin) {
      usr.cin = req.body.cin;
      qr_generator.generateStagaireQrCode(usr);

    }


  } catch {
    //u should redirect to an error
    // res.redirect('/register')
  }
  res.redirect('/#users')
})
//end profile area
// seances area

app.post('/getUserById', checkAuthenticated, (req, res) => {
  console.log(req.body);
  usr = users.find(user => user.id == req.body.id);

  res.json({
    "email": usr.email
  })
})

app.get('/ajouter_seance', checkAuthenticated, (req, res) => {

  let usr = users.filter(user => user.isTutor === true && user.isActive === true ? user : null);
  console.log(usr);

  res.render('addSeance', { title: 'Ajouter séance', users: usr, error: '', layout: './layouts/login-layout' })
})
app.post('/ajouter_seance', checkAuthenticated, async (req, res) => {

  try {

    var seance = {
      id: uuid.v4(),
      sujet: req.body.sujet,
      details: req.body.details,
      date_debut: req.body.dt,
      date_fin: req.body.dt2,
      tuteurs: req.body.emailTuteurs.split(';'),
      dateCreation: new Date(),
      creatorOfSession: req.user
    }
    seances.push(seance)

    qr_generator.generateSessionQrCode(seance);




  } catch {
    //u should redirect to an error
    // res.redirect('/register')
    res.render('addSeance', { title: 'Ajouter séance', users: usr, error: '', layout: './layouts/login-layout' })

  }
  //plus tard /#seances
  res.redirect('/#users')
})



app.get('/modifier_session', checkAuthenticated, (req, res) => {
  let session = seances.find(s => s.id == req.query.id);

  //let usr = users.filter(user => user.isTutor === true && user.isActive === true && !session.tuteurs.includes(user.email) ? user : null);
  let usr = users.filter(user => user.isTutor === true && user.isActive === true ? user : null);

  res.render('modifierSession.ejs', { title: 'Modifier séance', session: session, users: usr, error: '', layout: './layouts/login-layout' })
})
app.post('/modifier_session', checkAuthenticated, async (req, res) => {
  let session = seances.find(s => s.id == req.body.id);

  try {

    session.sujet = req.body.sujet;
    session.details = req.body.details;
    session.date_debut = req.body.dt;
    session.date_fin = req.body.dt2;
    session.tuteurs = req.body.emailTuteurs.split(';');
    session.dateCreation = new Date(),
      session.creatorOfSession = req.user

    //if the Qr exist -> its ok : we create a new one having that the qr code has to do with the session is which doesn't change, the function bellow has only benefits
    qr_generator.generateSessionQrCode(seance);




  } catch {
    //u should redirect to an error
    //res.redirect('/')
    //

  }
  //plus tard /#seances
  res.redirect('/#sessions')
})
//end seance area


//super admin
randomPin = () => {
  var val = Math.floor(1000 + Math.random() * 9000);
  //console.log(val);
  return val;
}
pre_conf = async () => {
  const hashedPassword = await bcrypt.hash('123', 10)
  users.push({
    id: randomPin(),
    cin: 'zrs2500',
    name: 'super admin',
    email: 'mehdiassbbane@gmail.com',
    password: hashedPassword,
    isActive: true,
    isTutor: true,
    qrPath: '',
    dateCreation: new Date()
  }, {
    id: randomPin(),
    cin: 'FRP123',
    name: 'Ghislain Djeki',
    email: 'gk@gmail.com',
    password: hashedPassword,
    isActive: true,
    isTutor: true,
    qrPath: '',
    dateCreation: new Date()
  }, {
    id: randomPin(),
    cin: 'FZK230',
    name: 'Cedrique zongo',
    email: 'Cedrique@gmail.com',
    password: hashedPassword,
    isActive: true,
    isTutor: true,
    qrPath: '',
    dateCreation: new Date()
  }, {
    id: randomPin(),
    cin: 'FRT250',
    name: 'ASSABBANE Mehdi',
    email: 'am@gmail.com',
    password: hashedPassword,
    isActive: true,
    isTutor: false,
    qrPath: '',
    dateCreation: new Date()
  })
  var seance = {
    id: uuid.v4(),
    sujet: 'cv',
    details: 'comment creer sont CV',
    date_debut: new Date(),
    date_fin: new Date(),
    tuteurs: ["Cedrique@gmail.com", "gk@gmail.com"],
    dateCreation: new Date(),
    creatorOfSession: {
      id: randomPin(),
      cin: 'FRP123',
      name: 'Ghislain Djeki',
      email: 'gk@gmail.com',
      password: hashedPassword,
      isActive: true,
      isTutor: true,
      qrPath: '',
      dateCreation: new Date()
    }
  }
  seances.push(seance)
}

pre_conf();

const port = 5000

app.listen(port, () => console.info(`App listening on port ${port}`))