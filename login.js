// ===============================
// CHECK LOGIN STATUS
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    if (localStorage.getItem("loggedIn") === "true") {
        window.location.replace("study.html");
    }

});

// ===============================
// AI STUDY ASSISTANT - LOGIN JS
// ===============================

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

function showToast(message) {
    const toast = document.getElementById("toast");

    if (toast) {
        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2600);
    } else {
        alert(message);
    }
}

// Sign Up page open
document.getElementById("toSignup").addEventListener("click", () => {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
});

// Login page open
document.getElementById("toLogin").addEventListener("click", () => {
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
});

// ===============================
// SIGN UP
// ===============================

signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPass").value;

    if (name === "" || email === "" || password === "") {
        showToast("सभी जानकारी भरें");
        return;
    }

    const emailPattern = /^\S+@\S+\.\S+$/;

    if (!emailPattern.test(email)) {
        showToast("सही Email डालें");
        return;
    }

    if (password.length < 6) {
        showToast("Password कम से कम 6 अक्षर का होना चाहिए");
        return;
    }

    const savedUser = localStorage.getItem("studyAssistantUser");

    if (savedUser) {
        const user = JSON.parse(savedUser);

        if (user.email === email) {
            showToast("यह Email पहले से registered है");
            return;
        }
    }

    const newUser = {
        name: name,
        email: email,
        password: password
    };

    localStorage.setItem(
        "studyAssistantUser",
        JSON.stringify(newUser)
    );

    showToast("Account बन गया! अब Login करें 🎉");

    signupForm.reset();

    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
});

// ===============================
// LOGIN
// ===============================

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPass").value;

    const savedUser = localStorage.getItem("studyAssistantUser");

    if (!savedUser) {
        showToast("पहले Sign Up करके account बनाएं");
        return;
    }

    const user = JSON.parse(savedUser);

    if (email !== user.email) {
        showToast("Email गलत है");
        return;
    }

    if (password !== user.password) {
        showToast("Password गलत है");
        return;
    }

    // Login successful
    localStorage.setItem("loggedIn", "true");

    showToast(`Welcome back, ${user.name}! ✅`);

    loginForm.reset();

    // AI Study Assistant खोलना
    setTimeout(() => {
        window.location.href = "study.html";
    }, 1000);
});
