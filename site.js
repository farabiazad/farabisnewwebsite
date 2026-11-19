// Nav: darken on scroll + mobile menu
const nav = document.querySelector("[data-nav]");
const toggle = document.querySelector("[data-nav-toggle]");
const links = document.querySelector("[data-nav-links]");

if (nav) {
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    links.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
}

// Fade elements in as they scroll into view
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Film strip: duplicate frames so the loop is seamless
const strip = document.querySelector("[data-strip]");
if (strip) strip.innerHTML += strip.innerHTML;

// Testimonials slider
const slides = [...document.querySelectorAll(".t-slide")];
const count = document.querySelector("[data-count]");
if (slides.length) {
  let i = 0;
  const pad = (n) => String(n).padStart(2, "0");
  const show = (n) => {
    slides[i].classList.remove("is-active");
    i = (n + slides.length) % slides.length;
    slides[i].classList.add("is-active");
    count.textContent = `${pad(i + 1)} / ${pad(slides.length)}`;
  };
  document.querySelector("[data-prev]").addEventListener("click", () => show(i - 1));
  document.querySelector("[data-next]").addEventListener("click", () => show(i + 1));
}

// Gallery lightbox
const gallery = [...document.querySelectorAll("[data-gallery] img")];
if (gallery.length) {
  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Photo viewer");
  box.innerHTML = `
    <button class="lb-close" type="button" aria-label="Close">×</button>
    <button class="lb-prev" type="button" aria-label="Previous photo">←</button>
    <img alt="" />
    <button class="lb-next" type="button" aria-label="Next photo">→</button>
    <span class="lb-count"></span>`;
  document.body.appendChild(box);
  const img = box.querySelector("img");
  const counter = box.querySelector(".lb-count");
  let cur = 0;

  const open = (n) => {
    cur = (n + gallery.length) % gallery.length;
    img.src = gallery[cur].src;
    img.alt = gallery[cur].alt;
    counter.textContent = `${cur + 1} / ${gallery.length}`;
    box.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    box.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  gallery.forEach((g, n) => {
    g.tabIndex = 0;
    g.addEventListener("click", () => open(n));
    g.addEventListener("keydown", (e) => e.key === "Enter" && open(n));
  });
  box.querySelector(".lb-close").addEventListener("click", close);
  box.querySelector(".lb-prev").addEventListener("click", () => open(cur - 1));
  box.querySelector(".lb-next").addEventListener("click", () => open(cur + 1));
  box.addEventListener("click", (e) => e.target === box && close());
  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") open(cur - 1);
    if (e.key === "ArrowRight") open(cur + 1);
  });
}
