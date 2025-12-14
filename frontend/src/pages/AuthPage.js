import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Check, User, Heart, Shield } from 'lucide-react';

const HELP_CATEGORIES = [
  { value: 'food', label: 'Alimentação', icon: '🍽️', desc: 'Distribuição de alimentos, refeições' },
  { value: 'legal', label: 'Jurídico', icon: '⚖️', desc: 'Orientação sobre documentos' },
  { value: 'health', label: 'Saúde', icon: '🏥', desc: 'Acompanhamento médico' },
  { value: 'housing', label: 'Moradia', icon: '🏠', desc: 'Ajuda com habitação' },
  { value: 'work', label: 'Emprego', icon: '💼', desc: 'Orientação profissional' },
  { value: 'education', label: 'Educação', icon: '📚', desc: 'Aulas, cursos, idiomas' },
  { value: 'social', label: 'Apoio Social', icon: '🤝', desc: 'Integração, acolhimento' },
  { value: 'clothes', label: 'Roupas', icon: '👕', desc: 'Doação de vestuário' },
  { value: 'furniture', label: 'Móveis', icon: '🪑', desc: 'Doação de móveis' },
  { value: 'transport', label: 'Transporte', icon: '🚗', desc: 'Ajuda com deslocamento' }
];

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

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(roleFromUrl || 'migrant');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Categorias selecionadas (para migrant = necessidades, para helper = áreas que quer ajudar)
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  // Campos para voluntários (cadastro rápido)
  const [professionalArea, setProfessionalArea] = useState('legal');
  const [specialties, setSpecialties] = useState('');
  const [availability, setAvailability] = useState('');
  const [experience, setExperience] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Se é cadastro de migrante ou helper e está na etapa 1, vai para etapa 2
    if (!isLogin && (role === 'migrant' || role === 'helper') && step === 1) {
      setStep(2);
      return;
    }
    
    // Validação para migrantes e helpers
    if (!isLogin && (role === 'migrant' || role === 'helper') && selectedCategories.length === 0) {
      toast.error(role === 'migrant' 
        ? 'Selecione pelo menos uma categoria de ajuda que você precisa'
        : 'Selecione pelo menos uma categoria que você quer ajudar'
      );
      return;
    }
    
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
            ...(role === 'migrant' && {
              need_categories: selectedCategories
            }),
            ...(role === 'helper' && {
              help_categories: selectedCategories
            }),
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

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  const getStepTitle = () => {
    if (isLogin) return t('login');
    if (step === 1) return t('register');
    if (role === 'migrant') return 'O que você precisa?';
    if (role === 'helper') return 'Como você quer ajudar?';
    return t('register');
  };

  const getStepSubtitle = () => {
    if (step === 2 && role === 'migrant') return 'Selecione as áreas em que você precisa de ajuda';
    if (step === 2 && role === 'helper') return 'Selecione as áreas em que você pode oferecer ajuda';
    return null;
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <button
        onClick={goBack}
        className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/50 transition-all"
        data-testid="back-button"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-card p-8 animate-fade-in" data-testid="auth-form">
        {/* Step indicator for registration */}
        {!isLogin && (role === 'migrant' || role === 'helper') && (
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
            </div>
          </div>
        )}

        <h2 className="text-3xl font-heading font-bold text-textPrimary mb-2 text-center">
          {getStepTitle()}
        </h2>
        
        {getStepSubtitle() && (
          <p className="text-center text-textSecondary mb-6">
            {getStepSubtitle()}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Basic Information */}
          {(isLogin || step === 1) && (
            <>
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
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      data-testid="role-migrant"
                      onClick={() => { setRole('migrant'); setSelectedCategories([]); }}
                      className={`py-4 px-3 rounded-xl font-medium transition-all text-sm flex flex-col items-center gap-2 ${
                        role === 'migrant'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <User size={24} />
                      <span>Preciso de Ajuda</span>
                    </button>
                    <button
                      type="button"
                      data-testid="role-helper"
                      onClick={() => { setRole('helper'); setSelectedCategories([]); }}
                      className={`py-4 px-3 rounded-xl font-medium transition-all text-sm flex flex-col items-center gap-2 ${
                        role === 'helper'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Heart size={24} />
                      <span>Quero Ajudar</span>
                    </button>
                  </div>
                </div>
              )}

              {!isLogin && role === 'volunteer' && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-xl border-2 border-primary/20">
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <Shield size={20} />
                    Informações Profissionais
                  </h3>
                  
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
            </>
          )}

          {/* Step 2: Categories (for migrants and helpers) */}
          {!isLogin && step === 2 && (role === 'migrant' || role === 'helper') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {HELP_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => toggleCategory(cat.value)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedCategories.includes(cat.value)
                        ? role === 'migrant' 
                          ? 'bg-green-600 text-white border-green-600 shadow-lg'
                          : 'bg-primary text-white border-primary shadow-lg'
                        : 'bg-white border-gray-200 hover:border-primary hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <div className={`text-sm font-bold ${selectedCategories.includes(cat.value) ? 'text-white' : 'text-textPrimary'}`}>
                          {cat.label}
                        </div>
                        <div className={`text-xs ${selectedCategories.includes(cat.value) ? 'text-white/80' : 'text-textSecondary'}`}>
                          {cat.desc}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {selectedCategories.length > 0 && (
                <div className={`p-3 rounded-xl border ${
                  role === 'migrant' 
                    ? 'bg-green-100 border-green-300' 
                    : 'bg-primary/10 border-primary/30'
                }`}>
                  <p className={`text-sm font-medium flex items-center gap-2 ${
                    role === 'migrant' ? 'text-green-800' : 'text-primary'
                  }`}>
                    <Check size={18} />
                    {selectedCategories.length} categoria{selectedCategories.length > 1 ? 's' : ''} selecionada{selectedCategories.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            data-testid="submit-button"
            disabled={loading}
            className={`w-full rounded-full py-6 text-lg font-bold ${
              role === 'migrant' && !isLogin
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            {loading ? 'Carregando...' : (
              isLogin ? t('login') : (
                step === 1 && (role === 'migrant' || role === 'helper') ? 'Próximo' : t('register')
              )
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            data-testid="toggle-auth-mode"
            onClick={() => {
              setIsLogin(!isLogin);
              setStep(1);
              setSelectedCategories([]);
            }}
            className="text-textSecondary hover:text-primary transition-colors"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </button>
        </div>
      </div>
    </div>
  );
}
