"use client";

import { useState, useEffect } from "react";
import { Toast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import { Home, History, LogOut, Users, Trash2, Save, X, RefreshCcw, Menu, UserCircle, ChevronRight, User, Award, XCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Concert {
  id: string;
  name: string;
  description: string;
  totalSeats: number;
  reservations?: any[];
};

type Reservation = {
  id: string;
  userId: string;
  concertId: string;
  createdAt: string;
  action: string;
  user: { id: string; email: string; fullName: string };
  concert: Concert;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<"home" | "history">("home");
  const [activeTab, setActiveTab] = useState<"overview" | "create">("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const totalSeats = concerts.reduce((acc, c) => acc + c.totalSeats, 0);
  const totalReserved = concerts.reduce((acc, c) => acc + (c.reservations?.filter(r => r.action === 'Reserve').length || 0), 0);
  const totalCancelled = reservations.filter(r => r.action === "Cancel").length;

  // Create Form State
  const [newConcert, setNewConcert] = useState({ name: "", totalSeats: "", description: "" });
  const [showSuccess, setShowSuccess] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [concertToDelete, setConcertToDelete] = useState<Concert | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const [concertRes, resRes] = await Promise.all([
        api.get("/concerts"),
        api.get("/reservations")
      ]);

      setConcerts(concertRes.data);
      setReservations(resRes.data);
    } catch (err) {
      console.error(err);
      if ((err as any)?.response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/concerts", {
        name: newConcert.name,
        description: newConcert.description,
        totalSeats: parseInt(newConcert.totalSeats)
      });
      setNewConcert({ name: "", totalSeats: "", description: "" });
      setToast({ message: "Create successfully", type: "success" });
      fetchData();
      setActiveTab("overview");
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to create concert", type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!concertToDelete) return;
    try {
      await api.delete(`/concerts/${concertToDelete.id}`);
      setDeleteModalOpen(false);
      setConcertToDelete(null);
      setToast({ message: "Delete successfully", type: "success" });
      fetchData();
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to delete concert", type: "error" });
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 flex justify-between items-center p-4">
        <button onClick={() => setMobileMenuOpen(true)} className="text-blue-600">
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-lg font-bold text-blue-600">ConcertAdmin</span>
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
              <h1 className="text-2xl md:text-3xl font-bold text-blue-600 md:text-gray-900">Admin Panel</h1>
              <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
          <nav className="space-y-2 px-4">
            <button
              onClick={() => { setActiveMenu("home"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
                activeMenu === "home" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </button>
            <button
              onClick={() => { setActiveMenu("history"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
                activeMenu === "history" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <History className="w-5 h-5 mr-3" />
              History
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <RefreshCcw className="w-5 h-5 mr-3" />
              Switch to user
            </button>
          </nav>
        </div>
        <div className="p-4">
          <button
            onClick={logout}
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
            {activeMenu === "home" ? "Admin Dashboard Overview" : "Booking History"}
          </h2>
        </div>

        {/* Top Cards - Only show on Home */}
        {activeMenu === "home" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            <div className="bg-[#0B72B9] rounded-md p-6 text-white flex flex-col items-center justify-center shadow-sm">
              <User className="w-8 h-8 mb-2 opacity-90" strokeWidth={1} />
              <div className="text-base font-normal mb-1">Total of seats</div>
              <div className="text-5xl font-light">{totalSeats}</div>
            </div>
            <div className="bg-[#13A07E] rounded-md p-6 text-white flex flex-col items-center justify-center shadow-sm">
              <Award className="w-8 h-8 mb-2 opacity-90" strokeWidth={1} />
              <div className="text-base font-normal mb-1">Reserve</div>
              <div className="text-5xl font-light">{totalReserved}</div>
            </div>
            <div className="bg-[#FC5C65] rounded-md p-6 text-white flex flex-col items-center justify-center shadow-sm">
              <XCircle className="w-8 h-8 mb-2 opacity-90" strokeWidth={1} />
              <div className="text-base font-normal mb-1">Cancel</div>
              <div className="text-5xl font-light">{totalCancelled}</div>
            </div>
          </div>
        )}

        {activeMenu === "home" ? (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "overview" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "create" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Create
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                {concerts.length === 0 ? (
                  <p className="text-gray-500 py-4">No concerts available.</p>
                ) : (
                  concerts.map(c => (
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
                        <button 
                          onClick={() => {
                            setConcertToDelete(c);
                            setDeleteModalOpen(true);
                          }}
                          className="bg-[#e05252] hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "create" && (
              <div className="bg-white border border-gray-200 rounded-md p-6 md:p-8 mt-2 shadow-sm">
                <h2 className="text-2xl md:text-3xl font-bold text-[#2196f3] mb-8">Create</h2>
                
                {showSuccess && (
                  <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
                    Concert created successfully!
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-base font-normal text-gray-900 mb-2">Concert Name</label>
                      <input 
                        type="text" 
                        required
                        value={newConcert.name}
                        onChange={e => setNewConcert({...newConcert, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:border-[#2196f3] focus:ring-1 focus:ring-[#2196f3] text-sm"
                        placeholder="Please input concert name"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-normal text-gray-900 mb-2">Total of seat</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          min="1"
                          required
                          value={newConcert.totalSeats}
                          onChange={e => setNewConcert({...newConcert, totalSeats: e.target.value})}
                          className="w-full pl-4 pr-10 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:border-[#2196f3] focus:ring-1 focus:ring-[#2196f3] text-sm"
                          placeholder="500"
                        />
                        <User className="w-5 h-5 text-black absolute right-3 top-2" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-normal text-gray-900 mb-2">Description</label>
                    <textarea 
                      required
                      value={newConcert.description}
                      onChange={e => setNewConcert({...newConcert, description: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 text-black rounded-md focus:outline-none focus:border-[#2196f3] focus:ring-1 focus:ring-[#2196f3] min-h-[120px] text-sm resize-y"
                      placeholder="Please input description"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit" 
                      className="bg-[#2196f3] hover:bg-blue-500 text-white px-6 py-2 rounded-md font-medium flex items-center transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white md:border md:border-gray-200 rounded-lg p-0 md:p-8">
            <h2 className="hidden md:block text-2xl font-semibold text-gray-900 mb-6 px-4 md:px-0">Booking History</h2>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto border border-black">
              <table className="w-full text-black text-left">
                <thead className="border-b border-black bg-white">
                  <tr>
                    <th className="p-4 border-r border-black font-bold">Date time</th>
                    <th className="p-4 border-r border-black font-bold">Username</th>
                    <th className="p-4 border-r border-black font-bold">Concert name</th>
                    <th className="p-4 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center">No history found.</td>
                    </tr>
                  ) : (
                    reservations.map(r => {
                      const dateObj = new Date(r.createdAt);
                      const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}:${dateObj.getSeconds().toString().padStart(2, '0')}`;
                      
                      return (
                        <tr key={r.id} className="border-b border-black last:border-0 bg-white">
                          <td className="p-4 border-r border-black">{formattedDate}</td>
                          <td className="p-4 border-r border-black">{r.user?.fullName || "N/A"}</td>
                          <td className="p-4 border-r border-black">{r.concert?.name}</td>
                          <td className="p-4">{r.action}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 px-4 pb-6">
              {reservations.length === 0 ? (
                <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-xl">No history found.</div>
              ) : (
                reservations.map(r => {
                  const dateObj = new Date(r.createdAt);
                  
                  // Format: OCT 24, 2023 • 8:00 PM
                  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                  const month = monthNames[dateObj.getMonth()];
                  const day = dateObj.getDate().toString().padStart(2, '0');
                  const year = dateObj.getFullYear();
                  
                  let hours = dateObj.getHours();
                  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                  const ampm = hours >= 12 ? 'PM' : 'AM';
                  hours = hours % 12;
                  hours = hours ? hours : 12; // the hour '0' should be '12'
                  
                  const mobileFormattedDate = `${month} ${day}, ${year} • ${hours}:${minutes} ${ampm}`;
                  
                  const isReserved = r.action === 'Reserve';

                  return (
                    <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative flex flex-col hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold tracking-wider ${isReserved ? 'text-blue-600' : 'text-gray-400'}`}>
                          {mobileFormattedDate}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                          isReserved 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {isReserved ? 'RESERVED' : 'CANCELLED'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold text-gray-900 pr-4 truncate">{r.concert?.name}</h3>
                        <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                      </div>
                      
                      <div className="flex items-center text-gray-500 text-sm">
                        <User className="w-4 h-4 mr-1.5" />
                        <span>{r.user?.fullName || "N/A"}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModalOpen && concertToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 relative">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6">
                <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z" fill="#E63946"/>
                  <path d="M26.5444 24L32.4724 18.072C32.7903 17.7308 32.9634 17.2795 32.9552 16.8132C32.947 16.3468 32.7581 15.9019 32.4283 15.5721C32.0985 15.2423 31.6535 15.0534 31.1872 15.0452C30.7209 15.037 30.2696 15.2101 29.9284 15.528L24.0004 21.456L18.0724 15.528C17.7311 15.2101 17.2798 15.037 16.8135 15.0452C16.3472 15.0534 15.9023 15.2423 15.5725 15.5721C15.2427 15.9019 15.0538 16.3468 15.0455 16.8132C15.0373 17.2795 15.2104 17.7308 15.5284 18.072L21.4564 24L15.5284 29.928C15.1913 30.2655 15.002 30.723 15.002 31.2C15.002 31.677 15.1913 32.1345 15.5284 32.472C15.8659 32.8091 16.3234 32.9984 16.8004 32.9984C17.2774 32.9984 17.7349 32.8091 18.0724 32.472L24.0004 26.544L29.9284 32.472C30.2659 32.8091 30.7234 32.9984 31.2004 32.9984C31.6774 32.9984 32.1349 32.8091 32.4724 32.472C32.8094 32.1345 32.9988 31.677 32.9988 31.2C32.9988 30.723 32.8094 30.2655 32.4724 29.928L26.5444 24Z" fill="white"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">Are you sure to delete?</h3>
              <p className="text-2xl text-black font-bold mb-8">"{concertToDelete.name}"</p>
              
              <div className="flex w-full space-x-4">
                <button 
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-black rounded-lg font-medium text-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 bg-[#E63946] text-white rounded-lg font-medium text-lg hover:bg-[#d63440] transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
