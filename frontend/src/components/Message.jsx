import React from "react";

function Message({ sender, text }) {
    const isUser = sender === "user";

    return (
        <div style={{ 
            display: "flex", 
            justifyContent: isUser ? "flex-end" : "flex-start", 
            marginBottom: "10px" 
        }}>
            <div style={{ 
                padding: "10px", 
                borderRadius: "10px", 
                maxWidth: "60%", 
                color: "#fff",
                backgroundColor: isUser ? "#007bff" : "#ff69b4" 
            }}>
                {text}
            </div>
        </div>
    );
}

export default Message;
