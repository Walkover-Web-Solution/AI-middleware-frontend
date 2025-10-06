import { useCustomSelector } from '@/customHooks/customSelector';
import { createTestCaseAction } from '@/store/action/testCasesAction';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import { CloseIcon } from '@/components/Icons';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Modal from '../UI/Modal';

function AddTestCaseModal({ testCaseConversation, setTestCaseConversation }) {
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const { mongoIdsOfTools } = useCustomSelector((state) => {
        const functionData = state.bridgeReducer.org?.[params.org_id]?.functionData;
        const mongoIds = functionData ? Object.values(functionData).reduce((acc, item) => {
                if (item?.function_name && item?._id) {
                    acc[item.function_name] = item._id;
                }
                return acc;
            }, {})
            : {};

        return { mongoIdsOfTools: mongoIds };
    });
    // Ensure testCaseConversation is not undefined or null
    const initialTestCases = testCaseConversation && testCaseConversation.length > 0 ? testCaseConversation.map((message) => {
        if (message.role === "user" || message.sender === "user") {
            return {
                role: message.role || message.sender,
                content: message.content?.[0]?.text || message?.content
            };
        } else if ((message.role === "assistant" || message.sender === "assistant") && message.content) {
            return {
                role: message.role || message.sender,
                content: message.content?.[0]?.text || message?.content
            };
        } else if (message.role === "tools_call" || message.sender === "tools_call") {
            const toolCallData = message.tools_call_data;
          
            const tools = [];
          
            if (toolCallData && typeof toolCallData === 'object') {
              for (const [toolName, toolDetails] of Object.entries(toolCallData)) {
                tools.push({
                  name: toolName,
                  id: mongoIdsOfTools[toolDetails?.id],
                  arguments: toolDetails?.args,
                });
              }
            }
          
            return {
              role: message?.role || message?.sender,
              tools,
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
        <Modal MODAL_ID={MODAL_TYPE.ADD_TEST_CASE_MODAL}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start z-low-medium min-w-[100vw] min-h-[100vh] overflow-auto py-4">
                <form onSubmit={handleSubmit} className="bg-base-200 rounded-lg shadow-2xl max-w-5xl w-[90vw] overflow-auto relative flex flex-col">
                    <div className="flex justify-between items-center p-6 pb-0 sticky top-0 bg-base-100 z-low">
                        <h3 className="text-xl font-semibold">Create Test Case</h3>
                        <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={handleClose}>✕</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                        {finalTestCases?.map((message, index) => (
                            <div key={index} className="space-y-2">
                                <div className="text-xs font-medium uppercase text-base-content tracking-wide">
                                    {message?.role?.replace('_', ' ') || message?.sender?.replace('_', ' ')}
                                </div>
                                {(message.role === "tools_call" || message.sender === "tools_call") ? (
                                    <div className="space-y-3">
                                        {message.tools?.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 items-start group relative bg-base-100 rounded-lg p-3 shadow-sm">
                                                <textarea
                                                    defaultValue={JSON.stringify(item, null, 2)}
                                                    className="textarea w-full font-mono text-sm p-2 bg-transparent focus:outline-none min-h-20 h-auto max-h-72 overflow-y-auto"
                                                    onBlur={(e) => handleChange(e.target.value, index, idx)}
                                                    rows={4}
                                                />
                                                {message.tools.length > 1 && (
                                                    <button
                                                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeTool(index, idx)}
                                                    >
                                                        <CloseIcon size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <textarea 
                                        defaultValue={message.content}
                                        className="textarea w-full text-sm p-3 focus:outline-none bg-base-100 rounded-lg shadow-sm min-h-20 h-auto max-h-72"
                                        onBlur={(e) => handleChange(e.target.value, index, null)}
                                        rows={3}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center p-6 pt-4 bg-base-200 sticky bottom-0">
                        <div className="flex items-center gap-3">
                            <label className="text-sm text-base-content">Matching strategy:</label>
                            <select 
                                className="select select-sm bg-base-100 focus:outline-none border-none"
                                value={responseType} 
                                onChange={(e) => setResponseType(e.target.value)}
                            >
                                <option value="exact">Exact</option>
                                <option value="ai">AI</option>
                                <option value="cosine">Cosine</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" className="btn btn-ghost" onClick={handleClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-6" disabled={isLoading}>
                                {isLoading ? <span className="loading loading-spinner"></span> : 'Create'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default AddTestCaseModal;