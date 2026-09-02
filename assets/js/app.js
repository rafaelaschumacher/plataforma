(function () {
  /* A lista cobre os alimentos mais usados nos planos, não todos. Quando a
     busca não encontra, o caminho é falar com a nutricionista — senão a
     paciente improvisa a troca sozinha, que é o que a calculadora existe
     para evitar. */
  const WHATSAPP = "https://wa.me/5547984214838";

  const grupoTabs = document.getElementById("grupoTabs");
  const alimentoSelect = document.getElementById("alimentoSelect");
  const qtdGramasInput = document.getElementById("qtdGramas");
  const resultSummary = document.getElementById("resultSummary");
  const equivTableBody = document.getElementById("equivTableBody");
  const filtroTabela = document.getElementById("filtroTabela");
  const qtdSuffix = document.getElementById("qtdSuffix");
  const grupoDescricao = document.getElementById("grupoDescricao");

  let state = {
    grupoId: GRUPOS[0].id,
    alimentoId: GRUPOS[0].baseId,
    filtro: "",
  };

  function getGrupo(id) {
    return GRUPOS.find((g) => g.id === id);
  }

  function getAlimento(grupo, id) {
    return grupo.alimentos.find((a) => a.id === id);
  }

  function unidadeDe(alimento) {
    return alimento.unidade || "g";
  }

  function formatNumber(n, decimals) {
    return n.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  }

  /* A regra da ferramenta é trocar dentro do mesmo grupo. Sem saber o que cabe
     em cada um, a paciente não consegue nem começar — e há casos que não são
     óbvios, como o abacate em Gorduras. */
  function renderDescricao() {
    grupoDescricao.textContent = getGrupo(state.grupoId).descricao;
  }

  function renderTabs() {
    grupoTabs.innerHTML = "";
    GRUPOS.forEach((grupo) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "group-tab" + (grupo.id === state.grupoId ? " active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", grupo.id === state.grupoId ? "true" : "false");
      btn.textContent = grupo.nome;
      btn.addEventListener("click", () => {
        state.grupoId = grupo.id;
        state.alimentoId = grupo.baseId;
        state.filtro = "";
        filtroTabela.value = "";
        renderTabs();
        renderDescricao();
        renderAlimentoSelect();
        const alimento = getAlimento(grupo, state.alimentoId);
        qtdGramasInput.value = alimento.g;
        renderResult();
      });
      grupoTabs.appendChild(btn);
    });
  }

  function renderAlimentoSelect() {
    const grupo = getGrupo(state.grupoId);
    alimentoSelect.innerHTML = "";
    grupo.alimentos.forEach((alimento) => {
      const opt = document.createElement("option");
      opt.value = alimento.id;
      opt.textContent = alimento.nome;
      if (alimento.id === state.alimentoId) opt.selected = true;
      alimentoSelect.appendChild(opt);
    });
  }

  function currentKcalTotal() {
    const grupo = getGrupo(state.grupoId);
    const alimento = getAlimento(grupo, state.alimentoId);
    const qtdGramas = parseFloat(qtdGramasInput.value) || 0;
    return (qtdGramas * alimento.kcal) / 100;
  }

  function renderResult() {
    const grupo = getGrupo(state.grupoId);
    const alimento = getAlimento(grupo, state.alimentoId);
    const qtdGramas = parseFloat(qtdGramasInput.value) || 0;
    const kcalTotal = currentKcalTotal();

    const unidade = unidadeDe(alimento);
    qtdSuffix.textContent = unidade;

    /* Sem quantidade não há resumo a dar: a caixa some e a instrução fica só
       na tabela, onde a resposta apareceria. Antes as duas mostravam a mesma
       frase ao mesmo tempo. */
    resultSummary.hidden = qtdGramas <= 0;
    resultSummary.innerHTML =
      qtdGramas > 0
        ? `No seu plano: <strong>${formatNumber(qtdGramas, 1)} ${unidade}</strong> de <strong>${alimento.nome}</strong>, o que corresponde a aproximadamente <strong>${formatNumber(kcalTotal, 0)} kcal</strong>. Veja abaixo o quanto comer de cada alimento do grupo “${grupo.nome}” para fazer a troca.`
        : "";

    renderTable();
  }

  function renderTable() {
    const grupo = getGrupo(state.grupoId);
    const kcalTotal = currentKcalTotal();
    const filtro = state.filtro.trim().toLowerCase();

    const outros = grupo.alimentos.filter((a) => a.id !== state.alimentoId);
    const filtrados = filtro
      ? outros.filter((a) => a.nome.toLowerCase().includes(filtro))
      : outros;

    equivTableBody.innerHTML = "";

    if (kcalTotal <= 0) {
      equivTableBody.innerHTML = `<tr><td colspan="2" class="empty-state">Informe a quantidade que está no seu plano para ver as opções de troca.</td></tr>`;
      return;
    }

    if (filtrados.length === 0) {
      equivTableBody.innerHTML = `<tr><td colspan="2" class="empty-state">Não encontrei esse alimento na lista. Ela cobre os mais usados nos planos, mas não é completa — <a href="${WHATSAPP}" target="_blank" rel="noopener">me chama no WhatsApp</a> que eu te digo a equivalência certa.</td></tr>`;
      return;
    }

    filtrados
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
      .forEach((alimento) => {
        const equivGramasExato = (kcalTotal * 100) / alimento.kcal;
        const equivGramas = Math.max(5, Math.round(equivGramasExato / 5) * 5);

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="food-name" data-label="Se quiser trocar por">${alimento.nome}</td>
          <td class="equiv-col" data-label="Quanto comer">≈ ${formatNumber(equivGramas, 0)} ${unidadeDe(alimento)}</td>
        `;
        equivTableBody.appendChild(tr);
      });
  }

  alimentoSelect.addEventListener("change", (e) => {
    state.alimentoId = e.target.value;
    const grupo = getGrupo(state.grupoId);
    const alimento = getAlimento(grupo, state.alimentoId);
    qtdGramasInput.value = alimento.g;
    renderResult();
  });

  qtdGramasInput.addEventListener("input", renderResult);

  filtroTabela.addEventListener("input", (e) => {
    state.filtro = e.target.value;
    renderTable();
  });

  function init() {
    renderTabs();
    renderDescricao();
    renderAlimentoSelect();
    const grupo = getGrupo(state.grupoId);
    const alimento = getAlimento(grupo, state.alimentoId);
    qtdGramasInput.value = alimento.g;
    renderResult();
  }

  init();
})();
