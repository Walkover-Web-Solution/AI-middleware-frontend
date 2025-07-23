import { CopyIcon, RedoIcon, UndoIcon } from '@/components/Icons'
import React from 'react'

const ComparisonCheck = ({ diffData, isStreaming, handleUndo = () => { }, handleRedo = () => { }, copyToClipboard = () => { }, copyText = "", currentIndex = 0, promptHistory = [], displayPrompt = "", errorMessage = "", key}) => {
    return (
        <>
            {/* Side-by-side diff view */}
            <div className="flex gap-2 h-[60vh] mt-3">
                {/* Original Prompt Side */}
                <div className="w-1/2 flex flex-col">
                    <div className="label">
                        <span className="label-text font-medium text-red-600">Original Prompt</span>
                    </div>
                    <div className="flex-1 border border-gray-300 rounded-lg overflow-auto">
                        <div className="h-full overflow-y-auto bg-red-50">
                            {diffData.map((line, index) => (
                                <div
                                    key={index}
                                    className={`px-3 py-1 text-sm font-mono leading-relaxed border-b border-gray-200 ${line.type === 'deleted' ? 'bg-red-200' :
                                            line.type === 'modified' ? 'bg-red-100' :
                                                line.type === 'equal' ? 'bg-base-100' :
                                                    'bg-gray-100 opacity-30'
                                        }`}
                                >
                                    <span className="text-gray-400 mr-3 select-none">{line.lineNumber}</span>
                                    <span className={line.type === 'deleted' || line.type === 'modified' ? 'line-through' : ''}>
                                        {line.oldLine || (line.type === 'added' ? ' ' : '')}
                                    </span>
                                </div>
                            ))}
                            {diffData.length === 0 && (
                                <div className="p-4 text-gray-500 text-center">
                                    Generate a new prompt to see differences
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* New Prompt Side */}
                <div className="w-1/2 flex flex-col">
                    <div className="label">
                        <span className="label-text font-medium text-green-600">
                            AI Generated Prompt
                            {isStreaming && (
                                <span className="ml-2 text-sm text-gray-500 animate-pulse">
                                    ✨ Generating...
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex-1 border border-gray-300 rounded-lg overflow-auto relative">
                        <div className="h-full overflow-y-auto bg-green-50">
                            {diffData.map((line, index) => (
                                <div
                                    key={index}
                                    className={`px-3 py-1 text-sm font-mono leading-relaxed border-b border-gray-200 ${line.type === 'added' ? 'bg-green-200' :
                                            line.type === 'modified' ? 'bg-green-100' :
                                                line.type === 'equal' ? 'bg-base-100' :
                                                    'bg-gray-100 opacity-30'
                                        }`}
                                >
                                    <span className="text-gray-400 mr-3 select-none">{line.lineNumber}</span>
                                    <span className={line.type === 'added' || line.type === 'modified' ? 'font-semibold' : ''}>
                                        {line.newLine || (line.type === 'deleted' ? ' ' : '')}
                                    </span>
                                </div>
                            ))}
                            {diffData.length === 0 && (
                                <div className="p-4 text-gray-500 text-center">
                                    Generated prompt will appear here
                                </div>
                            )}
                        </div>
                        {isStreaming && (
                            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-base-100 px-2 py-1 rounded-md shadow-sm border">
                                <div className="flex space-x-1">
                                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-xs text-gray-600">Streaming</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls for diff view */}
            {displayPrompt && (
                <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-600">
                        <span className="inline-block w-4 h-4 bg-red-200 rounded mr-2"></span>Removed
                        <span className="inline-block w-4 h-4 bg-green-200 rounded mr-2 ml-4"></span>Added
                        <span className="inline-block w-4 h-4 bg-yellow-100 rounded mr-2 ml-4"></span>Modified
                    </div>
                    {key === "prompt" && <div className="flex gap-2">
                        <div className="tooltip cursor-pointer" data-tip="Previous Prompt">
                            <UndoIcon
                                onClick={handleUndo}
                                className={`${(!currentIndex || isStreaming) ? "opacity-50 pointer-events-none" : ""}`}
                            />
                        </div>
                        <div className="tooltip tooltip-left cursor-pointer" data-tip="Next Prompt">
                            <RedoIcon
                                onClick={handleRedo}
                                className={`${((currentIndex >= promptHistory.length - 1) || isStreaming) ? "opacity-50 pointer-events-none" : ""}`}
                            />
                        </div>
                        <div className="tooltip tooltip-left cursor-pointer" data-tip={copyText}>
                            <CopyIcon
                                onClick={copyToClipboard}
                                size={20}
                                className={`${(!displayPrompt || isStreaming) ? "opacity-50 pointer-events-none" : ""}`}
                            />
                        </div>
                    </div>}
                </div>
            )}

            {errorMessage && <span className="text-red-500 mt-2">{errorMessage}</span>}
        </>
    )
}

export default ComparisonCheck