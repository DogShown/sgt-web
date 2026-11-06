import { useState } from 'react';
import { tarefaService } from '../services/tarefaService';

export default function EditarTarefa({ tarefa, onCancel, onSaved }) {
  const [dados,setDados]=useState({titulo:tarefa.titulo||'',descricao:tarefa.descricao||'',categoria:tarefa.categoria||'TRABALHO',prioridade:tarefa.prioridade||'MEDIA',dataEntrega:tarefa.dataEntrega||''});
  const [salvando,setSalvando]=useState(false);
  const [erro,setErro]=useState('');
  const alterar=(campo,valor)=>setDados(atual=>({...atual,[campo]:valor}));
  const salvar=async e=>{
    e.preventDefault();setErro('');
    if(!dados.titulo.trim()||!dados.dataEntrega){setErro('Título e prazo são obrigatórios.');return;}
    setSalvando(true);
    try{await tarefaService.atualizar(tarefa.id,{...dados,titulo:dados.titulo.trim(),descricao:dados.descricao.trim()});onSaved?.();}
    catch(error){setErro(error.response?.data?.message||'Não foi possível atualizar a tarefa.');}
    finally{setSalvando(false);}
  };
  return <form className="task-form task-edit-form" onSubmit={salvar}>
    {erro&&<p className="dashboard-alert" role="alert">{erro}</p>}
    <label className="form-field"><span>Título</span><input value={dados.titulo} maxLength={100} onChange={e=>alterar('titulo',e.target.value)} required /></label>
    <label className="form-field"><span>Descrição</span><textarea rows="3" value={dados.descricao} onChange={e=>alterar('descricao',e.target.value)} /></label>
    <div className="task-form-row">
      <label className="form-field"><span>Categoria</span><select value={dados.categoria} onChange={e=>alterar('categoria',e.target.value)}><option value="TRABALHO">Trabalho</option><option value="ESTUDO">Estudo</option><option value="PESSOAL">Pessoal</option></select></label>
      <label className="form-field"><span>Prioridade</span><select value={dados.prioridade} onChange={e=>alterar('prioridade',e.target.value)}><option value="BAIXA">Baixa</option><option value="MEDIA">Média</option><option value="ALTA">Alta</option></select></label>
    </div>
    <label className="form-field"><span>Prazo</span><input type="date" value={dados.dataEntrega} onChange={e=>alterar('dataEntrega',e.target.value)} required /></label>
    <div className="task-actions"><button className="task-status-action" type="button" onClick={onCancel} disabled={salvando}>Cancelar</button><button className="task-complete" type="submit" disabled={salvando}>{salvando?'Salvando...':'Salvar edição'}</button></div>
  </form>;
}