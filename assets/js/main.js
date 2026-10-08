/* Casas Pro Roofing — interactions & premium motion */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024) closeMenu();
    });
  }

  /* ---------- Header scrolled state ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal fallback (no GSAP / reduced motion / error) ---------- */
  function revealAll() {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("revealed");
    });
  }

  /* ---------- Split hero title into masked words ---------- */
  function splitHeroTitle() {
    var h1 = document.querySelector(".hero__title");
    if (!h1 || h1.dataset.split === "1") return;
    h1.dataset.split = "1";
    var frag = document.createDocumentFragment();
    Array.prototype.forEach.call(h1.childNodes, function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
          } else {
            var w = document.createElement("span");
            w.className = "w";
            var wi = document.createElement("span");
            wi.className = "wi";
            wi.textContent = part;
            w.appendChild(wi);
            frag.appendChild(w);
          }
        });
      } else if (node.nodeName === "BR") {
        frag.appendChild(document.createElement("br"));
      } else {
        frag.appendChild(node.cloneNode(true));
      }
    });
    h1.innerHTML = "";
    h1.appendChild(frag);
  }

  /* ---------- Premium GSAP motion ---------- */
  var GROUPED = [".services__grid", ".process__steps", ".areas__pills", ".trust-strip__grid", ".why-us__list"];

  function initMotion() {
    gsap.registerPlugin(ScrollTrigger);

    /* Hero intro timeline */
    splitHeroTitle();
    var h1el = document.querySelector(".hero__title");
    if (h1el) gsap.set(h1el, { opacity: 1, y: 0 }); /* words carry their own mask; container must be visible */
    var intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    var kicker = document.querySelector(".hero .kicker");
    var heroTitleWords = document.querySelectorAll(".hero__title .wi");
    var heroRest = [];
    document.querySelectorAll(".hero .reveal").forEach(function (el) {
      if (el !== kicker && !el.classList.contains("hero__title")) heroRest.push(el);
    });

    if (kicker) {
      gsap.set(kicker, { opacity: 0, x: -24, y: 0 });
      intro.to(kicker, { opacity: 1, x: 0, duration: 0.7 }, 0.1);
    }
    if (heroTitleWords.length) {
      gsap.set(heroTitleWords, { yPercent: 118, y: 0 });
      intro.to(heroTitleWords, { yPercent: 0, duration: 0.95, stagger: 0.07 }, 0.28);
    } else {
      var h1 = document.querySelector(".hero__title");
      if (h1) intro.to(h1, { opacity: 1, y: 0, duration: 0.9 }, 0.28);
    }
    if (heroRest.length) {
      intro.to(heroRest, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, 0.6);
    }
    var hint = document.querySelector(".scroll-hint");
    if (hint) intro.fromTo(hint, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.25);

    /* Hero background parallax */
    gsap.to(".hero__bg", {
      yPercent: 16,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    /* Individual scroll reveals (skip hero + grouped items) */
    var groupedSel = GROUPED.join(",");
    document.querySelectorAll(".reveal").forEach(function (el) {
      if (el.closest(".hero")) return;
      if (el.closest(groupedSel)) return;
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });

    /* Staggered batch reveals for groups */
    GROUPED.forEach(function (sel) {
      var grid = document.querySelector(sel);
      if (!grid || !grid.children.length) return;
      ScrollTrigger.batch(grid.children, {
        start: "top 92%",
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.09, overwrite: true });
        }
      });
    });

    /* Service media settle zoom */
    gsap.utils.toArray(".service-card__media img").forEach(function (img) {
      var card = img.closest(".service-card");
      if (!card) return;
      gsap.fromTo(img, { scale: 1.18 }, {
        scale: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: { trigger: card, start: "top 85%", once: true }
      });
    });

    /* Storm CTA background slow zoom */
    var stormImg = document.querySelector(".storm-cta__bg img");
    if (stormImg) {
      gsap.fromTo(stormImg, { scale: 1 }, {
        scale: 1.14,
        ease: "none",
        scrollTrigger: { trigger: ".storm-cta", start: "top bottom", end: "bottom top", scrub: true }
      });
    }

    /* Why-us image subtle parallax */
    var whyMedia = document.querySelector(".why-us__media");
    var whyImg = whyMedia ? whyMedia.querySelector("img") : null;
    if (whyImg) {
      gsap.fromTo(whyImg, { yPercent: -6 }, {
        yPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: whyMedia, start: "top bottom", end: "bottom top", scrub: true }
      });
    }

    /* Process connector line draw (desktop) */
    var steps = document.querySelector(".process__steps");
    if (steps && window.matchMedia("(min-width: 1024px)").matches) {
      var line = document.createElement("li");
      line.className = "process__drawline";
      line.setAttribute("aria-hidden", "true");
      steps.insertBefore(line, steps.firstChild);
      gsap.fromTo(line, { scaleX: 0 }, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: steps, start: "top 78%", end: "bottom 55%", scrub: 1 }
      });
    }

    /* Nav link active state */
    ["services", "why-us", "process", "areas", "contact"].forEach(function (id) {
      var sec = document.getElementById(id);
      var link = document.querySelector('.nav-menu a[href="#' + id + '"]');
      if (!sec || !link) return;
      ScrollTrigger.create({
        trigger: sec,
        start: "top 45%",
        end: "bottom 45%",
        onToggle: function (self) {
          if (self.isActive) {
            document.querySelectorAll(".nav-menu a").forEach(function (a) { a.classList.remove("active"); });
            link.classList.add("active");
          }
        }
      });
    });
  }

  var motionStarted = false;
  function startMotion() {
    if (motionStarted) return;
    motionStarted = true;
    if (prefersReduced || !hasGsap) {
      revealAll();
    } else {
      try {
        initMotion();
      } catch (err) {
        revealAll();
      }
    }
  }

  if (document.readyState === "complete") {
    startMotion();
  } else {
    window.addEventListener("load", startMotion);
    setTimeout(startMotion, 3000); /* safety: never trap content hidden */
  }

  /* ---------- Demo form ---------- */
  var form = document.getElementById("quoteForm");
  var notice = document.getElementById("formNotice");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (notice) {
        notice.hidden = false;
        if (hasGsap && !prefersReduced) {
          try {
            gsap.fromTo(notice, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
          } catch (err) { /* noop */ }
        }
      }
      form.querySelectorAll("input, textarea").forEach(function (field) { field.value = ""; });
      if (notice && notice.scrollIntoView) {
        notice.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "nearest" });
      }
    });
  }
})();
