/* ══════════════════════════════════════════════════
   Go! YNG — Bajaj Price List · script.js
   Self-contained: every card pixel uses inline styles.
   No Tailwind. No external CSS dependency.
══════════════════════════════════════════════════ */

import { initializeApp }                   from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

/* ── Firebase ── */
const firebaseConfig = {
  apiKey:            "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
  authDomain:        "first-project-2082-12-26.firebaseapp.com",
  projectId:         "first-project-2082-12-26",
  storageBucket:     "first-project-2082-12-26.firebasestorage.app",
  messagingSenderId: "545170954251",
  appId:             "1:545170954251:web:0d2f7905834af3b0be8f0e",
  measurementId:     "G-17X7R542YC"
};
const app      = initializeApp(firebaseConfig);
const db       = getFirestore(app);
const bikesCol = collection(db, "bikes");

/* ── State ── */
let allBikes     = [];
let activeFilter = "all";

/* ═══════════════════════════════════════
   DESIGN TOKENS  (mirrors CSS vars)
═══════════════════════════════════════ */
const T = {
  red:    "#D0271D",
  redDk:  "#A01E16",
  redLt:  "#FDF1F0",
  ink:    "#111110",
  ink2:   "#3A3A38",
  ink3:   "#6B6B68",
  ink4:   "#9A9A97",
  line:   "#E8E6E1",
  bg:     "#F6F4F0",
  white:  "#FFFFFF",
  green:  "#1A6B3C",
  greenL: "#EAF4EE",
};

/* ── Inject card hover styles once ── */
(function injectHoverCSS() {
  if (document.getElementById("_yng_card_css")) return;
  const s = document.createElement("style");
  s.id = "_yng_card_css";
  s.textContent = `
    .yng-card {
      transition: transform .24s cubic-bezier(.25,.46,.45,.94),
                  box-shadow .24s cubic-bezier(.25,.46,.45,.94),
                  border-color .24s;
    }
    .yng-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 48px rgba(17,17,16,.12);
      border-color: rgba(208,39,29,.3) !important;
    }
    .yng-card:hover .yng-img  { transform: scale(1.05); }
    .yng-card:hover .yng-arr  {
      background: #D0271D !important;
      border-color: #D0271D !important;
      color: #fff !important;
    }
    .yng-card:hover .yng-arr i { transform: translateX(2px); }
    .yng-img  { transition: transform .38s cubic-bezier(.25,.46,.45,.94); }
    .yng-arr  { transition: background .18s, border-color .18s, color .18s; }
    .yng-arr i { transition: transform .18s; }
  `;
  document.head.appendChild(s);
})();

/* ═══════════════════════════════════════
   HELPERS
═══════════════════════════════════════ */

function sortBySn(bikes) {
  return [...bikes].sort((a, b) => {
    const A = (a.sn != null && a.sn !== "") ? Number(a.sn) : 9999;
    const B = (b.sn != null && b.sn !== "") ? Number(b.sn) : 9999;
    return A - B;
  });
}

function getSeries(name = "") {
  const n = name.toLowerCase();
  if (n.includes("pulsar"))   return "Pulsar Series";
  if (n.includes("dominar"))  return "Dominar Series";
  if (n.includes("avenger"))  return "Avenger Series";
  if (n.includes("platina"))  return "Platina Series";
  if (n.includes("ct"))       return "CT Series";
  if (n.includes("discover")) return "Discover Series";
  if (n.includes("boxer"))    return "Boxer Series";
  return "Bajaj Motorcycles";
}

function getCategory(name = "") {
  const n = name.toLowerCase();
  if (n.includes("pulsar"))  return "pulsar";
  if (n.includes("dominar")) return "dominar";
  if (n.includes("avenger")) return "avenger";
  if (n.includes("platina")) return "platina";
  if (n.includes("ct"))      return "ct";
  return "other";
}

function fmtPrice(val) {
  const n = parseFloat(val);
  if (!val || isNaN(n)) return "On Request";
  return "Rs. " + n.toLocaleString("en-IN");
}

function fmtInsurance(val) {
  const n = Number(val);
  if (!val || isNaN(n) || n === 0) return null;
  return "Rs. " + n.toLocaleString("en-IN");
}

/* ═══════════════════════════════════════
   BUILD ONE CARD  (100% inline styles)
═══════════════════════════════════════ */
function buildCard(bike, idx) {
  const name      = bike.name || "Bajaj";
  const series    = getSeries(bike.name);
  const price     = fmtPrice(bike.price);
  const ins       = fmtInsurance(bike.Insurance);
  const isNew     = !!bike.isNew;
  const badge     = bike.badge || null;
  const imgSrc    = bike.img
    || `https://placehold.co/600x340/${T.bg.slice(1)}/${T.ink4.slice(1)}?text=${encodeURIComponent(name)}`;

  /* Chip — top-left */
  const chipL = isNew
    ? `<span style="position:absolute;top:11px;left:11px;
          background:${T.red};color:${T.white};
          font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
          padding:4px 10px;border-radius:6px;">NEW</span>`
    : badge
    ? `<span style="position:absolute;top:11px;left:11px;
          background:${T.ink};color:${T.white};
          font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
          padding:4px 10px;border-radius:6px;">${badge}</span>`
    : "";

  /* Chip — top-right "Official" */
  const chipR = `
    <span style="position:absolute;top:11px;right:11px;
      background:rgba(255,255,255,.94);border:1px solid ${T.line};
      color:${T.green};font-size:10px;font-weight:700;letter-spacing:.06em;
      padding:4px 9px;border-radius:6px;
      display:flex;align-items:center;gap:5px;">
      <i class="fa-solid fa-circle-check" style="font-size:10px;color:${T.green};"></i>
      Official
    </span>`;

  /* Insurance row */
  const insRow = ins ? `
    <div style="display:flex;align-items:center;justify-content:space-between;
      padding:11px 0;border-bottom:1px solid ${T.line};">
      <span style="display:flex;align-items:center;gap:7px;
        font-size:12.5px;font-weight:500;color:${T.ink3};">
        <i class="fa-solid fa-shield-halved" style="color:${T.red};font-size:12px;"></i>
        Insurance
      </span>
      <span style="font-size:13px;font-weight:600;color:${T.ink2};">${ins}</span>
    </div>` : "";

  /* Optional specs grid */
  const specs = [];
  if (bike.cc)      specs.push({ l: "Engine",  v: bike.cc + " cc" });
  if (bike.power)   specs.push({ l: "Power",   v: bike.power });
  if (bike.mileage) specs.push({ l: "Mileage", v: bike.mileage });
  if (bike.weight)  specs.push({ l: "Weight",  v: bike.weight });

  const specGrid = specs.length ? `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;
      padding-top:11px;border-top:1px solid ${T.line};">
      ${specs.map(s => `
        <div style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-size:10px;font-weight:700;letter-spacing:.1em;
            text-transform:uppercase;color:${T.ink4};">${s.l}</span>
          <span style="font-size:12.5px;font-weight:500;color:${T.ink2};">${s.v}</span>
        </div>`).join("")}
    </div>` : "";

  const delay = `${Math.min(idx, 9) * 50}ms`;

  return `
    <div class="yng-card fc"
      style="
        background:${T.white};
        border-radius:14px;
        border:1px solid ${T.line};
        overflow:hidden;
        display:flex;flex-direction:column;
        animation-delay:${delay};
      ">

      <!-- ── Image ── -->
      <div style="position:relative;height:200px;background:${T.bg};overflow:hidden;display:flex;align-items:center;justify-content:center;">
        <img
          class="yng-img"
          src="${imgSrc}"
          alt="${name}"
          loading="lazy"
          onerror="this.src='https://placehold.co/600x340/F6F4F0/9A9A97?text=Bajaj'"
          style="width:100%;height:100%;object-fit:cover;"
        >
        ${chipL}
        ${chipR}
      </div>

      <!-- ── Body ── -->
      <div style="padding:1.1rem;display:flex;flex-direction:column;gap:.85rem;flex:1;">

        <!-- Name + Price -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem;">
          <div style="flex:1;min-width:0;">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:21px;
              letter-spacing:.03em;line-height:1.1;color:${T.ink};
              white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${name}
            </div>
            <div style="font-size:10.5px;font-weight:600;letter-spacing:.11em;
              text-transform:uppercase;color:${T.ink3};margin-top:2px;">
              ${series}
            </div>
          </div>
          <!-- Price badge -->
          <div style="flex-shrink:0;background:${T.redLt};border:1px solid rgba(208,39,29,.15);
            border-radius:8px;padding:7px 11px;text-align:right;">
            <div style="font-size:9.5px;font-weight:700;letter-spacing:.08em;
              text-transform:uppercase;color:${T.redDk};margin-bottom:1px;">
              MRP Price
            </div>
            <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;
              letter-spacing:.02em;color:${T.red};line-height:1.2;white-space:nowrap;">
              ${price}
            </div>
          </div>
        </div>

        ${insRow}
        ${specGrid}

        <!-- Footer row -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:.15rem;">
          <span style="display:flex;align-items:center;gap:7px;
            font-size:12px;font-weight:500;color:${T.ink3};">
            <i class="fa-solid fa-hand-holding-dollar" style="color:${T.red};font-size:13px;"></i>
            EMI Available
          </span>
          <span class="yng-arr" style="width:30px;height:30px;border-radius:7px;
            background:${T.bg};border:1px solid ${T.line};
            display:flex;align-items:center;justify-content:center;
            color:${T.ink2};font-size:11px;">
            <i class="fa-solid fa-arrow-right"></i>
          </span>
        </div>

      </div>
    </div>`;
}

/* ═══════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════ */
function emptyState(msg) {
  return `
    <div style="grid-column:1/-1;display:flex;flex-direction:column;
      align-items:center;padding:4.5rem 1rem;gap:1rem;text-align:center;">
      <div style="width:58px;height:58px;border-radius:14px;
        background:${T.redLt};border:1px solid rgba(208,39,29,.15);
        display:flex;align-items:center;justify-content:center;
        color:${T.red};font-size:22px;">
        <i class="fa-solid fa-magnifying-glass"></i>
      </div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;
        letter-spacing:.03em;color:${T.ink};">No Results Found</div>
      <p style="font-size:13.5px;color:${T.ink3};max-width:240px;
        font-weight:300;line-height:1.7;">${msg}</p>
    </div>`;
}

/* ═══════════════════════════════════════
   RENDER
═══════════════════════════════════════ */
function render(bikes) {
  const container = document.getElementById("bike-container");
  if (!container) return;

  const q = (document.getElementById("search-input")?.value || "").toLowerCase().trim();

  const list = sortBySn(
    bikes.filter(b => {
      const n   = (b.name || "").toLowerCase();
      const cat = getCategory(b.name);
      return (!q || n.includes(q)) &&
             (activeFilter === "all" || cat === activeFilter);
    })
  );

  if (!list.length) {
    container.innerHTML = emptyState(
      q ? `No bikes found for "${q}". Try a different name.`
        : "No bikes listed in this category yet."
    );
    return;
  }

  container.innerHTML = list.map((b, i) => buildCard(b, i)).join("");
}

/* ═══════════════════════════════════════
   WIRE UP FILTERS + SEARCH
═══════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {

  /* Filter tabs */
  document.querySelectorAll(".ftab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".ftab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeFilter = tab.dataset.filter;
      render(allBikes);
    });
  });

  /* Live search */
  document.getElementById("search-input")?.addEventListener("input", () => {
    render(allBikes);
  });

});

/* ═══════════════════════════════════════
   FIREBASE — real-time listener
═══════════════════════════════════════ */
onSnapshot(bikesCol, snap => {
  allBikes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  render(allBikes);
});
