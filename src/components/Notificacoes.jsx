import React, { useEffect, useMemo, useState } from 'react';
import { tarefaService } from '../services/tarefaService';

const STORAGE_KEY = 'sgt_notifications_read';
const PUSH_SENT_KEY = 'sgt_notifications_push_sent';
const dataLocal = (data) => {
  if (!data) return null;
  const [y, m, d] = data.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export default function Notificacoes() {
  const [tarefas, setTarefas] = useState([]);
  const [lidas, setLidas] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  const [carregando, setCarregando] = useState(true);
  const [pushAtivo, setPushAtivo] = useState(typeof Notification !== 'undefined' && Notification.permission === 'granted');

  useEffect(() => {
    tarefaService.listarPorUsuario().then(dados => setTarefas(Array.isArray(dados) ? dados : [])).catch(() => setTarefas([])).finally(() => setCarregando(false));
  }, []);

  const notificacoes = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return tarefas.flatMap(t => {
      if (!t.dataEntrega) return [];
      const prazo = dataLocal(t.dataEntrega);
      const concluida = ['CONCLUIDA_NO_PRAZO', 'CONCLUIDA_COM_ATRASO'].includes(t.status);
      if (concluida) return [{ id: 'done-' + t.id, tipo: 'success', titulo: 'Tarefa concluída', texto: t.titulo, horario: 'Agora' }];
      const diff = Math.ceil((prazo - hoje) / 86400000);
      if (diff < 0) return [{ id: 'late-' + t.id, tipo: 'danger', titulo: 'Tarefa atrasada', texto: t.titulo, horario: Math.abs(diff) + ' dia(s) em atraso' }];
      if (diff <= 1) return [{ id: 'due-' + t.id, tipo: 'warning', titulo: 'Entrega em 24 horas', texto: t.titulo, horario: diff === 0 ? 'Hoje' : 'Amanhã' }];
      return [];
    }).slice(0, 20);
  }, [tarefas]);

  useEffect(() => {
    if (!pushAtivo || notificacoes.length === 0) return;

    const enviadas = JSON.parse(localStorage.getItem(PUSH_SENT_KEY) || '[]');
    const novasParaAvisar = notificacoes.filter(n => !lidas.includes(n.id) && !enviadas.includes(n.id)).slice(0, 3);

    if (novasParaAvisar.length === 0) return;

    novasParaAvisar.forEach((n) => {
      new Notification(n.titulo, {
        body: n.texto,
        tag: n.id
      });
    });

    const atualizadas = [...new Set([...enviadas, ...novasParaAvisar.map(n => n.id)])].slice(-30);
    localStorage.setItem(PUSH_SENT_KEY, JSON.stringify(atualizadas));
  }, [notificacoes, lidas, pushAtivo]);

  const naoLidas = notificacoes.filter(n => !lidas.includes(n.id)).length;
  const marcarLida = (id) => {
    const novas = [...new Set([...lidas, id])];
    setLidas(novas);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novas));
  };
  const marcarTodas = () => {
    const novas = [...new Set([...lidas, ...notificacoes.map(n => n.id)])];
    setLidas(novas);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novas));
  };
  const ativarPush = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setPushAtivo(permission === 'granted');
    if (permission === 'granted') new Notification('SGT', { body: 'Notificações do navegador ativadas neste dispositivo.' });
  };

  return (
    <div className="notifications-page">
      <header className="page-header notifications-header">
        <div><p className="dashboard-eyebrow">SGT • Central de avisos</p><h1>Notificações</h1><p>{naoLidas ? naoLidas + ' não lida(s)' : 'Tudo em dia por aqui.'}</p></div>
        <div className="notification-actions">
          {!pushAtivo && <button className="btn-outline" onClick={ativarPush}>Ativar notificações</button>}
          {naoLidas > 0 && <button className="btn-ghost" onClick={marcarTodas}>Marcar todas como lidas</button>}
        </div>
      </header>
      <section className="notifications-list">
        {carregando ? <div className="notifications-empty">Carregando notificações...</div> :
          notificacoes.length === 0 ? <div className="notifications-empty"><span>✓</span><h2>Nenhuma notificação</h2><p>Quando houver uma tarefa próxima, atrasada ou concluída, ela aparecerá aqui.</p></div> :
          notificacoes.map(n => {
            const lida = lidas.includes(n.id);
            return <button type="button" className={'notification-card ' + (lida ? 'read' : '')} key={n.id} onClick={() => marcarLida(n.id)}>
              <span className={'notification-icon ' + n.tipo} aria-hidden="true">{n.tipo === 'danger' ? '!' : n.tipo === 'warning' ? '◷' : '✓'}</span>
              <span className="notification-copy"><strong>{n.titulo}</strong><span>{n.texto}</span></span>
              <span className="notification-time">{n.horario}</span>
              {!lida && <span className="notification-unread" aria-label="Não lida" />}
            </button>;
          })}
      </section>
      <p className="push-note"><strong>Notificações do dispositivo:</strong> o botão acima habilita os avisos do navegador. Para push em segundo plano com o SGT fechado, será necessário configurar Web Push/VAPID no backend.</p>
    </div>
  );
}
