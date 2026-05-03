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

function startApp() {
    onSnapshot(bikesCol, (snapshot) => {
        allBikes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderBikes(allBikes); 
    });
}

function renderBikes(bikes) {
    let container = document.getElementById("bike-container");
    if (container) {
        if (bikes.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <i class="fa-solid fa-motorcycle text-gray-200 text-6xl mb-4"></i>
                    <p class="text-gray-400">No bikes currently listed.</p>
                </div>`;
            return;
        }

        container.innerHTML = bikes.map(bike => `
            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-500">
                <div class="relative h-52 bg-slate-50 flex items-center justify-center p-6">
                    <img src="${bike.img || 'https://cdn-icons-png.flaticon.com/512/8163/8163149.png'}" 
                         alt="${bike.name}" 
                         class="h-full object-contain group-hover:scale-110 transition-transform duration-500">
                </div>
                
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-black text-slate-800 uppercase tracking-tight">${bike.name}</h3>
                        <div class="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs">
                             <i class="fa-solid fa-circle-check"></i> Official
                        </div>
                    </div>

                    <div class="flex items-center text-sm text-slate-500 mb-6">
                        <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-3">
                            <i class="fa-solid fa-shield-halved text-slate-600"></i>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Insurance</p>
                            <p class="font-bold text-slate-800">Rs. ${bike.Insurance || '0'}</p>
                        </div>
                    </div>
                    
                    <div class="pt-5 border-t border-dashed border-gray-200">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">MRP Price</span>
                            <i class="fa-solid fa-receipt text-gray-300"></i>
                        </div>
                        <div class="text-3xl font-black text-slate-900 flex items-baseline">
                            <span class="text-sm mr-2 text-red-600 italic">Rs.</span>
                            ${parseFloat(bike.price).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Search Functionality
window.searchBikes = function() {
    const input = document.getElementById('search-input');
    if (!input) return;
    const filter = input.value.toLowerCase();
    const filteredBikes = allBikes.filter(bike => bike.name.toLowerCase().includes(filter));
    renderBikes(filteredBikes);
};

document.getElementById('search-input')?.addEventListener('input', window.searchBikes);

startApp();
