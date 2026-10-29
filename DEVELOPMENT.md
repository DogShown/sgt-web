# Ambiente de desenvolvimento — SGT

O SGT continua organizado em dois repositórios independentes:

- **Frontend:** [sgt-web](https://github.com/DogShown/sgt-web) — React, Vite e Axios.
- **Backend:** [sgt-backend](https://github.com/DogShown/sgt-backend) — Java 21, Spring Boot, Maven e SQL Server.

O arquivo `sgt-fullstack.code-workspace` abre os dois repositórios na mesma janela do VS Code sem copiar ou duplicar o backend dentro do frontend. Isso preserva os caminhos de build/deploy já usados pela Vercel e pelo Render.

## Estrutura local esperada

Mantenha os dois repositórios lado a lado, com estes nomes:

```text
pasta-do-projeto/
├── sgt-web/
│   └── sgt-fullstack.code-workspace
└── sgt-backend/
    ├── pom.xml
    ├── mvnw
    ├── mvnw.cmd
    └── src/
```

Abra o arquivo `sgt-fullstack.code-workspace` no VS Code. A pasta `../sgt-backend` precisa existir ao lado de `sgt-web`; se ela não estiver clonada/baixada, a pasta do backend aparecerá como indisponível.

## Requisitos

- **JDK 21** (não apenas JRE), necessário para compilar o backend.
- **Node.js** compatível com a versão de Vite declarada no `package.json`.
- Extensões recomendadas pelo workspace: Java Extension Pack, Spring Boot Extension Pack, ESLint e Prettier.
- Acesso ao SQL Server hospedado no Somee.

O Maven Wrapper já faz parte do repositório do backend (`mvnw` e `mvnw.cmd`), então não é necessário instalar Maven globalmente. O JDK e as permissões para executar os comandos continuam sendo necessários.

## Configuração local do backend

O arquivo `src/main/resources/application.properties` lê as credenciais do banco pelas variáveis de ambiente:

- `SGT_DB_USERNAME` — usuário SQL.
- `SGT_DB_PASSWORD` — senha SQL.
- `SGT_JWT_SECRET` — segredo de assinatura JWT. Para uso local, o projeto tem um valor de fallback; configure um segredo privado próprio para qualquer ambiente compartilhado/produção.

Não coloque senhas, tokens ou segredos em arquivos versionados, no README ou no chat. Não reutilize o segredo local de desenvolvimento em produção.

O backend usa a porta padrão do Spring Boot (`8080`) localmente. O Vite já encaminha `/api` e `/ws-sgt` para `http://localhost:8080`; por isso, o frontend pode continuar usando a URL padrão `/api` em desenvolvimento.

## Executar (em uma máquina na qual a execução de comandos seja permitida)

1. Instale o JDK 21 e o Node.js.
2. Na pasta do backend, configure as variáveis de ambiente do banco e inicie a aplicação Spring Boot pelo painel Spring Boot/Java do VS Code ou pelo Maven Wrapper.
3. Na pasta do frontend, instale as dependências com `npm install` e inicie o Vite com `npm run dev`.
4. Abra a URL local mostrada pelo Vite e teste cadastro/login, perfil e tarefas.

Se o terminal ou a execução de programas estiver bloqueado pelo administrador do computador, as extensões não removem essa restrição. Use uma máquina autorizada ou peça ao responsável pela TI/professor para disponibilizar o ambiente necessário.

## Observações de integração

- O proxy do `vite.config.js` é apenas para desenvolvimento local; ele não configura a URL da API na Vercel.
- Na Vercel, `VITE_API_URL` deve apontar para a URL pública do backend seguida de `/api`.
- No Render, configure as variáveis de ambiente do backend no painel do serviço; não versione credenciais.
- Web Push é opcional: as chaves VAPID só precisam ser configuradas se a funcionalidade de notificações push for usada.
