// ===== CONFIGURACIÓN GLOBAL =====
const APP_CONFIG = {
    API_BASE_URL: window.location.origin,
    IPIFY_URL: 'https://api.ipify.org?format=json',
    IPAPI_URL: 'http://ip-api.com/json/',
    REFRESH_INTERVAL: 30000, // 30 segundos
    TOAST_DURATION: 5000
};

// ===== ESTADO GLOBAL DE LA APLICACIÓN =====
let appState = {
    currentIP: null,
    currentLocation: null,
    isChecking: false,
    authorizedIPs: [],
    systemConfig: {
        accessMode: 'whitelist',
        logAttempts: true,
        notifications: true,
        autoRefresh: true
    },
    logs: [],
    stats: {
        totalIPs: 0,
        totalAccess: 0,
        blockedAccess: 0
    }
};

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 IP Checker Pro iniciando...');
    
    initializeApp();
    setupEventListeners();
    loadSystemConfig();
    loadAuthorizedIPs();
    updateDashboardStats();
    
    // Verificación automática al cargar
    setTimeout(() => {
        checkCurrentIP();
    }, 1000);
});

// ===== FUNCIONES DE INICIALIZACIÓN =====
function initializeApp() {
    // Configurar navegación por tabs
    setupTabNavigation();
    
    // Configurar notificaciones
    setupNotifications();
    
    // Configurar modales
    setupModals();
    
    console.log('✅ Aplicación inicializada correctamente');
}

function setupTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remover clase active de todos los botones y tabs
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Activar botón y tab seleccionado
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            
            // Cargar datos específicos del tab
            loadTabData(targetTab);
        });
    });
}

function loadTabData(tabName) {
    switch(tabName) {
        case 'dashboard':
            updateDashboardStats();
            break;
        case 'configuration':
            loadAuthorizedIPs();
            loadSystemConfig();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
        case 'verification':
            if (!appState.currentIP) {
                checkCurrentIP();
            }
            break;
    }
}

// ===== FUNCIONES DE VERIFICACIÓN DE IP =====
async function checkCurrentIP() {
    if (appState.isChecking) return;
    
    appState.isChecking = true;
    updateIPStatus('checking');
    
    try {
        // Obtener IP pública
        const ipResponse = await fetch(APP_CONFIG.IPIFY_URL);
        const ipData = await ipResponse.json();
        appState.currentIP = ipData.ip;
        
        // Actualizar display de IP
        updateIPDisplay();
        
        // Obtener información de ubicación
        await getIPLocation(appState.currentIP);
        
        // Verificar autorización
        await verifyIPAuthorization(appState.currentIP);
        
        // Actualizar API status
        updateAPIStatus('online');
        
    } catch (error) {
        console.error('❌ Error al verificar IP:', error);
        showNotification('Error al obtener la IP pública', 'error');
        updateIPStatus('error');
        updateAPIStatus('offline');
    } finally {
        appState.isChecking = false;
    }
}

async function getIPLocation(ip) {
    try {
        const response = await fetch(`${APP_CONFIG.IPAPI_URL}${ip}`);
        const locationData = await response.json();
        
        appState.currentLocation = {
            country: locationData.country,
            region: locationData.regionName,
            city: locationData.city,
            isp: locationData.isp
        };
        
        updateLocationDisplay();
        
    } catch (error) {
        console.error('❌ Error al obtener ubicación:', error);
        appState.currentLocation = null;
    }
}

async function verifyIPAuthorization(ip) {
    try {
        const response = await fetch('assets/php/verify_ip.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `ip=${encodeURIComponent(ip)}`
        });
        
        const result = await response.json();
        
        if (result.success) {
            updateIPStatus('allowed', result.message);
            logAccess(ip, 'allowed', result.message);
            showNotification('✅ Acceso permitido', 'success');
        } else {
            updateIPStatus('denied', result.message);
            logAccess(ip, 'denied', result.message);
            showNotification('⛔ Acceso denegado', 'error');
        }
        
    } catch (error) {
        console.error('❌ Error al verificar autorización:', error);
        updateIPStatus('error', 'Error de conexión');
        showNotification('Error al verificar autorización', 'error');
    }
}

// ===== FUNCIONES DE ACTUALIZACIÓN DE UI =====
function updateIPDisplay() {
    const ipElement = document.getElementById('current-ip');
    if (ipElement && appState.currentIP) {
        ipElement.textContent = appState.currentIP;
    }
}

function updateLocationDisplay() {
    const locationElement = document.getElementById('ip-location');
    if (locationElement && appState.currentLocation) {
        const location = appState.currentLocation;
        locationElement.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <span>${location.city}, ${location.region}, ${location.country}</span>
        `;
    }
}

function updateIPStatus(status, message = '') {
    const statusElement = document.getElementById('ip-status');
    if (!statusElement) return;
    
    const indicator = statusElement.querySelector('.status-indicator');
    if (!indicator) return;
    
    // Remover clases anteriores
    indicator.className = 'status-indicator';
    
    switch(status) {
        case 'checking':
            indicator.innerHTML = '<div class="pulse-ring"></div><span>Detectando...</span>';
            break;
        case 'allowed':
            indicator.classList.add('allowed');
            indicator.innerHTML = '<i class="fas fa-check-circle"></i><span>Autorizado</span>';
            break;
        case 'denied':
            indicator.classList.add('denied');
            indicator.innerHTML = '<i class="fas fa-times-circle"></i><span>Denegado</span>';
            break;
        case 'error':
            indicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Error</span>';
            break;
    }
    
    if (message) {
        showNotification(message, status === 'allowed' ? 'success' : 'error');
    }
}

function updateAPIStatus(status) {
    const apiStatusElement = document.getElementById('api-status');
    if (apiStatusElement) {
        apiStatusElement.textContent = status === 'online' ? 'Conectado' : 'Desconectado';
        apiStatusElement.className = `status-value ${status}`;
    }
}

function updateDashboardStats() {
    // Actualizar estadísticas
    document.getElementById('total-ips').textContent = appState.stats.totalIPs;
    document.getElementById('total-access').textContent = appState.stats.totalAccess;
    document.getElementById('blocked-access').textContent = appState.stats.blockedAccess;
    
    // Actualizar actividad reciente
    updateRecentActivity();
}

function updateRecentActivity() {
    const activityContainer = document.getElementById('recent-activity');
    if (!activityContainer) return;
    
    // Simular actividad reciente
    const activities = [
        { text: 'Sistema iniciado', time: 'Hace 2 minutos', icon: 'fas fa-power-off' },
        { text: 'IP verificada', time: 'Hace 5 minutos', icon: 'fas fa-search' },
        { text: 'Configuración actualizada', time: 'Hace 10 minutos', icon: 'fas fa-cog' }
    ];
    
    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

// ===== FUNCIONES DE CONFIGURACIÓN =====
async function loadSystemConfig() {
    try {
        const response = await fetch('assets/php/get_config.php');
        const config = await response.json();
        
        if (config.success) {
            appState.systemConfig = config.data;
            updateConfigUI();
        }
    } catch (error) {
        console.error('❌ Error al cargar configuración:', error);
    }
}

async function saveSystemConfig() {
    try {
        const config = {
            accessMode: document.getElementById('access-mode').value,
            logAttempts: document.getElementById('log-attempts').checked,
            notifications: document.getElementById('notifications').checked,
            autoRefresh: document.getElementById('auto-refresh').checked
        };
        
        const response = await fetch('assets/php/save_config.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });
        
        const result = await response.json();
        
        if (result.success) {
            appState.systemConfig = config;
            showNotification('✅ Configuración guardada', 'success');
        } else {
            showNotification('❌ Error al guardar configuración', 'error');
        }
        
    } catch (error) {
        console.error('❌ Error al guardar configuración:', error);
        showNotification('Error de conexión', 'error');
    }
}

function updateConfigUI() {
    const config = appState.systemConfig;
    
    if (document.getElementById('access-mode')) {
        document.getElementById('access-mode').value = config.accessMode;
    }
    if (document.getElementById('log-attempts')) {
        document.getElementById('log-attempts').checked = config.logAttempts;
    }
    if (document.getElementById('notifications')) {
        document.getElementById('notifications').checked = config.notifications;
    }
    if (document.getElementById('auto-refresh')) {
        document.getElementById('auto-refresh').checked = config.autoRefresh;
    }
}

// ===== FUNCIONES DE GESTIÓN DE IPS =====
async function loadAuthorizedIPs() {
    try {
        const response = await fetch('assets/php/get_ips.php');
        const result = await response.json();
        
        if (result.success) {
            appState.authorizedIPs = result.data;
            appState.stats.totalIPs = result.data.length;
            renderIPList();
            updateDashboardStats();
        }
    } catch (error) {
        console.error('❌ Error al cargar IPs:', error);
    }
}

function renderIPList() {
    const container = document.getElementById('authorized-ips-list');
    if (!container) return;
    
    if (appState.authorizedIPs.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay IPs autorizadas</div>';
        return;
    }
    
    container.innerHTML = appState.authorizedIPs.map(ip => `
        <div class="ip-item" data-ip="${ip}">
            <span class="ip-text">${ip}</span>
            <div class="ip-actions">
                <button class="pro-btn danger btn-sm" onclick="removeIP('${ip}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

async function addIP(ip) {
    if (!isValidIP(ip)) {
        showNotification('❌ Formato de IP inválido', 'error');
        return;
    }
    
    if (appState.authorizedIPs.includes(ip)) {
        showNotification('❌ Esta IP ya está autorizada', 'warning');
        return;
    }
    
    try {
        const response = await fetch('assets/php/add_ip.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ip })
        });
        
        const result = await response.json();
        
        if (result.success) {
            appState.authorizedIPs.push(ip);
            appState.stats.totalIPs = appState.authorizedIPs.length;
            renderIPList();
            updateDashboardStats();
            showNotification('✅ IP agregada correctamente', 'success');
            document.getElementById('new-ip').value = '';
        } else {
            showNotification('❌ Error al agregar IP', 'error');
        }
        
    } catch (error) {
        console.error('❌ Error al agregar IP:', error);
        showNotification('Error de conexión', 'error');
    }
}

async function removeIP(ip) {
    showConfirmModal(
        'Eliminar IP',
        `¿Estás seguro de que deseas eliminar la IP ${ip}?`,
        async () => {
            try {
                const response = await fetch('assets/php/remove_ip.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ip })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    appState.authorizedIPs = appState.authorizedIPs.filter(ipItem => ipItem !== ip);
                    appState.stats.totalIPs = appState.authorizedIPs.length;
                    renderIPList();
                    updateDashboardStats();
                    showNotification('✅ IP eliminada correctamente', 'success');
                } else {
                    showNotification('❌ Error al eliminar IP', 'error');
                }
                
            } catch (error) {
                console.error('❌ Error al eliminar IP:', error);
                showNotification('Error de conexión', 'error');
            }
        }
    );
}

// ===== FUNCIONES DE VERIFICACIÓN MANUAL =====
async function verifyManualIP(ip) {
    if (!isValidIP(ip)) {
        showNotification('❌ Formato de IP inválido', 'error');
        return;
    }
    
    try {
        const response = await fetch('assets/php/verify_ip.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `ip=${encodeURIComponent(ip)}`
        });
        
        const result = await response.json();
        
        const resultContainer = document.getElementById('verification-result');
        if (resultContainer) {
            if (result.success) {
                resultContainer.innerHTML = `
                    <div class="result-success">
                        <i class="fas fa-check-circle"></i>
                        <h4>IP Autorizada</h4>
                        <p>La IP ${ip} está autorizada en el sistema.</p>
                    </div>
                `;
            } else {
                resultContainer.innerHTML = `
                    <div class="result-error">
                        <i class="fas fa-times-circle"></i>
                        <h4>IP No Autorizada</h4>
                        <p>La IP ${ip} no está autorizada en el sistema.</p>
                    </div>
                `;
            }
        }
        
    } catch (error) {
        console.error('❌ Error al verificar IP:', error);
        showNotification('Error al verificar IP', 'error');
    }
}

// ===== FUNCIONES DE ANALYTICS =====
function loadAnalyticsData() {
    // Simular datos de analytics
    const dailyData = [
        { date: '2024-01-01', allowed: 45, denied: 12 },
        { date: '2024-01-02', allowed: 52, denied: 8 },
        { date: '2024-01-03', allowed: 38, denied: 15 },
        { date: '2024-01-04', allowed: 61, denied: 6 },
        { date: '2024-01-05', allowed: 47, denied: 11 }
    ];
    
    const topIPs = [
        { ip: '192.168.1.100', count: 25 },
        { ip: '10.0.0.50', count: 18 },
        { ip: '172.16.0.25', count: 12 },
        { ip: '192.168.1.200', count: 8 },
        { ip: '10.0.0.100', count: 6 }
    ];
    
    renderAnalyticsData(dailyData, topIPs);
}

function renderAnalyticsData(dailyData, topIPs) {
    // Renderizar gráfico de accesos diarios
    const chartContainer = document.getElementById('daily-chart');
    if (chartContainer) {
        chartContainer.innerHTML = `
            <div class="chart-content">
                <div class="chart-bars">
                    ${dailyData.map(day => `
                        <div class="chart-bar">
                            <div class="bar allowed" style="height: ${day.allowed * 2}px"></div>
                            <div class="bar denied" style="height: ${day.denied * 2}px"></div>
                            <span class="bar-label">${day.date.slice(-2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="chart-legend">
                    <span class="legend-item"><span class="legend-color allowed"></span> Permitidos</span>
                    <span class="legend-item"><span class="legend-color denied"></span> Denegados</span>
                </div>
            </div>
        `;
    }
    
    // Renderizar IPs más activas
    const topIPsContainer = document.getElementById('top-ips');
    if (topIPsContainer) {
        topIPsContainer.innerHTML = topIPs.map(item => `
            <div class="top-ip-item">
                <span class="ip-address">${item.ip}</span>
                <span class="ip-count">${item.count} accesos</span>
            </div>
        `).join('');
    }
}

// ===== FUNCIONES UTILITARIAS =====
function isValidIP(ip) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('✅ IP copiada al portapapeles', 'success');
    }).catch(() => {
        showNotification('❌ Error al copiar IP', 'error');
    });
}

// ===== FUNCIONES DE LOGGING =====
function logAccess(ip, status, message) {
    if (!appState.systemConfig.logAttempts) return;
    
    const logEntry = {
        ip,
        status,
        message,
        timestamp: new Date().toISOString()
    };
    
    // Agregar al estado local
    appState.logs.unshift(logEntry);
    
    // Enviar al servidor
    fetch('assets/php/log_access.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(logEntry)
    }).catch(error => {
        console.error('❌ Error al registrar acceso:', error);
    });
}

// ===== CONFIGURACIÓN DE EVENT LISTENERS =====
function setupEventListeners() {
    // Botón de actualizar IP
    const refreshIPBtn = document.getElementById('refresh-ip');
    if (refreshIPBtn) {
        refreshIPBtn.addEventListener('click', checkCurrentIP);
    }
    
    // Botón de copiar IP
    const copyIPBtn = document.getElementById('copy-ip');
    if (copyIPBtn) {
        copyIPBtn.addEventListener('click', () => {
            if (appState.currentIP) {
                copyToClipboard(appState.currentIP);
            }
        });
    }
    
    // Verificación manual de IP
    const verifyBtn = document.getElementById('verify-btn');
    const ipInput = document.getElementById('ip-input');
    
    if (verifyBtn && ipInput) {
        verifyBtn.addEventListener('click', () => {
            const ip = ipInput.value.trim();
            if (ip) {
                verifyManualIP(ip);
            }
        });
        
        ipInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const ip = ipInput.value.trim();
                if (ip) {
                    verifyManualIP(ip);
                }
            }
        });
    }
    
    // Formulario de agregar IP
    const addIPBtn = document.getElementById('add-ip-btn');
    const newIPInput = document.getElementById('new-ip');
    
    if (addIPBtn && newIPInput) {
        addIPBtn.addEventListener('click', () => {
            const ip = newIPInput.value.trim();
            if (ip) {
                addIP(ip);
            }
        });
        
        newIPInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const ip = newIPInput.value.trim();
                if (ip) {
                    addIP(ip);
                }
            }
        });
    }
    
    // Botón de guardar configuración
    const saveConfigBtn = document.getElementById('save-config');
    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', saveSystemConfig);
    }
    
    // Botón de restaurar configuración
    const resetConfigBtn = document.getElementById('reset-config');
    if (resetConfigBtn) {
        resetConfigBtn.addEventListener('click', () => {
            loadSystemConfig();
            showNotification('✅ Configuración restaurada', 'success');
        });
    }
    
    // Filtros de analytics
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', loadAnalyticsData);
    }
}

// ===== FUNCIONES DE SETUP =====
function setupNotifications() {
    // Verificar si el navegador soporta notificaciones
    if (!('Notification' in window)) {
        console.log('Este navegador no soporta notificaciones del sistema');
        return;
    }
    
    // Solicitar permiso si no está concedido
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function setupModals() {
    const modal = document.getElementById('confirm-modal');
    const modalClose = document.getElementById('modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    
    if (modalClose) {
        modalClose.addEventListener('click', hideModal);
    }
    
    if (modalCancel) {
        modalCancel.addEventListener('click', hideModal);
    }
    
    // Cerrar modal al hacer clic fuera
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal();
            }
        });
    }
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal();
        }
    });
}

// ===== EXPORTAR FUNCIONES GLOBALES =====
window.checkCurrentIP = checkCurrentIP;
window.addIP = addIP;
window.removeIP = removeIP;
window.copyToClipboard = copyToClipboard;
window.verifyManualIP = verifyManualIP; 