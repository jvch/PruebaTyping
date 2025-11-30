const typedDiv = document.getElementById("typedText");
const givenDiv = document.getElementById("givenText");

const hiddenTextarea = document.createElement("textarea");
hiddenTextarea.classList.add("hidden-input");
document.body.appendChild(hiddenTextarea);
hiddenTextarea.focus();

document.body.addEventListener("click", () => hiddenTextarea.focus());

let givenText = "";

// Escape HTML for safe display
function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

// Load text from .txt file
fetch("sample.html.txt")
    .then(response => response.text())
    .then(text => {
        givenText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        givenDiv.textContent = givenText;
        adjustFontSize();
    })
    .catch(err => console.error("Error loading text file:", err));

// Adjust font size so all text fits the container
function adjustFontSize() {
    const wrapper = document.querySelector(".text-wrapper");
    let fontSize = 26;
    typedDiv.style.fontSize = fontSize + "px";
    givenDiv.style.fontSize = fontSize + "px";

    while ((typedDiv.scrollHeight > wrapper.clientHeight || givenDiv.scrollHeight > wrapper.clientHeight) && fontSize > 10) {
        fontSize -= 1;
        typedDiv.style.fontSize = fontSize + "px";
        givenDiv.style.fontSize = fontSize + "px";
    }

    while (typedDiv.scrollHeight < wrapper.clientHeight && givenDiv.scrollHeight < wrapper.clientHeight && fontSize < 40) {
        fontSize += 1;
        typedDiv.style.fontSize = fontSize + "px";
        givenDiv.style.fontSize = fontSize + "px";
        if (typedDiv.scrollHeight > wrapper.clientHeight || givenDiv.scrollHeight > wrapper.clientHeight) {
            fontSize -= 1;
            typedDiv.style.fontSize = fontSize + "px";
            givenDiv.style.fontSize = fontSize + "px";
            break;
        }
    }
}

// Download typed text as .txt file
function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Update overlay with typed text
function updateOverlay() {
    const typed = hiddenTextarea.value;
    let displayHTML = "";
    let firstWrongFound = false;

    for (let i = 0; i < typed.length; i++) {
        const char = escapeHTML(typed[i]);
        if (!firstWrongFound && typed[i] !== givenText[i]) firstWrongFound = true;

        if (firstWrongFound) displayHTML += `<span class="wrong">${char}</span>`;
        else displayHTML += char;
    }

    // Add caret if not finished
    if (typed.length < givenText.length) displayHTML += '<span class="caret">&nbsp;</span>';

    typedDiv.innerHTML = displayHTML;
    adjustFontSize();

    // Finished typing
    if (typed === givenText && givenText.length > 0) {
        hiddenTextarea.disabled = true;
        setTimeout(() => {
            downloadText("escrito.txt", typed);
        }, 10);
    }
}

// Update overlay on input
hiddenTextarea.addEventListener("input", updateOverlay);

// Tab key support
hiddenTextarea.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
        e.preventDefault();
        const start = hiddenTextarea.selectionStart;
        const end = hiddenTextarea.selectionEnd;
        const spaces = "    ";
        hiddenTextarea.value =
            hiddenTextarea.value.substring(0, start) +
            spaces +
            hiddenTextarea.value.substring(end);
        hiddenTextarea.selectionStart = hiddenTextarea.selectionEnd = start + spaces.length;
        updateOverlay();
    }
});
