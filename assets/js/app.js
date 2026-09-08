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

  /* Nem toda paciente tem balança na hora da refeição, então onde o alimento
     tem uma unidade que dá para contar — fatia, pão, ovo, pote, castanha — a
     resposta vem nela, com a grama do lado. Onde não dá para contar (arroz,
     carne moída, aveia), fica só a grama: colher e xícara variam demais de
     uma casa para outra para servirem de medida.

     A contagem arredonda para meia unidade. Abaixo de meia, a unidade não
     ajuda ("0,3 pão") e só a grama aparece. */
  function formatUnidades(n, un) {
    const inteiro = Math.floor(n);
    const meio = n - inteiro >= 0.5;
    const texto =
      inteiro === 0 ? "½" : meio ? `${inteiro}½` : String(inteiro);
    const plural = n > 1 || (inteiro === 0 && false);
    return `${texto} ${plural ? un.p : un.s}`;
  }

  function quantidadeTexto(alimento, gramas) {
    const peso = `${formatNumber(gramas, 1)} ${unidadeDe(alimento)}`;
    if (!alimento.un) return peso;
    /* Meia castanha não existe: o que é miúdo conta inteiro. */
    const miudo = alimento.un.g < 10;
    const bruto = gramas / alimento.un.g;
    const n = miudo ? Math.round(bruto) : Math.round(bruto * 2) / 2;
    if (n < (miudo ? 1 : 0.5)) return peso;

    /* A contagem só entra quando bate com o peso. "1 unidade · 40 g" de um pão
       de 50 g mandaria a paciente comer um quarto a mais do que a conta diz —
       nesses casos a grama vai sozinha, que é a resposta exata. A folga de 15%
       é bem menor que o erro que o arredondamento de 5 em 5 g já introduz. */
    if (Math.abs(n * alimento.un.g - gramas) / gramas > 0.15) return peso;
    return `${formatUnidades(n, alimento.un)} · ${peso}`;
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
        ? `No seu plano: <strong>${quantidadeTexto(alimento, qtdGramas)}</strong> de <strong>${alimento.nome}</strong>, o que corresponde a aproximadamente <strong>${formatNumber(kcalTotal, 0)} kcal</strong>. Veja abaixo o quanto comer de cada alimento do grupo “${grupo.nome}” para fazer a troca.`
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
          <td class="equiv-col" data-label="Quanto comer">≈ ${quantidadeTexto(alimento, equivGramas)}</td>
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
