<?php

header('Content-Type: text/plain; charset=utf-8');

$contrasena = '123456';

$hash = password_hash($contrasena, PASSWORD_DEFAULT);

$esValida = password_verify($contrasena, $hash);

echo "Hash para guardar en la base de datos:\n";
echo $hash . "\n\n";

echo "Verificación de la contraseña:\n";
echo $esValida ? 'Correcta' : 'Incorrecta';