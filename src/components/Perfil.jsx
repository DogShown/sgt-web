import { useRef, useState } from 'react';
import { perfilService } from '../services/perfilService';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export default function Perfil({ usuario, onUsuarioAtualizado, onSair }) {
  const [nome, setNome] = useState(usuario?.nome || '');
  const [turma, setTurma] = useState(usuario?.turma || '');
  const [avatarUrl, setAvatarUrl] = useState(usuario?.avatarUrl || '');
  const [corCapa, setCorCapa] = useState(usuario?.corCapa || '#075b70');
  const [imagemCapa, setImagemCapa] = useState(usuario?.imagemCapa || '');
  const inputCapaRef = useRef(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const inputFotoRef = useRef(null);

  const iniciais = (nome || 'Usuário').split(' ').filter(Boolean).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();

  const selecionarFoto = (event) => {
    const arquivo = event.target.files?.[0];
    event.target.value = '';
    if (!arquivo) return;
    if (!arquivo.type.startsWith('image/')) {
      setErro('Selecione um arquivo de imagem válido.');
      return;
    }
    if (arquivo.size > MAX_AVATAR_SIZE) {
      setErro('A imagem deve ter no máximo 2 MB.');
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => {
      const imagem = new Image();
      imagem.onload = () => {
        const tamanho = 320;
        const escala = Math.min(tamanho / imagem.width, tamanho / imagem.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(imagem.width * escala));
        canvas.height = Math.max(1, Math.round(imagem.height * escala));
        canvas.getContext('2d').drawImage(imagem, 0, 0, canvas.width, canvas.height);
        const otimizada = canvas.toDataURL('image/jpeg', 0.82);
        setAvatarUrl(otimizada);
        setErro('');
        setMensagem('Prévia da foto atualizada. Salve o perfil para manter neste dispositivo.');
      };
      imagem.onerror = () => setErro('Não foi possível ler essa imagem.');
      imagem.src = leitor.result;
    };
    leitor.onerror = () => setErro('Não foi possível abrir o arquivo selecionado.');
    leitor.readAsDataURL(arquivo);
  };

  const salvar = async (event) => {
    event.preventDefault();
    setErro('');
    setMensagem('');
    setSalvando(true);
    try {
      // Nome, turma e personalização são mantidos localmente até existir endpoint de perfil no backend.
      const usuarioCompleto = { ...usuario, nome: nome.trim(), turma: turma.trim(), avatarUrl, corCapa, imagemCapa };
      try {
        localStorage.setItem('sgt_user', JSON.stringify(usuarioCompleto));
      } catch {
        throw new Error('Não foi possível guardar a foto neste dispositivo. Tente uma imagem menor.');
      }
      onUsuarioAtualizado(usuarioCompleto);
      setMensagem('Perfil atualizado com sucesso.');
    } catch (error) {
      setErro(error.response?.data?.message || error.message || 'Não foi possível atualizar seu perfil.');
    } finally {
      setSalvando(false);
    }
  };

  const removerFoto = () => {
    setAvatarUrl('');
    setMensagem('A foto será removida ao salvar o perfil.');
  };

  return (
    <div className="profile-page profile-discord">
      <header className="page-header profile-header">
        <div><p className="dashboard-eyebrow">SGT / CONTA</p><h1>Meu perfil</h1><p>Personalize sua identidade e mantenha seus dados atualizados.</p></div>
      </header>

      <section className="profile-main-card">
        <div className="profile-cover" style={{'--profile-cover-color':corCapa, ...(imagemCapa ? {backgroundImage: 'linear-gradient(90deg,rgba(3,20,30,.25),rgba(3,20,30,.25)),url(' + imagemCapa + ')'} : {})}}><span>SGT</span><button type="button" className="profile-cover-edit" onClick={() => inputCapaRef.current?.click()}>Alterar capa</button><input ref={inputCapaRef} className="profile-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={event=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;if(file.size>2*1024*1024){setErro('A imagem de fundo deve ter no máximo 2 MB.');return;}const reader=new FileReader();reader.onload=()=>{setImagemCapa(reader.result);setMensagem('Prévia da imagem de fundo atualizada. Salve para manter.');};reader.readAsDataURL(file);}} /></div>
        <div className="profile-identity">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" style={{backgroundColor:corCapa}} aria-label={`Foto de perfil de ${nome || 'Usuário'}`}>
              {avatarUrl ? <img src={avatarUrl} alt="" /> : iniciais}
            </div>
            <button type="button" className="profile-avatar-edit" onClick={() => inputFotoRef.current?.click()} aria-label="Alterar foto de perfil" title="Alterar foto">✎</button>
            <input ref={inputFotoRef} className="profile-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={selecionarFoto} />
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
            <label className="profile-field"><span>Cor de fundo do perfil</span><input type="color" value={corCapa} onChange={e=>setCorCapa(e.target.value)} /></label>
            <div className="profile-field profile-account-type"><span>Tipo de conta</span><div className="profile-account-value"><span className="profile-account-dot" /> Conta pessoal</div></div>
            <div className="profile-form-footer"><span>Foto e personalização ficam salvas neste navegador. A sincronização entre dispositivos será adicionada com suporte no servidor.</span><div className="profile-form-actions"><button type="button" className="btn-outline" onClick={onSair}>Sair da conta</button><button type="submit" className="profile-save-button" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar alterações'} <span aria-hidden="true">→</span></button></div></div>
          </form>
        </div>
      </section>
    </div>
  );
}
