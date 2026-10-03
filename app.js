// Suok Kim — Portfolio. 데이터: data/works.json (글, 손으로 고침) + data/media.json (미디어 목록, 스크립트가 만듦)
// 주소: #/ = 목록, #/<slug> = 작업 상세. 언어: ?lang=en 또는 KO/EN 버튼 (이 브라우저에 기억)
const SITE = "https://suokkim.github.io/portfolio/";

const T = {
  ko: {
    sub: "선임디자이너 · 미디어파사드 · 3D", share: "공유", sms: "문자로 보내기", qr: "QR 크게 보기",
    close: "닫기", tapclose: "아무 데나 누르면 닫힙니다", year: "연도", company: "회사", client: "클라이언트",
    role: "역할", roleVal: "선임디자이너", back: "← 목록", prev: "← 이전", next: "다음 →",
    smsBody: "Suok Kim 포트폴리오", lang: "EN",
  },
  en: {
    sub: "Senior Designer · Media Facade · 3D", share: "Share", sms: "Send by text message", qr: "Show QR code",
    close: "Close", tapclose: "Tap anywhere to close", year: "Year", company: "Studio", client: "Client",
    role: "Role", roleVal: "Senior Designer", back: "← All works", prev: "← Previous", next: "Next →",
    smsBody: "Suok Kim — Portfolio", lang: "KO",
  },
};

let lang = pickLang();
let works = [], media = {};

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
  const items = media[w.slug] || [];
  const it = items[(w.cover || 1) - 1] || items[0];
  if (!it) return "";
  return it.type === "video" ? it.poster : it.src;
}

function listView() {
  document.title = "Suok Kim — Portfolio";
  return `<section class="grid">${works.map((w) => `
    <a class="card" href="#/${w.slug}">
      <div class="thumb"><img src="${coverOf(w)}" alt="${esc(L(w.title))}" loading="lazy"></div>
      <h2>${esc(L(w.title))}</h2>
      <div class="meta">${w.year} · ${esc(L(w.company))}${w.client ? " · " + esc(L(w.client)) : ""}</div>
    </a>`).join("")}</section>`;
}

function workView(w) {
  document.title = `${L(w.title)} — Suok Kim`;
  const i = works.indexOf(w);
  const prev = works[i - 1], next = works[i + 1];
  const items = (media[w.slug] || []).map((m) => m.type === "video"
    ? `<video src="${m.src}" poster="${m.poster}" controls playsinline preload="none"></video>`
    : `<img src="${m.src}" alt="${esc(L(w.title))}" loading="lazy">`).join("");
  return `<article class="work">
    <a class="back" href="#/">${t("back")}</a>
    <h1>${esc(L(w.title))}</h1>
    <dl class="facts">
      <dt>${t("year")}</dt><dd>${w.year}</dd>
      <dt>${t("company")}</dt><dd>${esc(L(w.company))}</dd>
      ${w.client ? `<dt>${t("client")}</dt><dd>${esc(L(w.client))}</dd>` : ""}
      <dt>${t("role")}</dt><dd>${t("roleVal")}</dd>
    </dl>
    <p class="desc">${esc(L(w.desc))}</p>
    ${w.links.length ? `<ul class="links">${w.links.map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join("")}</ul>` : ""}
    <div class="work-share"><button class="share-btn" type="button">${t("share")}</button></div>
    <div class="media">${items}</div>
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
  const slug = location.hash.replace(/^#\/?/, "");
  const w = works.find((x) => x.slug === slug);
  document.getElementById("view").innerHTML = w ? workView(w) : listView();
  document.querySelectorAll("#view .share-btn").forEach((b) => (b.onclick = openSheet));
}

// 공유 — 문자: 지금 보고 있는 페이지 주소 / QR: 사이트 첫 화면 주소
function openSheet() {
  const url = SITE + (location.hash.length > 2 ? location.hash : "");
  const w = works.find((x) => x.slug === location.hash.replace(/^#\/?/, ""));
  const body = `${w ? L(w.title) + " — " : ""}${t("smsBody")} ${url}`;
  // iOS 는 sms:&body=, 안드로이드는 sms:?body= — 둘 다 받는 꼴
  document.getElementById("sms").href = "sms:?&body=" + encodeURIComponent(body);
  document.getElementById("sheet").hidden = false;
}
function closeSheet() { document.getElementById("sheet").hidden = true; }

document.querySelectorAll("header .share-btn, footer .share-btn").forEach((b) => (b.onclick = openSheet));
document.getElementById("sheet-close").onclick = closeSheet;
document.getElementById("sheet").onclick = (e) => { if (e.target.id === "sheet") closeSheet(); };
document.getElementById("qr-open").onclick = () => { closeSheet(); document.getElementById("qr-full").hidden = false; };
document.getElementById("qr-full").onclick = () => (document.getElementById("qr-full").hidden = true);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeSheet(); document.getElementById("qr-full").hidden = true; }
});
document.getElementById("lang").onclick = () => setLang(lang === "ko" ? "en" : "ko");
window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });

Promise.all([fetch("data/works.json").then((r) => r.json()), fetch("data/media.json").then((r) => r.json())])
  .then(([w, m]) => { works = w; media = m; render(); });
