# Ritmo Mensual 📅

Organizador mensual por áreas (Cocina, Trabajo, Personal, Compras, Ahorros, Metas).

PWA con 4 temas de color, Kanban responsive, guardado por mes y exportación.

## Stack

- Frontend: HTML + CSS + JavaScript (vanilla)
- Auth & DB: Supabase
- Hosting: Netlify
- Repo: GitHub

## Estructura

```
ritmo-mensual/
├── public/           → lo que se publica en Netlify
│   ├── index.html
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
├── src/
│   ├── css/
│   └── js/
├── supabase/
│   └── schema.sql
└── netlify.toml
```

## Cómo probar localmente

Como es vanilla, puedes servir la carpeta `public` (y `src` debe ser accesible).

Opción rápida con Python:

```bash
cd ritmo-mensual
python -m http.server 3000 --directory .
```

Luego abre: http://localhost:3000/public/

O mejor estructura: mueve/copia `src` dentro de `public` o usa un servidor que sirva desde la raíz del proyecto.

## Temas disponibles

1. **Turquesa** – fresco y profesional
2. **Coral Navy** – energético (por defecto)
3. **Pastel Suave** – delicado
4. **Pastel Vivo** – alegre

## Próximos pasos

1. Crear proyecto en Supabase y ejecutar `supabase/schema.sql`
2. Poner URL y anon key en `src/js/config.js`
3. Conectar Auth real (reemplazar el mock actual)
4. Subir a GitHub y conectar con Netlify
5. Añadir iconos reales en `public/icons/`

## Funcionalidades actuales

- ✅ Login / Registro (mock local)
- ✅ Kanban por 6 áreas
- ✅ Drag & drop entre columnas
- ✅ Cambiar de mes
- ✅ 4 temas intercambiables
- ✅ Crear / editar / completar tareas
- ✅ Exportar mes a JSON
- ✅ PWA básica (instalable)
- ⏳ Supabase real
- ⏳ Exportar a .ics (calendario)
- ⏳ Exportar PDF / CSV
