const Satisfaction = require('../model/satisfaction')
const firebase = require('../db');
const firestore = firebase.firestore();



const addForm = async (req, res) => {
    try {
        console.log(req.body);
        const data = req.body
        const student = await firestore.collection('satisfaction').doc().set(data);
        res.send('Record saved successfuly')
    } catch (err) {
        res.status(400).send(err.message);
    }
}
const getAllForms = async (req, res) => {
    try {
        const forms = await firestore.collection('satisfaction');
        const data = await forms.get();
        const formsArray = [];
        if (data.empty) {
            res.status(404).send('No record found');
        } else {
            data.forEach(doc => {
                const form = new Satisfaction(
                    doc.id,
                    doc.data().id_seance,
                    doc.data().id_user,
                    ...doc.data().questions

                );
                formsArray.push(form)
            });

            res.json(formsArray)
        }
    } catch (error) {
        res.status(400).send(error.message);

    }

}



// return array of forms
const getFormsArray = async () => {
    const formsArray = [];

    try {
        const forms = await firestore.collection('satisfaction');
        const data = await forms.get();
        if (data.empty) {
            res.status(404).send('No record found');
        } else {
            data.forEach(doc => {
                console.log(doc.data().questions);
                const form = new Satisfaction(
                    doc.id,
                    doc.data().id_seance,
                    doc.data().id_user,
                    ...doc.data().questions

                );
                formsArray.push(form)
            });

        }
    } catch (error) {
        console.log(error.message);

    }
    console.log("returning array " + formsArray.length)
    return formsArray

}

module.exports = {
    addForm,
    getAllForms,
    getFormsArray
}