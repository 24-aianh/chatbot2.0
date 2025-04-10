from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util
import os
import requests
import json
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction

app = Flask(__name__)
CORS(app)

model = SentenceTransformer("all-mpnet-base-v2")


with open("data/test1.json", "r", encoding="utf-8") as f:
    EMBEDDING_DATA = json.load(f)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def search_embedding(user_input):
    """Tìm câu trả lời dựa trên dữ liệu embedding"""
    user_embedding = model.encode([user_input], convert_to_tensor=True)  
    best_match = None
    highest_score = 0.9  
    best_question = None  

    for entry in EMBEDDING_DATA:
        question_embedding = model.encode([entry["question"]], convert_to_tensor=True)  
        score = util.pytorch_cos_sim(user_embedding, question_embedding).item()

        if score > highest_score:
            highest_score = score
            best_match = entry["answer"]
            best_question = entry["question"]

    return best_match, best_question, highest_score  

def call_gemini_api(prompt):
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    data = {"contents": [{"parts": [{"text": prompt}]}]}

    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        response_data = response.json()
        return response_data["candidates"][0]["content"]["parts"][0]["text"]

    return "Xin lỗi, tôi không thể trả lời câu hỏi này."

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_input = data.get("question", "").strip()

    if not user_input:
        return jsonify({"answer": "Bạn chưa nhập câu hỏi!"})

    # Tìm câu trả lời trong dữ liệu embedding
    best_response, best_question, similarity_score = search_embedding(user_input)

    if best_response is None:
        best_response = call_gemini_api(user_input)
        best_question = user_input  
        similarity_score = 0  

    # Tính điểm BLEU
    reference = [best_question.split()]
    candidate = best_response.split()
    smooth = SmoothingFunction().method1  # Giúp BLEU tránh bị 0
    bleu_score = sentence_bleu(reference, candidate, smoothing_function=smooth)

    # Debug: Hiển thị thông tin đánh giá trên terminal
    print("\n===== ĐÁNH GIÁ PHẢN HỒI =====")
    print(f"Người dùng: {user_input}")
    print(f"Câu hỏi gần nhất: {best_question}")
    print(f"Chatbot: {best_response}")
    print(f"BLEU Score: {bleu_score:.4f}")
    print(f"Cosine Similarity: {similarity_score:.4f}")
    print("=============================\n")

    return jsonify({
        "answer": best_response,
        "BLEU": round(bleu_score, 4),
        "Cosine Similarity": round(similarity_score, 4) if similarity_score else 0
    })

if __name__ == "__main__":
    app.run(debug=True)
