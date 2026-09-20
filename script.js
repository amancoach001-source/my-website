
const question = document.getElementById("question");
const askBtn = document.getElementById("askBtn");
const answer = document.getElementById("answer");

askBtn.addEventListener("click", async function() {
    const userQuestion = question.value.trim();

    if (userQuestion === "") {
        answer.innerText = "Pehle apna sawal likho!";
        return;
    }

    answer.innerText = "Jawab aa raha hai...";

    try {
        const response = await fetch("https://ai-study-assistant-1pit.onrender.com/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: userQuestion
            })
        });

        const data = await response.json();

        answer.innerText = data.answer;

    } catch (error) {
    answer.innerText = "Error: " + error.message;
    }
});





