const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");


// ==================== LOGIN ====================

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPass").value.trim();

    if (email === "" || password === "") {
        alert("कृपया Email और Password भरें।");
        return;
    }

    // Login successful
    localStorage.setItem("loggedIn", "true");

    // Open AI Study Assistant
    window.location.href = "study.html";
});


// ==================== SIGN UP ====================

signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPass").value.trim();

    if (name === "" || email === "" || password === "") {
        alert("कृपया सभी जानकारी भरें।");
        return;
    }

    if (password.length < 6) {
        alert("Password कम से कम 6 अक्षरों का होना चाहिए।");
        return;
    }

    // Save demo account
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);

    // Account created and logged in
    localStorage.setItem("loggedIn", "true");

    alert("Account successfully बन गया! 🎉");

    // Open AI Study Assistant
    window.location.href = "study.html";
});

const toSignup = document.getElementById("toSignup");
const toLogin = document.getElementById("toLogin");

toSignup.addEventListener("click", function (event) {
    event.preventDefault();

    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
});

toLogin.addEventListener("click", function (event) {
    event.preventDefault();

    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
});
