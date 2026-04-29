"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { jwtDecode } from "jwt-decode";
import { Users, LogOut, Home as HomeIcon, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Concert {
  id: string;
  name: string;
  description: string;
  totalSeats: number;
  reservations: any[];
}

export default function Home() {
  const router = useRouter();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchConcerts();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUserRole(decoded.role);
        setUserId(decoded.userId || decoded.sub);
      } catch (err) {
        localStorage.removeItem("token");
      }
    }
  };

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

  const handleBook = async (concertId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await api.post("/reservations", { concertId });
      fetchConcerts();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to book ticket");
    }
  };

  const handleCancel = async (concertId: string) => {
    try {
      await api.delete(`/reservations/${concertId}`);
      fetchConcerts();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel ticket");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserRole(null);
    setUserId(null);
    router.push("/login");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006699]"></div></div>;
  }

  // If user is logged in, show the Dashboard Sidebar layout
  if (userRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
          <div>
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900">User</h1>
            </div>
            <nav className="space-y-2 px-4">
              <button className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium bg-blue-50 text-gray-900">
                <HomeIcon className="w-5 h-5 mr-3" />
                Home
              </button>
              {userRole === "ADMIN" && (
                <button
                  onClick={() => router.push("/admin")}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <RefreshCcw className="w-5 h-5 mr-3" />
                  Switch to Admin
                </button>
              )}
            </nav>
          </div>
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-4xl space-y-6">
            {concerts.length === 0 ? (
              <p className="text-gray-500 py-4">No concerts available.</p>
            ) : (
              concerts.map(c => {
                const hasReserved = c.reservations.some(r => r.userId === userId && r.action === 'Reserve');
                const activeReservations = c.reservations.filter(r => r.action === 'Reserve').length;
                const isFullyBooked = activeReservations >= c.totalSeats;

                return (
                  <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col">
                    <h3 className="text-xl font-semibold text-blue-500 border-b border-gray-100 pb-4 mb-4">{c.name}</h3>
                    <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                      {c.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-5 h-5 mr-2" />
                        <span>{c.totalSeats}</span>
                      </div>
                      
                      {hasReserved ? (
                        <button 
                          onClick={() => handleCancel(c.id)}
                          className="bg-[#f05252] hover:bg-red-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleBook(c.id)}
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
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, show the original public Hero layout
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
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
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Please login to view and book concerts.</h2>
        <Link href="/login">
          <button className="bg-[#006699] text-white px-8 py-3 rounded-full font-medium hover:bg-[#005580] transition-colors">
            Go to Login
          </button>
        </Link>
      </main>
    </div>
  );
}
