// ============================================================
// FISH POND MONITOR - Firebase Integration
// SMART FARM | 2021/1/81764CM
// ============================================================

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

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM Elements
const tempEl = document.getElementById('temperature');
const phEl = document.getElementById('ph');
const tdsEl = document.getElementById('tds');
const signalEl = document.getElementById('signal');
const timestampEl = document.getElementById('timestamp');
const packetsEl = document.getElementById('packets');
const historyBody = document.getElementById('historyBody');
const historyCount = document.getElementById('historyCount');

const tempStatus = document.getElementById('tempStatus');
const phStatus = document.getElementById('phStatus');
const tdsStatus = document.getElementById('tdsStatus');
const signalStatus = document.getElementById('signalStatus');

let packetCount = 0;

// ============================================================
// READ LATEST DATA
// ============================================================

database.ref('/latest').on('value', (snapshot) => {
    const data = snapshot.val();
    
    if (data) {
        if (data.temperature !== undefined && data.temperature !== null) {
            tempEl.textContent = data.temperature.toFixed(1);
            updateTemperatureStatus(data.temperature);
        }
        
        if (data.ph !== undefined && data.ph !== null) {
            phEl.textContent = data.ph.toFixed(2);
            updatePHStatus(data.ph);
        }
        
        if (data.tds !== undefined && data.tds !== null) {
            tdsEl.textContent = data.tds.toFixed(0);
            updateTDSStatus(data.tds);
        }
        
        if (data.signal !== undefined && data.signal !== null) {
            signalEl.textContent = data.signal;
            updateSignalStatus(data.signal);
        }
        
        if (data.timestamp !== undefined && data.timestamp !== null) {
            timestampEl.textContent = data.timestamp;
        }
        
        if (data.timestamp) {
            packetCount++;
            packetsEl.textContent = packetCount;
        }
    }
});

// ============================================================
// READ HISTORY DATA - FILTERED FOR VALID TIMESTAMPS
// ============================================================

database.ref('/history').on('value', (snapshot) => {
    const data = snapshot.val();
    
    console.log('📜 All History Data:', data);
    
    if (data) {
        // Convert object to array
        const allEntries = Object.keys(data).map(key => ({
            key: key,
            ...data[key]
        }));
        
        console.log('📜 Total entries:', allEntries.length);
        
        // FILTER: Only keep entries with valid timestamps (contain "-" or ":" )
        const validEntries = allEntries.filter(entry => {
            const ts = entry.timestamp;
            // Keep entries where timestamp is a string and contains "-" or ":"
            if (typeof ts === 'string') {
                return ts.includes('-') || ts.includes(':');
            }
            // Also keep entries with numeric timestamps if they look like real time
            if (typeof ts === 'number' && ts > 1000000000) {
                return true;
            }
            return false;
        });
        
        console.log('📜 Valid entries (with proper time):', validEntries.length);
        
        // Sort by timestamp (newest first)
        validEntries.sort((a, b) => {
            // Try to parse timestamps
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeB - timeA;
        });
        
        // Get last 10
        const last10 = validEntries.slice(0, 10);
        
        console.log('📜 Last 10 valid entries:', last10);
        
        historyCount.textContent = last10.length;
        historyBody.innerHTML = '';
        
        if (last10.length === 0) {
            historyBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding: 20px; color: #8a9aa8;">
                        📭 No history data yet
                    </td>
                </tr>
            `;
            return;
        }
        
        last10.forEach((entry, index) => {
            const row = document.createElement('tr');
            
            const numCell = document.createElement('td');
            numCell.textContent = index + 1;
            row.appendChild(numCell);
            
            const tempCell = document.createElement('td');
            tempCell.textContent = entry.temperature !== undefined ? entry.temperature.toFixed(1) + '°C' : '--';
            row.appendChild(tempCell);
            
            const phCell = document.createElement('td');
            phCell.textContent = entry.ph !== undefined ? entry.ph.toFixed(2) : '--';
            row.appendChild(phCell);
            
            const tdsCell = document.createElement('td');
            tdsCell.textContent = entry.tds !== undefined ? entry.tds.toFixed(0) + ' ppm' : '--';
            row.appendChild(tdsCell);
            
            const timeCell = document.createElement('td');
            if (entry.timestamp) {
                const full = entry.timestamp;
                if (typeof full === 'string') {
                    // If it contains a date, extract just the time
                    if (full.includes(' ')) {
                        const parts = full.split(' ');
                        timeCell.textContent = parts[parts.length - 1];
                    } else {
                        timeCell.textContent = full;
                    }
                } else {
                    timeCell.textContent = String(full);
                }
            } else {
                timeCell.textContent = '--';
            }
            row.appendChild(timeCell);
            
            historyBody.appendChild(row);
        });
    } else {
        console.log('📜 No history data found');
        historyBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 20px; color: #8a9aa8;">
                    📭 No history data yet
                </td>
            </tr>
        `;
        historyCount.textContent = '0';
    }
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

console.log('📡 SMART FARM Dashboard Ready');
console.log('📍 Firebase URL:', firebaseConfig.databaseURL);
