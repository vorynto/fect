import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageSquare, Images, Image, Settings, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Stats {
  donations: number
  messages: number
  galleries: number
  sliders: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ donations: 0, messages: 0, galleries: 0, sliders: 0 })
  const [recentDonations, setRecentDonations] = useState<Array<{ name: string; amount: number; created_at: string; status: string }>>([])

  useEffect(() => {
    Promise.all([
      supabase.from('donations').select('*', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
      supabase.from('gallery_albums').select('*', { count: 'exact', head: true }),
      supabase.from('slider_items').select('*', { count: 'exact', head: true }),
      supabase.from('donations').select('name, amount, created_at, status').order('created_at', { ascending: false }).limit(5),
    ]).then(([d, m, g, s, rd]) => {
      setStats({
        donations: d.count || 0,
        messages: m.count || 0,
        galleries: g.count || 0,
        sliders: s.count || 0,
      })
      if (rd.data) setRecentDonations(rd.data)
    })
  }, [])

  const cards = [
    { label: 'Total Donations', value: stats.donations, icon: <Heart size={22} />, path: '/admin/donations', color: '#c0392b' },
    { label: 'Messages', value: stats.messages, icon: <MessageSquare size={22} />, path: '/admin/pages', color: '#2980b9' },
    { label: 'Gallery Albums', value: stats.galleries, icon: <Images size={22} />, path: '/admin/gallery', color: '#27ae60' },
    { label: 'Slider Items', value: stats.sliders, icon: <Image size={22} />, path: '/admin/slider', color: '#8e44ad' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome to FECT Admin Panel</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map(card => (
          <Link
            key={card.label}
            to={card.path}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: card.color }}
              >
                {card.icon}
              </div>
              <ArrowRight size={16} className="text-gray-300" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{card.value}</div>
            <div className="text-sm text-gray-500">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Donations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">Recent Donations</h3>
            <Link to="/admin/donations" className="text-xs font-medium" style={{ color: 'var(--site-primary)' }}>
              View all
            </Link>
          </div>
          {recentDonations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No donations yet</p>
          ) : (
            <div className="space-y-3">
              {recentDonations.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{d.name}</p>
                    <p className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: 'var(--site-primary)' }}>
                      ₹{d.amount.toLocaleString('en-IN')}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      d.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-5">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Update Site Settings', desc: 'Change logo, colors, fonts', path: '/admin/settings', icon: <Settings size={18} /> },
              { label: 'Manage Hero Slider', desc: 'Add/edit homepage slides', path: '/admin/slider', icon: <Image size={18} /> },
              { label: 'Upload Gallery', desc: 'Create new gallery album', path: '/admin/gallery', icon: <Images size={18} /> },
              { label: 'Edit Page Content', desc: 'Update all page text', path: '/admin/pages', icon: <MessageSquare size={18} /> },
            ].map(action => (
              <Link
                key={action.path}
                to={action.path}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: 'var(--site-primary)' }}
                >
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{action.label}</p>
                  <p className="text-xs text-gray-400">{action.desc}</p>
                </div>
                <ArrowRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
