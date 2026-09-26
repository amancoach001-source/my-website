// AI Study Assistant - Logout

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        const confirmLogout = confirm(
            "Kya aap logout karna chahte hain?"
        );

        if (confirmLogout) {
            localStorage.removeItem("loggedIn");
            localStorage.removeItem("loginTime");

            window.location.replace("index.html");
        }
    });
}
