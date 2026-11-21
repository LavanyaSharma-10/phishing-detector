from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re
import os

app = Flask(__name__)
CORS(app)  # allows your HTML file to call this server from a different origin

# Load the saved model and vectorizer
MODEL_PATH = os.path.join("outputs", "phishing_model.pkl")
VECTORIZER_PATH = os.path.join("outputs", "vectorizer.pkl")

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)

# Same cleaning function used during training — must match exactly
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+", " URLTOKEN ", text)
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    email_text = data.get("email_text", "")

    if not email_text.strip():
        return jsonify({"error": "No email text provided"}), 400

    cleaned = clean_text(email_text)
    features = vectorizer.transform([cleaned])

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]  # probability of "spam"

    # Get top contributing words (evidence)
    feature_names = vectorizer.get_feature_names_out()
    coefficients = model.coef_[0]
    present_words = features.nonzero()[1]

    word_scores = [(feature_names[i], coefficients[i]) for i in present_words]
    word_scores.sort(key=lambda x: abs(x[1]), reverse=True)
    top_words = word_scores[:8]

    evidence = [
        {"word": word, "direction": "toward-phishing" if score > 0 else "toward-legit", "weight": round(abs(score), 2)}
        for word, score in top_words
    ]

    return jsonify({
        "prediction": "phishing" if prediction == 1 else "legit",
        "confidence": round(float(probability if prediction == 1 else 1 - probability) * 100, 1),
        "evidence": evidence
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)