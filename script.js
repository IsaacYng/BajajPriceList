import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

/* ════════════════════════════════════════
   FIREBASE CONFIG
════════════════════════════════════════ */
const firebaseConfig = {
  apiKey:            "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
  authDomain:        "first-project-2082-12-26.firebaseapp.com",
  projectId:         "first-project-2082-12-26",
  storageBucket:     "first-project-2082-12-26.firebasestorage.app",
  messagingSenderId: "545170954251",
  appId:             "1:545170954251:web:0d2f7905834af3b0be8f0e",
  measurementId:     "G-17X7R542YC"
};

const app       = initializeApp(firebaseConfig);
const db        = getFirestore(app);
const bikesCol  = collection(db, "bikes");

let allBikes    = [];
let activeFilter = "all";


/* ════════════════════════════════════════
   HELPERS
════════════════════════════════════════ */

/** Sort by `sn` field ascending; missing sn goes to end */
function sortBySn(bikes) {
  return [...bikes].sort((a, b) => {
    const snA = (a.sn != null && a.sn !== "") ? Number(a.sn) : 9999;
    const snB = (b.sn != null && b.sn !== "") ? Number(b.sn) : 9999;
    return snA - snB;
  });
}

/** Derive display series label from bike name */
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

/** Derive filter category from bike name */
function getCategory(name = "") {
  const n = name.toLowerCase();
  if (n.includes("pulsar"))  return "pulsar";
  if (n.includes("dominar")) return "dominar";
  if (n.includes("avenger")) return "avenger";
  if (n.includes("platina")) return "platina";
  if (n.includes("ct"))      return "ct";
  return "other";
}

/** Format number to Rs. with commas */
function formatPrice(val) {
  const num = parseFloat(val);
  if (!val || isNaN(num)) return "On Request";
  return "Rs. " + num.toLocaleString("en-IN");
}

/** Format insurance similarly */
function formatInsurance(val) {
  const num = Number(val);
  if (!val || isNaN(num) || num === 0) return null;
  return "Rs. " + num.toLocaleString("en-IN");
}


/* ════════════════════════════════════════
   INLINE STYLE CONSTANTS
   All card colours / radii defined here
   so cards are self-contained.
════════════════════════════════════════ */
const C = {
  red:      "#D0271D",
  redDk:    "#A01E16",
  redLt:    "#FDF1F0",
  ink:      "#111110",
  ink2:     "#3A3A38",
  ink3:     "#6B6B68",
  ink4:     "#9A9A97",
  line:     "#E6E4DF",
  bg:       "#F7F5F2",
  white:    "#FFFFFF",
  greenLt:  "#EAF4EE",
  green:    "#1A6B3C",
};
const R = { sm: "8px", md: "12px", lg: "16px" };
const ease = "cubic-bezier(.25,.46,.45,.94)";

/* Card hover via JS — we toggle a class to stay CSS-free */
const cardHoverStyle = `
  .bike-card { transition: transform .25s ${ease}, box-shadow .25s ${ease}, border-color .25s; }
  .bike-card:hover { transform: translateY(-5px); box-shadow: 0 22px 52px rgba(17,17,16,.11); border-color: rgba(208,39,29,.28); }
  .bike-card:hover .card-img { transform: scale(1.05); }
  .bike-card:hover .card-arrow { background: ${C.red}; border-color: ${C.red}; color: ${C.white}; }
  .bike-card:hover .card-arrow i { transform: translateX(2px); }
`;

/* Inject once */
if (!document.getElementById("card-hover-styles")) {
  const st = document.createElement("style");
  st.id = "card-hover-styles";
  st.textContent = cardHoverStyle;
  document.head.appendChild(st);
}


/* ════════════════════════════════════════
   BUILD SINGLE CARD HTML
════════════════════════════════════════ */
function buildCard(bike, index) {
  const name      = bike.name  || "Bajaj";
  const series    = getSeries(bike.name);
  const price     = formatPrice(bike.price);
  const insurance = formatInsurance(bike.Insurance);
  const imgSrc    = bike.img || `https://placehold.co/600x320/${C.bg.slice(1)}/${C.ink3.slice(1)}?text=${encodeURIComponent(name)}`;
  const isNew     = !!bike.isNew;
  const badge     = bike.badge || null;

  /* ── Badge chip ── */
  const badgeHtml = isNew
    ? `<span style="
          position:absolute; top:12px; left:12px;
          background:${C.red}; color:${C.white};
          font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
          padding:5px 10px; border-radius:${R.sm};">
          NEW
        </span>`
    : badge
    ? `<span style="
          position:absolute; top:12px; left:12px;
          background:${C.ink}; color:${C.white};
          font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
          padding:5px 10px; border-radius:${R.sm};">
          ${badge}
        </span>`
    : "";

  /* ── Official chip ── */
  const officialHtml = `
    <span style="
      position:absolute; top:12px; right:12px;
      background:rgba(255,255,255,.93); border:1px solid ${C.line};
      color:${C.green}; font-size:10px; font-weight:700; letter-spacing:.06em;
      padding:5px 10px; border-radius:${R.sm};
      display:flex; align-items:center; gap:5px;">
      <i class="fa-solid fa-circle-check" style="font-size:10px;"></i> Official
    </span>`;

  /* ── Insurance row ── */
  const insuranceHtml = insurance
    ? `<div style="
          display:flex; align-items:center; justify-content:space-between;
          padding:12px 0; border-bottom:1px solid ${C.line};">
          <span style="display:flex;align-items:center;gap:7px;font-size:12px;font-weight:500;color:${C.ink3};">
            <i class="fa-solid fa-shield-halved" style="color:${C.red};font-size:11px;"></i>
            Insurance
          </span>
          <span style="font-size:13px; font-weight:600; color:${C.ink2};">${insurance}</span>
        </div>`
    : "";

  /* ── Spec rows ── */
  const specs = [];
  if (bike.cc)      specs.push({ label: "Engine",   val: bike.cc + " cc" });
  if (bike.power)   specs.push({ label: "Power",     val: bike.power });
  if (bike.mileage) specs.push({ label: "Mileage",   val: bike.mileage });
  if (bike.weight)  specs.push({ label: "Weight",    val: bike.weight });

  const specsHtml = specs.length
    ? `<div style="
          display:grid; grid-template-columns:1fr 1fr; gap:10px;
          padding-top:12px; border-top:1px solid ${C.line};">
          ${specs.map(s => `
            <div style="display:flex;flex-direction:column;gap:2px;">
              <span style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${C.ink4};">
                ${s.label}
              </span>
              <span style="font-size:13px;font-weight:500;color:${C.ink2};">${s.val}</span>
            </div>`).join("")}
        </div>`
    : "";

  return `
    <div class="bike-card fade-card"
         style="
           background:${C.white};
           border-radius:${R.lg};
           border:1px solid ${C.line};
           overflow:hidden;
           display:flex; flex-direction:column;
           cursor:default;
           animation-delay:${Math.min(index, 9) * 55}ms;
         ">

      <!-- IMAGE -->
      <div style="position:relative; height:210px; background:${C.bg}; overflow:hidden; display:flex; align-items:center; justify-content:center;">
        <img
          src="${imgSrc}"
          alt="${name}"
          class="card-img"
          loading="lazy"
          onerror="this.src='https://placehold.co/600x320/F7F5F2/9A9A97?text=Bajaj'"
          style="width:100%; height:100%; object-fit:cover; transition:transform .4s ${ease};"
        >
        ${badgeHtml}
        ${officialHtml}
      </div>

      <!-- BODY -->
      <div style="padding:1.25rem; display:flex; flex-direction:column; gap:.9rem; flex:1;">

        <!-- Name + Price -->
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:.5rem;">
          <div>
            <div style="font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:.03em; line-height:1.1; color:${C.ink};">
              ${name}
            </div>
            <div style="font-size:11px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:${C.ink3}; margin-top:2px;">
              ${series}
            </div>
          </div>
          <div style="
            background:${C.redLt}; border:1px solid rgba(208,39,29,.15);
            border-radius:${R.sm}; padding:8px 12px; text-align:right; flex-shrink:0;">
            <div style="font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:${C.redDk};">
              MRP Price
            </div>
            <div style="font-family:'Bebas Neue',sans-serif; font-size:19px; letter-spacing:.02em; color:${C.red}; line-height:1.2; white-space:nowrap;">
              ${price}
            </div>
          </div>
        </div>

        ${insuranceHtml}
        ${specsHtml}

        <!-- Footer -->
        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:auto; padding-top:.25rem;">
          <span style="display:flex; align-items:center; gap:7px; font-size:12px; font-weight:500; color:${C.ink3};">
            <i class="fa-solid fa-hand-holding-dollar" style="color:${C.red}; font-size:13px;"></i>
            EMI Available
          </span>
          <span class="card-arrow" style="
            width:32px; height:32px; border-radius:${R.sm};
            background:${C.bg}; border:1px solid ${C.line};
            display:flex; align-items:center; justify-content:center;
            color:${C.ink2}; font-size:12px;
            transition:background .2s, border-color .2s, color .2s;">
            <i class="fa-solid fa-arrow-right" style="transition:transform .2s;"></i>
          </span>
        </div>

      </div>
    </div>`;
}


/* ════════════════════════════════════════
   EMPTY STATE
════════════════════════════════════════ */
function emptyState(msg = "No bikes match your search.") {
  return `
    <div style="
      grid-column:1/-1;
      display:flex; flex-direction:column; align-items:center;
      padding:5rem 2rem; gap:1rem; text-align:center;">
      <div style="
        width:64px; height:64px; background:${C.redLt};
        border-radius:${R.lg}; display:flex; align-items:center;
        justify-content:center; color:${C.red}; font-size:24px;">
        <i class="fa-solid fa-magnifying-glass"></i>
      </div>
      <div style="font-family:'Bebas Neue',sans-serif; font-size:30px; letter-spacing:.03em; color:${C.ink};">
        No Results Found
      </div>
      <p style="font-size:14px; color:${C.ink3}; max-width:260px; font-weight:300; line-height:1.7;">
        ${msg}
      </p>
    </div>`;
}


/* ════════════════════════════════════════
   RENDER BIKES
════════════════════════════════════════ */
function renderBikes(bikes) {
  const container = document.getElementById("bike-container");
  if (!container) return;

  const query = (document.getElementById("search-input")?.value || "").toLowerCase().trim();

  /* Filter */
  const filtered = sortBySn(
    bikes.filter(bike => {
      const n   = (bike.name || "").toLowerCase();
      const cat = getCategory(bike.name);
      const matchSearch = !query || n.includes(query);
      const matchFilter = activeFilter === "all" || cat === activeFilter;
      return matchSearch && matchFilter;
    })
  );

  if (filtered.length === 0) {
    container.innerHTML = emptyState(
      query
        ? `No bikes found for "${query}". Try a different name.`
        : "No bikes are listed in this category yet."
    );
    return;
  }

  container.innerHTML = filtered.map((bike, i) => buildCard(bike, i)).join("");
}


/* ════════════════════════════════════════
   FILTER TABS + SEARCH WIRING
════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {

  /* Filter tabs */
  document.querySelectorAll(".ftab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".ftab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeFilter = tab.dataset.filter;
      renderBikes(allBikes);
    });
  });

  /* Live search */
  document.getElementById("search-input")?.addEventListener("input", () => {
    renderBikes(allBikes);
  });

});


/* ════════════════════════════════════════
   FIREBASE LIVE SYNC
════════════════════════════════════════ */
onSnapshot(bikesCol, snapshot => {
  allBikes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderBikes(allBikes);
});
