-- Script para limpiar datos de prueba de centros_formadores
-- Ejecutar en Supabase SQL Editor

-- Ver cuántos registros hay antes de borrar
SELECT COUNT(*) as total_centros FROM centros_formadores;
SELECT COUNT(*) as total_usuarios_centros FROM usuarios_centros;

-- Borrar primero los vínculos (por foreign key)
DELETE FROM usuarios_centros;

-- Borrar TODOS los centros formadores
DELETE FROM centros_formadores;

-- Verificar que se borraron
SELECT COUNT(*) as total_centros FROM centros_formadores;
SELECT COUNT(*) as total_usuarios_centros FROM usuarios_centros;

-- NOTA: Ahora los coordinadores crearán sus propios centros desde el portal de registro
-- en /portal-formadora/registro
