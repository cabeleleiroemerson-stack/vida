import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(roleFromUrl || 'migrant');
  const [loading, setLoading] = useState(false);
  
  // Campos para voluntários
  const [professionalArea, setProfessionalArea] = useState('legal');
  const [specialties, setSpecialties] = useState('');
  const [availability, setAvailability] = useState('');
  const [experience, setExperience] = useState('');

  const professionalAreas = [
    { value: 'legal', label: 'Jurídico', icon: '⚖️' },
    { value: 'health', label: 'Saúde', icon: '🏥' },
    { value: 'education', label: 'Educação', icon: '📚' },
    { value: 'translation', label: 'Tradução', icon: '🌍' },
    { value: 'family', label: 'Família e Social', icon: '👨‍👩‍👧' },
    { value: 'employment', label: 'Orientação Profissional', icon: '💼' },
    { value: 'housing', label: 'Habitação', icon: '🏠' },
    { value: 'administration', label: 'Administração', icon: '📋' },
    { value: 'finance', label: 'Finanças', icon: '💰' },
    { value: 'technology', label: 'Tecnologia', icon: '💻' }
  ];

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password }
        : { 
            email, 
            password, 
            name, 
            role, 
            languages: ['pt', 'fr'],
            ...(role === 'volunteer' && {
              professional_area: professionalArea,
              professional_specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
              availability,
              experience
            })
          };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        toast.success(isLogin ? 'Login bem-sucedido!' : 'Conta criada com sucesso!');
        navigate('/home');
      } else {
        toast.error(data.detail || 'Erro ao autenticar');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/50 transition-all"
        data-testid="back-button"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-card p-8 animate-fade-in" data-testid="auth-form">
        <h2 className="text-3xl font-heading font-bold text-textPrimary mb-6 text-center">
          {isLogin ? t('login') : t('register')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                data-testid="name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="rounded-xl"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              data-testid="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>

          {!isLogin && (
            <div>
              <Label>Você é</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <button
                  type="button"
                  data-testid="role-migrant"
                  onClick={() => setRole('migrant')}
                  className={`py-3 px-2 rounded-xl font-medium transition-all text-sm ${
                    role === 'migrant'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('migrant')}
                </button>
                <button
                  type="button"
                  data-testid="role-helper"
                  onClick={() => setRole('helper')}
                  className={`py-3 px-2 rounded-xl font-medium transition-all text-sm ${
                    role === 'helper'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('helper')}
                </button>
                <button
                  type="button"
                  data-testid="role-volunteer"
                  onClick={() => setRole('volunteer')}
                  className={`py-3 px-2 rounded-xl font-medium transition-all text-sm ${
                    role === 'volunteer'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🤝 Voluntário
                </button>
              </div>
            </div>
          )}

          {!isLogin && role === 'volunteer' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-xl border-2 border-primary/20">
              <h3 className="font-bold text-primary">Informações Profissionais</h3>
              
              <div>
                <Label>Área de Atuação</Label>
                <select
                  value={professionalArea}
                  onChange={(e) => setProfessionalArea(e.target.value)}
                  className="w-full mt-1 p-3 border rounded-xl bg-white"
                >
                  {professionalAreas.map(area => (
                    <option key={area.value} value={area.value}>
                      {area.icon} {area.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Especialidades (separadas por vírgula)</Label>
                <Input
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="Ex: Direito de Família, Asilo, Imigração"
                  className="rounded-xl mt-1"
                />
              </div>

              <div>
                <Label>Disponibilidade</Label>
                <Input
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="Ex: Fins de semana, Noites"
                  className="rounded-xl mt-1"
                />
              </div>

              <div>
                <Label>Experiência</Label>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Descreva sua experiência profissional..."
                  rows={3}
                  className="w-full mt-1 p-3 border rounded-xl bg-white"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            data-testid="submit-button"
            disabled={loading}
            className="w-full rounded-full py-6 text-lg font-bold bg-primary hover:bg-primary-hover"
          >
            {loading ? 'Carregando...' : (isLogin ? t('login') : t('register'))}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            data-testid="toggle-auth-mode"
            onClick={() => setIsLogin(!isLogin)}
            className="text-textSecondary hover:text-primary transition-colors"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </button>
        </div>
      </div>
    </div>
  );
}
