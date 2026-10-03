// Suok Kim — Portfolio. 데이터: data/works.json (글, 손으로 고침) + data/media.json (미디어 목록, 스크립트가 만듦)
// 주소: #/ = 목록, #/<slug> = 작업 상세. 언어: ?lang=en 또는 KO/EN 버튼 (이 브라우저에 기억)
const SITE = "https://suokkim.github.io/portfolio/";

const T = {
  ko: {
    share: "공유", sms: "문자로 보내기", qr: "QR 크게 보기",
    close: "닫기", tapclose: "아무 데나 누르면 닫힙니다", year: "연도", company: "회사", client: "클라이언트",
    org: "소속", role: "역할", roleVal: "선임디자이너", back: "← 목록", prev: "← 이전", next: "다음 →",
    smsBody: "Suok Kim 포트폴리오", lang: "EN",
    all: "전체", commercial: "상업", noncommercial: "비상업",
    university: "대학교", graduate: "대학원", hammerstudio: "HammerStudio", arttoy: "교육",
  },
  en: {
    share: "Share", sms: "Send by text message", qr: "Show QR code",
    close: "Close", tapclose: "Tap anywhere to close", year: "Year", company: "Studio", client: "Client",
    org: "Affiliation", role: "Role", roleVal: "Senior Designer", back: "← All works", prev: "← Previous", next: "Next →",
    smsBody: "Suok Kim — Portfolio", lang: "KO",
    all: "All", commercial: "Commercial", noncommercial: "Non-commercial",
    university: "University", graduate: "Graduate", hammerstudio: "HammerStudio", arttoy: "Education",
  },
};

let lang = pickLang();
let works = [], media = {};
let cat = "all";   // 분류: all | commercial | noncommercial (디렉터 10-03 — 대학교·대학원 작업을 상업/비상업으로)
let sub = "all";   // 비상업 하위: all | university | graduate | hammerstudio | arttoy (디렉터 10-03)
const SUBS = ["university", "graduate", "hammerstudio", "arttoy"];

function pickLang() {
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "ko" || q === "en") return q;
  try { const s = localStorage.getItem("lang"); if (s === "ko" || s === "en") return s; } catch (e) {}
  return (navigator.language || "ko").startsWith("ko") ? "ko" : "en";
}
function setLang(l) {
  lang = l;
  try { localStorage.setItem("lang", l); } catch (e) {}
  render();
}
const t = (k) => T[lang][k];
const L = (o) => (o == null ? "" : typeof o === "string" ? o : o[lang] || o.ko);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function coverOf(w) {
  if (w.coverUrl) return w.coverUrl;   // 다른 사이트(karts)에 있는 작업은 그쪽 이미지
  const items = media[w.slug] || [];
  const it = items[(w.cover || 1) - 1] || items[0];
  if (!it) return "";
  return it.type === "video" ? it.poster : it.src;
}

const shown = () => works.filter((w) =>
  (cat === "all" || w.cat === cat) && (cat !== "noncommercial" || sub === "all" || w.sub === sub));

function listView() {
  document.title = "Suok Kim — Portfolio";
  // split 작품(주얼리)은 목록에서 묶음 하나하나를 카드로 꺼내 보인다 (디렉터 10-03 "바로 펼쳐줘")
  const cards = (w) => !w.split ? `
    <a class="card" href="${w.url ? esc(w.url) + '" target="_blank" rel="noopener' : "#/" + w.slug}">
      <div class="thumb"><img src="${coverOf(w)}" alt="${esc(L(w.title))}" loading="lazy"></div>
      <h2>${esc(L(w.title))}</h2>
      <div class="meta">${w.year || ""}</div>
    </a>` : w.groups.map((g, gi) => {
      const c = (media[w.slug] || []).find((m) => inGroup(m, g));
      return `
    <a class="card" href="#/${w.slug}/${gi + 1}">
      <div class="thumb"><img src="${c ? c.poster || c.src : ""}" alt="${esc(L(g))}" loading="lazy"></div>
      <h2>${esc(L(g))}</h2>
      <div class="meta">${esc(L(w.title))}</div>
    </a>`; }).join("");
  // 교육은 학교별로 나눠 보인다 — 숙명여대 · 한예종 (디렉터 10-03)
  if (cat === "noncommercial" && sub === "arttoy") {
    const schools = [...new Set(shown().map((w) => L(w.school)))];
    return schools.map((s) => `<h3 class="school">${esc(s)}</h3><section class="grid">${
      shown().filter((w) => L(w.school) === s).map(cards).join("")}</section>`).join("");
  }
  return `<section class="grid">${shown().map(cards).join("")}</section>`;
}

// 미디어가 그 묶음(works.json groups 의 key — 노션 하위 페이지 이름) 소속인지
const inGroup = (m, g) => [].concat(g.key).some((key) => m.group === key || `${m.group}/${m.group2}` === key);

// #/<slug>/<번호> — split 작품의 묶음 하나짜리 페이지
function groupView(w, n) {
  const g = w.groups[n - 1];
  if (!g) return workView(w);
  document.title = `${L(g)} — ${L(w.title)} — Suok Kim`;
  const items = (media[w.slug] || []).filter((m) => inGroup(m, g)).map((m) => `<figure>${m.type === "video"
    ? `<video src="${m.src}" poster="${m.poster}" controls playsinline preload="none"></video>`
    : `<img src="${m.src}" alt="${esc(L(g))}" loading="lazy">`}</figure>`).join("");
  return `<article class="work">
    <a class="back" href="#/">${t("back")}</a>
    <h1>${esc(L(g))}</h1>
    <div class="meta" style="color:var(--muted);font-size:.8rem;margin:-6px 0 18px">${esc(L(w.title))}${w.year ? " · " + w.year : ""}</div>
    <div class="media">${items}</div>
    <nav class="next">
      <span>${n > 1 ? `<a href="#/${w.slug}/${n - 1}">${t("prev")}</a>` : ""}</span>
      <span>${n < w.groups.length ? `<a href="#/${w.slug}/${n + 1}">${t("next")}</a>` : ""}</span>
    </nav>
  </article>`;
}

function workView(w) {
  document.title = `${L(w.title)} — Suok Kim`;
  const list = shown().includes(w) ? shown() : works;
  const i = list.indexOf(w);
  const prev = list[i - 1], next = list[i + 1];
  const commercial = w.cat === "commercial";
  // 캡션: works.json 의 captions(한·영, 미디어 순서대로)가 있으면 그것, 없으면 노션에서 딴 캡션
  const caps = w.captions ? w.captions[lang] || w.captions.ko : [];
  const fig = (m, k) => {
    const el = m.type === "video"
      ? `<video src="${m.src}" poster="${m.poster}" controls playsinline preload="none"></video>`
      : `<img src="${m.src}" alt="${esc(L(w.title))}" loading="lazy">`;
    const cap = caps[k] || (w.captions ? "" : m.caption || "");
    return `<figure>${el}${cap ? `<figcaption>${esc(cap)}</figcaption>` : ""}</figure>`;
  };
  const all = media[w.slug] || [];
  // groups 가 있으면 노션 하위 페이지처럼 묶음별 제목 + 그 묶음 미디어만 (목록에 없는 묶음은 뺀다)
  const items = w.groups
    ? w.groups.map((g) => `<h2 class="group-title">${esc(L(g))}</h2>` +
        all.map((m, k) => (inGroup(m, g) ? fig(m, k) : "")).join("")).join("")
    : all.map(fig).join("");
  // split: 묶음마다 따로 페이지 — 작품 페이지는 묶음 카드만 (디렉터 10-03, 주얼리 반지 연작)
  const body = w.split
    ? `<div class="grid">${w.groups.map((g, gi) => {
        const c = all.find((m) => inGroup(m, g));
        return `<a class="card" href="#/${w.slug}/${gi + 1}">
          <div class="thumb"><img src="${c ? c.poster || c.src : ""}" alt="${esc(L(g))}" loading="lazy"></div>
          <h2>${esc(L(g))}</h2>
          <div class="meta">${all.filter((m) => inGroup(m, g)).length}</div>
        </a>`; }).join("")}</div>`
    : `<div class="media">${w.youtube ? `<figure class="yt"><iframe src="https://www.youtube-nocookie.com/embed/${esc(w.youtube)}" title="${esc(L(w.title))}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></figure>` : ""}${items}</div>`;
  return `<article class="work">
    <a class="back" href="#/">${t("back")}</a>
    <h1>${esc(L(w.title))}</h1>
    <dl class="facts">
      ${w.year ? `<dt>${t("year")}</dt><dd>${w.year}</dd>` : ""}
      ${w.company ? `<dt>${commercial ? t("company") : t("org")}</dt><dd>${esc(L(w.company))}</dd>` : ""}
      ${w.client ? `<dt>${t("client")}</dt><dd>${esc(L(w.client))}</dd>` : ""}
      ${w.role ? `<dt>${t("role")}</dt><dd>${esc(L(w.role))}</dd>`
        : commercial ? `<dt>${t("role")}</dt><dd>${t("roleVal")}</dd>` : ""}
    </dl>
    ${L(w.desc) ? `<p class="desc">${esc(L(w.desc))}</p>` : ""}
    ${w.links.length ? `<ul class="links">${w.links.map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join("")}</ul>` : ""}
    ${body}
    <nav class="next">
      <span>${prev ? `<a href="#/${prev.slug}">${t("prev")}</a>` : ""}</span>
      <span>${next ? `<a href="#/${next.slug}">${t("next")}</a>` : ""}</span>
    </nav>
  </article>`;
}

function render() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-t]").forEach((el) => (el.textContent = t(el.dataset.t)));
  document.getElementById("lang").textContent = t("lang");
  const [slug, n] = location.hash.replace(/^#\/?/, "").split("/");
  const w = works.find((x) => x.slug === slug);
  const filter = document.getElementById("filter");
  // 상세 페이지에서도 분류를 누르면 목록으로 (디렉터 10-03)
  const toList = () => (w ? (location.hash = "#/") : render());
  filter.innerHTML = ["all", "commercial", "noncommercial"].map((c) =>
    `<button type="button" data-cat="${c}" aria-pressed="${c === cat}">${t(c)}</button>`).join("")
    // 비상업을 고르면 하위 분류 한 줄이 더 나온다
    + (cat === "noncommercial" ? `<span class="subfilter">${["all", ...SUBS].map((s) =>
      `<button type="button" data-sub="${s}" aria-pressed="${s === sub}">${t(s)}</button>`).join("")}</span>` : "");
  filter.querySelectorAll("button[data-cat]").forEach((b) => (b.onclick = () => { cat = b.dataset.cat; sub = "all"; toList(); }));
  filter.querySelectorAll("button[data-sub]").forEach((b) => (b.onclick = () => { sub = b.dataset.sub; toList(); }));
  document.getElementById("view").innerHTML = w && n ? groupView(w, +n) : w ? workView(w) : listView();
  watchCenter();
  document.querySelectorAll("#view .media img").forEach((img, k, all) => (img.onclick = () => openZoom([...all], k)));
  document.querySelectorAll("#view .share-btn").forEach((b) => (b.onclick = openQR));
}

// 휴대폰(마우스 호버 없음): 화면 세로 가운데에 가장 가까운 썸네일 한 줄만 제목이 올라온다 (디렉터 10-03)
function watchCenter() {
  if (matchMedia("(hover: hover)").matches) return;
  const mid = innerHeight / 2;
  let best = null, d = Infinity;
  document.querySelectorAll("#view .card").forEach((c) => {
    const r = c.getBoundingClientRect(), dc = Math.abs(r.top + r.height / 2 - mid);
    if (dc < d) { d = dc; best = r.top; }
  });
  // 같은 줄(가로로 나란한 카드)은 함께
  document.querySelectorAll("#view .card").forEach((c) => c.classList.toggle("on", c.getBoundingClientRect().top === best));
}
addEventListener("scroll", watchCenter, { passive: true });
addEventListener("resize", watchCenter);

// 이미지 크게 보기 — 한 장씩 화면 가득, 위아래로 밀면 다음 장 (CSS scroll-snap), 확대는 손가락 벌리기 (디렉터 10-03)
function openZoom(imgs, k) {
  const z = document.getElementById("zoom");
  z.innerHTML = `<button class="zoom-close" type="button">${t("close")}</button>` +
    imgs.map((i) => `<div class="z"><img src="${i.src}" alt=""></div>`).join("");
  z.hidden = false;
  document.body.style.overflow = "hidden";
  z.querySelectorAll(".z")[k].scrollIntoView();
  z.querySelector(".zoom-close").onclick = closeZoom;
}
function closeZoom() {
  document.getElementById("zoom").hidden = true;
  document.body.style.overflow = "";
}

// QR — 공유 버튼 대신 QR 아이콘, 누르면 바로 QR 만 화면 가득 (디렉터 10-03)
// 화면 밝기는 웹에서 바꿀 수 없다(브라우저에 그런 기능이 없음) — 대신 흰 화면 + 켜져 있는 동안 화면이 어두워지거나 꺼지지 않게
let wake = null;
async function openQR() {
  document.getElementById("qr-full").hidden = false;
  try { wake = await navigator.wakeLock?.request("screen"); } catch (e) {}
}
function closeQR() {
  document.getElementById("qr-full").hidden = true;
  if (wake) { wake.release().catch(() => {}); wake = null; }
}

document.querySelectorAll("header .share-btn, footer .share-btn").forEach((b) => (b.onclick = openQR));
document.getElementById("qr-full").onclick = closeQR;
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeZoom(); closeQR(); }
});
document.getElementById("lang").onclick = () => setLang(lang === "ko" ? "en" : "ko");
window.addEventListener("hashchange", () => { closeZoom(); render(); window.scrollTo(0, 0); });

Promise.all([fetch("data/works.json").then((r) => r.json()), fetch("data/media.json").then((r) => r.json())])
  .then(([w, m]) => { works = w; media = m; render(); });

// 맨 위로 — 한 화면 넘게 내려가면 보임 (디렉터 10-03)
const toTop = document.getElementById("to-top");
addEventListener("scroll", () => (toTop.hidden = scrollY < innerHeight), { passive: true });
toTop.onclick = () => scrollTo({ top: 0, behavior: "smooth" });
