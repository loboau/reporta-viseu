import React from 'react'
import Link from 'next/link'
import { LayoutDashboard, FileText, FolderTree, Settings } from 'lucide-react'

export const metadata = {
  title: 'Admin - Viseu Reporta',
  description: 'Administrative dashboard for managing reports',
}

interface NavLinkProps {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  isActive?: boolean
}

function NavLink({ href, icon, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-white hover:text-viseu-dark hover:shadow-soft transition-all duration-200 font-medium"
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 p-6 flex flex-col">
        <div className="mb-8">
          <Link href="/admin" className="block">
            <h1 className="text-2xl font-bold text-viseu-dark">
              Viseu <span className="text-viseu-gold">Reporta</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">Admin Dashboard</p>
          </Link>
        </div>

        <nav className="flex-1 space-y-2">
          <NavLink href="/admin" icon={<LayoutDashboard size={20} />}>
            Dashboard
          </NavLink>
          <NavLink href="/admin/reports" icon={<FileText size={20} />}>
            Reports
          </NavLink>
          <NavLink href="/admin/categories" icon={<FolderTree size={20} />}>
            Categories
          </NavLink>
          <NavLink href="/admin/settings" icon={<Settings size={20} />}>
            Settings
          </NavLink>
        </nav>

        <div className="pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-viseu-dark transition-colors"
          >
            Back to Public Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  )
}
