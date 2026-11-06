# Auditoria funcional — Redesign global do SGT

**Branch analisada:** `design/sgt-app-visual-refresh`  
**Backend analisado:** `DogShown/sgt-backend`, branch `main`  
**Escopo:** conferir os seis pontos levantados antes de ampliar o redesign.  
**Nota:** este documento registra o que existe no código-fonte consultado; não representa teste de produção.

## 1. Navegação

**Estado anterior:** a aplicação alternava telas por estado local em `App.jsx`. Isso não oferecia URLs independentes para cada seção e não preservava a tela ao atualizar o navegador ou usar voltar/avançar.

**Implementação:** migração para `react-router-dom`, já presente nas dependências:
- Público: `/`, `/login`, `/cadastro`.
- Área autenticada: `/app/dashboard`, `/app/tarefas`, `/app/frequencia`, `/app/notificacoes`, `/app/perfil`, `/app/usuario`.
- Acesso a `/app/*` sem sessão redireciona para `/login`.
- Sessão autenticada que acessa uma rota pública é encaminhada ao Dashboard.
- Sidebar navega por URL; a rota atual determina o item ativo.
- Rota privada desconhecida retorna ao Dashboard.

**Validação pendente:** atualizar/abrir diretamente cada URL no host Vercel. A hospedagem precisa fazer fallback de rotas SPA para `index.html`; se não fizer, configurar rewrite no Vercel. Build e navegação real ainda não foram executados nesta alteração.

## 2. Autenticação

**Confirmado no backend:** `POST /api/auth/login`, `POST /api/auth/cadastrar`, `GET /api/auth/me` e `PUT /api/auth/me`. O frontend consome login/cadastro e consulta/atualiza o usuário autenticado.

**Não encontrado:** endpoints ou serviços para recuperação e redefinição de senha. Portanto, esses fluxos não foram adicionados nem simulados.

**Próximo requisito para implementar recuperação:** definir fluxo seguro de solicitação, token temporário com expiração, envio de e-mail e redefinição no backend antes de criar interface.

## 3. Tarefas

**Confirmado no backend:**
- `POST /api/tarefas`: criação.
- `GET /api/tarefas`: listagem do usuário autenticado.
- `PUT /api/tarefas/{id}/status?status=...`: mudança entre pendente e em andamento.
- `PUT /api/tarefas/{id}/concluir`: conclusão.
- `DELETE /api/tarefas/{id}`: exclusão.

O frontend usa os caminhos e métodos correspondentes por meio de `tarefaService`. A interface tem criação, mudança de status, conclusão e exclusão.

**Limitação confirmada:** não há endpoint de edição dos dados da tarefa no controller/service consultados, nem formulário de edição no componente. A visualização detalhada também não está implementada como fluxo separado. Não foi inventado um endpoint ou uma edição apenas local.

**Para completar CRUD:** criar contrato de atualização (DTO, validação, autorização por proprietário, service e controller), testes e só então interface de edição.

## 4. Perfil e conta

**Confirmado:** `GET /api/auth/me` e `PUT /api/auth/me` permitem consultar e atualizar nome, turma, avatar, cor de capa e imagem de capa. O DTO de resposta contém esses campos, e o frontend envia esses dados pelo `perfilService`.

**Não encontrado:** alteração de e-mail, troca de senha ou exclusão de conta. O e-mail aparece desabilitado na interface e não foi apresentado como editável. Não foram criadas ações sem suporte de backend.

## 5. Frequência

**Confirmado:** `Frequencia.jsx` armazena configurações e registros em `localStorage`; não existe entidade, repositório, controller ou endpoint de frequência no backend consultado.

**Implementação realizada:** a chave de armazenamento agora é separada por ID da conta conectada, evitando que contas diferentes no mesmo navegador compartilhem automaticamente os mesmos registros. A interface também informa explicitamente que os dados ficam neste navegador/dispositivo e não sincronizam com o banco.

**Limitação:** não há sincronização entre dispositivos nem backup na conta. Implementá-la exige definir modelo de dados, regras de acesso, endpoints e migração segura.

## 6. Chat

**Confirmado no backend:** existe `ChatController` com mensagem STOMP em `/app/chat.enviar/{turma}` e publicação em `/topic/turma/{turma}`, além de configuração WebSocket.

**Frontend:** o inventário de arquivos e a busca nos componentes/serviços não identificaram interface ou cliente WebSocket conectado a esse controller.

**Conclusão:** o chat está apenas parcialmente implementado no produto (infraestrutura/backend sem fluxo de interface identificado). Não foi acrescentada uma tela fictícia. Antes de expor o chat, também é necessário revisar autenticação/autorização da conexão, validação da turma e identidade do remetente.

## Registro das alterações desta etapa

| Arquivo | Alteração |
|---|---|
| `src/App.jsx` | Rotas reais, URLs por seção, navegação da sidebar, proteção de rotas e redirecionamentos de sessão |
| `src/components/Frequencia.jsx` | Persistência local separada por conta e aviso claro sobre ausência de sincronização |
| `AUDITORIA_REDESIGN_GLOBAL.md` | Este inventário de capacidades, lacunas e próximos requisitos |

## Critérios de validação ainda abertos

- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] Abrir diretamente e atualizar todas as URLs públicas e privadas no Vercel.
- [ ] Testar voltar/avançar do navegador.
- [ ] Testar acesso sem token e sessão expirada.
- [ ] Testar troca de conta no mesmo navegador para confirmar isolamento da Frequência.
- [ ] Testar tema claro/escuro em todas as rotas.
- [ ] Validar fluxos de tarefas e perfil contra o backend publicado.

**Status:** alterações de código enviadas à branch; não declarar como validadas até executar os testes acima.
