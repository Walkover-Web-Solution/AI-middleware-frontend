import { dryRun } from "@/api";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

function Chat() {
  const dispatch = useDispatch();

  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Chatbot",
      time: "10:00",
      content: "Hello, how can I help you today?",
      status: "Sent",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async () => {

    if (newMessage.trim() === "") return;

    const newChat = {
      id: messages.length + 1,
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      content: newMessage,
      status: "Sending",
    };

    setMessages([...messages, newChat]);
    setNewMessage("");

    // const dataToSend = {
    //   configuration: {
    //     model: "gpt-3.5-turbo",
    //     service: "openai",
    //     temperature: 1,
    //     prompt: [{ role: "system", content: "hey" }],
    //     type: "chat",
    //     user: [{ role: "user", content: newMessage }],
    //   },
    // };

    try {
      const dataToSend = {
        "configuration":{
            "model":"gpt-3.5-turbo",
            
            "temperature":1,
            "prompt":[{"role":"system","content":"hey"}],
            "type":"chat",
              "user":[{"role":"user","content":"hello "}]
        },
          "service": "openai",
        // "org_id":"124dfgh67ghj",
        "apikey":"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"
    }
      const data = await dryRun(dataToSend);
  
      console.log(data);
    
  } catch (error) {
    console.error(error);
  }

    
    
  };

  return (
    <div className=" p:2 sm:p-6 justify-between flex flex-col h-[80vh] lg:w-[50vw] border w-full">
      {/* chat start */}
      <div
        id="messages"
        className="flex flex-col w-full space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat ${
              message.sender === "user" ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="user Avatar"
                  src={
                    message.sender === "user"
                      ? "user-avatar-url"
                      : "chatbot-avatar-url"
                  }
                />
              </div>
            </div>
            <div className="chat-header">
              {message.sender}
              <time className="text-xs opacity-50 pl-2">{message.time}</time>
            </div>
            <div className="chat-bubble">{message.content}</div>
            <div className="chat-footer opacity-50">{message.status}</div>
          </div>
        ))}
      </div>

      {/* chat end */}

      {/* ---------------------------------bottom----------------------------------- */}
      <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0 w-full">
        <div className="relative flex justify-start items-center w-full ">
          <div class="form-control w-full">
            <div class="input-group flex gap-2 w-full">
              <input
                type="text"
                placeholder="Type here"
                className="input input-bordered w-full "
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button className="btn" onClick={handleSendMessage}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-6 w-6 ml-2 transform rotate-90"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* -----------------------bottom end----------------------------------- */}
    </div>
  );
}

export default Chat;
