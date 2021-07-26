default_url = 'http://localhost:5000'
function activate_desactivate_profile(e, cin) {
    e.preventDefault();
    $.ajax({
        type: "POST",
        url: default_url + "/profile_activator",
        data: { 'cin': cin },
        success: (res) => {
            id = "activateProfile_" + cin
            id_isActive_col = "isActive_" + cin
            let obj = document.getElementById(id);
            let isActivCol = document.getElementById(id_isActive_col);
            console.log(id);
            if (res.isActive) {
                obj.classList.remove('btn-primary');
                obj.classList.add('btn-danger');
                obj.innerHTML = "Désactivé"
                isActivCol.innerHTML = 'Oui'
                console.log("hello am danger");
                //$(id).removeClass('btn-primary')
                // $(id).addClass('btn-danger')
            } else {
                obj.classList.remove('btn-danger');
                obj.classList.add('btn-primary');
                obj.innerHTML = "Activé"
                isActivCol.innerHTML = 'Non'


                //$(id).removeClass('btn-danger')
                // $(id).addClass('btn-primary')
            }
        },
    });
}