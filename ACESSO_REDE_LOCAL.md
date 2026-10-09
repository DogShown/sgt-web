# Acessar o SGT por outro computador na mesma rede

Este modo serve para demonstrações e testes na mesma rede Wi-Fi/LAN. O computador principal precisa permanecer ligado com Frontend, Backend e SQL Server em execução.

## 1. No computador principal

1. Inicie o SQL Server e confirme que o banco `sgt_db` está disponível.
2. Inicie o Backend pela IDE. Ele deve ficar disponível em `http://localhost:8080`.
3. No projeto Frontend, atualize o repositório e inicie:
   `npm install`
   `npm run dev -- --host 0.0.0.0`
4. No Windows, execute `ipconfig` e localize o endereço IPv4 da placa conectada à mesma rede, por exemplo `192.168.0.25`.

## 2. No outro computador

Abra no navegador:

`http://IP-DO-COMPUTADOR-PRINCIPAL:5173`

Troque o texto de exemplo pelo IPv4 real do computador principal. Não use `localhost` no outro computador: lá, localhost aponta para o próprio dispositivo.

## 3. Como a API chega ao banco

O navegador envia as requisições para `/api`, na mesma origem do Frontend. O proxy do Vite encaminha essas requisições para `http://localhost:8080` na máquina principal; o Backend usa então a conexão SQL Server definida em `application.properties`.

O outro computador não precisa instalar SQL Server nem acessar diretamente a porta 1433.

## 4. Se o Frontend abrir, mas o cadastro falhar

- Confirme que o Backend continua em execução na máquina principal.
- No computador principal, teste `http://localhost:8080/swagger-ui/index.html`.
- Confira as mensagens do Backend na IDE durante uma tentativa de cadastro.
- Se a requisição falhar antes de chegar ao Backend, confira o Firewall do Windows para permitir o acesso à porta 5173 na rede privada.
- Confirme que os dois computadores estão na mesma rede e que não há isolamento de clientes no Wi-Fi.

## 5. Acesso pela Internet ou por hospedagem

Este documento cobre apenas a rede local. Para acessar o SGT pela Internet, o Backend precisa estar hospedado em um servidor acessível pelo público autorizado e o Frontend deve ser compilado com `VITE_API_URL` apontando para a URL pública da API (incluindo o prefixo `/api`). Configure a variável `SGT_CORS_ALLOWED_ORIGINS` no Backend com a origem exata do Frontend. Não exponha o SQL Server diretamente à Internet e não publique o servidor de desenvolvimento do Vite.

Exemplo de configuração do Frontend em um ambiente hospedado:

`VITE_API_URL=https://api.seu-dominio.example/api`

O endereço acima é apenas um exemplo, não uma URL real do SGT.
