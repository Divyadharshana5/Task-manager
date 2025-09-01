"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export default function Home() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchTasks();
      setUser(JSON.parse(localStorage.getItem("user")));
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleAuth = async (isLogin) => {
    const buttonKey = isLogin ? 'signin' : 'signup';
    setLoadingStates(prev => ({ ...prev, [buttonKey]: true }));
    setError("");
    try {
      const endpoint = isLogin ? "login" : "signup";
      const response = await axios.post(`${API_URL}/auth/${endpoint}`, {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
      setUser(response.data.user);
      setEmail("");
      setPassword("");
      fetchTasks();
    } catch (error) {
      setError(error.response?.data?.error || "Authentication failed");
    } finally {
      setLoadingStates(prev => ({ ...prev, [buttonKey]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setTasks([]);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, taskSubmit: true }));
    try {
      if (editingTask) {
        await axios.put(`${API_URL}/tasks/${editingTask._id}`, {
          title,
          description,
        });
        setEditingTask(null);
      } else {
        await axios.post(`${API_URL}/tasks`, { title, description });
      }
      setTitle("");
      setDescription("");
      fetchTasks();
    } catch (error) {
      setError(error.response?.data?.error || "Task operation failed");
    } finally {
      setLoadingStates(prev => ({ ...prev, taskSubmit: false }));
    }
  };

  const toggleTaskStatus = async (task) => {
    setLoadingStates(prev => ({ ...prev, [`toggle-${task._id}`]: true }));
    try {
      const newStatus = task.status === "pending" ? "completed" : "pending";
      await axios.put(`${API_URL}/tasks/${task._id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      setError("Failed to update task status");
    } finally {
      setLoadingStates(prev => ({ ...prev, [`toggle-${task._id}`]: false }));
    }
  };

  const deleteTask = async (id) => {
    setLoadingStates(prev => ({ ...prev, [`delete-${id}`]: true }));
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      setError("Failed to delete task");
    } finally {
      setLoadingStates(prev => ({ ...prev, [`delete-${id}`]: false }));
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Task Manager
            </h2>
            <p className="text-gray-600">
              Sign in to your account or create a new one
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => handleAuth(true)}
                  disabled={loadingStates.signin}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loadingStates.signin ? "Loading..." : "Sign In"}
                </button>
                <button
                  onClick={() => handleAuth(false)}
                  disabled={loadingStates.signup}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loadingStates.signup ? "Loading..." : "Sign Up"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Task Manager
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Task Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h2>
          </div>

          <form onSubmit={handleTaskSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task description"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={loadingStates.taskSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loadingStates.taskSubmit
                  ? "Saving..."
                  : editingTask
                  ? "Update Task"
                  : "Create Task"}
              </button>

              {editingTask && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setTitle("");
                    setDescription("");
                  }}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Tasks</h2>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tasks yet
              </h3>
              <p className="text-gray-500">
                Get started by creating your first task above.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            task.status === "completed"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        ></div>
                        <h3
                          className={`text-lg font-medium ${
                            task.status === "completed"
                              ? "line-through text-gray-500"
                              : "text-gray-900"
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>

                      {task.description && (
                        <p
                          className={`text-gray-600 ml-6 mb-2 ${
                            task.status === "completed" ? "line-through" : ""
                          }`}
                        >
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 ml-6">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {new Date(
                            task.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {task.status === "completed"
                            ? "Completed"
                            : "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        disabled={loadingStates[`toggle-${task._id}`]}
                        className={`px-3 py-1 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                          task.status === "completed"
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-green-100 text-green-800 hover:bg-green-200"
                        }`}
                      >
                        {loadingStates[`toggle-${task._id}`]
                          ? "Loading..."
                          : task.status === "completed"
                          ? "Mark Pending"
                          : "Mark Complete"}
                      </button>

                      <button
                        onClick={() => startEdit(task)}
                        disabled={loadingStates[`toggle-${task._id}`] || loadingStates[`delete-${task._id}`]}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteTask(task._id)}
                        disabled={loadingStates[`delete-${task._id}`]}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingStates[`delete-${task._id}`] ? "Loading..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
