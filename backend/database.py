import sqlite3

DB_NAME = "chat_history.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    role TEXT NOT NULL,
                    message TEXT NOT NULL
                )''')
    conn.commit()
    conn.close()

def save_message(role, message):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("INSERT INTO messages (role, message) VALUES (?, ?)", (role, message))
    conn.commit()
    conn.close()

def get_all_messages():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT role, message FROM messages")
    messages = c.fetchall()
    conn.close()
    return messages

def clear_history():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("DELETE FROM messages")
    conn.commit()
    conn.close()

init_db()
