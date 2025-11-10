-- ============================================
-- CREAR USUARIO PARA CENTRO FORMADOR
-- Este script vincula un usuario de Auth con un centro formador
-- ============================================

-- Paso 1: Ver los usuarios disponibles en Auth
SELECT 
    id as user_id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- Paso 2: Ver los centros formadores disponibles
SELECT 
    id as centro_id,
    nombre,
    codigo,
    email
FROM centros_formadores
WHERE activo = true
ORDER BY nombre;

-- Paso 3: Vincular usuario con centro formador
-- REEMPLAZA los valores con los IDs que obtuviste arriba

-- Ejemplo: Vincular el primer usuario con el primer centro
INSERT INTO usuarios_centros (user_id, centro_formador_id, rol)
SELECT 
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1) as user_id,
    (SELECT id FROM centros_formadores WHERE activo = true ORDER BY nombre LIMIT 1) as centro_formador_id,
    'centro_formador' as rol
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios_centros 
    WHERE user_id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
);

-- Verificar que se creó correctamente
SELECT 
    uc.id,
    uc.rol,
    u.email as usuario_email,
    cf.nombre as centro_nombre
FROM usuarios_centros uc
JOIN auth.users u ON uc.user_id = u.id
JOIN centros_formadores cf ON uc.centro_formador_id = cf.id
WHERE uc.activo = true;

-- ============================================
-- ALTERNATIVA: Vincular manualmente
-- Si prefieres hacerlo manual, usa este template:
-- ============================================

/*
INSERT INTO usuarios_centros (user_id, centro_formador_id, rol)
VALUES (
    'PEGA-AQUI-EL-UUID-DEL-USUARIO',
    'PEGA-AQUI-EL-UUID-DEL-CENTRO',
    'centro_formador'
);
*/
