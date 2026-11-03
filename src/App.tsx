import { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CalendarView } from './pages/CalendarView';
import { CallLogsView } from './pages/CallLogsView';
import { PublicBookingPage } from './pages/PublicBookingPage';
import { AnalyticsView } from './pages/AnalyticsView';
import { DoctorDirectoryManager } from './pages/DoctorDirectoryManager';
import { api } from './services/api';
import { AUTH_EXPIRED_EVENT, clearSession, getToken, setSession } from './services/session';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // A stored token is only a claim: ask the server whether it still works (and refresh the
    // stored user) before showing anything. A dead or old fake token sends us to the login page.
    const token = getToken();
    if (!token) {
      setCheckingAuth(false);
      return;
    }

    let cancelled = false;
    api
      .getMe()
      .then((user) => {
        if (cancelled) return;
        setSession(token, user);
        setIsLoggedIn(true);
      })
      .catch(() => {
        if (cancelled) return;
        clearSession();
        setIsLoggedIn(false);
      })
      .finally(() => {
        if (!cancelled) setCheckingAuth(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // The API client raises this when the server rejects the token (expired or user disabled).
    const onExpired = () => setIsLoggedIn(false);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const handleLogout = () => {
    clearSession();
    setIsLoggedIn(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
      {activeTab === 'calendar' && <CalendarView />}
      {activeTab === 'doctor-schedules' && <DoctorDirectoryManager />}
      {activeTab === 'logs' && <CallLogsView />}
      {activeTab === 'book-online' && <PublicBookingPage />}
      {activeTab === 'analytics' && <AnalyticsView />}
    </Layout>
  );
}

export default App;




