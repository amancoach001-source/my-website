
import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    logoutBtn.disabled = true;

    try {
      await signOut(auth);

      localStorage.removeItem("loggedIn");
      localStorage.removeItem("loginTime");

      window.location.replace("index.html");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout नहीं हो सका। कृपया दोबारा प्रयास करें।");
      logoutBtn.disabled = false;
    }
  });
}
