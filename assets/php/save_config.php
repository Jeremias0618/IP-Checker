<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Función para validar configuración
function validateConfig($config) {
    $requiredFields = ['accessMode', 'logAttempts', 'notifications', 'autoRefresh'];
    
    foreach ($requiredFields as $field) {
        if (!isset($config[$field])) {
            return false;
        }
    }
    
    // Validar accessMode
    if (!in_array($config['accessMode'], ['whitelist', 'blacklist'])) {
        return false;
    }
    
    // Validar campos booleanos
    if (!is_bool($config['logAttempts']) && !is_bool($config['notifications']) && !is_bool($config['autoRefresh'])) {
        return false;
    }
    
    return true;
}

// Función para guardar configuración
function saveConfig($config) {
    $configFile = '../../config/system_config.json';
    
    // Crear directorio si no existe
    if (!is_dir(dirname($configFile))) {
        mkdir(dirname($configFile), 0755, true);
    }
    
    // Guardar configuración
    $result = file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT));
    
    if ($result === false) {
        throw new Exception('Error al guardar configuración');
    }
    
    return true;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = file_get_contents('php://input');
        $config = json_decode($input, true);
        
        if (!$config) {
            throw new Exception('Datos de configuración inválidos');
        }
        
        // Validar configuración
        if (!validateConfig($config)) {
            throw new Exception('Configuración inválida');
        }
        
        // Guardar configuración
        saveConfig($config);
        
        echo json_encode([
            'success' => true,
            'message' => 'Configuración guardada correctamente'
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