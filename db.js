const firebase = require('firebase');
const config = require('./config');

const db = firebase.initializeApp(config.firebaseConfig);
console.log('firebase app name = ' + firebase.app().name);

module.exports = db;