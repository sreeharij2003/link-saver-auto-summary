'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Plus, LogOut, Trash2, ExternalLink } from 'lucide-react'
import './animations.css'

interface Bookmark {
  id: string
  url: string
  title: string
  favicon?: string
  summary?: string
  tags?: string
  createdAt: string
}

interface User {
  id: string
  email: string
  name?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newTags, setNewTags] = useState('')
  const [addingBookmark, setAddingBookmark] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    setUser(JSON.parse(userData))
    fetchBookmarks()
  }, [router])

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/bookmarks', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookmarks(response.data)
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter bookmarks based on search query and selected tag
  useEffect(() => {
    let filtered = bookmarks

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter(bookmark =>
        parseTags(bookmark.tags).includes(selectedTag)
      )
    }

    setFilteredBookmarks(filtered)
  }, [bookmarks, searchQuery, selectedTag])

  // Get all unique tags from bookmarks
  const getAllTags = () => {
    const allTags = bookmarks.flatMap(bookmark => parseTags(bookmark.tags))
    return Array.from(new Set(allTags)).sort()
  }

  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl.trim()) return

    // Basic URL validation
    try {
      new URL(newUrl)
    } catch {
      alert('Please enter a valid URL (e.g., https://example.com)')
      return
    }

    setAddingBookmark(true)
    try {
      const token = localStorage.getItem('token')
      const tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean)

      const response = await axios.post('/api/bookmarks', {
        url: newUrl,
        tags: tags.length > 0 ? tags : undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setBookmarks([response.data, ...bookmarks])
      setNewUrl('')
      setNewTags('')
      setShowAddForm(false)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add bookmark'
      alert(errorMessage)
    } finally {
      setAddingBookmark(false)
    }
  }

  const handleDeleteBookmark = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/bookmarks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id))
    } catch (error) {
      alert('Failed to delete bookmark')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const parseTags = (tagsString?: string): string[] => {
    if (!tagsString) return []
    try {
      return JSON.parse(tagsString)
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-spin">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
            Loading your links...
          </h2>
          <p className="text-gray-600">Preparing your intelligent bookmark collection</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      darkMode
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {darkMode ? (
          <>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-600/30 to-pink-600/30 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
          </>
        ) : (
          <>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-300/10 to-cyan-300/10 rounded-full blur-3xl"></div>
          </>
        )}
      </div>
      {/* Header */}
      <header className={`relative backdrop-blur-xl shadow-lg border-b sticky top-0 z-40 transition-colors duration-300 ${
        darkMode
          ? 'bg-gray-900/80 border-gray-700/20'
          : 'bg-white/80 border-white/20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Link Saver
                  </h1>
                  <span className={`ml-2 text-sm transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Welcome back, {user?.name || user?.email}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-64 px-4 py-2 pl-10 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                    darkMode
                      ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white/60 border-white/30 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <svg className={`absolute left-3 top-2.5 w-5 h-5 transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Tag Filter */}
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className={`px-4 py-2 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  darkMode
                    ? 'bg-gray-800/70 border-gray-600 text-white'
                    : 'bg-white/60 border-white/30 text-gray-900'
                }`}
              >
                <option value="">All Tags</option>
                {getAllTags().map(tag => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 backdrop-blur-sm border rounded-lg transition-all duration-200 ${
                  darkMode
                    ? 'bg-gray-800/70 border-gray-600 hover:bg-gray-700/70'
                    : 'bg-white/60 border-white/30 hover:bg-white/80'
                }`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
              >
                <Plus size={16} className="mr-2" />
                Add Link
              </button>
              <button
                onClick={handleLogout}
                className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Add Bookmark Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`backdrop-blur-xl rounded-2xl shadow-2xl border w-full max-w-md transition-all duration-300 ${
            darkMode
              ? 'bg-gray-800/90 border-gray-600/30'
              : 'bg-white/90 border-white/20'
          }`}>
            <div className="p-6">
              <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Add New Bookmark</h2>
              <form onSubmit={handleAddBookmark} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    URL
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      darkMode
                        ? 'border-gray-600 text-white bg-gray-700/50 placeholder-gray-400'
                        : 'border-gray-300 text-gray-900 bg-white placeholder-gray-500'
                    }`}
                    placeholder="https://example.com"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      darkMode
                        ? 'border-gray-600 text-white bg-gray-700/50 placeholder-gray-400'
                        : 'border-gray-300 text-gray-900 bg-white placeholder-gray-500'
                    }`}
                    placeholder="tech, article, tutorial"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className={`px-4 py-2 font-medium rounded-md transition-colors duration-200 ${
                      darkMode
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingBookmark}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {addingBookmark ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </div>
                    ) : (
                      'Add Bookmark'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 bg-white/30 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto shadow-2xl border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xs">✨</span>
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Your Link Collection Awaits</h3>
            <p className={`mb-8 max-w-md mx-auto text-lg transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Start building your personal knowledge base with AI-powered summaries
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className={`group relative inline-flex items-center px-8 py-4 backdrop-blur-xl font-semibold rounded-2xl border transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl ${
                darkMode
                  ? 'bg-gray-800/30 text-white border-gray-600/40 hover:bg-gray-700/40 hover:border-gray-500/50'
                  : 'bg-white/20 text-gray-900 border-white/30 hover:bg-white/30 hover:border-white/40'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                darkMode
                  ? 'from-blue-600/20 to-purple-600/20'
                  : 'from-blue-500/10 to-purple-500/10'
              }`}></div>
              <Plus size={20} className="mr-2 relative z-10" />
              <span className="relative z-10">Add Your First Link</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Your Saved Links</h2>
                <p className={`mt-1 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {filteredBookmarks.length} of {bookmarks.length} {bookmarks.length === 1 ? 'link' : 'links'}
                  {selectedTag && <span className="ml-2 text-blue-400">• Filtered by #{selectedTag}</span>}
                  {searchQuery && <span className="ml-2 text-purple-400">• Search: "{searchQuery}"</span>}
                </p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredBookmarks.map((bookmark, index) => (
                <div
                  key={bookmark.id}
                  className={`group relative backdrop-blur-xl rounded-3xl shadow-2xl border overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                    darkMode
                      ? 'bg-gray-800/30 border-gray-600/50 hover:border-gray-500/60'
                      : 'bg-white/20 border-white/30 hover:border-white/40'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  {/* Glass morphism overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    darkMode
                      ? 'from-white/5 via-white/2 to-transparent'
                      : 'from-white/10 via-white/5 to-transparent'
                  }`}></div>

                  {/* Subtle glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    darkMode
                      ? 'from-blue-500/10 via-purple-500/10 to-pink-500/10'
                      : 'from-blue-400/5 via-purple-400/5 to-pink-400/5'
                  }`}></div>
                  <div className="relative p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="relative">
                          <div className={`w-12 h-12 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border transition-all duration-300 ${
                            darkMode
                              ? 'bg-gray-700/50 border-gray-600/30 group-hover:border-gray-500/40'
                              : 'bg-white/30 border-white/20 group-hover:border-white/30'
                          }`}>
                            <img
                              src={bookmark.favicon || `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`}
                              alt="Favicon"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzM3NDE1MSIvPgo8cGF0aCBkPSJNMTYgOEMxMi42ODYzIDggMTAgMTAuNjg2MyAxMCAxNEMxMCAxNy4zMTM3IDEyLjY4NjMgMjAgMTYgMjBDMTkuMzEzNyAyMCAyMiAxNy4zMTM3IDIyIDE0QzIyIDEwLjY4NjMgMTkuMzEzNyA4IDE2IDhaIiBmaWxsPSIjNjM2NjZCIi8+CjxwYXRoIGQ9Ik0xNiAxMkMxNS40NDc3IDEyIDE1IDEyLjQ0NzcgMTUgMTNDMTUgMTMuNTUyMyAxNS40NDc3IDE0IDE2IDE0QzE2LjU1MjMgMTQgMTcgMTMuNTUyMyAxNyAxM0MxNyAxMi40NDc3IDE2LjU1MjMgMTIgMTYgMTJaIiBmaWxsPSIjOUI5Q0E0Ii8+CjxwYXRoIGQ9Ik0xNiAxNkMxNS40NDc3IDE2IDE1IDE2LjQ0NzcgMTUgMTdDMTUgMTcuNTUyMyAxNS40NDc3IDE4IDE2IDE4QzE2LjU1MjMgMTggMTcgMTcuNTUyMyAxNyAxN0MxNyAxNi40NDc3IDE2LjU1MjMgMTYgMTYgMTZaIiBmaWxsPSIjOUI5Q0E0Ii8+Cjwvc3ZnPgo=';
                              }}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {bookmark.title}
                          </h3>
                          <p className={`text-sm truncate transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {new URL(bookmark.url).hostname}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 transform hover:scale-110 border border-white/20 hover:border-white/30"
                          title="Open link"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button
                          onClick={() => handleDeleteBookmark(bookmark.id)}
                          className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 transform hover:scale-110 border border-white/20 hover:border-white/30"
                          title="Delete bookmark"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className={`relative backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 ${
                        darkMode
                          ? 'bg-gray-800/20 border-gray-600/30 group-hover:border-gray-500/40'
                          : 'bg-white/10 border-white/20 group-hover:border-white/30'
                      }`}>
                        <div className="absolute top-3 right-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                        </div>
                        <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-800'
                        }`}>
                          {bookmark.summary || 'AI summary will appear here...'}
                        </p>
                      </div>
                    </div>

                    {parseTags(bookmark.tags).length > 0 && (
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {parseTags(bookmark.tags).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-sm border transition-all duration-200 transform hover:scale-105 ${
                                darkMode
                                  ? 'bg-gray-700/30 text-gray-300 border-gray-600/40 hover:border-gray-500/50'
                                  : 'bg-white/20 text-gray-800 border-white/30 hover:border-white/40'
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={`flex items-center justify-between pt-6 border-t transition-colors duration-300 ${
                      darkMode ? 'border-gray-600/30' : 'border-white/20'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className={`text-xs font-medium transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-700'
                          }`}>
                            {formatDate(bookmark.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="AI Summary Generated"></div>
                          <span className={`text-xs font-semibold transition-colors duration-300 ${
                            darkMode ? 'text-green-400' : 'text-green-700'
                          }`}>AI</span>
                        </div>
                      </div>
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center px-4 py-2 backdrop-blur-sm text-sm font-semibold rounded-xl border transition-all duration-200 transform hover:scale-105 ${
                          darkMode
                            ? 'bg-gray-700/30 text-gray-300 border-gray-600/40 hover:bg-gray-600/40 hover:border-gray-500/50'
                            : 'bg-white/20 text-gray-800 border-white/30 hover:bg-white/30 hover:border-white/40'
                        }`}
                      >
                        <ExternalLink size={14} className="mr-2" />
                        Visit
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
