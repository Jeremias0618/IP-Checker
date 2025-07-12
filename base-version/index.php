<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Verificación de IP Pública</title>
</head>
<body>
    <h2>Verificando tu IP pública...</h2>
    <div id="resultado"></div>

    <script>
        // Obtener la IP pública del cliente desde un servicio externo
        fetch("https://api.ipify.org?format=json")
            .then(response => response.json())
            .then(data => {
                const ip = data.ip;

                // Enviar IP al servidor PHP para validación
                fetch("verificar_ip.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: "ip=" + encodeURIComponent(ip)
                })
                .then(response => response.text())
                .then(resultado => {
                    document.getElementById("resultado").innerHTML = "<strong>" + resultado + "</strong>";
                })
                .catch(error => {
                    document.getElementById("resultado").innerText = "Error al verificar: " + error;
                });
            })
            .catch(error => {
                document.getElementById("resultado").innerText = "No se pudo obtener la IP pública.";
            });
    </script>
</body>
</html>
