## Alcance Comercial SaaS — ProSocial

Versión: 2025-09-17  •  Responsable: Producto/Comercial  •  Estado: Borrador para validación

### 1) Resumen ejecutivo
ProSocial evoluciona a un SaaS agnóstico para negocios basados en proyectos y servicios (eventos, producción creativa, consultoría, instalaciones/field services, entre otros). El producto cubre el ciclo comercial end-to-end: captación (landing + ManyChat/WA), calificación, cotización y comparador de paquetes, agenda/citas, checkout con Stripe, gestión del proyecto, costos/nómina y notificaciones. Esta edición sintetiza capacidades, casos de uso, packaging por planes y una hipótesis inicial de precios para orientar marketing y ventas.

### 2) Público objetivo (ICP) y casos de uso
- ICP principal: equipos de 1–20 personas en servicios profesionales y operativos (producción creativa, planners/productoras, agencias boutique, consultoría por proyecto, catering, instalaciones/field ops) en LATAM y EE. UU. hispano.
- Casos de uso clave:
  - Captar leads desde landing/WA y crear proyectos en el CRM.
  - Cotizar paquetes/ofertas y upsells; enviar comparador público al cliente.
  - Cobrar anticipos/liquidaciones con Stripe (MSI donde aplique) y registrar pagos mixtos.
  - Calendarizar citas y bloqueos de agenda; coordinación de hitos del proyecto.
  - Controlar costos/gastos por servicio; generar nómina/comisiones.
  - Portal cliente para pagos/seguimiento y notificaciones.

### 3) Capacidades actuales (auditoría del repo)
- Autenticación JWT (reemplazo de Clerk) y roles básicos.
- Módulos: `Cliente`, `Evento`, `Cotización`/`Comparador`, `Pago` (Stripe), `Agenda`/`Citas`, `Paquetes`/`Servicios`, `Gasto`, `Notificación`, `Negocio` (branding, horarios), `Nómina` (pagos a colaboradores), y `Configuración` comercial.
- API por funcionalidad en `app/api/*` y App Router Next.js; Dashboard Admin y Portal Cliente.
- Integraciones: Stripe (checkout/webhooks), Supabase Realtime (limpieza/RT), ManyChat/WhatsApp (validación de disponibilidad y creación de proyectos/eventos planificada en roadmap).
- Prisma + PostgreSQL; esquema preparado para futuras `Suscripción` de clientes.

### 4) Diferenciadores propuestos
- Flujos listos para negocios por proyecto (paquetes, comparador, tiempos mínimos, etapas del proyecto/evento).
- Conversión omnicanal: landings específicas + ManyChat + comparador público + checkout Stripe.
- Operación integrada: costos/gastos por servicio y nómina de colaboradores vinculada a cada proyecto/cotización.
- Roadmap claro para multimedia (post-campaña) e invitaciones digitales como add-ons.

#### 3.1) Terminología genérica (Proyecto) y mapeo de entidades
- Proyecto (genérico) ↔ `Evento` (actual DB)
- Tipo de Proyecto ↔ `EventoTipo`
- Etapa de Proyecto ↔ `EventoEtapa`
- Hito principal del proyecto (fecha) ↔ `fecha_evento`
- Oferta/Propuesta ↔ `Cotizacion`
- Servicios y categorías ↔ `Servicio` / `ServicioCategoria` / `ServicioSeccion`
- Paquete de servicios ↔ `Paquete` / `PaqueteServicio`
- Agenda/Hitos ↔ `Agenda`
- Pagos y condiciones ↔ `Pago` / `CondicionesComerciales` / `MetodoPago`
- Costeo/Utilidad ↔ `CotizacionServicio` / `CotizacionCosto`
- Nómina/Comisiones ↔ `Nomina` / `NominaServicio`

Lineamiento: mantener DB estable usando nombres actuales y exponer terminología "Proyecto" en UI/documentación; evaluar renombrado de modelos en la fase multi-tenant.

### 5) Limitaciones/pendientes (para transparencia comercial)
- Multitenancy y espacios por cuenta: en preparación (Fase SaaS). 
- Gestión multimedia (galerías, thumbnails, watermark) y editor de invitaciones: en roadmap post-campaña.
- Panel de configuración comercial ampliado y límites de búsqueda ManyChat: en Fase 2.

### 6) Packaging por planes (Básico / Pro / Premium)
Principios: 
- Fricción baja para estudios pequeños (Básico), crecimiento con funcionalidades de conversión y automatización (Pro), y escalado más soporte/SLA/white-label (Premium).
- Métrica de valor: proyectos/mes y usuarios internos. Límite suave + add-ons.

#### Matriz de características (v1)
| Área | Básico | Pro (Intermedio) | Premium (Alto) |
|---|---|---|---|
| Usuarios internos | 2 | 5 | 15 (ilimitado opcional) |
| Proyectos activos/mes | 5 | 20 | 60 (más a la carta) |
| Clientes/CRM | Sí | Sí | Sí |
| Landing + Captura leads | Sí (plantilla) | Sí (templates por vertical) | Sí + plantillas avanzadas |
| ManyChat/WhatsApp integración | — | Validación de disponibilidad (API) | Validación + creación de proyecto + respuestas guiadas |
| Cotizaciones | Sí | Sí + secciones/categorías | Sí + versiones y expiración avanzada |
| Comparador de paquetes | Sí | Sí (personalización) | Sí + upsells y cross-sell |
| Stripe pagos (anticipo/liquidación) | Sí | Sí + MSI donde aplique | Sí + reglas y recordatorios custom |
| Condiciones comerciales y métodos de pago | Básico | Avanzado | Avanzado + reglas por tipo de proyecto |
| Agenda/Citas | Sí | Sí + recordatorios | Sí + workflows automatizados |
| Notificaciones | Email básico | Email + in-app | Email + in-app + WhatsApp (via ManyChat) |
| Gastos/Costos por servicio | — | Sí (costeo simple) | Sí + reportes de utilidad |
| Nómina/Comisiones | — | Sí (individual) | Sí (agrupada/comisión y snapshots) |
| Portal Cliente | Sí (pagos/estado) | Sí + comparador y revisiones | Sí + marca del cliente |
| Branding de negocio | Logo básico | Marca + horarios + RRSS | Marca avanzada + subdominio custom |
| Dominios personalizados | — | — | Sí (1 incluido) |
| API/Webhooks | — | Webhooks básicos | API + Webhooks avanzados |
| Storage de archivos | 5 GB | 25 GB | 100 GB |
| Soporte | Email 48-72h | Email + chat 24-48h | Prioritario 4-8h + onboarding |
| SLA | — | — | 99.9% (mejor esfuerzo al inicio) |

Notas:
- Límite de eventos/mes y usuarios escalable vía add-ons.
- Multimedia e Invitaciones Digitales se ofrecen como add-ons (ver §8).

### 7) Hipótesis de precios (estimaciones para orientación)
Rangos de referencia de mercado para CRMs de fotógrafos/creativos y gestión de eventos (no vinculantes; validar en estudio):
- Básico: USD 19–29 / mes (MXN 349–549)
- Pro: USD 39–59 / mes (MXN 699–1,099)
- Premium: USD 79–129 / mes (MXN 1,499–2,299)

Políticas sugeridas:
- Descuento anual: 15–20% (2 meses gratis).
- Precios localizados: lista USD con referencia MXN/LatAm; revisar tipo de cambio trimestral.
- Add-ons facturados aparte (storage adicional, dominios, multimedia, invitaciones).

### 8) Add-ons propuestos
- Multimedia (post-campaña): +50 GB = USD 10/mes; +200 GB = USD 30/mes.
- Invitaciones digitales (editor + envíos): USD 15/mes (Básico/Pro) incluido en Premium.
- Dominio personalizado adicional: USD 5/mes c/u.
- Usuarios extra: USD 5/mes por usuario (a partir de Pro).
- Eventos extra: USD 1–2 por evento activo adicional al límite mensual.

### 9) Competidores para benchmarking (llenar por Marketing)
Tabla para investigación con precios oficiales actuales (añadir links y capturas):
| Competidor | Enfoque | Planes / rango mensual estimado | Observaciones |
|---|---|---|---|
| HoneyBook | Creativos freelance/SMB | ~USD 19–79 | Fuerte en facturación/contratos; automations |
| Dubsado | Freelancers/Agencias | ~USD 20–70 | Workflows y forms avanzados |
| 17hats | Creativos | ~USD 15–60 | Automatización y plantillas |
| Studio Ninja | Fotógrafos | ~USD 20–30 | Simplicidad, buen onboarding |
| Sprout Studio | Fotógrafos | ~USD 17–70 | Galerías cliente + ventas |
| Táve | Fotógrafos | ~USD 24–50 | Alta personalización |
| Pixieset Studio Manager | Fotógrafos | Freemium + pagos | Ecosistema portafolio/galerías |
| ShootQ | Fotógrafos | ~USD 19–49 | CRM clásico de foto |

Acciones: validar precios actuales y features de cada uno; documentar pros/contras y posicionamiento.

### 10) Pricing model y métricas de valor
- Unidades de valor: usuarios internos, proyectos activos/mes, almacenamiento, dominios.
- Métrica primaria en páginas públicas: precio por cuenta (incluye X usuarios y Y proyectos/mes).
- Experimentación: pruebas A/B de precios, ensayo de "projects-based pricing" en Premium.

### 11) Propuesta de valor (mensajes comerciales)
- Cierre más proyectos con un funnel listo para acción (landing + WA + comparador + checkout).
- Control financiero por proyecto (costos, comisiones y pagos) sin hojas de cálculo.
- Diseñado para negocios por proyecto/servicios: paquetes, tiempos mínimos y agenda de campo.

### 12) KPIs y objetivos comerciales (12 semanas)
- Conversión Landing → Lead: ≥15%  •  Lead → Cotización: ≥30%  •  Cotización → Venta: ≥25%.
- Activación (setup completo en 7 días): ≥60%  •  Retención 90d: ≥85%.
- ARPA objetivo: USD 35–45; churn mensual < 3%.

### 13) Supuestos y riesgos
- Supuesto: WhatsApp/ManyChat aumenta CVR MOFU; Stripe MSI disponible en mercado local.
- Riesgo: latencia/ops multimedia si se acelera la Fase 4; mitigación con CDN y colas.
- Supuesto: estudios pequeños sensibles a precio; necesidad de plan Básico competitivo.

### 14) Roadmap comercial alineado a producto
- Q4-2025: multitenancy (espacios por cuenta), empaquetado y trial 14 días, facturación recurrente.
- Q1-2026: multimedia básica y editor de invitaciones (como add-ons), API pública v1.
- Q2-2026: analítica de rentabilidad por proyecto y smart upsells en comparador.

### 15) Siguientes pasos para Comercial/Marketing
1. Validar matriz de planes con equipo de producto y soporte.
2. Completar benchmarking con precios oficiales y screenshots.
3. Test de disposición a pagar (surveys a 15–20 estudios en LATAM/US hispano).
4. Definir precio de lista por región y política de descuentos.
5. Preparar copy y calculadora de planes en sitio (comparativa visible de límites).

### 16) Verticales compatibles y adecuaciones sugeridas
- Producción creativa/agencias boutique: usar "Proyecto" para sesiones, campañas o producciones; comparador como propuestas.
- Planners/productoras de eventos: usar "Proyecto" como evento; mantener validación de disponibilidad por fecha.
- Consultoría por proyecto: hitos en `Agenda`, entregables en `Servicio`, cobros por fases.
- Field services/instalaciones: `Proyecto` como orden de trabajo con fecha/hito; paquetes como bundles de servicio.
- Catering y renta de equipos: `Proyecto` como servicio contratado por fecha; costos y nómina por equipo.

Adecuaciones menores por vertical: etiquetas UI por tenant, plantillas de landing, y workflows de recordatorios específicos.

——
Este documento es de trabajo. Actualizar con resultados del estudio de mercado y pruebas de pricing.

