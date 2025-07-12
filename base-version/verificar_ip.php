<?php
// Lista de IPs públicas permitidas
$ips_permitidas = [
    '192.168.18.1', // Reemplaza con tu IP pública real
    '192.168.1.1',
];

// Validar si llegó una IP vía POST
if (!isset($_POST['ip'])) {
    http_response_code(400); // Bad Request
    echo "No se recibió ninguna IP.";
    exit;
}

$ip_cliente = $_POST['ip'];

// Verificar si la IP está permitida
if (in_array($ip_cliente, $ips_permitidas)) {
    echo "✅ Acceso permitido desde IP: $ip_cliente";
} else {
    http_response_code(403); // Forbidden
    echo "⛔ Acceso denegado. Tu IP ($ip_cliente) no está autorizada.";
}
?>
