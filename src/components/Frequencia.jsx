import { useEffect, useMemo, useState } from 'react';
import { frequenciaService } from '../services/frequenciaService';
import LoadingFeedback from './LoadingFeedback';

const pad = n => String(n).padStart(2, '0');
const hojeISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const CONFIG_KEY = 'sgt_attendance_config_v1';
const configPadrao = { limite:25, totalPrevisto:200, unidade:'dias', disciplinasAtivas:false, disciplinas:[] };
const lerConfig = () => { try { return {...configPadrao,...JSON.parse(localStorage.getItem(CONFIG_KEY)||'{}')}; } catch { return configPadrao; } };

export default function Frequencia() {
  const [registros,setRegistros] = useState([]);
  const [config,setConfig] = useState(lerConfig);
  const [loading,setLoading] = useState(true);
  const [erro,setErro] = useState('');
  const [data,setData] = useState(hojeISO());
  const [quantidade,setQuantidade] = useState('1');
  const [materia,setMateria] = useState('');
  const [justificada,setJustificada] = useState(false);
  const [limite,setLimite] = useState(String(config.limite));
  const [total,setTotal] = useState(String(config.totalPrevisto));
  const [unidade,setUnidade] = useState(config.unidade);
  const [disciplinasAtivas,setDisciplinasAtivas] = useState(config.disciplinasAtivas);
  const [novaMateria,setNovaMateria] = useState('');
  const [aviso,setAviso] = useState('');

  const carregar = async () => {
    try { setErro(''); setRegistros(await frequenciaService.listar()); }
    catch (e) { setErro(e.response?.data?.message || 'Não foi possível carregar a frequência sincronizada.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { carregar(); }, []);

  const faltas = registros.reduce((s,r)=>s+Number(r.quantidade||1),0);
  const percentual = Number(total)>0 ? faltas/Number(total)*100 : 0;
  const margem = Math.max(0,Math.floor(Number(total)*Number(limite)/100)-faltas);
  const porMateria = useMemo(()=>registros.reduce((acc,r)=>{if(r.materia) acc[r.materia]=(acc[r.materia]||0)+Number(r.quantidade||1);return acc;},{}),[registros]);

  const registrar = async e => {
    e.preventDefault(); setErro(''); setAviso('');
    try {
      const novo=await frequenciaService.criar({data,quantidade:Number(quantidade),materia:disciplinasAtivas?materia:null,justificada,unidade});
      setRegistros(atual=>[novo,...atual]); setQuantidade('1');setMateria('');setJustificada(false);setAviso('Ausência registrada e sincronizada com sua conta.');
    } catch(e) {setErro(e.response?.data?.message||'Não foi possível registrar a ausência.');}
  };
  const salvarConfig = e => {
    e.preventDefault();
    const nova={...config,limite:Number(limite),totalPrevisto:Number(total),unidade,disciplinasAtivas};
    setConfig(nova);localStorage.setItem(configKey,JSON.stringify(nova));setAviso('Parâmetros de cálculo salvos neste dispositivo.');
  };
  const adicionarMateria = () => {
    const nome=novaMateria.trim();if(!nome)return;
    const nova={...config,disciplinas:[...new Set([...(config.disciplinas||[]),nome])]};
    setConfig(nova);localStorage.setItem(CONFIG_KEY,JSON.stringify(nova));setNovaMateria('');
  };
  const excluir = async id => {
    try {await frequenciaService.excluir(id);setRegistros(atual=>atual.filter(r=>r.id!==id));setAviso('Registro removido da sua conta.');}
    catch(e){setErro(e.response?.data?.message||'Não foi possível remover o registro.');}
  };

  return <div className="attendance-page">
    <header className="page-header"><div><p className="dashboard-eyebrow">SGT / ACOMPANHAMENTO</p><h1>Frequência</h1><p>Registre suas ausências e acompanhe sua margem de faltas.</p></div></header>
    {erro && <p className="attendance-feedback" role="alert">{erro}</p>}
    {aviso && <p className="attendance-feedback" role="status">{aviso}</p>}
    {loading ? <LoadingFeedback variant="dashboard" label="Carregando frequência da sua conta" /> : <>
      <section className="attendance-overview">
        <div><span>Frequência de faltas</span><strong>{percentual.toFixed(1).replace('.',',')}%</strong><small>{faltas} {unidade} registradas de {total||0} previstas</small></div>
        <div><span>Limite configurado</span><strong>{limite}%</strong><small>Margem restante: {margem} {unidade}</small></div>
        <div className={percentual>=Number(limite)?'attendance-danger':percentual>=Number(limite)*.8?'attendance-warning':'attendance-safe'}><span>Situação estimada</span><strong>{percentual>=Number(limite)?'Limite atingido':percentual>=Number(limite)*.8?'Atenção':'Dentro da margem'}</strong><small>Baseado nos parâmetros informados</small></div>
      </section>
      <div className="attendance-progress"><span style={{width:`${Math.min(100,percentual)}%`}} /></div>
      <section className="attendance-columns">
        <div className="attendance-section"><h2>Registrar ausência</h2><p>Informe o dia e a quantidade de faltas.</p>
          <form onSubmit={registrar} className="attendance-form">
            <label>Data<input type="date" value={data} onChange={e=>setData(e.target.value)} required /></label>
            <label>Quantidade de faltas<input type="number" min="1" max="100" value={quantidade} onChange={e=>setQuantidade(e.target.value)} required /></label>
            {disciplinasAtivas && <label>Matéria (opcional)<select value={materia} onChange={e=>setMateria(e.target.value)}><option value="">Sem matéria específica</option>{(config.disciplinas||[]).map(m=><option key={m}>{m}</option>)}</select></label>}
            <label className="attendance-check"><input type="checkbox" checked={justificada} onChange={e=>setJustificada(e.target.checked)} /> Justificada / com comprovante</label>
            <button className="btn-primary" type="submit">Registrar falta</button>
          </form>
        </div>
        <div className="attendance-section"><h2>Configurar frequência</h2><p>Personalize os critérios conforme sua instituição.</p>
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
      <section className="attendance-section"><h2>Histórico de faltas</h2>{registros.length===0?<p>Você ainda não registrou ausências.</p>:<ul className="attendance-history">{[...registros].sort((a,b)=>b.data.localeCompare(a.data)).map(r=><li key={r.id}><div><strong>{new Date(r.data+'T12:00:00').toLocaleDateString('pt-BR')}</strong><span>{r.quantidade} {r.unidade||unidade}{r.materia?` · ${r.materia}`:''}{r.justificada?' · Justificada':''}</span></div><button type="button" onClick={()=>excluir(r.id)} aria-label="Excluir registro">Remover</button></li>)}</ul>}</section>
    </>}
    <p className="attendance-disclaimer">Os registros de ausências são armazenados no banco de dados da sua conta e podem ser acessados em outros dispositivos. Os parâmetros de cálculo (limite, total previsto e matérias cadastradas) ainda ficam salvos neste navegador. O resultado é uma estimativa pessoal; confirme com sua escola os critérios oficiais.</p>
  </div>;
}
