import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// १. Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
  authDomain: "first-project-2082-12-26.firebaseapp.com",
  projectId: "first-project-2082-12-26",
  storageBucket: "first-project-2082-12-26.firebasestorage.app",
  messagingSenderId: "545170954251",
  appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const bikesCol = collection(db, "bikes");

let allBikes = [];

async function fetchBikes() {
    try {
        const snapshot = await getDocs(bikesCol);
        allBikes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const select = document.getElementById('modelSelect');
        if (select) {
            select.innerHTML = allBikes.map(bike => 
                `<option value="${bike.id}" ${bike.name.includes("Pulsar 150 SD BS VI") ? "selected" : ""}>${bike.name}</option>`
            ).join('');
            calculateFinance();
        }
    } catch (e) {
        console.error("Error fetching bikes:", e);
    }
}

window.calculateFinance = function() {
    const selectedId = document.getElementById('modelSelect').value;
    const bike = allBikes.find(b => b.id === selectedId);
    if (!bike) return;

    const mrp = parseFloat(bike.price) || 0;
    const insurance = parseFloat(bike.Insurance) || 0;
    const discount = parseFloat(document.getElementById('discountInput').value) || 0;
    const customerExtraAdv = parseFloat(document.getElementById('advEmiInput').value) || 0; 
    const namsari = parseFloat(document.getElementById('namsariInput').value) || 3000;

    const accCost = (parseFloat(document.getElementById('helmetInput').value) || 0) + 
                     (parseFloat(document.getElementById('legguardInput').value) || 0) + 
                     (parseFloat(document.getElementById('seatcoverInput').value) || 0) + 
                     (parseFloat(document.getElementById('othersInput').value) || 0);

    const dpPercentVal = parseFloat(document.getElementById('dpPercent').value);
    const tenure = parseFloat(document.getElementById('tenure').value);

    const afterDiscount = mrp - discount;
    const dpAmountOnly = afterDiscount * (dpPercentVal / 100);
    const loanAmount = afterDiscount - dpAmountOnly;

    let rate = 13.99;
    if (dpPercentVal >= 60) rate = 9.99;
    else if (dpPercentVal >= 50) rate = 11.99;
    else if (dpPercentVal >= 40) rate = 12.99;

    const monthlyRate = (rate / 12) / 100;
    
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);

    const rawTotalDownpayment = dpAmountOnly + namsari + insurance + emi + accCost + customerExtraAdv;
  
    const lastThreeDigits = rawTotalDownpayment % 1000;
    const autoRounding = lastThreeDigits > 0 ? (1000 - lastThreeDigits) : 0;
  
    const finalTotalDP = rawTotalDownpayment + autoRounding;

    const totalAdvEmi = emi + autoRounding + customerExtraAdv;
    const dueEmi = (emi * tenure) - totalAdvEmi;
    const totalInterest = (emi * tenure) - loanAmount;

    document.getElementById('displayTotalDP').innerText = `RS. ${Math.round(finalTotalDP).toLocaleString()}`;

    document.getElementById('mrp').innerText = `RS. ${mrp.toLocaleString()}`;
    document.getElementById('afterDiscount').innerText = `RS. ${afterDiscount.toLocaleString()}`;
    document.getElementById('displayIns').innerText = `RS. ${insurance.toLocaleString()}`;

    document.getElementById('displayRate').innerText = `${rate}`;
    document.getElementById('displayDpAmt').innerText = `RS. ${dpAmountOnly.toLocaleString()}`;
    document.getElementById('displayLoanAmt').innerText = `RS. ${loanAmount.toLocaleString()}`;

    document.getElementById('displayEMI').innerText = `RS. ${emi.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('displayAutoAdEmi').innerText = `RS. ${autoRounding.toFixed(2)}`;
    document.getElementById('displayTotalAdvEmi').innerText = `RS. ${totalAdvEmi.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('displayDueEmi').innerText = `RS. ${dueEmi.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('displayTotalInterest').innerText = `RS. ${totalInterest.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
};

document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        calculateFinance();
    }
});

fetchBikes();
