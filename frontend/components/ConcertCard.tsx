import { Users } from "lucide-react";

interface ConcertCardProps {
  name: string;
  description: string;
  totalSeats: number;
  availableSeats: number;
  isFullyBooked: boolean;
  hasReserved: boolean;
  onBook: () => void;
  onCancel: () => void;
}

export function ConcertCard({
  name, description, totalSeats, availableSeats,
  isFullyBooked, hasReserved, onBook, onCancel,
}: ConcertCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 md:p-6 flex flex-col hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start border-b border-gray-100 pb-3 md:pb-4 mb-3 md:mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-[#1ea1f2] pr-4">{name}</h3>
        {isFullyBooked ? (
          <span className="inline-flex items-center bg-red-50 text-red-700 text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0">
            Sold Out
          </span>
        ) : (
          <span className="inline-flex items-center bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0">
            Available
          </span>
        )}
      </div>
      <p className="text-gray-700 text-sm mb-6 leading-relaxed">{description}</p>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center text-sm text-gray-500">
          <Users className="w-5 h-5 mr-2 text-gray-400" />
          <span className={isFullyBooked ? "text-red-500 font-medium" : "text-gray-700 font-medium"}>
            {availableSeats}
          </span>
          <span className="ml-1">/ {totalSeats} seats left</span>
        </div>
        
        {hasReserved ? (
          <button 
            onClick={onCancel}
            className="bg-[#f05252] hover:bg-red-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        ) : (
          <button 
            onClick={onBook}
            disabled={isFullyBooked}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              isFullyBooked ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#1ea1f2] hover:bg-blue-500 text-white"
            }`}
          >
            {isFullyBooked ? "Sold Out" : "Reserve"}
          </button>
        )}
      </div>
    </div>
  );
}
