-- ============================================
-- Script: Limpiar Triggers y Funciones Antiguas
-- Descripción: Elimina triggers antiguos que usan columnas obsoletas
-- Fecha: 2025-11-18
-- ============================================

-- ============================================
-- PASO 1: Ver triggers existentes en solicitudes_cupos
-- ============================================
SELECT 
  tgname as trigger_name,
  tgtype,
  tgenabled,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = 'solicitudes_cupos'::regclass
  AND tgname NOT LIKE 'pg_%';

-- ============================================
-- PASO 2: Eliminar triggers antiguos
-- ============================================

-- Eliminar trigger de sincronización si existe
DROP TRIGGER IF EXISTS trigger_sincronizar_cupos ON solicitudes_cupos;

-- Eliminar otros triggers comunes que puedan existir
DROP TRIGGER IF EXISTS actualizar_cupos_aprobacion ON solicitudes_cupos;
DROP TRIGGER IF EXISTS actualizar_cupos_rechazo ON solicitudes_cupos;
DROP TRIGGER IF EXISTS sync_cupos_solicitud ON solicitudes_cupos;
DROP TRIGGER IF EXISTS trigger_actualizar_cupos ON solicitudes_cupos;

-- ============================================
-- PASO 3: Eliminar funciones antiguas
-- ============================================

-- Eliminar funciones antiguas que puedan usar cupos_en_uso
DROP FUNCTION IF EXISTS descontar_cupos() CASCADE;
DROP FUNCTION IF EXISTS devolver_cupos() CASCADE;
DROP FUNCTION IF EXISTS actualizar_cupos_centro() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_cupos() CASCADE;

-- ============================================
-- PASO 4: Verificar que no queden triggers
-- ============================================
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'solicitudes_cupos'::regclass
  AND tgname NOT LIKE 'pg_%';

-- Resultado esperado: Sin triggers (o solo los nuevos que vamos a crear)

-- ============================================
-- PASO 5: Verificar funciones relacionadas
-- ============================================
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%cupo%'
  AND routine_schema = 'public'
ORDER BY routine_name;

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Después de ejecutar este script, debes ejecutar de nuevo:
-- sql/scripts/sistema_descuento_cupos_automatico.sql
-- 
-- Esto recreará el trigger correcto sin referencias a cupos_en_uso
-- ============================================
