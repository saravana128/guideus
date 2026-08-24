import React from 'react'

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Guide Us. Built with React & Appwrite.</p>
      </div>
    </footer>
  )
}

export default Footer
