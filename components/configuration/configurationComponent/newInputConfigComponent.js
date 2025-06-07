import CreateVariableModal from '@/components/modals/createVariableModal';
import OptimizePromptModal from '@/components/modals/optimizePromptModal';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { openModal } from '@/utils/utility';
import { ChevronDown, Info } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import PromptSummaryModal from '../../modals/PromptSummaryModal';
import ToneDropdown from './toneDropdown';
import ResponseStyleDropdown from './responseStyleDropdown'; // Import the new component
import { Maximize, Minimize } from 'lucide-react';
const NewInputConfigComponent = ({ params }) => {
    const { prompt } = useCustomSelector((state) => ({
        prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.prompt || "",
    }));
    const divRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const dispatch = useDispatch();

    const savePrompt = useCallback((e) => {
        const newValue = e.target?.value || "";
        if (newValue !== prompt) {
            dispatch(updateBridgeVersionAction({ versionId: params.version, dataToSend: { configuration: { prompt: newValue } } }));
        }
    }, [dispatch, params.version, prompt]);

    const toggleFullscreen = () => {
        setIsFullscreen(prev => !prev);
    };

    const handleScriptLoad = () => {
        if (typeof window.sendDataToDocstar === 'function') {
            window.sendDataToDocstar({
                parentId: 'docStar-embed',
                page_id: params.version,
                content: prompt,
            });
            window.openTechDoc();
        } else {
            console.warn('sendDataToDocstar is not defined yet.');
        }
    };
    useEffect(() => {
        setTimeout(() => {
            handleScriptLoad();
        }, 2000);
    }, [prompt, params]);

    useEffect(() => {
        window.addEventListener('message', (event) => {
            if (event.origin === "https://app.docstar.io") {
                console.log(event?.data)
            }
        });
    },)

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <div className="label flex items-center gap-2">
                    <span className="label-text capitalize font-medium">Prompt</span>
                    <div className="h-4 w-px bg-gray-300 mx-2"></div>
                    <div className="flex items-center justify-center">
                        <button
                            className="label-text capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text"
                            onClick={() => {
                                openModal(MODAL_TYPE?.PROMPT_SUMMARY);
                            }}
                        >
                            <span>Prompt Summary</span>
                        </button>
                        <div
                            className="tooltip tooltip-right"
                            data-tip={
                                "Prompt summary is only for the agent not for the Versions"
                            }
                        >
                            <Info size={12} className="ml-2" />
                        </div>
                    </div>
                </div>
                <div className='flex gap-4'>
                    <div
                        className="label cursor-pointer"
                        onClick={() => openModal(MODAL_TYPE.OPTIMIZE_PROMPT)}
                    >
                        <span className="label-text capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text">
                            Optimize Prompt
                        </span>
                    </div>
                </div>
            </div>
            <div className="form-control ">
                <div
                    ref={divRef}
                    className={`relative transition-all duration-300 ${isFullscreen
                            ? 'fixed inset-0 w-full h-screen'
                            : 'h-80 w-full'
                        }`}
                >
                    <div
                        id="docStar-embed"
                        className="w-full z-0 h-full"
                    />

                    <div className="absolute top-4 right-4 z-[9999] group">
                        <button
                            onClick={toggleFullscreen}
                            className="text-base-content bg-base-300 p-2 rounded-full transition"
                        >
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>

                        <span className="absolute -top-8 right-1 scale-0 group-hover:scale-100 bg-gray-800 text-white text-xs px-2 py-1 rounded transition-transform duration-200">
                            {isFullscreen ? 'Minimize' : 'Maximize'}
                        </span>
                    </div>
                </div>
            </div>
            <div className='flex mt-2'>
                <ToneDropdown params={params} />
                <ResponseStyleDropdown params={params} />
            </div>
            {/* <CreateVariableModal keyName={keyName} setKeyName={setKeyName} params={params} /> */}
            <OptimizePromptModal params={params} />
            <PromptSummaryModal params={params} />
        </div>
    );
};

export default NewInputConfigComponent;
