"use client"
import { useCustomSelector } from '@/customHooks/customSelector';
import { filterOrganizations } from '@/utils/utility';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { DEFAULT_MODEL } from '@/jsonFiles/bridgeParameter';
import Protected from '@/components/protected';
import { getModelAction } from '@/store/action/modelAction';
import { switchOrg } from '@/config';
import { toast } from 'react-toastify';
import { setCurrentOrgIdAction } from '@/store/action/orgAction';
import { createBridgeAction } from '@/store/action/bridgeAction';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/loadingSpinner';
import { getServiceAction } from '@/store/action/serviceAction';

const INITIAL_FORM_STATE = {
    bridgeName: '',
    selectedOrg: null,
    searchQuery: '',
    bridgeType: 'api',
    selectedService: 'openai',
    selectedModel: "gpt-4o",
    selectedModelType: 'chat',
    slugName: '',
    isLoading: false
};

function Page() {
    const dispatch = useDispatch();
    const route = useRouter();
    const [formState, setFormState] = useState(INITIAL_FORM_STATE);

    const { organizations, modelsList, SERVICES } = useCustomSelector(state => ({
        organizations: state.userDetailsReducer.organizations,
        modelsList: state?.modelReducer?.serviceModels[formState.selectedService],
        SERVICES: state?.serviceReducer?.services
    }));

    useEffect(() => {
        if(!SERVICES) {
            dispatch(getServiceAction({ orgid: params.orgid }))
        }
    }, [SERVICES]);

    useEffect(() => {
        formState.selectedService && dispatch(getModelAction({ service: formState.selectedService }));
    }, [formState.selectedService, dispatch]);

    const updateFormState = useCallback((updates) => {
        setFormState(prev => ({ ...prev, ...updates }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const { selectedOrg, bridgeName, bridgeType, slugName } = formState;

        if (!selectedOrg || !bridgeName.trim()) {
            return toast.error('Please select an organization and enter a agent name');
        }

        if (bridgeType === 'chatbot' && !slugName.trim()) {
            return toast.error('Please enter a slug name for chatbot');
        }

        try {
            updateFormState({ isLoading: true });
            const response = await switchOrg(selectedOrg.id);

            if (process.env.NEXT_PUBLIC_ENV === 'local') {
                const { token } = await switchUser({
                    orgId: selectedOrg.id,
                    orgName: selectedOrg.name
                });
                localStorage.setItem('local_token', token);
            }

            await dispatch(setCurrentOrgIdAction(selectedOrg.id));

            if (response.status !== 200) {
                throw new Error('Failed to switch organization');
            }

            const bridgeData = {
                service: formState.selectedService,
                model: formState.selectedModel,
                name: bridgeName,
                slugName: slugName || bridgeName,
                bridgeType,
                type: formState.selectedModelType,
                orgid: selectedOrg.id
            };

            dispatch(createBridgeAction({
                dataToSend: bridgeData,
                orgid: selectedOrg.id
            }, (data) => {
                route.push(`/org/${selectedOrg.id}/agents/configure/${data.data.bridge._id}?version=${data.data.bridge.versions[0]}`);
            }));

        } catch (error) {
            console.error("Error:", error.message || error);
            toast.error(error.message || "An error occurred");
            updateFormState({ isLoading: false });
        }
    }, [formState, dispatch, route]);

    const handleSelectOrg = useCallback((orgId, orgName) => {
        updateFormState({ selectedOrg: { id: orgId, name: orgName } });
    }, [updateFormState]);

    const handleService = useCallback((e) => {
        const service = e.target.value;
        updateFormState({
            selectedService: service,
            selectedModel: DEFAULT_MODEL[service],
            selectedModelType: "chat"
        });
    }, [updateFormState]);

    const handleChange = useCallback((field) => (e) => {
        updateFormState({ [field]: e.target.value });
    }, [updateFormState]);

    const handleModelChange = useCallback((e) => {
        updateFormState({
            selectedModel: e.target.value,
            selectedModelType: e.target.selectedOptions[0].parentNode.label
        });
    }, [updateFormState]);

    const filteredOrganizations = useMemo(() =>
        filterOrganizations(organizations, formState.searchQuery),
        [organizations, formState.searchQuery]);

    const renderedOrganizations = useMemo(() => (
        filteredOrganizations.slice().reverse().map((org, index) => (
            <div
                key={org.id || index}
                onClick={() => handleSelectOrg(org.id, org.name)}
                className={`bg-white shadow-lg rounded-lg overflow-hidden transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${formState.selectedOrg?.id === org.id ? 'ring-2 ring-blue-500' : ''}`}
            >
                <div className="px-6 py-4">
                    <div className="font-bold text-xl mb-2">{org.name}</div>
                </div>
            </div>
        ))
    ), [filteredOrganizations, formState.selectedOrg, handleSelectOrg]);

    if (formState.isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex max-h-[100vh] bg-gray-100 p-8">
            <div className="w-1/3 bg-white rounded-lg shadow-lg p-6 mr-4">
                <h2 className="text-xl font-semibold mb-4">Select Organization</h2>
                <input
                    type="text"
                    placeholder="Search organizations"
                    value={formState.searchQuery}
                    onChange={handleChange('searchQuery')}
                    className="input w-full p-4 mx-auto border border-base-200 mb-2"
                />
                <div className="space-y-2 max-h-[78vh] overflow-x-hidden overflow-y-auto p-2">
                    {renderedOrganizations}
                </div>
            </div>

            <div className="w-2/3 bg-white rounded-lg shadow-lg pt-24 px-44 pb-48 max-auto">
                <div className="flex flex-col space-y-6 border border-gray-200 rounded-lg p-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold text-blue-800">Create New Agent</h2>
                        <p className="text-sm text-blue-600 mt-1">Set up a new agent to connect your services</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-control">
                            <div className="label">
                                <span className="label-text font-medium">Used as</span>
                            </div>
                            <div className="flex items-center gap-6">
                                {['api', 'chatbot'].map(type => (
                                    <label key={type} className="label cursor-pointer gap-2">
                                        <input
                                            type="radio"
                                            name="bridgeType"
                                            className={`radio radio-${type === 'api' ? 'primary' : 'black'}`}
                                            value={type}
                                            checked={formState.bridgeType === type}
                                            onChange={() => updateFormState({ bridgeType: type })}
                                            required
                                        />
                                        <span className="label-text">{type === 'api' ? 'API' : 'ChatBot'}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {[
                                {
                                    label: 'Agent Name',
                                    field: 'bridgeName',
                                    type: 'text',
                                    placeholder: 'Enter agent name'
                                },
                                formState.bridgeType === 'chatbot' && {
                                    label: 'Slug Name',
                                    field: 'slugName',
                                    type: 'text',
                                    placeholder: 'Enter slug name'
                                }
                            ].filter(Boolean).map(({ label, field, type, placeholder }) => (
                                <div key={field} className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">{label}</span>
                                    </label>
                                    <input
                                        type={type}
                                        value={formState[field]}
                                        onChange={handleChange(field)}
                                        className="input input-bordered w-full focus:ring-2 focus:ring-blue-500"
                                        placeholder={placeholder}
                                        required
                                    />
                                </div>
                            ))}

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Select Service</span>
                                </label>
                                <select
                                    value={formState.selectedService}
                                    onChange={handleService}
                                    className="select select-bordered w-full focus:ring-2 focus:ring-blue-500"
                                >
                                    {Array.isArray(SERVICES) ? SERVICES?.map(({ value, displayName }) => (
                                        <option key={value} value={value}>{displayName}</option>
                                    )) : null}
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Pick a model</span>
                                </label>
                                <select
                                    value={formState.selectedModel}
                                    onChange={handleModelChange}
                                    className="select select-bordered w-full focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option disabled></option>
                                    {Object.entries(modelsList || {}).map(([group, options], groupIndex) => (
                                        group !== 'models' && (
                                            <optgroup label={group} key={`group_${groupIndex}`}>
                                                {Object.keys(options || {}).map((option, optionIndex) => {
                                                    const modelName = options?.[option]?.configuration?.model?.default;
                                                    return modelName && (
                                                        <option key={`option_${option}_${optionIndex}`}>
                                                            {modelName}
                                                        </option>
                                                    );
                                                })}
                                            </optgroup>
                                        )
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full mt-6 py-3 text-lg"
                        >
                            Create Agent
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Protected(Page);
