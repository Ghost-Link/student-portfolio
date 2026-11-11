/* ==========================================================================
   main.js — shared behaviour
   Theme preference, mobile navigation, scroll reveal, audio state and year.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var THEME_KEY = "me-theme";
  var themeToggle = document.querySelector("[data-theme-toggle]");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    var isDark = theme === "dark";
    root.setAttribute("data-theme", isDark ? "dark" : "light");

    if (themeMeta) {
      themeMeta.setAttribute("content", isDark ? "#050705" : "#f3f5ec");
    }

    if (!themeToggle) {
      return;
    }

    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
    themeToggle.setAttribute(
      "title",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
  }

  applyTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);

      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (error) {
        /* Storage can be unavailable in strict private modes. */
      }
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navMenu = document.querySelector("[data-nav-menu]");

  function closeMenu() {
    if (!navToggle || !navMenu) {
      return;
    }

    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-open");
  }

  function openMenu() {
    if (!navToggle || !navMenu) {
      return;
    }

    navMenu.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    document.body.classList.add("menu-open");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      if (navToggle.getAttribute("aria-expanded") === "true") {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navMenu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    document.addEventListener("click", function (event) {
      if (
        navMenu.classList.contains("is-open") &&
        !navMenu.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 920) {
        closeMenu();
      }
    });
  }

  /* ---------- Header elevation ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  var revealItems = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!revealItems.length) {
    /* Nothing to reveal. */
  } else if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries, instance) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            instance.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -36px 0px", threshold: 0.08 }
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* ---------- Current year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  /* ---------- Audio decoration ---------- */
  var audioPlayers = document.querySelectorAll(
    "audio[data-audio], audio[data-audio-src]"
  );

  audioPlayers.forEach(function (audio) {
    /* Guarantee the element has a playable source. */
    if (!audio.getAttribute("src") && audio.getAttribute("data-audio-src")) {
      audio.src = audio.getAttribute("data-audio-src");
    }

    var card = audio.closest(".audio-card");
    var waveform = card ? card.querySelector(".waveform") : null;
    if (!waveform) {
      return;
    }

    audio.addEventListener("play", function () {
      waveform.classList.remove("is-idle");
    });

    audio.addEventListener("pause", function () {
      waveform.classList.add("is-idle");
    });

    audio.addEventListener("ended", function () {
      waveform.classList.add("is-idle");
    });
  });
})();
