"use client"
import { useCustomSelector } from '@/customHooks/customSelector';
import { filterOrganizations, renderedOrganizations, setInCookies } from '@/utils/utility';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import Protected from '@/components/protected';
import { getModelAction } from '@/store/action/modelAction';
import { switchOrg } from '@/config';
import { toast } from 'react-toastify';
import { setCurrentOrgIdAction } from '@/store/action/orgAction';
import { createBridgeAction } from '@/store/action/bridgeAction';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/loadingSpinner';
import { getServiceAction } from '@/store/action/serviceAction';
import { switchUser } from '@/config';

const INITIAL_FORM_STATE = {
    bridgeName: '',
    selectedOrg: null,
    searchQuery: '',
    bridgeType: 'api',
    selectedService: 'openai',
    selectedModel: "gpt-4o",
    selectedModelType: 'chat',
    slugName: '',
    isLoading: false,
    template_Id: '',
};

function Page() {
    const dispatch = useDispatch();
    const route = useRouter();
    const searchParams = useSearchParams();
    const [formState, setFormState] = useState(INITIAL_FORM_STATE);
    const [isInitialLoading, setIsInitialLoading] = useState(false);

    const { organizations, modelsList, SERVICES, DEFAULT_MODEL } = useCustomSelector(state => ({
        organizations: state.userDetailsReducer.organizations,
        modelsList: state?.modelReducer?.serviceModels[formState.selectedService],
        SERVICES: state?.serviceReducer?.services,
        DEFAULT_MODEL: state?.serviceReducer?.default_model
    }));

    const templateId = searchParams.get('template_id');

     useEffect(() => {
        if(!SERVICES || Object?.entries(SERVICES)?.length === 0) {
            dispatch(getServiceAction())
        }
    }, [SERVICES]);


    useEffect(() => {
        const setTemplateData = async () => {
            if (templateId) {
                try {
                    setIsInitialLoading(true);
                        updateFormState({ 
                            template_Id: templateId,
                        });
                        toast.success('Template loaded successfully');
                    //}
                } catch (error) {
                    toast.error(error.response?.data?.message || "Error loading template");
                } finally {
                    setIsInitialLoading(false);
                }
            }
        };
        setTemplateData();
    }, [templateId]);

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
                setInCookies('local_token', token);
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
                orgid: selectedOrg.id,
                ...(formState.template_Id && { templateId: formState.template_Id }),
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
            selectedModel: DEFAULT_MODEL[service]?.model,
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

    if (formState.isLoading || isInitialLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex min-h-screen bg-gray-100 p-6 gap-6">
            {/* Organizations List */}
            <div className="w-96 bg-base-100 rounded-xl shadow-sm p-4 h-[calc(100vh-3rem)]">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Organizations</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search organizations by Name"
                        value={formState.searchQuery}
                        onChange={handleChange('searchQuery')}
                        className="w-full px-4 py-2 border border-base-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="space-y-2 max-h-[78vh] overflow-x-hidden overflow-y-auto p-2">
                    {renderedOrganizations(organizations, formState, handleSelectOrg)}
                </div>

            </div>

            {/* Creation Form */}
            <div className="flex-1 bg-base-100 rounded-xl shadow-sm p-8">
                <div className="max-w-2xl mx-auto">
                     <div className="bg-blue-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold text-blue-800">Create New Agent</h2>
                        <p className="text-sm text-blue-600 mt-1">Set up a new agent to connect your services</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 border border-base-300 rounded p-6">
                        <div className="space-y-4">
                            {/* Bridge Type Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Agent Type
                                </label>
                                {/* <div className="flex gap-4">
                                    {['api'].map((type) => (
                                        <label
                                            key={type}
                                            className="flex items-center space-x-2 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="bridgeType"
                                                value={type}
                                                checked={formState.bridgeType === type}
                                                onChange={() => updateFormState({ bridgeType: type })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700 capitalize">
                                                {type === 'api' ? 'API' : 'Chat Bot'}
                                            </span>
                                        </label>
                                    ))}
                                </div> */}
                            </div>

                            {/* Name Fields */}
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Agent Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formState.bridgeName}
                                        onChange={handleChange('bridgeName')}
                                        className="w-full px-4 py-2 border border-base-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="My Awesome Agent"
                                        required
                                    />
                                </div>
                                
                                {formState.bridgeType === 'chatbot' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Slug Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formState.slugName}
                                            onChange={handleChange('slugName')}
                                            className="w-full px-4 py-2 border border-base-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="my-awesome-agent"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Service Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    AI Service
                                </label>
                                <select
                                    value={formState.selectedService}
                                    onChange={handleService}
                                    className="w-full px-4 py-2 border border-base-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {Array.isArray(SERVICES) ? SERVICES?.map(({ value, displayName }) => (
                                        <option key={value} value={value}>{displayName}</option>
                                    )) : null}
                                </select>
                            </div>

                            {/* Model Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    AI Model
                                </label>
                                <select
                                    value={formState.selectedModel}
                                    onChange={handleModelChange}
                                    className="w-full px-4 py-2 border border-base-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select a model</option>
                                    {Object.entries(modelsList || {}).map(([group, options]) => (
                                        group !== 'models' && (
                                            <optgroup label={group} key={group}>
                                                {Object.keys(options || {}).map((option) => {
                                                    const modelName = options?.[option]?.configuration?.model?.default;
                                                    return modelName && (
                                                        <option key={modelName} value={modelName}>
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
                            disabled={formState.isLoading}
                            className="w-full py-3 px-4 bg-blue-600 text-base-100 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {formState.isLoading ? 'Creating...' : 'Create Agent'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Protected(Page);
