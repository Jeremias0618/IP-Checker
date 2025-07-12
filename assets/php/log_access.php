<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Función para registrar acceso
function logAccess($logEntry) {
    $logsFile = '../../logs/access_log.json';
    
    // Crear directorio si no existe
    if (!is_dir(dirname($logsFile))) {
        mkdir(dirname($logsFile), 0755, true);
    }
    
    // Cargar logs existentes
    $logs = [];
    if (file_exists($logsFile)) {
        $logs = json_decode(file_get_contents($logsFile), true);
        if (!is_array($logs)) {
            $logs = [];
        }
    }
    
    // Agregar timestamp si no existe
    if (!isset($logEntry['timestamp'])) {
        $logEntry['timestamp'] = date('Y-m-d H:i:s');
    }
    
    // Agregar información adicional
    $logEntry['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    $logEntry['remote_ip'] = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    
    // Agregar nuevo log al inicio
    array_unshift($logs, $logEntry);
    
    // Mantener solo los últimos 1000 logs
    $logs = array_slice($logs, 0, 1000);
    
    // Guardar logs
    $result = file_put_contents($logsFile, json_encode($logs, JSON_PRETTY_PRINT));
    
    if ($result === false) {
        throw new Exception('Error al guardar logs');
    }
    
    return true;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = file_get_contents('php://input');
        $logEntry = json_decode($input, true);
        
        if (!$logEntry) {
            throw new Exception('Datos de log inválidos');
        }
        
        // Validar campos requeridos
        if (!isset($logEntry['ip']) || !isset($logEntry['status']) || !isset($logEntry['message'])) {
            throw new Exception('Campos requeridos faltantes');
        }
        
        // Registrar acceso
        logAccess($logEntry);
        
        echo json_encode([
            'success' => true,
            'message' => 'Acceso registrado correctamente'
        ]);
        
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