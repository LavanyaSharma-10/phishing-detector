const checkButton = document.getElementById("check-button");
const clearButton = document.getElementById("clear-button");
const emailInput = document.getElementById("email-input");
const loadingText = document.getElementById("loading-text");
const errorBox = document.getElementById("error-box");
const verdictSection = document.getElementById("verdict-section");
const verdictStamp = document.getElementById("verdict-stamp");
const confidenceValue = document.getElementById("confidence-value");
const gaugeFill = document.getElementById("gauge-fill");
const evidenceList = document.getElementById("evidence-list");

checkButton.addEventListener("click", async () => {
  const emailText = emailInput.value.trim();

  errorBox.classList.add("hidden");
  verdictSection.classList.add("hidden");

  if (!emailText) {
    errorBox.textContent = "Please paste an email to investigate.";
    errorBox.classList.remove("hidden");
    return;
  }

  loadingText.classList.remove("hidden");
  checkButton.disabled = true;

  try {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_text: emailText })
    });

    if (!response.ok) throw new Error("Server error");

    const data = await response.json();
    showVerdict(data);
  } catch (err) {
    errorBox.textContent = "Something went wrong reaching the server. Is app.py running?";
    errorBox.classList.remove("hidden");
  } finally {
    loadingText.classList.add("hidden");
    checkButton.disabled = false;
  }
});

clearButton.addEventListener("click", () => {
  emailInput.value = "";
  verdictSection.classList.add("hidden");
  errorBox.classList.add("hidden");
});

function showVerdict(data) {
  verdictStamp.textContent = data.prediction === "phishing" ? "PHISHING" : "LEGITIMATE";
  verdictStamp.className = "stamp" + (data.prediction === "legit" ? " legit" : "");

  confidenceValue.textContent = `${data.confidence}%`;
  gaugeFill.style.width = `${data.confidence}%`;

  evidenceList.innerHTML = "";
  if (data.evidence.length === 0) {
    evidenceList.innerHTML = '<p class="no-evidence">No strong signal words found.</p>';
  } else {
    data.evidence.forEach(item => {
      const chip = document.createElement("div");
      chip.className = `evidence-chip ${item.direction}`;
      chip.innerHTML = `<span class="word">${item.word}</span><span class="weight">${item.weight}</span>`;
      evidenceList.appendChild(chip);
    });
  }

  verdictSection.classList.remove("hidden");
}