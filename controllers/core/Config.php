<?php

class Config
{
    private static ?array $config = null;

    public static function get(string $clave): mixed
    {
        if (self::$config === null) {
            self::$config = require __DIR__ . '/../../config/database.php';
        }

        return self::$config[$clave] ?? null;
    }
}