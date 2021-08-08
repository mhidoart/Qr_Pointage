hashCode = function (s) {
    return s.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
}

names = []
$(document).ready(function () {
    console.log("ready!");
    var url_string = window.location.href
    var url = new URL(url_string);
    var idForm = url.searchParams.get("idForm");
    console.log(idForm);
    $.ajax({
        type: "GET",
        url: '/get_satisfaction_form?idForm=' + encodeURIComponent(idForm),
        contentType: 'application/json',
        success: function (data) {
            // alert(data); // show response from the php script.
            var str = ""
            var cp = 1;
            data.questions.forEach(q => {
                var hashID = hashCode(q)
                str += '   <div class="container m-3" >' +
                    '<input class="d-none" id="' + hashID + '" value="' + q + '" />' +
                    '<div class="row" > <label for=""><b> Question ' + cp + " : </b><br>" + q + '</label></div >' +
                    '<div>' +
                    '<div class="form-check form-check-inline">' +
                    '<input class="form-check-input" type="radio" name="' + hashID + '" id="inlineRadio' + hashID + '" value="pas du tout satisfait">' +
                    '<label class="form-check-label" for="inlineRadio' + hashID + '">pas du tout satisfait</label>' +
                    ' </div>' +
                    '<div class="form-check form-check-inline">' +
                    ' <input class="form-check-input" type="radio" name="' + hashID + '" id="inlineRadio' + hashID + '" value="peu satisfait">' +
                    '<label class="form-check-label" for="inlineRadio' + hashID + '">peu satisfait</label>' +
                    ' </div>' +
                    '<div class="form-check form-check-inline">' +
                    '<input class="form-check-input" type="radio" name="' + hashID + '" id="inlineRadio' + hashID + '"  value="Neutre" checked>' +
                    '  <label class="form-check-label" for="inlineRadio' + hashID + '">Neutre</label>' +
                    '  </div>' +
                    ' <div class="form-check form-check-inline">' +
                    ' <input class="form-check-input" type="radio" name="' + hashID + '" id="inlineRadio' + hashID + '" value="Plutôt satisfait">' +
                    '  <label class="form-check-label" for="inlineRadio' + hashID + '">Plutôt satisfait</label>' +
                    ' </div>' +
                    '<div class="form-check form-check-inline">' +
                    '<input class="form-check-input" type="radio" name="' + hashID + '" id="inlineRadio' + hashID + '" value="Trés Satisfait">' +
                    '<label class="form-check-label" for="inlineRadio' + hashID + '">Trés Satisfait</label>' +
                    ' </div>' +
                    ' </div>' +
                    ' </div>';
                cp += 1
                names.push(hashID)

            });
            document.getElementById("Questions").innerHTML = str


        },
        error: function (err) {
            alert("erreur de saisie");
        }
    });


    //submit form
    $("#repToSatis").submit(function (e) {

        e.preventDefault(); // avoid to execute the actual submit of the form.

        var form = $(this);
        var url = form.attr('action');

        //collecting data
        var url_string = window.location.href
        var urlStringo = new URL(url_string);
        var idForm = urlStringo.searchParams.get("idForm");
        var model = {
            idForm: idForm,
            idUser: document.getElementById('idUser').value,
            acceptPolicy: document.getElementById('acceptPolicy').checked,
            qrep: []
        }
        names.forEach(elem => {
            var qr = {
                question: "",
                rep: ""
            }
            var radios = document.getElementsByName(elem);
            var question = document.getElementById(elem).value;
            //filling the question field
            qr.question = question;
            for (var i = 0, length = radios.length; i < length; i++) {
                if (radios[i].checked) {
                    // do whatever you want with the checked radio

                    //alert(radios[i].value);

                    //filling the response of the question
                    qr.rep = radios[i].value

                    // only one radio can be logically checked, don't check the rest
                    break;
                }
            }
            model.qrep.push(qr);
        })

        console.log(model);

        console.log(model);
        $.ajax({
            type: "POST",
            url: url,
            contentType: 'application/json',
            data: JSON.stringify(model), // serializes the form's elements.
            success: function (data) {
                // alert(data); // show response from the php script.
                window.location.href = "/";

            },
            error: function (err) {
                alert("erreur de saisie");
            }
        });



    });
});