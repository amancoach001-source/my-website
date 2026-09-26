// ===============================
// AI STUDY ASSISTANT - LOGIN JS
// SECURE PASSWORD STORAGE VERSION
// 24-HOUR LOGIN SYSTEM
// ===============================

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

// ===============================
// PASSWORD HASH SETTINGS
// ===============================

const PBKDF2_ITERATIONS = 150000;
const HASH_LENGTH = 256;

// ===============================
// UTILITY: ARRAY BUFFER TO HEX
// ===============================

function bufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);

    return Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

// ===============================
// UTILITY: RANDOM SALT
// ===============================

function generateSalt() {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);

    return bufferToHex(salt);
}

// ===============================
// PASSWORD HASH
// ===============================

async function hashPassword(password, saltHex) {

    const encoder = new TextEncoder();

    const passwordData = encoder.encode(password);

    const saltBytes = new Uint8Array(
        saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        passwordData,
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: saltBytes,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256"
        },
        keyMaterial,
        HASH_LENGTH
    );

    return bufferToHex(derivedBits);
}

// ===============================
// CHECK LOGIN STATUS
// ===============================

const loginTime = localStorage.getItem("loginTime");

if (loginTime) {

    const currentTime = Date.now();
    const elapsedTime = currentTime - Number(loginTime);

    // 24 hours
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (elapsedTime < twentyFourHours) {

        // Login अभी valid है
        window.location.replace("study.html");

    } else {

        // 24 घंटे पूरे हो गए
        localStorage.removeItem("loginTime");
        localStorage.removeItem("loggedIn");
    }
}

// ===============================
// TOAST MESSAGE
// ===============================

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

// ===============================
// SIGN UP / LOGIN SWITCH
// ===============================

document.getElementById("toSignup").addEventListener("click", () => {

    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");

});

document.getElementById("toLogin").addEventListener("click", () => {

    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");

});

// ===============================
// SIGN UP
// ===============================

signupForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const name = document
        .getElementById("signupName")
        .value
        .trim();

    const email = document
        .getElementById("signupEmail")
        .value
        .trim()
        .toLowerCase();

    const password = document
        .getElementById("signupPass")
        .value;

    // ===============================
    // BASIC VALIDATION
    // ===============================

    if (name === "" || email === "" || password === "") {

        showToast("सभी जानकारी भरें");
        return;
    }

    // ===============================
    // EMAIL VALIDATION
    // ===============================

    const emailPattern = /^\S+@\S+\.\S+$/;

    if (!emailPattern.test(email)) {

        showToast("सही Email डालें");
        return;
    }

    // ===============================
    // PASSWORD VALIDATION
    // ===============================

    if (password.length < 6) {

        showToast("Password कम से कम 6 अक्षर का होना चाहिए");
        return;
    }

    // ===============================
    // CHECK EXISTING USER
    // ===============================

    const savedUser = localStorage.getItem("studyAssistantUser");

    if (savedUser) {

        try {

            const user = JSON.parse(savedUser);

            if (user.email === email) {

                showToast("यह Email पहले से registered है");
                return;
            }

        } catch (error) {

            // अगर पुराना/invalid data है
            localStorage.removeItem("studyAssistantUser");
        }
    }

    // ===============================
    // CREATE PASSWORD SALT
    // ===============================

    const salt = generateSalt();

    // ===============================
    // CREATE PASSWORD HASH
    // ===============================

    const passwordHash = await hashPassword(
        password,
        salt
    );

    // ===============================
    // CREATE USER
    // ===============================

    const newUser = {

        name: name,

        email: email,

        passwordHash: passwordHash,

        passwordSalt: salt
    };

    // ===============================
    // SAVE USER
    // ===============================

    localStorage.setItem(
        "studyAssistantUser",
        JSON.stringify(newUser)
    );

    // ===============================
    // SUCCESS MESSAGE
    // ===============================

    showToast("Account बन गया! अब Login करें 🎉");

    signupForm.reset();

    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");

});

// ===============================
// LOGIN
// ===============================

loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const email = document
        .getElementById("loginEmail")
        .value
        .trim()
        .toLowerCase();

    const password = document
        .getElementById("loginPass")
        .value;

    // ===============================
    // GET SAVED USER
    // ===============================

    const savedUser = localStorage.getItem(
        "studyAssistantUser"
    );

    if (!savedUser) {

        showToast("पहले Sign Up करके account बनाएं");
        return;
    }

    // ===============================
    // READ USER DATA
    // ===============================

    let user;

    try {

        user = JSON.parse(savedUser);

    } catch (error) {

        showToast("Account data खराब है। फिर से Sign Up करें");
        return;
    }

    // ===============================
    // CHECK EMAIL
    // ===============================

    if (email !== user.email) {

        showToast("Email गलत है");
        return;
    }

    // ===============================
    // CHECK PASSWORD DATA
    // ===============================

    if (!user.passwordHash || !user.passwordSalt) {

        showToast("Security data missing है। फिर से Sign Up करें");
        return;
    }

    // ===============================
    // HASH ENTERED PASSWORD
    // ===============================

    const enteredPasswordHash = await hashPassword(
        password,
        user.passwordSalt
    );

    // ===============================
    // CHECK PASSWORD
    // ===============================

    if (enteredPasswordHash !== user.passwordHash) {

        showToast("Password गलत है");
        return;
    }

    // ===============================
    // LOGIN SUCCESS
    // ===============================

    localStorage.setItem(
        "loggedIn",
        "true"
    );

    // ===============================
    // SAVE LOGIN TIME
    // ===============================

    localStorage.setItem(
        "loginTime",
        Date.now().toString()
    );

    // ===============================
    // WELCOME MESSAGE
    // ===============================

    showToast(
        `Welcome back, ${user.name}! ✅`
    );

    loginForm.reset();

    // ===============================
    // OPEN STUDY PAGE
    // ===============================

    setTimeout(() => {

        window.location.replace(
            "study.html"
        );

    }, 1000);

});
