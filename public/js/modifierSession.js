
$(document).ready(function () {
    load_session()
})
function toDateTime(secs) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return t;
}
function setValue(idElement, val, innerHTML) {
    if (innerHTML) {
        document.getElementById(idElement).innerHTML = val;

    } else {
        document.getElementById(idElement).value = val;

    }
}
function load_session() {
    var url_string = window.location.href
    var searchableUrl = new URL(url_string);
    var idSession = searchableUrl.searchParams.get("id");
    console.log(idSession);
    $.ajax({
        type: "GET",
        url: "/get_seance_by_id?id=" + idSession,
        success: (res) => {
            console.log(res);

            setValue('idSession', idSession, false)
            setValue('dtCreation', toDateTime(res.dateCreation.seconds), false)
            setValue('createur', res.creatorOfSession.name, false)
            setValue('sujet', res.sujet, false)
            setValue('details', res.details, true)
            setValue('dt', res.date_debut, false)
            setValue('dt2', res.date_fin, false)
            setValue('emailTuteurs', res.tuteurs.join(';'), false)

        },
    });
}