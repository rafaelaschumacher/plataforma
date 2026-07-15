(function () {
  const searchInput = document.getElementById("marketSearch");
  const emptyState = document.getElementById("marketEmptyState");
  if (!searchInput) return;

  const chips = Array.from(document.querySelectorAll(".product-chip"));

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    chips.forEach((chip) => {
      const matches = !query || chip.textContent.toLowerCase().includes(query);
      chip.classList.toggle("hidden", !matches);
      if (matches) visibleCount += 1;
    });

    emptyState.hidden = visibleCount > 0;
  });
})();
