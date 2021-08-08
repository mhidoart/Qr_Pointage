$(document).ready(function () {
    console.log("ready!");
    load_satisfaction();
    load_sessions();
});
function load_satisfaction() {
    $.ajax({
        type: "GET",
        url: "/satisfaction",
        success: (res) => {
            id = "satisfactionTbody"

            let obj = document.getElementById(id);
            let str = ""
            res.forEach(s => {
                str = "<tr>"

                str += "<td>" + s.id + "</td>";
                str += "<td>" + s.id_seance + "</td>";
                str += "<td>" + s.id_user[0] + "</td>";
                str += "<td>" + s.questions.length + "</td>";

                str = str + ' <td>' +
                    '<a class="btn btn-warning" href = "/modifier_session?id=<%=s.id%>" > Détails</a >' +
                    '<form method="POST" action="/removeSatisfaction"> ' +
                    '<input type = "text" name = "idForm" class="d-none" value="' + s.id + '" />' +
                    '<button type="submit" class="btn btn-danger" >Supprimé</button></form >' +
                    '</td >'


                str += "</tr>"

                obj.innerHTML += str;
            })

        },
    });
}
function toDateTime(secs) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return t;
}
function load_sessions() {
    $.ajax({
        type: "GET",
        url: "/seances",
        success: (res) => {
            id = "tb_seances"

            let obj = document.getElementById(id);
            let str = ""
            res.forEach(s => {
                str = "<tr>"

                str += "<td>" + s.id + "</td>";
                str += "<td>" + s.sujet + "</td>";
                str += "<td style=\"width: 100px;max-width: 200px;word-wrap: break-word;\">" + s.details + "</td>";
                str += "<td>" + s.date_debut + "</td>";
                str += "<td>" + s.date_fin + "</td>";
                str += "<td>" + s.creatorOfSession.name + "</td>";
                str += "<td style=\"width: 100px;max-width: 200px;word-wrap: break-word;\" >" + s.tuteurs.join(';') + "</td>";
                str += "<td>" + toDateTime(s.dateCreation.seconds) + "</td>";

                str = str + ' <td>' +
                    '<a class="btn btn-warning mt-2" href="/modifier_session?id=' + s.id + '">Modifier</a>' +
                    '<a class="btn btn-primary mt-2" href="/seance_details?id=' + s.id + '">Détails</a>' +
                    '<a class="btn btn-light mt-2" href="/questionnaire?id=' + s.id + '">Questionaire-S</a>' +
                    '<a class="btn btn-light mt-2" href="/questionnaire?id=' + s.id + '">QCM</a>' +
                    '</td >'


                str += "</tr>"

                obj.innerHTML += str;
            })

        },
    });
}