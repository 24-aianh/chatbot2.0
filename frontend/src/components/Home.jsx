import React, { useState, useEffect } from "react";
import "./Chatbot.css";
import { Button } from "@/components/ui/button"
import Empty from "@/components/ui/empty"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

const SenderAvatar = ({sender}) => {
    return (
        <Avatar className="mt-1">
            <AvatarImage src={`${sender != "user" ? "/src/assets/image/logo-bot.jpg" : "https://github.com/shadcn.png"}`} alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
    );
}

const Home = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [expandedIndex, setExpandedIndex] = useState(null);

    useEffect(() => {
        const storedHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
        setHistory(storedHistory);
        storedHistory?.[0]?.messages?.length > 0 && setMessages(storedHistory[0].messages)
    }, []);

    const saveHistory = (newChatSession) => {
        const updatedHistory = [...history, newChatSession];
        setHistory(updatedHistory);
        localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
    };

    const formatResponse = (text) => {
        return text.replace(/\*/g, "")
            .replace(/\n\n/g, "\n\n")
            .replace(/(\d+\.)/g, "\n\n$1");
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        const newChatSession = { messages: [userMessage] };
        setMessages([...messages, userMessage]);
        setInput("");

        try {
            const response = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: input })
            });

            const data = await response.json();
            console.log("API Response:", data);

            if (data.answer) {
                const formattedAnswer = formatResponse(data.answer);
                const botMessage = { sender: "bot", text: formattedAnswer };
                setMessages((prev) => [...prev, botMessage]);
                newChatSession.messages.push(botMessage);

                const updatedHistory = [...history, newChatSession];
                setHistory(updatedHistory);
                localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
            }
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
        }
    };

    const toggleExpand = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const deleteHistory = (index) => {
        const updatedHistory = history.filter((_, i) => i !== index);
        setHistory(updatedHistory);
        localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
    };

    const clearAllHistory = () => {
        setHistory([]);
        setMessages([]);
        localStorage.removeItem("chatHistory");
    };


    // Splitting paragraph
    const splittingPara = (str, sender) => {
        var split = str.split("\n")
        const classess = `${sender == "user"
                ? "bg-blue-500 text-white p-2 rounded-[10px]"
                : "bg-gray-100 rounded-[10px] border-[0.2px] border-gray-200 p-2"
            }`
        return (
            <div className="flex flex-col gap-3">
                {split.map((msg, index) => (
                    msg.length != 0 && <div key={index} className={`${classess}`}>
                        {msg}
                    </div>
                ))}
            </div>

        )
    }

    return (
        <div className="grid grid-cols-12 gap-2 h-[100vh] overflow-y-hidden" >
            {/* History Component */}
            <div className="col-span-3 border h-full ml-2" >
                <div className="flex justify-between items-center mx-2 my-3 border-b pb-2">
                    <p className="font-bold text-[20px]">LỊCH SỬ CHAT</p>
                    <Button onClick={clearAllHistory} variant="destructive">Xóa Tất Cả</Button>
                </div>
                <div className="mx-2 flex flex-col gap-3 overflow-y-auto h-[90vh]" >
                    {history?.length > 0 ? history.map((session, index) => (
                        <div key={index} className="flex flex-col w-full h-auto justify-start p-2 border">
                            <div className="w-full">
                                <div className="pb-2 ">
                                    <p className="text-start line-clamp-2 text-[16px]">{session?.messages?.[0]?.text || "(Không có nội dung)"}</p>
                                </div>
                                <div className="flex justify-between">
                                    <button className="view-more" style={{ backgroundColor: "#00bfff", color: "white", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }} onClick={() => toggleExpand(index)}>Xem thêm</button>
                                    <button className="delete" style={{ backgroundColor: "#ff4d4d", color: "white", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }} onClick={() => deleteHistory(index)}>Xóa</button>
                                </div>
                            </div>
                            {expandedIndex === index && session?.messages && (
                                <div className="history-details" style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
                                    {session.messages.map((msg, i) => (
                                        <div key={i} className={`history-message ${msg.sender}`}>
                                            <strong>{msg.sender === "user" ? "Bạn" : "Chatbot"}:</strong> {msg.text}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )): <Empty desc={"Không có tin nhắn nào "}/>}
                </div>
            </div>
            {/* chat Component */}
            <div className="col-span-9 border h-full flex flex-col justify-start">
                {/* Header */}
                <div className="flex items-center justify-start px-3 py-4 border-b-[0.1px] border-gray-300 gap-3">
                    <SenderAvatar sender="chatbot"/>
                    <p className="text-[18px] font-semibold">Đại Học Công Nghệ Đông Á</p>
                </div>
                {/* Chatbox */}
                <div className="chat-box h-[77vh] max-h-[77vh]">
                    {messages?.length > 0 ? messages.map((msg, index) => {
                        const classess = `${msg.sender == "user"
                                ? "justify-end"
                                : "justify-start"
                            }`
                        return (
                            <div key={index} className={`flex items-start gap-3 ${classess}`}>
                                <SenderAvatar sender={msg.sender} />
                                {splittingPara(msg.text, msg.sender)}
                            </div>
                        )
                    }) : <Empty desc="Không có tin nhắn nào" />}
                </div>
                {/* Input */}
                <div className="chat-input">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Nhập tin nhắn..."
                        disabled={loading}
                    />
                    <button onClick={sendMessage} disabled={loading} className="send-button">
                        {loading ? "Đang gửi..." : "Gửi"}
                    </button>
                </div>
            </div>
                            
        </div>
    );
};

export default Home;
