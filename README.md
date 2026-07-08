# Papelería Online

## Descripción

Papelería Online es una tienda en línea desarrollada con React que incluye dos tipos de usuarios: cliente y administrador.

- Clientes pueden explorar productos, ver detalles, agregar artículos al carrito, registrarse, iniciar sesión y realizar pedidos.
- Administradores pueden gestionar inventario, categorías, pedidos, cupones y acceder a un punto de venta para control de ventas e inventario.

## Características

- Autenticación con Firebase Auth
- Navegación con React Router Dom
- Página de inicio con productos y carrito
- Detalle de producto
- Registro de usuario y recuperación de contraseña
- Perfil de usuario
- Área de administrador con:
  - Panel principal de métricas
  - Gestión de inventario
  - Gestión de categorías
  - Gestión de pedidos
  - Gestión de cupones
  - Punto de venta (POS)
- Integración con Firebase Firestore

## Estructura principal del proyecto

- `src/App.js` - Rutas principales de la aplicación
- `src/firebase.js` - Configuración de Firebase
- `src/pages/home.js` - Página principal / tienda
- `src/pages/ProductDetail.js` - Detalle del producto
- `src/pages/Profile.js` - Perfil de usuario
- `src/pages/AdminPage.js` - Panel de administración
- `src/componets/` - Componentes reutilizables y panel de administración

## Tecnologías usadas

- React 18
- React Router Dom 6
- Firebase (Auth, Firestore)
- Tailwind CSS
- Lucide React
- React Calendar
- QR code scanner

## Instalación y uso

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/StoreOnline.git
cd StoreOnline
```

2. Instala dependencias:

```bash
npm install
```

3. Inicia la aplicación en modo de desarrollo:

```bash
npm start
```

4. Abre el navegador en:

```text
http://localhost:3000
```

## Scripts disponibles

- `npm start` - Ejecuta la aplicación en modo desarrollo
- `npm build` - Genera una versión de producción
- `npm test` - Inicia el runner de pruebas
- `npm eject` - Expone la configuración de Create React App

## Notas importantes

- La aplicación ya incluye la configuración de Firebase en `src/firebase.js`.
- La ruta `/admin` está protegida y solo permite acceso a usuarios con el campo `isAdmin: true` en la colección `users` de Firestore.
- Ajusta la configuración de Firebase si deseas usar tu propio proyecto.

## Mejoras sugeridas

- Agregar validaciones de formularios más completas
- Implementar manejo de errores y notificaciones de usuario
- Añadir un catálogo de productos dinámico desde Firestore
- Proteger rutas de usuario con roles de forma más robusta

---

Desarrollado como una tienda de papelería en línea con funcionalidades tanto para clientes como para administradores.