# 🕹️ Sala de Juegos 

---

## 📌 Tecnologías utilizadas

- **Angular** para el desarrollo del frontend.  
- **Supabase** como base de datos y autenticación (se puede usar Firebase como alternativa).  
- **CSS/TypeScript** para animaciones.  
- **Vercel** como hosting para el despliegue.  

---

## 🚀 Deploy

👉 [Enlace al proyecto desplegado](https://sala-de-juegos-tau.vercel.app/home)  

---

## 🔐 Autenticación

La aplicación permite **registrar nuevos usuarios** mediante un formulario y **loguearse** con correo y contraseña.  
Se manejan sesiones activas, mensajes de error en caso de contenido invalido y **cuentas preconfiguradas** para facilitar las pruebas.  
También se utilizan **guards** para restringir el acceso a ciertas rutas según el estado de autenticación.

---

## 🎮 Juegos incluidos

1. **Ahorcado**  
   - Se juega seleccionando letras mediante botones (no teclado).  
   - Se registran datos como tiempo, cantidad de intentos, usuario, etc.
   - Tiene la tabla de resultados exclusiva del juego

2. **Mayor o Menor**  
   - Se muestra una carta al azar y se debe adivinar si la próxima será mayor o menor.  
   - Se guarda la cantidad de aciertos de cada partida.
   - Tiene la tabla de resultados exclusiva del juego

3. **Preguntados**  
   - Las opciones se seleccionan por botones.  
   - Al finalizar, se almacena la cantidad de respuestas correctas.
   - Tiene la tabla de resultados exclusiva del juego

4. **Juego propio**  
   - [FastClick] → Juego de coincidar la palabra que aparece aleatoriamente con .  
   - Cada palabra tiene un tiempo límite para ser adivinada, si es adivinada se van sumando puntos (A partir de 3 aciertos consecutivos se agregan bonificaciones, que quiere decir puntos extras ), en el caso de errar o no llegar con el tiempo finaliza el juego.
   - Se guardan puntaje y tiempo.
   - Tiene la tabla de resultados exclusiva del juego

---

## 💬 Sala de chat

Los usuarios logueados pueden acceder a una **sala de chat global**, donde todos los mensajes se muestran en tiempo real gracias a Supabase Realtime.  
Cada mensaje guarda: usuario, texto y fecha.  
Se diferencia visualmente el mensaje propio de los de otros usuarios.

---

## 📊 Resultados

La sección de **Resultados** muestra tablas con el desempeño de cada jugador en los 4 juegos, ordenando de mejor a peor puntaje y si sos administrador tenes acceso a la encuesta realizada por los usuarios.
Los datos se cargan directamente desde la base de datos.

---

## 📋 Encuesta de Opinión

Se incorporó una encuesta interactiva para recopilar información y opiniones de los usuarios sobre la app.

1. **📝 Datos personales solicitados**

**Nombre y apellido** → Campo de texto.

**Edad** → Campo numérico (validación: entre 18 y 99).

**Número de teléfono** → Solo números, máximo 10 caracteres.

Todos los campos son requeridos y tienen validaciones.

1. **❓ Preguntas de la encuesta**

Se incluyen 3 preguntas obligatorias usando distintos controles:

**Textbox** → Comentarios o sugerencias.

**Checkbox** → Selección de varios aspectos que más gustaron.

**Radiobutton** → Evaluación general de la experiencia.

2. **💾 Almacenamiento**

Las respuestas se guardan en Supabase, asociadas al usuario autenticado, junto con la fecha de envío.

3. **👨‍💻 Visualización** (Solo Admin)

Los administradores pueden ver todas las respuestas desde una sección protegida por guards.
La información se muestra en una tabla dinámica.

---

## 🙋‍♂️ Quién soy

Esta sección muestra mi información personal, junto con una foto de perfil y la explicación del juego propio.  
También se incluye un favicon personalizado para toda la app.
