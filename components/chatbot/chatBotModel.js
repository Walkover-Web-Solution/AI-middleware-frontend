"use client"
import { createNewChatbot } from "@/store/action/chatBotAction";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

function ChatBotModel({ orgid }) {

    const route = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch()

    const createChatBotHandler = (name) => {
        if (!name) {
            toast.error('Please enter a name for the ChatBot');
            return;
        }
        setIsLoading(true); // Set loading state to true
        dispatch(createNewChatbot({ title: name, orgId: orgid }, (data) => {
            route.push(`/org/${orgid}/chatbot/configure/${data.data.chatBot._id}`);
            document.getElementById('my_modal_1').close();
            setIsLoading(false); // Reset loading state after completion
        }))
    }

    return (
        <div>

            < dialog id="chatBot_model" className="modal" >
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Create a New ChatBot</h3>
                    <div >
                        <label className="form-control w-full mb-2">
                            <div className="label">
                                <span className="label-text">ChatBot Name</span>
                            </div>
                            <input
                                type="text"
                                id="chatbot-name"
                                placeholder="Type here"
                                className="input input-bordered w-full"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        createChatBotHandler(e.target.value);
                                    }
                                }}
                            />
                        </label>
                    </div>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn">Close</button>
                        </form>
                        <button className="btn" onClick={() => createChatBotHandler(document.getElementById("chatbot-name").value)}>{isLoading ?
                            <span className="loading loading-spinner loading-sm"></span> : '+ Create'}</button>
                    </div>
                </div>
            </dialog >

        </div >
    )
}

export default ChatBotModel;
