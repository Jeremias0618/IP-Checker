<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IP Checker Pro - Sistema de Verificación de IP</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
</head>
<body>
    <!-- Canvas para Three.js -->
    <canvas id="bg-canvas"></canvas>
    
    <!-- Overlay de efectos -->
    <div class="effects-overlay">
        <div class="grid-lines"></div>
        <div class="floating-elements">
            <div class="floating-element"></div>
            <div class="floating-element"></div>
            <div class="floating-element"></div>
        </div>
    </div>

    <!-- Contenedor principal -->
    <div class="main-container">
        <!-- Header profesional -->
        <header class="pro-header">
            <div class="header-content">
                <div class="logo-section">
                    <div class="logo-icon">
                        <i class="fas fa-shield-alt"></i>
                        <div class="logo-pulse"></div>
                    </div>
                    <div class="logo-text">
                        <h1>IP CHECKER PRO</h1>
                        <div class="logo-subtitle">Sistema de Verificación Avanzado</div>
                    </div>
                </div>
                
                <nav class="pro-nav">
                    <button class="nav-btn active" data-tab="dashboard">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                    </button>
                    <button class="nav-btn" data-tab="verification">
                        <i class="fas fa-search"></i>
                        <span>Verificación</span>
                    </button>
                    <button class="nav-btn" data-tab="configuration">
                        <i class="fas fa-cog"></i>
                        <span>Configuración</span>
                    </button>
                    <button class="nav-btn" data-tab="analytics">
                        <i class="fas fa-chart-line"></i>
                        <span>Analytics</span>
                    </button>
                </nav>
            </div>
        </header>

        <!-- Contenido principal -->
        <main class="main-content">
            <!-- Dashboard -->
            <div class="tab-content active" id="dashboard-tab">
                <div class="dashboard-grid">
                    <!-- Tarjeta de IP actual -->
                    <div class="pro-card ip-card">
                        <div class="card-header">
                            <h3><i class="fas fa-network-wired"></i> IP Actual</h3>
                            <div class="card-status" id="ip-status">
                                <div class="status-indicator">
                                    <div class="pulse-ring"></div>
                                    <span>Detectando...</span>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="ip-display">
                                <div class="ip-address" id="current-ip">--.---.---.---</div>
                                <div class="ip-location" id="ip-location">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>Cargando ubicación...</span>
                                </div>
                            </div>
                            <div class="ip-actions">
                                <button class="pro-btn primary" id="refresh-ip">
                                    <i class="fas fa-sync-alt"></i>
                                    Actualizar
                                </button>
                                <button class="pro-btn secondary" id="copy-ip">
                                    <i class="fas fa-copy"></i>
                                    Copiar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Tarjeta de estadísticas -->
                    <div class="pro-card stats-card">
                        <div class="card-header">
                            <h3><i class="fas fa-chart-bar"></i> Estadísticas</h3>
                        </div>
                        <div class="card-body">
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-value" id="total-ips">0</div>
                                    <div class="stat-label">IPs Autorizadas</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value" id="total-access">0</div>
                                    <div class="stat-label">Accesos Hoy</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value" id="blocked-access">0</div>
                                    <div class="stat-label">Bloqueados</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tarjeta de estado del sistema -->
                    <div class="pro-card system-card">
                        <div class="card-header">
                            <h3><i class="fas fa-server"></i> Estado del Sistema</h3>
                        </div>
                        <div class="card-body">
                            <div class="system-status">
                                <div class="status-item">
                                    <span class="status-label">Servidor</span>
                                    <span class="status-value online">Online</span>
                                </div>
                                <div class="status-item">
                                    <span class="status-label">Base de Datos</span>
                                    <span class="status-value online">Conectado</span>
                                </div>
                                <div class="status-item">
                                    <span class="status-label">API Externa</span>
                                    <span class="status-value" id="api-status">Verificando...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tarjeta de actividad reciente -->
                    <div class="pro-card activity-card">
                        <div class="card-header">
                            <h3><i class="fas fa-history"></i> Actividad Reciente</h3>
                        </div>
                        <div class="card-body">
                            <div class="activity-list" id="recent-activity">
                                <div class="activity-item">
                                    <div class="activity-icon">
                                        <i class="fas fa-clock"></i>
                                    </div>
                                    <div class="activity-content">
                                        <div class="activity-text">Sistema iniciado</div>
                                        <div class="activity-time">Hace 2 minutos</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Verificación de IP -->
            <div class="tab-content" id="verification-tab">
                <div class="verification-container">
                    <div class="pro-card verification-card">
                        <div class="card-header">
                            <h3><i class="fas fa-search"></i> Verificación de IP</h3>
                            <p>Verifica el estado de autorización de una dirección IP</p>
                        </div>
                        <div class="card-body">
                            <div class="verification-form">
                                <div class="input-group">
                                    <label for="ip-input">Dirección IP</label>
                                    <div class="input-wrapper">
                                        <input type="text" id="ip-input" placeholder="192.168.1.1" class="pro-input">
                                        <button class="pro-btn primary" id="verify-btn">
                                            <i class="fas fa-search"></i>
                                            Verificar
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="verification-result" id="verification-result">
                                    <div class="result-placeholder">
                                        <i class="fas fa-info-circle"></i>
                                        <span>Ingresa una IP para verificar su autorización</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Configuración -->
            <div class="tab-content" id="configuration-tab">
                <div class="config-container">
                    <!-- Configuración de IPs -->
                    <div class="pro-card config-card">
                        <div class="card-header">
                            <h3><i class="fas fa-list"></i> Gestión de IPs</h3>
                            <p>Administra las direcciones IP autorizadas</p>
                        </div>
                        <div class="card-body">
                            <div class="ip-management">
                                <div class="add-ip-section">
                                    <div class="input-group">
                                        <label for="new-ip">Nueva IP</label>
                                        <div class="input-wrapper">
                                            <input type="text" id="new-ip" placeholder="192.168.1.1" class="pro-input">
                                            <button class="pro-btn success" id="add-ip-btn">
                                                <i class="fas fa-plus"></i>
                                                Agregar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="ip-list-section">
                                    <h4>IPs Autorizadas</h4>
                                    <div class="ip-list" id="authorized-ips-list">
                                        <!-- Las IPs se cargarán dinámicamente -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Configuración del sistema -->
                    <div class="pro-card config-card">
                        <div class="card-header">
                            <h3><i class="fas fa-cog"></i> Configuración del Sistema</h3>
                            <p>Ajusta los parámetros del sistema</p>
                        </div>
                        <div class="card-body">
                            <div class="config-grid">
                                <div class="config-item">
                                    <label>Modo de Acceso</label>
                                    <select id="access-mode" class="pro-select">
                                        <option value="whitelist">Lista Blanca</option>
                                        <option value="blacklist">Lista Negra</option>
                                    </select>
                                </div>
                                
                                <div class="config-item">
                                    <label>Registrar Intentos</label>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="log-attempts" checked>
                                        <span class="slider"></span>
                                    </div>
                                </div>
                                
                                <div class="config-item">
                                    <label>Notificaciones</label>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="notifications" checked>
                                        <span class="slider"></span>
                                    </div>
                                </div>
                                
                                <div class="config-item">
                                    <label>Auto-refresh</label>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="auto-refresh" checked>
                                        <span class="slider"></span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="config-actions">
                                <button class="pro-btn primary" id="save-config">
                                    <i class="fas fa-save"></i>
                                    Guardar Configuración
                                </button>
                                <button class="pro-btn secondary" id="reset-config">
                                    <i class="fas fa-undo"></i>
                                    Restaurar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Analytics -->
            <div class="tab-content" id="analytics-tab">
                <div class="analytics-container">
                    <div class="pro-card analytics-card">
                        <div class="card-header">
                            <h3><i class="fas fa-chart-line"></i> Analytics</h3>
                            <p>Análisis detallado de accesos y actividad</p>
                        </div>
                        <div class="card-body">
                            <div class="analytics-grid">
                                <div class="chart-container">
                                    <h4>Accesos por Día</h4>
                                    <div class="chart-placeholder" id="daily-chart">
                                        <i class="fas fa-chart-bar"></i>
                                        <span>Cargando datos...</span>
                                    </div>
                                </div>
                                
                                <div class="chart-container">
                                    <h4>IPs Más Activas</h4>
                                    <div class="top-ips" id="top-ips">
                                        <!-- Se cargará dinámicamente -->
                                    </div>
                                </div>
                            </div>
                            
                            <div class="analytics-filters">
                                <div class="filter-group">
                                    <label>Período</label>
                                    <select id="period-filter" class="pro-select">
                                        <option value="7">Últimos 7 días</option>
                                        <option value="30">Últimos 30 días</option>
                                        <option value="90">Últimos 90 días</option>
                                    </select>
                                </div>
                                
                                <div class="filter-group">
                                    <label>Tipo</label>
                                    <select id="type-filter" class="pro-select">
                                        <option value="all">Todos</option>
                                        <option value="allowed">Permitidos</option>
                                        <option value="denied">Denegados</option>
                                    </select>
                                </div>
                                
                                <button class="pro-btn primary" id="apply-filters">
                                    <i class="fas fa-filter"></i>
                                    Aplicar Filtros
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Modal de confirmación -->
    <div class="modal-overlay" id="confirm-modal">
        <div class="pro-modal">
            <div class="modal-header">
                <h3 id="modal-title">Confirmar Acción</h3>
                <button class="modal-close" id="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p id="modal-message">¿Estás seguro de que deseas realizar esta acción?</p>
            </div>
            <div class="modal-footer">
                <button class="pro-btn secondary" id="modal-cancel">Cancelar</button>
                <button class="pro-btn danger" id="modal-confirm">Confirmar</button>
            </div>
        </div>
    </div>

    <!-- Notificaciones -->
    <div class="notification-container" id="notification-container"></div>

    <!-- Scripts -->
    <script src="assets/js/background.js"></script>
    <script src="assets/js/app.js"></script>
    <script src="assets/js/ui.js"></script>
</body>
</html> 