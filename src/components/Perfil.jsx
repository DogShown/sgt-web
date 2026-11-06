import { useRef, useState } from 'react';
import { perfilService } from '../services/perfilService';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function otimizarImagem(arquivo, larguraMaxima, alturaMaxima, qualidade = 0.82) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error('Não foi possível abrir a imagem selecionada.'));
    leitor.onload = () => {
      const imagem = new Image();
      imagem.onerror = () => reject(new Error('Não foi possível ler essa imagem.'));
      imagem.onload = () => {
        const escala = Math.min(larguraMaxima / imagem.width, alturaMaxima / imagem.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(imagem.width * escala));
        canvas.height = Math.max(1, Math.round(imagem.height * escala));
        const contexto = canvas.getContext('2d');
        if (!contexto) return reject(new Error('Não foi possível processar essa imagem.'));
        contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', qualidade));
      };
      imagem.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

export default function Perfil({ usuario, onUsuarioAtualizado, onSair }) {
  const [nome, setNome] = useState(usuario?.nome || '');
  const [turma, setTurma] = useState(usuario?.turma || '');
  const [avatarUrl, setAvatarUrl] = useState(usuario?.avatarUrl || '');
  const [corCapa, setCorCapa] = useState(usuario?.corCapa || '#075b70');
  const [imagemCapa, setImagemCapa] = useState(usuario?.imagemCapa || '');
  const inputCapaRef = useRef(null);
  const inputFotoRef = useRef(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const iniciais = (nome || 'Usuário').split(' ').filter(Boolean).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();

  const selecionarImagem = async (event, tipo) => {
    const arquivo = event.target.files?.[0];
    event.target.value = '';
    if (!arquivo) return;
    if (!arquivo.type.startsWith('image/')) {
      setErro('Selecione um arquivo de imagem válido.');
      return;
    }
    if (arquivo.size > MAX_IMAGE_SIZE) {
      setErro('A imagem deve ter no máximo 2 MB.');
      return;
    }

    try {
      const imagem = tipo === 'avatar'
        ? await otimizarImagem(arquivo, 320, 320, 0.82)
        : await otimizarImagem(arquivo, 1400, 700, 0.78);

      if (tipo === 'avatar') {
        setAvatarUrl(imagem);
        setMensagem('Prévia da foto atualizada. Salve para sincronizar com sua conta.');
      } else {
        setImagemCapa(imagem);
        setMensagem('Prévia da capa atualizada. Salve para sincronizar com sua conta.');
      }
      setErro('');
    } catch (error) {
      setErro(error.message || 'Não foi possível processar essa imagem.');
    }
  };

  const salvar = async (event) => {
    event.preventDefault();
    setErro('');
    setMensagem('');
    setSalvando(true);
    try {
      const response = await perfilService.atualizar({
        nome: nome.trim(),
        turma: turma.trim(),
        avatarUrl: avatarUrl || null,
        corCapa,
        imagemCapa: imagemCapa || null
      });
      const usuarioCompleto = {
        ...usuario,
        ...response,
        avatarUrl: response.avatarUrl || '',
        corCapa: response.corCapa || '#075b70',
        imagemCapa: response.imagemCapa || ''
      };
      onUsuarioAtualizado(usuarioCompleto);
      setMensagem('Perfil salvo e sincronizado com sua conta. Suas personalizações estarão disponíveis em outros dispositivos.');
    } catch (error) {
      setErro(error.response?.data?.message || error.message || 'Não foi possível sincronizar seu perfil. Verifique sua conexão e tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const removerFoto = () => {
    setAvatarUrl('');
    setMensagem('A foto será removida da sua conta ao salvar as alterações.');
  };

  return (
    <div className="profile-page profile-discord">
      <header className="page-header profile-header">
        <div><p className="dashboard-eyebrow">SGT / CONTA</p><h1>Meu perfil</h1><p>Personalize sua identidade e mantenha seus dados atualizados.</p></div>
      </header>

      <section className="profile-main-card">
        <div className="profile-cover" style={{'--profile-cover-color':corCapa, ...(imagemCapa ? {backgroundImage: 'linear-gradient(90deg,rgba(3,20,30,.25),rgba(3,20,30,.25)),url(' + imagemCapa + ')'} : {})}}>
          <span>SGT</span>
          <button type="button" className="profile-cover-edit" onClick={() => inputCapaRef.current?.click()}>Alterar capa</button>
          <input ref={inputCapaRef} className="profile-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={event => selecionarImagem(event, 'capa')} />
        </div>
        <div className="profile-identity">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" style={{backgroundColor:corCapa}} aria-label={`Foto de perfil de ${nome || 'Usuário'}`}>
              {avatarUrl ? <img src={avatarUrl} alt="" /> : iniciais}
            </div>
            <button type="button" className="profile-avatar-edit" onClick={() => inputFotoRef.current?.click()} aria-label="Alterar foto de perfil" title="Alterar foto">✎</button>
            <input ref={inputFotoRef} className="profile-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => selecionarImagem(event, 'avatar')} />
          </div>
          <div className="profile-identity-copy"><span className="profile-status"><i /> Conta SGT</span><h2>{nome || 'Usuário'}</h2><p>{usuario?.email || 'E-mail não informado'}</p></div>
          <div className="profile-identity-actions">
            <button type="button" className="btn-outline" onClick={() => inputFotoRef.current?.click()}>Alterar foto</button>
            {avatarUrl && <button type="button" className="btn-ghost" onClick={removerFoto}>Remover</button>}
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-content-heading"><div><p className="profile-section-kicker">SEU ESPAÇO</p><h2>Informações da conta</h2><p>Esses dados ajudam a identificar seu perfil dentro do SGT.</p></div></div>
          {mensagem && <div className="profile-feedback success" role="status">{mensagem}</div>}
          {erro && <div className="profile-feedback error" role="alert">{erro}</div>}

          <form className="profile-form profile-form-grid" onSubmit={salvar}>
            <label className="profile-field"><span>Nome completo</span><input type="text" value={nome} onChange={(event) => setNome(event.target.value)} required maxLength={100} placeholder="Digite seu nome completo" autoComplete="name" /></label>
            <label className="profile-field"><span>Nome de usuário</span><input type="text" value={usuario?.email || ''} disabled /><small>Seu e-mail é usado para entrar no SGT.</small></label>
            <label className="profile-field"><span>Turma</span><input type="text" value={turma} onChange={(event) => setTurma(event.target.value.toUpperCase())} placeholder="Ex.: INF3BM" required maxLength={50} autoComplete="organization" /><small>Curso, ano e período.</small></label>
            <label className="profile-field"><span>Cor de fundo do perfil</span><input type="color" value={corCapa} onChange={event => setCorCapa(event.target.value)} /></label>
            <div className="profile-field profile-account-type"><span>Tipo de conta</span><div className="profile-account-value"><span className="profile-account-dot" /> Conta pessoal</div></div>
            <div className="profile-form-footer"><span>Foto, cor e capa serão armazenadas na sua conta e sincronizadas entre dispositivos.</span><div className="profile-form-actions"><button type="button" className="btn-outline" onClick={onSair}>Sair da conta</button><button type="submit" className="profile-save-button" disabled={salvando}>{salvando ? 'Sincronizando...' : 'Salvar alterações'} <span aria-hidden="true">→</span></button></div></div>
          </form>
        </div>
      </section>
    </div>
  );
}
