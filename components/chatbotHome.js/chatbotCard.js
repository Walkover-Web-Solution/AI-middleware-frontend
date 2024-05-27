import { useCustomSelector } from "@/customSelector/customSelector";
import { getChatBotDetailsAction } from "@/store/action/chatBotAction";
import { Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

function BridgeBadge({ bridge }) {
    return (
        <span className="mb-2 mr-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-900">
            {bridge.name}
        </span>
    );
}

function ChatBotCard({ item, onFetchDetails }) {
    return (
        <div onClick={() => onFetchDetails(item._id)} className="flex flex-col items-start gap-7 rounded-md border cursor-pointer hover:shadow-lg ">
            <div className="p-4 flex flex-col justify-between items-start">
                <div className="w-full flex items-center gap-2 justify-start">
                    <Bot />
                    <h1 className="inline-flex w-full items-center truncate gap-2 text-lg font-semibold">
                        <span className="truncate">{item.title}</span>
                    </h1>
                </div>
                <div className="mt-auto">
                    {item.bridge.map((bridge, index) => (
                        <BridgeBadge key={index} bridge={bridge} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function ChatBotCardHome({ params }) {

    const { allChatBot } = useCustomSelector((state) => ({
        allChatBot: (state?.ChatBot?.org?.[params?.org_id] || []),
    }));
    const dispatch = useDispatch();
    const router = useRouter();

    const fetchChatBotDetails = async (id) => {
        try {
            await dispatch(getChatBotDetailsAction(id));
            router.push(`/org/${params.org_id}/chatbot/${id}`);
        } catch (error) {
            console.error('Failed to fetch chatbot details:', error);
        }
    };


    return <div className="flex flex-col">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5 lg:grid-cols-4 p-4">
            {allChatBot.map((item) => (
                <ChatBotCard key={item._id} item={item} onFetchDetails={fetchChatBotDetails} />
            ))}
        </div>
    </div>
}