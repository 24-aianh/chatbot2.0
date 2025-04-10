import numpy as np
from sentence_transformers import SentenceTransformer
import json

model = SentenceTransformer("all-MiniLM-L6-v2")

def load_data():
    """Tải dữ liệu đặc thù"""
    with open("data/faq.json", "r", encoding="utf-8") as f:
        return json.load(f)

data = load_data()
questions = [item["question"] for item in data]
question_vectors = model.encode(questions)

def get_similar_response(query, threshold=0.75):
    """Tìm câu trả lời gần nhất bằng Embedding Vector"""
    query_vector = model.encode([query])[0]
    scores = np.dot(question_vectors, query_vector) / (np.linalg.norm(question_vectors, axis=1) * np.linalg.norm(query_vector))
    best_match_index = np.argmax(scores)
    if scores[best_match_index] >= threshold:
        return data[best_match_index]["answer"]
    return None 


