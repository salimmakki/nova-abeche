import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import MessageContent from '../components/MessageContent';

export default function Chat() {
  const { user, logout }            = useAuth();
  const navigate                    = useNavigate();
  const [conversations, setConvs]   = useState([]);
  const [convActive, setConvActive] = useState(null);
  const [convTitre, setConvTitre]   = useState('');
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [image, setImage]           = useState(null);
  const [loading, setLoading]       = useState(false);
  const [sidebar, setSidebar]       = useState(true);
  const [search, setSearch]         = useState('');
  const bottomRef = useRef(null);
  const fileRef   = useRef(null);

  // PWA Install
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    });
  }, []);

  const installerApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
  };


  useEffect(() => { chargerConversations(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const chargerConversations = async () => {
    try { const res = await chatAPI.conversations(); setConvs(res.data); } catch {}
  };

  const ouvrirConv = async (id) => {
    try {
      const res = await chatAPI.getConversation(id);
      setConvActive(id); setConvTitre(res.data.titre); setMessages(res.data.messages);
    } catch {}
  };

  const nouvelleConv = () => {
    setConvActive(null); setConvTitre(''); setMessages([]); setInput(''); setImage(null);
  };

  const envoyerMessage = async () => {
    if (!input.trim() && !image) return;
    setLoading(true);
    const msgUser = { role:'user', contenu:input, image: image ? URL.createObjectURL(image) : null };
    setMessages(prev => [...prev, msgUser]);
    const formData = new FormData();
    formData.append('message', input);
    formData.append('langue', user?.langue || 'fr');
    if (convActive) formData.append('conversation_id', convActive);
    if (image) formData.append('image', image);
    setInput(''); setImage(null);
    try {
      const res = await chatAPI.envoyer(formData);
      setMessages(prev => [...prev, { role:'assistant', contenu:res.data.reponse }]);
      if (!convActive) { setConvActive(res.data.conversation_id); setConvTitre(res.data.titre); }
      chargerConversations();
    } catch {
      setMessages(prev => [...prev, { role:'assistant', contenu:'❌ Erreur de connexion.' }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); envoyerMessage(); }
  };

  const supprimerConv = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Supprimer cette conversation ?')) return;
    await chatAPI.supprimerConv(id);
    setConvs(prev => prev.filter(c => c.id !== id));
    if (convActive === id) nouvelleConv();
  };

  const convsFiltrees = conversations.filter(c =>
    c.titre.toLowerCase().includes(search.toLowerCase())
  );

  const grouper = (convs) => {
    const auj  = new Date(); auj.setHours(0,0,0,0);
    const hier = new Date(auj); hier.setDate(hier.getDate()-1);
    const sem  = new Date(auj); sem.setDate(sem.getDate()-7);
    const g = {"Aujourd'hui":[],"Hier":[],"Cette semaine":[],"Plus ancien":[]};
    convs.forEach(c => {
      const d = new Date(c.updated_at); d.setHours(0,0,0,0);
      if (d >= auj)       g["Aujourd'hui"].push(c);
      else if (d >= hier) g["Hier"].push(c);
      else if (d >= sem)  g["Cette semaine"].push(c);
      else                g["Plus ancien"].push(c);
    });
    return g;
  };

  const groupes = grouper(convsFiltrees);

  return (
    <div style={S.page}>
      {sidebar && (
        <div style={S.sidebar}>
          <div style={S.sideHeader}>
            <div style={S.novaLogo}>
              <span style={{fontSize:'1.5rem',animation:'pulse 2s infinite'}}>🌾</span>
              <span style={S.novaName}>NOVA</span>
            </div>
            <button style={S.newBtn} onClick={nouvelleConv}>✏️</button>
          </div>
          <div style={S.searchBox}>
            <input style={S.searchInput} placeholder="🔍 Rechercher..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={S.convList}>
            {conversations.length === 0 && (
              <div style={{textAlign:'center',color:'#333',marginTop:'2rem',lineHeight:'2'}}>
                <div style={{fontSize:'2rem'}}>🌱</div>
                <p style={{fontSize:'0.85rem'}}>Aucune conversation.<br/>Démarrez un chat !</p>
              </div>
            )}
            {Object.entries(groupes).map(([groupe, convs]) =>
              convs.length > 0 && (
                <div key={groupe}>
                  <div style={S.groupLabel}>{groupe}</div>
                  {convs.map(c => (
                    <div key={c.id}
                      style={{...S.convItem, background:convActive===c.id?'rgba(144,238,144,0.1)':'transparent', borderLeft:convActive===c.id?'3px solid #90ee90':'3px solid transparent'}}
                      onClick={() => ouvrirConv(c.id)}>
                      <div style={{flex:1,overflow:'hidden'}}>
                        <span style={{display:'block',color:'#bbb',fontSize:'0.85rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.titre}</span>
                        <span style={{display:'block',color:'#333',fontSize:'0.72rem',marginTop:'2px'}}>{c.nb_messages} messages</span>
                      </div>
                      <button style={S.delBtn} onClick={e => supprimerConv(c.id,e)}>🗑</button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
          <div style={S.sideBottom}>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <div style={S.userAvatar}>{(user?.first_name||user?.username||'?')[0].toUpperCase()}</div>
              <div>
                <div style={{color:'#bbb',fontSize:'0.85rem'}}>{user?.first_name||user?.username}</div>
                <div style={{color:'#333',fontSize:'0.72rem'}}>{user?.langue==='ar'?'العربية':'Français'}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:'6px'}}>
              <button style={S.actionBtn} onClick={() => navigate('/cultures')} title="Cultures">🌿</button>
              <button style={S.actionBtn} onClick={() => { logout(); navigate('/login'); }} title="Déconnexion">🚪</button>
            </div>
          </div>
        </div>
      )}

      <div style={S.main}>
        <div style={S.topBar}>
          <button style={S.menuBtn} onClick={() => setSidebar(!sidebar)}>☰</button>
          <div style={{flex:1,display:'flex',alignItems:'center',gap:'10px'}}>
            <span style={S.topNova}>NOVA</span>
            {convTitre && <span style={{color:'#444',fontSize:'0.9rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'350px'}}>— {convTitre}</span>}
          </div>
          
          {showInstall && (
            <button style={{background:"linear-gradient(135deg,#4CAF50,#2d7a2d)",color:"#fff",border:"none",borderRadius:"8px",padding:"0.4rem 0.8rem",cursor:"pointer",fontSize:"0.8rem",fontWeight:"bold",boxShadow:"0 2px 10px rgba(144,238,144,0.3)",animation:"fadeInUp 0.3s ease"}}
              onClick={installerApp}>
              📲 Installer NOVA
            </button>
          )}
          <button style={S.culturesBtn} onClick={() => navigate('/cultures')}>🌿 Cultures</button>
        </div>

        <div style={S.messages}>
          {messages.length === 0 && (
            <div style={{textAlign:'center',marginTop:'4rem',animation:'fadeInUp 0.8s ease'}}>
              <div style={{fontSize:'4rem',animation:'pulse 2s infinite'}}>🌾</div>
              <h1 style={S.welcomeNova}>NOVA</h1>
              <p style={{color:'#444',fontSize:'0.85rem',marginBottom:'0.75rem'}}><em>Natural Optimized Virtual Assistant for Agriculture</em></p>
              <p style={{color:'#666',lineHeight:'1.8',marginBottom:'1.5rem'}}>
                Bonjour <strong style={{color:'#90ee90'}}>{user?.first_name||user?.username}</strong> !<br/>
                Assistant agricole IA pour Abéché, Tchad.<br/>
                Posez vos questions en <strong>français</strong> ou en <strong>عربية</strong>.
              </p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem',justifyContent:'center'}}>
                {['🌾 Quelles cultures planter en juillet ?','📷 Analyse cette image de ma plante','💧 Conseils pour le sol sableux','🌡️ Cultures pour la saison sèche'].map((s,i) => (
                  <button key={s} style={{...S.suggestBtn,animationDelay:`${i*0.1}s`}} onClick={() => setInput(s.slice(3))}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m,i) => (
            <div key={i} style={{display:'flex',flexDirection:'column',alignItems:m.role==='user'?'flex-end':'flex-start',marginBottom:'1rem',animation:'slideIn 0.3s ease'}}>
              {m.role==='assistant' && <div style={{color:'#90ee90',fontSize:'0.72rem',fontWeight:'600',letterSpacing:'1px',marginBottom:'4px',paddingLeft:'4px'}}>🌾 NOVA</div>}
              <div style={{...S.bubble,...(m.role==='user'?S.bubbleUser:S.bubbleBot)}}>
                {m.image && <img src={m.image} alt="upload" style={{maxWidth:'220px',borderRadius:'8px',marginBottom:'0.5rem',display:'block'}}/>}
                <MessageContent contenu={m.contenu} />
              </div>
            </div>
          ))}

          {loading && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',marginBottom:'1rem'}}>
              <div style={{color:'#90ee90',fontSize:'0.72rem',marginBottom:'4px',paddingLeft:'4px'}}>🌾 NOVA</div>
              <div style={{...S.bubble,...S.bubbleBot}}>
                <div style={{display:'flex',gap:'6px',alignItems:'center',padding:'4px 0'}}>
                  {[0,1,2].map(n => (
                    <span key={n} style={{width:'9px',height:'9px',borderRadius:'50%',background:'#90ee90',display:'inline-block',animation:`blink 1.4s ${n*0.2}s infinite ease-in-out`}}></span>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        <div style={S.inputArea}>
          {image && (
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.75rem',background:'#1a1a1a',padding:'0.5rem 0.75rem',borderRadius:'8px',border:'1px solid rgba(144,238,144,0.2)'}}>
              <img src={URL.createObjectURL(image)} alt="preview" style={{width:'48px',height:'48px',objectFit:'cover',borderRadius:'6px'}}/>
              <span style={{color:'#666',fontSize:'0.8rem',flex:1}}>{image.name}</span>
              <button style={{background:'transparent',border:'none',color:'#666',cursor:'pointer'}} onClick={() => setImage(null)}>✕</button>
            </div>
          )}
          <div style={S.inputRow}>
            <button style={S.attachBtn} onClick={() => fileRef.current.click()}>📷</button>
            <input type="file" ref={fileRef} style={{display:'none'}} accept="image/*" onChange={e => setImage(e.target.files[0])}/>
            <textarea style={S.textarea}
              placeholder="Écrivez à NOVA...  أكتب لنوفا..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown} rows={1}/>
            <button style={{...S.sendBtn,opacity:(!input.trim()&&!image)||loading?0.5:1}}
              onClick={envoyerMessage} disabled={loading||(!input.trim()&&!image)}>➤</button>
          </div>
          <p style={{color:'#2a2a2a',fontSize:'0.72rem',marginTop:'0.5rem',textAlign:'center'}}>
            Entrée pour envoyer · Maj+Entrée pour nouvelle ligne
          </p>
        </div>
      </div>
    </div>
  );
}

const S = {
  page:       { display:'flex', height:'100vh', fontFamily:'sans-serif', overflow:'hidden', background:'#0d0d0d' },
  sidebar:    { width:'275px', background:'#0a0a0a', display:'flex', flexDirection:'column', flexShrink:0, borderRight:'1px solid #1a1a1a' },
  sideHeader: { padding:'1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #1a1a1a' },
  novaLogo:   { display:'flex', alignItems:'center', gap:'10px' },
  novaName:   { color:'#90ee90', fontWeight:'bold', fontSize:'1.5rem', letterSpacing:'5px', animation:'novaGlow 3s infinite' },
  newBtn:     { background:'rgba(144,238,144,0.1)', border:'1px solid rgba(144,238,144,0.2)', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', fontSize:'1rem', color:'#90ee90' },
  searchBox:  { padding:'0.75rem 1rem', borderBottom:'1px solid #1a1a1a' },
  searchInput:{ width:'100%', background:'#151515', border:'1px solid #222', borderRadius:'8px', padding:'0.5rem 0.75rem', color:'#ccc', fontSize:'0.85rem', outline:'none', boxSizing:'border-box' },
  convList:   { flex:1, overflowY:'auto', padding:'0.5rem' },
  groupLabel: { color:'#2a2a2a', fontSize:'0.72rem', fontWeight:'600', padding:'0.5rem', textTransform:'uppercase', letterSpacing:'1px' },
  convItem:   { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.65rem 0.75rem', borderRadius:'8px', cursor:'pointer', marginBottom:'2px', transition:'all 0.2s' },
  delBtn:     { background:'transparent', border:'none', color:'#333', cursor:'pointer', fontSize:'0.8rem', padding:'2px 4px' },
  sideBottom: { padding:'0.75rem 1rem', borderTop:'1px solid #1a1a1a', display:'flex', justifyContent:'space-between', alignItems:'center' },
  userAvatar: { width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg, #90ee90, #4CAF50)', display:'flex', alignItems:'center', justifyContent:'center', color:'#0d0d0d', fontWeight:'bold', fontSize:'1rem' },
  actionBtn:  { background:'rgba(144,238,144,0.08)', border:'1px solid rgba(144,238,144,0.15)', borderRadius:'6px', padding:'6px 8px', cursor:'pointer', fontSize:'1rem' },
  main:       { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topBar:     { background:'#0a0a0a', borderBottom:'1px solid #1a1a1a', padding:'0.75rem 1.25rem', display:'flex', alignItems:'center', gap:'1rem', flexShrink:0 },
  menuBtn:    { background:'transparent', border:'none', cursor:'pointer', fontSize:'1.2rem', color:'#555', padding:'4px 8px' },
  topNova:    { color:'#90ee90', fontWeight:'bold', fontSize:'1.1rem', letterSpacing:'3px', animation:'novaGlow 3s infinite' },
  culturesBtn:{ background:'rgba(144,238,144,0.08)', color:'#90ee90', border:'1px solid rgba(144,238,144,0.2)', borderRadius:'8px', padding:'0.4rem 0.8rem', cursor:'pointer', fontSize:'0.85rem' },
  messages:   { flex:1, overflowY:'auto', padding:'1.5rem 2rem', background:'#0d0d0d' },
  welcomeNova:{ color:'#90ee90', letterSpacing:'10px', fontSize:'3rem', margin:'0.5rem 0', animation:'novaGlow 3s infinite' },
  suggestBtn: { background:'rgba(144,238,144,0.08)', color:'#90ee90', border:'1px solid rgba(144,238,144,0.2)', borderRadius:'20px', padding:'0.4rem 1rem', cursor:'pointer', fontSize:'0.85rem', animation:'fadeInUp 0.5s ease both' },
  bubble:     { maxWidth:'72%', padding:'0.85rem 1.1rem', borderRadius:'14px', wordBreak:'break-word' },
  bubbleUser: { background:'linear-gradient(135deg, #4CAF50, #90ee90)', color:'#0d0d0d', borderBottomRightRadius:'4px', boxShadow:'0 4px 15px rgba(144,238,144,0.2)', fontWeight:'500' },
  bubbleBot:  { background:'#151515', color:'#e0e0e0', border:'1px solid #1f1f1f', borderBottomLeftRadius:'4px' },
  inputArea:  { background:'#0a0a0a', borderTop:'1px solid #1a1a1a', padding:'1rem 1.5rem', flexShrink:0 },
  inputRow:   { display:'flex', gap:'0.75rem', alignItems:'flex-end' },
  attachBtn:  { background:'#151515', border:'1px solid #222', borderRadius:'10px', padding:'0.6rem 0.8rem', cursor:'pointer', fontSize:'1.1rem', flexShrink:0 },
  textarea:   { flex:1, background:'#151515', border:'1px solid #222', borderRadius:'12px', padding:'0.75rem 1rem', fontSize:'0.95rem', resize:'none', fontFamily:'sans-serif', outline:'none', color:'#e0e0e0', lineHeight:'1.5' },
  sendBtn:    { background:'linear-gradient(135deg, #90ee90, #4CAF50)', color:'#0d0d0d', border:'none', borderRadius:'12px', padding:'0.6rem 1rem', cursor:'pointer', fontSize:'1.2rem', flexShrink:0, fontWeight:'bold', boxShadow:'0 4px 15px rgba(144,238,144,0.25)' },
};
