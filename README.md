# Sistema de Gerenciamento de Tarefas (SGT)

Frontend web do SGT, desenvolvido com React, Vite e Axios. O backend Java/Spring Boot e o banco SQL Server ficam em repositórios/serviços separados.

## Tecnologias

- React
- Vite
- React Router
- Axios
- ESLint
- Backend: Java 21, Spring Boot e Maven
- Banco de dados: Microsoft SQL Server hospedado no Somee

## Desenvolvimento local

1. Instale Node.js e o JDK 21.
2. Mantenha os repositórios `sgt-web` e `sgt-backend` em pastas irmãs.
3. Abra `sgt-fullstack.code-workspace` no VS Code para trabalhar com frontend e backend na mesma janela.
4. Inicie o backend na porta local `8080), com as variáveis de ambiente do banco configuradas.
5. Na pasta do frontend, instale as dependências com `npm install` e execute `npm run dev`.
6. O Vite encaminha `/api` e `/ws-sgt` para `http://localhost:8080` durante o desenvolvimento.

Os passos completos, requisitos e cuidados com credenciais estão em [DEVELOPMENT.md](./DEVELOPMENT.md).

## API em produção

O frontend lê a URL da API por meio da variável `VITE_API_URL`. Em produção, configure-a na Vercel com a URL pública do backend seguida de `/api`. Se não for definida, o frontend usa `/api`, que funciona com o proxy local do Vite, mas não aponta automaticamente para o backend no deploy da Vercel.

## Repositórios

- [Frontend — sgt-web](https://github.com/DogShown/sgt-web)
- [Backend — sgt-backend](https://github.com/DogShown/sgt-backend)

Não armazene senhas, tokens ou segredos em arquivos versionados.
