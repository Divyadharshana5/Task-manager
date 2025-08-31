'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

export default function Home() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchTasks()
      setUser(JSON.parse(localStorage.getItem('user')))
    }
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`)
      setTasks(response.data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleAuth = async (isLogin) => {
    try {
      const endpoint = isLogin ? 'login' : 'signup'
      const response = await axios.post(`${API_URL}/auth/${endpoint}`, { email, password })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      setUser(response.data.user)
      setEmail('')
      setPassword('')
      fetchTasks()
    } catch (error) {
      alert(error.response?.data?.error || 'Authentication failed')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    setTasks([])
  }

  const handleTaskSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTask) {
        await axios.put(`${API_URL}/tasks/${editingTask._id}`, { title, description })
        setEditingTask(null)
      } else {
        await axios.post(`${API_URL}/tasks`, { title, description })
      }
      setTitle('')
      setDescription('')
      fetchTasks()
    } catch (error) {
      alert(error.response?.data?.error || 'Task operation failed')
    }
  }

  const toggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === 'pending' ? 'completed' : 'pending'
      await axios.put(`${API_URL}/tasks/${task._id}`, { status: newStatus })
      fetchTasks()
    } catch (error) {
      alert('Failed to update task status')
    }
  }

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`)
      fetchTasks()
    } catch (error) {
      alert('Failed to delete task')
    }
  }

  const startEdit = (task) => {
    setEditingTask(task)
    setTitle(task.title)
    setDescription(task.description)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Task Manager</h1>
            <p className="text-gray-600 mt-2">Organize your life, one task at a time</p>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors pl-12"
              />
              <span className="absolute left-4 top-4 text-gray-400">📧</span>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors pl-12"
              />
              <span className="absolute left-4 top-4 text-gray-400">🔒</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleAuth(true)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
              >
                Login
              </button>
              <button
                onClick={() => handleAuth(false)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/50">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Task Manager</h1>
                <p className="text-gray-600">Stay organized and productive</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-full">
                <span className="text-gray-700 font-medium">👋 {user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 font-semibold shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>

          <form onSubmit={handleTaskSubmit} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors pl-12"
                />
                <span className="absolute left-4 top-4 text-gray-400">✏️</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors pl-12"
                />
                <span className="absolute left-4 top-4 text-gray-400">📄</span>
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 font-semibold shadow-lg flex items-center justify-center space-x-2"
              >
                <span>{editingTask ? '✏️' : '➕'}</span>
                <span>{editingTask ? 'Update Task' : 'Add Task'}</span>
              </button>
            </div>
            {editingTask && (
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null)
                  setTitle('')
                  setDescription('')
                }}
                className="mt-4 text-gray-500 hover:text-gray-700 bg-gray-100 px-4 py-2 rounded-lg transition-colors"
              >
                ❌ Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="grid gap-6">
          {tasks.map((task, index) => {
            const colors = ['purple', 'blue', 'pink', 'indigo', 'green', 'yellow'];
            const color = colors[index % colors.length];
            return (
              <div
                key={task._id}
                className={`bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-l-4 transition-all hover:shadow-xl transform hover:-translate-y-1 ${
                  task.status === 'completed' 
                    ? 'border-l-green-400 bg-green-50/50' 
                    : `border-l-${color}-400`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'completed' ? 'bg-green-400' : 'bg-orange-400'
                      }`}></div>
                      <h3 className={`text-xl font-bold ${
                        task.status === 'completed' 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-800'
                      }`}>
                        {task.title}
                      </h3>
                    </div>
                    {task.description && (
                      <p className={`text-gray-600 ml-6 ${
                        task.status === 'completed' ? 'line-through' : ''
                      }`}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-3 ml-6">
                      <span className="text-xs text-gray-400">📅 {new Date(task.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all transform hover:scale-105 ${
                        task.status === 'completed'
                          ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg'
                          : 'bg-gradient-to-r from-orange-400 to-yellow-500 text-white shadow-lg'
                      }`}
                    >
                      {task.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                    </button>
                    <button
                      onClick={() => startEdit(task)}
                      className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit task"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No tasks yet!</h3>
            <p className="text-gray-500">Create your first task above to get started on your productivity journey.</p>
          </div>
        )}
      </div>
    </div>
  )
}