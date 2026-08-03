# Cafetería Escolar — Aplicación con Reconocimiento Facial (IA)

Aplicación móvil completa (Frontend + Backend) para la cafetería de una escuela. El
mecanismo principal de autenticación es **biométrico por reconocimiento facial**,
implementado con la biblioteca de IA **DeepFace**.

## Stack Tecnológico

| Capa | Tecnología | ¿Para qué? |
|------|-----------|------------|
| Backend | **FastAPI** (Python) + SQLAlchemy | API REST y acceso a la base de datos |
| IA / Biometría | **DeepFace** (modelo Facenet + detector OpenCV) | Detección y reconocimiento de rostros |
| Base de datos | **SQLite** (relacional) | Almacenamiento de usuarios, catálogo y órdenes |
| Frontend | **React Native** (Expo SDK 57) + TypeScript | Aplicación móvil |
| Estilos | **NativeWind** (Tailwind CSS para React Native) | Diseño de la interfaz |

---

## 1. Estructura del proyecto

```
proyectoF_jesus/
├── backend/                     # API REST (Python / FastAPI)
│   ├── app/
│   │   ├── main.py              # Aplicación FastAPI, monta rutas y archivos estáticos
│   │   ├── config.py            # Configuración (rutas, umbral de reconocimiento, modelo)
│   │   ├── database.py          # Conexión a SQLite y sesión de SQLAlchemy
│   │   ├── models.py            # Tablas: User, Category, Product, Order, OrderItem
│   │   ├── schemas.py           # Esquemas Pydantic (validación y respuesta)
│   │   ├── auth.py              # Lógica de reconocimiento facial (DeepFace)
│   │   ├── seed.py              # Datos de ejemplo (categorías y productos)
│   │   └── routers/             # Endpoints organizados por módulo
│   │       ├── auth_router.py   # POST /auth/login (login facial)
│   │       ├── users.py         # Registro y consulta de usuarios
│   │       ├── categories.py    # CRUD de categorías
│   │       ├── products.py      # CRUD de productos (baja lógica)
│   │       └── orders.py        # Órdenes, estados e historial
│   ├── uploads/                 # Rostros (base de rostros) e imágenes de productos
│   ├── run.py                   # Arranca el servidor y siembra la base de datos
│   └── requirements.txt         # Dependencias de Python
│
└── frontend/                    # Aplicación móvil (React Native / Expo)
    ├── App.tsx                  # Raíz: providers y navegación
    ├── global.css               # Directivas de Tailwind (NativeWind)
    ├── tailwind.config.js       # Configuración de Tailwind
    ├── metro.config.js          # Configuración de Metro (NativeWind)
    ├── babel.config.js          # Babel (preset de NativeWind)
    └── src/
        ├── api/                 # Cliente Axios y llamadas a la API
        ├── context/             # AuthContext (sesión) y CartContext (carrito)
        ├── navigation/          # Navegación (stacks y pestañas)
        ├── components/          # FaceCapture (cámara), CartSheet (carrito), etc.
        └── screens/             # Pantallas de la app
```

---

## 2. Backend — Instalación y ejecución

> **Requisito importante:** se recomienda **Python 3.10 – 3.12**. DeepFace instala
> TensorFlow/Caffe y descarga los pesos de los modelos (varios cientos de MB)
> **la primera vez** que se usa el registro o el login (requiere internet).

### Pasos

```bash
cd backend

# 1. Crear y activar un entorno virtual
python -m venv .venv

# Windows:
.\.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

# 2. Instalar las dependencias
pip install -r requirements.txt

# 3. Arrancar el servidor (crea la BD y la llena con datos de ejemplo)
python run.py
```

El servidor queda disponible en **http://0.0.0.0:8000**.

- **Documentación interactiva (Swagger):** <http://localhost:8000/docs>
  — desde ahí puedes probar todos los endpoints, incluido el login facial.
- **Prueba rápida:** <http://localhost:8000/> (muestra la lista de endpoints).

### Configuración opcional (variables de entorno)

```bash
FACE_MATCH_THRESHOLD=0.55   # Umbral de distancia: más bajo = más estricto
DEEPFACE_MODEL=Facenet      # Modelo de embeddings (VGG-Face, Facenet512, ArcFace...)
DEEPFACE_DETECTOR=opencv    # Detector de rostros (opencv, mtcnn, retinaface...)
DATABASE_URL=sqlite:///cafeteria.db
```

---

## 3. Frontend — Instalación y ejecución

### Requisitos

- **Node.js 18 o superior**
- La app **Expo Go** en tu teléfono (Android/iOS) o un emulador

### Pasos

```bash
cd frontend
npm install

# Arrancar el bundler de Expo
npx expo start
```

- Escanea el **código QR** con Expo Go, o presiona `a` para abrir el emulador Android.
- **Primera vez:** configura la dirección del backend en `src/api/client.ts`:

```ts
// Emulador Android:   http://10.0.2.2:8000   (valor por defecto)
// Dispositivo físico: http://IP_DE_TU_PC:8000   (misma red WiFi que tu PC)
export const API_URL = "http://IP_DE_TU_PC:8000";
```

### Flujo de uso de la app

1. **Registro:** capturas tu rostro con la cámara frontal (queda guardado como imagen base).
2. **Login biométrico:** escaneas tu rostro → DeepFace lo compara contra la base de rostros → si coincide, entras.
3. **Menú:** exploras productos por categoría, agregas al carrito y confirmas el pedido.
4. **Mis pedidos:** consultas el historial y el detalle de tus órdenes.
5. **Admin** (rol `admin`): gestionas categorías y productos, cambias el estado de las órdenes y ves la lista de usuarios.

### Pantallas implementadas

| Módulo | Pantallas |
|--------|-----------|
| Usuarios | Login biométrico (escaneo facial), Registro (con captura de rostro) |
| Catálogo | Lista de productos, alta/edición de producto, lista de categorías, alta/edición de categoría |
| Pedidos | Creación de orden (carrito/confirmación), lista general de órdenes (admin), historial del usuario, detalle de orden |

---

## 4. Endpoints de la API

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
| `GET` | `/orders` | Listar todas las órdenes (vista administrador) |
| `GET` | `/orders/user/{user_id}` | Historial de órdenes de un usuario |
| `GET` | `/orders/{id}` | Detalle de una orden |
| `PUT` | `/orders/{id}/status` | Cambiar estado de una orden |

### Estados de una orden

`pending` (pendiente) → `preparing` (preparando) → `ready` (listo) → `completed` (completado).
Los estados `pending` y `preparing` pueden cancelarse con `cancelled`.

---

## 5. Base de datos (diagrama y explicación)

Base relacional **SQLite** (archivo `backend/cafeteria.db`) con 5 tablas:

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

### Descripción de cada tabla

- **users** — Personas registradas. Guarda datos personales (`full_name`, `email`), el
  `role` (`admin` o `customer`) y la referencia a la imagen base de su rostro (`face_image`),
  que se usa para el reconocimiento facial.
- **categories** — Clasificación de los productos (Bebidas, Botanas, Almuerzos, Postres...).
- **products** — Artículos de la cafetería. `is_active` permite la **baja lógica** (el
  producto deja de venderse pero el registro se conserva).
- **orders** — Órdenes de compra. Guarda a quién pertenece (`user_id`), su `status` y el
  `total` calculado. Contiene `created_at` y `updated_at`.
- **order_items** — Renglones de cada orden: qué producto, cuántas unidades y a qué precio
  se vendió (`unit_price` se guarda en el momento de la compra, aunque el precio cambie después).

### Relaciones

- `users` **1 ── N** `orders` — un usuario tiene muchas órdenes.
- `orders` **1 ── N** `order_items` — una orden tiene varios renglones.
- `products` **1 ── N** `order_items` — un producto aparece en varios renglones.
- `categories` **1 ── N** `products` — una categoría contiene varios productos.

---

## 6. Cómo funciona el reconocimiento facial

1. **Registro:** la foto del rostro del usuario se guarda en `backend/uploads/faces/user_<id>.jpg`.
2. **Login:** la foto escaneada se compara contra todas las de la base mediante
   `DeepFace.find()` (modelo `Facenet`, distancia euclidiana).
3. **Decisión:** si la distancia del mejor candidato es **menor o igual al umbral**
   (`FACE_MATCH_THRESHOLD`, por defecto `0.55`), se autentica a ese usuario; de lo
   contrario, el acceso se rechaza.
