import React, { memo } from 'react';
import { ChevronDownIcon, InfoIcon } from '@/components/Icons';

// Optimized default variables section
const DefaultVariablesSection = memo(() => {
    return (
        <div className="collapse bg-gradient-to-r bg-base-1 border-t-0 border border-base-content/20 rounded-t-none">
            <input type="checkbox" className="min-h-[0.75rem]" />
            <div className="collapse-title min-h-[0.75rem] text-xs font-medium flex items-center gap-1 p-2">
                <div className="flex items-center gap-2 ">
                    <span className="text-nowrap">Default Variables</span>
                    <p role="alert" className="label-text-alt alert p-2 bg-base-200">

                        &#123;&#123;current_time_and_date&#125;&#125;,

                        &#123;&#123;pre_function&#125;&#125;,

                        &#123;&#123;timezone&#125;&#125;

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
                            <InfoIcon size={14} className="mb-1" />
                            Use these variables in prompt to get their functionality
                        </div>
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
                </div>
            </div>
        </div>
    );
});

DefaultVariablesSection.displayName = 'DefaultVariablesSection';

export default DefaultVariablesSection;
