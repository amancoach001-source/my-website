const logoutBtn = document.getElementById("logoutBtn");

logoutBtn?.addEventListener("click", function () {
    localStorage.removeItem("loggedIn");
    // agar aapki login page ka naam alag hai (jaise index.html), yahan badal dena
    window.location.href = "index.html";
});
