// ============================================================
// FISH POND MONITOR - Firebase Integration
// SMART FARM | 2021/1/81764CM
// ============================================================

// Your Firebase config (from Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyCNYoTESy39Gwh4hM4CznmMEA-pJLV-zVQ",
    authDomain: "fishpondmonitor-46e83.firebaseapp.com",
    databaseURL: "https://fishpondmonitor-46e83-default-rtdb.firebaseio.com",
    projectId: "fishpondmonitor-46e83",
    storageBucket: "fishpondmonitor-46e83.firebasestorage.app",
    messagingSenderId: "564500948244",
    appId: "1:564500948244:web:83e3e4542bab72637b8e01",
    measurementId: "G-0WSP3JFWF2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM Elements
const tempEl = document.getElementById('temperature');
const phEl = document.getElementById('ph');
const tdsEl = document.getElementById('tds');
const signalEl = document.getElementById('signal');
const timestampEl = document.getElementById('timestamp');
const packetsEl = document.getElementById('packets');
const tempStatus = document.getElementById('tempStatus');
const phStatus = document.getElementById('phStatus');
const tdsStatus = document.getElementById('tdsStatus');
const signalStatus = document.getElementById('signalStatus');

let packetCount = 0;

// ============================================================
// READ DATA FROM FIREBASE
// ============================================================

const sensorsRef = database.ref('/sensors');

sensorsRef.on('value', (snapshot) => {
    const data = snapshot.val();
    
    if (data) {
        // Update values
        if (data.temperature !== undefined) {
            tempEl.textContent = data.temperature.toFixed(1);
            packetCount++;
            updateTemperatureStatus(data.temperature);
        }
        
        if (data.ph !== undefined) {
            phEl.textContent = data.ph.toFixed(2);
            updatePHStatus(data.ph);
        }
        
        if (data.tds !== undefined) {
            tdsEl.textContent = data.tds.toFixed(0);
            updateTDSStatus(data.tds);
        }
        
        if (data.signal !== undefined) {
            signalEl.textContent = data.signal;
            updateSignalStatus(data.signal);
        }
        
        if (data.timestamp !== undefined) {
            // Convert timestamp to readable time
            const date = new Date(data.timestamp * 1000);
            timestampEl.textContent = date.toLocaleTimeString();
        }
        
        packetsEl.textContent = packetCount;
    }
}, (error) => {
    console.error('Firebase read error:', error);
});

// ============================================================
// STATUS FUNCTIONS
// ============================================================

function updateTemperatureStatus(temp) {
    if (temp < 22) {
        tempStatus.textContent = '❄️ Low';
        tempStatus.className = 'status danger';
    } else if (temp > 32) {
        tempStatus.textContent = '🔥 High';
        tempStatus.className = 'status danger';
    } else {
        tempStatus.textContent = '✅ Normal';
        tempStatus.className = 'status good';
    }
}

function updatePHStatus(ph) {
    if (ph < 6.5) {
        phStatus.textContent = '⚠️ Acidic';
        phStatus.className = 'status warning';
    } else if (ph > 9.0) {
        phStatus.textContent = '⚠️ Alkaline';
        phStatus.className = 'status warning';
    } else {
        phStatus.textContent = '✅ Normal';
        phStatus.className = 'status good';
    }
}

function updateTDSStatus(tds) {
    if (tds < 100) {
        tdsStatus.textContent = '⚠️ Low';
        tdsStatus.className = 'status warning';
    } else if (tds > 400) {
        tdsStatus.textContent = '⚠️ High';
        tdsStatus.className = 'status warning';
    } else {
        tdsStatus.textContent = '✅ Normal';
        tdsStatus.className = 'status good';
    }
}

function updateSignalStatus(signal) {
    if (signal > -50) {
        signalStatus.textContent = '📶 Excellent';
        signalStatus.className = 'status good';
    } else if (signal > -70) {
        signalStatus.textContent = '📶 Good';
        signalStatus.className = 'status good';
    } else if (signal > -90) {
        signalStatus.textContent = '📶 Fair';
        signalStatus.className = 'status warning';
    } else {
        signalStatus.textContent = '📶 Weak';
        signalStatus.className = 'status danger';
    }
}

// ============================================================
// CONNECTION STATUS
// ============================================================

database.ref('.info/connected').on('value', (snapshot) => {
    const connected = snapshot.val();
    if (connected) {
        console.log('✅ Connected to Firebase');
        document.querySelector('.info p:first-child').style.color = '#4ade80';
    } else {
        console.log('❌ Disconnected from Firebase');
        document.querySelector('.info p:first-child').style.color = '#ff6b35';
    }
});

console.log('📡 Fish Pond Monitor Dashboard Ready');
console.log('🏠 SMART FARM | 2021/1/81764CM');
