import { MODAL_TYPE } from '@/utils/enums'
import React, { useState, useEffect } from 'react'
import { closeModal } from '@/utils/utility'
import Modal from '../UI/Modal';

const AgentVariableModal = ({ currentVariable, setCurrentVariable, handleSaveAgent }) => {
    const [variables, setVariables] = useState([]);

    useEffect(() => {
        if (currentVariable) {
            const variableArray = Object.entries(currentVariable || {}).map(([key, value]) => ({
                key,
                value
            }));
            setVariables(variableArray);
        }
    }, [currentVariable]);

    const handleValueChange = (index, newValue) => {
        const updatedVariables = [...variables];
        updatedVariables[index].value = newValue;
        setVariables(updatedVariables);
    }

    const handleSave = () => {
        const updatedVariables = variables?.reduce((acc, curr) => {
            acc[curr?.key] = curr?.value;
            return acc;
        }, {});
        setCurrentVariable?.(updatedVariables);
        handleSaveAgent(updatedVariables);
        closeModal(MODAL_TYPE?.AGENT_VARIABLE_MODAL);
    }

    return (
        <Modal MODAL_ID={MODAL_TYPE?.AGENT_VARIABLE_MODAL}>
            <div className="modal-box w-11/12 max-w-5xl">
                <h3 className="font-bold text-lg">Agent Variables</h3>
                <div className="py-4">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Key</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {variables?.map((variable, index) => (
                                    <tr key={index}>
                                        <td>{variable?.key}</td>
                                        <td>
                                            <input
                                                type="text"
                                                className="input input-bordered w-full"
                                                value={variable?.value === 'required' ? '' : (variable?.value || '')}
                                                placeholder={variable?.value === 'required' ? 'Required' : ''}
                                                onChange={(e) => handleValueChange(index, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn">Close</button>
                    </form>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default AgentVariableModal