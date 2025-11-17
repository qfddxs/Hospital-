# Estructura del Proyecto - Sistema Hospitalario

Este documento describe la estructura completa del monorepo.

## 📁 Estructura General

```
Hospital-/                          # Repositorio principal (Monorepo)
├── src/                           # 🏥 Hospital (puerto 5173)
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── supabaseClient.js
│
├── Centros-formadores-/           # 🎓 Centros Formadores (puerto 5174)
│   ├── src/
│   ├── docs/
│   ├── package.json
│   └── README.md
│
├── portal-rotaciones/             # 📋 Portal Rotaciones (puerto 5175)
│   ├── src/
│   ├── docs/
│   ├── package.json
│   └── README.md
│
├── docs/                          # 📚 Documentación general del Hospital
│   ├── setup/
│   ├── database/
│   ├── guides/
│   ├── troubleshooting/
│   └── archive/
│
├── supabase/                      # ⚙️ Configuración Supabase compartida
├── public/                        # 📦 Assets públicos
├── .git/                          # 🔧 Control de versiones (único)
├── package.json                   # 📦 Dependencias del Hospital
└── README.md                      # 📖 Documentación principal
```

## 🚀 Iniciar Proyectos

### Hospital (puerto 5173)
```bash
npm install
npm run dev
```

### Centros Formadores (puerto 5174)
```bash
cd Centros-formadores-
npm install
npm run dev
```

### Portal Rotaciones (puerto 5175)
```bash
cd portal-rotaciones
npm install
npm run dev
```

## 📚 Documentación

Cada proyecto tiene su propia carpeta `docs/` con:
- **setup/** - Guías de instalación
- **database/** - Scripts SQL
- **guides/** - Guías de uso
- **troubleshooting/** - Solución de problemas
- **archive/** - Documentos históricos

## 🗄️ Base de Datos

Los 3 proyectos comparten la misma base de datos en Supabase:
- Tablas comunes: `centros_formadores`, `solicitudes_rotacion`, `alumnos`
- Cada proyecto tiene sus propias tablas específicas
- RLS (Row Level Security) configurado para cada portal

## 🔐 Seguridad

- Cada proyecto tiene su propio `.env` con las mismas credenciales de Supabase
- Autenticación independiente por proyecto
- Políticas RLS específicas por rol

## 📦 Gestión de Dependencias

Cada proyecto maneja sus propias dependencias:
- `package.json` en la raíz → Hospital
- `Centros-formadores-/package.json` → Centros Formadores
- `portal-rotaciones/package.json` → Portal Rotaciones

## 🔄 Control de Versiones

- Un solo repositorio Git en la raíz
- `.gitignore` compartido
- Todos los proyectos se versionan juntos
- GitHub Desktop detecta todos los cambios

## 🎯 Ventajas del Monorepo

✅ Un solo repositorio para todo el sistema
✅ Fácil sincronización entre proyectos
✅ Compartir utilidades (dateUtils, etc.)
✅ Documentación centralizada
✅ Despliegue coordinado

## 📝 Notas

- Cada proyecto puede ejecutarse independientemente
- Los puertos están configurados para no colisionar
- La base de datos es compartida pero con acceso controlado
- Cada proyecto tiene su propio README con instrucciones específicas
