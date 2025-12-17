import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { AdminLayout } from './components/AdminLayout';
import { VolunteerLayout } from './components/VolunteerLayout';
import { VolunteerIntranet } from './components/volunteer/VolunteerIntranet';
import { UserIntranet } from './components/UserIntranet';
import { ServerStatus } from './components/ServerStatus';
import { initializeData } from './hooks/useApi';
import { projectId, publicAnonKey } from './utils/supabase/info.tsx';
import { NotificationProvider } from './contexts/NotificationContext';

type View = 'landing' | 'login' | 'register' | 'admin' | 'volunteer-intranet' | 'user-intranet';
type UserType = 'admin' | 'admin_master' | 'volunteer' | 'user' | null;

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

    if (storedAuth === 'true' && storedVolunteerEmail === 'admin@iiap.org') {
      // Admin master logged in
      const adminUser = {
        id: 'admin-master-001',
        name: 'Administrador Master',
        email: 'admin@iiap.org',
        role: 'admin_master',
        phone: '+51 065 265515',
        area: 'Administración General',
      };
      setCurrentVolunteer(adminUser);
      setUserType('admin');
      setCurrentView('admin');
    } else if (storedAuth === 'true') {
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
        } else if (result.data.role === 'user') {
          // Regular users go to their own intranet
          setUserType('user');
          setCurrentView('user-intranet');
        } else {
          // Fallback for unknown roles
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
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        localStorage.setItem('iiap_volunteer_email', email);
        setCurrentVolunteer(result.data);

        // Determine user type and auth persistence
        let newUserType: UserType = null;
        if (result.data.role === 'admin' || result.data.role === 'admin_master') {
          localStorage.setItem('iiap_admin_auth', 'true');
          newUserType = 'admin';
        } else if (result.data.role === 'volunteer') {
          newUserType = 'volunteer';
        } else if (result.data.role === 'user') {
          newUserType = 'user';
        }
        setUserType(newUserType);

        // Check for pending postulation
        const pendingPostulationId = localStorage.getItem('pendingPostulationId');

        if (pendingPostulationId) {
          // If there is a pending postulation, go to landing to complete it
          setCurrentView('landing');
        } else {
          // Normal flow: Set view based on role
          if (newUserType === 'admin') {
            setCurrentView('admin');
          } else if (newUserType === 'volunteer') {
            setCurrentView('volunteer-intranet');
          } else if (newUserType === 'user') {
            setCurrentView('user-intranet');
          } else {
            setCurrentView('landing');
          }
        }

        setLoginError('');
      } else {
        throw new Error(result.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error al iniciar sesión');
    }
  };

  const handlePostulationSuccess = () => {
    if (currentVolunteer) {
      // Store a flash message for the intranet to read (optional, or just redirect)
      localStorage.setItem('postulation_success_message', 'true');

      if (currentVolunteer.role === 'volunteer') {
        setCurrentView('volunteer-intranet');
      } else if (currentVolunteer.role === 'user') {
        setCurrentView('user-intranet');
      } else if (currentVolunteer.role === 'admin' || currentVolunteer.role === 'admin_master') {
        // Admins might apply too? If so, go to admin
        setCurrentView('admin');
      }
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
    // Check if user is logged in
    const storedVolunteerEmail = localStorage.getItem('iiap_volunteer_email');
    if (storedVolunteerEmail && currentVolunteer) {
      // Already logged in, redirect based on role
      if (currentVolunteer.role === 'admin' || currentVolunteer.role === 'admin_master') {
        // Admins go to admin panel - applications section
        setCurrentView('admin');
      } else if (currentVolunteer.role === 'volunteer') {
        // Volunteers go to volunteer intranet
        setCurrentView('volunteer-intranet');
      } else if (currentVolunteer.role === 'user') {
        // Regular users stay on landing page (they're already authenticated)
        // They can apply from the convocatorias section
        setCurrentView('landing');
      }
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
      <NotificationProvider>
        <LandingPage
          onLoginClick={() => setCurrentView('login')}
          onPostular={handlePostular}
          onPostulationSuccess={handlePostulationSuccess}
          currentUser={currentVolunteer}
          onGoToIntranet={() => {
            if (currentVolunteer) {
              if (currentVolunteer.role === 'admin' || currentVolunteer.role === 'admin_master') {
                setCurrentView('admin');
              } else if (currentVolunteer.role === 'volunteer') {
                setCurrentView('volunteer-intranet');
              } else if (currentVolunteer.role === 'user') {
                setCurrentView('user-intranet');
              }
            }
          }}
        />
        <ServerStatus />
      </NotificationProvider>
    );
  }

  if (currentView === 'login') {
    return (
      <NotificationProvider>
        <LoginPage
          onLogin={handleLogin}
          onBack={() => setCurrentView('landing')}
          onRegister={() => setCurrentView('register')}
          error={loginError}
        />
      </NotificationProvider>
    );
  }

  if (currentView === 'register') {
    return (
      <NotificationProvider>
        <RegisterPage
          onBack={() => setCurrentView('login')}
          onSuccess={() => setCurrentView('login')}
        />
      </NotificationProvider>
    );
  }

  if (currentView === 'admin' && (userType === 'admin' || userType === 'admin_master')) {
    return (
      <NotificationProvider>
        <AdminLayout
          onLogout={handleLogout}
          currentUser={currentVolunteer}
          onUserUpdate={handleUserUpdate}
          onBackToLanding={() => setCurrentView('landing')}
        />
        <ServerStatus />
      </NotificationProvider>
    );
  }

  if (currentView === 'volunteer-intranet' && userType === 'volunteer' && currentVolunteer) {
    return (
      <NotificationProvider>
        <VolunteerLayout
          onLogout={handleLogout}
          currentUser={currentVolunteer}
          onUserUpdate={handleUserUpdate}
          onBackToLanding={() => setCurrentView('landing')}
        />
        <ServerStatus />
      </NotificationProvider>
    );
  }

  if (currentView === 'user-intranet' && userType === 'user' && currentVolunteer) {
    return (
      <NotificationProvider>
        <UserIntranet
          onLogout={handleLogout}
          currentUser={currentVolunteer}
          onUserUpdate={handleUserUpdate}
          onBackToLanding={() => setCurrentView('landing')}
        />
        <ServerStatus />
      </NotificationProvider>
    );
  }

  // Fallback to landing
  return (
    <NotificationProvider>
      <LandingPage
        onLoginClick={() => setCurrentView('login')}
        onPostular={handlePostular}
        onPostulationSuccess={handlePostulationSuccess}
        currentUser={currentVolunteer}
        onGoToIntranet={() => {
          if (currentVolunteer) {
            if (currentVolunteer.role === 'admin' || currentVolunteer.role === 'admin_master') {
              setCurrentView('admin');
            } else if (currentVolunteer.role === 'volunteer') {
              setCurrentView('volunteer-intranet');
            } else if (currentVolunteer.role === 'user') {
              setCurrentView('user-intranet');
            }
          }
        }}
      />
      <ServerStatus />
    </NotificationProvider>
  );
}