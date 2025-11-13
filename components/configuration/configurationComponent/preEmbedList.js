import { useCustomSelector } from '@/customHooks/customSelector';
import { updateApiAction, updateBridgeVersionAction, updateFuntionApiAction } from '@/store/action/bridgeAction';
import { closeModal, getStatusClass, openModal } from '@/utils/utility';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import EmbedListSuggestionDropdownMenu from './embedListSuggestionDropdownMenu';
import FunctionParameterModal from './functionParameterModal';
import { MODAL_TYPE } from '@/utils/enums';
import RenderEmbed from './renderEmbed';
import InfoTooltip from '@/components/InfoTooltip';
import { isEqual } from 'lodash';
import { AddIcon } from '@/components/Icons';
import DeleteModal from '@/components/UI/DeleteModal';
import useDeleteOperation from '@/customHooks/useDeleteOperation';
import { CircleQuestionMark } from 'lucide-react';

const PreEmbedList = ({ params, searchParams }) => {
    const [preFunctionData, setPreFunctionData] = useState(null);
    const [preFunctionId, setPreFunctionId] = useState(null);
    const [preFunctionName, setPreFunctionName] = useState(null);
    const [preToolData, setPreToolData] = useState(null);
    const [variablesPath, setVariablesPath] = useState({});
    const { integrationData, function_data, bridge_pre_tools, shouldToolsShow, model, embedToken, variables_path } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
        const orgData = state?.bridgeReducer?.org?.[params?.org_id];
        const modelReducer = state?.modelReducer?.serviceModels;
        const serviceName = versionData?.service;
        const modelTypeName = versionData?.configuration?.type?.toLowerCase();
        const modelName = versionData?.configuration?.model;
        return {
            integrationData: orgData?.integrationData || {},
            function_data: orgData?.functionData || {},
            bridge_pre_tools: versionData?.pre_tools || [],
            modelType: modelTypeName,
            model: modelName,
            service: serviceName,
            shouldToolsShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.tools,
            embedToken: orgData?.embed_token,
            variables_path: versionData?.variables_path || {},
        };
    });
    const dispatch = useDispatch();
    
    // Delete operation hook
    const { isDeleting, executeDelete } = useDeleteOperation(MODAL_TYPE.DELETE_PRE_TOOL_MODAL);
    
    const bridgePreFunctions = useMemo(() => bridge_pre_tools.map((id) => function_data?.[id]), [bridge_pre_tools, function_data, params]);
    const handleOpenModal = (functionId) => {
        setPreFunctionId(functionId);
        setPreFunctionName(function_data?.[functionId]?.function_name || function_data?.[functionId]?.endpoint);
        setPreToolData(function_data?.[functionId]);
        setPreFunctionData(function_data?.[functionId]);
        setVariablesPath(variables_path[preFunctionName] || {});
        openModal(MODAL_TYPE.PRE_FUNCTION_PARAMETER_MODAL)
    }
   const handleOpenDeleteModal = (functionId, functionName) => {
        setPreFunctionId(functionId);
        setPreFunctionName(functionName);
        openModal(MODAL_TYPE.DELETE_PRE_TOOL_MODAL);
    };
    const onFunctionSelect = (id) => {
        dispatch(updateApiAction(params.id, {
            pre_tools: [id],
            version_id: searchParams?.version
        }));
        // Close dropdown after selection
        setTimeout(() => {
            if (typeof document !== 'undefined') {
                document.activeElement?.blur?.();
            }
        }, 0);
    }

    const removePreFunction = async () => {
        await executeDelete(async () => {
            return dispatch(updateApiAction(params.id, {
                pre_tools: [],
                version_id: searchParams?.version
            }));
        });
    }

    const handleChangePreTool = () => {
        // Focus on the pre-tool dropdown to allow user to select a different pre-tool
        setTimeout(() => {
            // Look for the EmbedListSuggestionDropdownMenu dropdown
            const dropdown = document.querySelector('.dropdown-right .dropdown-left');
            if (dropdown) {
                // Find the dropdown content with tabIndex
                const dropdownContent = dropdown.querySelector('ul[tabindex="0"]');
                if (dropdownContent) {
                    dropdownContent.focus();
                    // Trigger the dropdown to open by adding the 'dropdown-open' class
                    dropdown.classList.add('dropdown-open');
                    
                    // Function to close dropdown and cleanup
                    const closeDropdown = () => {
                        dropdown.classList.remove('dropdown-open');
                        document.removeEventListener('click', handleClickOutside);
                        document.removeEventListener('click', handleDropdownItemClick);
                    };

                    // Add click outside handler to close dropdown
                    const handleClickOutside = (event) => {
                        if (!dropdown.contains(event.target)) {
                            closeDropdown();
                        }
                    };

                    // Add click handler for dropdown items (selection)
                    const handleDropdownItemClick = (event) => {
                        // Check if clicked element is a dropdown item (li or button inside dropdown)
                        const clickedItem = event.target.closest('li');
                        if (clickedItem && dropdown.contains(clickedItem)) {
                            // Close dropdown after selection
                            setTimeout(() => closeDropdown(), 100);
                        }
                    };
                    
                    // Add the event listeners after a small delay to avoid immediate closure
                    setTimeout(() => {
                        document.addEventListener('click', handleClickOutside);
                        document.addEventListener('click', handleDropdownItemClick);
                    }, 50);
                    
                    // Also focus on the search input for better UX
                    const searchInput = dropdownContent.querySelector('input');
                    if (searchInput) {
                        setTimeout(() => searchInput.focus(), 100);
                    }
                }
            }
        }, 100);
    }
    const handleSavePreFunctionData = () => {
        if (!isEqual(preToolData, preFunctionData)) {
            const { _id, ...dataToSend } = preToolData;
            dispatch(
                updateFuntionApiAction({
                    function_id: preFunctionId,
                    dataToSend: dataToSend,
                })
            );
            setPreToolData("");
        }
        if (!isEqual(variablesPath, variables_path[preFunctionName])) {
            dispatch(
                updateBridgeVersionAction({
                    bridgeId: params.id,
                    versionId: searchParams?.version,
                    dataToSend: { variables_path: { [preFunctionName]: variablesPath } },
                })
            );
        }
    };

    return (
        <>
            <div>
                <FunctionParameterModal
                    name="Pre Tool"
                    functionId={preFunctionId}
                    Model_Name={MODAL_TYPE.PRE_FUNCTION_PARAMETER_MODAL}
                    embedToken={embedToken}
                    handleSave={handleSavePreFunctionData}
                    toolData={preToolData}
                    setToolData={setPreToolData}
                    function_details={preFunctionData}
                    functionName={preFunctionName}
                    variablesPath={variablesPath}
                    setVariablesPath={setVariablesPath}
                    variables_path={variables_path}
                />
                <DeleteModal
                    onConfirm={removePreFunction}
                    item={preFunctionId}
                    name={preFunctionName}
                    title="Are you sure?"
                    description={"This action Remove the selected Pre Tool from the Agent."}
                    buttonTitle="Remove Pre Tool"
                    modalType={MODAL_TYPE.DELETE_PRE_TOOL_MODAL}
                    loading={isDeleting}
                    isAsync={true}
                />

                <div className="w-full max-w-md gap-2 flex flex-col px-2 py-2 cursor-default">
                    <div className="dropdown dropdown-right w-full flex items-center">
                        {bridge_pre_tools.length > 0 ? (
                            <div className="flex items-center gap-1 mb-2">
                                <p className="font-medium whitespace-nowrap">Pre Tool</p>
                                <InfoTooltip tooltipContent="A prefunction prepares data before passing it to the main function for the GPT call.">
                                    <CircleQuestionMark size={14} className="text-gray-500 hover:text-gray-700 cursor-help" />
                                </InfoTooltip>
                            </div>
                        ) : (
                            <InfoTooltip tooltipContent="A prefunction prepares data before passing it to the main function for the GPT call.">


                                <button
                                tabIndex={0}
                                className=" flex items-center gap-1 px-3 py-1 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-lg active:scale-95 transition-all duration-150 mb-2"
                            >
                                <AddIcon className="w-4 h-4" />
                                <p className="label-text font-medium whitespace-nowrap">Pre Tool</p>
                            </button>
                            </InfoTooltip>
                        )}
                        <EmbedListSuggestionDropdownMenu
                            params={params}
                            searchParams={searchParams}
                            name={"preFunction"}
                            hideCreateFunction={false}
                            onSelect={onFunctionSelect}
                            connectedFunctions={bridge_pre_tools}
                            shouldToolsShow={true}
                            modelName={model}
                        />
                    </div>
                    <div className="w-full">
                        <RenderEmbed
                            bridgeFunctions={bridgePreFunctions}
                            integrationData={integrationData}
                            getStatusClass={getStatusClass}
                            handleOpenModal={handleOpenModal}
                            embedToken={embedToken}
                            params={params}
                            name="preFunction"
                            handleRemoveEmbed={removePreFunction}
                            handleOpenDeleteModal={handleOpenDeleteModal}
                            handleChangePreTool={handleChangePreTool}
                            halfLength={1}
                        />
                    </div>


                </div>
            </div>
        </>
    );
}

export default PreEmbedList