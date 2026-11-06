import { useEffect, useState } from 'react';

export default function LoadingFeedback({ variant = 'list', label = 'Carregando conteúdo' }) {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const inicio = Date.now();
    const interval = window.setInterval(() => {
      setSegundos(Math.floor((Date.now() - inicio) / 1000));
    }, 250);
    return () => window.clearInterval(interval);
  }, []);

  if (segundos < 1) return null;

  if (segundos >= 10) {
    return <div className="loading-wait" role="status" aria-live="polite">
      <div className="loading-wait-copy"><strong>Isso está demorando mais que o esperado</strong><span>{label}. Tempo decorrido: {segundos}s.</span></div>
      <div className="loading-progress" aria-hidden="true"><span /></div>
      <small>O SGT continua tentando concluir a solicitação. Não feche esta página.</small>
    </div>;
  }

  const linhas = variant === 'dashboard' ? 4 : variant === 'notifications' ? 3 : 4;
  return <div className={`loading-skeleton loading-skeleton-${variant}`} role="status" aria-label={label}>
    {Array.from({ length: linhas }, (_, index) => <div className="skeleton-row" key={index}>
      <span className="skeleton-shape skeleton-icon" />
      <span className="skeleton-copy"><i /><i /></span>
      <span className="skeleton-shape skeleton-end" />
    </div>)}
    <span className="sr-only">{label}</span>
  </div>;
}
