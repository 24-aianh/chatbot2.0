import matplotlib.pyplot as plt


questions = ["Câu hỏi 1", "Câu hỏi 2", "Câu hỏi 3", "Câu hỏi 4", "Câu hỏi 5"]
bleu_scores = [0.0160, 0.2150, 0.7300, 0.3400, 0.0100]
cosine_similarities = [0.0000, 0.9815, 0.9700, 0.9500, 0.0000]

plt.figure(figsize=(10, 5))
plt.plot(questions, bleu_scores, marker="o", linestyle="-", color="red", label="BLEU Score")
plt.plot(questions, cosine_similarities, marker="s", linestyle="--", color="blue", label="Cosine Similarity")
plt.xlabel("Câu hỏi")
plt.ylabel("Điểm số")
plt.title("So sánh BLEU Score và Cosine Similarity")
plt.legend()
plt.show()
