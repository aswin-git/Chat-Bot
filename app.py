from flask import Flask, render_template, request, jsonify
import requests


from huggingface_hub import InferenceClient

app = Flask(__name__)


hf_token = os.getenv("HF_TOKEN")

client = InferenceClient(
    "Qwen/Qwen2.5-1.5B-Instruct",
    token=hf_token
)


CONVERSATION_HISTORY = []

def query_model(prompt):
    global CONVERSATION_HISTORY
    
    # Add user message to history
    CONVERSATION_HISTORY.append({"role": "user", "content": prompt})

    try:
        response = client.chat_completion(
            messages=CONVERSATION_HISTORY,
            max_tokens=512
        )
        
        bot_reply = response.choices[0].message.content
        
        # Add bot message to history
        CONVERSATION_HISTORY.append({"role": "assistant", "content": bot_reply})
        
        return bot_reply
    except Exception as e:
        return {"error": str(e)}


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json["message"]
    
    result = query_model(user_message)



    print("RAW RESPONSE:", result)

    if isinstance(result, dict) and "error" in result:
        reply = "Error: " + result["error"]
    else:
        reply = result


    return jsonify({"reply": reply})

@app.route("/reset", methods=["POST"])
def reset():
    global CONVERSATION_HISTORY
    CONVERSATION_HISTORY = []
    return jsonify({"status": "reset"})


if __name__ == "__main__":
    app.run(debug=True)
