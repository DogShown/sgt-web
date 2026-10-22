import React, { useEffect, useState } from 'react';
import { perfilService } from '../services/perfilService';
import logo from '../assets/logo.jpg';

export default function Perfil({ usuario, onUsuarioAtualizado }) {
  const [nome, setNome] = useState(usuario?.nome || '');
  const [turma, setTurma] = useState(usuario?.turma || '');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    setNome(usuario?.nome || '');
    setTurma(usuario?.turma || '');
  }, [usuario]);

  const salvar = async (event) => {
    event.preventDefault();
    setErro('');
    setMensagem('');
    setSalvando(true);
    try {
      const atualizado = await perfilService.atualizar({ nome: nome.trim(), turma: turma.trim() });
      localStorage.setItem('sgt_user', JSON.stringify(atualizado));
      onUsuarioAtualizado(atualizado);
      setMensagem('Perfil atualizado com sucesso.');
    } catch (error) {
      setErro(error.response?.data?.message || 'Não foi possível atualizar seu perfil.');
    } finally {
      setSalvando(false);
    }
  };

  const iniciais = (nome || 'Usuário')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F3F6F9] text-slate-800 p-4 sm:p-6 md:p-8 font-sans antialiased">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Cabeçalho da Página */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
          <div className="space-y-1">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#0B435B]/70 bg-[#0B435B]/10 px-2.5 py-0.5 rounded-full">
              SGT • Minha conta
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#093545]">
              Meu perfil
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Personalize suas informações para deixar o SGT com a sua cara.
            </p>
          </div>
          {logo && (
            <div className="flex-shrink-0">
              <img src={logo} alt="Logo SGT" className="h-10 w-auto rounded-md object-contain" />
            </div>
          )}
        </header>

        {/* Layout em Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Card Esquerdo: Card do Usuário */}
          <article className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            
            {/* Avatar em Círculo no estilo SGT */}
            <div className="w-20 h-20 rounded-full bg-[#093545] text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-inner">
              {iniciais}
            </div>

            <h2 className="text-lg font-bold text-[#093545] break-all">
              {nome || 'Usuário'}
            </h2>
            
            <p className="text-xs text-slate-500 mb-4 break-all">
              {usuario?.email || 'email@exemplo.com'}
            </p>

            {/* Badge da Turma estilo Padrão SGT */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F3F1] text-[#093545] border border-[#BCE1DA]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B435B]" />
              {turma || 'Turma não definida'}
            </span>
          </article>

          {/* Card Direito: Formulário de Edição */}
          <article className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0B435B]">
                Dados pessoais
              </p>
              <h2 className="text-xl font-bold text-[#093545] mt-0.5">
                Personalizar perfil
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Atualize nome e turma sem alterar seu acesso.
              </p>
            </div>

            {/* Alerta de Sucesso */}
            {mensagem && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium" role="status">
                <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{mensagem}</span>
              </div>
            )}

            {/* Alerta de Erro */}
            {erro && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium" role="alert">
                <svg className="w-4 h-4 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0 1 18 0z" />
                </svg>
                <span>{erro}</span>
              </div>
            )}

            {/* Formulário */}
            <form className="space-y-4" onSubmit={salvar}>
              
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nome
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#093545]/30 focus:border-[#093545] transition-all text-sm"
                  placeholder="Seu nome completo"
                />
              </div>

              {/* E-mail */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  E-mail
                </label>
                <input
                  type="email"
                  value={usuario?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed text-sm"
                />
              </div>

              {/* Turma */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Turma
                </label>
                <input
                  type="text"
                  value={turma}
                  onChange={e => setTurma(e.target.value.toUpperCase())}
                  placeholder="Ex.: INF3BM"
                  required
                  maxLength={50}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#093545]/30 focus:border-[#093545] transition-all text-sm uppercase"
                />
                <p className="text-[11px] text-slate-500 leading-tight">
                  Padrão técnico: curso + ano + turma + período. Ex.: INF3BM.
                </p>
              </div>

              {/* Botão Salvar */}
              <button
                type="submit"
                disabled={salvando}
                className="w-full mt-2 py-2.5 px-4 bg-[#093545] hover:bg-[#0B435B] active:bg-[#062632] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {salvando ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Salvando...</span>
                  </>
                ) : (
                  'Salvar alterações'
                )}
              </button>
            </form>
          </article>

        </section>
      </div>
    </div>
  );
}