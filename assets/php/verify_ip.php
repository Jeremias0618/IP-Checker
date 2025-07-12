<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Función para cargar configuración
function loadConfig() {
    $configFile = '../../config/system_config.json';
    if (file_exists($configFile)) {
        $config = json_decode(file_get_contents($configFile), true);
        return $config ?: getDefaultConfig();
    }
    return getDefaultConfig();
}

// Función para obtener configuración por defecto
function getDefaultConfig() {
    return [
        'accessMode' => 'whitelist',
        'logAttempts' => true,
        'notifications' => true,
        'autoRefresh' => true
    ];
}

// Función para cargar IPs autorizadas
function loadAuthorizedIPs() {
    $ipsFile = '../../config/authorized_ips.json';
    if (file_exists($ipsFile)) {
        $ips = json_decode(file_get_contents($ipsFile), true);
        return is_array($ips) ? $ips : [];
    }
    return [];
}

// Función para registrar acceso
function logAccess($ip, $status, $message) {
    $config = loadConfig();
    if (!$config['logAttempts']) {
        return;
    }
    
    $logEntry = [
        'ip' => $ip,
        'status' => $status,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s'),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
    ];
    
    $logsFile = '../../logs/access_log.json';
    $logs = [];
    
    if (file_exists($logsFile)) {
        $logs = json_decode(file_get_contents($logsFile), true);
        if (!is_array($logs)) {
            $logs = [];
        }
    }
    
    // Agregar nuevo log al inicio
    array_unshift($logs, $logEntry);
    
    // Mantener solo los últimos 1000 logs
    $logs = array_slice($logs, 0, 1000);
    
    // Guardar logs
    file_put_contents($logsFile, json_encode($logs, JSON_PRETTY_PRINT));
}

// Función para validar formato de IP
function isValidIP($ip) {
    return filter_var($ip, FILTER_VALIDATE_IP) !== false;
}

// Función principal de verificación
function verifyIP($ip) {
    if (!isValidIP($ip)) {
        return [
            'success' => false,
            'message' => 'Formato de IP inválido'
        ];
    }
    
    $config = loadConfig();
    $authorizedIPs = loadAuthorizedIPs();
    
    $isAuthorized = in_array($ip, $authorizedIPs);
    
    if ($config['accessMode'] === 'whitelist') {
        if ($isAuthorized) {
            $message = "IP $ip autorizada en lista blanca";
            logAccess($ip, 'allowed', $message);
            return [
                'success' => true,
                'message' => $message,
                'status' => 'allowed'
            ];
        } else {
            $message = "IP $ip no autorizada en lista blanca";
            logAccess($ip, 'denied', $message);
            return [
                'success' => false,
                'message' => $message,
                'status' => 'denied'
            ];
        }
    } else {
        // Modo blacklist
        if ($isAuthorized) {
            $message = "IP $ip bloqueada en lista negra";
            logAccess($ip, 'denied', $message);
            return [
                'success' => false,
                'message' => $message,
                'status' => 'denied'
            ];
        } else {
            $message = "IP $ip permitida (no está en lista negra)";
            logAccess($ip, 'allowed', $message);
            return [
                'success' => true,
                'message' => $message,
                'status' => 'allowed'
            ];
        }
    }
}

// Procesar request
try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!$data) {
            // Intentar con datos POST normales
            $ip = $_POST['ip'] ?? '';
        } else {
            $ip = $data['ip'] ?? '';
        }
        
        if (empty($ip)) {
            throw new Exception('IP no proporcionada');
        }
        
        $result = verifyIP($ip);
        echo json_encode($result);
        
    } else {
        throw new Exception('Método no permitido');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?> 