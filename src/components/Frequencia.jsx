import { useMemo, useState } from 'react';

const obterChaveArmazenamento = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('sgt_user') || '{}');
    return `sgt_attendance_v1:${usuario.id ?? 'usuario'}`;
  } catch {
    return 'sgt_attendance_v1:usuario';
  }
};
const pad = (n) => String(n).padStart(2, '0');
const hojeISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const ler = (chave) => { try { return JSON.parse(localStorage.getItem(chave) || '{"config":{"limite":25,"totalPrevisto":200,"unidade":"dias","disciplinasAtivas":false,"disciplinas":[]},"registros":[]}'); } catch { return {config:{limite:25,totalPrevisto:200,unidade:'dias',disciplinasAtivas:false,disciplinas:[]},registros:[]}; } };

export default function Frequencia() {
  const [chaveArmazenamento] = useState(obterChaveArmazenamento);
  const [dados,setDados] = useState(() => ler(chaveArmazenamento));
  const [data,setData] = useState(hojeISO());
  const [quantidade,setQuantidade] = useState('1');
  const [materia,setMateria] = useState('');
  const [justificada,setJustificada] = useState(false);
  const [limite,setLimite] = useState(String(dados.config.limite));
  const [total,setTotal] = useState(String(dados.config.totalPrevisto));
  const [unidade,setUnidade] = useState(dados.config.unidade || 'dias');
  const [disciplinasAtivas,setDisciplinasAtivas] = useState(!!dados.config.disciplinasAtivas);
  const [novaMateria,setNovaMateria] = useState('');
  const [aviso,setAviso] = useState('');

  const salvar = (novo) => { setDados(novo); localStorage.setItem(chaveArmazenamento,JSON.stringify(novo)); };
  const faltas = dados.registros.reduce((s,r)=>s+Number(r.quantidade || 1),0);
  const percentual = Number(total)>0 ? faltas/Number(total)*100 : 0;
  const margem = Math.max(0,Math.floor(Number(total)*Number(limite)/100)-faltas);
  const porMateria = useMemo(()=>dados.registros.reduce((acc,r)=>{ if(r.materia) acc[r.materia]=(acc[r.materia]||0)+Number(r.quantidade||1); return acc; },{}),[dados.registros]);

  const registrar = (e) => {
    e.preventDefault();
    if(!data || Number(quantidade)<1) return;
    const novo={...dados,registros:[...dados.registros,{id:crypto.randomUUID?.() || String(Date.now()),data,quantidade:Number(quantidade),materia:disciplinasAtivas?materia:'',justificada}]};
    salvar(novo); setQuantidade('1'); setMateria(''); setJustificada(false); setAviso('Falta registrada.');
  };
  const salvarConfig = (e) => {
    e.preventDefault();
    const novo={...dados,config:{...dados.config,limite:Number(limite),totalPrevisto:Number(total),unidade,disciplinasAtivas}};
    salvar(novo); setAviso('Configurações atualizadas.');
  };
  const adicionarMateria = () => {
    const nome=novaMateria.trim();
    if(!nome) return;
    const disciplinas=[...new Set([...(dados.config.disciplinas||[]),nome])];
    salvar({...dados,config:{...dados.config,disciplinas}}); setNovaMateria('');
  };
  const excluir = (id) => salvar({...dados,registros:dados.registros.filter(r=>r.id!==id)});

  return <div className="attendance-page">
    <header className="page-header"><div><p className="dashboard-eyebrow">SGT / ACOMPANHAMENTO</p><h1>Frequência</h1><p>Registre suas ausências e acompanhe sua margem de faltas.</p></div></header>
    <section className="attendance-overview">
      <div><span>Frequência de faltas</span><strong>{percentual.toFixed(1).replace('.',',')}%</strong><small>{faltas} {dados.config.unidade} registradas de {total || 0} previstas</small></div>
      <div><span>Limite configurado</span><strong>{limite}%</strong><small>Margem restante: {margem} {dados.config.unidade}</small></div>
      <div className={percentual>=Number(limite)?'attendance-danger':percentual>=Number(limite)*.8?'attendance-warning':'attendance-safe'}><span>Situação estimada</span><strong>{percentual>=Number(limite)?'Limite atingido':percentual>=Number(limite)*.8?'Atenção':'Dentro da margem'}</strong><small>Baseado nos parâmetros que você informou</small></div>
    </section>
    <div className="attendance-progress"><span style={{width:`${Math.min(100,percentual)}%`}} /></div>
    {aviso && <p className="attendance-feedback" role="status">{aviso}</p>}
    <section className="attendance-columns">
      <div className="attendance-section">
        <h2>Registrar ausência</h2><p>Informe o dia e a quantidade de faltas conforme a contagem adotada pela sua escola.</p>
        <form onSubmit={registrar} className="attendance-form">
          <label>Data<input type="date" value={data} onChange={e=>setData(e.target.value)} required /></label>
          <label>Quantidade de faltas<input type="number" min="1" max="100" value={quantidade} onChange={e=>setQuantidade(e.target.value)} required /></label>
          {disciplinasAtivas && <label>Matéria (opcional)<select value={materia} onChange={e=>setMateria(e.target.value)}><option value="">Sem matéria específica</option>{(dados.config.disciplinas||[]).map(m=><option key={m}>{m}</option>)}</select></label>}
          <label className="attendance-check"><input type="checkbox" checked={justificada} onChange={e=>setJustificada(e.target.checked)} /> Justificada / com comprovante</label>
          <button className="btn-primary" type="submit">Registrar falta</button>
        </form>
      </div>
      <div className="attendance-section">
        <h2>Configurar frequência</h2><p>Personalize os critérios conforme o regimento da sua instituição.</p>
        <form onSubmit={salvarConfig} className="attendance-form">
          <label>Limite de faltas (%)<input type="number" min="1" max="100" step="0.1" value={limite} onChange={e=>setLimite(e.target.value)} required /></label>
          <label>Total previsto no período<input type="number" min="1" value={total} onChange={e=>setTotal(e.target.value)} required /></label>
          <label>Unidade de contagem<select value={unidade} onChange={e=>setUnidade(e.target.value)}><option value="dias">Dias</option><option value="aulas">Aulas</option><option value="horas">Horas</option></select></label>
          <label className="attendance-check"><input type="checkbox" checked={disciplinasAtivas} onChange={e=>setDisciplinasAtivas(e.target.checked)} /> Acompanhar também por matéria</label>
          <button className="btn-primary" type="submit">Salvar configurações</button>
        </form>
        {disciplinasAtivas && <div className="attendance-subject-add"><label>Adicionar matéria<input value={novaMateria} onChange={e=>setNovaMateria(e.target.value)} placeholder="Ex.: Matemática" /></label><button type="button" className="btn-outline" onClick={adicionarMateria}>Adicionar</button></div>}
      </div>
    </section>
    {disciplinasAtivas && <section className="attendance-section"><h2>Frequência por matéria</h2>{Object.entries(porMateria).length===0?<p>Nenhuma falta associada a uma matéria ainda.</p>:Object.entries(porMateria).map(([m,n])=><div className="attendance-subject-row" key={m}><strong>{m}</strong><span>{n} faltas · {Number(total)>0?(n/Number(total)*100).toFixed(1):'0.0'}%</span></div>)}</section>}
    <section className="attendance-section"><h2>Histórico de faltas</h2>{dados.registros.length===0?<p>Você ainda não registrou ausências.</p>:<ul className="attendance-history">{[...dados.registros].sort((a,b)=>b.data.localeCompare(a.data)).map(r=><li key={r.id}><div><strong>{new Date(r.data+'T12:00:00').toLocaleDateString('pt-BR')}</strong><span>{r.quantidade} {dados.config.unidade}{r.materia? ` · ${r.materia}`:''}{r.justificada?' · Justificada':''}</span></div><button type="button" onClick={()=>excluir(r.id)} aria-label="Excluir registro">Remover</button></li>)}</ul>}</section>
    <p className="attendance-disclaimer">Os registros de frequência ficam salvos somente neste navegador e neste dispositivo, associados à conta atualmente conectada. Eles ainda não são sincronizados com o banco de dados nem aparecem automaticamente em outros dispositivos. O resultado é uma estimativa pessoal, calculada com os dados informados. Confirme com sua escola quais ausências entram no cálculo oficial e qual é o total previsto do período.</p>
  </div>;
}
