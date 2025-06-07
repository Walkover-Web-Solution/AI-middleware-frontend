import { useEffect, useRef, useState } from "react";

function PromptCanvas({ OptimizePrompt, height = "60vh", width = "100%" }) {
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [instruction, setInstruction] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleResetChat = () => {
    setMessages([]);
    setInstruction("");
  };

  const handleSend = async () => {
    if (!instruction.trim()) {
      setErrorMessage("Please enter an instruction.");
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      content: instruction.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInstruction("");
    setErrorMessage("");

    try {
      const response = await OptimizePrompt(instruction);
      const result = typeof response === 'string' ? JSON.parse(response) : response?.data ?? response;
     
      const assistantMessage = {
        id: Date.now() + 1,
        sender: "assistant",
        content: result.description,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "assistant",
        content: "An error occurred while optimizing the prompt.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  };

  return (
    <div className="px-4 pt-4" style={{ width }}>
      <div className="w-full flex justify-between items-center px-2">
        <span className="label-text font-semibold">Playground</span>
        {messages.length > 0 && (
          <button className="btn btn-sm" onClick={handleResetChat}>
            Reset Chat
          </button>
        )}
      </div>

      <div className="sm:p-2 mt-4 justify-between flex flex-col border rounded-md w-full z-10" style={{ height }}>
        <div id="messages" className="flex flex-col w-full overflow-y-auto overflow-x-hidden mb-4 pr-2">
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              ref={index === messages.length - 1 ? messagesEndRef : null}
              className={`chat ${message.sender === "user" ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-header">
                {message.sender}
                <time className="text-xs opacity-50 pl-2">{message.time}</time>
              </div>
              <div className="chat-bubble mt-1">{message.content}</div>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0 w-full z-10">
          <div className="flex flex-row gap-2">
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Type your instruction..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            />
            <button className="btn btn-primary" onClick={handleSend}>Send</button>
          </div>
          {errorMessage && (
            <div className="text-red-500 mt-2">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PromptCanvas;
