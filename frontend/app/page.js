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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4 animate-gradient-x relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-300/10 rounded-full blur-2xl"></div>
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/30 animate-fade-in-up relative z-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl mx-auto mb-6 flex items-center justify-center animate-bounce-slow border border-white/20">
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
                className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white p-4 rounded-xl hover:bg-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-110 hover:rotate-1 font-semibold shadow-lg hover:shadow-2xl"
              >
                Login
              </button>
              <button
                onClick={() => handleAuth(false)}
                className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white p-4 rounded-xl hover:bg-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-110 hover:-rotate-1 font-semibold shadow-lg hover:shadow-2xl"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 animate-gradient-x">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/50 animate-fade-in-up">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4 animate-slide-in-left">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl animate-spin-slow hover:animate-bounce"></div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-text-shimmer">Task Manager</h1>
                <p className="text-gray-600 animate-fade-in-delay">Stay organized and productive</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 animate-slide-in-right">
              <div className="bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-full animate-bounce-slow hover:animate-wiggle">
                <span className="text-gray-700 font-medium">Welcome, {user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110 hover:rotate-3 font-semibold shadow-lg hover:shadow-2xl animate-pulse-slow"
              >
                Logout
              </button>
            </div>
          </div>

          <form onSubmit={handleTaskSubmit} className="mb-8 animate-fade-in-up-delay">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative animate-slide-in-left">
                <input
                  type="text"
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300 focus:scale-105 hover:shadow-lg"
                />
              </div>
              <div className="relative animate-slide-in-up">
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300 focus:scale-105 hover:shadow-lg"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-110 hover:rotate-1 font-semibold shadow-lg hover:shadow-2xl animate-slide-in-right"
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

        <div className="grid gap-6">
          {tasks.map((task, index) => {
            const colors = ['purple', 'blue', 'pink', 'indigo', 'green', 'yellow'];
            const color = colors[index % colors.length];
            const animationDelay = `animate-delay-${(index % 4) * 100}`;
            return (
              <div
                key={task._id}
                className={`bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-l-4 transition-all duration-500 hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 animate-fade-in-up ${animationDelay} ${
                  task.status === 'completed' 
                    ? 'border-l-green-400 bg-green-50/50 animate-pulse-slow' 
                    : `border-l-${color}-400`
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2 animate-slide-in-left">
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'completed' ? 'bg-green-400' : 'bg-orange-400'
                      }`}></div>
                      <h3 className={`text-xl font-bold transition-all duration-300 hover:scale-105 ${
                        task.status === 'completed' 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-800'
                      }`}>
                        {task.title}
                      </h3>
                    </div>
                    {task.description && (
                      <p className={`text-gray-600 ml-6 animate-fade-in-delay transition-all duration-300 ${
                        task.status === 'completed' ? 'line-through' : ''
                      }`}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-3 ml-6 animate-slide-in-up">
                      <span className="text-xs text-gray-400">{new Date(task.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 animate-slide-in-right">
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-110 hover:rotate-3 ${
                        task.status === 'completed'
                          ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg hover:shadow-2xl'
                          : 'bg-gradient-to-r from-orange-400 to-yellow-500 text-white shadow-lg hover:shadow-2xl'
                      }`}
                    >
                      {task.status === 'completed' ? 'Completed' : 'Pending'}
                    </button>
                    <button
                      onClick={() => startEdit(task)}
                      className="px-3 py-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-300 transform hover:scale-105"
                      title="Edit task"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300 transform hover:scale-105"
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
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mx-auto mb-6 animate-bounce-slow hover:animate-spin"></div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2 animate-fade-in-delay">No tasks yet!</h3>
            <p className="text-gray-500 animate-fade-in-delay-2">Create your first task above to get started on your productivity journey.</p>
          </div>
        )}
      </div>
    </div>
  )
}