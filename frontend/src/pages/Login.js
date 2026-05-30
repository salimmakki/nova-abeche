import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/chat');
    } catch {
      setError('Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logoBox}>
          <span style={{fontSize:'2.5rem',animation:'pulse 2s infinite'}}>🌾</span>
          <h1 style={S.logoText}>NOVA</h1>
        </div>
        <p style={S.subtitle}>Assistant Agricole IA — Abéché, Tchad</p>
        
        <h2 style={S.h2}>Connexion</h2>
        {error && <div style={S.error}>⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={S.inputBox}>
            <span style={S.icon}>👤</span>
            <input style={S.input} placeholder="Nom d'utilisateur" value={form.username}
              onChange={e => setForm({...form,username:e.target.value})} required />
          </div>
          <div style={S.inputBox}>
            <span style={S.icon}>🔒</span>
            <input style={S.input} type="password" placeholder="Mot de passe" value={form.password}
              onChange={e => setForm({...form,password:e.target.value})} required />
          </div>
          <button style={S.btn} type="submit" disabled={loading}>
            {loading
              ? <span style={S.spinner}></span>
              : '🚀 Se connecter'}
          </button>
        </form>
        <p style={S.link}>Pas de compte ? <Link to="/register">Créer un compte</Link></p>
      </div>
    </div>
  );
}

const S = {
  page:    { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0d0d0d' },
  card:    { background:'#111', padding:'2.5rem', borderRadius:'20px', boxShadow:'0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(144,238,144,0.2)', width:'100%', maxWidth:'420px', animation:'fadeInUp 0.6s ease' },
  logoBox: { display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginBottom:'0.5rem' },
  logoText:{ color:'#90ee90', fontWeight:'bold', fontSize:'2.5rem', letterSpacing:'8px', animation:'novaGlow 3s infinite' },
  subtitle:{ textAlign:'center', color:'#555', marginBottom:'1.5rem', fontSize:'0.85rem' },
  divider: { display:"none" },
  h2:      { color:'#e0e0e0', marginBottom:'1.25rem', fontSize:'1.1rem' },
  error:   { background:'rgba(200,50,0,0.15)', color:'#ff7050', padding:'0.75rem', borderRadius:'10px', marginBottom:'1rem', border:'1px solid rgba(200,50,0,0.3)', animation:'fadeInUp 0.3s ease' },
  inputBox:{ display:'flex', alignItems:'center', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'10px', marginBottom:'1rem', overflow:'hidden', transition:'border-color 0.2s' },
  icon:    { padding:'0 0.75rem', fontSize:'1rem' },
  input:   { flex:1, padding:'0.75rem 0.75rem 0.75rem 0', border:'none', background:'transparent', fontSize:'1rem', color:'#e0e0e0', outline:'none' },
  btn:     { width:'100%', padding:'0.85rem', background:'linear-gradient(135deg, #90ee90, #4CAF50)', color:'#0d0d0d', border:'none', borderRadius:'10px', fontSize:'1rem', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 15px rgba(144,238,144,0.25)' },
  spinner: { width:'20px', height:'20px', border:'3px solid rgba(0,0,0,0.2)', borderTop:'3px solid #0d0d0d', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' },
  link:    { textAlign:'center', marginTop:'1.25rem', color:'#555', fontSize:'0.9rem' },
};
