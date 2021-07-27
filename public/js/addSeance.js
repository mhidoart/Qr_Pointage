default_url = 'http://localhost:5000'

$(document).ready(function () {
    console.log("ready!");
    $("#dt").hover(function () {
        dt_pick1()
    });
    $("#dt").click(function () {
        dt_pick1()
    });
    function dt_pick1() {
        $.datetimepicker.setLocale('fr')

        $.datetimepicker.setDateFormatter({
            parseDate: function (date, format) {
                var d = moment(date, format);
                return d.isValid() ? d.toDate() : false;
            },
            formatDate: function (date, format) {
                return moment(date).format(format);
            }
        });
        $("#dt").datetimepicker({
            format: 'dddd, MMMM D, YYYY h:mm',
            formatDate: 'dddd MMMM D, YYYY',
            formatTime: 'h:mm a'
        });
    }


    // date fin 
    $("#dt").hover(function () {
        dt_pick2()
    });
    $("#dt").click(function () {
        dt_pick2()
    });
    function dt_pick2() {
        $.datetimepicker.setLocale('fr')
        $.datetimepicker.setDateFormatter({
            parseDate: function (date, format) {
                var d = moment(date, format);
                return d.isValid() ? d.toDate() : false;
            },
            formatDate: function (date, format) {
                return moment(date).format(format);
            }
        });
        $("#dt2").datetimepicker({
            format: 'dddd, MMMM D, YYYY h:mm',
            formatDate: 'dddd MMMM D, YYYY',
            formatTime: 'h:mm a'
        });
    }




});
function showAddTutor() {
    $('#exampleModal').modal('show');
}

function hideAddTutor() {
    $('#exampleModal').modal('hide');
}
function AjouterParmiTuteurs(idTuteur) {
    $.ajax({
        type: "POST",
        url: default_url + "/getUserById",
        data: { 'id': encodeURIComponent(idTuteur) },
        success: (res) => {
            console.log(res);
            idRow = "#row_" + idTuteur
            if ($("#emailTuteurs").val() != "") {
                $("#emailTuteurs").val($("#emailTuteurs").val() + ";" + res.email)

            } else {
                $("#emailTuteurs").val(res.email)
            }
            $(idRow).fadeOut();


        },
    });
}