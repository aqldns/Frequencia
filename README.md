# 🐑 Sistema de Gestão do Aprisco

Aplicativo web completo para controle de frequência, gestão de membros e classificação automática de desempenho do Aprisco (célula / pequeno grupo).

---

## 🚀 Como Abrir e Usar

1. Basta dar **dois cliques** no arquivo `index.html` ou abri-lo com qualquer navegador (Google Chrome, Microsoft Edge, Firefox, Safari).
2. Não precisa instalar nada, nem Node.js, nem bancos de dados complicados!
3. Todos os dados são **salvos automaticamente** no seu navegador (LocalStorage).

---

## 📋 Funcionalidades

### 1. 👥 Gerenciamento de Membros
- Adicionar novos membros com Nome, Telefone / WhatsApp, Aniversário, Função e Observações.
- Editar e remover pessoas diretamente pela interface visual, sem tocar no código.
- Campo de busca instantânea para encontrar qualquer membro com rapidez.
- **Desligamento com Histórico Preservado**:
  - Ao remover ou desligar um membro, você escolhe até qual mês ele participou.
  - **As presenças e pontos nos meses anteriores continuam 100% salvos e intactos**!
  - Ele apenas deixa de aparecer nos meses seguintes à data de saída, sem prejudicar a média do grupo.
  - Na aba de membros, você pode filtrar por **Todos**, **Ativos** ou **Desligados**, e inclusive **Reativar** um membro a qualquer momento caso ele volte ao grupo!
- **Novas opções de Organização e Ordenação**:
  - 🔤 **Ordem Alfabética (A → Z e Z → A)**
  - ⏱️ **Ordem de Cadastro / Criação** (Mais Antigos ou Mais Recentes primeiro)
  - 💼 **Por Função / Cargo** (Líderes, Vice-líderes, Membros)
  - 🎂 **Por Aniversariantes** (ordenado pelo dia e mês do aniversário)
  - Cabeçalhos clicáveis na tabela: clique em **#** ou **Nome Completo** para alternar a ordem instantaneamente!

### 2. 📅 Frequência Dividida por Meses (Janeiro a Dezembro)
- Sub-abas de cada mês com navegação rápida.
- Adicione facilmente novas datas/programações para cada encontro (ex: Culto, Célula, Reunião de Oração).
- Marcação de presença com **1 clique** na célula:
  - 🟢 **P (Presente)**: vale **1,0 ponto**
  - 🟡 **FJ (Falta Justificada)**: vale **0,5 ponto**
  - 🔴 **F (Falta)**: vale **0,0 ponto**
- Coluna com **Soma de Pontos** de cada membro.
- **Organização e Ordenação na Tabela de Frequência**:
  - 🔤 **Ordem Alfabética (A → Z e Z → A)**
  - ⭐ **Maior Pontuação / Frequência** (os mais assíduos no topo)
  - 🔻 **Menor Pontuação / Frequência** (para identificar quem precisa de cuidado)
  - ⏱️ **Ordem de Cadastro** (Mais Antigos ou Mais Recentes)
  - Colunas interativas: clique no título **Membro** para alternar A-Z ou no título **Pontos** para alternar maior/menor pontuação!
- Botão **"Todos Presentes"** para preencher rapidamente em dias de casa cheia.

### 3. 🏆 Painel de Métricas em Cada Mês
- **Média de Frequência do Aprisco**: média de presentes por programação.
- **Quantidade de Programações**: total de encontros do mês.
- **Quantidade de Membros**: total de cadastrados.
- **Quantidade de Frequentes**: soma dos membros com classificação **Ótimo** e **Bom**.
- **Porcentagem de Frequentes**: `(Frequentes / Membros) * 100`.
- **Totais de Presenças, Faltas e Faltas Justificadas**.
- **Distribuição e Classificação dos Membros**:
  - 🟢 **Ótimo**: Pontos &gt; Programações &times; 0,8
  - 🔵 **Bom**: Pontos &gt; Programações / 2 (e &le; 80%)
  - 🟡 **Regular**: Pontos = Programações / 2 (exatamente a metade)
  - 🔴 **Ruim**: Pontos &lt; Programações / 2 (menor que a metade)
- **Classificação Geral do Aprisco no Mês**:
  - 🌟 **Ótimo**: `(Ótimos + Bons) >= (Membros * 0.8)`
  - 👍 **Bom**: `(Ótimos + Bons) >= (Membros / 2)`
  - ⚠️ **Ruim**: Se não atingir nenhum dos dois.

### 4. 📊 Sub-aba "GERAL" (Consolidado do Ano)
- Mostra a pontuação acumulada de cada pessoa somando todos os meses do ano.
- Total geral de programações realizadas.
- Total de membros e porcentagem geral de assiduidade.
- Classificação final do Aprisco no ano.

### 5. 💾 Backup & Impressão
- **Botão Backup (Download JSON)**: Salve uma cópia de segurança de todos os dados no seu computador.
- **Botão Restaurar**: Carregue um arquivo de backup para restaurar seus dados ou transferir para outro computador/celular.
- **Botão Imprimir**: Gera uma versão limpa da tabela formatada para folha A4 / PDF.
