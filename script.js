(function () {
"use strict";

/* =====================================
   AI STUDY ASSISTANT
   Existing Render backend is preserved
===================================== */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const STORAGE = {
  history: "questionHistory",
  notes: "studyNotes",
  progress: "studyProgress",
  activity: "studyActivity",
  theme: "studyTheme",
  projects: "studyProjects"
};

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Storage error:", error);
    alert("Storage full ho sakta hai. Kuch purane notes delete karein.");
    return false;
  }
}

/* =====================================
   ACTIVITY TRACKING
===================================== */

function addActivity(message) {
  const activities = readStorage(STORAGE.activity, []);
  activities.unshift({
    message,
    time: new Date().toLocaleString()
  });

  writeStorage(STORAGE.activity, activities.slice(0, 10));
  renderActivity();
}

function renderActivity() {
  const list = $("#activityList");
  if (!list) return;

  const activities = readStorage(STORAGE.activity, []);
  list.replaceChildren();

  if (!activities.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "अभी कोई activity नहीं है। पढ़ाई शुरू करो!";
    list.appendChild(p);
    return;
  }

  activities.forEach(item => {
    const row = document.createElement("div");
    row.className = "activity-item";
    row.textContent = `${item.message} · ${item.time}`;
    list.appendChild(row);
  });
}

/* =====================================
   AI CHAT — EXISTING RENDER BACKEND
===================================== */

const askForm = $("#askForm");
const questionInput = $("#question");
const askBtn = $("#askBtn");
const answerBox = $("#answer");
const askBtnLabel = askBtn ? askBtn.textContent.trim() : "➤";

/* Attached file (sirf text/code files) */
let attachedText = "";
let attachedName = "";

function scrollToChat() {
  $("#ai-chat")?.scrollIntoView({ behavior: "smooth" });
}

if (askForm) {
  askForm.addEventListener("submit", async event => {
    event.preventDefault();
    await askAI();
  });
} else if (askBtn) {
  /* study.html me <form> nahi hai, isliye button + Enter se chalao */
  askBtn.addEventListener("click", () => askAI());

  questionInput?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      askAI();
    }
  });
}

async function askAI() {
  const userQuestion = questionInput.value.trim();

  if (!userQuestion) {
    showAnswer("पहले अपना सवाल लिखो!");
    questionInput.focus();
    return;
  }

  if (askBtn.disabled) return;

  const finalQuestion = attachedText
    ? `${userQuestion}\n\n[File: ${attachedName}]\n${attachedText}`
    : userQuestion;

  saveQuestion(userQuestion);
  addActivity("AI से सवाल पूछा");

  /* sawal bhejte hi input khali (ChatGPT jaisa) */
  questionInput.value = "";
  clearAttachment();

  askBtn.disabled = true;
  askBtn.textContent = "…";
  showAnswer("जवाब आ रहा है...");

  try {
    const response = await fetch(
      "https://ai-study-assistant-1pjt.onrender.com/ask",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: finalQuestion
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.answer) {
      throw new Error("Answer field missing");
    }

    showAnswer(data.answer);

  } catch (error) {
    console.error("AI request failed:", error);
    questionInput.value = userQuestion; /* fail hua to sawal wapas */
    showAnswer(
      "AI से connection नहीं हो पाया। Internet check करके फिर कोशिश करो।"
    );
  } finally {
    askBtn.disabled = false;
    askBtn.textContent = askBtnLabel;
  }
}

function showAnswer(message) {
  answerBox.textContent = message;
  answerBox.hidden = false;
}

/* Suggested questions */

$$(".suggestion").forEach(button => {
  button.addEventListener("click", () => {
    questionInput.value = button.textContent.trim();
    scrollToChat();
    questionInput.focus();
  });
});

/* Question history */

function saveQuestion(text) {
  const history = readStorage(STORAGE.history, []);
  history.push(text);
  writeStorage(STORAGE.history, history.slice(-20));
  renderHistory();
}

function renderHistory() {
  const list = $("#historyList");
  if (!list) return;

  list.replaceChildren();

  const isList = list.tagName === "UL" || list.tagName === "OL";
  const history = readStorage(STORAGE.history, []);

  if (!history.length && isList) {
    const empty = document.createElement("li");
    empty.textContent = "Koi history nahi";
    empty.style.cursor = "default";
    empty.style.color = "#999";
    list.appendChild(empty);
    return;
  }

  history.slice().reverse().forEach(text => {
    const item = document.createElement(isList ? "li" : "button");

    if (!isList) {
      item.className = "history-question";
      item.type = "button";
    }

    item.textContent = isList ? text : "• " + text;
    item.title = text;

    item.addEventListener("click", () => {
      questionInput.value = text;
      questionInput.focus();
      closeSidebar();
      scrollToChat();
    });

    list.appendChild(item);
  });
}

$("#clearHistory")?.addEventListener("click", () => {
  if (!confirm("सभी recent questions हटाएँ?")) return;

  localStorage.removeItem(STORAGE.history);
  renderHistory();
});

renderHistory();

/* =====================================
   SIDEBAR + PROJECTS (ChatGPT style)
===================================== */

function openSidebar() {
  $("#sidebar")?.classList.add("open");
  $("#sidebarOverlay")?.classList.add("show");
}

function closeSidebar() {
  $("#sidebar")?.classList.remove("open");
  $("#sidebarOverlay")?.classList.remove("show");
}

$("#menuBtn")?.addEventListener("click", openSidebar);
$("#closeSidebar")?.addEventListener("click", closeSidebar);
$("#sidebarOverlay")?.addEventListener("click", closeSidebar);

$("#newChatBtn")?.addEventListener("click", () => {
  questionInput.value = "";
  answerBox.textContent = "";
  clearAttachment();
  closeSidebar();
  questionInput.focus();
});

function renderProjects() {
  const list = $("#projectList");
  if (!list) return;

  list.replaceChildren();

  const projects = readStorage(STORAGE.projects, []);

  if (!projects.length) {
    const empty = document.createElement("li");
    empty.textContent = "Koi project nahi";
    empty.style.cursor = "default";
    empty.style.color = "#999";
    list.appendChild(empty);
    return;
  }

  projects.forEach((name, index) => {
    const li = document.createElement("li");
    li.textContent = "📁 " + name;
    li.title = "Delete karne ke liye tap karo";

    li.addEventListener("click", () => {
      if (!confirm(`Project "${name}" हटाएँ?`)) return;

      const updated = readStorage(STORAGE.projects, []);
      updated.splice(index, 1);
      writeStorage(STORAGE.projects, updated);
      renderProjects();
    });

    list.appendChild(li);
  });
}

$("#newProjectBtn")?.addEventListener("click", () => {
  const name = prompt("Project ka naam likho:");
  if (!name || !name.trim()) return;

  const projects = readStorage(STORAGE.projects, []);
  projects.push(name.trim());
  writeStorage(STORAGE.projects, projects);
  renderProjects();
});

renderProjects();

/* =====================================
   VOICE INPUT (mic)
===================================== */

(function setupVoice() {
  const micBtn = $("#micBtn");
  if (!micBtn) return;

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    micBtn.style.display = "none";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "hi-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  let isRecording = false;

  function stopUI() {
    isRecording = false;
    micBtn.classList.remove("recording");
  }

  micBtn.addEventListener("click", () => {
    if (isRecording) {
      recognition.stop();
      return;
    }

    try {
      recognition.start();
      isRecording = true;
      micBtn.classList.add("recording");
    } catch (error) {
      console.error("Voice error:", error);
      stopUI();
    }
  });

  recognition.addEventListener("result", event => {
    questionInput.value = event.results[0][0].transcript;
    questionInput.focus();
  });

  recognition.addEventListener("end", stopUI);
  recognition.addEventListener("error", () => {
    stopUI();
    alert("Mic kaam nahi kar raha. https/localhost par kholo aur mic permission allow karo.");
  });
})();

/* =====================================
   FILE ATTACH (+)  — text / code files
===================================== */

const fileInput = $("#fileInput");
const fileNameDisplay = $("#fileNameDisplay");

function setFileNote(text) {
  if (fileNameDisplay) fileNameDisplay.textContent = text;
}

function clearAttachment() {
  attachedText = "";
  attachedName = "";
  if (fileInput) fileInput.value = "";
  setFileNote("");
}

$("#attachBtn")?.addEventListener("click", () => fileInput?.click());

fileInput?.addEventListener("change", () => {
  const file = fileInput.files?.[0];

  if (!file) {
    clearAttachment();
    return;
  }

  const isText =
    file.type.startsWith("text/") ||
    /\.(txt|md|csv|json|js|py|c|cpp|java|html|css|sql)$/i.test(file.name);

  if (!isText) {
    clearAttachment();
    setFileNote("⚠️ Abhi sirf text/code files (.txt, .py, .c, .md...) chalti hain.");
    return;
  }

  if (file.size > 100 * 1024) {
    clearAttachment();
    setFileNote("⚠️ File 100KB se choti honi chahiye.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    attachedText = String(reader.result).slice(0, 6000);
    attachedName = file.name;
    setFileNote("📎 " + file.name);
  };

  reader.onerror = () => {
    clearAttachment();
    setFileNote("⚠️ File padh nahi paayi.");
  };

  reader.readAsText(file);
});

/* =====================================
   SUBJECTS & TOPICS
===================================== */

const subjectTopics = {
  "C Programming": [
    "Variables and Data Types",
    "Operators",
    "If-Else and Loops",
    "Arrays and Strings",
    "Functions",
    "Pointers",
    "Structures"
  ],
  "Python": [
    "Python Basics",
    "Variables and Data Types",
    "Conditions and Loops",
    "Lists and Dictionaries",
    "Functions",
    "Object-Oriented Programming"
  ],
  "DBMS": [
    "Database Fundamentals",
    "Tables and Keys",
    "SQL Queries",
    "Normalization",
    "ER Diagrams",
    "Transactions"
  ],
  "Data Structures": [
    "Arrays",
    "Linked Lists",
    "Stacks",
    "Queues",
    "Trees",
    "Searching and Sorting"
  ],
  "Web Development": [
    "HTML Basics",
    "CSS Basics",
    "JavaScript Basics",
    "DOM Manipulation",
    "Responsive Design",
    "Forms"
  ],
  "Computer Fundamentals": [
    "Computer Hardware",
    "Software",
    "Operating Systems",
    "Input and Output Devices",
    "Computer Networks",
    "Number Systems"
  ]
};

$$(".subject-card").forEach(button => {
  button.addEventListener("click", () => {
    const subject = button.dataset.subject;
    const topics = subjectTopics[subject] || [];
    const detail = $("#subjectDetail");

    detail.replaceChildren();
    detail.hidden = false;

    const heading = document.createElement("h3");
    heading.textContent = subject;
    detail.appendChild(heading);

    const description = document.createElement("p");
    description.textContent =
      "नीचे topic चुनकर AI से उसकी explanation माँग सकते हो।";
    detail.appendChild(description);

    const topicContainer = document.createElement("div");
    topicContainer.className = "subject-grid";

    topics.forEach(topic => {
      const topicButton = document.createElement("button");
      topicButton.className = "subject-card";
      topicButton.textContent = "📘 " + topic;

      topicButton.addEventListener("click", () => {
        questionInput.value =
          `मुझे ${subject} में "${topic}" step-by-step आसान हिंदी में समझाओ। उदाहरण और practice questions भी दो।`;

        scrollToChat();
        questionInput.focus();
      });

      topicContainer.appendChild(topicButton);
    });

    detail.appendChild(topicContainer);
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});

/* =====================================
   NOTES — SAVE / EDIT / DELETE / EXPORT
===================================== */

let editingNoteId = null;

function getNotes() {
  return readStorage(STORAGE.notes, []);
}

function saveNote() {
  const title = $("#noteTitle").value.trim();
  const content = $("#noteContent").value.trim();

  if (!title || !content) {
    alert("Note title aur content dono likho.");
    return;
  }

  const notes = getNotes();
  const now = new Date().toISOString();

  if (editingNoteId !== null) {
    const index = notes.findIndex(
      note => note.id === editingNoteId
    );

    if (index !== -1) {
      notes[index] = {
        ...notes[index],
        title,
        content,
        updatedAt: now
      };
    }
  } else {
    notes.unshift({
      id: Date.now(),
      title,
      content,
      updatedAt: now
    });
  }

  if (!writeStorage(STORAGE.notes, notes)) return;

  editingNoteId = null;
  $("#noteTitle").value = "";
  $("#noteContent").value = "";
  $("#saveNote").textContent = "Save Note";

  renderNotes();
  addActivity("Study note save किया");
}

$("#saveNote")?.addEventListener("click", saveNote);

function renderNotes() {
  const container = $("#notesList");
  if (!container) return;

  container.replaceChildren();

  const notes = getNotes();

  if (!notes.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "अभी कोई saved note नहीं है।";
    container.appendChild(p);
    return;
  }

  notes.forEach(note => {
    const card = document.createElement("article");
    card.className = "saved-note";

    const title = document.createElement("h4");
    title.textContent = note.title;

    const content = document.createElement("p");
    content.textContent = note.content;

    const actions = document.createElement("div");
    actions.className = "note-actions";

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      editingNoteId = note.id;
      $("#noteTitle").value = note.title;
      $("#noteContent").value = note.content;
      $("#saveNote").textContent = "Update Note";
      $("#notes").scrollIntoView({ behavior: "smooth" });
      $("#noteTitle").focus();
    });

    const txtButton = document.createElement("button");
    txtButton.textContent = "Download TXT";
    txtButton.addEventListener("click", () => {
      downloadFile(
        `${note.title}.txt`,
        `${note.title}\n\n${note.content}`,
        "text/plain;charset=utf-8"
      );
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      if (!confirm(`"${note.title}" हटाएँ?`)) return;

      writeStorage(
        STORAGE.notes,
        getNotes().filter(item => item.id !== note.id)
      );

      renderNotes();
    });

    actions.append(editButton, txtButton, deleteButton);
    card.append(title, content, actions);
    container.appendChild(card);
  });
}

function downloadFile(filename, content, type) {
  const blob = new Blob(["\uFEFF", content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename.replace(/[\\/:*?"<>|]/g, "_");
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCurrentNote() {
  const title = $("#noteTitle").value.trim();
  const content = $("#noteContent").value.trim();

  if (!title || !content) {
    alert("Export करने से पहले title और content लिखो।");
    return null;
  }

  return { title, content };
}

$("#exportTxt")?.addEventListener("click", () => {
  const note = exportCurrentNote();
  if (!note) return;

  downloadFile(
    `${note.title}.txt`,
    `${note.title}\n\n${note.content}`,
    "text/plain;charset=utf-8"
  );
});

$("#exportPdf")?.addEventListener("click", () => {
  const note = exportCurrentNote();
  if (!note) return;

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Print window block ho gayi. Browser mein pop-ups allow karein.");
    return;
  }

  const safeTitle = escapeHTML(note.title);
  const safeContent = escapeHTML(note.content);

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="hi">
    <head>
      <meta charset="UTF-8">
      <title>${safeTitle}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 35px;
          color: #17233b;
          line-height: 1.8;
        }
        h1 {
          border-bottom: 2px solid #2463cf;
          padding-bottom: 12px;
        }
        pre {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          font: inherit;
        }
      </style>
    </head>
    <body>
      <h1>${safeTitle}</h1>
      <pre>${safeContent}</pre>
      <script>
        window.onload = () => window.print();
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
});

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

renderNotes();

/* =====================================
   QUIZ & PRACTICE
===================================== */

const quizQuestions = [
  {
    subject: "C Programming",
    q: "C language में function का उपयोग क्यों होता है?",
    options: [
      "Code को reusable बनाने के लिए",
      "Monitor चलाने के लिए",
      "Internet बंद करने के लिए",
      "केवल text लिखने के लिए"
    ],
    answer: 0,
    explanation: "Functions code को छोटे reusable blocks में बाँटते हैं।"
  },
  {
    subject: "C Programming",
    q: "C में integer variable के लिए कौन-सा type है?",
    options: ["float", "int", "char[]", "image"],
    answer: 1,
    explanation: "int सामान्यतः integer values रखने के लिए उपयोग होता है।"
  },
  {
    subject: "C Programming",
    q: "C में array index सामान्यतः किससे शुरू होता है?",
    options: ["1", "-1", "0", "10"],
    answer: 2,
    explanation: "C में array का पहला element index 0 पर होता है।"
  },
  {
    subject: "Python",
    q: "Python में output दिखाने के लिए कौन-सा function है?",
    options: ["echo()", "print()", "showText()", "writeScreen()"],
    answer: 1,
    explanation: "print() values को output में दिखाता है।"
  },
  {
    subject: "Python",
    q: "Python list की सही पहचान क्या है?",
    options: [
      "केवल integer रख सकती है",
      "Ordered collection है",
      "हमेशा खाली होती है",
      "Function ही होती है"
    ],
    answer: 1,
    explanation: "List एक ordered, mutable collection है।"
  },
  {
    subject: "Python",
    q: "Python में function define करने के लिए क्या लिखते हैं?",
    options: ["function", "define", "def", "fun"],
    answer: 2,
    explanation: "Python में def keyword से function define होता है।"
  },
  {
    subject: "DBMS",
    q: "DBMS का पूरा नाम क्या है?",
    options: [
      "Data Backup Main System",
       "Database Management System",
      "Digital Base Machine Setup",
      "Data Binary Memory Service"
    ],
    answer: 1,
    explanation: "DBMS का अर्थ Database Management System है।"
  },
  {
    subject: "DBMS",
    q: "Primary key का मुख्य उद्देश्य क्या है?",
    options: [
      "हर record को uniquely identify करना",
      "Table का रंग बदलना",
      "Database बंद करना",
      "केवल images रखना"
    ],
    answer: 0,
    explanation: "Primary key प्रत्येक record की unique पहचान करती है।"
  },
  {
    subject: "Web Development",
    q: "HTML का पूरा नाम क्या है?",
    options: [
      "HyperText Markup Language",
      "High Transfer Machine Language",
      "Hyper Tool Multi Link",
      "Home Text Main Language"
    ],
    answer: 0,
    explanation: "HTML web pages की structure बनाने के लिए उपयोग होती है।"
  },
  {
    subject: "Web Development",
    q: "CSS का मुख्य उपयोग क्या है?",
    options: [
      "Database store करना",
      "Web page को style करना",
      "Server बनाना",
      "Password encrypt करना"
    ],
    answer: 1,
    explanation: "CSS web page का layout, colors और appearance तय करती है।"
  },
  {
    subject: "Web Development",
    q: "JavaScript का एक सामान्य उपयोग क्या है?",
    options: [
      "Web page में interactivity जोड़ना",
      "केवल image compress करना",
      "Keyboard बनाना",
      "Operating system install करना"
    ],
    answer: 0,
    explanation: "JavaScript से web pages interactive बनते हैं।"
  }
];

let activeQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;
let quizCorrectCount = 0;

$("#startQuiz")?.addEventListener("click", startQuiz);

function startQuiz() {
  const subject = $("#quizSubject").value;

  activeQuestions = quizQuestions.filter(item =>
    subject === "all" || item.subject === subject
  );

  if (!activeQuestions.length) {
    $("#quizArea").textContent = "इस subject के लिए questions उपलब्ध नहीं हैं।";
    return;
  }

  activeQuestions = activeQuestions
    .map(item => ({ ...item }))
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(5, activeQuestions.length));

  quizIndex = 0;
  quizScore = 0;
  quizCorrectCount = 0;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const area = $("#quizArea");
  area.replaceChildren();

  quizAnswered = false;
  const item = activeQuestions[quizIndex];

  const meta = document.createElement("p");
  meta.className = "quiz-meta";
  meta.textContent =
    `Question ${quizIndex + 1} of ${activeQuestions.length} · ${item.subject}`;

  const heading = document.createElement("h3");
  heading.className = "quiz-question";
  heading.textContent = item.q;

  const options = document.createElement("div");
  options.className = "quiz-options";

  const feedback = document.createElement("p");
  feedback.className = "quiz-feedback";
  feedback.setAttribute("aria-live", "polite");

  item.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.textContent =
      `${String.fromCharCode(65 + index)}. ${option}`;

    button.addEventListener("click", () => {
      if (quizAnswered) return;
      quizAnswered = true;

      const isCorrect = index === item.answer;

      if (isCorrect) {
        quizScore++;
        quizCorrectCount++;
        button.classList.add("correct");
        feedback.className = "quiz-feedback success";
        feedback.textContent = "✓ सही जवाब! " + item.explanation;
      } else {
        button.classList.add("wrong");
        feedback.className = "quiz-feedback error";
        feedback.textContent =
          `सही जवाब: ${item.options[item.answer]}. ${item.explanation}`;
      }

      [...options.children].forEach((optionButton, i) => {
        optionButton.disabled = true;

        if (i === item.answer) {
          optionButton.classList.add("correct");
        }
      });

      const next = document.createElement("button");
      next.className = "primary-button";
      next.style.marginTop = "14px";
      next.textContent =
        quizIndex + 1 < activeQuestions.length
          ? "Next Question →"
          : "See Result";

      next.addEventListener("click", () => {
        quizIndex++;

        if (quizIndex < activeQuestions.length) {
          renderQuizQuestion();
        } else {
          finishQuiz();
        }
      });

      area.appendChild(next);
    });

    options.appendChild(button);
  });

  area.append(meta, heading, options, feedback);
}

function finishQuiz() {
  const area = $("#quizArea");
  const total = activeQuestions.length;
  const percent = Math.round((quizScore / total) * 100);

  const progress = readStorage(STORAGE.progress, {
    quizzes: 0,
    questions: 0,
    correct: 0
  });

  progress.quizzes += 1;
  progress.questions += total;
  progress.correct += quizCorrectCount;

  writeStorage(STORAGE.progress, progress);
  addActivity(`Quiz completed: ${quizScore}/${total}`);

  area.replaceChildren();

  const result = document.createElement("div");
  result.className = "quiz-result";

  const title = document.createElement("h3");
  title.textContent = "Quiz Complete! 🎉";

  const score = document.createElement("p");
  score.textContent = `तुम्हारा score: ${quizScore}/${total} (${percent}%)`;

  const message = document.createElement("p");
  message.textContent =
    percent >= 80
      ? "बहुत अच्छा! ऐसे ही practice करते रहो।"
      : "अच्छी कोशिश! Topics revise करके फिर कोशिश करो।";

  const restart = document.createElement("button");
  restart.className = "primary-button";
  restart.textContent = "Try Again";
  restart.addEventListener("click", startQuiz);

  result.append(title, score, message, restart);
  area.appendChild(result);

  if (typeof renderProgress === "function") renderProgress();
}

console.log("script.js loaded ✅");

})();

      
