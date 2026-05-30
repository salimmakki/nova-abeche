import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login    from './pages/Login';
import Register from './pages/Register';
import Chat     from './pages/Chat';
import Cultures from './pages/Cultures';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#90ee90',background:'#0d0d0d',fontSize:'1.2rem'}}>⏳ Chargement NOVA...</div>;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#90ee90',background:'#0d0d0d',fontSize:'1.2rem'}}>⏳ Chargement NOVA...</div>;
  return user ? <Navigate to="/chat" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"         element={<Navigate to="/chat" />} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/chat"     element={<PrivateRoute><Chat /></PrivateRoute>} />
      <Route path="/cultures" element={<PrivateRoute><Cultures /></PrivateRoute>} />
      <Route path="*"         element={<Navigate to="/chat" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
