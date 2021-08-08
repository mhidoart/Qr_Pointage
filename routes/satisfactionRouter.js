const express = require('express')
const { addForm, getAllForms } = require('../controller/satisfactionController')

const router = express.Router();

router.get('/', getAllForms)


router.post('/add', addForm)




module.exports = {
    routes: router
}
