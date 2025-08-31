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
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4 animate-gradient-x relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 via-pink-300/20 to-transparent"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-400/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-400/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-cyan-400/20 rounded-full blur-lg animate-bounce-slow"></div>
        <div className="bg-white/15 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/40 animate-fade-in-up relative z-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-bounce-slow shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white animate-fade-in mb-2">Task Manager</h1>
            <p className="text-white/80 animate-fade-in-delay">Organize your life, one task at a time</p>
          </div>
          <div className="space-y-4">
            <div className="relative animate-slide-in-left">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:border-white/50 focus:bg-white/25 focus:outline-none transition-all duration-300 focus:scale-105 hover:shadow-lg text-white placeholder-white/70"
              />
            </div>
            <div className="relative animate-slide-in-right">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:border-white/50 focus:bg-white/25 focus:outline-none transition-all duration-300 focus:scale-105 hover:shadow-lg text-white placeholder-white/70"
              />
            </div>
            <div className="flex space-x-3 animate-fade-in-up-delay">
              <button
                onClick={() => handleAuth(true)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-110 hover:rotate-1 font-semibold shadow-lg hover:shadow-2xl"
              >
                Login
              </button>
              <button
                onClick={() => handleAuth(false)}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-110 hover:-rotate-1 font-semibold shadow-lg hover:shadow-2xl"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 via-pink-600 to-orange-500 p-6 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-xl animate-bounce-slow"></div>
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-green-400/20 rounded-full blur-lg animate-pulse"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-white/15 backdrop-blur-xl rounded-3xl shadow-2xl p-10 mb-10 border border-white/30 animate-fade-in-up">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center space-x-6 animate-slide-in-left">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">Task Manager</h1>
                <p className="text-white/70 text-lg">Stay organized and productive</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 animate-slide-in-right">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 px-6 py-3 rounded-full shadow-lg">
                <span className="text-white font-medium">Welcome, {user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500/80 backdrop-blur-sm text-white px-8 py-3 rounded-xl hover:bg-red-600/80 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg border border-red-400/30"
              >
                Logout
              </button>
            </div>
          </div>

          <form onSubmit={handleTaskSubmit} className="mb-12 animate-fade-in-up-delay">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative animate-slide-in-left">
                <input
                  type="text"
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full p-5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl focus:border-white/50 focus:bg-white/25 focus:outline-none transition-all duration-300 focus:scale-105 text-white placeholder-white/70 shadow-lg"
                />
              </div>
              <div className="relative animate-slide-in-up">
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl focus:border-white/50 focus:bg-white/25 focus:outline-none transition-all duration-300 focus:scale-105 text-white placeholder-white/70 shadow-lg"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-5 rounded-2xl hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 font-semibold shadow-xl animate-slide-in-right"
              >
                {editingTask ? 'Update Task' : 'Add Task'}
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
                className="mt-4 text-gray-500 hover:text-gray-700 bg-gray-100 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-gray-200 animate-fade-in"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="grid gap-8">
          {tasks.map((task, index) => {
            const gradients = [
              'from-purple-500/20 to-blue-500/20',
              'from-blue-500/20 to-cyan-500/20', 
              'from-pink-500/20 to-rose-500/20',
              'from-indigo-500/20 to-purple-500/20',
              'from-green-500/20 to-emerald-500/20',
              'from-yellow-500/20 to-orange-500/20'
            ];
            const gradient = gradients[index % gradients.length];
            return (
              <div
                key={task._id}
                className={`bg-gradient-to-r ${gradient} backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30 transition-all duration-500 hover:shadow-3xl transform hover:-translate-y-3 hover:scale-[1.02] animate-fade-in-up ${
                  task.status === 'completed' 
                    ? 'opacity-75 bg-gradient-to-r from-green-500/20 to-emerald-500/20' 
                    : ''
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4 animate-slide-in-left">
                      <div className={`w-4 h-4 rounded-full shadow-lg ${
                        task.status === 'completed' ? 'bg-green-400' : 'bg-orange-400'
                      }`}></div>
                      <h3 className={`text-2xl font-bold transition-all duration-300 hover:scale-105 ${
                        task.status === 'completed' 
                          ? 'line-through text-white/60' 
                          : 'text-white'
                      }`}>
                        {task.title}
                      </h3>
                    </div>
                    {task.description && (
                      <p className={`text-white/80 ml-8 text-lg animate-fade-in-delay transition-all duration-300 ${
                        task.status === 'completed' ? 'line-through text-white/50' : ''
                      }`}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-4 ml-8 animate-slide-in-up">
                      <span className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">{new Date(task.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 animate-slide-in-right">
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-110 shadow-lg ${
                        task.status === 'completed'
                          ? 'bg-green-500/80 backdrop-blur-sm text-white border border-green-400/50 hover:bg-green-600/80'
                          : 'bg-orange-500/80 backdrop-blur-sm text-white border border-orange-400/50 hover:bg-orange-600/80'
                      }`}
                    >
                      {task.status === 'completed' ? 'Completed' : 'Pending'}
                    </button>
                    <button
                      onClick={() => startEdit(task)}
                      className="px-5 py-3 bg-blue-500/80 backdrop-blur-sm text-white rounded-2xl border border-blue-400/50 hover:bg-blue-600/80 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                      title="Edit task"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="px-5 py-3 bg-red-500/80 backdrop-blur-sm text-white rounded-2xl border border-red-400/50 hover:bg-red-600/80 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                      title="Delete task"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="w-32 h-32 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-3xl mx-auto mb-8 flex items-center justify-center border border-white/30 shadow-2xl animate-bounce-slow">
              <svg className="w-16 h-16 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 animate-fade-in-delay">No tasks yet!</h3>
            <p className="text-white/70 text-lg animate-fade-in-delay-2">Create your first task above to get started on your productivity journey.</p>
          </div>
        )}
      </div>
    </div>
  )
}