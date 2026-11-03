import { useEffect, useMemo, useState } from 'react';
import { tarefaService } from '../services/tarefaService';
import { pushService } from '../services/pushService';

const STORAGE_KEY = 'sgt_notifications_read';

const obterChaveLeitura = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('sgt_user') || '{}');
    return `${STORAGE_KEY}:${usuario.id ?? usuario.email ?? 'usuario'}`;
  } catch {
    return `${STORAGE_KEY}:usuario`;
  }
};

const lerIdsLidos = (chave) => {
  try {
    const dados = JSON.parse(localStorage.getItem(chave) || '[]');
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
};
const dataLocal = (data) => {
  if (!data) return null;
  const [y, m, d] = data.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export default function Notificacoes() {
  const [tarefas, setTarefas] = useState([]);
  const [chaveLeitura] = useState(obterChaveLeitura);
  const [lidas, setLidas] = useState(() => lerIdsLidos(chaveLeitura));
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState('');
  const [pushAtivo, setPushAtivo] = useState(false);
  const [pushCarregando, setPushCarregando] = useState(false);
  const [pushErro, setPushErro] = useState('');

  useEffect(() => {
    tarefaService.listarPorUsuario()
      .then((dados) => setTarefas(Array.isArray(dados) ? dados : []))
      .catch(() => setErroCarregamento('Não foi possível carregar as notificações. Verifique sua conexão e tente novamente.'))
      .finally(() => setCarregando(false));
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

  const naoLidas = notificacoes.filter(n => !lidas.includes(n.id)).length;
  const marcarLida = (id) => {
    const novas = [...new Set([...lidas, id])];
    setLidas(novas);
    localStorage.setItem(chaveLeitura, JSON.stringify(novas));
  };
  const marcarTodas = () => {
    const novas = [...new Set([...lidas, ...notificacoes.map(n => n.id)])];
    setLidas(novas);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novas));
  };
  useEffect(() => {
    const verificarPush = async () => {
      if (!pushService.supported()) return;
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      const subscription = await registration?.pushManager.getSubscription();
      setPushAtivo(Boolean(subscription) && Notification.permission === 'granted');
    };
    verificarPush().catch(() => {});
  }, []);

  const ativarPush = async () => {
    setPushErro('');
    setPushCarregando(true);
    try {
      if (!pushService.supported()) {
        throw new Error('Este navegador ou dispositivo não oferece suporte a notificações push.');
      }
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') throw new Error('A permissão para notificações não foi concedida.');
      }

      if (Notification.permission !== 'granted') {
        throw new Error('As notificações estão bloqueadas neste navegador.');
      }

      await pushService.ativar();
      setPushAtivo(true);
    } catch (error) {
      setPushErro(error.message || 'Não foi possível ativar as notificações.');
    } finally {
      setPushCarregando(false);
    }
  };

  return (
    <div className="notifications-page">
      <header className="page-header notifications-header">
        <div><p className="dashboard-eyebrow">SGT • Central de avisos</p><h1>Notificações</h1><p>{naoLidas ? naoLidas + ' não lida(s)' : 'Tudo em dia por aqui.'}</p></div>
        <div className="notification-actions">
          {pushService.supported() && !pushAtivo && <button type="button" className="btn-outline" onClick={ativarPush} disabled={pushCarregando}>{pushCarregando ? 'Ativando...' : 'Ativar notificações'}</button>}
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
      {pushErro && <p className="push-note push-error" role="alert">{pushErro}</p>}
      <p className="push-note"><strong>Notificações do dispositivo:</strong> em navegadores compatíveis, você pode ativar o Web Push para receber avisos mesmo quando a página não estiver aberta. O servidor precisa estar com as chaves VAPID configuradas.</p>
    </div>
  );
}
