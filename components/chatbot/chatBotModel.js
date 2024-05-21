"use client"
import { createNewChatbot } from "@/store/action/chatBotAction";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

function ChatBotModel({ orgid }) {

    const route = useRouter();
    const dispatch = useDispatch()

    // const createChatBotHandler = (name) => {
    //     const datatosend = {
    //         "config": {},
    //         "orgId": 6095,
    //         "title": "viasocket",
    //         "bridge": []
    //     }
    //     console.log(name)
    //     dispatch(createNewChatbot({ ...datatosend, title: name, orgId: orgid }))
    //         .then((response) => {
    //             // Assuming the action resolves with the response data upon success
    //             console.log(response); // Log or handle the response data as needed
    //             if (response && response.data && response.data.botId) {
    //                 // Navigate to the next page if the response contains the botId
    //                 route.push(`/org/${orgid}/chatbot/${response.data.botId}`);
    //                 document.getElementById('my_modal_1').close();
    //             } else {
    //                 // Handle the case where response does not contain the expected data
    //                 console.error('API call was successful but did not return the expected data.');
    //             }
    //         })
    //         .catch((error) => {
    //             // Handle the case where the API call was not successful
    //             console.error('API call failed:', error);
    //         });
    //     // dispatch(createBridgeAction({ dataToSend: dataToSend, orgid }, (data) => {

    //     //     route.push(`/org/${orgid}/bridges/configure/${data.data.bridge._id}`);
    //     //     setIsLoading(false);
    //     //     document.getElementById('my_modal_1').close()
    //     // })).catch(
    //     //     setIsLoading(false)
    //     // );

    // }
    const createChatBotHandler = (name) => {
        const datatosend = {
            "orgId": orgid,
            "title": "viasocket",
        }
        console.log(name)
        dispatch(createNewChatbot({ ...datatosend, title: name, orgId: orgid }, (data) => {
            route.push(`/org/${orgid}/chatbot/${data.data.chatBot._id}`);
            document.getElementById('my_modal_1').close()
        }))
    }

    return (
        <div>

            < dialog id="my_modal_1" className="modal" >
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Create a New ChatBot</h3>
                    <div >
                        <label className="form-control w-full mb-2">
                            <div className="label">
                                <span className="label-text">ChatBot Name</span>
                            </div>
                            <input type="text" id="chatbot-name" placeholder="Type here" className="input input-bordered w-full " />
                        </label>
                    </div>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn">Close</button>
                        </form>
                        <button className="btn" onClick={() => createChatBotHandler(document.getElementById("chatbot-name").value)}>+ Create</button>
                    </div>
                </div>
            </dialog >

        </div >
    )
}

export default ChatBotModel;
