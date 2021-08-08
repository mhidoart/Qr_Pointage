
const qr = require("qrcode");
const fs = require('fs');
const path = require('path');
const url = require('url')



class QrGenerator {
    myUrl = '';
    qrRootFolder = '';

    constructor(myUrl) {
        this.myUrl = new URL(myUrl)
        this.qrRootFolder = path.join(__dirname, '..', '/public', '/Qr')
        console.log('root path ' + this.qrRootFolder);

        this.createFolder(this.qrRootFolder);

    }

    createFolder(dirpath) {

        if (!fs.existsSync(dirpath)) {
            fs.mkdirSync(dirpath, {}, (err) => {
                if (err) {

                    throw err;
                }

                console.log('the folder has been created successfully !');

            });
        }
    }

    // generé un qr code unique pour un stagaire

    generateStagaireQrCode(stagaire) {
        let i, j;
        //generate a folder for each session
        console.log("start generating Qr codes .... (for " + stagaire.name + " sessions)  ");
        let qr_name = "" + stagaire.name + "_" + stagaire.cin;
        qr_name = qr_name.replace(/\s/g, '')
        console.log(qr_name);

        let currentPath = path.join(this.qrRootFolder, qr_name);

        console.log(currentPath);
        console.log('creating folder : ' + currentPath);
        this.createFolder(currentPath);
        //le contenu du qr code ou l'information qui va etre le resulta apres avoir scanner se qrcode
        let data = new URL(this.myUrl)
        data.pathname = "profile"
        data.searchParams.append('id', stagaire.id);
        data.searchParams.append('cin', stagaire.cin);

        console.log(data);
        this.saveQrCode(currentPath, qr_name, data.href);
        stagaire.qrPath = '/qr/' + qr_name + "/" + qr_name + ".png"

        console.log("end generating Qr codes for stagaire: " + qr_name);

    }
    saveQrCode(qrPath, qrName, data) {
        if (!qrName.endsWith(".png")) {
            qrName = qrName + ".png"
        }
        qr.toFile(path.join(qrPath, qrName), data);
    }
    //session qrCode 
    generateSessionQrCode(session) {
        let i, j;
        console.log("start generating Qr codes .... (for " + session.idv4 + " sessions)  ");
        var session_folder = path.join(this.qrRootFolder, '/sessions')
        this.createFolder(session_folder);



        console.log("saving Qr Code of session in : " + session_folder);

        //le contenu du qr code ou l'information qui va etre le resulta apres avoir scanner se qrcode
        let data = new URL(this.myUrl)
        data.pathname = "seance_details"
        data.searchParams.append('id', session.idv4);

        console.log(data);
        this.saveQrCode(session_folder, session.idv4, data.href);
        session.qrPath = '/qr/sessions/' + session.idv4 + '.png';
        console.log("end generating Qr codes for Session: " + session.idv4);

    }


    // a rectifier plus tard
    /*
    generateQrCodes() {
        let i, j;
        //generate a folder for each session
        console.log("start generating Qr codes .... (for " + seanaces.length + " sessions)  ");
        for (i = 0; i < seanaces.length; i++) {
            let currentPath = path.join(qrRootFolder, seanaces[i].uid);
            console.log(currentPath);
            console.log("loading...(" + ((i / seanaces.length) * 100) + ")");
            createFolder(currentPath);
            for (j = 0; j < seanaces[i].interlocuteurs.length; j++) {
                data = seanaces[i].interlocuteurs[j].cin + ";" + seanaces[i].uid;

                saveQrCode(currentPath, seanaces[i].interlocuteurs[j].cin, data);

            }
        }
        console.log("end generating Qr codes.");

    }
    */


}
/*
qg = new QrGenerator('.');

st = {
    id: Date.now().toString(),
    cin: 'CB152244',
    name: 'super admin',
    email: 'mehdiassbbane@gmail.com',
    password: 'nlklklknlk',
    isActive: true,
    isTutor: true,
    dateCreation: new Date()
};
qg.generateStagaireQrCode(st);
*/
module.exports = QrGenerator;