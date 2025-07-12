<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Función para validar formato de IP
function isValidIP($ip) {
    return filter_var($ip, FILTER_VALIDATE_IP) !== false;
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

// Función para guardar IPs autorizadas
function saveAuthorizedIPs($ips) {
    $ipsFile = '../../config/authorized_ips.json';
    
    // Crear directorio si no existe
    if (!is_dir(dirname($ipsFile))) {
        mkdir(dirname($ipsFile), 0755, true);
    }
    
    // Guardar IPs
    $result = file_put_contents($ipsFile, json_encode($ips, JSON_PRETTY_PRINT));
    
    if ($result === false) {
        throw new Exception('Error al guardar IPs');
    }
    
    return true;
}

// Función para agregar IP
function addIP($newIP) {
    // Validar formato de IP
    if (!isValidIP($newIP)) {
        throw new Exception('Formato de IP inválido');
    }
    
    // Cargar IPs existentes
    $ips = loadAuthorizedIPs();
    
    // Verificar si la IP ya existe
    if (in_array($newIP, $ips)) {
        throw new Exception('Esta IP ya está autorizada');
    }
    
    // Agregar nueva IP
    $ips[] = $newIP;
    
    // Guardar IPs
    saveAuthorizedIPs($ips);
    
    return $ips;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!$data || !isset($data['ip'])) {
            throw new Exception('IP no proporcionada');
        }
        
        $newIP = trim($data['ip']);
        
        if (empty($newIP)) {
            throw new Exception('IP no puede estar vacía');
        }
        
        // Agregar IP
        $updatedIPs = addIP($newIP);
        
        echo json_encode([
            'success' => true,
            'message' => "IP $newIP agregada correctamente",
            'data' => $updatedIPs,
            'count' => count($updatedIPs)
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