import React from 'react';
import { UserIcon, PlayIcon, SquareFunctionIcon, ParenthesesIcon, FileClockIcon, AddIcon } from '@/components/Icons';
import { GitBranch } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from '@/components/codeBlock/CodeBlock';

const OrchestraThreadItem = ({
  params,
  index,
  item,
  thread,
  threadHandler,
  formatDateAndTime,
  integrationData,
  threadRefs,
  searchMessageId,
  setSearchMessageId,
  onVisualize
}) => {
  const messageId = item?.id;

  const handleVisualizeFlow = () => {
    if (item?.agent_flow && onVisualize) {
      onVisualize(item.agent_flow);
    }
  };

  const handleUserButtonClick = (type) => {
    if (threadHandler) {
      threadHandler(item?.thread_id, item, type);
    }
  };

  return (
    <div key={`item-id-${item?.id}`} id={`message-${messageId}`} ref={(el) => (threadRefs.current[messageId] = el)} className="text-sm">
      <div className="show-on-hover">
        
        {/* User Message */}
        {item?.user && (
          <div className="chat group chat-end mb-4">
            <div className="chat-image avatar flex justify-center items-center">
              <div className="w-100 p-2 rounded-full bg-primary flex justify-center items-center hover:bg-primary/80 transition-colors mb-7">
                <UserIcon className="text-primary-content" size={20} />
              </div>
            </div>
            <div className="flex justify-end items-center gap-1" style={{ width: "-webkit-fill-available" }}>
              <div className="bg-primary text-primary-content chat-bubble transition-all ease-in-out duration-300 relative group break-words" style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-line" }}>
                <ReactMarkdown components={{
                  code: ({ node, inline, className, children, ...props }) => (
                    <CodeBlock className={className} {...props}>
                      {children}
                    </CodeBlock>
                  )
                }}>
                  {item?.user}
                </ReactMarkdown>
              </div>
            </div>
            
            {/* Action buttons for user query - positioned below message like regular history */}
            <div className="flex flex-row-reverse gap-2 m-1 items-center justify-between">
              <time className="text-xs opacity-50 chat-end relative">
                {formatDateAndTime(item?.created_at)}
              </time>
              <div className="flex gap-1 opacity-70 hover:opacity-100 transition-opacity see-on-hover">
                <button
                  className="btn text-xs font-normal btn-sm hover:btn-primary"
                  onClick={() => handleUserButtonClick('AiConfig')}
                >
                  <SquareFunctionIcon className="h-3 w-3" />
                  <span>AI Config</span>
                </button>
                <button
                  className="btn text-xs font-normal btn-sm hover:btn-primary"
                  onClick={() => handleUserButtonClick('variables')}
                >
                  <ParenthesesIcon className="h-3 w-3" />
                  <span>Variables</span>
                </button>
                <button
                  className="btn text-xs font-normal btn-sm hover:btn-primary"
                  onClick={() => handleUserButtonClick('system Prompt')}
                >
                  <FileClockIcon className="h-3 w-3" />
                  <span>System Prompt</span>
                </button>
                <button
                  className="btn text-xs font-normal btn-sm hover:btn-primary"
                  onClick={() => handleUserButtonClick('more')}
                >
                  <AddIcon className="h-3 w-3" />
                  <span>More...</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assistant Message with Orchestral Flow */}
        {(item?.llm_message || item?.chatbot_message) && (
          <div className="chat group chat-start">
            <div className="chat-image avatar flex justify-center items-center">
              <div className="w-100 p-2 rounded-full bg-secondary flex justify-center items-center hover:bg-secondary/80 transition-colors mb-7">
                <GitBranch className="text-secondary-content" size={20} />
              </div>
            </div>
            <div className="flex justify-start items-center gap-1 show-on-hover" style={{ width: "-webkit-fill-available" }}>
              <div className="bg-base-200 text-base-content pr-10 mb-7 chat-bubble transition-all ease-in-out duration-300 relative group break-words" style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-line" }}>
                
                {/* Agent Flow Summary */}

                {/* Assistant Response Content */}
                <ReactMarkdown components={{
                  code: ({ node, inline, className, children, ...props }) => (
                    <CodeBlock className={className} {...props}>
                      {children}
                    </CodeBlock>
                  )
                }}>
                  {item?.llm_message || item?.chatbot_message}
                </ReactMarkdown>

                {/* Action buttons for assistant messages */}
                {item?.agent_flow && (
                  <div className={`absolute bottom-[-40px] see-on-hover left-0 flex gap-2 mt-2 transition-opacity z-10 opacity-0 group-hover:opacity-70`}>
                    <button
                      className="btn text-xs font-normal btn-sm hover:btn-primary"
                      onClick={handleVisualizeFlow}
                    >
                      <PlayIcon className="h-3 w-3" />
                      <span>View Flow</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrchestraThreadItem;
