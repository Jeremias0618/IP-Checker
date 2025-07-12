<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Configuración de errores
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    // Verificar método HTTP
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }
    
    // Archivos de logs a limpiar
    $logFiles = [
        '../../logs/access_logs.json',
        '../../logs/access.log',
        '../../logs/ip_changes.log',
        '../../logs/config_changes.log'
    ];
    
    $clearedFiles = [];
    $errors = [];
    
    foreach ($logFiles as $logFile) {
        if (file_exists($logFile)) {
            // Crear backup antes de limpiar
            $backupFile = $logFile . '.backup.' . date('Y-m-d_H-i-s');
            
            if (copy($logFile, $backupFile)) {
                // Limpiar archivo
                if (pathinfo($logFile, PATHINFO_EXTENSION) === 'json') {
                    // Para archivos JSON, escribir array vacío
                    $result = file_put_contents($logFile, json_encode([], JSON_PRETTY_PRINT));
                } else {
                    // Para archivos de texto, truncar
                    $result = file_put_contents($logFile, '');
                }
                
                if ($result !== false) {
                    $clearedFiles[] = basename($logFile);
                } else {
                    $errors[] = "Error al limpiar: " . basename($logFile);
                }
            } else {
                $errors[] = "Error al crear backup: " . basename($logFile);
            }
        }
    }
    
    // Registrar la acción de limpieza
    $cleanupLogFile = '../../logs/cleanup.log';
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] Limpieza de logs realizada por IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . " | Archivos limpiados: " . implode(', ', $clearedFiles) . "\n";
    
    if (!is_dir(dirname($cleanupLogFile))) {
        mkdir(dirname($cleanupLogFile), 0755, true);
    }
    
    file_put_contents($cleanupLogFile, $logEntry, FILE_APPEND | LOCK_EX);
    
    if (empty($errors)) {
        echo json_encode([
            'success' => true,
            'message' => 'Todos los registros han sido limpiados correctamente',
            'data' => [
                'clearedFiles' => $clearedFiles,
                'totalCleared' => count($clearedFiles)
            ],
            'timestamp' => date('c')
        ], JSON_PRETTY_PRINT);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Algunos archivos no pudieron ser limpiados',
            'data' => [
                'clearedFiles' => $clearedFiles,
                'errors' => $errors
            ],
            'timestamp' => date('c')
        ], JSON_PRETTY_PRINT);
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('c')
    ], JSON_PRETTY_PRINT);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error interno del servidor',
        'timestamp' => date('c')
    ], JSON_PRETTY_PRINT);
}
?> 