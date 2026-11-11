(function () {
  var grid = document.getElementById("grid");
  if (!grid) return;
  var items = Array.prototype.slice.call(grid.children);
  var count = document.getElementById("count");
  var sort = document.getElementById("sort");
  var state = { cat: "all", band: "all" };
  function apply() {
    var shown = 0;
    items.forEach(function (li) {
      var ok = (state.cat === "all" || li.dataset.cat === state.cat) && (state.band === "all" || li.dataset.band === state.band);
      li.hidden = !ok;
      if (ok) shown++;
    });
    var key = sort.value === "band" ? "bandorder" : "order";
    items.slice().sort(function (a, b) {
      return (+a.dataset[key] - +b.dataset[key]) || (+a.dataset.order - +b.dataset.order);
    }).forEach(function (li) { grid.appendChild(li); });
    count.textContent = shown === items.length ? "Showing all " + shown + " gifts." : shown === 0 ? "No gifts match. Try another filter." : "Showing " + shown + " of " + items.length + " gifts.";
  }
  document.querySelectorAll(".fbtn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var g = btn.dataset.group;
      state[g] = btn.dataset.value;
      document.querySelectorAll('.fbtn[data-group="' + g + '"]').forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      apply();
    });
  });
  sort.addEventListener("change", apply);
})();
