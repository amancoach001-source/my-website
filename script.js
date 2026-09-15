
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
        const response = await fetch("http://127.0.0.1:5000/ask", {
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
        answer.innerText = "Backend se connection nahi ho paya.";
    }
});





