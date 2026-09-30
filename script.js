const question = document.getElementById("question");
const askBtn = document.getElementById("askBtn");
const answer = document.getElementById("answer");

askBtn.addEventListener("click", async function () {
    const userQuestion = question.value.trim();

    if (userQuestion === "") {
        answer.innerText = "Pehle apna sawal likho!";
        return;
    }

    answer.innerText = "Jawab aa raha hai...";

    try {
        const response = await fetch(
            "https://ai-study-assistant-1pjt.onrender.com/ask",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: userQuestion
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            answer.innerText =
                data.answer || "Backend error aa gaya.";
            return;
        }

        answer.innerText = data.answer;

    } catch (error) {
        console.error(error);
        answer.innerText = "Backend se connection nahi ho paya.";
    }
});
