# Cafetería Escolar — Reconocimiento Facial (IA)

Aplicación móvil completa (Frontend + Backend) para la cafetería de una escuela.
La autenticación principal es **biométrica por reconocimiento facial** usando la
biblioteca **DeepFace** (Python / IA).

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | FastAPI (Python) + SQLAlchemy |
| IA / Biometría | DeepFace (modelo Facenet + detector OpenCV) |
| Base de datos | SQLite (relacional) |
| Frontend | React Native (Expo SDK 57) + NativeWind (Tailwind) + TypeScript |

## Estructura del repositorio

```
proyectoF_jesus/
├── backend/                     # API REST en FastAPI
│   ├── app/
│   │   ├── main.py              # Aplicación FastAPI + rutas
│   │   ├── config.py            # Configuración (rutas, umbral, modelo)
│   │   ├── database.py          # Motor SQLite + sesión SQLAlchemy
│   │   ├── models.py            # Modelos: User, Category, Product, Order, OrderItem
│   │   ├── schemas.py           # Esquemas Pydantic (validación / serialización)
│   │   ├── auth.py              # Lógica de reconocimiento facial (DeepFace)
│   │   ├── seed.py              # Datos de ejemplo (categorías y productos)
│   │   └── routers/
│   │       ├── auth_router.py   # POST /auth/login (login facial)
│   │       ├── users.py         # CRUD de usuarios
│   │       ├── categories.py    # CRUD de categorías
│   │       ├── products.py      # CRUD de productos (baja lógica)
│   │       └── orders.py        # Órdenes, estados e historial
│   ├── uploads/                 # Rostros (face DB) e imágenes de productos
│   ├── run.py                   # Arranca el servidor y siembra la BD
│   └── requirements.txt
└── frontend/                    # App móvil React Native (Expo)
    ├── App.tsx                  # Raíz (providers + navegación)
    ├── global.css               # Directivas de Tailwind
    ├── tailwind.config.js
    ├── metro.config.js / babel.config.js
    └── src/
        ├── api/                 # Cliente Axios + llamadas a la API
        ├── context/             # AuthContext (sesión) y CartContext (carrito)
        ├── navigation/          # Navegación (stack + tabs)
        ├── components/          # FaceCapture (cámara), CartSheet, etc.
        └── screens/             # Pantallas (login, registro, menú, admin, pedidos)
```

---

## 1. Backend — Instalación y ejecución

> **Importante:** se recomienda **Python 3.10 – 3.12**. DeepFace instala
> TensorFlow/Caffe y los pesos de modelos (varios cientos de MB) **la primera
> vez que se usa el login/registro** (requiere internet).

```bash
cd backend

# 1. Crear y activar entorno virtual
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Arrancar el servidor (siembra la BD con datos de ejemplo)
python run.py
```

El servidor queda en **http://0.0.0.0:8000**.

- Documentación interactiva de la API (Swagger): <http://localhost:8000/docs>
- Prueba rápida: <http://localhost:8000/>

### Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/login` | Login biométrico: recibe `face_image` (multipart), valida con DeepFace y autentica |
| `POST` | `/users` | Crear usuario: `full_name`, `email`, `role`, `face_image` |
| `GET` | `/users` | Lista de usuarios |
| `GET/POST` | `/categories` | Listar / crear categorías |
| `PUT/DELETE` | `/categories/{id}` | Actualizar / eliminar categoría |
| `GET/POST` | `/products` | Listar / crear productos |
| `PUT/DELETE` | `/products/{id}` | Actualizar / baja lógica de producto |
| `POST` | `/products/{id}/image` | Subir imagen de producto |
| `POST` | `/orders` | Crear orden de compra (`user_id` + `items[]`) |
| `GET` | `/orders` | Listar todas las órdenes (administrador) |
| `GET` | `/orders/user/{user_id}` | Historial de órdenes de un usuario |
| `GET` | `/orders/{id}` | Detalle de una orden |
| `PUT` | `/orders/{id}/status` | Cambiar estado (`pending`, `preparing`, `ready`, `completed`, `cancelled`) |

> Estados posibles de una orden: `pending` → `preparing` → `ready` → `completed`
> (`pending`/`preparing` pueden cancelarse con `cancelled`).

### Configuración opcional (variables de entorno)

```bash
FACE_MATCH_THRESHOLD=0.55   # Umbral de distancia (más bajo = más estricto)
DEEPFACE_MODEL=Facenet      # Modelo de embeddings (VGG-Face, Facenet512, ArcFace...)
DEEPFACE_DETECTOR=opencv    # Detector de rostros (opencv, mtcnn, retinaface...)
DATABASE_URL=sqlite:///cafeteria.db
```

---

## 2. Frontend — Instalación y ejecución

Requisitos: **Node 18+** y la app **Expo Go** en tu teléfono, o un emulador.

```bash
cd frontend
npm install

# Arrancar el bundler de Expo
npx expo start
```

- Escanea el código QR con **Expo Go** (Android/iOS) o presiona `a` para emulador Android.
- **Primera vez**, define la IP de tu PC en `src/api/client.ts`:

```ts
// Android emulador:  http://10.0.2.2:8000   (por defecto)
// Dispositivo físico: http://IP_DE_TU_PC:8000  (misma red WiFi)
export const API_URL = "http://IP_DE_TU_PC:8000";
```

### Flujo de la app

1. **Registro**: captura tu rostro con la cámara frontal (se guarda como imagen base).
2. **Login biométrico**: escaneas tu rostro → DeepFace lo compara contra la BD → si coincide, entras.
3. **Menú**: explora productos por categoría, agrega al carrito y confirma el pedido.
4. **Mis pedidos**: historial y detalle de tus órdenes.
5. **Admin** (rol `admin`): CRUD de categorías y productos, gestión de órdenes (cambio de estado) y lista de usuarios.

### Pantallas implementadas

| Módulo | Pantalla |
|--------|----------|
| Usuarios | Login biométrico (escaneo facial), Registro (con captura de rostro) |
| Catálogo | Lista de productos, alta/edición de producto, lista de categorías, alta/edición de categoría |
| Pedidos | Creación de orden (carrito/confirmación), lista general de órdenes (admin), historial del usuario, detalle de orden |

---

## 3. Base de datos (diagrama)

Base relacional **SQLite** (archivo `backend/cafeteria.db`), 5 tablas:

```
┌──────────────┐      ┌────────────────┐      ┌──────────────┐
│   users      │      │    orders      │      │  categories  │
│──────────────│      │────────────────│      │──────────────│
│ id PK        │◄─────│ id PK          │      │ id PK        │
│ full_name    │      │ user_id FK ────┘      │ name         │
│ email UNIQUE │      │ status               │ description  │
│ role         │      │ total                │              │
│ face_image   │      │ created_at           │              │
│ created_at   │      │ updated_at           │              │
└──────────────┘      └─────────┬────────────┘              │
                                │                           │
        ┌───────────────────────┴──────────┐                │
        │          order_items             │                │
        │──────────────────────────────────│      ┌─────────┘
        │ id PK                            │      │
        │ order_id FK ─────────────────────┼───┐  │
        │ product_id FK ───────────────────┼───┼──┼───────┐
        │ quantity                         │   │  │       │
        │ unit_price                       │   │  │       │
        └──────────────────────────────────┘   │  │       │
                                                │  │       │
                                    ┌───────────┴──┴───────▼──────┐
                                    │         products           │
                                    │────────────────────────────│
                                    │ id PK                      │
                                    │ category_id FK ────────────┘
                                    │ name
                                    │ description
                                    │ price
                                    │ image_url
                                    │ is_active  (baja lógica)
                                    │ created_at
                                    └─────────────────────────────┘
```

**Relaciones**

- `users 1 ── N orders` (un usuario tiene muchas órdenes)
- `orders 1 ── N order_items` (una orden tiene muchos renglones)
- `products 1 ── N order_items`
- `categories 1 ── N products`

## 4. Cómo funciona el reconocimiento facial

1. Al **registrar** un usuario, su foto de rostro se guarda en `backend/uploads/faces/user_<id>.jpg`.
2. Al hacer **login**, la foto escaneada se compara con todas las del directorio mediante `DeepFace.find()` (modelo `Facenet`, distancia euclidiana).
3. Si la distancia del mejor candidato es **≤ umbral** (`FACE_MATCH_THRESHOLD`, 0.55), se autentica a ese usuario; de lo contrario se rechaza el acceso.

## 5. Notas para la demostración (video 3–5 min)

1. Mostrar Swagger en `http://localhost:8000/docs`.
2. Registrar un alumno capturando el rostro.
3. Hacer login escaneando el mismo rostro → acceso concedido.
4. Mostrar un login con otro rostro (o sin rostro) → acceso denegado.
5. Crear una orden desde el carrito y seguir su estado en la vista de administrador.
