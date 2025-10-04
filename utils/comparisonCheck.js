import { CopyIcon } from '@/components/Icons'
import React from 'react'
import { createDiff } from '@/utils/utility'

const ComparisonCheck = ({ oldContent, newContent }) => {
    // Generate diffData using the createDiff utility function
    const diffData = createDiff(oldContent || '', newContent || '');
    
    // Check if newContent is empty
    const isNewContentEmpty = !newContent || newContent.trim() === '';
    
    return (
        <>
            {isNewContentEmpty ? (
                <div className="flex flex-col items-center justify-center h-[70vh] w-full bg-base-200 rounded-lg p-6">
                    <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">No Optimized Prompt Available</h3>
                        <p className="text-gray-600">You need to optimize your prompt first to see a comparison.</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Side-by-side diff view */}
                    <div className="flex gap-2 h-[70vh] w-full mt-3">
                        {/* Original Prompt Side */}
                        <div className="w-1/2 flex flex-col">
                            <div className="label">
                                <span className="label-text font-medium text-red-600">Original Prompt</span>
                            </div>
                            <div className="flex-1 border border-base-content/20 rounded-lg overflow-auto">
                                <div className="h-full overflow-y-auto bg-red-50">
                                    {diffData.map((line, index) => (
                                        <div
                                            key={index}
                                            className={`px-3 py-1 text-sm font-mono leading-relaxed border-b border-base-content/20 ${line.type === 'deleted' ? 'bg-red-200' :
                                                    line.type === 'modified' ? 'bg-red-100 text-black' :
                                                        line.type === 'equal' ? 'bg-base-100 text-base-content' :
                                                            'bg-base-100 opacity-30 text-content'
                                                }`}
                                        >
                                            <span className="text-gray-400 mr-3 select-none">{line.lineNumber}</span>
                                            <span className={line.type === 'deleted' || line.type === 'modified' ? 'line-through' : ''}>
                                                {line.oldLine || (line.type === 'added' ? ' ' : '')}
                                            </span>
                                        </div>
                                    ))}
                                    {diffData.length === 0 && (
                                        <div className="p-4 text-base-content text-center">
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
                                </span>
                            </div>
                            <div className="flex-1 border border-gray-300 rounded-lg overflow-auto">
                                <div className="h-full overflow-y-auto bg-green-50">
                                    {diffData.map((line, index) => (
                                        <div
                                            key={index}
                                            className={`px-3 py-1 text-sm font-mono leading-relaxed border-b border-gray-200 ${line.type === 'added' ? 'bg-green-200' :
                                                    line.type === 'modified' ? 'bg-green-100' :
                                                        line.type === 'equal' ? 'bg-white' :
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
                            </div>
                        </div>
                    </div>

                    {/* Diff legend */}
                    <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-base-content">
                            <span className="inline-block w-4 h-4 bg-red-200 rounded mr-2"></span>Removed
                            <span className="inline-block w-4 h-4 bg-green-200 rounded mr-2 ml-4"></span>Added
                            <span className="inline-block w-4 h-4 bg-yellow-100 rounded mr-2 ml-4"></span>Modified
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default ComparisonCheck