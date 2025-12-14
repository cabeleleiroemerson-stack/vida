import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Check, User, Heart, Shield } from 'lucide-react';

const NEED_CATEGORIES = [
  { value: 'food', label: 'Alimentação', icon: '🍽️', desc: 'Refeições, cestas básicas' },
  { value: 'legal', label: 'Jurídico', icon: '⚖️', desc: 'Documentos, asilo, vistos' },
  { value: 'health', label: 'Saúde', icon: '🏥', desc: 'Médico, psicológico' },
  { value: 'housing', label: 'Moradia', icon: '🏠', desc: 'Abrigo, habitação' },
  { value: 'work', label: 'Emprego', icon: '💼', desc: 'Trabalho, CV, orientação' },
  { value: 'education', label: 'Educação', icon: '📚', desc: 'Cursos, escolarização' },
  { value: 'social', label: 'Apoio Social', icon: '🤝', desc: 'Assistência, integração' },
  { value: 'clothes', label: 'Roupas', icon: '👕', desc: 'Vestuário, calçados' },
  { value: 'furniture', label: 'Móveis', icon: '🪑', desc: 'Móveis, utensílios' },
  { value: 'transport', label: 'Transporte', icon: '🚗', desc: 'Deslocamento, passagens' }
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
  const [step, setStep] = useState(1); // Step 1: Basic info, Step 2: Categories (for migrants)
  
  // Campos para migrantes - categorias de necessidade
  const [needCategories, setNeedCategories] = useState([]);
  
  // Campos para voluntários (cadastro rápido)
  const [professionalArea, setProfessionalArea] = useState('legal');
  const [specialties, setSpecialties] = useState('');
  const [availability, setAvailability] = useState('');
  const [experience, setExperience] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const toggleNeedCategory = (category) => {
    setNeedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Se é cadastro de migrante e está na etapa 1, vai para etapa 2
    if (!isLogin && role === 'migrant' && step === 1) {
      setStep(2);
      return;
    }
    
    // Validação para migrantes
    if (!isLogin && role === 'migrant' && needCategories.length === 0) {
      toast.error('Selecione pelo menos uma categoria de ajuda que você precisa');
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
              need_categories: needCategories
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
        {/* Step indicator for migrant registration */}
        {!isLogin && role === 'migrant' && (
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
          {isLogin ? t('login') : (
            step === 1 ? t('register') : 'O que você precisa?'
          )}
        </h2>
        
        {!isLogin && step === 2 && role === 'migrant' && (
          <p className="text-center text-textSecondary mb-6">
            Selecione as áreas em que você precisa de ajuda
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
                      onClick={() => setRole('migrant')}
                      className={`py-4 px-3 rounded-xl font-medium transition-all text-sm flex flex-col items-center gap-2 ${
                        role === 'migrant'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <User size={24} />
                      <span>Preciso de Ajuda</span>
                    </button>
                    <button
                      type="button"
                      data-testid="role-helper"
                      onClick={() => setRole('helper')}
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

          {/* Step 2: Need Categories (for migrants only) */}
          {!isLogin && step === 2 && role === 'migrant' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {NEED_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => toggleNeedCategory(cat.value)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      needCategories.includes(cat.value)
                        ? 'bg-primary text-white border-primary shadow-lg'
                        : 'bg-white border-gray-200 hover:border-primary hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <div className={`text-sm font-bold ${needCategories.includes(cat.value) ? 'text-white' : 'text-textPrimary'}`}>
                          {cat.label}
                        </div>
                        <div className={`text-xs ${needCategories.includes(cat.value) ? 'text-white/80' : 'text-textSecondary'}`}>
                          {cat.desc}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {needCategories.length > 0 && (
                <div className="p-3 bg-green-100 rounded-xl border border-green-300">
                  <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                    <Check size={18} />
                    {needCategories.length} categoria{needCategories.length > 1 ? 's' : ''} selecionada{needCategories.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            data-testid="submit-button"
            disabled={loading}
            className="w-full rounded-full py-6 text-lg font-bold bg-primary hover:bg-primary-hover"
          >
            {loading ? 'Carregando...' : (
              isLogin ? t('login') : (
                step === 1 && role === 'migrant' ? 'Próximo' : t('register')
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
              setNeedCategories([]);
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
