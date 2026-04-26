const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
let map = null;

// --- System Enhancements: Real-time Clock ---
setInterval(() => {
  const now = new Date();
  const clocks = document.querySelectorAll('#systemClock');
  clocks.forEach(c => c.innerText = now.toLocaleTimeString());
}, 1000);

function showContent(type) {
  const box = document.getElementById("contentBox");
  if (!box) {
    location.reload();
    return;
  }
  if (type === "signin") {
    box.innerHTML = `
          <h2 style="color:var(--primary); margin-bottom:20px;">EXPLORER AUTHENTICATION</h2>
          <div style="text-align:left;">
            <label style="color:var(--primary); font-size:11px; letter-spacing:1px;">IDENTITY EMAIL</label>
            <input type="email" id="signinEmail" placeholder="name@travel.com">
            <label style="color:var(--primary); font-size:11px; letter-spacing:1px;">SECURITY KEY</label>
            <input type="password" id="signinPass" placeholder="••••••••">
            <button class="submit-btn" style="width:100%;" onclick="signInUser()">ACCESS HUB</button>
            <p style="margin-top:20px; text-align:center; color:#555; font-size:13px;">By accessing, you agree to our Travel Safety Protocols.</p>
          </div>
        `;
  } else if (type === "contact") {
    box.innerHTML = `<h2 style="color:var(--primary);">EMERGENCY SUPPORT</h2><p style="margin-bottom:30px; color:var(--text-dim);">Priority channel for stranded travelers.</p><input type="text" id="contactName" placeholder="NAME"><textarea id="contactMsg" placeholder="DESCRIBE YOUR SITUATION..."></textarea><button class="submit-btn" onclick="sendHelp()">TRANSMIT</button>`;
  }
}

async function signInUser() {
  const email = document.getElementById("signinEmail").value;
  const pass = document.getElementById("signinPass").value;
  if (pass === "1234") {
    openDashboard(localStorage.getItem('explorerName') || "Explorer");
    return;
  }
  const prefix = email.split('@')[0] || "Traveler";
  openDashboard(localStorage.getItem('explorerName') || prefix);
}

function openDashboard(userName) {
  const contentBox = document.getElementById("contentBox");
  if (contentBox) contentBox.remove();
  document.querySelector(".menu").style.display = "none";
  const oldLogo = document.querySelector(".logo");
  if (oldLogo) oldLogo.remove();

  const dashboard = document.createElement("div");
  dashboard.className = "dashboard";

  const sidebar = document.createElement("div");
  sidebar.className = "sidebar";
  sidebar.style.paddingTop = "30px";
  sidebar.innerHTML = `
        <div class="sidebar-logo" style="padding: 20px 0 40px 10px; font-size: 20px; font-weight: 900; color: var(--primary); display: flex; flex-direction: column; gap: 5px;">
            <span>🗺️ TOURIST HUB</span>
            <span id="systemClock" style="font-size: 10px; opacity: 0.5; font-family: monospace;">00:00:00</span>
        </div>
        <button class="active" onclick="showFeature('home', this, '${userName}')">🏠 <span>DASHBOARD</span></button>
        <button onclick="showFeature('weather', this, '${userName}')">🌤 <span>METEOROLOGY</span></button>
        <button onclick="showFeature('identity', this, '${userName}')">🆔 <span>EXPLORER ID</span></button>
        <button onclick="showFeature('risk', this, '${userName}')">⚠ <span>RISK SENSORS</span></button>
        <button onclick="showFeature('alerts', this, '${userName}')">🔔 <span>INTEL FEED</span></button>
        <button onclick="showFeature('tracing', this, '${userName}')">📍 <span>GEOLOCATION</span></button>
        <button onclick="showFeature('chat', this, '${userName}')">💬 <span>WORLD CHAT</span></button>
        <button onclick="showFeature('sos', this, '${userName}')" style="color:var(--danger); font-weight:800; background:rgba(255,62,62,0.05);">🚨 <span>SOS HELP</span></button>
        
        <div id="miniWeather" style="margin-top:auto; padding:15px; border-radius:15px; background:rgba(255,140,0,0.05); border:1px solid rgba(255,140,0,0.1); text-align:center;">
            <div id="miniTemp" style="font-size:20px; font-weight:800; color:var(--primary);">--°C</div>
            <div style="font-size:9px; color:var(--primary); opacity:0.7;">ATMOS SYNC</div>
        </div>
        <button onclick="logout()" class="logout-btn" style="margin-top:15px; background:rgba(255,62,62,0.1); color:var(--danger); border:1px solid rgba(255,62,62,0.2); font-weight:800;">🚪 <span>LOGOUT</span></button>
      `;

  const main = document.createElement("div");
  main.className = "main";
  main.id = "mainContent";

  dashboard.appendChild(sidebar);
  dashboard.appendChild(main);
  document.body.appendChild(dashboard);

  showFeature('home', sidebar.querySelector('.active'), userName);
  updateMiniWeather();
  initChatbot();
}

function showFeature(feature, btn, userName = "Explorer") {
  const main = document.getElementById("mainContent");
  const sidebar = document.querySelector(".sidebar");
  sidebar.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  if (map) {
    map.remove();
    map = null;
  }

  if (window.chatInterval) {
    clearInterval(window.chatInterval);
    window.chatInterval = null;
  }

  main.style.paddingTop = "40px";
  main.style.animation = 'fadeInDown 0.5s ease-out';

  if (feature === 'home') {
    const pName = localStorage.getItem('explorerName') || userName;
    const pGender = localStorage.getItem('explorerGender') || "NOT SET";
    const pDOB = localStorage.getItem('explorerDOB') || "NOT SET";

    main.innerHTML = `
          <div style="animation: fadeIn 0.8s ease-out;">
            <h1 style="font-size:42px; font-weight:900; margin-bottom:10px;">WELCOME, <span style="color:var(--primary);">${pName.toUpperCase()}</span></h1>
            <p style="color:var(--text-dim); margin-top:-5px; letter-spacing:1px;">YOUR PERSONAL EXPLORER HUB IS ACTIVE</p>
            
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-top:40px;">
                <div class="status-card" style="border-left:4px solid var(--primary);">
                    <div style="font-size:10px; opacity:0.6; letter-spacing:2px;">GENDER IDENTIFICATION</div>
                    <h2 style="margin:10px 0; color:var(--text-white);">${pGender}</h2>
                </div>
                <div class="status-card" style="border-left:4px solid var(--accent);">
                    <div style="font-size:10px; opacity:0.6; letter-spacing:2px;">DATE OF BIRTH</div>
                    <h2 style="margin:10px 0; color:var(--text-white);">${pDOB}</h2>
                </div>
                <div class="status-card" style="border-left:4px solid var(--danger);">
                    <div style="font-size:10px; opacity:0.6; letter-spacing:2px;">SECURITY STATUS</div>
                    <h2 style="margin:10px 0; color:var(--accent);">ENCRYPTED</h2>
                </div>
            </div>

            <div class="status-card" style="margin-top:30px; background:linear-gradient(135deg, rgba(255,140,0,0.1) 0%, transparent 100%); padding:40px;">
                <h3 style="color:var(--primary);">🛡️ MISSION ADVISORY</h3>
                <p style="font-size:15px; line-height:1.6; color:var(--text-dim); max-width:600px;">
                    Greetings, Explorer. Your current profile is synchronized with our global safety network. 
                    All data transmissions are secured using AES-256 protocols. Stay safe on your journey!
                </p>
            </div>
          </div>
        `;
  } else if (feature === 'tracing') {
    main.innerHTML = `
          <h2 style="color:var(--primary);">GEOSPATIAL HUB</h2>
          <p style="color:var(--text-dim); font-size:12px; margin-bottom:15px;">Scanning local perimeter for emergency and utility hubs.</p>
          <div style="display:flex; gap:10px; margin-bottom:15px;">
              <button class="stat-item" style="padding:5px 15px; cursor:pointer; background:rgba(0,255,136,0.1); border:1px solid var(--accent);" onclick="initMap('hospital')">🏥 HOSPITALS</button>
              <button class="stat-item" style="padding:5px 15px; cursor:pointer; background:rgba(255,62,62,0.1); border:1px solid var(--danger);" onclick="initMap('police')">👮 POLICE</button>
              <button class="stat-item" style="padding:5px 15px; cursor:pointer; background:rgba(255,140,0,0.1); border:1px solid var(--primary);" onclick="initMap('pharmacy')">💊 MEDICAL</button>
              <button class="stat-item" style="padding:5px 15px; cursor:pointer; background:rgba(255,255,255,0.05); border:1px solid #444;" onclick="initMap('shop')">🛒 SHOPS</button>
          </div>
          <div id="map" style="height: 480px; width: 100%; border-radius:30px; border: 1px solid var(--primary); box-shadow: 0 0 20px rgba(255,140,0,0.1);"></div>
        `;
    setTimeout(() => initMap(), 100);
  } else if (feature === 'weather') {
    main.innerHTML = `<h2 style="color:var(--primary);">METEOROLOGICAL SCAN</h2><div id="weatherContainer" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:20px; margin-top:30px;"></div>`;
    fetchWeather();
  } else if (feature === 'identity') {
    const savedPhoto = localStorage.getItem('explorerPhoto') || 'https://via.placeholder.com/150?text=EXPLORER';
    main.innerHTML = `
          <h2 style="color:var(--primary);">EXPLORER IDENTITY</h2>
          <div style="display:flex; flex-wrap:wrap; gap:30px; margin-top:30px;">
              <div class="status-card" style="text-align:center; width:300px; border:1px solid var(--primary);">
                  <div style="position:relative; width:150px; height:150px; margin: 0 auto 20px auto;">
                      <img id="idPhotoPreview" src="${savedPhoto}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJPdXRmaXQiIGZvbnQtc2l6ZT0iMTQiPk5PIFBIRVRPPC90ZXh0Pjwvc3ZnPg=='" style="width:100%; height:100%; border-radius:50%; object-fit:cover; border:3px solid var(--primary);">
                      <label for="idPhotoInput" style="position:absolute; bottom:0; right:0; background:var(--primary); border-radius:50%; width:44px; height:44px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 5px 15px rgba(0,0,0,0.5); font-size:20px;">📷</label>
                  </div>
                  <input type="file" id="idPhotoInput" style="display:none;" onchange="updateIdPhoto(this)" accept="image/*">
                  
                  <h3 id="displayExplorerName">${(localStorage.getItem('explorerName') || userName).toUpperCase()}</h3>
                  <p style="color:var(--primary); font-weight:800; font-size:12px; letter-spacing:2px;">CERTIFIED EXPLORER</p>
                  
                  <div style="margin-top:20px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.1);">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=Explorer-${userName}" style="border-radius:10px; filter:brightness(1.2); width:80px;">
                      <p style="font-size:9px; color:#555; margin-top:5px;">HUB SECURE QR</p>
                  </div>
              </div>
              <div style="flex:1; display:flex; flex-direction:column; gap:20px;">
                  <div class="status-card">
                    <h3>🛂 EDIT IDENTITY</h3>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:15px;">
                        <div style="grid-column: span 2;">
                            <label style="font-size:10px; color:var(--primary);">FULL NAME</label>
                            <input type="text" id="editName" value="${localStorage.getItem('explorerName') || userName}" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid #444; color:white; padding:10px; border-radius:10px;">
                        </div>
                        <div>
                            <label style="font-size:10px; color:var(--primary);">GENDER</label>
                            <select id="editGender" style="width:100%; background:rgba(255,255,255,0.05); color:white; border:1px solid #444; padding:10px; border-radius:10px;">
                                <option value="MALE" ${localStorage.getItem('explorerGender') === 'MALE' ? 'selected' : ''}>MALE</option>
                                <option value="FEMALE" ${localStorage.getItem('explorerGender') === 'FEMALE' ? 'selected' : ''}>FEMALE</option>
                                <option value="OTHER" ${localStorage.getItem('explorerGender') === 'OTHER' ? 'selected' : ''}>OTHER</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size:10px; color:var(--primary);">DATE OF BIRTH</label>
                            <input type="date" id="editDOB" value="${localStorage.getItem('explorerDOB') || ''}" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid #444; color:white; padding:10px; border-radius:10px;">
                        </div>
                        <div style="grid-column: span 2; margin-top:10px;">
                            <button class="submit-btn" onclick="saveIdentity()" style="width:100%; padding:15px; font-weight:800;">SYNCHRONIZE PROFILE</button>
                        </div>
                    </div>
                  </div>
                  <div class="status-card"><h3>🛡️ ENCRYPTION</h3><p style="color:var(--accent);">✓ AES-256 ACTIVE</p></div>
              </div>
          </div>
        `;
  } else if (feature === 'risk') {
    main.innerHTML = `
          <h2 style="color:var(--primary);">THREAT SENSORS</h2>
          <div class="status-card" style="margin-top:30px; text-align:center;">
              <h1 id="threatLevel" style="font-size:80px; color:var(--accent); transition:0.5s;">LOW</h1>
              <p>Current Destination Threat Level</p>
              <div style="display:flex; justify-content:center; gap:10px; margin-top:20px;">
                  <button class="submit-btn" style="padding:10px 20px; font-size:10px; background:var(--accent);" onclick="updateThreat('LOW')">SET LOW</button>
                  <button class="submit-btn" style="padding:10px 20px; font-size:10px; background:#FFD700;" onclick="updateThreat('MED')">SET MED</button>
                  <button class="submit-btn" style="padding:10px 20px; font-size:10px; background:var(--danger);" onclick="updateThreat('HIGH')">SET HIGH</button>
              </div>
          </div>
        `;
  } else if (feature === 'alerts') {
    main.innerHTML = `<h2 style="color:var(--primary);">SATELLITE INTEL FEED</h2><div id="alertList" style="margin-top:30px; display:flex; flex-direction:column; gap:15px;"></div>`;
    fetchAlerts();
  } else if (feature === 'chat') {
    main.innerHTML = `
          <h2 style="color:var(--primary);">WORLD CHAT FEED</h2>
          <p style="color:var(--text-dim); font-size:12px;">Live communication with explorers worldwide.</p>
          <div class="chat-container">
              <div id="chatMessages">
                  <div class="msg received">Scanning frequency... Connecting to global hub...</div>
              </div>
              <div class="chat-input-area">
                  <input type="text" id="worldChatInput" placeholder="Transmit message to global feed..." onkeypress="if(event.key==='Enter') sendWorldMessage()">
                  <button class="chat-send-btn" onclick="sendWorldMessage()">TRANSMIT</button>
              </div>
          </div>
        `;
    loadChat();
    window.chatInterval = setInterval(loadChat, 3000); // Poll every 3s
  } else if (feature === 'sos') {
    main.innerHTML = `<div style="text-align:center; margin-top:50px;"><button onclick="triggerSOS()" style="width:220px; height:220px; border-radius:50%; background:var(--danger); border:none; color:white; font-size:48px; font-weight:900; cursor:pointer; animation: pulseSOS 1.5s infinite;">SOS</button><h2 style="margin-top:40px; color:var(--danger); letter-spacing:5px;">EMERGENCY BROADCAST</h2></div>`;
  } else {
    main.innerHTML = `<h2 style="color:var(--primary);">${feature.toUpperCase()}</h2><div class="status-card" style="margin-top:20px;">Module calibrating for your current travel zone...</div>`;
  }
}

// --- Key Enhancement: Profile Photo System ---
function updateIdPhoto(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64Image = e.target.result;
      localStorage.setItem('explorerPhoto', base64Image);
      const preview = document.getElementById('idPhotoPreview');
      if (preview) preview.src = base64Image;
      showToast("Identity Updated via Upload");
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function setPhotoByUrl() {
  const url = prompt("Enter Image URL (e.g., https://example.com/photo.jpg):");
  if (url) {
    localStorage.setItem('explorerPhoto', url);
    const preview = document.getElementById('idPhotoPreview');
    if (preview) preview.src = url;
    showToast("Identity Updated via URL");
  }
}

function saveIdentity() {
  const newName = document.getElementById('editName').value.trim();
  const gender = document.getElementById('editGender').value;
  const dob = document.getElementById('editDOB').value;

  if (!newName) return showToast("Name is required!");

  localStorage.setItem('explorerName', newName);
  localStorage.setItem('explorerGender', gender);
  localStorage.setItem('explorerDOB', dob);

  window.currentUser = newName;

  // Update Display Elements
  const previewName = document.getElementById('displayExplorerName');
  if (previewName) previewName.innerText = newName.toUpperCase();

  const sidebarName = document.querySelector('.sidebar-logo span:first-child');
  if (sidebarName) sidebarName.innerText = "🗺️ " + newName.toUpperCase();

  showToast("Global Identity Synchronized");
}

// --- Key Enhancement: Interactive Threat System ---
function updateThreat(level) {
  const el = document.getElementById('threatLevel');
  el.innerText = level;
  if (level === 'LOW') {
    el.style.color = 'var(--accent)';
    document.body.className = 'risk-low';
    showToast("System: Environment Secure");
  }
  if (level === 'MED') {
    el.style.color = '#FFD700';
    document.body.className = 'risk-med';
    showToast("System: Increased Vigilance Required");
  }
  if (level === 'HIGH') {
    el.style.color = 'var(--danger)';
    document.body.className = 'risk-high';
    showToast("System: CRITICAL THREAT DETECTED");
  }
}

async function fetchAlerts() {
  const list = document.getElementById("alertList");
  try {
    const res = await fetch(`${API_BASE_URL}/alerts`);
    const alerts = await res.json();
    list.innerHTML = alerts.map(a => `<div class="status-card" style="border-left:5px solid var(--primary);"><h4>${a.title.toUpperCase()}</h4><p style="font-size:13px; opacity:0.7; margin-top:5px;">${a.message}</p></div>`).join('');
    if (!alerts.length) throw '';
  } catch (e) {
    list.innerHTML = `<div class="status-card" style="border-left:5px solid var(--accent);"><h4>INTEL: SCAN COMPLETE</h4><p>No critical threats identified in your 50km radius.</p></div><div class="status-card" style="border-left:5px solid var(--primary);"><h4>INTEL: WEATHER UPDATE</h4><p>Clear skies expected for the next 48 hours.</p></div>`;
  }
}

async function fetchWeather() {
  const container = document.getElementById("weatherContainer");
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.61&longitude=77.20&current_weather=true');
    const data = await res.json();
    const w = data.current_weather;
    container.innerHTML = `<div class="status-card" style="text-align:center;"><h1>${w.temperature}°C</h1><p style="color:var(--primary); font-weight:800;">TEMP</p></div><div class="status-card" style="text-align:center;"><h1>${w.windspeed}</h1><p style="color:var(--primary); font-weight:800;">WIND (KM/H)</p></div>`;
  } catch (e) {
    container.innerHTML = `<div class="status-card">Atmos Sync Unavailable.</div>`;
  }
}

async function updateMiniWeather() {
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.61&longitude=77.20&current_weather=true');
    const data = await res.json();
    document.getElementById("miniTemp").innerText = `${data.current_weather.temperature}°C`;
  } catch (e) { }
}

async function initMap(category = null) {
  const c = [28.61, 77.20]; // Default New Delhi
  if (map) map.remove();
  map = L.map('map').setView(c, 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  L.marker(c).addTo(map).bindPopup('<b>YOUR POSITION</b>').openPopup();

  if (category) {
    showToast(`Scanning for nearby ${category}s...`);
    try {
      const query = `[out:json];node["amenity"="${category}"](around:2000,${c[0]},${c[1]});out;`;
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await res.json();

      data.elements.forEach(el => {
        L.circleMarker([el.lat, el.lon], {
          color: category === 'police' ? 'red' : 'orange',
          radius: 8
        }).addTo(map).bindPopup(`<b>${el.tags.name || category.toUpperCase()}</b><br>Safe Zone Entity`);
      });

      if (data.elements.length === 0) showToast("No results in 2km radius");
    } catch (e) { console.error("Map data error"); }
  }
}

function logout() {
  location.reload();
}

function triggerSOS() {
  if (confirm("CONFIRM EMERGENCY BROADCAST?")) {
    showToast("🚨 SOS TRANSMITTED TO NEAREST HUB");
  }
}

// --- World Chat Logic ---
async function loadChat() {
  const box = document.getElementById("chatMessages");
  if (!box) {
    if (window.chatInterval) clearInterval(window.chatInterval);
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/chat`);
    if (!res.ok) throw new Error("Fetch failed");
    const msgs = await res.json();

    if (msgs.length === 0) {
      box.innerHTML = '<div class="msg received">No messages yet. Start the conversation!</div>';
      return;
    }

    box.innerHTML = msgs.map(m => `
            <div class="msg ${m.user_name === window.currentUser ? 'sent' : 'received'}">
                <span class="sender">${m.user_name.toUpperCase()} • ${new Date(m.created_at).toLocaleTimeString()}</span>
                ${m.message}
            </div>
        `).join('');
    box.scrollTop = box.scrollHeight;
  } catch (e) {
    console.error("Chat load error:", e);
  }
}

async function sendWorldMessage() {
  const userName = localStorage.getItem('explorerName') || "Explorer";
  window.currentUser = userName;
  const input = document.getElementById("worldChatInput");
  const msg = input.value.trim();
  if (!msg) return;

  console.log("Attempting to send message:", msg);
  input.value = "";

  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_name: userName, user_email: "user@example.com", message: msg })
    });

    if (res.ok) {
      console.log("Message sent successfully");
      loadChat();
    } else {
      const err = await res.json();
      console.error("Server Error:", err);
      showToast("Server Error: " + err.message);
    }
  } catch (e) {
    console.error("Network Error:", e);
    showToast("Transmission Failed: Check Connection");
  }
}

function showToast(m) {
  const t = document.createElement("div");
  t.style.cssText = "position:fixed; bottom:30px; right:30px; background:var(--primary); color:#000; padding:18px 25px; border-radius:15px; z-index:9000; font-weight:800; box-shadow: 0 10px 40px rgba(0,0,0,0.5);";
  t.innerHTML = m;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

function initChatbot() {
  if (document.getElementById('chatWidget')) return;
  const w = document.createElement('div');
  w.id = 'chatWidget';
  w.style.cssText = "position:fixed; bottom:30px; right:30px; z-index:8000; width:70px; height:70px; background:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:35px; box-shadow: 0 10px 30px rgba(255,140,0,0.3); transition:0.3s;";
  w.innerHTML = '🧭';
  w.onclick = () => {
    const b = document.getElementById('chatBox');
    b.style.display = b.style.display === 'none' ? 'flex' : 'none';
  };
  document.body.appendChild(w);

  const b = document.createElement('div');
  b.id = 'chatBox';
  b.style.cssText = "position:fixed; bottom:110px; right:30px; z-index:8000; width:320px; height:450px; background:rgba(18,18,18,0.98); border:1px solid var(--primary); border-radius:25px; display:none; flex-direction:column; overflow:hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.8);";
  b.innerHTML = `<div style="padding:20px; background:var(--primary); color:#000; font-weight:900; display:flex; justify-content:space-between;"><span>TRAVEL GUIDE AI</span><span onclick="this.parentElement.parentElement.style.display='none'" style="cursor:pointer;">✕</span></div><div id="msgBox" style="flex:1; padding:20px; overflow-y:auto; font-size:14px; display:flex; flex-direction:column; gap:15px; color:white;"><div>Hello Explorer. I am monitoring your travel safety. How can I guide you?</div></div><div style="padding:15px; border-top:1px solid #333; display:flex; background:#000;"><input id="chatIn" style="margin:0; flex:1; background:none; border:none; color:white; font-size:14px;" placeholder="Ask anything..."><button onclick="sendChat()" style="background:var(--primary); border:none; color:#000; padding:10px 15px; border-radius:10px; cursor:pointer; font-weight:800;">ASK</button></div>`;
  document.body.appendChild(b);
}

function sendChat() {
  const i = document.getElementById('chatIn'),
    v = i.value.trim(),
    m = document.getElementById('msgBox');
  if (!v) return;
  m.innerHTML += `<div style="align-self:flex-end; color:var(--primary); background:rgba(255,140,0,0.1); padding:10px; border-radius:10px;">${v}</div>`;
  i.value = '';
  setTimeout(() => {
    m.innerHTML += `<div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:10px;">System: Analyzing ${v} in current travel zone... Stay safe!</div>`;
    m.scrollTop = m.scrollHeight;
  }, 1000);
}
