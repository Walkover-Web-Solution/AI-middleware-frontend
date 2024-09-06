'use client'
import { Bot, Info, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "../codeBlock/codeBlock";
import { useCustomSelector } from "@/customSelector/customSelector";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ThreadItem = ({ item, threadHandler, formatDateAndTime, integrationData }) => {
  const pathName = usePathname();
  // dispatch = useDispatch();
  const path = pathName?.split('?')[0].split('/');
  const orgId = path[2] || '';
  const {  embedToken } = useCustomSelector((state) => ({
   
    embedToken: state?.bridgeReducer?.org?.[orgId]?.embed_token,
  
  }));
  useEffect(() => {
    if (embedToken) {
      const script = document.createElement("script");
      script.setAttribute("embedToken", embedToken);
      script.id = process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID;
      script.src = process.env.NEXT_PUBLIC_EMBED_SCRIPT_SRC;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(document.getElementById(process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID));
      };
    }
  }, [embedToken]);

  useEffect(() => {
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);


  function handleMessage(e) {
    // todo: need to make api call to update the name & description
    if (e?.data?.webhookurl) {
      const dataToSend = {
        ...e.data,
        status: e?.data?.action
      }
      }
    }
  

  
  return(
  <div key={`item.id${item.id}`} >
    {item.role === "tools_call" ? (
      <div className="w-full flex overflow-y-scroll align-center justify-center gap-2">
        {Object.keys(item.function).map((funcName, index) => (
          <div key={index} role="alert" className="alert w-1/3 transition-colors duration-200">
            <Info size={16} />
            <div onClick={() => openViasocket(funcName, {flowHitId:'funcName'})} className="cursor-pointer">
              <h3 className="font-bold">Functions Executed</h3>
              <div  className="text-xs">Function "{integrationData?.[funcName]?.title || funcName}" executed successfully.</div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className={`chat ${item.role === "user" ? "chat-start" : "chat-end"}`}>
        <div class="chat-image avatar flex justify-center items-center">
          <div class="w-100 p-3 rounded-full bg-base-300 flex justify-center items-center">
            {item.role === "user" ? <User /> : <Bot />}

          </div>
        </div>
        <div className="chat-header flex gap-2">
          {/* {item.role.replaceAll("_", " ")} */}

          <time className="text-xs opacity-50">{formatDateAndTime(item.createdAt)}</time>
        </div>
        <div className={`${item.role === "user" ? "cursor-pointer chat-bubble-primary " : "bg-base-200  text-base-content"} chat-bubble`} onClick={() => threadHandler(item.thread_id, item)}>
          <ReactMarkdown components={{
            code: ({ node, inline, className, children, ...props }) => (
              <CodeBlock
                inline={inline}
                className={className}
                {...props}
              >
                {children}
              </CodeBlock>
            )
          }}>{item?.content}</ReactMarkdown>
        </div>
      </div>
    )}
  </div>
);}

export default ThreadItem;
