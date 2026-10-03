# Fateplas · Membranas a medida para su prensa

## Variante centrada en la membrana

Rama `experience-membrana`, creada desde `experience-material` en un worktree separado, `/home/gabsplat/Programming/Fateplas/web-membrana`. Las copias `../web` y `../web-experience` conservan sus ramas y sus archivos. Esta variante se publica en [GitHub Pages, /fateplas-membrana/](https://gabsplat.github.io/fateplas-membrana/), desde el repositorio independiente [Gabsplat/fateplas-membrana](https://github.com/Gabsplat/fateplas-membrana); el remoto `membrana` apunta a ese repositorio y su rama `main` recibe `experience-membrana`.

Vista local: [Omarchy, puerto 25443](https://omarchy.tailff08b5.ts.net:25443/). El servicio temporal `fateplas-membrana-preview.service` sirve `out/` en `127.0.0.1:4326` y dura hasta que se detenga o se reinicie la máquina. El formulario de esta vista es un placeholder, sin envío ni persistencia; los enlaces de correo y teléfono sí funcionan.

La página no explica cómo funciona una membrana: quien llega ya la está buscando. Todo apunta a probar que esta es buena. El diseño es solo claro y de lenguaje industrial: papel y acero, filetes negros, rótulos en monoespaciada, titulares en mayúsculas y el rosa de la marca como único acento. `globals.css` está escrito para esta variante.

El hero tiene unos pocos hilos en canvas (`FabricField.tsx`) que ondulan despacio, como pliegues de tela, y se inclinan apenas hacia el cursor; el titular "Membranas hechas para aguantar" y una placa con las cuatro cifras de la ficha. Tiene un botón de pausa; con movimiento reducido los hilos quedan quietos.

El corte (`LayerInspector.tsx`) presenta la imagen original `membrane-layers.png` como un plano. La imagen queda entera e inmóvil. Al recorrerla, una cruz marca la posición y la capa bajo el cursor se destaca: el resto se atenúa, su contorno se dibuja y una línea la une con la ficha. Las etiquetas 01 a 03 y las pestañas fijan la capa; las flechas del teclado cambian de pestaña. La ficha muestra la cifra principal y las propiedades publicadas en el sitio original.

El banco de pruebas (`TestBench.tsx`) tiene un ensayo por capa: mantener presionado hasta 7,8 MPa, tirar de la trama de 1100 dTex y subir la temperatura hasta 60 °C. Son simulaciones interactivas de los valores de la ficha del material, no mediciones. Al superar las tres, el contador invita a cotizar. Cada ensayo se puede completar con teclado.

Siguen el respaldo (garantía, certificación, fabricación a medida y kit), el testimonio y la lista de clientes (`ClientWall.tsx`), con los nombres del sitio original; la cifra "más de 140" se calcula de esa lista.

El cotizador (`QuoteBuilder.tsx`) redacta la consulta con la marca, el modelo, la necesidad y la zona, y la deja en el formulario contiguo sin pisar un mensaje escrito a mano. El mismo texto alimenta el enlace de correo. En móvil una barra fija lleva al cotizador.

De la variante `experience-material` no quedan la escena WebGPU, el diagrama de capas, la película, el acordeón ni la dependencia `vgpu`. Los archivos `tests/site.spec.ts`, `interactions.spec.ts`, `redesign.spec.ts` y `pages.spec.ts` pertenecen a variantes anteriores y no cubren esta página.

Para compilar y comprobar esta variante:

```sh
FATEPLAS_PROJECT_ROOT=/home/gabsplat/Programming/Fateplas PAGES_BASE_PATH='' node scripts/build-pages.mjs
TEST_BASE_URL=http://127.0.0.1:4326 CHROMIUM_PATH=/usr/bin/chromium node node_modules/@playwright/test/cli.js test tests/experience.spec.ts
```

Para detener solo esta vista:

```sh
systemctl --user stop fateplas-membrana-preview.service
tailscale serve --https=25443 off
```

## Antecedentes de la versión base

Rediseño de la landing de Fateplas con Next.js App Router, React, TypeScript y Motion. Dirección industrial clara inspirada en Topsoe, conservando la identidad rosa y las mecánicas de la página original. Las imágenes y fuentes se sirven desde este proyecto.

La versión original permanece en https://gabsplat.github.io/fateplas/. Esta variante se publica por separado en https://gabsplat.github.io/fateplas-redesign/.

## Desarrollo

Requiere Node.js 20.9 o superior y pnpm. Desde la raíz del proyecto:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

El servidor local usa el puerto 4320.

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

Con el servidor levantado, `pnpm test:e2e` prueba la web en escritorio, tablet y móvil. Instalar Chromium con `pnpm exec playwright install chromium` o indicar el navegador del sistema con `CHROMIUM_PATH=/usr/bin/chromium pnpm test:e2e`. Estas pruebas simulan los envíos de correo. `pnpm format:check` verifica el formato del código.

## Contacto

`POST /api/contact` valida los campos y guarda cada consulta en `data/contact/`, con un archivo JSON privado por consulta. La carpeta está excluida de Git y no se sirve por HTTP. `CONTACT_DATA_DIR` permite elegir otra ubicación persistente. El servidor requiere permisos de escritura en esa carpeta.

El identificador de cada envío permite reintentar sin duplicar el registro ni el correo. Un mismo identificador con otro contenido devuelve un conflicto. El formulario conserva el contenido cuando falla el envío.

Copiar `.env.example` a `.env.local` para configurar correo. Por defecto `CONTACT_EMAIL_PROVIDER=none` impide cualquier envío, incluso si existen credenciales en el entorno. Las credenciales deben quedar solo en el servidor.

Para Resend, establecer `CONTACT_EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `CONTACT_EMAIL_FROM` y `CONTACT_EMAIL_TO`. Antes de activarlo hace falta crear la cuenta y verificar el dominio remitente mediante sus registros DNS. La integración usa la API HTTP con tiempo límite e identificador de idempotencia, sin instalar otro SDK.

El [plan gratuito de Resend](https://resend.com/pricing), verificado el 28 de septiembre de 2026, incluye 3.000 correos al mes y hasta 100 por día. No se creó ninguna cuenta, suscripción ni configuración de envío real durante este desarrollo.

Como alternativa, `CONTACT_EMAIL_PROVIDER=smtp` usa `SMTP_HOST`, `CONTACT_EMAIL_FROM` y `CONTACT_EMAIL_TO`; las demás variables SMTP configuran puerto, TLS y autenticación.

El guardado local es la confirmación de recepción. Si el proveedor falla, la consulta sigue guardada y su campo `emailDelivery` queda en `failed`. No hay una cola de reintentos automática. Revisar las consultas con `failed` o `pending` antes de reenviarlas manualmente; un fallo durante la actualización del estado puede dejar `pending` aunque el proveedor haya aceptado el correo.

Para producción usar un servidor Node con almacenamiento persistente y copias de seguridad. Un filesystem efímero de una función serverless no conserva estas consultas entre despliegues.

## Demo en GitHub Pages

La demo del rediseño está en https://gabsplat.github.io/fateplas-redesign/.

```sh
PAGES_BASE_PATH=/fateplas-redesign pnpm build:pages
```

Este comando genera `out/` en una copia de compilación separada. Excluye las rutas API, usa el prefijo elegido en `PAGES_BASE_PATH` y activa el formulario placeholder. No guarda ni envía consultas; al pulsar el botón informa que el formulario aún no está habilitado. No requiere claves ni servicios externos de correo.

`PAGES_BASE_PATH` permite cambiar el prefijo al construir. El workflow `.github/workflows/pages.yml` publica automáticamente cada push a `main`. GitHub Pages debe estar configurado para GitHub Actions.

La aplicación Node conserva su API y persistencia con `pnpm build` y `pnpm start`. La exportación estática sirve los archivos de imagen originales porque Pages no ejecuta el optimizador de imágenes de Next.js.

Las capturas de comparación y los respaldos de WordPress no forman parte de este repositorio público.

## Criterios de implementación

La página y su contenido estático usan Server Components. El menú, los carruseles, el diagrama, los acordeones y el formulario usan componentes cliente. Las fuentes locales pasan por `next/font/local` y las imágenes de contenido por `next/image`.

La foto de las barricas conserva el archivo JPEG original, sin recomprimir, para respetar el detalle de la referencia. El resto de las imágenes de contenido usa la optimización de Next.js. El mapa conserva el iframe de Google Maps del sitio original; su contenido depende de ese servicio externo.

La revisión toma como referencia [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices), [Next.js Best Practices](https://github.com/vercel-labs/openreview/tree/main/.agents/skills/next-best-practices) y la documentación incluida con la versión instalada de Next.js.

## Diseño e interacción

La membrana conserva el modelo del SVG de WordPress, que incluye una imagen raster con el corte y el tejido originales. La imagen se mantiene completa e inmóvil; zonas SVG superpuestas resaltan sus materiales al explorarlos. Motion explica la selección del material y suaviza la apertura de acordeones y el cambio de fotografías. Las acciones de teclado responden sin espera y las preferencias de movimiento reducido eliminan desplazamientos. La capa seleccionada se explica con una etiqueta técnica conectada al modelo. Los carruseles permiten navegar con flechas, teclado y gestos; el de prensas también incluye selección numerada. No se muestran controles de pausa.

Las decisiones de diseño y movimiento usan las [skills de Emil Kowalski](https://github.com/emilkowalski/skills) y [frontend-design de Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design), descubiertas con find-skills. Las fuentes instaladas se registran en `skills-lock.json`.
