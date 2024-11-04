"use client"
import CodeBlock from '@/components/codeBlock/codeBlock';
import { sendMessageApi } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

function Chatbot({ params, reduxPrompt }) {
    const [messages, setMessages] = useState([
        { sender: 'bot', content: 'Hello! How can I optimize your prompt?' },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (input.trim()) {
            const userMessage = input?.trim();
            setMessages([...messages, { sender: 'user', content: userMessage }]);
            setInput('');
            setIsLoading(true);
            try {
                const response = await sendMessageApi({ message: `${userMessage} Here is the Prompt: ${reduxPrompt}`, variables: { inputPrompt: reduxPrompt }, theadId: params?.id });
                setMessages(prev => [...prev, { sender: 'bot', content: response }]);
            } catch (error) {
                setMessages(prev => [...prev, { sender: 'bot', content: 'Error occurred while sending the message.' }]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="flex flex-col w-1/2 bg-white shadow-lg border rounded-lg" style={{ minHeight: '90vh' }}>
            <div className="flex-1 overflow-auto p-4 space-y-4">
                {messages.map((message, index) => {
                    return (
                        <div
                            key={index}
                            className={`rounded-lg ${message.sender === 'bot' ? ' text-gray-700  chat-start' : ' text-gray-900 chat-end'}`}
                        >
                            <div className="chat-header">
                                {message.sender}
                            </div>
                            <div className="chat-bubble break-keep">
                                <ReactMarkdown components={{
                                    code: ({ node, inline, className, children, ...props }) => (
                                        <CodeBlock
                                            inline={inline}
                                            className={className}
                                            isDark={true} // Pass isDark to CodeBlock
                                            {...props}
                                        >
                                            {children}
                                        </CodeBlock>
                                    )
                                }}>{message.content}</ReactMarkdown></div>
                        </div>
                    )
                })}
                {isLoading && (
                    <div className="w-fit max-w-xl p-3 rounded-lg bg-blue-100 text-gray-700">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></div>
                        </div>
                    </div>
                )}

            </div>
            <div className="p-2 flex items-center border-t">
                <input
                    type="text"
                    className="flex-1 p-2 border rounded-lg focus:outline-none"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                    className="ml-2 p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    onClick={handleSend}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

function PromptOptimizePage({ params }) {
    const { prompt: reduxPrompt, service, serviceType, variablesKeyValue } = useCustomSelector((state) => ({
        prompt: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.prompt || "",
        serviceType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.type || "",
        service: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.service || "",
        variablesKeyValue: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.variables || []
    }));
    const [newPrompt, setNewPrompt] = useState(reduxPrompt);
    useEffect(()=>{
        setNewPrompt(reduxPrompt)
    }, [reduxPrompt])

    const handleChangePrompt = (e) => {
        setNewPrompt(e.target.value);
    }

    return (
        <div className='flex w-full p-4 bg-gray-100'>
            <div className="form-control h-full w-1/3">
                <span className='font-bold'>Current Prompt</span>
                <textarea
                    className="textarea textarea-bordered border w-full min-h-screen resize-y focus:border-primary relative bg-transparent z-10 caret-black p-2"
                    value={reduxPrompt}
                    onBlur={handleChangePrompt}
                />
            </div>
            <div className="flex justify-center w-full">
                <Chatbot params={params} reduxPrompt={reduxPrompt} />
            </div>
        </div>
    );
}

export default PromptOptimizePage;