class Satisfaction {

    constructor(id, id_seance, id_user, ...questions) {
        this.id = id
        this.id_seance = id_seance;
        this.id_user = id_user;
        this.questions = questions;
    }
}
module.exports = Satisfaction;