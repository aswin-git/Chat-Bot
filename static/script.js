
document.addEventListener("DOMContentLoaded", () => {
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-btn");
    const chatBox = document.getElementById("chat-box");
    const typingIndicator = document.getElementById("typing-indicator");



    function appendMessage(text, sender) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");

        if (sender === "bot") {
            messageDiv.innerHTML = marked.parse(text);
        } else {
            messageDiv.textContent = text;
        }

        chatBox.insertBefore(messageDiv, typingIndicator);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function showTyping() {
        typingIndicator.style.display = "block";
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function hideTyping() {
        typingIndicator.style.display = "none";
    }

    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        appendMessage(message, "user");
        messageInput.value = "";

        showTyping();

        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            hideTyping();
            appendMessage(data.reply, "bot");

        } catch (error) {
            hideTyping();
            appendMessage("Error: Could not connect to the server.", "bot");
            console.error(error);
        }
    }

    sendButton.addEventListener("click", sendMessage);

    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
});
