/* ==========================================================================
   projects.js — client-side project filtering
   ========================================================================== */
(function () {
  "use strict";

  var filterBar = document.querySelector("[data-project-filters]");
  var cards = Array.prototype.slice.call(
    document.querySelectorAll("[data-project-card]")
  );
  var noResults = document.querySelector("[data-project-empty]");
  var resultStatus = document.querySelector("[data-project-status]");

  if (!filterBar || !cards.length) {
    return;
  }

  var buttons = Array.prototype.slice.call(
    filterBar.querySelectorAll("[data-filter]")
  );

  function matches(card, filter) {
    if (filter === "all") {
      return true;
    }
    return (card.getAttribute("data-category") || "")
      .split(/\s+/)
      .indexOf(filter) !== -1;
  }

  function applyFilter(filter) {
    var visible = 0;

    cards.forEach(function (card) {
      var show = matches(card, filter);
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    buttons.forEach(function (button) {
      button.setAttribute(
        "aria-pressed",
        String(button.getAttribute("data-filter") === filter)
      );
    });

    if (noResults) {
      noResults.hidden = visible !== 0;
    }

    if (resultStatus) {
      resultStatus.textContent =
        filter === "all"
          ? "Showing all " + visible + (visible === 1 ? " project." : " projects.")
          : "Showing " +
            visible +
            " " +
            filter +
            (visible === 1 ? " project." : " projects.");
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      applyFilter(button.getAttribute("data-filter") || "all");
    });
  });

  applyFilter("all");
})();
