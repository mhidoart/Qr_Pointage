
nbrQuestion = 1
ids = ['q1']
function deleteQuestion(id) {
    console.log('removing ' + id);
    document.getElementById('divQuestion' + id).remove()
    const index = ids.indexOf('q' + id);
    if (index > -1) {
        ids.splice(index, 1);
    }
    console.log(ids);
}

function addQuestion() {
    nbrQuestion += 1
    //ajouter le nouveau id au tableau d'ids
    ids.push('q' + nbrQuestion)
    console.log(ids);

    document.getElementById('nbrQuestion').value = nbrQuestion;
    let obj = document.getElementById('formulaireSatisfaction')
    str = '<div class="form-group" id="divQuestion' + nbrQuestion + '">' +
        '<label for="q' + nbrQuestion + '">Question</label>' +
        '<div class="row">' +
        '<div class="col-8"><input type="text" class="form-control" id="q' + nbrQuestion + '" name="q' + nbrQuestion + '" placeholder="votre question ici ?"></div>' +
        '<div class="col-4"><button type="button" class="btn btn-danger"  onclick="deleteQuestion(' + nbrQuestion + ')" >Supprimé</button>' +
        '</div>' +
        '</div>' +

        '</div>'
    obj.insertAdjacentHTML('beforeend', str)
    console.log(nbrQuestion);
}

function collectQuestions() {
    let q = []
    for (let index = 0; index <= nbrQuestion; index++) {
        const elem = $('#q' + index).val();
        if (elem) {
            q.push(elem)
        }

    }
    console.log($('#idSeance').val());
    console.log(q);
    return q;

}
$(document).ready(function () {
    $("#satisfactionQForm").submit(function (e) {

        e.preventDefault(); // avoid to execute the actual submit of the form.

        var form = $(this);
        var url = form.attr('action');
        var model = {
            'idSeance': $('#idSeance').val(),
            'idUser': [
                $('#idUser').val()
            ],
            'questions': [
                ...collectQuestions()
            ]
        }
        console.log(model);
        $.ajax({
            type: "POST",
            url: url,
            contentType: 'application/json',
            data: JSON.stringify(model), // serializes the form's elements.
            success: function (data) {
                // alert(data); // show response from the php script.
                window.location.href = "/#satisfactionForms";

            },
            error: function (err) {
                alert("erreur de saisie");
            }
        });


    });
});
