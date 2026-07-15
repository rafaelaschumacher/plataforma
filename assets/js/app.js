(function () {
  const grupoTabs = document.getElementById("grupoTabs");
  const alimentoSelect = document.getElementById("alimentoSelect");
  const qtdGramasInput = document.getElementById("qtdGramas");
  const resultSummary = document.getElementById("resultSummary");
  const equivTableBody = document.getElementById("equivTableBody");
  const filtroTabela = document.getElementById("filtroTabela");

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

  function formatNumber(n, decimals) {
    return n.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  }

  function renderTabs() {
    grupoTabs.innerHTML = "";
    GRUPOS.forEach((grupo) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "group-tab" + (grupo.id === state.grupoId ? " active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", grupo.id === state.grupoId ? "true" : "false");
      btn.innerHTML = `<span>${grupo.icone}</span><span>${grupo.nome}</span>`;
      btn.addEventListener("click", () => {
        state.grupoId = grupo.id;
        state.alimentoId = grupo.baseId;
        state.filtro = "";
        filtroTabela.value = "";
        renderTabs();
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

    resultSummary.innerHTML =
      qtdGramas > 0
        ? `Você informou <strong>${formatNumber(qtdGramas, 1)} g</strong> de <strong>${alimento.nome}</strong>, equivalente a aproximadamente <strong>${formatNumber(kcalTotal, 0)} kcal</strong>. Veja abaixo as quantidades de outros alimentos do grupo "${grupo.nome}" com o mesmo valor calórico.`
        : `Informe uma quantidade para calcular as equivalências.`;

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
      equivTableBody.innerHTML = `<tr><td colspan="3" class="empty-state">Informe uma quantidade maior que zero para ver as equivalências.</td></tr>`;
      return;
    }

    if (filtrados.length === 0) {
      equivTableBody.innerHTML = `<tr><td colspan="3" class="empty-state">Nenhum alimento encontrado.</td></tr>`;
      return;
    }

    filtrados
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
      .forEach((alimento) => {
        const equivGramas = (kcalTotal * 100) / alimento.kcal;
        const isUnidade = /unidade/i.test(alimento.medida);

        let equivCell;
        if (isUnidade) {
          const equivMedida = alimento.g > 0 ? equivGramas / alimento.g : 0;
          equivCell = `≈ ${formatNumber(equivMedida, 2)} ${alimento.medida}
            <span class="equiv-grams">(${formatNumber(equivGramas, 0)} g)</span>`;
        } else {
          equivCell = `≈ ${formatNumber(equivGramas, 0)} g`;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="food-name" data-label="Alimento">${alimento.nome}</td>
          <td class="kcal-col" data-label="kcal / 100g">${formatNumber(alimento.kcal, 0)} kcal</td>
          <td class="equiv-col" data-label="Quantidade equivalente">${equivCell}</td>
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
    renderAlimentoSelect();
    const grupo = getGrupo(state.grupoId);
    const alimento = getAlimento(grupo, state.alimentoId);
    qtdGramasInput.value = alimento.g;
    renderResult();
  }

  init();
})();
