import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function ChatTurma() {
  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem('sgt_user') || '{}');
    } catch {
      return {};
    }
  })();
  const turma = usuario.turma || '';

  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const [conectado, setConectado] = useState(false);
  const [erro, setErro] = useState(() => {
    const token = localStorage.getItem('sgt_token') || sessionStorage.getItem('sgt_token');
    if (!token) return 'Entre novamente para acessar o chat.';
    if (!turma) return 'Sua conta não possui uma turma definida.';
    return '';
  });
  const clientRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('sgt_token') || sessionStorage.getItem('sgt_token');
    if (!token || !turma) return undefined;

    const apiBase = import.meta.env.VITE_API_URL || '/api';
    const wsUrl = apiBase.replace(/\/api\/?$/, '') + '/ws-sgt';
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: { Authorization: 'Bearer ' + token },
      reconnectDelay: 5000,
      onConnect: () => {
        setConectado(true);
        setErro('');
        client.subscribe('/topic/turma/' + turma, frame => {
          try {
            setMensagens(atual => [...atual, JSON.parse(frame.body)].slice(-100));
          } catch {
            setErro('Recebemos uma mensagem em formato inválido.');
          }
        });
      },
      onStompError: frame => {
        setConectado(false);
        setErro(frame.headers?.message || 'O servidor recusou a conexão do chat.');
      },
      onWebSocketClose: () => setConectado(false),
      onWebSocketError: () => setErro('Não foi possível conectar ao chat da turma.')
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [turma]);

  const enviar = event => {
    event.preventDefault();
    const conteudo = texto.trim();
    const client = clientRef.current;
    if (!conteudo || !client?.connected) return;

    client.publish({
      destination: '/app/chat.enviar/' + turma,
      body: JSON.stringify({ conteudo })
    });
    setTexto('');
  };

  return (
    <div className="chat-page">
      <header className="page-header">
        <div>
          <p className="dashboard-eyebrow">SGT / COMUNIDADE</p>
          <h1>Chat da turma</h1>
          <p>Converse com participantes da sua turma.</p>
        </div>
        <span className={conectado ? 'profile-status' : 'profile-feedback error'}>
          {conectado ? 'Conectado' : 'Desconectado'}
        </span>
      </header>

      {erro && <div className="dashboard-alert" role="alert">{erro}</div>}

      <section className="attendance-section" aria-label="Mensagens do chat">
        <div className="chat-messages" aria-live="polite">
          {mensagens.length === 0 ? (
            <p>As mensagens recebidas aparecerão aqui.</p>
          ) : (
            mensagens.map((mensagem, indice) => (
              <article className="chat-message" key={mensagem.dataHora || indice}>
                <strong>{mensagem.remetente || 'Participante'}</strong>
                <p>{mensagem.conteudo}</p>
                <small>
                  {mensagem.dataHora ? new Date(mensagem.dataHora).toLocaleString('pt-BR') : ''}
                </small>
              </article>
            ))
          )}
        </div>

        <form className="attendance-form" onSubmit={enviar}>
          <label>
            Mensagem
            <input
              value={texto}
              onChange={event => setTexto(event.target.value)}
              maxLength={2000}
              placeholder="Escreva uma mensagem..."
              disabled={!conectado}
            />
          </label>
          <button className="btn-primary" type="submit" disabled={!conectado || !texto.trim()}>
            Enviar
          </button>
        </form>
      </section>

      <p className="attendance-disclaimer">
        O remetente e a turma são determinados pelo servidor a partir da sua sessão autenticada.
        Mensagens não são armazenadas como histórico permanente nesta versão.
      </p>
    </div>
  );
}
