# Sistema de Design — SGT

## Direção visual

O SGT usa uma identidade acadêmica contemporânea: azul-marinho para estrutura e navegação, teal para ações e estados de progresso, superfícies limpas e contraste alto. A interface prioriza leitura, previsibilidade e densidade moderada de informação.

## Tokens

### Cores
- Fundo claro: `#f4f7fa`
- Superfície: `#ffffff`
- Superfície secundária: `#f0f5f7`
- Texto principal: `#102f42`
- Texto de apoio: `#687e8b`
- Borda: `#dbe5ea`
- Ação principal: `#087f8d`
- Navegação: `#092637`

No tema escuro, os tokens são substituídos por fundos azul-carvão, superfícies elevadas e texto claro. Os componentes devem consumir `--theme-*` e `--action-*`, evitando cores de fundo hardcoded.

### Tipografia
- Família: Inter, com fallback para system-ui.
- Títulos de página: escala fluida entre 1.85rem e 2.35rem, peso 780 e tracking negativo.
- Títulos de seção: 1rem–1.15rem, peso 700.
- Texto de interface: 0.78rem–0.95rem, line-height confortável.
- Metadados: 0.65rem–0.76rem, sempre com contraste legível.

### Espaçamento e forma
- Escala baseada em múltiplos de 4/8 px.
- Campos e botões: altura mínima de 44–46 px.
- Cantos: 10 px (controles), 15 px (painéis), 21 px (superfícies principais).
- Bordas discretas e sombras suaves; não usar sombras fortes em cada item de lista.

## Padrões de componentes
- **Navegação:** sidebar fixa em desktop; navegação horizontal e rolável em telas menores; estado ativo claramente indicado.
- **Cabeçalho de página:** breadcrumb/eyebrow, título, descrição curta e ações agrupadas.
- **Cards:** reservar para agrupamentos de informação; listas longas usam divisores e hierarquia tipográfica.
- **Formulários:** rótulos persistentes, estados de foco visíveis, mensagens de erro junto ao contexto e botões com estado de carregamento.
- **Estados:** loading skeleton, vazio, erro, sucesso e desabilitado devem ser explícitos.
- **Dados:** status e prioridade devem combinar texto e cor; cor não deve ser o único indicador.
- **Chat:** autoria, conteúdo e horário com hierarquia clara; conexão e erros sempre visíveis.

## Responsividade
- Desktop: sidebar vertical e conteúdo com largura máxima.
- Tablet: navegação horizontal compacta.
- Celular: conteúdo em uma coluna, formulários empilhados e controles com largura adequada ao toque.
- Não ocultar funções essenciais em telas pequenas.

## Acessibilidade e movimento
- Foco por teclado visível em botões, links e campos.
- Estados de formulário anunciados por `role="alert"` ou `role="status"`.
- Alvos de toque com pelo menos 40 px.
- Contraste suficiente em ambos os temas.
- Respeitar `prefers-reduced-motion`; animações não podem ser necessárias para entender a interface.

## Implementação
Os tokens e os ajustes globais ficam em `src/index.css`. Componentes React devem preferir as classes e tokens existentes, mantendo regras de negócio fora da camada visual.
