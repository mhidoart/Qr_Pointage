const dotenv = require('dotenv')
dotenv.config({ path: './.env' })
const uuid = require('uuid');


const express = require('express')
const cors = require('cors');
var bodyParser = require('body-parser')

const app = express()
// create application/json parser
app.use(bodyParser.json())

const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const expressLayouts = require('express-ejs-layouts')
const mysql = require('mysql')
/// firebase 
const Satisfaction = require('./model/satisfaction')
const Seance = require('./model/seance')

const firebase = require('./db');
const firestore = firebase.firestore();

//router
const satisfactionRouter = require('./routes/satisfactionRouter')

//controllers
const QrGenerator = require('./controller/qr_generator.js')
const qr_generator = new QrGenerator(process.env.URL)

const { getFormsArray } = require('./controller/satisfactionController')

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
app.use(cors());


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

app.get('/users', checkAuthenticated, (req, res) => {
  res.json(users)
})
app.get('/seancesParUser', (req, res) => {
  const nbrSeances = function (name) {
    var cp = 0;
    seances.forEach(s => {
      s.creatorOfSession.name == name && s.creatorOfSession.isTutor == true ? cp++ : null;
    })
    return cp;
  }
  var tab = users.map(function (s) {
    return { usr: s.name, score: 0 }
  })
  tab.forEach(t => {
    t.score = nbrSeances(t.usr)
  });
  res.json(tab)
})

app.get('/seances', async (req, res) => {
  try {
    const st = await firestore.collection('seance');
    const data = await st.get();
    const sessions = [];
    if (data.empty) {
      res.status(404).send('No student record found');
    } else {
      data.forEach(doc => {
        /// fill array of st
        const session = new Seance(doc.id,
          doc.data().idv4,
          doc.data().sujet,

          doc.data().details,
          doc.data().date_debut,
          doc.data().date_fin,
          doc.data().tuteurs,
          doc.data().dateCreation,
          doc.data().creatorOfSession)
        sessions.push(session)
      });

      res.json(sessions)
    }
  } catch (err) {
    res.status(400).send(err.message);

  }
})
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

  usr = users.find(user => user.id == req.query.id);
  // console.log("profiile scan");
  //console.log(req);
  res.render('profile', {
    title: 'profile', target: usr, userName: req.user.name, typeOfUser: req.user.isTutor ? 'Tutor' : 'Stagaire', layout: './layouts/Default'
  })
})
app.post('/profile_activator', checkAuthenticated, (req, res) => {
  usr = users.find(user => user.cin == req.body.cin);
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

app.get('/seance_details', checkAuthenticated, (req, res) => {

  se = seances.find(s => s.id == req.query.id);
  //TO DO il faut faire un try catch ici avec redirection a une page d'erreur
  res.render('seance_details', {
    title: 'seance_details', target: se, userName: req.user.name, typeOfUser: req.user.isTutor ? 'Tutor' : 'Stagaire', layout: './layouts/public_layout'
  })
})
app.get('/ajouter_seance', checkAuthenticated, (req, res) => {

  let usr = users.filter(user => user.isTutor === true && user.isActive === true ? user : null);
  console.log(usr);

  res.render('addSeance', { title: 'Ajouter séance', users: usr, error: '', layout: './layouts/login-layout' })
})
app.post('/ajouter_seance', checkAuthenticated, async (req, res) => {


  /*
  old local model
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
  */
  var seance = {

    idv4: uuid.v4(),
    sujet: req.body.sujet,
    details: req.body.details,
    date_debut: req.body.dt,
    date_fin: req.body.dt2,
    tuteurs: req.body.emailTuteurs.split(';'),
    dateCreation: new Date(),
    creatorOfSession: req.user
  }
  qr_generator.generateSessionQrCode(seance);

  try {
    const st = await firestore.collection('seance').doc().set(seance);
    console.log(st)
  } catch (err) {
    //u should redirect to an error
    // res.redirect('/register')
    res.render('addSeance', { title: 'Ajouter séance', users: usr, error: 'erreur enregistrement', layout: './layouts/login-layout' })
  }

  //plus tard /#seances
  res.redirect('/#sessions')
})


app.get('/get_seance_by_id', async (req, res) => {


  try {
    const id = req.query.id;
    const st = await firestore.collection('seance').doc(id);
    const data = await st.get();

    if (!data.exists) {
      res.status(404).send('seance not found ');
    } else {
      res.json(data)
    }
  } catch (error) {
    res.status(400).send(error.message);

  }
})
app.get('/modifier_session', checkAuthenticated, async (req, res) => {

  //let usr = users.filter(user => user.isTutor === true && user.isActive === true && !session.tuteurs.includes(user.email) ? user : null);


  let usr = users.filter(user => user.isTutor === true && user.isActive === true ? user : null);


  res.render('modifierSession.ejs', { title: 'Modifier séance', session: req.query.id, users: usr, error: '', layout: './layouts/login-layout' })
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

//satisfaction area



app.get('/questionnaire', async (req, res) => {
  let idSeance = req.query.id;
  res.render('addSatisfactionForm', {
    title: 'Formulaire de satisfaction ', idSeance: idSeance, idUser: req.user.id, userName: req.user.name, typeOfUser: req.user.isTutor ? 'Tutor' : 'Stagaire', layout: './layouts/Default'
  })

})


app.post('/questionnaire', async (req, res) => {

  try {
    const data = {
      idSeance: req.body.idSeance,
      idUser: req.body.idUser,
      questions: req.body.questions
    }
    console.log(req.body);
    const student = await firestore.collection('satisfaction').doc().set(data);
    res.send('Record saved successfuly')
  } catch (err) {
    res.status(400).send(err.message);
  }

})
app.post('/removeSatisfaction', async (req, res) => {
  try {
    const id = req.body.idForm;
    console.log(id);
    await firestore.collection('satisfaction').doc(id).delete();
    res.redirect('/#satisfactionForms')
  } catch (error) {
    res.status(400).send(err.message);

  }
})

app.get('/satisfaction', async (req, res) => {
  try {
    const forms = await firestore.collection('satisfaction');
    const data = await forms.get();
    const formsArray = [];
    if (data.empty) {
      res.status(404).send('No record found');
    } else {
      data.forEach(doc => {
        console.log(doc.data());
        const form = new Satisfaction(
          doc.id,
          doc.data().idSeance,
          doc.data().idUser,
          ...doc.data().questions

        );

        formsArray.push(form)

      });

      res.json(formsArray)
    }
  } catch (error) {
    res.status(400).send(error.message);

  }

})

//page repondre a une satisfaction
app.get('/repondre_satisfaction', async (req, res) => {

  res.render('repondre_satisfaction', { title: 'repondre a un formulaire de satisfaction', user: req.user, idForm: req.query.idForm, layout: './layouts/public_layout' });
})

app.get('/get_satisfaction_form', async (req, res) => {

  try {
    const id = req.query.idForm
    const satisfaction = await firestore.collection('satisfaction').doc(id);
    const data = await satisfaction.get();
    console.log('idddd' + id);
    if (!data.exists) {
      res.status(404).send('satisfaction not found ');
    } else {
      res.json(data.data())
    }
  } catch (error) {
    res.status(400).send(err.message);

  }
})

app.post('/get_satisfaction_form', async (req, res) => {

  try {
    const data = req.body
    const obj = await firestore.collection('repSatisfaction').doc().set(data);
    res.send('Record saved successfuly')
  } catch (err) {
    res.status(400).send(err.message);
  }
})


/// end satisfaction area

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
  }, {
    id: randomPin(),
    cin: 'FRT250',
    name: 'Salah ZDAGADAG',
    email: 'az@gmail.com',
    password: hashedPassword,
    isActive: false,
    isTutor: false,
    qrPath: '',
    dateCreation: new Date()
  })
  var seance = {
    idv4: uuid.v4(),
    sujet: 'cv',
    details: 'Le CV est l’élément déterminant d’une candidature, d’une carrière. Créez un CV simple et moderne en vous inspirant d’un modèle gratuit et de conseils de pro grâce à ce guide.',
    date_debut: new Date(),
    date_fin: new Date(),
    tuteurs: ["Cedrique@gmail.com", "gk@gmail.com"],
    dateCreation: new Date(),
    qrPath: '',
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
    , questions_rep: [
      {
        question: 'question1',
        reponses: [
          {
            rep: 'reponse 1',
            isCorrect: true,
          }, {
            rep: 'reponse 2',
            isCorrect: false,
          }, {
            rep: 'reponse 3',
            isCorrect: false,
          },
          {
            rep: 'reponse 4',
            isCorrect: true,
          }
        ]
      },
      {
        question: 'question 2',
        reponses: [
          {
            rep: 'reponse #1',
            isCorrect: false,
          }, {
            rep: 'reponse #2',
            isCorrect: false,
          }, {
            rep: 'reponse #3',
            isCorrect: true,
          }
        ]
      }
    ]
  }
  qr_generator.generateSessionQrCode(seance);
  seances.push(seance)
}

pre_conf();

const port = process.env.PORT

app.listen(port, () => console.info(`App listening on port ${port}`))