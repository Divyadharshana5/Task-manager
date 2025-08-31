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
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Task Manager</h1>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>

          <form onSubmit={handleTaskSubmit} className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="p-3 border rounded-lg"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
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
                className="mt-2 text-gray-500 hover:text-gray-700"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="grid gap-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`bg-white p-4 rounded-lg shadow-md ${
                task.status === 'completed' ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${
                    task.status === 'completed' ? 'line-through text-gray-500' : ''
                  }`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={`text-gray-600 ${
                      task.status === 'completed' ? 'line-through' : ''
                    }`}>
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleTaskStatus(task)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {task.status}
                  </button>
                  <button
                    onClick={() => startEdit(task)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No tasks yet. Add your first task above!
          </div>
        )}
      </div>
    </div>
  )
}