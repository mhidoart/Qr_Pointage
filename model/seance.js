class Seance {

    constructor(id, idv4,
        sujet,
        details,
        date_debut,
        date_fin,
        tuteurs,
        dateCreation,
        creatorOfSession) {

        this.id = id
        this.idv4 = idv4;
        this.sujet = sujet;
        this.details = details;
        this.date_debut = date_debut;
        this.date_fin = date_fin;
        this.tuteurs = tuteurs;
        this.dateCreation = dateCreation;
        this.creatorOfSession = creatorOfSession;
    }
}
module.exports = Seance;