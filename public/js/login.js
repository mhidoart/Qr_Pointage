/* Work in proggress */
document.getElementById('see-button').addEventListener('click', evt => {
    document.getElementById('blur-work').style.display = 'none';
})
/* Work in proggress */
function register() {
    window.location.href = "/register";

}
function generatePassword(id, isInput) {
    var randomstring = Math.random().toString(36).slice(-8);
    var target = document.getElementById(id);

    if (isInput) {
        target.value = randomstring;
    } else {
        target.innerHTML = randomstring;


    }

}
function changeType() {
    var obj = document.getElementById("password")
    if (obj.getAttribute('type') == 'password') {
        obj.setAttribute('type', 'text')

    } else {
        obj.setAttribute('type', 'password')
    }
}