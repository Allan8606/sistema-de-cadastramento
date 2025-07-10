# Sistema de Cadastramento RealizaCred

Este é um sistema web simples para cadastramento de clientes, controle de despesas e acompanhamento financeiro, desenvolvido para uso interno da RealizaCred.

## Funcionalidades

- **Página Inicial:**
  - Acesso rápido para Clientes, Despesas e Financeiro.

- **Clientes:**
  - Cadastro de clientes (nome, CPF, senha).
  - Pesquisa e listagem de clientes.
  - Edição e exclusão de clientes.

- **Despesas:**
  - Cadastro de despesas (valor, descrição, mês).
  - Máscara de moeda automática para valores.
  - Listagem de despesas por mês, com totalizador.
  - Listagem de despesas totais por mês, com opção de excluir todas as despesas de um mês.
  - Edição e exclusão de despesas individuais.

- **Financeiro:**
  - Cadastro de salário bruto por mês (com máscara de moeda).
  - Acompanhamento: mostra salário bruto, salário líquido (descontando despesas do mês) e total líquido.
  - Edição e exclusão de salários.

## Tecnologias Utilizadas

- HTML5, CSS3, JavaScript (ES6+)
- [Firebase Firestore](https://firebase.google.com/products/firestore) (banco de dados na nuvem)
- Hospedagem recomendada: [Vercel](https://vercel.com/)

## Como rodar localmente

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd sistema-de-cadastramento
   ```
2. **Abra o arquivo `index.html`** no seu navegador.
3. **Configure o Firebase:**
   - O sistema já está pronto para usar o Firestore, mas você pode alterar as credenciais no início dos arquivos JS se necessário.

## Como publicar no Vercel

1. Faça login em [vercel.com](https://vercel.com/).
2. Clique em "New Project" e importe este repositório.
3. O Vercel detecta automaticamente projetos estáticos (HTML/CSS/JS).
4. O arquivo `index.html` será usado como página inicial.
5. Após o deploy, acesse a URL fornecida pela Vercel.

## Observações
- O sistema depende de conexão com a internet para acessar o Firebase.
- Para personalizar as regras de acesso do Firestore, configure no painel do Firebase.
- Para dúvidas ou melhorias, entre em contato com o desenvolvedor.
