"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Calendar, Users, MapPin, Search } from "lucide-react";
import Link from "next/link";

interface Concert {
  id: number;
  name: string;
  description: string;
  totalSeats: number;
  reservations: any[];
}

export default function Home() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConcerts();
  }, []);

  const fetchConcerts = async () => {
    try {
      const res = await api.get("/concerts");
      setConcerts(res.data);
    } catch (error) {
      console.error("Failed to fetch concerts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header / Hero Section */}
      <header className="bg-[#006699] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#006699] font-bold">
              <span className="text-xs">DW</span>
            </div>
            <span className="text-xl font-bold tracking-wider">Concert Space</span>
          </div>
          <Link 
            href="/login" 
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Login / Register
          </Link>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Discover Amazing Live Events</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Book your free concert tickets now. Don't miss out on the best shows in town.
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search concerts..." 
              className="w-full pl-12 pr-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#006699]/50 shadow-lg"
            />
          </div>
        </div>
      </header>

      {/* Concerts Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Concerts</h2>
            <p className="text-gray-500 mt-1">Select a concert to book your ticket</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006699]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {concerts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                No concerts available at the moment.
              </div>
            ) : (
              concerts.map((concert) => {
                const isFullyBooked = concert.reservations.length >= concert.totalSeats;
                const availableSeats = concert.totalSeats - concert.reservations.length;

                return (
                  <div 
                    key={concert.id} 
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all ${
                      isFullyBooked ? "border-red-100 opacity-80" : "border-gray-200 hover:shadow-md hover:border-[#006699]/30"
                    }`}
                  >
                    {/* Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative">
                      {isFullyBooked && (
                        <div className="absolute inset-0 bg-red-900/40 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-red-600 text-white font-bold px-6 py-2 rounded-full transform -rotate-12 border-2 border-white shadow-lg">
                            Out of Tickets
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{concert.name}</h3>
                        {!isFullyBooked && (
                          <span className="inline-flex items-center bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full border border-green-200">
                            Available
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-6 line-clamp-2 h-10">
                        {concert.description}
                      </p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          To be announced
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          <span className={isFullyBooked ? "text-red-500 font-medium" : "text-gray-700 font-medium"}>
                            {availableSeats}
                          </span>
                          <span className="ml-1">/ {concert.totalSeats} seats left</span>
                        </div>
                      </div>

                      <Link href={`/login`} className="block w-full">
                        <button 
                          disabled={isFullyBooked}
                          className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
                            isFullyBooked 
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                              : "bg-[#006699] text-white hover:bg-[#005580]"
                          }`}
                        >
                          {isFullyBooked ? "Sold Out" : "Book Ticket"}
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
