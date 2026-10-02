import { auth } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

function showToast(message) {
  const toast = document.getElementById("toast");

  if (toast) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  } else {
    alert(message);
  }
}

function getErrorMessage(error) {
  const code = error.code || "";

  const messages = {
    "auth/invalid-email": "Email सही नहीं है।",
    "auth/invalid-credential": "Email या Password गलत है।",
    "auth/user-not-found": "इस Email से अकाउंट नहीं मिला।",
    "auth/wrong-password": "Password गलत है।",
    "auth/email-already-in-use": "यह Email पहले से registered है।",
    "auth/weak-password": "Password कम से कम 6 अक्षर का रखें।",
    "auth/too-many-requests": "बहुत बार कोशिश हुई है। थोड़ी देर बाद प्रयास करें।",
    "auth/network-request-failed": "Internet connection जाँचें।",
    "auth/operation-not-allowed": "Firebase में Email/Password Login चालू करें।"
  };

  return messages[code] || "अभी Login नहीं हो सका। कृपया दोबारा प्रयास करें।";
}

document.getElementById("toSignup").addEventListener("click", () => {
  loginForm.classList.add("hidden");
  signupForm.classList.remove("hidden");
});

document.getElementById("toLogin").addEventListener("click", () => {
  signupForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
});

// SIGN UP
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPass").value;
  const button = document.getElementById("signupBtn");

  if (!name || !email || !password) {
    showToast("सभी जानकारी भरें।");
    return;
  }

  if (password.length < 6) {
    showToast("Password कम से कम 6 अक्षर का रखें।");
    return;
  }

  button.disabled = true;

  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(result.user, {
      displayName: name
    });

    showToast("Account बन गया! अब आप Login कर सकते हैं।");

    // Signup के बाद Firebase user अपने आप sign in होता है।
    // अभी Study Page की सुरक्षा अपडेट करना बाकी है।
    await auth.signOut();

    signupForm.reset();
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
  } catch (error) {
    showToast(getErrorMessage(error));
  } finally {
    button.disabled = false;
  }
});

// LOGIN
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPass").value;
  const button = document.getElementById("loginBtn");

  if (!email || !password) {
    showToast("Email और Password दोनों भरें।");
    return;
  }

  button.disabled = true;

  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Firebase ने Login सत्यापित कर दिया।
    // अगले स्टेप में study.html को भी Firebase से सुरक्षित करेंगे।
    showToast(`Welcome back, ${result.user.displayName || "Student"}!`);

    window.location.replace("study.html");
  } catch (error) {
    showToast(getErrorMessage(error));
  } finally {
    button.disabled = false;
  }
});
