-- ============================================
-- FIX: Trigger de Historial para Eliminación
-- ============================================

-- PROBLEMA: El trigger AFTER DELETE intenta insertar en historial
-- después de que el documento ya fue eliminado, causando error de FK

-- SOLUCIÓN: Cambiar el trigger para que DELETE se ejecute BEFORE
-- y los demás (INSERT/UPDATE) se mantengan AFTER

-- Paso 1: Eliminar el trigger existente
DROP TRIGGER IF EXISTS trigger_historial_documentos ON documentos;

-- Paso 2: Modificar la función para manejar DELETE correctamente
CREATE OR REPLACE FUNCTION registrar_accion_documento()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO documentos_historial (documento_id, accion, detalles)
        VALUES (NEW.id, 'creado', 'Documento creado: ' || NEW.titulo);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO documentos_historial (documento_id, accion, detalles)
        VALUES (NEW.id, 'modificado', 'Documento modificado');
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Para DELETE usamos OLD en lugar de NEW
        INSERT INTO documentos_historial (documento_id, accion, detalles)
        VALUES (OLD.id, 'eliminado', 'Documento eliminado: ' || OLD.titulo);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Paso 3: Crear triggers separados para mejor control
-- Trigger AFTER para INSERT y UPDATE
CREATE TRIGGER trigger_historial_documentos_after
AFTER INSERT OR UPDATE ON documentos
FOR EACH ROW EXECUTE FUNCTION registrar_accion_documento();

-- Trigger BEFORE para DELETE (para que el registro se haga antes de eliminar)
CREATE TRIGGER trigger_historial_documentos_before
BEFORE DELETE ON documentos
FOR EACH ROW EXECUTE FUNCTION registrar_accion_documento();

-- Paso 4: Verificar que los triggers se crearon correctamente
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'documentos'
AND trigger_name LIKE '%historial%'
ORDER BY trigger_name;

-- RESULTADO ESPERADO:
-- trigger_historial_documentos_after  | INSERT | AFTER  | ...
-- trigger_historial_documentos_after  | UPDATE | AFTER  | ...
-- trigger_historial_documentos_before | DELETE | BEFORE | ...

-- Paso 5: Probar que funciona
-- Puedes probar con un documento de ejemplo:
/*
-- Insertar documento de prueba
INSERT INTO documentos (titulo, tipo, categoria)
VALUES ('Documento de Prueba', 'otro', 'Otros')
RETURNING id;

-- Verificar que se registró en historial
SELECT * FROM documentos_historial 
WHERE accion = 'creado' 
ORDER BY created_at DESC LIMIT 1;

-- Eliminar el documento de prueba (reemplaza el ID)
DELETE FROM documentos WHERE titulo = 'Documento de Prueba';

-- Verificar que se registró la eliminación
SELECT * FROM documentos_historial 
WHERE accion = 'eliminado' 
ORDER BY created_at DESC LIMIT 1;
*/
