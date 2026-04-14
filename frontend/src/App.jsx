import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import LoginPage     from './pages/LoginPage.jsx';
import RegisterPage  from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DeckPage      from './pages/DeckPage.jsx';
import StudyPage     from './pages/StudyPage.jsx';
import Navbar        from './components/layout/Navbar.jsx';

function Protected({ children }) {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" replace />;
}
function Guest({ children }) {
  const token = useAuthStore(s => s.token);
  return !token ? children : <Navigate to="/" replace />;
}

function AppShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 32px' }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Guest><LoginPage /></Guest>} />
      <Route path="/register" element={<Guest><RegisterPage /></Guest>} />
      <Route path="/" element={<Protected><AppShell><DashboardPage /></AppShell></Protected>} />
      <Route path="/deck/:id" element={<Protected><AppShell><DeckPage /></AppShell></Protected>} />
      <Route path="/study/:id" element={<Protected><StudyPage /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
