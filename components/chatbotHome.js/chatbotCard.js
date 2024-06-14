import { useState } from "react";
import { useCustomSelector } from "@/customSelector/customSelector";
import { getAllChatBotAction, getChatBotDetailsAction } from "@/store/action/chatBotAction";
import { Bot, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { DeleteChatBot } from "@/config/index";
import Modal from "@/components/Model"; // Ensure the correct path

function BridgeBadge({ bridge }) {
  return (
    <span className="mb-2 mr-2 inline-block rounded-full max-w-full bg-gray-100 px-3 py-1 text-[10px] truncate font-semibold text-gray-900">
      {bridge.name}
    </span>
  );
}

function ChatBotCard({ item, onFetchDetails, onOpenModal }) {
  return (
    <div
      onClick={() => onFetchDetails(item._id)}
      className="flex flex-col items-start gap-7 rounded-md border cursor-pointer hover:shadow-lg"
    >
      <div className="p-4 flex flex-col justify-between w-full items-start">
        <div className="w-full flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Bot />
            <h1 className="inline-flex w-full items-center truncate gap-2 text-lg font-semibold">
              <span className="truncate">{item.title}</span>
            </h1>
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(item._id);
            }}
            className="flex justify-center  tooltip"
            data-tip="Delete"
          >
            <Trash size={16} />
          </div>
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
    allChatBot: state?.ChatBot?.org?.[params?.org_id] || [],
  }));
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState(null);

  const fetchChatBotDetails = async (id) => {
    try {
      await dispatch(getChatBotDetailsAction(id));
      router.push(`/org/${params.org_id}/chatbot/${id}`);
    } catch (error) {
      console.error("Failed to fetch chatbot details:", error);
    }
  };

  const handleDeleteChatBot = async (botId) => {
    try {
      const response = await DeleteChatBot(botId);
      if (response.status === 200) {
        toast.success("Chatbot deleted successfully");
        dispatch(getAllChatBotAction(params.org_id));
      } else {
        throw new Error("Failed to delete chatbot");
      }
    } catch (error) {
      console.error("Failed to delete chatbot:", error);
      toast.error("Error deleting chatbot");
    }
  };

  const handleOpenModal = (botId) => {
    setSelectedBotId(botId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBotId(null);
  };

  const handleConfirmDelete = () => {
    handleDeleteChatBot(selectedBotId);
    handleCloseModal();
  };

  const filteredChatBots = allChatBot.filter((bot) =>
    bot.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      <div className="relative flex items-center justify-between m-4">
        <input
          type="text"
          placeholder="Search for Chatbot Name"
          className="input input-bordered max-w-sm input-md w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5 lg:grid-cols-4 p-4">
        {filteredChatBots
          .slice()
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((item) => (
            <ChatBotCard
              key={item._id}
              item={item}
              onFetchDetails={fetchChatBotDetails}
              onOpenModal={handleOpenModal}
            />
          ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this chatbot?"
      />
    </div>
  );
}



