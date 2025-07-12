<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
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

// Función para cargar configuración
function loadConfig() {
    $configFile = '../../config/system_config.json';
    
    if (file_exists($configFile)) {
        $config = json_decode(file_get_contents($configFile), true);
        return $config ?: getDefaultConfig();
    }
    
    // Si no existe, crear configuración por defecto
    $defaultConfig = getDefaultConfig();
    
    // Crear directorio si no existe
    if (!is_dir(dirname($configFile))) {
        mkdir(dirname($configFile), 0755, true);
    }
    
    // Guardar configuración por defecto
    file_put_contents($configFile, json_encode($defaultConfig, JSON_PRETTY_PRINT));
    
    return $defaultConfig;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $config = loadConfig();
        
        echo json_encode([
            'success' => true,
            'data' => $config
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