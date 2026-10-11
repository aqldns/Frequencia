/**
 * Gestão de Aprisco - Sistema de Frequência, Membros e Classificação
 * Desenvolvido para controle fácil, intuitivo e sem necessidade de mexer no código.
 */

function aplicarIconeAba() {
  if (typeof CONFIG_IMAGEM_ABA !== 'undefined' && CONFIG_IMAGEM_ABA) {
    let link = document.getElementById('iconeAbaSite');
    if (!link) {
      link = document.createElement('link');
      link.id = 'iconeAbaSite';
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = CONFIG_IMAGEM_ABA;

    let appleLink = document.querySelector("link[rel='apple-touch-icon']");
    if (appleLink) {
      appleLink.href = CONFIG_IMAGEM_ABA;
    }
  }
}

// Nomes dos meses em português
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Estrutura de Estado Padrão Inicial
const defaultState = {
  nomeAprisco: 'Meu Aprisco',
  anoAtual: '2026',
  ordemMembros: 'nome_az',
  ordemFrequencia: 'nome_az',
  membros: [
    { id: '1', nome: 'Dennis Alves', telefone: '(11) 98765-4321', nascimento: '1998-05-15', funcao: 'Líder', obs: 'Coordenação do grupo', ativo: true, createdAt: 1700000001000 },
    { id: '2', nome: 'Beatriz Silva', telefone: '(11) 97654-3210', nascimento: '2001-08-22', funcao: 'Vice-Líder', obs: '', ativo: true, createdAt: 1700000002000 },
    { id: '3', nome: 'Carlos Eduardo', telefone: '(11) 96543-2109', nascimento: '2000-02-10', funcao: 'Membro', obs: '', ativo: true, createdAt: 1700000003000 },
    { id: '4', nome: 'Daniela Souza', telefone: '(11) 95432-1098', nascimento: '1999-11-30', funcao: 'Membro', obs: '', ativo: true, createdAt: 1700000004000 },
    { id: '5', nome: 'Felipe Santos', telefone: '(11) 94321-0987', nascimento: '2002-04-18', funcao: 'Membro', obs: '', ativo: true, createdAt: 1700000005000 }
  ],
  // Estrutura por ano -> mês (0 a 11) -> { programacoes: [{id, data, descricao}], frequencias: { [membroId]: { [progId]: 'P'|'FJ'|'F' } } }
  anos: {
    '2026': {
      meses: {
        '0': {
          programacoes: [
            { id: 'p_2026_0_1', data: '2026-01-07', descricao: 'Abertura de Ano' },
            { id: 'p_2026_0_2', data: '2026-01-14', descricao: 'Comunhão' },
            { id: 'p_2026_0_3', data: '2026-01-21', descricao: 'Estudo Bíblico' },
            { id: 'p_2026_0_4', data: '2026-01-28', descricao: 'Louvor e Oração' }
          ],
          frequencias: {
            '1': { 'p_2026_0_1': 'P', 'p_2026_0_2': 'P', 'p_2026_0_3': 'P', 'p_2026_0_4': 'P' },
            '2': { 'p_2026_0_1': 'P', 'p_2026_0_2': 'P', 'p_2026_0_3': 'FJ', 'p_2026_0_4': 'P' },
            '3': { 'p_2026_0_1': 'P', 'p_2026_0_2': 'P', 'p_2026_0_3': 'F', 'p_2026_0_4': 'P' },
            '4': { 'p_2026_0_1': 'P', 'p_2026_0_2': 'FJ', 'p_2026_0_3': 'F', 'p_2026_0_4': 'F' },
            '5': { 'p_2026_0_1': 'F', 'p_2026_0_2': 'F', 'p_2026_0_3': 'F', 'p_2026_0_4': 'F' }
          }
        }
      }
    }
  }
};

// Estado em memória
let appData = { ...defaultState };
let currentMonthIndex = 0; // 0 a 11, ou 'geral'
let currentMainTab = 'frequencia'; // 'frequencia', 'membros', 'regras'
let filtroStatusMembro = 'todos'; // 'todos', 'ativos', 'inativos'

// Chave do LocalStorage
const STORAGE_KEY = 'aprisco_gestao_data_v1';

// Carregar dados salvos ou padrão
function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      appData = JSON.parse(saved);
      if (!appData.anos) appData.anos = {};
      if (!appData.membros) appData.membros = [];
      if (!appData.nomeAprisco) appData.nomeAprisco = 'Meu Aprisco';
      if (!appData.anoAtual) appData.anoAtual = '2026';
      if (!appData.ordemMembros) appData.ordemMembros = 'nome_az';
      if (!appData.ordemFrequencia) appData.ordemFrequencia = 'nome_az';

      // Garantir integridade de campos em membros
      appData.membros.forEach((m, idx) => {
        if (!m.createdAt) m.createdAt = 1700000000000 + (idx * 1000);
        if (m.ativo === undefined) m.ativo = true;
      });
    } catch (e) {
      console.error('Erro ao ler LocalStorage, usando dados padrão', e);
      appData = JSON.parse(JSON.stringify(defaultState));
    }
  } else {
    appData = JSON.parse(JSON.stringify(defaultState));
    saveState();
  }
}

// Salvar dados no LocalStorage
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

// Helper: Retorna o objeto do ano atual
function getCurrentYearData() {
  const ano = appData.anoAtual;
  if (!appData.anos[ano]) {
    appData.anos[ano] = { meses: {} };
  }
  if (!appData.anos[ano].meses) {
    appData.anos[ano].meses = {};
  }
  return appData.anos[ano];
}

// Helper: Retorna os dados de um mês específico (0 a 11)
function getMonthData(mIndex) {
  const yearData = getCurrentYearData();
  const mKey = String(mIndex);
  if (!yearData.meses[mKey]) {
    yearData.meses[mKey] = {
      programacoes: [],
      frequencias: {}
    };
  }
  if (!yearData.meses[mKey].programacoes) yearData.meses[mKey].programacoes = [];
  if (!yearData.meses[mKey].frequencias) yearData.meses[mKey].frequencias = {};
  return yearData.meses[mKey];
}

// ====================================================================
// CONTROLE DE HISTÓRICO & STATUS DE MEMBROS (DESLIGAMENTO PRESERVADO)
// ====================================================================

/**
 * Verifica se o membro estava ativo em um determinado mês e ano.
 * Regra:
 * - Se m.ativo !== false: ativo sempre.
 * - Se m.ativo === false: ativo até o mês/ano de saída (inclusive).
 *   A partir do mês seguinte à saída, retorna false.
 */
function isMembroAtivoNoMes(membro, ano, mesIndex) {
  if (membro.ativo !== false) return true;

  const anoSaida = parseInt(membro.anoSaida !== undefined ? membro.anoSaida : ano, 10);
  const mesSaida = parseInt(membro.mesSaida !== undefined ? membro.mesSaida : 11, 10);

  const periodoSaida = (anoSaida * 12) + mesSaida;
  const periodoMes = (parseInt(ano, 10) * 12) + parseInt(mesIndex, 10);

  return periodoMes <= periodoSaida;
}

/**
 * Verifica se um membro deve aparecer na visão Geral do ano.
 * Aparece se estava ativo em algum momento daquele ano ou se possui frequências registradas.
 */
function isMembroPresenteNoAno(membro, ano) {
  if (membro.ativo !== false) return true;

  const anoSaida = parseInt(membro.anoSaida !== undefined ? membro.anoSaida : ano, 10);
  const anoAlvo = parseInt(ano, 10);

  // Se saiu em ano posterior, esteve presente o ano todo
  if (anoSaida > anoAlvo) return true;
  // Se saiu neste ano, esteve presente em parte dele
  if (anoSaida === anoAlvo) return true;

  // Se saiu em ano anterior, verificar se possui algum registro salvo neste ano
  const yearData = appData.anos[ano];
  if (yearData && yearData.meses) {
    for (let m = 0; m < 12; m++) {
      const mObj = yearData.meses[String(m)];
      if (mObj && mObj.frequencias && mObj.frequencias[membro.id]) {
        const statuses = Object.values(mObj.frequencias[membro.id]);
        if (statuses.some(s => s === 'P' || s === 'FJ' || s === 'F')) return true;
      }
    }
  }

  return false;
}

// ====================================================================
// FUNÇÕES DE ORDENAÇÃO DE MEMBROS E FREQUÊNCIA
// ====================================================================

function ordenarListaMembros(lista, criterio) {
  const sorted = [...lista];

  switch (criterio) {
    case 'nome_az':
      return sorted.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
    case 'nome_za':
      return sorted.sort((a, b) => b.nome.localeCompare(a.nome, 'pt-BR', { sensitivity: 'base' }));
    case 'criacao_antigos':
      return sorted.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    case 'criacao_recentes':
      return sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    case 'funcao':
      return sorted.sort((a, b) => {
        const fA = (a.funcao || 'Membro').toLowerCase();
        const fB = (b.funcao || 'Membro').toLowerCase();
        if (fA.includes('líder') && !fB.includes('líder')) return -1;
        if (!fA.includes('líder') && fB.includes('líder')) return 1;
        return fA.localeCompare(fB, 'pt-BR');
      });
    case 'aniversario':
      return sorted.sort((a, b) => {
        if (!a.nascimento && !b.nascimento) return 0;
        if (!a.nascimento) return 1;
        if (!b.nascimento) return -1;
        const aPartes = a.nascimento.split('-');
        const bPartes = b.nascimento.split('-');
        const aMD = (aPartes[1] || '99') + (aPartes[2] || '99');
        const bMD = (bPartes[1] || '99') + (bPartes[2] || '99');
        return aMD.localeCompare(bMD);
      });
    default:
      return sorted;
  }
}

function ordenarMembrosStats(listaStats, criterio) {
  const sorted = [...listaStats];

  switch (criterio) {
    case 'nome_az':
      return sorted.sort((a, b) => a.membro.nome.localeCompare(b.membro.nome, 'pt-BR', { sensitivity: 'base' }));
    case 'nome_za':
      return sorted.sort((a, b) => b.membro.nome.localeCompare(a.membro.nome, 'pt-BR', { sensitivity: 'base' }));
    case 'pontos_desc':
      return sorted.sort((a, b) => {
        if (b.totalPontos !== a.totalPontos) return b.totalPontos - a.totalPontos;
        return a.membro.nome.localeCompare(b.membro.nome, 'pt-BR');
      });
    case 'pontos_asc':
      return sorted.sort((a, b) => {
        if (a.totalPontos !== b.totalPontos) return a.totalPontos - b.totalPontos;
        return a.membro.nome.localeCompare(b.membro.nome, 'pt-BR');
      });
    case 'criacao_antigos':
      return sorted.sort((a, b) => (a.membro.createdAt || 0) - (b.membro.createdAt || 0));
    case 'criacao_recentes':
      return sorted.sort((a, b) => (b.membro.createdAt || 0) - (a.membro.createdAt || 0));
    default:
      return sorted;
  }
}

// Alternar ordenações interativamente
function alternarOrdemNomeFrequencia() {
  const atual = appData.ordemFrequencia;
  appData.ordemFrequencia = (atual === 'nome_az') ? 'nome_za' : 'nome_az';
  saveState();
  renderApp();
  showToast(`Ordenado por: ${appData.ordemFrequencia === 'nome_az' ? 'Nome (A → Z)' : 'Nome (Z → A)'}`);
}

function alternarOrdemPontosFrequencia() {
  const atual = appData.ordemFrequencia;
  appData.ordemFrequencia = (atual === 'pontos_desc') ? 'pontos_asc' : 'pontos_desc';
  saveState();
  renderApp();
  showToast(`Ordenado por: ${appData.ordemFrequencia === 'pontos_desc' ? 'Maior Pontuação' : 'Menor Pontuação'}`);
}

function alternarOrdemNomeMembros() {
  const atual = appData.ordemMembros;
  appData.ordemMembros = (atual === 'nome_az') ? 'nome_za' : 'nome_az';
  saveState();
  renderApp();
  showToast(`Membros ordenados: ${appData.ordemMembros === 'nome_az' ? 'A → Z' : 'Z → A'}`);
}

function alternarOrdemCriacaoMembros() {
  const atual = appData.ordemMembros;
  appData.ordemMembros = (atual === 'criacao_antigos') ? 'criacao_recentes' : 'criacao_antigos';
  saveState();
  renderApp();
  showToast(`Membros ordenados: ${appData.ordemMembros === 'criacao_antigos' ? 'Mais Antigos primeiro' : 'Mais Recentes primeiro'}`);
}

function selecionarOrdemMembros(criterio) {
  appData.ordemMembros = criterio;
  saveState();
  renderApp();
  showToast(`Ordenação alterada com sucesso!`);
}

// ====================================================================
// MOTOR DE CÁLCULO DAS REGRAS (MENSAL E GERAL)
// ====================================================================

function calcularPontosPessoa(registros) {
  let p = 0, fj = 0, f = 0;
  Object.values(registros || {}).forEach(status => {
    if (status === 'P') p++;
    else if (status === 'FJ') fj++;
    else if (status === 'F') f++;
  });
  const totalPontos = (p * 1.0) + (fj * 0.5) + (f * 0);
  return { p, fj, f, totalPontos };
}

function classificarMembro(pontos, totalProgramacoes) {
  if (totalProgramacoes === 0) return { label: 'Sem dados', classKey: 'neutro' };

  const metaOtimo = totalProgramacoes * 0.8;
  const metade = totalProgramacoes / 2;

  // Ótimo: Pontos > Programações * 0.8
  if (pontos > metaOtimo) {
    return { label: 'Ótimo', classKey: 'otimo' };
  }
  // Bom: Pontos > Programações / 2 (e <= metaOtimo)
  if (pontos > metade) {
    return { label: 'Bom', classKey: 'bom' };
  }
  // Regular: Pontos = Programações / 2
  if (Math.abs(pontos - metade) < 0.001) {
    return { label: 'Regular', classKey: 'regular' };
  }
  // Ruim: Pontos < Programações / 2
  return { label: 'Ruim', classKey: 'ruim' };
}

function classificarAprisco(qtdFrequentes, totalMembros, totalProgramacoes) {
  if (totalMembros === 0 || totalProgramacoes === 0) {
    return {
      status: 'Aguardando Dados',
      desc: 'Adicione programações e membros para gerar a avaliação.',
      colorClass: 'from-slate-700 to-slate-800',
      badgeClass: 'bg-slate-100 text-slate-700'
    };
  }

  const metaOtimo = totalMembros * 0.8;
  const metaBom = totalMembros / 2;

  if (qtdFrequentes >= metaOtimo) {
    return {
      status: 'Ótimo',
      desc: `Frequentes (${qtdFrequentes}) atingiram a meta de 80% dos membros ativos (${Math.ceil(metaOtimo)}). Excelente assiduidade!`,
      colorClass: 'from-emerald-900 via-emerald-800 to-teal-900',
      badgeClass: 'bg-emerald-100 text-emerald-800'
    };
  }

  if (qtdFrequentes >= metaBom) {
    return {
      status: 'Bom',
      desc: `Frequentes (${qtdFrequentes}) representam mais da metade dos membros ativos (${Math.ceil(metaBom)}). Bom engajamento!`,
      colorClass: 'from-blue-900 via-indigo-800 to-blue-950',
      badgeClass: 'bg-blue-100 text-blue-800'
    };
  }

  return {
    status: 'Ruim',
    desc: `Frequentes (${qtdFrequentes}) estão abaixo de 50% dos membros ativos (${Math.ceil(metaBom)}). Necessário atenção e pastoreio.`,
    colorClass: 'from-rose-950 via-rose-900 to-red-950',
    badgeClass: 'bg-rose-100 text-rose-800'
  };
}

// ====================================================================
// RENDERIZAÇÃO DA INTERFACE
// ====================================================================

function renderApp() {
  document.getElementById('apriscoNameDisplay').textContent = appData.nomeAprisco || 'Gestão do Aprisco';
  document.getElementById('anoSelect').value = appData.anoAtual || '2026';

  const totalAtivos = appData.membros.filter(m => m.ativo !== false).length;
  document.getElementById('badgeTotalMembrosNav').textContent = totalAtivos;
  document.getElementById('badgeContadorMembros').textContent = `${totalAtivos} Membro(s) Ativo(s)`;

  // Sincronizar seletores de ordenação
  const selOrdemFreq = document.getElementById('selectOrdemFrequencia');
  if (selOrdemFreq) selOrdemFreq.value = appData.ordemFrequencia || 'nome_az';

  const selOrdemMembros = document.getElementById('selectOrdemMembros');
  if (selOrdemMembros) selOrdemMembros.value = appData.ordemMembros || 'nome_az';

  // Atualizar pílulas de meses
  document.querySelectorAll('.month-pill').forEach(btn => {
    const m = btn.dataset.month;
    if (m === String(currentMonthIndex)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (currentMainTab === 'frequencia') {
    if (currentMonthIndex === 'geral') {
      renderGeralView();
    } else {
      renderMonthlyView(currentMonthIndex);
    }
  } else if (currentMainTab === 'membros') {
    renderMembrosView();
  }
}

/**
 * Renderiza a visão Mensal (Janeiro a Dezembro)
 * Apenas exibe membros que estavam ativos neste mês!
 * Quem foi desligado antes não aparece; quem foi desligado depois ou neste mês continua aparecendo.
 */
function renderMonthlyView(mIndex) {
  const mData = getMonthData(mIndex);
  const programacoes = mData.programacoes || [];
  const totalProgramacoes = programacoes.length;

  // Filtrar membros que estavam ativos neste mês
  const membrosDoMes = appData.membros.filter(m => isMembroAtivoNoMes(m, appData.anoAtual, mIndex));
  const totalMembros = membrosDoMes.length;

  // Atualizar cabeçalho do mês
  document.getElementById('currentPeriodTitle').innerHTML = `
    <span>Mês de ${MESES[mIndex]}</span>
    <span class="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1 rounded-full">${totalProgramacoes} Programação(ões)</span>
  `;
  document.getElementById('currentPeriodSubtitle').textContent = `Registro de frequência de ${MESES[mIndex]} de ${appData.anoAtual} (${totalMembros} membros participantes no período)`;
  document.getElementById('monthActionButtons').classList.remove('hidden');

  let totalPresencasMes = 0;
  let totalFaltasJustMes = 0;
  let totalFaltasMes = 0;

  let countOtimos = 0;
  let countBons = 0;
  let countRegulares = 0;
  let countRuins = 0;

  const membrosStats = membrosDoMes.map(membro => {
    const regs = mData.frequencias[membro.id] || {};
    const pts = calcularPontosPessoa(regs);
    const classif = classificarMembro(pts.totalPontos, totalProgramacoes);

    totalPresencasMes += pts.p;
    totalFaltasJustMes += pts.fj;
    totalFaltasMes += pts.f;

    if (totalProgramacoes > 0) {
      if (classif.classKey === 'otimo') countOtimos++;
      else if (classif.classKey === 'bom') countBons++;
      else if (classif.classKey === 'regular') countRegulares++;
      else if (classif.classKey === 'ruim') countRuins++;
    }

    return {
      membro,
      regs,
      ...pts,
      classif
    };
  });

  const qtdFrequentes = countOtimos + countBons;
  const pctFrequentes = totalMembros > 0 ? Math.round((qtdFrequentes / totalMembros) * 100) : 0;
  const mediaFrequencia = totalProgramacoes > 0 ? (totalPresencasMes / totalProgramacoes).toFixed(1) : '0';

  // Cards de Métricas
  const apriscoClassif = classificarAprisco(qtdFrequentes, totalMembros, totalProgramacoes);
  const cardAprisco = document.getElementById('cardClassificacaoAprisco');
  cardAprisco.className = `bg-gradient-to-br ${apriscoClassif.colorClass} text-white rounded-2xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden`;
  document.getElementById('statApriscoClassificacao').textContent = apriscoClassif.status;
  document.getElementById('statApriscoClassificacaoDesc').textContent = apriscoClassif.desc;
  document.getElementById('statApriscoFrequentesVsMembros').textContent = `${qtdFrequentes} de ${totalMembros} membros ativos`;

  document.getElementById('statQuantidadeFrequentes').textContent = qtdFrequentes;
  document.getElementById('statPorcentagemBadge').textContent = `${pctFrequentes}%`;
  document.getElementById('statProgressBarFrequentes').style.width = `${pctFrequentes}%`;

  document.getElementById('statQuantidadeProgramacoes').textContent = totalProgramacoes;
  document.getElementById('statMediaFrequencia').textContent = mediaFrequencia;
  document.getElementById('statMediaPresencaTexto').textContent = `${mediaFrequencia} pessoas`;
  document.getElementById('statQuantidadeMembros').textContent = totalMembros;

  document.getElementById('statCountOtimos').textContent = countOtimos;
  document.getElementById('statCountBons').textContent = countBons;
  document.getElementById('statCountRegulares').textContent = countRegulares;
  document.getElementById('statCountRuins').textContent = countRuins;
  document.getElementById('statTotaisPresencaFalta').textContent = `P: ${totalPresencasMes} | FJ: ${totalFaltasJustMes} | F: ${totalFaltasMes}`;

  // Ordenação
  const membrosOrdenados = ordenarMembrosStats(membrosStats, appData.ordemFrequencia);

  renderTabelaMensal(programacoes, membrosOrdenados, mIndex);
}

/**
 * Monta o HTML da tabela para o mês corrente
 */
function renderTabelaMensal(programacoes, membrosStats, mIndex) {
  const headerRow = document.getElementById('tabelaHeaderRow');
  const tbody = document.getElementById('tabelaBody');
  const emptyNotice = document.getElementById('emptyMembrosNotice');

  if (membrosStats.length === 0) {
    emptyNotice.classList.remove('hidden');
    headerRow.innerHTML = '';
    tbody.innerHTML = '';
    return;
  }
  emptyNotice.classList.add('hidden');

  let sortIconNome = 'fa-sort text-slate-400';
  if (appData.ordemFrequencia === 'nome_az') sortIconNome = 'fa-arrow-down-a-z text-indigo-600';
  else if (appData.ordemFrequencia === 'nome_za') sortIconNome = 'fa-arrow-up-a-z text-indigo-600';

  let sortIconPontos = 'fa-sort text-indigo-400 text-[10px]';
  if (appData.ordemFrequencia === 'pontos_desc') sortIconPontos = 'fa-arrow-down-9-1 text-indigo-700';
  else if (appData.ordemFrequencia === 'pontos_asc') sortIconPontos = 'fa-arrow-up-1-9 text-indigo-700';

  let headerHtml = `
    <th class="py-3.5 px-4 sticky left-0 bg-slate-100 z-10 w-52 min-w-[200px] cursor-pointer hover:bg-slate-200/80 transition" onclick="alternarOrdemNomeFrequencia()" title="Clique para alternar ordem alfabética (A-Z / Z-A)">
      <div class="flex items-center justify-between">
        <span>Membro</span>
        <i class="fa-solid ${sortIconNome}"></i>
      </div>
    </th>
  `;

  programacoes.forEach(prog => {
    const partes = prog.data.split('-');
    const dataFormatada = partes.length === 3 ? `${partes[2]}/${partes[1]}` : prog.data;

    headerHtml += `
      <th class="py-3 px-2 text-center min-w-[85px] border-l border-slate-200 group relative">
        <div class="font-bold text-slate-800 text-xs">${dataFormatada}</div>
        <div class="text-[10px] text-slate-400 font-normal truncate max-w-[85px]" title="${prog.descricao || 'Encontro'}">
          ${prog.descricao || 'Encontro'}
        </div>
        <div class="mt-1 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button onclick="marcarTodosPresentesData('${prog.id}')" title="Marcar todos como Presente nesta data" class="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-1.5 py-0.5 rounded">
            <i class="fa-solid fa-check"></i>
          </button>
          <button onclick="removerProgramacao('${prog.id}')" title="Excluir esta data" class="text-[10px] bg-rose-100 text-rose-700 hover:bg-rose-200 px-1.5 py-0.5 rounded">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </th>
    `;
  });

  headerHtml += `
    <th class="py-3.5 px-3 text-center border-l-2 border-slate-300 bg-slate-200/50 text-slate-800 min-w-[45px]" title="Presenças (1 pt cada)">P</th>
    <th class="py-3.5 px-3 text-center border-l border-slate-200 bg-slate-200/50 text-slate-800 min-w-[45px]" title="Faltas Justificadas (0.5 pt cada)">FJ</th>
    <th class="py-3.5 px-3 text-center border-l border-slate-200 bg-slate-200/50 text-slate-800 min-w-[45px]" title="Faltas (0 pt)">F</th>
    <th class="py-3.5 px-3 text-center border-l border-slate-200 bg-slate-200/50 text-slate-800 min-w-[55px]" title="Total de Presenças (P)">Tot. P</th>
    <th class="py-3.5 px-3 text-center border-l border-slate-200 bg-indigo-50/70 text-indigo-900 font-extrabold min-w-[75px] cursor-pointer hover:bg-indigo-100 transition" onclick="alternarOrdemPontosFrequencia()" title="Clique para ordenar por maior ou menor pontuação">
      <div class="flex items-center justify-center gap-1">
        <span>Pontos</span>
        <i class="fa-solid ${sortIconPontos}"></i>
      </div>
    </th>
    <th class="py-3.5 px-4 text-center border-l border-slate-200 bg-slate-100 text-slate-800 min-w-[100px]">Classificação</th>
  `;

  headerRow.innerHTML = headerHtml;

  let bodyHtml = '';

  membrosStats.forEach(({ membro, regs, p, fj, f, totalPontos, classif }) => {
    const isDesligado = membro.ativo === false;

    bodyHtml += `
      <tr class="hover:bg-slate-50/80 transition ${isDesligado ? 'bg-amber-50/20' : ''}">
        <td class="py-3 px-4 font-semibold text-slate-800 sticky left-0 bg-white hover:bg-slate-50 transition border-r border-slate-100 shadow-sm">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full ${isDesligado ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-700'} font-bold text-xs flex items-center justify-center shrink-0">
              ${membro.nome.charAt(0).toUpperCase()}
            </div>
            <div class="truncate max-w-[150px]">
              <span class="text-sm block">${membro.nome}</span>
              <div class="flex items-center gap-1 text-[10px]">
                ${membro.funcao ? `<span class="text-slate-400">${membro.funcao}</span>` : ''}
                ${isDesligado ? `<span class="text-amber-600 font-medium bg-amber-50 px-1 rounded">(Desligado)</span>` : ''}
              </div>
            </div>
          </div>
        </td>
    `;

    programacoes.forEach(prog => {
      const status = regs[prog.id] || '';
      let badgeClass = 'badge-empty';
      let statusText = '—';

      if (status === 'P') {
        badgeClass = 'badge-p';
        statusText = 'P';
      } else if (status === 'FJ') {
        badgeClass = 'badge-fj';
        statusText = 'FJ';
      } else if (status === 'F') {
        badgeClass = 'badge-f';
        statusText = 'F';
      }

      bodyHtml += `
        <td class="py-2.5 px-2 text-center border-l border-slate-100">
          <div 
            class="attendance-cell inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs ${badgeClass}"
            onclick="toggleStatusPresenca('${membro.id}', '${prog.id}')"
            title="Clique para alternar: P -> FJ -> F -> Vazio">
            ${statusText}
          </div>
        </td>
      `;
    });

    const badgeRankClass = `rank-${classif.classKey}`;

    bodyHtml += `
        <td class="py-2.5 px-3 text-center border-l-2 border-slate-300 font-bold text-emerald-700 bg-emerald-50/30">${p}</td>
        <td class="py-2.5 px-3 text-center border-l border-slate-100 font-bold text-amber-700 bg-amber-50/30">${fj}</td>
        <td class="py-2.5 px-3 text-center border-l border-slate-100 font-bold text-rose-700 bg-rose-50/30">${f}</td>
        <td class="py-2.5 px-3 text-center border-l border-slate-100 font-bold text-slate-800">${p}</td>
        <td class="py-2.5 px-3 text-center border-l border-slate-100 font-extrabold text-indigo-700 bg-indigo-50/50 text-sm">${totalPontos.toFixed(1)}</td>
        <td class="py-2.5 px-4 text-center border-l border-slate-100">
          <span class="inline-block px-2.5 py-1 rounded-full text-xs font-bold ${badgeRankClass}">
            ${classif.label}
          </span>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = bodyHtml;
}

function toggleStatusPresenca(membroId, progId) {
  const mData = getMonthData(currentMonthIndex);
  if (!mData.frequencias[membroId]) {
    mData.frequencias[membroId] = {};
  }

  const atual = mData.frequencias[membroId][progId] || '';
  let novo = '';

  if (atual === '') novo = 'P';
  else if (atual === 'P') novo = 'FJ';
  else if (atual === 'FJ') novo = 'F';
  else if (atual === 'F') novo = '';

  mData.frequencias[membroId][progId] = novo;
  saveState();
  renderApp();
}

function marcarTodosPresentesData(progId) {
  const mData = getMonthData(currentMonthIndex);
  // Marcar apenas membros participantes deste mês
  const membrosDoMes = appData.membros.filter(m => isMembroAtivoNoMes(m, appData.anoAtual, currentMonthIndex));
  membrosDoMes.forEach(m => {
    if (!mData.frequencias[m.id]) mData.frequencias[m.id] = {};
    mData.frequencias[m.id][progId] = 'P';
  });
  saveState();
  renderApp();
  showToast('Todos os membros ativos marcados como Presentes!');
}

function removerProgramacao(progId) {
  if (!confirm('Deseja realmente remover esta programação e as frequências marcadas nela?')) return;
  const mData = getMonthData(currentMonthIndex);
  mData.programacoes = mData.programacoes.filter(p => p.id !== progId);

  Object.keys(mData.frequencias).forEach(mId => {
    delete mData.frequencias[mId][progId];
  });

  saveState();
  renderApp();
  showToast('Programação removida com sucesso!');
}

// ====================================================================
// VISÃO GERAL (CONSOLIDADO DO ANO)
// ====================================================================

function renderGeralView() {
  const yearData = getCurrentYearData();

  // Membros que participaram em algum momento deste ano
  const membrosParticipantesAno = appData.membros.filter(m => isMembroPresenteNoAno(m, appData.anoAtual));
  const totalMembrosAtivos = appData.membros.filter(m => m.ativo !== false).length;

  document.getElementById('currentPeriodTitle').innerHTML = `
    <span>Visão Geral Consolidada &bull; ${appData.anoAtual}</span>
    <span class="text-xs bg-purple-100 text-purple-700 font-semibold px-2.5 py-1 rounded-full">Anual Completo</span>
  `;
  document.getElementById('currentPeriodSubtitle').textContent = 'Soma acumulada de todos os meses, pontuação total e classificação do Aprisco';
  document.getElementById('monthActionButtons').classList.add('hidden');

  let totalProgramacoesAno = 0;
  let totalPresencasAno = 0;
  let totalFaltasJustAno = 0;
  let totalFaltasAno = 0;

  const membroTotais = {};
  membrosParticipantesAno.forEach(m => {
    membroTotais[m.id] = { p: 0, fj: 0, f: 0, totalPontos: 0 };
  });

  for (let m = 0; m < 12; m++) {
    const mData = yearData.meses[String(m)];
    if (mData && mData.programacoes) {
      const qProgMes = mData.programacoes.length;
      totalProgramacoesAno += qProgMes;

      membrosParticipantesAno.forEach(mem => {
        // Apenas computa se o membro esteve ativo no mês m
        if (isMembroAtivoNoMes(mem, appData.anoAtual, m)) {
          const regs = mData.frequencias ? (mData.frequencias[mem.id] || {}) : {};
          const pts = calcularPontosPessoa(regs);
          membroTotais[mem.id].p += pts.p;
          membroTotais[mem.id].fj += pts.fj;
          membroTotais[mem.id].f += pts.f;
          membroTotais[mem.id].totalPontos += pts.totalPontos;

          totalPresencasAno += pts.p;
          totalFaltasJustAno += pts.fj;
          totalFaltasAno += pts.f;
        }
      });
    }
  }

  let countOtimosGeral = 0;
  let countBonsGeral = 0;
  let countRegularesGeral = 0;
  let countRuinsGeral = 0;

  const membrosGeralStats = membrosParticipantesAno.map(membro => {
    const dados = membroTotais[membro.id];
    const classif = classificarMembro(dados.totalPontos, totalProgramacoesAno);

    if (totalProgramacoesAno > 0) {
      if (classif.classKey === 'otimo') countOtimosGeral++;
      else if (classif.classKey === 'bom') countBonsGeral++;
      else if (classif.classKey === 'regular') countRegularesGeral++;
      else if (classif.classKey === 'ruim') countRuinsGeral++;
    }

    return {
      membro,
      ...dados,
      classif
    };
  });

  const qtdFrequentesGeral = countOtimosGeral + countBonsGeral;
  const baseMembros = totalMembrosAtivos > 0 ? totalMembrosAtivos : membrosParticipantesAno.length;
  const pctFrequentesGeral = baseMembros > 0 ? Math.round((qtdFrequentesGeral / baseMembros) * 100) : 0;
  const mediaFrequenciaGeral = totalProgramacoesAno > 0 ? (totalPresencasAno / totalProgramacoesAno).toFixed(1) : '0';

  const apriscoClassif = classificarAprisco(qtdFrequentesGeral, baseMembros, totalProgramacoesAno);
  const cardAprisco = document.getElementById('cardClassificacaoAprisco');
  cardAprisco.className = `bg-gradient-to-br ${apriscoClassif.colorClass} text-white rounded-2xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden`;
  document.getElementById('statApriscoClassificacao').textContent = apriscoClassif.status;
  document.getElementById('statApriscoClassificacaoDesc').textContent = apriscoClassif.desc;
  document.getElementById('statApriscoFrequentesVsMembros').textContent = `${qtdFrequentesGeral} frequentes (${totalMembrosAtivos} ativos)`;

  document.getElementById('statQuantidadeFrequentes').textContent = qtdFrequentesGeral;
  document.getElementById('statPorcentagemBadge').textContent = `${pctFrequentesGeral}%`;
  document.getElementById('statProgressBarFrequentes').style.width = `${pctFrequentesGeral}%`;

  document.getElementById('statQuantidadeProgramacoes').textContent = totalProgramacoesAno;
  document.getElementById('statMediaFrequencia').textContent = mediaFrequenciaGeral;
  document.getElementById('statMediaPresencaTexto').textContent = `${mediaFrequenciaGeral} pessoas`;
  document.getElementById('statQuantidadeMembros').textContent = totalMembrosAtivos;

  document.getElementById('statCountOtimos').textContent = countOtimosGeral;
  document.getElementById('statCountBons').textContent = countBonsGeral;
  document.getElementById('statCountRegulares').textContent = countRegularesGeral;
  document.getElementById('statCountRuins').textContent = countRuinsGeral;
  document.getElementById('statTotaisPresencaFalta').textContent = `P: ${totalPresencasAno} | FJ: ${totalFaltasJustAno} | F: ${totalFaltasAno}`;

  const membrosGeralOrdenados = ordenarMembrosStats(membrosGeralStats, appData.ordemFrequencia);

  renderTabelaGeral(membrosGeralOrdenados, totalProgramacoesAno);
}

/**
 * Monta o HTML da tabela Geral Consolidada
 */
function renderTabelaGeral(membrosGeralStats, totalProgramacoesAno) {
  const headerRow = document.getElementById('tabelaHeaderRow');
  const tbody = document.getElementById('tabelaBody');
  const emptyNotice = document.getElementById('emptyMembrosNotice');

  if (membrosGeralStats.length === 0) {
    emptyNotice.classList.remove('hidden');
    headerRow.innerHTML = '';
    tbody.innerHTML = '';
    return;
  }
  emptyNotice.classList.add('hidden');

  let sortIconNome = 'fa-sort text-slate-400';
  if (appData.ordemFrequencia === 'nome_az') sortIconNome = 'fa-arrow-down-a-z text-indigo-600';
  else if (appData.ordemFrequencia === 'nome_za') sortIconNome = 'fa-arrow-up-a-z text-indigo-600';

  let sortIconPontos = 'fa-sort text-indigo-400 text-[10px]';
  if (appData.ordemFrequencia === 'pontos_desc') sortIconPontos = 'fa-arrow-down-9-1 text-indigo-700';
  else if (appData.ordemFrequencia === 'pontos_asc') sortIconPontos = 'fa-arrow-up-1-9 text-indigo-700';

  headerRow.innerHTML = `
    <th class="py-3.5 px-4 sticky left-0 bg-slate-100 z-10 w-52 min-w-[200px] cursor-pointer hover:bg-slate-200/80 transition" onclick="alternarOrdemNomeFrequencia()" title="Clique para alternar ordem alfabética (A-Z / Z-A)">
      <div class="flex items-center justify-between">
        <span>Membro</span>
        <i class="fa-solid ${sortIconNome}"></i>
      </div>
    </th>
    <th class="py-3.5 px-3 text-center border-l border-slate-200">Presenças (P)</th>
    <th class="py-3.5 px-3 text-center border-l border-slate-200">Justificadas (FJ)</th>
    <th class="py-3.5 px-3 text-center border-l border-slate-200">Faltas (F)</th>
    <th class="py-3.5 px-3 text-center border-l border-slate-200 bg-indigo-50/70 text-indigo-900 font-extrabold cursor-pointer hover:bg-indigo-100 transition" onclick="alternarOrdemPontosFrequencia()" title="Clique para ordenar por maior ou menor pontuação">
      <div class="flex items-center justify-center gap-1">
        <span>Pontos Totais</span>
        <i class="fa-solid ${sortIconPontos}"></i>
      </div>
    </th>
    <th class="py-3.5 px-4 text-center border-l border-slate-200">% Aproveitamento</th>
    <th class="py-3.5 px-4 text-center border-l border-slate-200 bg-slate-100">Classificação Geral</th>
  `;

  let bodyHtml = '';

  membrosGeralStats.forEach(({ membro, p, fj, f, totalPontos, classif }) => {
    const aproveitamento = totalProgramacoesAno > 0 ? Math.round((totalPontos / totalProgramacoesAno) * 100) : 0;
    const badgeRankClass = `rank-${classif.classKey}`;
    const isDesligado = membro.ativo === false;

    bodyHtml += `
      <tr class="hover:bg-slate-50/80 transition ${isDesligado ? 'bg-amber-50/20' : ''}">
        <td class="py-3 px-4 font-semibold text-slate-800 sticky left-0 bg-white hover:bg-slate-50 transition border-r border-slate-100 shadow-sm">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full ${isDesligado ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-700'} font-bold text-xs flex items-center justify-center shrink-0">
              ${membro.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <span class="text-sm block">${membro.nome}</span>
              <div class="flex items-center gap-1 text-[10px]">
                ${membro.funcao ? `<span class="text-slate-400">${membro.funcao}</span>` : ''}
                ${isDesligado ? `<span class="text-amber-700 font-medium bg-amber-50 px-1 rounded">(Desligado em ${MESES[membro.mesSaida]}/${membro.anoSaida})</span>` : ''}
              </div>
            </div>
          </div>
        </td>
        <td class="py-3 px-3 text-center border-l border-slate-100 font-bold text-emerald-700 bg-emerald-50/20">${p}</td>
        <td class="py-3 px-3 text-center border-l border-slate-100 font-bold text-amber-700 bg-amber-50/20">${fj}</td>
        <td class="py-3 px-3 text-center border-l border-slate-100 font-bold text-rose-700 bg-rose-50/20">${f}</td>
        <td class="py-3 px-3 text-center border-l border-slate-100 font-extrabold text-indigo-700 bg-indigo-50/50 text-base">${totalPontos.toFixed(1)}</td>
        <td class="py-3 px-4 text-center border-l border-slate-100">
          <div class="flex items-center justify-center gap-2">
            <div class="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div class="bg-indigo-600 h-1.5 rounded-full" style="width: ${Math.min(aproveitamento, 100)}%"></div>
            </div>
            <span class="text-xs font-semibold text-slate-600">${aproveitamento}%</span>
          </div>
        </td>
        <td class="py-3 px-4 text-center border-l border-slate-100">
          <span class="inline-block px-3 py-1 rounded-full text-xs font-bold ${badgeRankClass}">
            ${classif.label}
          </span>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = bodyHtml;
}

// ====================================================================
// GERENCIAMENTO DE MEMBROS
// ====================================================================

function setFiltroStatusMembro(status) {
  filtroStatusMembro = status;

  // Atualizar botões de filtro
  const btnTodos = document.getElementById('filterMembrosTodos');
  const btnAtivos = document.getElementById('filterMembrosAtivos');
  const btnInativos = document.getElementById('filterMembrosInativos');

  [btnTodos, btnAtivos, btnInativos].forEach(b => {
    b.className = 'px-3 py-1.5 rounded-lg transition text-slate-600 hover:text-slate-900';
  });

  if (status === 'todos') {
    btnTodos.className = 'px-3 py-1.5 rounded-lg transition bg-white text-indigo-700 shadow-sm';
  } else if (status === 'ativos') {
    btnAtivos.className = 'px-3 py-1.5 rounded-lg transition bg-white text-emerald-700 shadow-sm';
  } else if (status === 'inativos') {
    btnInativos.className = 'px-3 py-1.5 rounded-lg transition bg-white text-amber-800 shadow-sm';
  }

  renderMembrosView();
}

function renderMembrosView() {
  const tbody = document.getElementById('tabelaMembrosBody');
  const emptyNotice = document.getElementById('membrosListEmpty');
  const query = (document.getElementById('inputBuscarMembro').value || '').toLowerCase().trim();

  // Contagens para os botões de filtro
  const totalMembros = appData.membros.length;
  const totalAtivos = appData.membros.filter(m => m.ativo !== false).length;
  const totalInativos = totalMembros - totalAtivos;

  document.getElementById('countMembrosTodos').textContent = totalMembros;
  document.getElementById('countMembrosAtivos').textContent = totalAtivos;
  document.getElementById('countMembrosInativos').textContent = totalInativos;

  // Atualizar ícones de ordenação na tabela
  const iconNome = document.getElementById('sortIconNome');
  if (iconNome) {
    if (appData.ordemMembros === 'nome_az') iconNome.className = 'fa-solid fa-arrow-down-a-z text-indigo-600 text-xs';
    else if (appData.ordemMembros === 'nome_za') iconNome.className = 'fa-solid fa-arrow-up-a-z text-indigo-600 text-xs';
    else iconNome.className = 'fa-solid fa-sort text-slate-400 text-xs';
  }

  const iconCriacao = document.getElementById('sortIconCriacao');
  if (iconCriacao) {
    if (appData.ordemMembros === 'criacao_antigos') iconCriacao.className = 'fa-solid fa-arrow-up-1-9 text-indigo-600 text-[10px]';
    else if (appData.ordemMembros === 'criacao_recentes') iconCriacao.className = 'fa-solid fa-arrow-down-9-1 text-indigo-600 text-[10px]';
    else iconCriacao.className = 'fa-solid fa-sort text-slate-400 text-[10px]';
  }

  // Filtrar por busca e por status
  let lista = appData.membros.filter(m => {
    const matchBusca = m.nome.toLowerCase().includes(query) ||
      (m.telefone && m.telefone.includes(query)) ||
      (m.funcao && m.funcao.toLowerCase().includes(query));

    if (!matchBusca) return false;

    if (filtroStatusMembro === 'ativos') return m.ativo !== false;
    if (filtroStatusMembro === 'inativos') return m.ativo === false;
    return true; // 'todos'
  });

  if (lista.length === 0) {
    emptyNotice.classList.remove('hidden');
    tbody.innerHTML = '';
    return;
  }
  emptyNotice.classList.add('hidden');

  const membrosOrdenados = ordenarListaMembros(lista, appData.ordemMembros);

  let html = '';
  membrosOrdenados.forEach((membro, index) => {
    let nascFormatada = '—';
    if (membro.nascimento) {
      const parts = membro.nascimento.split('-');
      if (parts.length === 3) nascFormatada = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    const isAtivo = membro.ativo !== false;

    html += `
      <tr class="hover:bg-slate-50 transition ${!isAtivo ? 'bg-amber-50/30' : ''}">
        <td class="py-3.5 px-4 text-slate-400 font-medium text-xs">${index + 1}</td>
        <td class="py-3.5 px-4 font-semibold text-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full ${isAtivo ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-amber-100 border-amber-300 text-amber-800'} border font-bold text-xs flex items-center justify-center">
              ${membro.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <span>${membro.nome}</span>
              ${!isAtivo ? `<span class="block text-[11px] text-amber-700 font-medium">Saída: ${MESES[membro.mesSaida]} de ${membro.anoSaida}</span>` : ''}
            </div>
          </div>
        </td>
        <td class="py-3.5 px-4 text-slate-600">${membro.telefone || '—'}</td>
        <td class="py-3.5 px-4 text-slate-600">${nascFormatada}</td>
        <td class="py-3.5 px-4">
          <span class="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-medium">
            ${membro.funcao || 'Membro'}
          </span>
          ${membro.obs ? `<span class="text-xs text-slate-400 block mt-0.5 truncate max-w-[200px]" title="${membro.obs}">${membro.obs}</span>` : ''}
        </td>
        <td class="py-3.5 px-4 text-center">
          ${isAtivo ? `
            <span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ativo
            </span>
          ` : `
            <span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800" title="Histórico preservado até ${MESES[membro.mesSaida]}">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Desligado
            </span>
          `}
        </td>
        <td class="py-3.5 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            ${!isAtivo ? `
              <button onclick="reativarMembro('${membro.id}')" title="Reativar membro no Aprisco" class="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1">
                <i class="fa-solid fa-rotate-left"></i>
                <span class="hidden sm:inline">Reativar</span>
              </button>
            ` : ''}
            <button onclick="editarMembro('${membro.id}')" title="Editar informações do membro" class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
              <i class="fa-solid fa-user-pen"></i>
            </button>
            <button onclick="abrirModalDesligar('${membro.id}')" title="${isAtivo ? 'Desligar / Remover membro' : 'Gerenciar exclusão'}" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition">
              <i class="fa-solid fa-user-xmark"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function abrirModalNovoMembro() {
  document.getElementById('formMembro').reset();
  document.getElementById('inputMembroId').value = '';
  document.getElementById('modalMembroTitle').innerHTML = '<i class="fa-solid fa-user-plus"></i> Novo Membro';
  openModal('modalMembro');
}

function editarMembro(id) {
  const membro = appData.membros.find(m => m.id === id);
  if (!membro) return;

  document.getElementById('inputMembroId').value = membro.id;
  document.getElementById('inputNomeMembro').value = membro.nome || '';
  document.getElementById('inputTelefoneMembro').value = membro.telefone || '';
  document.getElementById('inputNascMembro').value = membro.nascimento || '';
  document.getElementById('inputFuncaoMembro').value = membro.funcao || '';
  document.getElementById('inputObsMembro').value = membro.obs || '';

  document.getElementById('modalMembroTitle').innerHTML = '<i class="fa-solid fa-user-pen"></i> Editar Membro';
  openModal('modalMembro');
}

// Abrir Modal de Desligamento com Preservação de Histórico
function abrirModalDesligar(id) {
  const membro = appData.membros.find(m => m.id === id);
  if (!membro) return;

  document.getElementById('inputDesligarMembroId').value = membro.id;
  document.getElementById('desligarMembroNome').textContent = membro.nome;

  // Sugerir o mês que está sendo visualizado atualmente (ou o mês de saída já registrado)
  let mesSugerido = typeof currentMonthIndex === 'number' ? currentMonthIndex : (membro.mesSaida !== undefined ? membro.mesSaida : 0);
  let anoSugerido = membro.anoSaida || appData.anoAtual;

  document.getElementById('selectDesligarMes').value = String(mesSugerido);
  document.getElementById('selectDesligarAno').value = String(anoSugerido);

  openModal('modalDesligarMembro');
}

// Confirmar Desligamento (Mantém Histórico!)
function confirmarDesligamentoMembro() {
  const id = document.getElementById('inputDesligarMembroId').value;
  const membro = appData.membros.find(m => m.id === id);
  if (!membro) return;

  const mesSaida = parseInt(document.getElementById('selectDesligarMes').value, 10);
  const anoSaida = document.getElementById('selectDesligarAno').value;

  membro.ativo = false;
  membro.mesSaida = mesSaida;
  membro.anoSaida = anoSaida;

  saveState();
  closeModal('modalDesligarMembro');
  renderApp();
  showToast(`"${membro.nome}" desligado! Histórico de frequência preservado até ${MESES[mesSaida]}.`);
}

// Reativar Membro (volta a frequentar normalmente)
function reativarMembro(id) {
  const membro = appData.membros.find(m => m.id === id);
  if (!membro) return;

  membro.ativo = true;
  delete membro.mesSaida;
  delete membro.anoSaida;

  saveState();
  renderApp();
  showToast(`"${membro.nome}" reativado! Ele volta a aparecer em todos os meses.`);
}

// Excluir Definitivamente (Apaga todo histórico e frequências)
function confirmarExclusaoDefinitivaMembro() {
  const id = document.getElementById('inputDesligarMembroId').value;
  const membro = appData.membros.find(m => m.id === id);
  if (!membro) return;

  if (confirm(`Atenção: Excluir definitivamente removerá "${membro.nome}" e apagará TODAS as presenças e pontos que ele já teve em todos os meses. Tem certeza?`)) {
    appData.membros = appData.membros.filter(m => m.id !== id);

    // Limpar frequências órfãs
    Object.values(appData.anos).forEach(anoObj => {
      if (anoObj.meses) {
        Object.values(anoObj.meses).forEach(mesObj => {
          if (mesObj.frequencias && mesObj.frequencias[id]) {
            delete mesObj.frequencias[id];
          }
        });
      }
    });

    saveState();
    closeModal('modalDesligarMembro');
    renderApp();
    showToast('Membro e registros excluídos definitivamente.');
  }
}

// Salvar Membro (Form Submit)
document.getElementById('formMembro').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('inputMembroId').value;
  const nome = document.getElementById('inputNomeMembro').value.trim();
  const telefone = document.getElementById('inputTelefoneMembro').value.trim();
  const nascimento = document.getElementById('inputNascMembro').value;
  const funcao = document.getElementById('inputFuncaoMembro').value.trim();
  const obs = document.getElementById('inputObsMembro').value.trim();

  if (!nome) return;

  if (id) {
    const index = appData.membros.findIndex(m => m.id === id);
    if (index !== -1) {
      appData.membros[index] = {
        ...appData.membros[index],
        nome,
        telefone,
        nascimento,
        funcao,
        obs
      };
      showToast('Dados do membro atualizados!');
    }
  } else {
    const novoId = 'm_' + Date.now();
    appData.membros.push({
      id: novoId,
      nome,
      telefone,
      nascimento,
      funcao,
      obs,
      ativo: true,
      createdAt: Date.now()
    });
    showToast('Novo membro adicionado com sucesso!');
  }

  saveState();
  closeModal('modalMembro');
  renderApp();
});

// ====================================================================
// PROGRAMAÇÕES / DATAS
// ====================================================================

function abrirModalNovaData() {
  if (currentMonthIndex === 'geral') {
    showToast('Selecione um mês específico para adicionar uma data.', 'aviso');
    return;
  }
  document.getElementById('formData').reset();

  const ano = appData.anoAtual;
  const mesFormatado = String(currentMonthIndex + 1).padStart(2, '0');
  document.getElementById('inputNovaData').value = `${ano}-${mesFormatado}-01`;

  openModal('modalData');
}

document.getElementById('formData').addEventListener('submit', (e) => {
  e.preventDefault();
  if (currentMonthIndex === 'geral') return;

  const dataVal = document.getElementById('inputNovaData').value;
  const descVal = document.getElementById('inputDescricaoData').value.trim();
  if (!dataVal) return;

  const mData = getMonthData(currentMonthIndex);
  const progId = `p_${appData.anoAtual}_${currentMonthIndex}_${Date.now()}`;

  mData.programacoes.push({
    id: progId,
    data: dataVal,
    descricao: descVal || 'Encontro'
  });

  mData.programacoes.sort((a, b) => a.data.localeCompare(b.data));

  saveState();
  closeModal('modalData');
  renderApp();
  showToast('Nova programação adicionada!');
});

document.getElementById('btnFastFillPresent').addEventListener('click', () => {
  if (currentMonthIndex === 'geral') return;
  const mData = getMonthData(currentMonthIndex);
  if (mData.programacoes.length === 0) {
    showToast('Adicione pelo menos uma data antes de marcar frequências.', 'aviso');
    return;
  }

  const membrosDoMes = appData.membros.filter(m => isMembroAtivoNoMes(m, appData.anoAtual, currentMonthIndex));

  if (confirm(`Deseja marcar TODOS os ${membrosDoMes.length} membros ativos como PRESENTES em TODAS as datas deste mês?`)) {
    mData.programacoes.forEach(prog => {
      membrosDoMes.forEach(m => {
        if (!mData.frequencias[m.id]) mData.frequencias[m.id] = {};
        mData.frequencias[m.id][prog.id] = 'P';
      });
    });
    saveState();
    renderApp();
    showToast('Frequências preenchidas como Presente!');
  }
});

// ====================================================================
// NAVEGAÇÃO E CONTROLES DE INTERFACE
// ====================================================================

function switchMainTab(tabName) {
  currentMainTab = tabName;

  document.querySelectorAll('.tab-main-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('sectionFrequencia').classList.add('hidden');
  document.getElementById('sectionMembros').classList.add('hidden');
  document.getElementById('sectionRegras').classList.add('hidden');

  if (tabName === 'frequencia') {
    document.getElementById('tabNavFrequencia').classList.add('active');
    document.getElementById('sectionFrequencia').classList.remove('hidden');
  } else if (tabName === 'membros') {
    document.getElementById('tabNavMembros').classList.add('active');
    document.getElementById('sectionMembros').classList.remove('hidden');
  } else if (tabName === 'regras') {
    document.getElementById('tabNavRegras').classList.add('active');
    document.getElementById('sectionRegras').classList.remove('hidden');
  }

  renderApp();
}

// Clique nas pílulas de meses
document.querySelectorAll('.month-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.month;
    if (target === 'geral') {
      currentMonthIndex = 'geral';
    } else {
      currentMonthIndex = parseInt(target, 10);
    }
    renderApp();
  });
});

// Seletor de Ano
document.getElementById('anoSelect').addEventListener('change', (e) => {
  appData.anoAtual = e.target.value;
  saveState();
  renderApp();
  showToast(`Exibindo dados do ano de ${appData.anoAtual}`);
});

// Seletor de Ordenação da Tabela de Frequência
const selOrdemFreq = document.getElementById('selectOrdemFrequencia');
if (selOrdemFreq) {
  selOrdemFreq.addEventListener('change', (e) => {
    appData.ordemFrequencia = e.target.value;
    saveState();
    renderApp();
  });
}

// Seletor de Ordenação da Aba de Membros
const selOrdemMembros = document.getElementById('selectOrdemMembros');
if (selOrdemMembros) {
  selOrdemMembros.addEventListener('change', (e) => {
    appData.ordemMembros = e.target.value;
    saveState();
    renderApp();
  });
}

// Renomear Aprisco
document.getElementById('btnEditApriscoName').addEventListener('click', () => {
  document.getElementById('inputNomeAprisco').value = appData.nomeAprisco || 'Meu Aprisco';
  openModal('modalNomeAprisco');
});

document.getElementById('formNomeAprisco').addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = document.getElementById('inputNomeAprisco').value.trim();
  if (nome) {
    appData.nomeAprisco = nome;
    saveState();
    closeModal('modalNomeAprisco');
    renderApp();
    showToast('Nome do Aprisco atualizado!');
  }
});

// Busca de Membros
document.getElementById('inputBuscarMembro').addEventListener('input', () => {
  renderMembrosView();
});

// Botões de Ação
document.getElementById('btnOpenModalNovoMembro').addEventListener('click', abrirModalNovoMembro);
document.getElementById('btnAddDateModal').addEventListener('click', abrirModalNovaData);

// Impressão
document.getElementById('btnPrintReport').addEventListener('click', () => {
  window.print();
});

// ====================================================================
// BACKUP E RESTAURAÇÃO (JSON)
// ====================================================================

document.getElementById('btnExportData').addEventListener('click', () => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const dataHoje = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `backup_aprisco_${dataHoje}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Backup exportado com sucesso!');
});

document.getElementById('btnImportFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (imported.membros && imported.anos) {
        if (confirm('Importar este backup substituirá os dados atuais. Deseja prosseguir?')) {
          appData = imported;
          saveState();
          renderApp();
          showToast('Backup restaurado com sucesso!');
        }
      } else {
        alert('O arquivo selecionado não é um backup válido do sistema.');
      }
    } catch (err) {
      alert('Erro ao carregar o arquivo JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
});

// ====================================================================
// FUNÇÕES AUXILIARES DE MODAL & NOTIFICAÇÕES (TOAST)
// ====================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

window.addEventListener('click', (e) => {
  ['modalMembro', 'modalData', 'modalNomeAprisco', 'modalDesligarMembro'].forEach(id => {
    const el = document.getElementById(id);
    if (el && e.target === el) {
      closeModal(id);
    }
  });
});

function showToast(mensagem, tipo = 'sucesso') {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMessage');
  const iconEl = document.getElementById('toastIcon');

  msgEl.textContent = mensagem;

  if (tipo === 'aviso') {
    iconEl.className = 'fa-solid fa-triangle-exclamation text-amber-400';
  } else {
    iconEl.className = 'fa-solid fa-circle-check text-emerald-400';
  }

  toast.classList.remove('opacity-0', 'translate-y-20', 'pointer-events-none');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-20', 'pointer-events-none');
  }, 3200);
}

// ====================================================================
// INICIALIZAÇÃO
// ====================================================================

window.addEventListener('DOMContentLoaded', () => {
  aplicarIconeAba();
  loadState();
  renderApp();
});
