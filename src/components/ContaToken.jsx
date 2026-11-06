import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { contaService } from '../services/contaService';

export default function ContaToken({ modo = 'recuperar' }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [email,setEmail] = useState('');
  const [senha,setSenha] = useState('');
  const [confirmacao,setConfirmacao] = useState('');
  const [mensagem,setMensagem] = useState('');
  const [erro,setErro] = useState('');
  const [enviando,setEnviando] = useState(false);

  useEffect(() => {
    if (modo !== 'confirmar-email') return;
    let ativo=true;
    contaService.confirmarEmail(token).then(()=>{if(ativo)setMensagem('E-mail confirmado. Você já pode entrar usando o novo endereço.');})
      .catch(e=>{if(ativo)setErro(e.response?.data?.message||'Não foi possível confirmar este e-mail. O link pode ter expirado.');});
    return ()=>{ativo=false;};
  },[modo,token]);

  const enviar = async e => {
    e.preventDefault();setErro('');setMensagem('');setEnviando(true);
    try {
      if(modo==='recuperar') {
        await contaService.solicitarRecuperacao(email.trim().toLowerCase());
        setMensagem('Se houver uma conta com esse e-mail, enviaremos as instruções para redefinir a senha.');
      } else {
        if(senha!==confirmacao) throw new Error('As senhas não coincidem.');
        await contaService.redefinirSenha(token,senha);
        setMensagem('Senha redefinida com sucesso. Entre com sua nova senha.');
      }
    } catch(e) {setErro(e.response?.data?.message||e.message||'Não foi possível concluir a solicitação.');}
    finally {setEnviando(false);}
  };

  const titulo=modo==='recuperar'?'Recuperar senha':modo==='redefinir'?'Criar nova senha':'Confirmar novo e-mail';
  return <main className="auth-page" aria-labelledby="conta-token-title"><section className="auth-form-panel"><div className="auth-card">
    <button type="button" className="back-link" onClick={()=>navigate('/login')}>← Voltar para o login</button>
    <div className="auth-heading"><h1 id="conta-token-title">{titulo}</h1><p>{modo==='recuperar'?'Informe o e-mail cadastrado para receber um link de recuperação.':modo==='redefinir'?'Escolha uma nova senha para sua conta.':'Estamos verificando o link de confirmação enviado para seu novo e-mail.'}</p></div>
    {mensagem&&<div className="form-message success" role="status">{mensagem}</div>}
    {erro&&<div className="form-message error" role="alert">{erro}</div>}
    {modo!=='confirmar-email'&&<form onSubmit={enviar}>
      {modo==='recuperar'?<label className="form-field"><span>E-mail</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required /></label>:<>
        <label className="form-field"><span>Nova senha</span><input type="password" minLength={8} maxLength={72} value={senha} onChange={e=>setSenha(e.target.value)} autoComplete="new-password" required /></label>
        <label className="form-field"><span>Confirmar nova senha</span><input type="password" minLength={8} maxLength={72} value={confirmacao} onChange={e=>setConfirmacao(e.target.value)} autoComplete="new-password" required /></label>
      </>}
      <button className="btn-primary btn-full" type="submit" disabled={enviando}>{enviando?'Enviando...':modo==='recuperar'?'Enviar instruções':'Redefinir senha'}</button>
    </form>}
    {mensagem&&<button type="button" className="btn-primary btn-full" onClick={()=>navigate('/login')}>Ir para o login</button>}
  </div></section></main>;
}