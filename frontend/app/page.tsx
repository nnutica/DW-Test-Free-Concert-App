"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { jwtDecode } from "jwt-decode";
import { User as UserIcon, Settings, Home as HomeIcon, LogOut, Users, RefreshCcw, Menu, UserCircle, X, History, ChevronRight } from "lucide-react";
import { Toast } from "@/components/Toast";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"home" | "history">("home");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    checkAuth();
    fetchConcerts();

    // Realtime polling every 3 seconds
    const interval = setInterval(() => {
      fetchConcerts(true);
    }, 3000);

    return () => clearInterval(interval);
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

  const fetchConcerts = async (isSilent = false) => {
    try {
      const res = await api.get("/concerts");
      setConcerts(res.data);
    } catch (error) {
      console.error("Failed to fetch concerts:", error);
    } finally {
      if (!isSilent) setLoading(false);
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
      setToastType("success");
      setToastMessage("Successfully booked your ticket!");
    } catch (err: any) {
      console.error(err);
      setToastType("error");
      setToastMessage(err.response?.data?.message || "Failed to book ticket. The concert might be fully booked.");
    }
  };

  const handleCancel = async (concertId: string) => {
    try {
      await api.delete(`/reservations/${concertId}`);
      fetchConcerts();
      setToastType("success");
      setToastMessage("Reservation cancelled successfully.");
    } catch (err: any) {
      console.error(err);
      setToastType("error");
      setToastMessage(err.response?.data?.message || "Failed to cancel ticket.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserRole(null);
    setUserId(null);
    router.push("/");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006699]"></div></div>;
  }

  // If user is logged in, show the Dashboard Sidebar layout
  if (userRole) {
    return (
      <div className="h-screen overflow-hidden bg-gray-50 flex flex-col md:flex-row relative">
        {toastMessage && (
          <Toast 
            message={toastMessage} 
            type={toastType} 
            onClose={() => setToastMessage("")} 
          />
        )}
        
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 flex justify-between items-center p-4 z-20">
          <button onClick={() => setMobileMenuOpen(true)} className="text-blue-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold text-gray-900">User Dashboard</span>
          <div className="w-8 h-8 bg-[#1e293b] rounded-full flex items-center justify-center text-white">
            <UserCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Sidebar (Desktop) & Offcanvas (Mobile) */}
        <div className={`fixed inset-y-0 left-0 z-50 transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out md:flex`}>
          {/* Overlay for mobile */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 bg-black/30 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
          )}
          
          <div className="relative w-64 h-full bg-white border-r border-gray-200 flex flex-col justify-between z-10 shadow-lg md:shadow-none">
            <div>
              <div className="p-6 md:p-8 flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User</h1>
                <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-2 px-4">
                <button 
                  onClick={() => { setActiveMenu("home"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium ${activeMenu === "home" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <HomeIcon className="w-5 h-5 mr-3" />
                  Home
                </button>
                <button 
                  onClick={() => { setActiveMenu("history"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium ${activeMenu === "history" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <History className="w-5 h-5 mr-3" />
                  History
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
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-10 overflow-y-auto w-full md:w-auto">
          {/* Page Header (Mobile) */}
          <div className="md:hidden mb-6 mt-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeMenu === "home" ? "Available Concerts" : "My Booking History"}
            </h2>
          </div>

          <div className="w-full space-y-4 md:space-y-6">
            {activeMenu === "home" ? (
              concerts.length === 0 ? (
                <p className="text-gray-500 py-4 text-center">No concerts available.</p>
              ) : (
                concerts.map(c => {
                  const hasReserved = c.reservations.some(r => r.userId === userId && r.action === 'Reserve');
                  const activeReservations = c.reservations.filter(r => r.action === 'Reserve').length;
                  const isFullyBooked = activeReservations >= c.totalSeats;
                  const availableSeats = c.totalSeats - activeReservations;

                  return (
                    <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-5 md:p-6 flex flex-col hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start border-b border-gray-100 pb-3 md:pb-4 mb-3 md:mb-4">
                        <h3 className="text-lg md:text-xl font-semibold text-[#1ea1f2] pr-4">{c.name}</h3>
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
                      <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                        {c.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="w-5 h-5 mr-2 text-gray-400" />
                          <span className={isFullyBooked ? "text-red-500 font-medium" : "text-gray-700 font-medium"}>
                            {availableSeats}
                          </span>
                          <span className="ml-1">/ {c.totalSeats} seats left</span>
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
              )
            ) : (
              <div className="bg-white md:border md:border-gray-200 rounded-lg p-0 md:p-8">
                <h2 className="hidden md:block text-2xl font-semibold text-gray-900 mb-6 px-4 md:px-0">My Booking History</h2>
                
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-md">
                  <table className="w-full text-black text-left border-collapse">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="p-4 border-r border-gray-200 font-semibold w-1/4">Date time</th>
                        <th className="p-4 border-r border-gray-200 font-semibold w-1/2">Concert name</th>
                        <th className="p-4 font-semibold w-1/4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const history = concerts.flatMap(c => 
                          (c.reservations || [])
                            .filter(r => r.userId === userId)
                            .map(r => ({ ...r, concertName: c.name }))
                        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                        if (history.length === 0) {
                          return (
                            <tr>
                              <td colSpan={3} className="p-4 text-center text-gray-500">No history found.</td>
                            </tr>
                          );
                        }

                        return history.map(r => {
                          const dateObj = new Date(r.createdAt);
                          const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}:${dateObj.getSeconds().toString().padStart(2, '0')}`;
                          
                          return (
                            <tr key={r.id} className="border-b border-gray-200 last:border-0 bg-white">
                              <td className="p-4 border-r border-gray-200">{formattedDate}</td>
                              <td className="p-4 border-r border-gray-200 font-medium">{r.concertName}</td>
                              <td className="p-4">
                                <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${r.action === 'Reserve' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {r.action === 'Reserve' ? 'RESERVED' : 'CANCELLED'}
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 px-4 pb-6">
                  {(() => {
                    const history = concerts.flatMap(c => 
                      (c.reservations || [])
                        .filter(r => r.userId === userId)
                        .map(r => ({ ...r, concertName: c.name }))
                    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                    if (history.length === 0) {
                      return <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-xl">No history found.</div>;
                    }

                    return history.map(r => {
                      const dateObj = new Date(r.createdAt);
                      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                      const month = monthNames[dateObj.getMonth()];
                      const day = dateObj.getDate().toString().padStart(2, '0');
                      const year = dateObj.getFullYear();
                      
                      let hours = dateObj.getHours();
                      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                      const ampm = hours >= 12 ? 'PM' : 'AM';
                      hours = hours % 12;
                      hours = hours ? hours : 12;
                      
                      const mobileFormattedDate = `${month} ${day}, ${year} • ${hours}:${minutes} ${ampm}`;
                      const isReserved = r.action === 'Reserve';

                      return (
                        <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative flex flex-col hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-bold tracking-wider ${isReserved ? 'text-blue-600' : 'text-gray-400'}`}>
                              {mobileFormattedDate}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase shrink-0 ${
                              isReserved 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {isReserved ? 'RESERVED' : 'CANCELLED'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <h3 className="text-lg font-bold text-gray-900 pr-4 truncate">{r.concertName}</h3>
                            <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Concerts</h2>
            <p className="text-gray-500 mt-1">Select a concert to book your ticket</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {concerts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
              No concerts available at the moment.
            </div>
          ) : (
            concerts.map((concert) => {
              const activeReservations = concert.reservations?.filter(r => r.action === 'Reserve').length || 0;
              const isFullyBooked = activeReservations >= concert.totalSeats;
              const availableSeats = concert.totalSeats - activeReservations;

              return (
                <div key={concert.id} className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                    <h3 className="text-xl font-semibold text-[#1ea1f2]">{concert.name}</h3>
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
                  
                  <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                    {concert.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-5 h-5 mr-2 text-gray-400" />
                      <span className={isFullyBooked ? "text-red-500 font-medium" : "text-gray-700 font-medium"}>
                        {availableSeats}
                      </span>
                      <span className="ml-1">/ {concert.totalSeats} seats left</span>
                    </div>
                    
                    <Link href={`/login`} className="block">
                      <button 
                        disabled={isFullyBooked}
                        className={`px-8 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          isFullyBooked 
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-[#1ea1f2] text-white hover:bg-blue-500"
                        }`}
                      >
                        {isFullyBooked ? "Sold Out" : "Reserve"}
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
