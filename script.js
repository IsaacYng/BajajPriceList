import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
  authDomain: "first-project-2082-12-26.firebaseapp.com",
  projectId: "first-project-2082-12-26",
  storageBucket: "first-project-2082-12-26.firebasestorage.app",
  messagingSenderId: "545170954251",
  appId: "1:545170954251:web:0d2f7905834af3b0be8f0e",
  measurementId: "G-17X7R542YC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const bikesCol = collection(db, "bikes");

let allBikes = [];
let activeFilter = 'all';

// ── SORT by sn field (ascending), unsorted go last ──
function sortBySn(bikes) {
  return [...bikes].sort((a, b) => {
    const snA = (a.sn !== undefined && a.sn !== null && a.sn !== '') ? Number(a.sn) : 9999;
    const snB = (b.sn !== undefined && b.sn !== null && b.sn !== '') ? Number(b.sn) : 9999;
    return snA - snB;
  });
}

// ── DETECT series from name ──
function getSeries(name) {
  if (!name) return '';
  const n = name.toLowerCase();
  if (n.includes('pulsar')) return 'Pulsar Series';
  if (n.includes('dominar')) return 'Dominar Series';
  if (n.includes('avenger')) return 'Avenger Series';
  if (n.includes('platina')) return 'Platina Series';
  if (n.includes('ct')) return 'CT Series';
  if (n.includes('discover')) return 'Discover Series';
  if (n.includes('boxer')) return 'Boxer Series';
  return 'Bajaj Motorcycles';
}

// ── DETECT filter category from name ──
function getCategory(name) {
  if (!name) return 'other';
  const n = name.toLowerCase();
  if (n.includes('pulsar')) return 'pulsar';
  if (n.includes('dominar')) return 'dominar';
  if (n.includes('avenger')) return 'avenger';
  if (n.includes('platina')) return 'platina';
  if (n.includes('ct')) return 'ct';
  return 'other';
}

// ── FORMAT price ──
function formatPrice(val) {
  const num = parseFloat(val);
  if (!val || isNaN(num)) return 'On Request';
  return 'Rs. ' + num.toLocaleString('en-NP');
}

// ── RENDER CARDS ──
function renderBikes(bikes) {
  const container = document.getElementById('bike-container');
  if (!container) return;

  const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();

  let filtered = bikes.filter(bike => {
    const name = (bike.name || '').toLowerCase();
    const cat  = getCategory(bike.name);
    const matchSearch = !query || name.includes(query);
    const matchFilter = activeFilter === 'all' || cat === activeFilter;
    return matchSearch && matchFilter;
  });

  const sorted = sortBySn(filtered);

  if (sorted.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
        <div class="empty-title">NO RESULTS</div>
        <p class="empty-desc">No bikes match your search. Try a different name or reset the filter.</p>
      </div>`;
    return;
  }

  container.innerHTML = sorted.map((bike, i) => {
    const name         = bike.name || 'Bajaj';
    const series       = getSeries(bike.name);
    const price        = formatPrice(bike.price);
    const insurance    = bike.Insurance ? 'Rs. ' + Number(bike.Insurance).toLocaleString('en-NP') : null;
    const imgSrc       = bike.img || `https://placehold.co/600x320/F7F5F2/6B6B68?text=${encodeURIComponent(name)}`;
    const isNew        = !!bike.isNew;
    const badge        = bike.badge || null;

    // Build badge HTML
    let badgeHtml = '';
    if (isNew) {
      badgeHtml = `<span class="bike-card-badge bike-card-new">New</span>`;
    } else if (badge) {
      badgeHtml = `<span class="bike-card-badge">${badge}</span>`;
    }

    // Build spec rows — only show what exists
    const specs = [];
    if (bike.cc)      specs.push({ label: 'Engine',    val: bike.cc + ' cc' });
    if (bike.power)   specs.push({ label: 'Power',     val: bike.power });
    if (bike.mileage) specs.push({ label: 'Mileage',   val: bike.mileage });
    if (bike.weight)  specs.push({ label: 'Weight',    val: bike.weight });

    const specsHtml = specs.length ? `
      <div class="bike-card-divider"></div>
      <div class="bike-card-specs">
        ${specs.map(s => `
          <div class="bike-spec">
            <span class="bike-spec-label">${s.label}</span>
            <span class="bike-spec-val">${s.val}</span>
          </div>
        `).join('')}
      </div>` : '';

    // Insurance row (only if available)
    const insuranceHtml = insurance ? `
      <div class="bike-card-divider"></div>
      <div class="bike-insurance-row">
        <span class="bike-insurance-label">
          <i class="fa-solid fa-shield-halved"></i> Insurance
        </span>
        <span class="bike-insurance-val">${insurance}</span>
      </div>` : '';

    return `
      <div class="bike-card fade-in" style="animation-delay:${Math.min(i, 8) * 60}ms;">
        <div class="bike-card-img-wrap">
          <img
            src="${imgSrc}"
            alt="${name}"
            class="bike-card-img"
            loading="lazy"
            onerror="this.src='https://placehold.co/600x320/F7F5F2/6B6B68?text=Bajaj'"
          >
          ${badgeHtml}
          <div class="bike-card-official">
            <i class="fa-solid fa-circle-check"></i> Official
          </div>
        </div>

        <div class="bike-card-body">
          <div class="bike-card-top">
            <div>
              <div class="bike-card-name">${name}</div>
              <div class="bike-card-series">${series}</div>
            </div>
            <div class="bike-card-price-tag">
              <div class="bike-card-price-label">MRP</div>
              <div class="bike-card-price">${price}</div>
            </div>
          </div>

          ${insuranceHtml}
          ${specsHtml}

          <div class="bike-card-footer">
            <div class="bike-card-finance">
              <i class="fa-solid fa-hand-holding-dollar"></i>
              EMI available
            </div>
            <div class="bike-card-arrow">
              <i class="fa-solid fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── FILTER TABS ──
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.filter;
      renderBikes(allBikes);
    });
  });

  document.getElementById('search-input')?.addEventListener('input', () => {
    renderBikes(allBikes);
  });
});

// ── FIREBASE LIVE SYNC ──
function startApp() {
  onSnapshot(bikesCol, (snapshot) => {
    allBikes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderBikes(allBikes);
  });
}

startApp();
