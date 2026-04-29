"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, History, LogOut, Users, Trash2, Save, X, RefreshCcw } from "lucide-react";
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
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      fetchData();
      setActiveTab("overview");
    } catch (err) {
      console.error(err);
      alert("Failed to create concert");
    }
  };

  const handleDelete = async () => {
    if (!concertToDelete) return;
    try {
      await api.delete(`/concerts/${concertToDelete.id}`);
      setDeleteModalOpen(false);
      setConcertToDelete(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete concert");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
          </div>
          <nav className="space-y-2 px-4">
            <button
              onClick={() => setActiveMenu("home")}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
                activeMenu === "home" ? "bg-blue-50 text-gray-900" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </button>
            <button
              onClick={() => setActiveMenu("history")}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
                activeMenu === "history" ? "bg-blue-50 text-gray-900" : "text-gray-600 hover:bg-gray-50"
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

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        {/* Top Cards */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-[#006699] rounded-xl p-6 text-white flex flex-col items-center justify-center shadow-sm">
            <Users className="w-6 h-6 mb-2 opacity-80" />
            <div className="text-sm opacity-80 mb-1">Total of seats</div>
            <div className="text-4xl font-light">{totalSeats}</div>
          </div>
          <div className="bg-[#00a884] rounded-xl p-6 text-white flex flex-col items-center justify-center shadow-sm">
            <svg className="w-6 h-6 mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            <div className="text-sm opacity-80 mb-1">Reserve</div>
            <div className="text-4xl font-light">{totalReserved}</div>
          </div>
          <div className="bg-[#f05252] rounded-xl p-6 text-white flex flex-col items-center justify-center shadow-sm">
            <X className="w-6 h-6 mb-2 opacity-80" />
            <div className="text-sm opacity-80 mb-1">Cancel</div>
            <div className="text-4xl font-light">{totalCancelled}</div>
          </div>
        </div>

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
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <h2 className="text-2xl font-semibold text-blue-500 mb-8">Create</h2>
                
                {showSuccess && (
                  <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-md">
                    Concert created successfully!
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Concert Name</label>
                      <input 
                        type="text" 
                        required
                        value={newConcert.name}
                        onChange={e => setNewConcert({...newConcert, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Please input concert name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Total of seat</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          required
                          value={newConcert.totalSeats}
                          onChange={e => setNewConcert({...newConcert, totalSeats: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="500"
                        />
                        <Users className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                    <textarea 
                      required
                      value={newConcert.description}
                      onChange={e => setNewConcert({...newConcert, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[120px]"
                      placeholder="Please input description"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-[#1ea1f2] hover:bg-blue-500 text-white px-6 py-2 rounded-md font-medium flex items-center transition-colors">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Booking History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3">Date time</th>
                    <th className="px-6 py-3">Username</th>
                    <th className="px-6 py-3">Concert name</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No history found.</td>
                    </tr>
                  ) : (
                    reservations.map(r => {
                      const activeReservations = r.concert?.reservations?.filter(res => res.action === 'Reserve').length || 0;
                      return (
                        <tr key={r.id} className="bg-white border-b">
                          <td className="px-6 py-4">{new Date(r.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{r.user?.fullName || "N/A"}</td>
                          <td className="px-6 py-4">{r.concert?.name}</td>
                          <td className="px-6 py-4">{r.action}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModalOpen && concertToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-[#f05252]">
                <X className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Are you sure to delete?</h3>
              <p className="text-gray-900 font-bold mb-6">"{concertToDelete.name}"</p>
              
              <div className="flex w-full space-x-3">
                <button 
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-[#f05252] text-white rounded-md font-medium text-sm hover:bg-red-600"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
