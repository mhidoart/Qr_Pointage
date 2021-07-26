
const qr = require("qrcode");
const fs = require('fs');
const path = require('path');



class QrGenerator {
    url = '';
    qrRootFolder = '';

    constructor(url) {
        this.url = url
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
        let data = stagaire.id + ":" + stagaire.name + ":" + stagaire.cin;

        this.saveQrCode(currentPath, qr_name, data);

        console.log("end generating Qr codes for stagaire: " + qr_name);

    }




    // a rectifier plus tard
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
    saveQrCode(qrPath, qrName, data) {
        if (!qrName.endsWith(".png")) {
            qrName = qrName + ".png"
        }
        qr.toFile(path.join(qrPath, qrName), data);
    }

}

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
