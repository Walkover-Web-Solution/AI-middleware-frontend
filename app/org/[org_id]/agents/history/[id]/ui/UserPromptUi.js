import { User } from "lucide-react";

export function UserPromptUI({ text }) {
  return (
    <div className="space-y-2 bg-base flex flex-col items-center justify-center">
     
      <div className="w-10 h-10 flex items-center justify-center border bg-gray-50">
        <User size={18} className="text-gray-600" />
      </div>
 <div className="text-xs text-gray-500 font-semibold">
        USER PROMPT
      </div>


      <div className="border p-2 text-sm bg-white text-black">
        {text}
      </div>
    </div>
  );
}
