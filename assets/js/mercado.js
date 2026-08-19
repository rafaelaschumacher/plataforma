(function () {
  const searchInput = document.getElementById("marketSearch");
  const emptyState = document.getElementById("marketEmptyState");
  if (!searchInput) return;

  const chips = Array.from(document.querySelectorAll(".product-chip"));
  const subgroups = Array.from(document.querySelectorAll(".market-subgroup"));
  const cards = Array.from(document.querySelectorAll(".guide-content .info-card"));
  const sections = Array.from(document.querySelectorAll(".guide-section"));
  const note = document.querySelector(".guide-note");

  function hasVisibleChip(el) {
    return el.querySelector(".product-chip:not(.hidden)") !== null;
  }

  function setHidden(el, hidden) {
    el.classList.toggle("hidden", hidden);
  }

  function reset() {
    chips.forEach((chip) => setHidden(chip, false));
    [].concat(subgroups, cards, sections).forEach((el) => setHidden(el, false));
    if (note) setHidden(note, false);
    emptyState.hidden = true;
  }

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      reset();
      return;
    }

    let visibleCount = 0;
    chips.forEach((chip) => {
      const matches = chip.textContent.toLowerCase().includes(query);
      setHidden(chip, !matches);
      if (matches) visibleCount += 1;
    });

    // Colapsa os blocos que ficaram sem nenhum produto visível.
    subgroups.forEach((el) => setHidden(el, !hasVisibleChip(el)));
    cards.forEach((el) => setHidden(el, !hasVisibleChip(el)));
    sections.forEach((el) => setHidden(el, !hasVisibleChip(el)));
    if (note) setHidden(note, true);

    emptyState.hidden = visibleCount > 0;
  });
})();
