# Phishing Email Detector

A machine learning web app that classifies email text as **phishing/spam or legitimate**, and explains each decision by showing the words that influenced it most.

![App screenshot](docs/screenshot.png)
<!-- TODO: take a screenshot of the frontend making a prediction, save it as docs/screenshot.png -->

## Highlights

- **~98.5% accuracy** on a held-out test set of 16,690 emails
- **Explainable predictions**: every result includes the top contributing words, not just a label
- **End-to-end project**: data cleaning, EDA, model training, REST API and a browser frontend

## How it works

```
Frontend (HTML/JS)  ->  Flask API  /predict  ->  text cleaning  ->  vectorizer  ->  classifier
                                                                                        |
                          label + probability + top contributing words  <---------------+
```

1. The user pastes an email into the web page.
2. The frontend sends it to the Flask `/predict` endpoint.
3. The text is cleaned (lowercased, URLs replaced with a `URLTOKEN` marker, non-letters removed).
4. The saved vectorizer converts it to features and the trained model predicts the class.
5. The API returns the prediction, its probability, and the words that pushed the score the most.

## Results

Evaluated on a held-out test set of 16,690 emails (phishing = positive class):

| Metric | Score |
|--------|-------|
| Accuracy | 98.5% |
| Precision | 98.3% |
| Recall | 98.8% |
| F1 score | 98.6% |

Confusion matrix:

|  | Predicted legitimate | Predicted phishing |
|--|--|--|
| **Actual legitimate** | 7,762 | 146 |
| **Actual phishing** | 104 | 8,678 |

Only 104 phishing emails were missed, and 146 legitimate emails were wrongly flagged.

## Dataset

TODO: name the dataset(s), link to the source, and say how many emails and what the class balance is.

The raw data is **not included** in this repo because of its size. Download it from the source above and save it as `data/combined_data.csv`.

## Model

- **Preprocessing:** lowercasing, URL normalization, stripping non-alphabetic characters
- **Features:** TODO (e.g. TF-IDF on unigrams/bigrams)
- **Classifier:** TODO (e.g. Logistic Regression)
- **Explainability:** the model's learned word weights are used to surface the top contributing words for each prediction

The trained model and vectorizer are saved in `outputs/` so the app runs without retraining.

## Getting started

**Requirements:** Python 3.12 and [uv](https://docs.astral.sh/uv/)

```bash
git clone https://github.com/LavanyaSharma-10/phishing-detector.git
cd phishing-detector
uv sync
```

**Run the app** (from the project root, since the app loads the model from `outputs/`):

```bash
uv run python src/phishing_detector/backend/app.py
```

Then open `src/phishing_detector/frontend/index.html` in your browser and paste an email.

**Call the API directly:**

```bash
curl -X POST http://127.0.0.1:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"email_text": "Urgent: verify your account now at http://example.com"}'
```

**Retrain the model:** place the dataset at `data/combined_data.csv`, open `notebooks/model_training.ipynb` and run all cells. This regenerates the model, vectorizer, train/test splits and the EDA report in `outputs/`.

## Project structure

```
phishing-detector/
├── data/                       # raw dataset goes here (not tracked)
├── notebooks/
│   └── model_training.ipynb    # cleaning, EDA, training, evaluation
├── outputs/
│   ├── phishing_model.pkl      # trained classifier
│   ├── vectorizer.pkl          # fitted text vectorizer
│   └── eda_report.html         # Sweetviz EDA report (download to view)
├── src/phishing_detector/
│   ├── backend/app.py          # Flask API
│   └── frontend/               # HTML, CSS, JS interface
├── pyproject.toml
└── uv.lock
```

## Limitations and future work

- The model only sees the email **text**. It ignores headers, sender reputation, attachments and link destinations, all of which real filters use.
- It is trained on a single dataset, so accuracy on emails from a different source or era may be lower.
- Planned improvements: try transformer-based models, add URL/header features, and deploy the app online.

## Built with

Python, scikit-learn, pandas, Flask, Sweetviz, uv