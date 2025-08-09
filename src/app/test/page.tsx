'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-blue-100 to-purple-100"></div>
      
      <div className="relative max-w-md w-full space-y-8">
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-2xl border border-gray-200 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Page</h1>
            <p className="text-gray-600">This is a test page to verify build compatibility.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
