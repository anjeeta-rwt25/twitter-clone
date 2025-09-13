import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import axios from "axios";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState("");
  const user = auth.currentUser;
  const chatContainerRef = useRef(null); // 👈 main container ref
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, typing]);

  // Firestore listener
  useEffect(() => {
    if (!user) return;
    const chatId = `${user.uid}_ai`;
    const chatCollectionRef = collection(db, "messages", chatId, "chats");

    const q = query(chatCollectionRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const chatId = `${user.uid}_ai`;
    const chatDocRef = doc(db, "messages", chatId);
    const chatCollectionRef = collection(chatDocRef, "chats");

    const userMsg = input.trim();
    setInput("");
    setTyping("AI is typing...");

    // Save user message
    await addDoc(chatCollectionRef, {
      text: userMsg,
      sender: user.displayName || user.email || "You",
      uid: user.uid,
      timestamp: serverTimestamp(),
    });

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: userMsg,
        userId: user.uid,
      });

      const botReply =
        res.data.reply || "⚠️ Sorry, I couldn't generate a response.";

      // Save AI reply
      await addDoc(chatCollectionRef, {
        text: botReply,
        sender: "AI Bot",
        uid: "bot",
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("AI error:", err);

      await addDoc(chatCollectionRef, {
        text: "⚠️ Failed to get reply from bot.",
        sender: "AI Bot",
        uid: "bot",
        timestamp: serverTimestamp(),
      });
    } finally {
      setTyping("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="p-3 text-center text-lg font-semibold bg-gray-900 border-b border-gray-800">
        🤖 AI Bot
      </div>

      {/* Chat messages */}
      <div
        ref={chatContainerRef} // 👈 attach ref to scroll container
        className="flex-1 p-4 overflow-y-auto space-y-3"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-md p-3 rounded-lg ${
              msg.sender === (user?.displayName || user?.email || "You")
                ? "bg-blue-600 ml-auto"
                : "bg-gray-700"
            }`}
          >
            <p className="text-xs text-gray-300">{msg.sender}</p>
            <p>{msg.text}</p>
          </div>
        ))}
        {typing && (
          <div className="italic text-gray-400 text-sm animate-pulse">
            {typing}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="p-3 border-t border-gray-800 flex items-center space-x-2"
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-2/3 px-3 py-1.5 text-sm rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="white"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3 21l9-3 9-3-9-3-9-3z"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
