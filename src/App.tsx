import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { AdminLayout } from './components/AdminLayout';
import { VolunteerIntranet } from './components/volunteer/VolunteerIntranet';
import { initializeData } from './hooks/useApi';
import { projectId, publicAnonKey } from './utils/supabase/info.tsx';

type View = 'landing' | 'login' | 'register' | 'admin' | 'volunteer-intranet';
type UserType = 'admin' | 'volunteer' | null;

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f99e977c`;

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [initialized, setInitialized] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [userType, setUserType] = useState<UserType>(null);
  const [currentVolunteer, setCurrentVolunteer] = useState<any>(null);

  useEffect(() => {
    // Initialize data on first load
    const init = async () => {
      try {
        await initializeData();
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing data:', error);
        setInitialized(true); // Continue anyway
      }
    };
    init();

    // Check if user is already logged in
    const storedAuth = localStorage.getItem('iiap_admin_auth');
    const storedVolunteerEmail = localStorage.getItem('iiap_volunteer_email');

    if (storedAuth === 'true') {
      setUserType('admin');
      setCurrentView('admin');
    } else if (storedVolunteerEmail) {
      // Load volunteer data
      loadVolunteer(storedVolunteerEmail);
    }
  }, []);

  const loadVolunteer = async (email: string) => {
    try {
      const response = await fetch(`${API_URL}/user-auth/${email}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const result = await response.json();
      if (result.success && result.data) {
        setCurrentVolunteer(result.data);
        
        // Check user role and set view accordingly
        if (result.data.role === 'admin_master' || result.data.role === 'admin') {
          localStorage.setItem('iiap_admin_auth', 'true');
          setUserType('admin');
          setCurrentView('admin');
        } else if (result.data.role === 'volunteer') {
          setUserType('volunteer');
          setCurrentView('volunteer-intranet');
        } else {
          // Regular user - redirect to landing
          setUserType(null);
          setCurrentView('landing');
        }
      } else {
        localStorage.removeItem('iiap_volunteer_email');
      }
    } catch (error) {
      console.error('Error loading volunteer:', error);
      localStorage.removeItem('iiap_volunteer_email');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    // Check for hardcoded admin credentials
    if (email === 'admin@iiap.org' && password === 'admin123') {
      localStorage.setItem('iiap_admin_auth', 'true');
      localStorage.setItem('iiap_volunteer_email', email);
      setUserType('admin');
      setCurrentView('admin');
      setLoginError('');
      return;
    }

    // Otherwise, check database for user
    try {
      const response = await fetch(`${API_URL}/user-auth/${email}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const result = await response.json();

      if (result.success && result.data) {
        // Check password (stored in localStorage for this demo)
        const storedPassword = localStorage.getItem(`user_pass_${email}`);
        if (storedPassword === password) {
          localStorage.setItem('iiap_volunteer_email', email);
          setCurrentVolunteer(result.data);
          
          // Set view based on role
          if (result.data.role === 'admin' || result.data.role === 'admin_master') {
            localStorage.setItem('iiap_admin_auth', 'true');
            setUserType('admin');
            setCurrentView('admin');
          } else {
            setUserType('volunteer');
            setCurrentView('volunteer-intranet');
          }
          
          setLoginError('');
        } else {
          throw new Error('Contraseña incorrecta');
        }
      } else {
        throw new Error('Email no registrado');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error al iniciar sesión');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('iiap_admin_auth');
    localStorage.removeItem('iiap_volunteer_email');
    setUserType(null);
    setCurrentVolunteer(null);
    setCurrentView('landing');
  };

  const handleUserUpdate = (updatedUser: any) => {
    setCurrentVolunteer(updatedUser);
  };

  const handlePostular = (convocatoriaId?: string) => {
    // Check if volunteer is logged in
    const storedVolunteerEmail = localStorage.getItem('iiap_volunteer_email');
    if (storedVolunteerEmail && currentVolunteer) {
      // Already logged in, go to intranet
      setCurrentView('volunteer-intranet');
    } else {
      // Not logged in, go to login
      setCurrentView('login');
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Inicializando sistema...</div>
      </div>
    );
  }

  if (currentView === 'landing') {
    return (
      <LandingPage
        onLoginClick={() => setCurrentView('login')}
        onPostular={handlePostular}
      />
    );
  }

  if (currentView === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onBack={() => setCurrentView('landing')}
        onRegister={() => setCurrentView('register')}
        error={loginError}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <RegisterPage
        onBack={() => setCurrentView('login')}
        onSuccess={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'admin' && userType === 'admin') {
    return <AdminLayout onLogout={handleLogout} currentUser={currentVolunteer} onUserUpdate={handleUserUpdate} />;
  }

  if (currentView === 'volunteer-intranet' && userType === 'volunteer' && currentVolunteer) {
    return <VolunteerIntranet volunteer={currentVolunteer} onLogout={handleLogout} onVolunteerUpdate={handleUserUpdate} />;
  }

  // Fallback to landing
  return (
    <LandingPage
      onLoginClick={() => setCurrentView('login')}
      onPostular={handlePostular}
    />
  );
}