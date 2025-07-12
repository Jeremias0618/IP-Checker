<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Configuración de errores
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    $logsFile = '../../logs/access_logs.json';
    
    if (!file_exists($logsFile)) {
        echo json_encode([
            'success' => true,
            'data' => [],
            'message' => 'No hay registros disponibles',
            'count' => 0
        ], JSON_PRETTY_PRINT);
        exit;
    }
    
    $logs = json_decode(file_get_contents($logsFile), true) ?: [];
    
    // Ordenar por timestamp (más reciente primero)
    usort($logs, function($a, $b) {
        return strtotime($b['timestamp']) - strtotime($a['timestamp']);
    });
    
    // Aplicar filtros si se proporcionan
    $filter = $_GET['filter'] ?? 'all';
    $date = $_GET['date'] ?? null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    
    if ($filter !== 'all') {
        $logs = array_filter($logs, function($log) use ($filter) {
            return $log['status'] === $filter;
        });
    }
    
    if ($date) {
        $logs = array_filter($logs, function($log) use ($date) {
            $logDate = date('Y-m-d', strtotime($log['timestamp']));
            return $logDate === $date;
        });
    }
    
    // Aplicar límite
    $logs = array_slice($logs, 0, $limit);
    
    // Formatear logs para la respuesta
    $formattedLogs = array_map(function($log) {
        return [
            'ip' => $log['ip'],
            'status' => $log['status'],
            'message' => $log['message'],
            'timestamp' => $log['timestamp'],
            'user_agent' => $log['user_agent'] ?? 'Unknown',
            'referer' => $log['referer'] ?? 'Direct'
        ];
    }, $logs);
    
    echo json_encode([
        'success' => true,
        'data' => $formattedLogs,
        'message' => 'Registros cargados correctamente',
        'count' => count($formattedLogs),
        'filters' => [
            'applied' => $filter,
            'date' => $date,
            'limit' => $limit
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
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