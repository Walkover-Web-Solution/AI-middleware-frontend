import { MODAL_TYPE } from '@/utils/enums'
import { closeModal } from '@/utils/utility';
import React from 'react'

function AddTestCaseModal({ testCaseConversation, setTestCaseConversation }) {
    console.log(testCaseConversation, 'testCaseConversation');

    // Create the final array to be passed on submit and shown on UI
    const finalTestCaseArray = testCaseConversation.map((message) => {
        if (message.role === "user") {
            return {
                role: message.role,
                message: message.content?.[0]?.text || message?.content
            };
        } else if (message.role === "assistant" && message.content) {
            return {
                role: message.role,
                message: message.content?.[0]?.text || message?.content
            };
        } else if (message.role === "tools_call") {
            return message;
        }
        return null;
    }).filter(Boolean);

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(finalTestCaseArray, 'finalTestCaseArray');
        // Further logic to handle the finalTestCaseArray can be added here
    };

    const handleClose = () => {
        closeModal(MODAL_TYPE.ADD_TEST_CASE_MODAL);
        setTestCaseConversation([]);
    };

    const extractToolCallArgs = (message) => {
        return JSON.stringify(
            ((message?.tools_call_data || []).reduce(
                (acc1, data) => acc1 || Object.values(data)?.reduce(
                    (acc, item) => item?.args || acc,
                    null
                ),
                null
            ) || []),
            null,
            2
        );
    };

    return (
        <dialog id={MODAL_TYPE?.ADD_TEST_CASE_MODAL} className="modal modal-bottom sm:modal-middle">
            <form onSubmit={handleSubmit} className="modal-box flex flex-col gap-4">
                <h3>Add Test Case</h3>
                <div className="flex flex-col gap-2">
                    {finalTestCaseArray.map((message, index) => (
                        <div key={index} className="p-2 border rounded">
                            <strong>{message.role}:</strong>
                            {message.role === "tools_call" ? (
                                <textarea defaultValue={extractToolCallArgs(message)} className="w-full p-2 border rounded" />
                            ) : (
                                message.message
                            )}
                        </div>
                    ))}
                </div>
                <div className="modal-action">
                    <button type="button" className="btn" onClick={handleClose}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Create</button>
                </div>
            </form>
        </dialog>
    );
}

export default AddTestCaseModal;