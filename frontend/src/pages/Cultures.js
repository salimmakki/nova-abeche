import { useState } from "react";
import { culturesAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const MOIS = ["Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Decembre"];
const SOLS = ["sableux","argileux","sableux_leger","irrigue","limoneux"];
const COULEURS = ["#90ee90","#4CAF50","#2d7a2d","#66bb6a","#a5d6a7"];

export default function Cultures() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ mois:7, temperature:30, precipitation:60, type_sol:"sableux", ph:6.5 });
  const [resultats, setResultats] = useState(null);
  const [loading, setLoading] = useState(false);

  const chercher = async () => {
    setLoading(true);
    try { const res = await culturesAPI.recommander(form); setResultats(res.data); }
    catch { alert("Erreur lors de la recommandation"); }
    finally { setLoading(false); }
  };

  const dataBar = resultats ? resultats.cultures.map(c => ({
    name: c.nom, Score: c.score, "Temp max": c.temp_max, "Pluie max": c.pluie_max
  })) : [];

  const dataPie = resultats ? resultats.cultures.map(c => ({
    name: c.nom, value: c.score
  })) : [];

  const CustomTooltipBar = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{background:"#1a1a1a",border:"1px solid rgba(144,238,144,0.3)",borderRadius:"8px",padding:"10px 14px"}}>
          <p style={{color:"#90ee90",fontWeight:"bold",marginBottom:"4px"}}>{label}</p>
          {payload.map((p,i) => <p key={i} style={{color:"#ccc",fontSize:"0.85rem",margin:"2px 0"}}>{p.name}: <span style={{color:"#90ee90"}}>{p.value}</span></p>)}
        </div>
      );
    }
    return null;
  };

  const CustomTooltipPie = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{background:"#1a1a1a",border:"1px solid rgba(144,238,144,0.3)",borderRadius:"8px",padding:"10px 14px"}}>
          <p style={{color:"#90ee90",fontWeight:"bold"}}>{payload[0].name}</p>
          <p style={{color:"#ccc",fontSize:"0.85rem"}}>Score: <span style={{color:"#90ee90"}}>{payload[0].value}%</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={() => navigate("/chat")}>← Retour</button>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:"8px"}}>
          <span style={{fontSize:"1.4rem"}}>🌿</span>
          <span style={{color:"#90ee90",fontWeight:"bold",fontSize:"1.2rem",letterSpacing:"1px"}}>Recommandation de Cultures</span>
        </div>
        <span style={{color:"#333",fontSize:"0.85rem"}}>Abéché — Tchad</span>
      </div>

      <div style={S.container}>
        <div style={S.card}>
          <h2 style={S.h2}>🌦️ Conditions actuelles</h2>
          <div style={S.grid}>
            <div style={S.field}>
              <label style={S.label}>📅 Mois</label>
              <select style={S.input} value={form.mois} onChange={e => setForm({...form,mois:parseInt(e.target.value)})}>
                {MOIS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>🌡️ Température (°C)</label>
              <input style={S.input} type="number" min={10} max={50} value={form.temperature} onChange={e => setForm({...form,temperature:parseFloat(e.target.value)})} />
            </div>
            <div style={S.field}>
              <label style={S.label}>💧 Précipitations (mm)</label>
              <input style={S.input} type="number" min={0} max={300} value={form.precipitation} onChange={e => setForm({...form,precipitation:parseFloat(e.target.value)})} />
            </div>
            <div style={S.field}>
              <label style={S.label}>🪨 Type de sol</label>
              <select style={S.input} value={form.type_sol} onChange={e => setForm({...form,type_sol:e.target.value})}>
                {SOLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>⚗️ pH du sol</label>
              <input style={S.input} type="number" min={4} max={9} step={0.1} value={form.ph} onChange={e => setForm({...form,ph:parseFloat(e.target.value)})} />
            </div>
          </div>
          <button style={S.btn} onClick={chercher} disabled={loading}>
            {loading
              ? <><span style={{width:"18px",height:"18px",border:"3px solid rgba(0,0,0,0.2)",borderTop:"3px solid #0d0d0d",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block",marginRight:"8px"}}></span>Analyse...</>
              : "🔍 Trouver les meilleures cultures"}
          </button>
        </div>

        {resultats && (
          <>
            <div style={S.card}>
              <h2 style={S.h2}>🌾 {resultats.message}</h2>
              {resultats.cultures.length === 0
                ? <p style={{color:"#444",textAlign:"center",padding:"2rem"}}>Aucune culture adaptée. Modifiez les paramètres.</p>
                : resultats.cultures.map((c,i) => (
                  <div key={i} style={S.cultureCard}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.5rem"}}>
                      <span style={{fontWeight:"bold",color:"#90ee90",fontSize:"1.15rem"}}>{c.nom}</span>
                      <span style={{color:"#555"}}>{c.nom_arabe}</span>
                      <span style={{marginLeft:"auto",background:"linear-gradient(135deg,#4CAF50,#2d7a2d)",color:"#fff",borderRadius:"20px",padding:"0.2rem 0.75rem",fontSize:"0.85rem",fontWeight:"bold"}}>{c.score}%</span>
                    </div>
                    <p style={{color:"#666",fontSize:"0.9rem",margin:"0.5rem 0",lineHeight:"1.5"}}>{c.description}</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem"}}>
                      {["📅 "+c.saison,"🌡️ "+c.temp_min+"-"+c.temp_max+"°C","💧 "+c.pluie_min+"-"+c.pluie_max+"mm","🪨 "+c.type_sol].map(t => (
                        <span key={t} style={{background:"rgba(144,238,144,0.08)",color:"#90ee90",borderRadius:"20px",padding:"0.2rem 0.75rem",fontSize:"0.8rem",border:"1px solid rgba(144,238,144,0.15)"}}>{t}</span>
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>

            {resultats.cultures.length > 0 && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem"}}>
                <div style={S.card}>
                  <h2 style={S.h2}>📊 Score par culture</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dataBar} margin={{top:5,right:10,left:-20,bottom:5}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{fill:"#888",fontSize:12}} />
                      <YAxis tick={{fill:"#888",fontSize:12}} />
                      <Tooltip content={<CustomTooltipBar />} />
                      <Bar dataKey="Score" radius={[6,6,0,0]}>
                        {dataBar.map((_,i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={S.card}>
                  <h2 style={S.h2}>🥧 Répartition des scores</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={dataPie} cx="50%" cy="45%" innerRadius={55} outerRadius={90}
                        paddingAngle={4} dataKey="value" label={({name,value}) => name+" "+value+"%"}
                        labelLine={{stroke:"rgba(144,238,144,0.3)"}}
                      >
                        {dataPie.map((_,i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltipPie />} />
                      <Legend formatter={(v) => <span style={{color:"#888",fontSize:"0.85rem"}}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const S = {
  page:        { minHeight:"100vh", background:"#0d0d0d", fontFamily:"sans-serif" },
  header:      { background:"#0a0a0a", padding:"1rem 1.5rem", display:"flex", alignItems:"center", gap:"1rem", borderBottom:"1px solid #1a1a1a" },
  backBtn:     { background:"rgba(144,238,144,0.08)", border:"1px solid rgba(144,238,144,0.2)", color:"#90ee90", borderRadius:"8px", padding:"0.4rem 0.8rem", cursor:"pointer", fontSize:"0.9rem" },
  container:   { maxWidth:"900px", margin:"0 auto", padding:"1.5rem" },
  card:        { background:"#111", borderRadius:"16px", padding:"1.5rem", border:"1px solid #1a1a1a", marginBottom:"1.5rem", boxShadow:"0 8px 30px rgba(0,0,0,0.3)" },
  h2:          { color:"#90ee90", marginTop:0, marginBottom:"1.25rem", fontSize:"1.1rem" },
  grid:        { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.25rem" },
  field:       { display:"flex", flexDirection:"column", gap:"0.3rem" },
  label:       { fontSize:"0.85rem", color:"#888" },
  input:       { padding:"0.65rem", background:"#1a1a1a", border:"1px solid #222", borderRadius:"8px", fontSize:"0.95rem", color:"#e0e0e0", outline:"none" },
  btn:         { background:"linear-gradient(135deg,#4CAF50,#2d7a2d)", color:"#fff", border:"none", borderRadius:"10px", padding:"0.85rem", fontSize:"1rem", fontWeight:"bold", cursor:"pointer", width:"100%", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 15px rgba(144,238,144,0.2)" },
  cultureCard: { border:"1px solid #1a1a1a", borderRadius:"12px", padding:"1.1rem", marginBottom:"1rem", background:"#151515" },
};
