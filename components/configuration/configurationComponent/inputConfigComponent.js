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
import Link from 'next/link';
import ToneDropdown from './toneDropdown'; 
import ResponseStyleDropdown from './responseStyleDropdown'; // Import the new component

const InputConfigComponent = ({ params }) => {
    const { prompt: reduxPrompt, service, serviceType, variablesKeyValue } = useCustomSelector((state) => ({
        prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.prompt || "",
        serviceType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.type || "",
        service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.service || "",
        variablesKeyValue: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.variables || [],
    }));

    const [keyName, setKeyName] = useState('');
    const suggestionListRef = useRef(null);
    const textareaRef = useRef(null);
    const [prompt, setPrompt] = useState(reduxPrompt);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const dispatch = useDispatch();

    useEffect(() => {
        setPrompt(reduxPrompt);
    }, [reduxPrompt]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (prompt !== reduxPrompt) {
                event.preventDefault();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [prompt, reduxPrompt]);

    const savePrompt = useCallback((e) => {
        const newValue = e.target?.value || "";
        setShowSuggestions(false);
        if (newValue !== reduxPrompt) {
            // dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: { prompt: newValue } } }));
            dispatch(updateBridgeVersionAction({ versionId: params.version, dataToSend: { configuration: { prompt: newValue } } }));
        }
    }, [dispatch, params.version, reduxPrompt]);

    const getCaretCoordinatesAdjusted = () => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            const { selectionStart, scrollTop, scrollLeft, offsetTop, offsetLeft } = textarea;

            // Create a temporary element
            const div = document.createElement('div');
            document.body.appendChild(div);

            // Copy the styles of the textarea to the temporary div
            const styles = window.getComputedStyle(textarea);
            for (let style of styles) {
                div.style[style] = styles.getPropertyValue(style);
            }

            // Set specific styles for accurate position calculation
            div.style.position = 'absolute';
            div.style.visibility = 'hidden';
            div.style.whiteSpace = 'pre-wrap';
            div.style.overflow = 'hidden';

            // Copy text up to the caret position to the div
            const text = textarea.value.substring(0, selectionStart);
            div.textContent = text;

            // Insert a special character to mark the caret position
            const caretMarker = document.createElement('span');
            caretMarker.textContent = '|';
            div.appendChild(caretMarker);

            // Get the position of the caret marker
            const { offsetTop: markerTop, offsetLeft: markerLeft } = caretMarker;

            // Clean up by removing the temporary element
            document.body.removeChild(div);

            return {
                top: markerTop + offsetTop - scrollTop,
                left: markerLeft + offsetLeft - scrollLeft,
            };
        }

        return { top: 0, left: 0 };
    };

    const handlePromptChange = useCallback((e) => {
        const value = e.target.value;
        setPrompt(value);

        const cursorPos = e.target.selectionStart;
        const lastChar = value.slice(cursorPos - 1, cursorPos);
        const lastTwoChars = value.slice(cursorPos - 2, cursorPos);

        if (lastChar === '{' || lastTwoChars === '{{') {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (!suggestionListRef.current) return;

        const suggestionItems = suggestionListRef.current.querySelectorAll('.list-item');
        const totalItems = suggestionItems.length;
        if (totalItems === 0) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveSuggestionIndex((prevIndex) => {
                return e.key === 'ArrowDown'
                    ? (prevIndex + 1) % totalItems
                    : (prevIndex - 1 + totalItems) % totalItems;
            });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            suggestionItems[activeSuggestionIndex]?.click();
        }
    }, [activeSuggestionIndex]);

    const handleSuggestionClick = useCallback((suggestion) => {
        const textarea = textareaRef.current;
        const cursorPosition = textarea.selectionStart;

        let newPrompt;
        let newCursorPosition;

        if (suggestion === 'add_variable') {
            const handleTabKey = (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    // Find the last `{{` before the cursor position
                    const start = textarea.value.lastIndexOf('{{', cursorPosition);
                    // Find the first `}}` after the cursor position
                    const end = textarea.value.indexOf('}}', cursorPosition);

                    // Ensure both `{{` and `}}` exist
                    if (start !== -1 && end !== -1) {
                        // Extract the text between `{{` and `}}`
                        const textBetweenBraces = textarea.value.slice(start + 2, end);

                        setKeyName(textBetweenBraces);
                        openModal(MODAL_TYPE.CREATE_VARIABLE)
                    }
                    // Remove event listener after showing modal
                    textarea.removeEventListener('keydown', handleTabKey);
                }
            };

            textarea.addEventListener('keydown', handleTabKey);
            const isDoubleBrace = prompt.slice(cursorPosition - 2, cursorPosition) === '{{';
            const beforeCursor = isDoubleBrace ? prompt.slice(0, cursorPosition - 2) : prompt.slice(0, cursorPosition - 1);
            const afterCursor = prompt.slice(cursorPosition);
            newPrompt = `${beforeCursor}{{}}${afterCursor}`;
            // newCursorPosition = cursorPosition + 1; // Position cursor between the brackets
            newCursorPosition = isDoubleBrace ? cursorPosition : cursorPosition + 1;
        } else {
            const isDoubleBrace = prompt.slice(cursorPosition - 2, cursorPosition) === '{{';
            const beforeCursor = isDoubleBrace ? prompt.slice(0, cursorPosition - 2) : prompt.slice(0, cursorPosition - 1);
            const afterCursor = prompt.slice(cursorPosition);
            newPrompt = `${beforeCursor}{{${suggestion}}}${afterCursor}`;
            newCursorPosition = beforeCursor.length + suggestion.length + 4; // Adjust for `{{}}`
        }

        setPrompt(newPrompt);
        setShowSuggestions(false);
        setActiveSuggestionIndex(0);

        textarea.focus();

        setTimeout(() => {
            textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);
    }, [prompt]);

    const handleMouseDownOnSuggestion = useCallback((e) => {
        e.preventDefault();
    }, []);

    const renderSuggestions = () => {
        return (
            <div className="dropdown dropdown-open z-[999999]" style={{
                position: 'absolute',
                top: getCaretCoordinatesAdjusted().top + 4,
                left: getCaretCoordinatesAdjusted().left + 8,
            }}>
                <ul
                    ref={suggestionListRef}
                    tabIndex={0}
                    role="listbox"
                    className="dropdown-content menu menu-dropdown-toggle bg-base-100 rounded-md z-[999999] w-60 p-2 shadow-xl border overflow-scroll overflow-y-auto"
                >
                    <div className="flex flex-col w-full">
                        <label className="label label-text-alt">Available variables</label>
                        {(variablesKeyValue || []).map((suggestion, index) => (
                            <li

                                tabIndex={-1}
                                className={`list-item ${index === activeSuggestionIndex ? 'bg-blue-100' : ''} `}
                                key={index}
                                onMouseDown={handleMouseDownOnSuggestion}
                                onClick={() => handleSuggestionClick(suggestion.key)}
                            >
                                <a className='gap-3'>
                                    <span className="inline-block w-2 h-2 bg-blue-300 rounded-full"></span>
                                    <span>{suggestion.key}
                                    </span>
                                </a>
                            </li>
                        ))}
                        <li

                            tabIndex={-1}
                            className={`list-item ${variablesKeyValue?.length === activeSuggestionIndex ? 'bg-blue-100' : ''} `}
                            onMouseDown={handleMouseDownOnSuggestion}
                            onClick={() => handleSuggestionClick('add_variable')}
                        >
                            <a className='flex flex-col items-start'>
                                <span>+ Add New variable</span>
                                {variablesKeyValue?.length === activeSuggestionIndex && <p className='text-xs'>Press Tab after writing key name</p>}
                            </a>
                        </li>
                    </div>
                </ul>
            </div>
        );
    };

    if (service === "google" && serviceType === "chat") return null;

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
                  "Prompt summary is only for the bridge not for the Versions"
                }
              >
                <Info size={12} className="ml-2" />
              </div>
            </div>
          </div>
          <div className='flex gap-4'>
             {/* <div
              className="label cursor-pointer">

            <Link
              href={`/org/${params.org_id}/bridges/testcase/${params.id}?version=${params.version}`}
              target="_blank"
              >
              <span className="label-text capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text">
                Generate Test Case
              </span>
            </Link>
                </div> */}
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
        <div className="form-control h-full">
          <textarea
            ref={textareaRef}
            className="textarea textarea-bordered border w-full min-h-96 resize-y focus:border-primary relative bg-transparent z-10 caret-black p-2 rounded-b-none"
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            onBlur={savePrompt}
          />
          {showSuggestions && renderSuggestions()}
          <div className="collapse bg-gradient-to-r from-yellow-50 to-orange-50 border-t-0 border border-base-300 rounded-t-none">
            <input type="checkbox" className="min-h-[0.75rem]" />
            <div className="collapse-title min-h-[0.75rem] text-xs font-medium flex items-center gap-1 p-2">
              <div className="flex items-center gap-2">
                <span className="text-nowrap">Default Variables</span>
                <p role="alert" className="label-text-alt alert p-2">
                  <Info size={16} className="" />
                  Use these variables in prompt to get their functionality
                </p>
              </div>
              <div className="ml-auto">
                <ChevronDown className="collapse-arrow" size={12} />
              </div>
            </div>
            <div className="collapse-content">
              <div className="text-xs">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-yellow-500 rounded-full"></span>
                    <span className="">
                      &#123;&#123;current_time_and_date&#125;&#125;
                    </span>
                    <span className=" ml-2">
                      - To access the current date and time
                    </span>
                  </div>
                  {/* <div className="flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 bg-yellow-500 rounded-full"></span>
                                    <span className="">&#123;&#123;memory&#125;&#125;</span>
                                    <span className="">- Access GPT memory context when enabled</span>
                                </div> */}
                                <div className="flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 bg-yellow-500 rounded-full"></span>
                                    <span className="">&#123;&#123;pre_function&#125;&#125;</span>
                                    <span className="">- Use this variable if you are using the pre_function</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 bg-yellow-500 rounded-full"></span>
                                    <span className="">&#123;&#123;timezone&#125;&#125;</span>
                                    <span className="">- Access the timezone using a timezone identifier</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex mt-2'>
              <ToneDropdown params={params} />
              <ResponseStyleDropdown params={params} />
            </div>
            <CreateVariableModal keyName={keyName} setKeyName={setKeyName} params={params} />
            <OptimizePromptModal params={params} />
            <PromptSummaryModal params={params}/>
        </div>
    );
};

export default InputConfigComponent;
