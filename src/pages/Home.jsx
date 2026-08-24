import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/common/Button'

function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Stay Organized with <span className="text-primary-600">Guide Us</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A modern todo list application that helps you manage tasks, track due dates,
          attach reference images, and mark tasks as completed — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button className="text-lg px-8 py-3">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button className="text-lg px-8 py-3">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" className="text-lg px-8 py-3">Sign In</Button>
              </Link>
            </>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600">Mark tasks as completed and monitor your productivity.</p>
          </div>
          <div className="card">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="text-lg font-semibold mb-2">Due Dates</h3>
            <p className="text-gray-600">Never miss a deadline with date and time tracking.</p>
          </div>
          <div className="card">
            <div className="text-3xl mb-3">🖼️</div>
            <h3 className="text-lg font-semibold mb-2">Reference Images</h3>
            <p className="text-gray-600">Attach images to tasks for better context and clarity.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
