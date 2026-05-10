"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "../../lib/api";
import {
  Users,
  Building2,
  FileBox,
  LayoutDashboard,
  BarChart3,
  Trash2,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  PieChart,
  ArrowUpDown,
  Download,
  Sun,
  Moon,
} from "lucide-react";

interface Stats {
  users: number;
  workspaces: number;
  files: number;
  pages: number;
  drawings: number;
  kanbanBoards: number;
  chatMessages: number;
  chatRooms: number;
  last30Days: {
    newUsers: number;
    newWorkspaces: number;
    newFiles: number;
    newPages: number;
    newDrawings: number;
    newBoards: number;
    newMessages: number;
    userGrowth: number;
    workspaceGrowth: number;
    pagesGrowth: number;
    drawingsGrowth: number;
    boardsGrowth: number;
    messagesGrowth: number;
  };
  charts: {
    users: { date: string; count: number }[];
    workspaces: { date: string; count: number }[];
    pages: { date: string; count: number }[];
    drawings: { date: string; count: number }[];
    messages: { date: string; count: number }[];
    files: { date: string; count: number }[];
  };
}

interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  isVerified: boolean;
  createdAt: string;
}

interface Workspace {
  id: string;
  name: string;
  owner: { id: string; email: string; username: string };
  _count: { members: number };
  createdAt: string;
}

interface Report {
  id: string;
  title: string;
  description: string;
  status: string;
  reporterId: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type SortField = "username" | "email" | "isVerified" | "createdAt";
type SortOrder = "asc" | "desc";

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "workspaces" | "reports">("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);
  const [activeChart, setActiveChart] = useState<"users" | "workspaces" | "pages" | "drawings" | "messages" | "files">("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination states
  const [usersPagination, setUsersPagination] = useState<Pagination | null>(null);
  const [workspacesPagination, setWorkspacesPagination] = useState<Pagination | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [workspacePage, setWorkspacePage] = useState(1);

  // Sort states
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Edit states
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState({ username: "", isVerified: false });
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [editWorkspaceForm, setEditWorkspaceForm] = useState({ name: "" });

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
      return;
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "workspaces") fetchWorkspaces();
  }, [activeTab, userPage, workspacePage, sortField, sortOrder]);

  const fetchData = async () => {
    try {
      const statsRes = await api.get("/admin/stats", { headers: { Authorization: `Bearer ${Cookies.get("token")}` } });
      setStats(statsRes.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("Admin access required. Only admin@example.com can access this page.");
      } else {
        setError("Failed to load admin data");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = userPage) => {
    try {
      const res = await api.get(`/admin/users?page=${page}&limit=20&sortBy=${sortField}&sortOrder=${sortOrder}`, { 
        headers: { Authorization: `Bearer ${Cookies.get("token")}` } 
      });
      setUsers(res.data.users);
      setUsersPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchWorkspaces = async (page = workspacePage) => {
    try {
      const res = await api.get(`/admin/workspaces?page=${page}&limit=20`, { 
        headers: { Authorization: `Bearer ${Cookies.get("token")}` } 
      });
      setWorkspaces(res.data.workspaces);
      setWorkspacesPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to fetch workspaces", err);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleUpdateUser = async (id: string) => {
    try {
      const res = await api.put(`/admin/users/${id}`, editUserForm, { 
        headers: { Authorization: `Bearer ${Cookies.get("token")}` } 
      });
      setUsers(users.map(u => u.id === id ? res.data : u));
      setEditingUser(null);
    } catch (err) {
      alert("Failed to update user");
    }
  };

  const handleUpdateWorkspace = async (id: string) => {
    try {
      const res = await api.put(`/admin/workspaces/${id}`, { name: editWorkspaceForm.name }, { 
        headers: { Authorization: `Bearer ${Cookies.get("token")}` } 
      });
      setWorkspaces(workspaces.map(w => w.id === id ? res.data : w));
      setEditingWorkspace(null);
    } catch (err) {
      alert("Failed to update workspace");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`, { headers: { Authorization: `Bearer ${Cookies.get("token")}` } });
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workspace?")) return;
    try {
      await api.delete(`/admin/workspaces/${id}`, { headers: { Authorization: `Bearer ${Cookies.get("token")}` } });
      setWorkspaces(workspaces.filter((w) => w.id !== id));
    } catch (err) {
      alert("Failed to delete workspace");
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/");
  };

  const toggleTheme = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    localStorage.setItem("theme", newVal ? "dark" : "light");
    if (newVal) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleExport = async (type: "users" | "workspaces") => {
    try {
      const res = await api.get(`/admin/${type}?page=1&limit=10000`, { 
        headers: { Authorization: `Bearer ${Cookies.get("token")}` } 
      });
      const data = type === "users" ? res.data.users : res.data.workspaces;
      
      const csv = [
        type === "users" 
          ? ["Username", "Email", "Verified", "Created"].join(",")
          : ["Name", "Owner Email", "Owner Username", "Members", "Created"].join(",")
      ];
      
      data.forEach((item: any) => {
        if (type === "users") {
          csv.push([item.username, item.email, item.isVerified, new Date(item.createdAt).toISOString()].join(","));
        } else {
          csv.push([item.name, item.owner.email, item.owner.username, item._count.members, new Date(item.createdAt).toISOString()].join(","));
        }
      });
      
      const blob = new Blob([csv.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export data");
    }
  };

  const handleExportReport = () => {
    if (!stats) return;
    
    const csv = [
      ["Category", "Total", "Last 30 Days"].join(","),
      ["Users", stats.users, stats.last30Days.newUsers].join(","),
      ["Workspaces", stats.workspaces, stats.last30Days.newWorkspaces].join(","),
      ["Pages", stats.pages, stats.last30Days.newPages].join(","),
      ["Drawings", stats.drawings, stats.last30Days.newDrawings].join(","),
      ["Chat Messages", stats.chatMessages, stats.last30Days.newMessages].join(","),
      ["Files", stats.files, stats.last30Days.newFiles].join(","),
      ["Chat Rooms", stats.chatRooms, "N/A"].join(","),
      ["Kanban Boards", stats.kanbanBoards, stats.last30Days.newBoards].join(","),
    ];
    
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCleanupUnverified = async () => {
    if (!confirm("Delete all unverified users older than 1 month? This cannot be undone.")) return;
    try {
      const res = await api.delete("/admin/users/unverified", {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` }
      });
      alert(res.data.message || `Deleted ${res.data.deletedCount} users`);
      router.refresh();
    } catch (err) {
      alert("Failed to clean unverified users");
    }
  };

  const handleCleanupOrphanWorkspaces = async () => {
    if (!confirm("Delete orphan workspaces with no members? This cannot be undone.")) return;
    try {
      const res = await api.delete("/admin/workspaces/orphan", {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` }
      });
      alert(res.data.message || `Deleted ${res.data.deletedCount} workspaces`);
      router.refresh();
    } catch (err) {
      alert("Failed to clean orphan workspaces");
    }
  };

  const startEditUser = (user: User) => {
    setEditingUser(user.id);
    setEditUserForm({ username: user.username, isVerified: user.isVerified });
  };

  const startEditWorkspace = (workspace: Workspace) => {
    setEditingWorkspace(workspace.id);
    setEditWorkspaceForm({ name: workspace.name });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => router.push("/dashboard")} className="text-blue-600 hover:underline">
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWorkspaces = workspaces.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.owner.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentChartData = stats?.charts[activeChart] || [];
  const maxCount = Math.max(...currentChartData.map(d => d.count), 1);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-slate-400" />;
    return sortOrder === "asc" ? <ArrowUpDown size={14} className="text-blue-600" /> : <ArrowUpDown size={14} className="text-blue-600 rotate-180" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 dark:text-slate-100 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="p-2 hover:bg-slate-100 rounded-lg">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Admin Panel</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
            <LogOut size={16} />
            Logout
          </button>
          <button onClick={toggleTheme} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === "dashboard" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-100"
            }`}
          >
            <LayoutDashboard size={16} className="inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === "users" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-100"
            }`}
          >
            <Users size={16} className="inline mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab("workspaces")}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === "workspaces" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-100"
            }`}
          >
            <Building2 size={16} className="inline mr-2" />
            Workspaces
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="p-6">
        {activeTab === "dashboard" && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg"><Users size={20} className="text-blue-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.users}</p>
                    <p className="text-sm text-slate-500">Users</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><Building2 size={20} className="text-green-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.workspaces}</p>
                    <p className="text-sm text-slate-500">Workspaces</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg"><FileBox size={20} className="text-purple-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.files}</p>
                    <p className="text-sm text-slate-500">Files</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg"><BarChart3 size={20} className="text-orange-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.pages}</p>
                    <p className="text-sm text-slate-500">Pages</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg"><BarChart3 size={20} className="text-pink-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.drawings}</p>
                    <p className="text-sm text-slate-500">Drawings</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg"><BarChart3 size={20} className="text-cyan-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.kanbanBoards}</p>
                    <p className="text-sm text-slate-500">Kanban</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg"><BarChart3 size={20} className="text-indigo-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.chatMessages}</p>
                    <p className="text-sm text-slate-500">Chat Messages</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg"><BarChart3 size={20} className="text-teal-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.chatRooms}</p>
                    <p className="text-sm text-slate-500">Chat Rooms</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Stats */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Last 30 Days Growth</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCleanupOrphanWorkspaces}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <Trash2 size={16} /> Clean Orphan Workspaces
                  </button>
                  <button
                    onClick={handleCleanupUnverified}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 size={16} /> Clean Unverified Users
                  </button>
                  <button
                    onClick={() => handleExportReport()}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download size={16} /> Export Report
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Users</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{stats.last30Days.newUsers}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Workspaces</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{stats.last30Days.newWorkspaces}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Pages</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{stats.last30Days.newPages}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Drawings</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{stats.last30Days.newDrawings}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Messages</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{stats.last30Days.newMessages}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Files</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{stats.last30Days.newFiles}</span>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <PieChart size={18} />
                  Activity Chart (Last 14 Days)
                </h3>
                <div className="flex gap-2">
                  {(["users", "workspaces", "pages", "drawings", "messages", "files"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveChart(type)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        activeChart === type
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-48 flex items-end gap-1">
                {currentChartData.slice(-14).map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                      style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                      title={`${d.count} ${activeChart}`}
                    />
                    <span className="text-xs text-slate-400">{new Date(d.date).getDate()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span>14 days ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <div className="mb-4 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {usersPagination && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Total: {usersPagination.total} users
                </span>
              )}
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">
                      <button onClick={() => handleSort("username")} className="flex items-center gap-1 hover:text-slate-700">
                        Username {renderSortIcon("username")}
                      </button>
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">
                      <button onClick={() => handleSort("email")} className="flex items-center gap-1 hover:text-slate-700">
                        Email {renderSortIcon("email")}
                      </button>
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">
                      <button onClick={() => handleSort("isVerified")} className="flex items-center gap-1 hover:text-slate-700">
                        Verified {renderSortIcon("isVerified")}
                      </button>
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">
                      <button onClick={() => handleSort("createdAt")} className="flex items-center gap-1 hover:text-slate-700">
                        Created {renderSortIcon("createdAt")}
                      </button>
                    </th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4">
                        {editingUser === user.id ? (
                          <input
                            type="text"
                            value={editUserForm.username}
                            onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-200 rounded"
                          />
                        ) : (
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.username}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        {editingUser === user.id ? (
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editUserForm.isVerified}
                              onChange={(e) => setEditUserForm({ ...editUserForm, isVerified: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-sm">Verified</span>
                          </label>
                        ) : (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {user.isVerified ? "Verified" : "Pending"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingUser === user.id ? (
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => handleUpdateUser(user.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                              <Save size={16} />
                            </button>
                            <button onClick={() => setEditingUser(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => startEditUser(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {usersPagination && usersPagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => { setUserPage(userPage - 1); }}
                  disabled={userPage === 1}
                  className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-slate-600">
                  Page {usersPagination.page} of {usersPagination.totalPages}
                </span>
                <button
                  onClick={() => { setUserPage(userPage + 1); }}
                  disabled={userPage >= usersPagination.totalPages}
                  className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "workspaces" && (
          <div>
            <div className="mb-4 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search workspaces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {workspacesPagination && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Total: {workspacesPagination.total} workspaces
                </span>
              )}
            </div>
            <div className="grid gap-4">
              {filteredWorkspaces.map((workspace) => (
                <div key={workspace.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingWorkspace === workspace.id ? (
                        <input
                          type="text"
                          value={editWorkspaceForm.name}
                          onChange={(e) => setEditWorkspaceForm({ name: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-lg font-semibold"
                        />
                      ) : (
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{workspace.name}</h3>
                      )}
                      <p className="text-sm text-slate-500">
                        Owner: {workspace.owner.username} ({workspace.owner.email})
                      </p>
                      <p className="text-sm text-slate-400">
                        {workspace._count.members} members • Created {new Date(workspace.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingWorkspace === workspace.id ? (
                        <>
                          <button onClick={() => handleUpdateWorkspace(workspace.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                            <Save size={16} />
                          </button>
                          <button onClick={() => setEditingWorkspace(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditWorkspace(workspace)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteWorkspace(workspace.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            {workspacesPagination && workspacesPagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => { setWorkspacePage(workspacePage - 1); }}
                  disabled={workspacePage === 1}
                  className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-slate-600">
                  Page {workspacesPagination.page} of {workspacesPagination.totalPages}
                </span>
                <button
                  onClick={() => { setWorkspacePage(workspacePage + 1); }}
                  disabled={workspacePage >= workspacesPagination.totalPages}
                  className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}