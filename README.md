# VitalIA 🩺

> Detección preliminar de enfermedades de la piel usando Inteligencia Artificial. Accesible, privada y pensada para comunidades alejadas.

---

## Estructura del proyecto

```
vitalia/
├── mobile/          → App React Native (Expo Go)
├── backend/         → API Python (FastAPI) → desplegada en Render
└── web/             → Dashboard médico (HTML/CSS/JS) → desplegado donde quieras
```

---

## 🚀 Setup Rápido

### 1. Supabase (ya tienes el schema)

Ejecuta el SQL en `supabase/migrations/001_initial_schema.sql` en tu proyecto de Supabase.

Variables que necesitas:
- `SUPABASE_URL` → Settings > API > Project URL
- `SUPABASE_ANON_KEY` → Settings > API > anon key (para mobile y web)
- `SUPABASE_SERVICE_KEY` → Settings > API > service_role key (solo para backend)
- `SUPABASE_JWT_SECRET` → Settings > API > JWT Secret (para backend)

---

### 2. Backend (FastAPI)

```bash
cd vitalia/backend
cp .env.example .env
# Edita .env con tus valores reales

python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Desarrollo local
uvicorn app.main:app --reload --port 8000
```

**Desplegar en Render:**
1. Sube el folder `backend/` a un repo de GitHub
2. En Render: New > Web Service > conecta tu repo
3. Agrega las variables de entorno desde `.env.example`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Conectar tu modelo de IA:**
Edita `app/services/model_service.py`:
- La función `call_model()` envía la imagen a tu modelo en Render
- Tu modelo debe exponer un endpoint `POST /predict` que reciba `{ image_base64, patient_profile }` y retorne `{ condition, confidence, severity, notes }`

---

### 3. App Mobile (React Native + Expo)

```bash
cd vitalia/mobile
cp .env.example .env.local
# Edita .env.local con tu SUPABASE_URL y SUPABASE_ANON_KEY
# y la URL de tu API backend en EXPO_PUBLIC_API_URL

npm install

# Instalar fuentes Montserrat
npx expo install @expo-google-fonts/montserrat

# Correr en modo desarrollo
npx expo start
```

Escanea el QR con **Expo Go** (iOS/Android).

---

### 4. Dashboard Web (médicos)

Abre `web/index.html` y reemplaza las dos variables en el `<script>`:

```js
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
```

Súbelo a Vercel, Netlify o cualquier hosting estático.

---

## 📱 Flujo de la app mobile

```
Registro / Login
    ↓
Aceptar Términos
    ↓
Onboarding (alias, edad, tipo piel, historial médico, hábitos)
    ↓
Home ──── Tab Bar ──── Historial
            |
         Diagnóstico (cámara)
            ↓
         Resultado + Recomendaciones
            ↓
         "Buscar dermatólogo cerca"
```

---

## 🔗 Integración con tu modelo de IA

Tu modelo en Render debe exponer:

```
POST /predict
Content-Type: application/json
Authorization: Bearer <MODEL_API_KEY>

{
  "image_base64": "...",        // JPEG 224x224 en base64
  "patient_profile": {
    "age": 28,
    "fitzpatrick_type": "III",
    "medical_history": ["diabetes"],
    "sun_exposure_hours": 4,
    "uses_sunscreen": false,
    ...
  }
}
```

Respuesta esperada:
```json
{
  "condition": "Dermatitis atópica",
  "confidence": 0.87,
  "severity": "media",
  "notes": "Lesiones eritematosas en zona..."
}
```

El backend se encarga de: guardar en Supabase, generar recomendaciones personalizadas y determinar urgencia.

---

## 🎨 Paleta de colores VitalIA

| Color  | Hex       | Uso                  |
|--------|-----------|----------------------|
| Navy   | `#0a2840` | Fondos principales   |
| Teal   | `#1a8ab2` | Color primario       |
| Ocean  | `#0f759a` | Gradientes           |
| Sky    | `#a1cde6` | Textos secundarios   |
| Mint   | `#219fa5` | Acentos / CTAs       |
| Forest | `#0a606d` | Estados exitosos     |

Tipografía: **Montserrat** (400, 500, 600, 700, 800)

---

## 📋 Variables de entorno

### Mobile (`.env.local`)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_URL=
```

### Backend (`.env`)
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SUPABASE_JWT_SECRET=
MODEL_API_URL=
MODEL_API_KEY=
DEBUG=false
```

---

## 🔐 Seguridad

- JWTs de Supabase validados en cada request del backend
- Imágenes en storage privado (solo accesibles por el usuario dueño)
- Row Level Security activado en todas las tablas
- El `SERVICE_KEY` solo vive en el backend, nunca en el frontend
- Las imágenes se firman con URLs temporales para el dashboard médico

---

## ⚕️ Aviso médico

VitalIA es una herramienta de apoyo informativo. Los diagnósticos son preliminares y no sustituyen la consulta, diagnóstico ni tratamiento de un médico dermatólogo certificado.
