import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import BottomNav from '../components/BottomNav';
import { Users, FileText, Link } from 'lucide-react';

export default function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: Users, label: 'Total de Usuários', value: stats?.total_users || 0, color: 'bg-blue-100 text-blue-600' },
    { icon: FileText, label: 'Total de Posts', value: stats?.total_posts || 0, color: 'bg-green-100 text-green-600' },
    { icon: Link, label: 'Total de Matches', value: stats?.total_matches || 0, color: 'bg-purple-100 text-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-background pb-20" data-testid="admin-dashboard">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 glassmorphism">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-heading font-bold text-textPrimary">Dashboard Admin</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-textMuted">Carregando estatísticas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div 
                  key={card.label}
                  className="bg-white rounded-3xl p-6 shadow-card"
                  data-testid={`stat-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center mb-4`}>
                    <Icon size={24} />
                  </div>
                  <p className="text-textMuted text-sm mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-textPrimary">{card.value}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
