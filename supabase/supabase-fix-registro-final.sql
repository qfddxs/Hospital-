-- ============================================
-- SOLUCIÓN FINAL PARA REGISTRO DE CENTROS
-- Usar función de base de datos para bypass RLS
-- ============================================

-- Deshabilitar temporalmente RLS para centros_formadores durante registro
DROP POLICY IF EXISTS "Permitir lectura a todos" ON centros_formadores;
DROP POLICY IF EXISTS "Permitir inserción a autenticados" ON centros_formadores;
DROP POLICY IF EXISTS "Permitir actualización a admins" ON centros_formadores;
DROP POLICY IF EXISTS "Permitir eliminación a admins" ON centros_formadores;

-- Política simple: permitir todo a usuarios autenticados
CREATE POLICY "Permitir todo a autenticados" ON centros_formadores
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Política para lectura pública (necesaria para formularios)
CREATE POLICY "Permitir lectura pública" ON centros_formadores
  FOR SELECT
  USING (true);

-- Arreglar políticas de usuarios_centros
DROP POLICY IF EXISTS "Usuarios pueden auto-registrarse" ON usuarios_centros;
DROP POLICY IF EXISTS "Usuarios ven su vínculo" ON usuarios_centros;
DROP POLICY IF EXISTS "Admins gestionan todo" ON usuarios_centros;

-- Permitir todo a usuarios autenticados (simplificado)
CREATE POLICY "Permitir todo a autenticados" ON usuarios_centros
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Crear función para registro completo de centro (bypass RLS)
CREATE OR REPLACE FUNCTION registrar_centro_formador(
  p_nombre VARCHAR,
  p_codigo VARCHAR,
  p_direccion TEXT,
  p_telefono VARCHAR,
  p_email VARCHAR,
  p_contacto_nombre VARCHAR,
  p_contacto_cargo VARCHAR,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Esto permite bypass RLS
AS $$
DECLARE
  v_centro_id UUID;
  v_result JSON;
  v_codigo_final VARCHAR;
BEGIN
  -- Si el código está vacío o es null, generar uno automático
  IF p_codigo IS NULL OR p_codigo = '' THEN
    v_codigo_final := 'CF-' || SUBSTRING(p_user_id::TEXT FROM 1 FOR 8);
  ELSE
    v_codigo_final := p_codigo;
  END IF;

  -- Insertar centro formador
  INSERT INTO centros_formadores (
    nombre, codigo, direccion, telefono, email, 
    contacto_nombre, contacto_cargo, activo
  )
  VALUES (
    p_nombre, v_codigo_final, p_direccion, p_telefono, p_email,
    p_contacto_nombre, p_contacto_cargo, true
  )
  RETURNING id INTO v_centro_id;

  -- Vincular usuario con centro
  INSERT INTO usuarios_centros (user_id, centro_formador_id, rol, activo)
  VALUES (p_user_id, v_centro_id, 'centro_formador', true);

  -- Retornar resultado
  v_result := json_build_object(
    'success', true,
    'centro_id', v_centro_id,
    'message', 'Centro registrado exitosamente'
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Dar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION registrar_centro_formador TO authenticated;

-- Comentario
COMMENT ON FUNCTION registrar_centro_formador IS 'Registra un centro formador y vincula el usuario. Usa SECURITY DEFINER para bypass RLS.';
