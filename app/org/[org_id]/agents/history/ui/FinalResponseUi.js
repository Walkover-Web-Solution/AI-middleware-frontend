import { CheckCircle } from "lucide-react";

export function FinalResponseUI({ status }) {
  return (
    <div className="space-y-1 flex flex-col items-center justify-center">
      {/* Icon Box */}
      <div className="w-16 h-16 flex items-center justify-center border border-green-500 rounded-none ">
        <CheckCircle size={16} className="text-green-600" />
      </div>

      {/* Heading */}
      <div className="text-xs text-gray-500 font-semibold py-2">
        FINAL RESPONSE
      </div>

      {/* Status */}
      <div className="text-green-600 font-semibold text-sm bg-green-50 border-green-500 border p-2">
        {status}
      </div>
    </div>
  );
}
