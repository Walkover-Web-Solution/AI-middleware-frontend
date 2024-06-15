import { useState } from "react";
import { useCustomSelector } from "@/customSelector/customSelector";
import { getChatBotDetailsAction } from "@/store/action/chatBotAction";
import { Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

function BridgeBadge({ bridge }) {
  return (
    <span className="mb-2 mr-2 inline-block rounded-full max-w-full bg-gray-100 px-3 py-1 text-[10px] truncate font-semibold text-gray-900">
      {bridge.name}
    </span>
  );
}

function ChatBotCard({ item, onFetchDetails }) {
  return (
    <div onClick={() => onFetchDetails(item._id)} className="flex flex-col items-start gap-7 rounded-md border cursor-pointer hover:shadow-lg">
      <div className="p-4 flex flex-col justify-between w-full items-start">
        <div className="w-full flex items-center gap-2 justify-start">
          <Bot />
          <h1 className="inline-flex w-full items-center truncate gap-2 text-lg font-semibold">
            <span className="truncate">{item.title}</span>
          </h1>
        </div>
        <div className="mt-auto w-full truncate">
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
    allChatBot: (state?.ChatBot?.org?.[params?.org_id] || [])
  }));
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const fetchChatBotDetails = async (id) => {
    try {
      await dispatch(getChatBotDetailsAction(id));
      router.push(`/org/${params.org_id}/chatbot/${id}`);
    } catch (error) {
      console.error('Failed to fetch chatbot details:', error);
    }
  };

  const filteredChatBots = allChatBot.filter((bot) =>
    bot.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      <div className='relative flex items-center justify-between m-4'>
        <input
          type="text"
          placeholder="Search for Chatbot Name"
          className="input input-bordered max-w-sm  input-md w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5 lg:grid-cols-4 p-4">
        {filteredChatBots.slice().sort((a, b) => a.title.localeCompare(b.title)).map((item) => (
          <ChatBotCard key={item._id} item={item} onFetchDetails={fetchChatBotDetails} />
        ))}
      </div>
    </div>
  );
}