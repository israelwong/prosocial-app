Guía Maestra de Estilos UX/UI - ProSocial Admin

1. Filosofía de Diseño
   Nuestra filosofía se centra en la claridad, eficiencia y profesionalismo. El panel de administración es una herramienta de trabajo, no un escaparate. Cada elemento de la interfaz debe tener un propósito claro, ser intuitivo y ayudar al usuario a completar sus tareas con la menor fricción posible.

Prioridad a la Función: La estética siempre debe servir a la funcionalidad.

Consistencia Radical: Un componente debe verse y comportarse de la misma manera en toda la aplicación.

Jerarquía Visual Clara: El usuario debe entender de un vistazo qué es lo más importante en la pantalla.

Feedback Inmediato: La interfaz debe responder a las acciones del usuario, confirmando que sus comandos han sido recibidos y procesados.

2. Paleta de Colores
   Adoptamos un tema oscuro (dark-theme) basado en la paleta "Zinc" de Tailwind CSS. Esto reduce la fatiga visual y enfoca la atención en el contenido. Los colores de acento se usan con moderación para guiar al usuario.

Fondo Principal: bg-zinc-900 - El lienzo sobre el que descansa todo.

Fondo Secundario (Contenedores): bg-zinc-800 - Para tarjetas, modales y áreas de contenido secundario.

Bordes y Separadores: border-zinc-700 - Líneas sutiles para estructurar la interfaz.

Texto Principal: text-zinc-100 o text-white - Para la máxima legibilidad.

Texto Secundario: text-zinc-400 - Para etiquetas, descripciones y texto de menor importancia.

Color de Acento Primario (Acciones): blue-600 - Usado para botones principales, enlaces y elementos interactivos clave.

Hover: blue-500

Color de Éxito: green-500 - Para notificaciones de éxito y estados positivos.

Color de Error: red-500 - Para mensajes de error, alertas y acciones destructivas.

Color de Foco (Focus Ring): ring-blue-500 - Un anillo visible en todos los elementos interactivos al navegar con el teclado.

3. Tipografía
   Utilizamos una única fuente sans-serif para mantener la legibilidad y un aspecto moderno y limpio. La jerarquía se establece mediante el tamaño y el peso de la fuente.

Fuente Principal: Inter (o la fuente sans-serif por defecto del sistema).

Título Principal (h1): text-2xl font-bold text-zinc-100 - Para los títulos de página.

Título de Sección (h2): text-xl font-semibold text-zinc-200 - Para títulos dentro de una página o tarjeta.

Subtítulo (h3): text-lg font-medium text-zinc-200 - Para agrupar elementos dentro de una sección.

Cuerpo de Texto: text-base text-zinc-300 - Para párrafos y texto general.

Texto Pequeño / Etiquetas: text-sm text-zinc-400 - Para etiquetas de formularios, descripciones y metadatos.

4. Espaciado y Layout
   La consistencia en el espaciado es crucial para una interfaz ordenada. Utilizamos una escala basada en múltiplos de 4px (la escala por defecto de Tailwind).

Padding en Contenedores: p-4 (16px) o p-6 (24px) para tarjetas y modales.

Espacio entre Elementos: space-y-4 (16px) o gap-4 para separar elementos vertical u horizontalmente.

Ancho Máximo: Los contenedores de página deben tener un max-w-7xl y estar centrados con mx-auto para asegurar una buena legibilidad en pantallas grandes.

5. Iconografía
   Utilizamos lucide-react como nuestra única librería de iconos para garantizar consistencia visual.

Tamaño por Defecto: size={16} (1rem).

Color por Defecto: text-zinc-400.

En Botones: Los iconos deben acompañar al texto, no reemplazarlo, a menos que la acción sea universalmente reconocida (ej. un icono de X para cerrar).

6. Componentes Base (@/app/components)
   Estos son los bloques de construcción fundamentales de nuestra UI.

Botones (<Button />):

Primario: bg-blue-600 text-white hover:bg-blue-500. Usado para la acción principal de un formulario o vista.

Secundario: bg-zinc-700 text-zinc-200 hover:bg-zinc-600. Para acciones secundarias.

Destructivo: bg-red-600 text-white hover:bg-red-500. Para acciones de eliminación.

Todos los botones deben tener rounded-md, px-4 py-2 (o tamaños ajustados) y un focus:ring-2 ring-offset-2 ring-offset-zinc-900 ring-blue-500.

Inputs de Texto y Textarea (<Input />):

bg-zinc-800, border border-zinc-600, rounded-md.

text-zinc-100.

Focus: focus:border-blue-500 focus:ring-1 focus:ring-blue-500.

Checkboxes y Radios (<Checkbox />, <Radio />):

Deben seguir el mismo esquema de colores, con el acento blue-600 cuando están seleccionados.

Deben tener una etiqueta (<Label />) asociada y un focus:ring visible.

7. Componentes Compuestos
   Tarjetas (<Card />):

bg-zinc-800, border border-zinc-700, rounded-lg, shadow-md.

Deben usar el espaciado interno definido (p-4 o p-6).

Modales (<Modal />):

Deben aparecer sobre un fondo oscuro semi-transparente (bg-black/60).

El contenedor del modal debe seguir el estilo de una tarjeta (bg-zinc-900, rounded-lg, etc.).

Siempre deben ser cerrables con la tecla Esc y/o un botón con el icono X.

Notificaciones (Toasts):

Deben ser concisas y usar los colores definidos (verde para éxito, rojo para error).

Deben aparecer en una esquina de la pantalla y desaparecer automáticamente después de unos segundos.
