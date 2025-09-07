import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-600">© {new Date().getFullYear()} Astrape - Built for internship assignment by Achintya Mahajan</div>
          <div className="flex gap-4 text-sm">

            <a href="https://github.com/AVM08122005" target='_blank' className="text-slate-600 hover:text-slate-900">GitHub</a>

          </div>
        </div>
      </footer>
  )
}

export default Footer

      