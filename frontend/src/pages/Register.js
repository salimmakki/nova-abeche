import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ username:'', email:'', password:'', first_name:'', langue:'fr' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/chat');
    } catch {
      setError('Erreur. Vérifiez que le nom d\'utilisateur n\'a pas d\'espace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logoBox}>
          <span style={{fontSize:'2rem',animation:'pulse 2s infinite'}}>🌾</span>
          <h1 style={S.logoText}>NOVA</h1>
        </div>
        <p style={S.subtitle}>Assistant Agricole IA — Abéché, Tchad</p>
        
        <h2 style={S.h2}>Créer un compte</h2>
        {error && <div style={S.error}>⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          {[
            {key:'first_name', icon:'👤', ph:'Prénom',                        type:'text'},
            {key:'username',   icon:'🆔', ph:'Nom d\'utilisateur (sans espace) *', type:'text'},
            {key:'email',      icon:'📧', ph:'Email',                          type:'email'},
            {key:'password',   icon:'🔒', ph:'Mot de passe (min 6) *',         type:'password'},
          ].map(f => (
            <div key={f.key} style={S.inputBox}>
              <span style={S.icon}>{f.icon}</span>
              <input style={S.input} type={f.type} placeholder={f.ph}
                value={form[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})}
                required={f.key==='username'||f.key==='password'} />
            </div>
          ))}
          <div style={S.inputBox}>
            <span style={S.icon}>🌍</span>
            <select style={{...S.input,cursor:'pointer'}} value={form.langue}
              onChange={e => setForm({...form,langue:e.target.value})}>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          <button style={S.btn} type="submit" disabled={loading}>
            {loading
              ? <span style={{width:'20px',height:'20px',border:'3px solid rgba(0,0,0,0.2)',borderTop:'3px solid #0d0d0d',borderRadius:'50%',animation:'spin 0.8s linear infinite',display:'inline-block'}}></span>
              : '✨ Créer le compte'}
          </button>
        </form>
        <p style={S.link}>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
      </div>
    </div>
  );
}

const S = {
  page:    { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0d0d0d' },
  card:    { background:'#111', padding:'2.5rem', borderRadius:'20px', boxShadow:'0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(144,238,144,0.2)', width:'100%', maxWidth:'420px', animation:'fadeInUp 0.6s ease' },
  logoBox: { display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'0.5rem' },
  logoText:{ color:'#90ee90', fontWeight:'bold', fontSize:'2rem', letterSpacing:'6px', animation:'novaGlow 3s infinite' },
  subtitle:{ textAlign:'center', color:'#555', marginBottom:'1.5rem', fontSize:'0.85rem' },
  divider: { display:"none" },
  h2:      { color:'#e0e0e0', marginBottom:'1.25rem', fontSize:'1.1rem' },
  error:   { background:'rgba(200,50,0,0.15)', color:'#ff7050', padding:'0.75rem', borderRadius:'10px', marginBottom:'1rem', border:'1px solid rgba(200,50,0,0.3)' },
  inputBox:{ display:'flex', alignItems:'center', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'10px', marginBottom:'0.85rem', overflow:'hidden' },
  icon:    { padding:'0 0.75rem', fontSize:'1rem' },
  input:   { flex:1, padding:'0.75rem 0.75rem 0.75rem 0', border:'none', background:'transparent', fontSize:'1rem', color:'#e0e0e0', outline:'none' },
  btn:     { width:'100%', padding:'0.85rem', background:'linear-gradient(135deg, #90ee90, #4CAF50)', color:'#0d0d0d', border:'none', borderRadius:'10px', fontSize:'1rem', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 15px rgba(144,238,144,0.25)' },
  link:    { textAlign:'center', marginTop:'1.25rem', color:'#555', fontSize:'0.9rem' },
};
