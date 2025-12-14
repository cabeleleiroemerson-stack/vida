import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import BottomNav from '../components/BottomNav';
import { User, Mail, Globe, LogOut, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-20" data-testid="profile-page">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 glassmorphism">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-heading font-bold text-textPrimary">{t('profile')}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-white rounded-3xl p-8 shadow-card space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User size={48} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-textPrimary" data-testid="user-name">
                {user?.name}
              </h2>
              <p className="text-textMuted capitalize" data-testid="user-role">
                {user?.role === 'migrant' ? t('migrant') : user?.role === 'helper' ? t('helper') : user?.role}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div className="flex items-center gap-3 text-textSecondary">
              <Mail size={20} />
              <span data-testid="user-email">{user?.email}</span>
            </div>
            {user?.languages && user.languages.length > 0 && (
              <div className="flex items-center gap-3 text-textSecondary">
                <Globe size={20} />
                <div className="flex gap-2">
                  {user.languages.map(lang => (
                    <span key={lang} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {lang.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {user?.bio && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-textPrimary mb-2">Sobre</h3>
              <p className="text-textSecondary leading-relaxed">{user.bio}</p>
            </div>
          )}

          <div className="border-t border-gray-100 pt-6">
            <Button
              data-testid="logout-button"
              onClick={handleLogout}
              variant="outline"
              className="w-full rounded-full py-6 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut size={20} className="mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
