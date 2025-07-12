<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Función para cargar IPs autorizadas
function loadAuthorizedIPs() {
    $ipsFile = '../../config/authorized_ips.json';
    
    if (file_exists($ipsFile)) {
        $ips = json_decode(file_get_contents($ipsFile), true);
        return is_array($ips) ? $ips : [];
    }
    
    // Si no existe, crear archivo con IPs por defecto
    $defaultIPs = [
        '127.0.0.1',
        '::1'
    ];
    
    // Crear directorio si no existe
    if (!is_dir(dirname($ipsFile))) {
        mkdir(dirname($ipsFile), 0755, true);
    }
    
    // Guardar IPs por defecto
    file_put_contents($ipsFile, json_encode($defaultIPs, JSON_PRETTY_PRINT));
    
    return $defaultIPs;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $ips = loadAuthorizedIPs();
        
        echo json_encode([
            'success' => true,
            'data' => $ips,
            'count' => count($ips)
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