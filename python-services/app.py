from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime

app = Flask(__name__)
CORS(app)
# well we can create blueprints here to handle different routes like router in the fastapi but now its just a prototype so thats why im doing it in this way 
# and yeah i dont have much more time so im trying to cover it only in 90 to 120 mints 
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_id = data.get("user_id")
    message = data.get("message")

    if "book" in message.lower():
        reply = "Sure! Please provide the patient name."
    elif "name" in message.lower():
        reply = "Got it. What date and time would you prefer for the appointment?"
    elif any(x in message.lower() for x in ["am", "pm", "tomorrow", "monday", "tuesday"]):
        reply = "Appointment confirmed! Thank you. (Simulated booking)"
    else:
        reply = "I'm here to help you schedule dental appointments. Try saying 'Book an appointment'."

    return jsonify({"reply": reply})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
