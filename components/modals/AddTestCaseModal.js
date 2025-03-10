import { useCustomSelector } from '@/customHooks/customSelector';
import { createTestCaseAction } from '@/store/action/testCasesAction';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import { X } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

function AddTestCaseModal({ testCaseConversation, setTestCaseConversation }) {
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const { mongoIdsOfTools } = useCustomSelector((state) => ({
        mongoIdsOfTools: Object.values(state.bridgeReducer.org?.[params.org_id]?.functionData)?.reduce((acc, item) => {
            acc[item?.function_name] = item?._id;
            return acc;
        }, {})
    }));
    // Ensure testCaseConversation is not undefined or null
    const initialTestCases = testCaseConversation && testCaseConversation.length > 0 ? testCaseConversation.map((message) => {
        if (message.role === "user") {
            return {
                role: message.role,
                content: message.content?.[0]?.text || message?.content
            };
        } else if (message.role === "assistant" && message.content) {
            return {
                role: message.role,
                content: message.content?.[0]?.text || message?.content
            };
        } else if (message.role === "tools_call") {
            return {
                role: message?.role,
                tools: message.tools_call_data?.map((toolData) => (
                    Object.values(toolData || {}).map((item) => ({
                        name: item?.name,
                        id: mongoIdsOfTools[item?.id],
                        arguments: item?.args
                    }))
                )).flat()
            };
        }
        return null;
    }).filter(Boolean) : [];

    const [finalTestCases, setFinalTestCases] = useState(initialTestCases);
    const [responseType, setResponseType] = useState('cosine')
    useEffect(() => {
        setFinalTestCases(initialTestCases);
    }, [testCaseConversation]);

    const handleSubmit = (event) => {
        setIsLoading(true);
        event.preventDefault();
        const lastTestCase = finalTestCases[finalTestCases.length - 1] || {};
        const isAssistant = lastTestCase.role === "assistant";
        const isToolsCall = lastTestCase.role === "tools_call";

        const payload = {
            conversation: finalTestCases.slice(0, -1),
            type: isAssistant ? "response" : "function",
            expected: {
                ...(isAssistant && { response: lastTestCase.content }),
                ...(isToolsCall && { tool_calls: lastTestCase.tools })
            },
            bridge_id: params?.id,
            matching_type: responseType
        };
        dispatch(createTestCaseAction({ bridgeId: params?.id, data: payload })).then(() => { handleClose(); setIsLoading(false) });
    };

    const handleChange = (newValue, index, childIndex) => {
        setFinalTestCases((prevTestCases) => {
            const updatedTestCases = [...prevTestCases];
            if (childIndex) {
                try {
                    JSON.parse(newValue);
                } catch (error) {
                    toast.error('InValid JSON');
                    return prevTestCases;
                }
                updatedTestCases[index].tools[childIndex] = JSON.parse(newValue);
            } else {
                updatedTestCases[index].content = newValue;
            }
            return updatedTestCases;
        });
    }
    const removeTool = (index, childIndex) => {
        setFinalTestCases((prevTestCases) => {
            const updatedTestCases = [...prevTestCases];
            updatedTestCases[index].tools.splice(childIndex, 1);
            return updatedTestCases;
        });
    }
    const handleClose = () => {
        closeModal(MODAL_TYPE.ADD_TEST_CASE_MODAL);
        setTestCaseConversation([]);
    };

    return (
        <dialog id={MODAL_TYPE?.ADD_TEST_CASE_MODAL} className="modal">
            <form onSubmit={handleSubmit} className="modal-box flex flex-col gap-4  w-11/12 max-w-5xl">
                <h3 className='font-bold'>Add Test Case</h3>
                <div className="flex flex-col gap-2">
                    {finalTestCases?.map((message, index) => (
                        <div key={index} className="p-2 border rounded">
                            <strong>{message.role}:</strong>
                            {message.role === "tools_call" ? (
                                message.tools?.map((item, idx) => (
                                    <div key={idx} className='flex'>
                                        <textarea defaultValue={JSON.stringify(item)} className="w-full p-2 border rounded min-h-28" onBlur={(event) => handleChange(event?.target?.value, index, idx)} />
                                        {message.tools.length > 1 && (
                                            <button
                                                className={"px-2 py-1  rounded-md"}
                                                onClick={() => removeTool(index, idx)}
                                            >
                                                <X />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <textarea defaultValue={message.content} className="w-full p-2 border rounded min-h-8" onBlur={(event) => handleChange(event?.target?.value, index, null)} />
                            )}
                        </div>
                    ))}
                </div>
                <div className="modal-action">
                    <div className='flex items-center gap-2'>
                        <label htmlFor="responseType" className="block mb-1">Match Type</label>
                        <select id="responseType" className="select select-bordered" value={responseType} onChange={(e) => setResponseType(e?.target?.value)}>
                            <option value="exact" selected>exact</option>
                            <option value="ai">ai</option>
                            <option value="cosine">cosine</option>
                        </select>
                    </div>
                    <button type="button" className="btn" onClick={handleClose}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>{!isLoading ? 'Create' : 'Creating'}</button>
                </div>
            </form>
        </dialog>
    );
}

export default AddTestCaseModal;