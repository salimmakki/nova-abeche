export default function MessageContent({ contenu }) {
  const renderInline = (texte) => {
    const parts = texte.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={j} style={{color:"#90ee90"}}>{p.slice(2,-2)}</strong>;
      if (p.startsWith("`") && p.endsWith("`"))
        return <code key={j} style={{background:"rgba(144,238,144,0.1)",color:"#90ee90",padding:"1px 6px",borderRadius:"4px",fontSize:"0.9rem"}}>{p.slice(1,-1)}</code>;
      return <span key={j}>{p}</span>;
    });
  };

  const renderTableau = (lignes, key) => {
    const rows = lignes.filter(l => l.includes("|") && !l.match(/^\|[-\s|]+\|$/));
    if (rows.length < 2) return null;
    const headers = rows[0].split("|").filter(c => c.trim() !== "");
    const body = rows.slice(1);
    return (
      <div key={key} style={{overflowX:"auto",margin:"0.75rem 0"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.88rem"}}>
          <thead>
            <tr>{headers.map((h,i) => (
              <th key={i} style={{background:"rgba(144,238,144,0.15)",color:"#90ee90",padding:"8px 12px",textAlign:"left",border:"1px solid rgba(144,238,144,0.2)",fontWeight:"600",whiteSpace:"nowrap"}}>{h.trim()}</th>
            ))}</tr>
          </thead>
          <tbody>{body.map((row,i) => {
            const cells = row.split("|").filter(c => c.trim() !== "");
            return (
              <tr key={i} style={{background:i%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
                {cells.map((cell,j) => (
                  <td key={j} style={{padding:"7px 12px",border:"1px solid rgba(255,255,255,0.05)",color:"#ccc",lineHeight:"1.5"}}>{cell.trim()}</td>
                ))}
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    );
  };

  const lignes = contenu.split("\n");
  const elements = [];
  let i = 0;

  while (i < lignes.length) {
    const ligne = lignes[i];
    if (ligne.includes("|")) {
      const bloc = [];
      while (i < lignes.length && lignes[i].includes("|")) { bloc.push(lignes[i]); i++; }
      const t = renderTableau(bloc, "t"+i);
      if (t) elements.push(t);
    } else if (ligne.startsWith("### ")) {
      elements.push(<h3 key={i} style={{color:"#90ee90",fontSize:"1.1rem",fontWeight:"bold",margin:"0.8rem 0 0.3rem",borderBottom:"1px solid rgba(144,238,144,0.2)",paddingBottom:"4px"}}>{renderInline(ligne.replace("### ",""))}</h3>);
      i++;
    } else if (ligne.startsWith("## ")) {
      elements.push(<h2 key={i} style={{color:"#90ee90",fontSize:"1.2rem",fontWeight:"bold",margin:"0.8rem 0 0.3rem",borderBottom:"1px solid rgba(144,238,144,0.3)",paddingBottom:"4px"}}>{renderInline(ligne.replace("## ",""))}</h2>);
      i++;
    } else if (ligne.startsWith("# ")) {
      elements.push(<h1 key={i} style={{color:"#90ee90",fontSize:"1.35rem",fontWeight:"bold",margin:"0.8rem 0 0.3rem",borderBottom:"1px solid rgba(144,238,144,0.4)",paddingBottom:"4px"}}>{renderInline(ligne.replace("# ",""))}</h1>);
      i++;
    } else if (ligne.match(/^\d+\. /)) {
      elements.push(<div key={i} style={{display:"flex",gap:"8px",margin:"3px 0",paddingLeft:"4px"}}><span style={{color:"#90ee90",flexShrink:0}}>{ligne.match(/^\d+/)[0]}.</span><span>{renderInline(ligne.replace(/^\d+\. /,""))}</span></div>);
      i++;
    } else if (ligne.match(/^[-*] /)) {
      elements.push(<div key={i} style={{display:"flex",gap:"8px",margin:"3px 0",paddingLeft:"4px"}}><span style={{color:"#90ee90",flexShrink:0}}>•</span><span>{renderInline(ligne.replace(/^[-*] /,""))}</span></div>);
      i++;
    } else if (ligne.trim() === "") {
      elements.push(<div key={i} style={{height:"8px"}}></div>);
      i++;
    } else {
      elements.push(<div key={i} style={{marginBottom:"3px",lineHeight:"1.7"}}>{renderInline(ligne)}</div>);
      i++;
    }
  }

  return <div style={{margin:0,fontSize:"0.95rem"}}>{elements}</div>;
}
