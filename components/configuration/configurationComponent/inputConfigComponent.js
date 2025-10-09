import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { generateRandomID, openModal } from '@/utils/utility';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import PromptSummaryModal from '../../modals/PromptSummaryModal';
import ToneDropdown from './toneDropdown';
import ResponseStyleDropdown from './responseStyleDropdown';
import { ChevronDownIcon, InfoIcon } from '@/components/Icons';
import InfoTooltip from '@/components/InfoTooltip';
import Diff_Modal from '@/components/modals/Diff_Modal';


const COLLAPSED_MIN_HEIGHT = 200;
const COLLAPSED_MAX_HEIGHT = 384;
const FULLSCREEN_TOP_OFFSET = 60;

const InputConfigComponent = ({ 
    params, 
    searchParams, 
    promptTextAreaRef, 
    // PromptHelper props
    isPromptHelperOpen,
    setIsPromptHelperOpen,
    prompt,
    setPrompt,
    setThreadId,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    setNewContent,
    handleCloseTextAreaFocus,
    savePrompt,
    isMobileView,
    newContent
}) => {
    const { prompt: reduxPrompt, service, serviceType, variablesKeyValue, bridge } = useCustomSelector((state) => ({
        prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.prompt || "",
        serviceType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.type || "",
        service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.service || "",
        variablesKeyValue: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.variables || [],
        bridge: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version] || ""
    }));
    
    const [oldContent, setOldContent] = useState(reduxPrompt);
    const textareaRef = useRef(null);
    const editorRef = useRef(null);
    const easyMDERef = useRef(null);
    const editorContainerRef = useRef(null);
    const changeUpdateTimerRef = useRef(null);
    const promptSyncTimerRef = useRef(null);
    const initialPromptRef = useRef(prompt);
    const [editorHeight, setEditorHeight] = useState(null);
    // Separate effect to update EasyMDE when reduxPrompt changes
    useEffect(() => {
        if (easyMDERef.current && easyMDERef.current.value() !== reduxPrompt) {
            // Store cursor position before updating value
            const cmInstance = easyMDERef.current.codemirror;
            const cursorPos = cmInstance.getCursor();
            
            // Temporarily disable change event to avoid infinite loop
            const currentValue = easyMDERef.current.value();
            if (currentValue !== reduxPrompt && !hasUnsavedChanges) {
                // Only update if there are no unsaved changes to prevent cursor jumping
                easyMDERef.current.value(reduxPrompt);
                if (editorRef.current) {
                    editorRef.current.value = reduxPrompt;
                }
                setPrompt(reduxPrompt);
                setHasUnsavedChanges(false);
                
                // Restore cursor position after a brief delay
                setTimeout(() => {
                    if (cmInstance && cursorPos) {
                        cmInstance.setCursor(cursorPos);
                    }
                }, 10);
            }
        } else if (!easyMDERef.current) {
            // If editor not initialized yet, just update the state
            setOldContent(reduxPrompt);
            setThreadId(bridge?.thread_id || generateRandomID());
            initialPromptRef.current = reduxPrompt;
            if (editorRef.current) {
                editorRef.current.value = reduxPrompt;
            }
        }
    }, [reduxPrompt, bridge?.thread_id, hasUnsavedChanges]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (hasUnsavedChanges) {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    useEffect(() => {
        const handleResize = () => {
            const isSmallScreen = window.innerWidth < 710;
            if (!isMobileView && !isSmallScreen && typeof window.openTechDoc === 'function' && isPromptHelperOpen) {
                window.openTechDoc();
            } else if (isMobileView && isSmallScreen && typeof window.closeTechDoc === 'function') {
                window.closeTechDoc();
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isMobileView, isPromptHelperOpen]);    

    const updateEditorLayout = useCallback(() => {
        if (typeof window === 'undefined') return;

        const viewportHeight = window.innerHeight;
        const fullscreenTargetHeight = Math.max(320, viewportHeight - FULLSCREEN_TOP_OFFSET);

        let nextHeight;

        if (isPromptHelperOpen) {
            nextHeight = fullscreenTargetHeight;
        } else {
            const containerElement = editorContainerRef.current;
            const containerRect = containerElement?.getBoundingClientRect();
            const containerTop = containerRect?.top ?? 0;
            const bottomOffset = 24;
            const computedHeight = viewportHeight - containerTop - bottomOffset;
            const maxHeight = COLLAPSED_MAX_HEIGHT;
            const minHeight = COLLAPSED_MIN_HEIGHT;
            nextHeight = Number.isFinite(computedHeight)
                ? Math.min(Math.max(minHeight, computedHeight), maxHeight)
                : maxHeight;
        }

        setEditorHeight((prev) => (prev === nextHeight ? prev : nextHeight));

        if (easyMDERef.current) {
            const cmInstance = easyMDERef.current.codemirror;
            const wrapperEl = cmInstance.getWrapperElement();
            const scrollerEl = cmInstance.getScrollerElement();
            const sizerEl = wrapperEl?.querySelector('.CodeMirror-sizer');
            const appliedMaxHeight = isPromptHelperOpen ? fullscreenTargetHeight : COLLAPSED_MAX_HEIGHT;

            cmInstance.setSize('100%', nextHeight);

            [wrapperEl, scrollerEl, sizerEl].forEach((el) => {
                if (!el) return;
                el.style.height = `${nextHeight}px`;
                el.style.maxHeight = `${appliedMaxHeight}px`;
                el.style.minHeight = isPromptHelperOpen ? `${fullscreenTargetHeight}px` : '';
                if (el === scrollerEl) {
                    el.style.paddingBottom = '20px';
                }
            });

            cmInstance.refresh();
        }
    }, [isPromptHelperOpen, prompt]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            window.requestAnimationFrame(updateEditorLayout);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [updateEditorLayout]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (easyMDERef.current) {
                easyMDERef.current.codemirror.refresh();
            }
            updateEditorLayout();
        }, 150);

        return () => clearTimeout(timeoutId);
    }, [isPromptHelperOpen, updateEditorLayout]);

    const handleSavePrompt = useCallback(() => {
        savePrompt(prompt);
        setOldContent(prompt);
        setNewContent('');
        setHasUnsavedChanges(false);
        handleCloseTextAreaFocus();
    }, [prompt, savePrompt, handleCloseTextAreaFocus]);

    const handleOpenDiffModal = () => {
        openModal(MODAL_TYPE?.DIFF_PROMPT);
    };
    useEffect(() => {
        if (!easyMDERef.current) {
            initialPromptRef.current = prompt;
            if (editorRef.current) {
                editorRef.current.value = prompt;
            }
        }
    }, [prompt]);

    useEffect(() => {
        if (!easyMDERef.current) return;

        if (promptSyncTimerRef.current) {
            clearTimeout(promptSyncTimerRef.current);
        }

        promptSyncTimerRef.current = setTimeout(() => {
            const editorInstance = easyMDERef.current;
            if (!editorInstance) return;

            const nextValue = typeof prompt === 'string' ? prompt : (reduxPrompt || '');
            if (editorInstance.value() !== nextValue && !hasUnsavedChanges) {
                // Store cursor position before updating
                const cmInstance = editorInstance.codemirror;
                const cursorPos = cmInstance.getCursor();
                
                editorInstance.value(nextValue);
                editorInstance.codemirror.refresh();
                if (editorRef.current) {
                    editorRef.current.value = nextValue;
                }
                
                // Restore cursor position
                setTimeout(() => {
                    if (cmInstance && cursorPos) {
                        cmInstance.setCursor(cursorPos);
                    }
                }, 10);
            }
        }, 120);

        return () => {
            if (promptSyncTimerRef.current) {
                clearTimeout(promptSyncTimerRef.current);
                promptSyncTimerRef.current = null;
            }
        };
    }, [prompt, reduxPrompt, hasUnsavedChanges]);

    useEffect(() => {
        if (editorRef.current && !easyMDERef.current) {
            const easyMDE = new EasyMDE({
                element: editorRef.current,
                initialValue: initialPromptRef.current || '',
                spellChecker: false,
                status: false,
                toolbar: false, // Remove toolbar completely
                placeholder: 'Enter your prompt here...',
                autofocus: false,
                tabSize: 4,
                indentWithTabs: false,
                lineWrapping: true,
                styleSelectedText: false,
                forceSync: true
            });
            
            // Add bottom padding to the editor's scroller element
            const scrollerEl = easyMDE.codemirror.getScrollerElement();
            if (scrollerEl) {
                scrollerEl.style.paddingBottom = '20px';
            }
            easyMDE.codemirror.on('change', (instance, changeObj) => {
                const value = easyMDE.value();
                if (editorRef.current) {
                    editorRef.current.value = value;
                }
                // Debounce updates to allow editor to settle and avoid rapid state churn
                if (changeUpdateTimerRef.current) {
                    clearTimeout(changeUpdateTimerRef.current);
                }
                changeUpdateTimerRef.current = setTimeout(() => {
                    setPrompt(value);
                    // Use a callback to get the latest reduxPrompt value
                    setHasUnsavedChanges(prev => {
                        const currentReduxPrompt = reduxPrompt;
                        return value.trim() !== currentReduxPrompt.trim();
                    });
                }, 250);
            });

            easyMDE.codemirror.on('focus', () => {
                if (!isPromptHelperOpen && window.innerWidth>710) {
                    setIsPromptHelperOpen(true);
                    if (typeof window.closeTechDoc === 'function') {
                        window.closeTechDoc();
                    }
                }
            });


            easyMDERef.current = easyMDE;
            textareaRef.current = easyMDE.codemirror.getInputField();
            if (typeof window !== 'undefined') {
                window.requestAnimationFrame(() => {
                    updateEditorLayout();
                });
            }
        }

        return () => {
            if (changeUpdateTimerRef.current) {
                clearTimeout(changeUpdateTimerRef.current);
            }
            if (promptSyncTimerRef.current) {
                clearTimeout(promptSyncTimerRef.current);
                promptSyncTimerRef.current = null;
            }
            if (easyMDERef.current) {
                easyMDERef.current.toTextArea();
                easyMDERef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only initialize once

    

    if (service === "google" && serviceType === "chat") return null;
      console.log(isPromptHelperOpen,"hello")
    return (
        <div ref={promptTextAreaRef} className="pb-6">
            <div className="flex justify-between items-center mb-2">
                <div className="label flex items-center gap-2">
                    <span className="label-text capitalize font-medium">Prompt</span>
                    <div className="h-4 w-px bg-base-300 mx-2"></div>
                    <div className="flex items-center justify-center">
                        <button
                            onClick={() => {
                                openModal(MODAL_TYPE?.PROMPT_SUMMARY);
                            }}
                        >
                            <InfoTooltip tooltipContent={"Prompt Summary is a brief description of the agent's prompt and applies to all versions of the agent, not just one."}>
                                <span className='label-text  capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text'>Prompt Summary</span>
                            </InfoTooltip>
                        </button>

                    </div>
                </div>

                <div
                    className="label cursor-pointer gap-1 sm:gap-2"
                >
                    <button
                        className={`btn btn-sm ${hasUnsavedChanges ? 'btn-primary' : 'btn-disabled'}`}
                        onClick={handleSavePrompt}
                        disabled={!hasUnsavedChanges || prompt.trim() === reduxPrompt.trim()}
                    >
                        Save
                    </button>
                    {isPromptHelperOpen &&
                        <>
                            {!isMobileView && <button
                                className={`btn text-xs sm:text-sm btn-sm`}
                                onClick={handleOpenDiffModal}
                            >
                                Diff
                            </button>}
                            
                        </>}

                </div>
            </div>
            <div className="form-control h-full">
                <div
                    ref={editorContainerRef}
                    className={`relative w-full EasyMDEContainer transition-all duration-300 ${
                        isPromptHelperOpen
                            ? "fixed left-0 right-0 bottom-0 z-40 bg-base-100 pb-4"
                            : "relative max-h-[384px]"
                    }`}
                    style={{
                        height: editorHeight ? `${editorHeight}px` : undefined,
                        maxHeight: !isPromptHelperOpen ? `${COLLAPSED_MAX_HEIGHT}px` : undefined,
                        paddingBottom: isPromptHelperOpen ? '20px' : undefined,
                    }}
                >
                    <textarea
                        ref={editorRef}
                        className="hidden"
                        defaultValue={prompt}
                    />
                </div>
                <div className="collapse bg-gradient-to-r bg-base-1 border-t-0 border border-base-300 rounded-t-none">
                    <input type="checkbox" className="min-h-[0.75rem]" />
                    <div className="collapse-title min-h-[0.75rem] text-xs font-medium flex items-center gap-1 p-2">
                        <div className="flex items-center gap-2 ">
                            <span className="text-nowrap">Default Variables</span>
                            <p role="alert" className="label-text-alt alert p-2 bg-base-200">
                                <InfoIcon size={16} className="" />
                                Use these variables in prompt to get their functionality
                            </p>
                        </div>
                        <div className="ml-auto">
                            <ChevronDownIcon className="collapse-arrow" size={12} />
                        </div>
                    </div>
                    <div className="collapse-content">
                        <div className="text-xs">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 bg-black rounded-full"></span>
                                    <span>&#123;&#123;current_time_and_date&#125;&#125;</span>
                                    <span className="ml-2">- To access the current date and time</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 bg-black rounded-full"></span>
                                    <span>&#123;&#123;pre_function&#125;&#125;</span>
                                    <span>- Use this variable if you are using the pre_function</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 bg-black  rounded-full"></span>
                                    <span>&#123;&#123;timezone&#125;&#125;</span>
                                    <span>- Access the timezone using a timezone identifier</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <span>
                                        Use custom variables like <code>&#123;&#123;your_custom_variable&#125;&#125;</code>, created from the <strong>Add Variable</strong> section, to insert dynamic values.
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-base-300 space-y-2">
                                <div className="font-medium">Prompt formatting tips (Markdown)</div>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-medium">Headings</span>: <code># H1</code>, <code>## H2</code>, <code>### H3</code></li>
                                    <li><span className="font-medium">Bold</span>: <code>**bold**</code>  <span className="font-medium">Italic</span>: <code>*italic*</code></li>
                                    <li><span className="font-medium">Lists</span>: <code>- item</code> or numbered <code>1. item</code></li>
                                    <li><span className="font-medium">Inline code</span>: <code>`code`</code></li>
                                </ul>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex flex-row gap-2 mt-8'>
                <ToneDropdown params={params} searchParams={searchParams} />
                <ResponseStyleDropdown params={params} searchParams={searchParams} />
            </div>

            <Diff_Modal oldContent={oldContent} newContent={newContent} />
            <PromptSummaryModal modalType={MODAL_TYPE.PROMPT_SUMMARY} params={params} searchParams={searchParams} />

        </div>
    );
};

export default InputConfigComponent;
