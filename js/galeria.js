// js/galeria.js
(() => {
  // Coloque suas fotos em: img/galeria/
  // Ajuste a faixa conforme seus arquivos (visto nas capturas: 8880..9259)
  const GALLERY_DIR = "img/galeria/";
  const START = 8880;       // primeiro número (inclui)
  const END   = 9260;       // último número + 1 (exclui)
  const CONCURRENCY = 16;   // quantos HEAD em paralelo

  const gallery = document.querySelector("#gallery");
  const tpl = document.querySelector("#lb-tpl");
  if (!gallery || !tpl) return;

  // Tenta encontrar o arquivo com variação de extensão
  async function headExists(name) {
    const urls = [
      `${GALLERY_DIR}${name}.JPG`,
      `${GALLERY_DIR}${name}.jpg`,
      `${GALLERY_DIR}${name}.JPEG`,
      `${GALLERY_DIR}${name}.jpeg`,
    ];
    for (const url of urls) {
      try {
        const r = await fetch(url, { method: "HEAD", cache: "no-cache" });
        if (r.ok) return url;
      } catch (_) {}
    }
    return null;
  }

  // Gera candidatos: IMG_8880 .. IMG_9259
  const candidates = [];
  for (let n = START; n < END; n++) candidates.push(`IMG_${n}`);

  // Checa existência em paralelo
  async function filterExisting(list) {
    const existing = [];
    let i = 0;
    async function worker() {
      while (i < list.length) {
        const idx = i++;
        const name = list[idx];
        const url = await headExists(name);
        if (url) existing.push({ url, name });
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    existing.sort((a, b) => parseInt(a.name.slice(4)) - parseInt(b.name.slice(4)));
    return existing;
  }

  function makeItem({ url, name }, idx) {
    const fig = document.createElement("figure");
    fig.style.margin = "10px 0";
    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.src = url;
    img.alt = name;
    img.style.width = "100%";
    img.style.borderRadius = "14px";
    img.style.border = "1px solid rgba(255,255,255,.08)";
    img.addEventListener("click", () => openLightbox(idx));
    fig.appendChild(img);
    return fig;
  }

  let items = [];
  let current = 0;
  let lbRoot = null;

  function openLightbox(i) {
    current = i;
    if (!lbRoot) {
      lbRoot = tpl.content.firstElementChild.cloneNode(true);
      document.body.appendChild(lbRoot);
      lbRoot.querySelector(".lb-close").addEventListener("click", closeLightbox);
      lbRoot.querySelector(".lb-prev").addEventListener("click", () => nav(-1));
      lbRoot.querySelector(".lb-next").addEventListener("click", () => nav(+1));
      lbRoot.addEventListener("click", (e) => { if (e.target === lbRoot) closeLightbox(); });
      document.addEventListener("keydown", onKey);
    }
    renderLightbox();
  }

  function closeLightbox() {
    if (lbRoot) {
      lbRoot.remove();
      lbRoot = null;
      document.removeEventListener("keydown", onKey);
    }
  }

  function onKey(e) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") nav(-1);
    if (e.key === "ArrowRight") nav(+1);
  }

  function nav(dir) {
    current = (current + dir + items.length) % items.length;
    renderLightbox();
  }

  function renderLightbox() {
    if (!lbRoot) return;
    const img = lbRoot.querySelector(".lb-img");
    const cap = lbRoot.querySelector(".lb-cap");
    img.src = items[current].url;
    img.alt = items[current].name;
    cap.textContent = items[current].name; // legenda com o nome do arquivo
  }

  (async () => {
    items = await filterExisting(candidates);
    const frag = document.createDocumentFragment();
    items.forEach((it, i) => frag.appendChild(makeItem(it, i)));
    gallery.appendChild(frag);
    requestAnimationFrame(() => gallery.classList.add("show"));
  })();
})();
