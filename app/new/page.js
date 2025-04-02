"use client"
import { useCustomSelector } from '@/customHooks/customSelector';
import { filterOrganizations } from '@/utils/utility';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { DEFAULT_MODEL, SERVICES } from '@/jsonFiles/bridgeParameter';
import Protected from '@/components/protected';
import { getModelAction } from '@/store/action/modelAction';
import { switchOrg } from '@/config';
import { toast } from 'react-toastify';
import { setCurrentOrgIdAction } from '@/store/action/orgAction';
import { createBridgeAction } from '@/store/action/bridgeAction';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/loadingSpinner';

function Page() {
    const dispatch = useDispatch();
    const route = useRouter();
    const [bridgeName, setBridgeName] = useState('');
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [bridgeType, setBridgeType] = useState('api');
    const [selectedService, setSelectedService] = useState('openai');
    const [selectedModel, setSelectedModel] = useState("gpt-4o");
    const [selectedModelType, setSelectedModelType] = useState('chat')
    const [slugName, setSlugName] = useState('');
    const [isLoading,setIsLoading] = useState(false);
    const organizations = useCustomSelector(state => state.userDetailsReducer.organizations);
    const { modelsList } = useCustomSelector((state) => ({
        modelsList: state?.modelReducer?.serviceModels[selectedService],
    }));

    useEffect(() => {
        if (selectedService) {
            dispatch(getModelAction({ service: selectedService }))
        }
    }, [selectedService]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOrg || !bridgeName.trim()) {
            return alert('Please select an organization and enter a bridge name');
        }
        if (bridgeType === 'chatbot' && !slugName.trim()) {
            return alert('Please enter a slug name for chatbot');
        }
        try {
            setIsLoading(true);
            // Switch organization
            const response = await switchOrg(selectedOrg.id);

            // Handle local environment
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

            // Prepare and send bridge data
            const bridgeData = {
                service: selectedService,
                model: selectedModel,
                name: bridgeName,
                slugName: slugName || bridgeName,
                bridgeType: bridgeType,
                type: selectedModelType,
            };

            const createBridgePromise = new Promise((resolve, reject) => {
                dispatch(createBridgeAction({
                    dataToSend: bridgeData,
                    orgid: selectedOrg.id
                }, (data) => {
                    // Wait for state to update before navigating
                    setTimeout(() => {
                        route.push(`/org/${selectedOrg.id}/bridges/configure/${data.data.bridge._id}?version=${data.data.bridge.versions[0]}`);
                        resolve();
                    }, 100); // Small delay to ensure state updates
                })).catch(reject);
            });

            await createBridgePromise;

        } catch (error) {
            console.error("Error:", error.message || error);
            toast.error(error.message || "An error occurred");
        } finally {
            // Reset form fields
            setSelectedService("openai");
            setSelectedModel("gpt-4o");
            setSelectedModelType("chat");
            setBridgeType("api");
        }
    };

    const handleSelectOrg = (orgId, orgName) => {
        setSelectedOrg({ id: orgId, name: orgName });
    };

    const handleService = (e) => {
        setSelectedService(e.target.value);
        setSelectedModel(DEFAULT_MODEL[e.target.value]);
        setSelectedModelType("chat")
    };

    const filteredOrganizations = filterOrganizations(organizations, searchQuery);

    const renderedOrganizations = useMemo(() => (
        filteredOrganizations.slice().reverse().map((org, index) => (
            <div
                key={index}
                onClick={() => handleSelectOrg(org.id, org.name)}
                className={`bg-white shadow-lg rounded-lg overflow-hidden transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${selectedOrg?.id === org.id ? 'ring-2 ring-blue-500' : ''
                    }`}
            >
                <div className="px-6 py-4">
                    <div className="font-bold text-xl mb-2">{org.name}</div>
                </div>
            </div>
        ))
    ), [filteredOrganizations, selectedOrg]);

    return (
        isLoading ? (
            <LoadingSpinner />
        ) : (
            <div className="flex max-h-[100vh] bg-gray-100 p-8">
                <div className="w-1/3 bg-white rounded-lg shadow-lg p-6 mr-4">
                    <h2 className="text-xl font-semibold mb-4">Select Organization</h2>
                    <input
                        type="text"
                        placeholder="Search organizations"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="space-y-2 max-h-[80vh] overflow-x-hidden overflow-y-auto p-2">
                        {renderedOrganizations}
                    </div>
                </div>

                <div className="w-2/3 bg-white rounded-lg shadow-lg pt-24 px-44 pb-48 max-auto">
                    <div className="flex flex-col space-y-6 border border-gray-200 rounded-lg p-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h2 className="text-xl font-semibold text-blue-800">Create New Bridge</h2>
                            <p className="text-sm text-blue-600 mt-1">Set up a new bridge to connect your services</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="form-control">
                                <div className="label">
                                    <span className="label-text font-medium">Used as</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <label className="label cursor-pointer gap-2">
                                        <input
                                            type="radio"
                                            name="bridgeType"
                                            className="radio radio-primary"
                                            value="api"
                                            checked={bridgeType === "api"}
                                            onChange={() => setBridgeType('api')}
                                            required
                                        />
                                        <span className="label-text">API</span>
                                    </label>
                                    <label className="label cursor-pointer gap-2">
                                        <input
                                            type="radio"
                                            name="bridgeType"
                                            className="radio radio-black"
                                            value="chatbot"
                                            checked={bridgeType === "chatbot"}
                                            onChange={() => setBridgeType('chatbot')}
                                            required
                                        />
                                        <span className="label-text">ChatBot</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Bridge Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={bridgeName}
                                        onChange={(e) => setBridgeName(e.target.value)}
                                        className="input input-bordered w-full focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter bridge name"
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Select Service</span>
                                    </label>
                                    <select
                                        value={selectedService}
                                        onChange={handleService}
                                        className="select select-bordered w-full focus:ring-2 focus:ring-blue-500"
                                    >
                                        {SERVICES.map((service, index) => (
                                            <option key={index} value={service}>{service}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Pick a model</span>
                                    </label>
                                    <select
                                        value={selectedModel}
                                        onChange={(e) => {
                                            setSelectedModel(e.target.value);
                                            setSelectedModelType(e.target.selectedOptions[0].parentNode.label);
                                        }}
                                        className="select select-bordered w-full focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option disabled></option>
                                        {Object.entries(modelsList || {}).map(([group, options], groupIndex) => {
                                            if (group !== 'models') {
                                                return (
                                                    <optgroup label={group} key={`group_${groupIndex}`}>
                                                        {Object.keys(options || {}).map((option, optionIndex) => {
                                                            const modelName = options?.[option]?.configuration?.model?.default;
                                                            return (
                                                                <option key={`option_${groupIndex}_${optionIndex}`}>
                                                                    {modelName}
                                                                </option>
                                                            );
                                                        })}
                                                    </optgroup>
                                                );
                                            }
                                            return null;
                                        })}
                                    </select>
                                </div>

                                {bridgeType === 'chatbot' && (
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">Slug Name</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={slugName}
                                            onChange={(e) => setSlugName(e.target.value)}
                                            className="input input-bordered w-full focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter slug name"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full mt-6 py-3 text-lg"
                            >
                                Create Bridge
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    );
}

export default Protected(Page);
