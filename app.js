// ============================================================
// FISH POND MONITOR - Firebase Integration with HISTORY
// SMART FARM | 2021/1/81764CM
// ============================================================

// Your Firebase config
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

// ============================================================
// DOM ELEMENTS
// ============================================================

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
// READ LATEST DATA FROM FIREBASE
// ============================================================

const latestRef = database.ref('/latest');

latestRef.on('value', (snapshot) => {
    const data = snapshot.val();
    
    if (data) {
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
            timestampEl.textContent = data.timestamp;
        }
        
        packetsEl.textContent = packetCount;
    }
}, (error) => {
    console.error('Firebase read error:', error);
});

// ============================================================
// READ HISTORY DATA (LAST 10 ENTRIES)
// ============================================================

const historyRef = database.ref('/history');

historyRef.on('value', (snapshot) => {
    const data = snapshot.val();
    
    console.log('History data received:', data);  // Debug log
    
    if (data) {
        // Convert object to array of entries
        const entries = Object.keys(data).map(key => {
            return {
                key: key,
                ...data[key]
            };
        });
        
        console.log('Entries:', entries);  // Debug log
        
        // Sort by timestamp (newest first)
        entries.sort((a, b) => {
            // If timestamp exists, use it
            if (a.timestamp && b.timestamp) {
                return b.timestamp.localeCompare(a.timestamp);
            }
            // Fallback to key sort
            return b.key.localeCompare(a.key);
        });
        
        // Get last 10 entries
        const last10 = entries.slice(0, 10);
        
        console.log('Last 10:', last10);  // Debug log
        
        // Update history count
        historyCount.textContent = last10.length;
        
        // Clear table
        historyBody.innerHTML = '';
        
        if (last10.length === 0) {
            historyBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; color: #8a9aa8; padding: 20px;">
                        📭 No history data yet. Waiting for first reading...
                    </td>
                </tr>
            `;
            return;
        }
        
        // Add each entry to table
        last10.forEach((entry, index) => {
            const row = document.createElement('tr');
            
            // Entry number
            const numCell = document.createElement('td');
            numCell.textContent = index + 1;
            row.appendChild(numCell);
            
            // Temperature
            const tempCell = document.createElement('td');
            tempCell.textContent = entry.temperature !== undefined ? entry.temperature.toFixed(1) + '°C' : '--';
            row.appendChild(tempCell);
            
            // pH
            const phCell = document.createElement('td');
            phCell.textContent = entry.ph !== undefined ? entry.ph.toFixed(2) : '--';
            row.appendChild(phCell);
            
            // TDS
            const tdsCell = document.createElement('td');
            tdsCell.textContent = entry.tds !== undefined ? entry.tds.toFixed(0) + ' ppm' : '--';
            row.appendChild(tdsCell);
            
            // Time
            const timeCell = document.createElement('td');
            if (entry.timestamp) {
                // Show only time part if date is today, otherwise show full
                const fullTime = entry.timestamp;
                // Check if it contains a date
                if (fullTime.includes(' ')) {
                    const parts = fullTime.split(' ');
                    if (parts.length >= 2) {
                        // Show only time (HH:MM:SS)
                        timeCell.textContent = parts[1];
                    } else {
                        timeCell.textContent = fullTime;
                    }
                } else {
                    timeCell.textContent = fullTime;
                }
            } else {
                timeCell.textContent = '--';
            }
            row.appendChild(timeCell);
            
            historyBody.appendChild(row);
        });
    } else {
        historyBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; color: #8a9aa8; padding: 20px;">
                    📭 No history data yet. Waiting for first reading...
                </td>
            </tr>
        `;
        historyCount.textContent = '0';
    }
}, (error) => {
    console.error('History read error:', error);
    historyBody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center; color: #ff6b35; padding: 20px;">
                ❌ Error loading history. Check Firebase.
            </td>
        </tr>
    `;
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
    } else {
        console.log('❌ Disconnected from Firebase');
    }
});

console.log('📡 Fish Pond Monitor Dashboard Ready');
console.log('🏠 SMART FARM | 2021/1/81764CM');
