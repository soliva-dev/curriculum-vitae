/**
 * CV interactivo — lógica de la versión estática.
 * 1. Renderiza los iconos de lucide sobre los placeholders <i data-lucide="...">.
 * 2. Alterna entre temas claro y oscuro y guarda la preferencia.
 * 3. Menú móvil (abrir / cerrar, overlay, Escape, click en enlaces).
 * 4. Resalta la sección visible en la navegación.
 * 5. Año dinámico en el pie.
 */
(function () {
  "use strict";

  var renderIcons = function () {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  };

  function initThemeToggle() {
    var root = document.documentElement;
    var buttons = Array.prototype.slice.call(
      document.querySelectorAll("#theme-toggle, #theme-toggle-mobile")
    );
    var themeColor = document.querySelector('meta[name="theme-color"]');

    if (!buttons.length) {
      return;
    }

    var updateTheme = function (theme) {
      root.dataset.theme = theme;
      var nextTheme = theme === "dark" ? "light" : "dark";
      var label = "Cambiar a modo " + (nextTheme === "light" ? "claro" : "oscuro");
      var iconName = nextTheme === "light" ? "sun" : "moon";

      buttons.forEach(function (button) {
        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);
        var iconContainer = button.querySelector(".theme-toggle-icon");
        if (iconContainer) {
          while (iconContainer.firstChild) {
            iconContainer.removeChild(iconContainer.firstChild);
          }
          var icon = document.createElement("i");
          icon.setAttribute("data-lucide", iconName);
          iconContainer.appendChild(icon);
        }
        var text = button.querySelector(".theme-toggle-label");
        if (text) {
          text.textContent = label;
        }
      });

      if (themeColor) {
        themeColor.setAttribute("content", theme === "dark" ? "#0b1120" : "#f8fafc");
      }
      renderIcons();
    };

    updateTheme(root.dataset.theme === "light" ? "light" : "dark");

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
        try {
          localStorage.setItem("theme", nextTheme);
        } catch (error) {
          console.error("No se pudo guardar la preferencia de tema.", error);
        }
        updateTheme(nextTheme);
      });
    });
  }

  /* ------------------------------------------------------------ móvil ---- */
  function initMobileMenu() {
    var panel = document.getElementById("mobile-menu");
    var toggle = document.getElementById("menu-toggle");
    var closeBtn = document.getElementById("menu-close");
    var overlay = document.getElementById("mobile-menu-overlay");
    var sheet = document.getElementById("mobile-menu-panel");
    var body = document.body;

    if (!panel || !toggle || !sheet) {
      return;
    }

    var open = function () {
      panel.classList.remove("hidden");
      panel.setAttribute("aria-hidden", "false");
      body.style.overflow = "hidden";
      toggle.setAttribute("aria-expanded", "true");
      window.requestAnimationFrame(function () {
        sheet.classList.remove("translate-x-full");
        if (overlay) {
          overlay.classList.remove("opacity-0");
        }
      });
    };

    var close = function () {
      sheet.classList.add("translate-x-full");
      if (overlay) {
        overlay.classList.add("opacity-0");
      }
      toggle.setAttribute("aria-expanded", "false");
      body.style.overflow = "";
      window.setTimeout(function () {
        panel.classList.add("hidden");
        panel.setAttribute("aria-hidden", "true");
      }, 300);
    };

    toggle.addEventListener("click", open);
    if (closeBtn) {
      closeBtn.addEventListener("click", close);
    }
    if (overlay) {
      overlay.addEventListener("click", close);
    }
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.classList.contains("hidden")) {
        close();
      }
    });
  }

  /* -------------------------------------------------- sección activa ----- */
  function initActiveSection() {
    var links = Array.prototype.slice.call(document.querySelectorAll("[data-section-link]"));
    var sections = links
      .map(function (link) {
        return document.getElementById(link.getAttribute("data-section-link"));
      })
      .filter(Boolean);

    if (!sections.length) {
      return;
    }

    var update = function () {
      var current = sections[0].id;
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top - 120 <= 0) {
          current = section.id;
        }
      });
      links.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("data-section-link") === current);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ------------------------------------------------------------- init ---- */
  function init() {
    initThemeToggle();
    renderIcons();
    initMobileMenu();
    initActiveSection();

    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
