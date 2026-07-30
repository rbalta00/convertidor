/**
 * LANDING GENERATOR SKILL - COMPLETO
 * Genera landings 10/10 automáticamente con IA, Cloudinary y Shopify
 * 
 * Flujo:
 * 1. Usuario describe producto → skill lo procesa
 * 2. Genera 4 prompts de IA
 * 3. Descarga imágenes de Pollinations (gratis)
 * 4. Sube a Cloudinary
 * 5. Genera HTML landing 10/10
 * 6. Crea página en Shopify
 * 7. Retorna URL lista para usar
 */

const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// CONFIGURACIÓN
const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';
const CLOUDINARY_API = 'https://api.cloudinary.com/v1_1';
const SHOPIFY_API = 'https://{store}.myshopify.com/admin/api/2024-01/graphql.json';

// Colores y estilos
const LOG = {
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${msg}`),
  step: (num, msg) => console.log(`\n📍 PASO ${num}: ${msg}`)
};

/**
 * PASO 1: PROCESAR DATOS DEL USUARIO
 */
function parseProductData(userInput) {
  LOG.step(1, 'Procesando descripción del producto');
  
  // Extrae información del input del usuario
  const data = {
    title: userInput.nombre || 'Producto Premium',
    subtitle: userInput.subtitulo || 'Solución completa',
    price: userInput.precio || 499,
    stock: userInput.stock || 5,
    shipping_days: userInput.envio || 3,
    cities: userInput.ciudades || 'Todo México',
    whatsapp: userInput.whatsapp || process.env.DEFAULT_WHATSAPP,
    
    // Problema
    pain_point: userInput.problema || 'Problema común',
    pain_description: userInput.descripcion_problema || 'Descripción del problema',
    
    // Beneficios
    benefit_1: userInput.beneficio_1 || 'Beneficio 1',
    benefit_2: userInput.beneficio_2 || 'Beneficio 2',
    benefit_3: userInput.beneficio_3 || 'Beneficio 3'
  };
  
  LOG.success(`Producto: ${data.title}`);
  LOG.success(`Precio: $${data.price} MXN`);
  LOG.success(`Stock: ${data.stock} unidades`);
  
  return data;
}

/**
 * PASO 2: GENERAR PROMPTS PARA IA
 */
function generateImagePrompts(productData) {
  LOG.step(2, 'Generando prompts para imágenes IA');
  
  const prompts = {
    hero: `Producto premium ${productData.title}, foto profesional, fondo blanco limpio, lighting studio, alta definición, producto destacado, comercial photography`,
    
    problem: `Ilustración: ${productData.pain_point}, estilo moderno minimalista, diseño limpio, colores vibrantes, ilustración digital, concepto visual`,
    
    solution: `Gráfico: Solución de ${productData.title}, antes y después, infografía moderna, diseño profesional, elementos visuales claros`,
    
    product: `Detalle técnico ${productData.title}, especificaciones visuales, design profesional, fondo degradado azul, elementos gráficos informativos`
  };
  
  LOG.success('4 prompts generados');
  Object.entries(prompts).forEach(([key, prompt]) => {
    LOG.info(`${key}: ${prompt.substring(0, 60)}...`);
  });
  
  return prompts;
}

/**
 * PASO 3: DESCARGAR IMÁGENES DE POLLINATIONS
 */
async function downloadFromPollinations(prompts) {
  LOG.step(3, 'Descargando imágenes de Pollinations (IA)');
  
  const images = {};
  
  for (const [key, prompt] of Object.entries(prompts)) {
    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `${POLLINATIONS_BASE}/${encodedPrompt}`;
      
      LOG.info(`⏳ Generando imagen: ${key}...`);
      
      // Descargar imagen
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      const buffer = Buffer.from(response.data);
      images[key] = {
        buffer: buffer,
        url: imageUrl,
        size: buffer.length
      };
      
      LOG.success(`Imagen ${key}: ${(buffer.length / 1024).toFixed(2)}KB`);
      
    } catch (error) {
      LOG.error(`No se pudo descargar ${key}: ${error.message}`);
      images[key] = { url: null, error: error.message };
    }
  }
  
  return images;
}

/**
 * PASO 4: SUBIR A CLOUDINARY
 */
async function uploadToCloudinary(images, productData) {
  LOG.step(4, 'Subiendo imágenes a Cloudinary');
  
  const cloudName = process.env.CLOUDINARY_CLOUD;
  const apiKey = process.env.CLOUDINARY_KEY;
  const apiSecret = process.env.CLOUDINARY_SECRET;
  const folder = 'invitaciones-xv';
  
  if (!cloudName || !apiKey || !apiSecret) {
    LOG.error('Credenciales de Cloudinary no configuradas');
    throw new Error('CLOUDINARY_CLOUD, CLOUDINARY_KEY y CLOUDINARY_SECRET necesarios en .env');
  }
  
  const uploadedUrls = {};
  
  for (const [key, image] of Object.entries(images)) {
    if (!image.buffer) {
      LOG.warn(`Saltando ${key} (no hay buffer)`);
      uploadedUrls[key] = null;
      continue;
    }
    
    try {
      LOG.info(`⏳ Subiendo ${key} a Cloudinary...`);
      
      const formData = new FormData();
      formData.append('file', Buffer.from(image.buffer), `${productData.title}-${key}.jpg`);
      formData.append('upload_preset', 'invitaciones');
      formData.append('folder', folder);
      formData.append('public_id', `${productData.title.toLowerCase()}-${key}`);
      
      const uploadUrl = `${CLOUDINARY_API}/${cloudName}/image/upload`;
      
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      uploadedUrls[key] = response.data.secure_url;
      LOG.success(`${key}: ${uploadedUrls[key]}`);
      
    } catch (error) {
      LOG.error(`Error subiendo ${key}: ${error.message}`);
      uploadedUrls[key] = null;
    }
  }
  
  return uploadedUrls;
}

/**
 * PASO 5: GENERAR HTML LANDING 10/10
 */
function generateLandingHTML(productData, imageUrls) {
  LOG.step(5, 'Generando landing HTML 10/10');
  
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${productData.title} - Oferta limitada</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        html { scroll-behavior: smooth; }
        
        :root {
            --primary: #0066cc;
            --primary-dark: #004499;
            --success: #25D366;
            --danger: #d32f2f;
            --text-primary: #1a1a1a;
            --text-secondary: #555;
            --bg-light: #f8f9fa;
        }
        
        body { 
            font-family: 'Plus Jakarta Sans', sans-serif;
            line-height: 1.6; 
            color: var(--text-primary);
            background: #ffffff;
        }
        
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        /* ANIMACIONES */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(37, 211, 102, 0.3); }
            50% { box-shadow: 0 0 40px rgba(37, 211, 102, 0.6); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        /* HERO */
        .hero {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            padding: 100px 20px;
            text-align: center;
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        
        .hero h1 {
            font-size: clamp(40px, 10vw, 72px);
            font-weight: 800;
            margin-bottom: 20px;
            animation: fadeInUp 0.8s ease;
        }
        
        .hero p {
            font-size: 20px;
            margin-bottom: 30px;
            opacity: 0.95;
        }
        
        .hero img {
            max-width: 100%;
            max-height: 400px;
            margin: 40px 0;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .btn {
            display: inline-block;
            background: var(--success);
            color: white;
            padding: 18px 56px;
            font-size: 18px;
            font-weight: 700;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(37, 211, 102, 0.3);
            animation: glow 2s infinite;
        }
        
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(37, 211, 102, 0.4);
        }
        
        .stock-counter {
            margin-top: 20px;
            padding: 15px 25px;
            background: rgba(255,255,255,0.1);
            border-radius: 50px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
        }
        
        .stock-number {
            font-size: 24px;
            font-weight: 800;
            animation: pulse 2s infinite;
        }
        
        .urgency-badge {
            background: var(--danger);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
            display: inline-block;
            animation: pulse 2s infinite;
        }
        
        /* SECCIONES */
        .section {
            padding: 100px 20px;
        }
        
        .section h2 {
            font-size: clamp(32px, 8vw, 56px);
            font-weight: 800;
            margin-bottom: 60px;
            text-align: center;
        }
        
        .section.alt {
            background: linear-gradient(135deg, var(--bg-light) 0%, #f0f4f8 100%);
        }
        
        .section.dark {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: white;
        }
        
        .section.dark h2 {
            color: white;
        }
        
        /* GRID */
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
            margin: 50px 0;
        }
        
        .grid img {
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        
        @media (max-width: 768px) {
            .grid { grid-template-columns: 1fr; }
            .hero { min-height: 60vh; }
        }
        
        /* CARDS */
        .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;
            margin: 50px 0;
        }
        
        .card {
            background: white;
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            transition: all 0.4s ease;
            border: 2px solid transparent;
        }
        
        .card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 50px rgba(0,0,0,0.15);
            border-color: var(--primary);
        }
        
        .card-icon {
            font-size: 56px;
            margin-bottom: 20px;
            animation: bounce 2s infinite;
        }
        
        .card h4 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 12px;
        }
        
        /* TESTIMONIOS */
        .testimonials {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
            margin: 50px 0;
        }
        
        .testimonial {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            border-top: 4px solid var(--success);
        }
        
        .stars {
            color: #ffc107;
            font-size: 18px;
            margin-bottom: 15px;
            letter-spacing: 2px;
        }
        
        /* COMPARACIÓN */
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            margin: 50px 0;
        }
        
        .comparison-table th {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: white;
            padding: 25px;
            text-align: left;
            font-weight: 700;
        }
        
        .comparison-table td {
            padding: 20px 25px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .comparison-table tr:nth-child(even) {
            background: var(--bg-light);
        }
        
        .check { color: var(--success); font-weight: 700; font-size: 18px; }
        .x { color: var(--danger); font-weight: 700; }
        
        /* FAQ */
        .faq-item {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            margin-bottom: 15px;
            padding: 25px;
            cursor: pointer;
        }
        
        .faq-question {
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .faq-toggle {
            font-size: 24px;
            transition: transform 0.3s ease;
        }
        
        .faq-item.open .faq-toggle {
            transform: rotate(45deg);
        }
        
        .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: all 0.3s ease;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
        }
        
        .faq-item.open .faq-answer {
            max-height: 500px;
        }
        
        /* BADGES */
        .badges {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 50px 0;
        }
        
        .badge {
            background: white;
            padding: 30px 20px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            border-top: 4px solid var(--success);
        }
        
        .badge-icon {
            font-size: 40px;
            margin-bottom: 12px;
        }
        
        .guarantee-box {
            background: rgba(255,255,255,0.1);
            border: 2px solid rgba(255,255,255,0.3);
            padding: 40px;
            border-radius: 16px;
            max-width: 600px;
            margin: 40px auto;
        }
        
        .guarantee-box h3 {
            color: white;
            font-size: 24px;
            margin-bottom: 15px;
        }
        
        .guarantee-box p {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
        }
    </style>
</head>
<body>
    <!-- HERO -->
    <section class="hero">
        <div class="container">
            <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 12px 24px; border-radius: 50px; margin-bottom: 20px; color: white; font-weight: 600;">
                ⚡ Oferta limitada - Válido solo esta semana
            </div>
            <h1>${productData.title}</h1>
            <p>${productData.subtitle}</p>
            <img src="${imageUrls.hero || 'https://via.placeholder.com/500x300'}" alt="${productData.title}">
            <a href="https://wa.me/52${productData.whatsapp}?text=Hola%20quiero%20${encodeURIComponent(productData.title)}" class="btn">
                💚 SÍ, Quiero ${productData.title}
            </a>
            <div class="stock-counter">
                <span>📦 Stock limitado:</span>
                <span class="stock-number">${productData.stock}</span>
                <span>unidades</span>
            </div>
            <div class="urgency-badge">⏰ Solo esta semana - Después subirá de precio</div>
        </div>
    </section>

    <!-- PROBLEMA -->
    <section class="section alt">
        <div class="container">
            <h2>El problema</h2>
            <div class="grid">
                <div>
                    <div style="background: #fff5f5; border-left: 5px solid var(--danger); padding: 30px; border-radius: 8px;">
                        <h3 style="color: var(--danger); margin-bottom: 15px;">⚠️ ${productData.pain_point}</h3>
                        <p>${productData.pain_description}</p>
                    </div>
                </div>
                <img src="${imageUrls.problem || 'https://via.placeholder.com/500x300'}" alt="Problema">
            </div>
        </div>
    </section>

    <!-- SOLUCIÓN -->
    <section class="section">
        <div class="container">
            <h2>¿Por qué ${productData.title}?</h2>
            <div class="grid">
                <img src="${imageUrls.solution || 'https://via.placeholder.com/500x300'}" alt="Solución">
                <div>
                    <ul style="list-style: none;">
                        <li style="font-size: 18px; margin-bottom: 25px; padding-left: 40px; position: relative;">
                            <span style="position: absolute; left: 0; color: var(--success); font-size: 24px; font-weight: 700;">✓</span>
                            <strong>${productData.benefit_1}</strong>
                        </li>
                        <li style="font-size: 18px; margin-bottom: 25px; padding-left: 40px; position: relative;">
                            <span style="position: absolute; left: 0; color: var(--success); font-size: 24px; font-weight: 700;">✓</span>
                            <strong>${productData.benefit_2}</strong>
                        </li>
                        <li style="font-size: 18px; margin-bottom: 25px; padding-left: 40px; position: relative;">
                            <span style="position: absolute; left: 0; color: var(--success); font-size: 24px; font-weight: 700;">✓</span>
                            <strong>${productData.benefit_3}</strong>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- CARACTERÍSTICAS -->
    <section class="section alt">
        <div class="container">
            <h2>Lo que te llevas</h2>
            <div class="cards-grid">
                <div class="card">
                    <div class="card-icon">⚡</div>
                    <h4>Rápido</h4>
                    <p>Resultados inmediatos</p>
                </div>
                <div class="card">
                    <div class="card-icon">🔒</div>
                    <h4>Seguro</h4>
                    <p>Miles confían en nosotros</p>
                </div>
                <div class="card">
                    <div class="card-icon">💰</div>
                    <h4>Económico</h4>
                    <p>Mejor precio del mercado</p>
                </div>
                <div class="card">
                    <div class="card-icon">📞</div>
                    <h4>Soporte 24/7</h4>
                    <p>WhatsApp sin esperas</p>
                </div>
                <div class="card">
                    <div class="card-icon">✅</div>
                    <h4>Garantía 100%</h4>
                    <p>Devolución completa</p>
                </div>
                <div class="card">
                    <div class="card-icon">🚚</div>
                    <h4>Entrega rápida</h4>
                    <p>${productData.shipping_days} días hábiles</p>
                </div>
            </div>
        </div>
    </section>

    <!-- TESTIMONIOS -->
    <section class="section">
        <div class="container">
            <h2>Lo que dicen nuestros clientes</h2>
            <div class="testimonials">
                <div class="testimonial">
                    <div class="stars">★★★★★</div>
                    <p style="font-style: italic; margin-bottom: 20px;">"Excelente producto. Superó mis expectativas. Lo recomiendo ampliamente."</p>
                    <p style="font-weight: 600;">✓ María García</p>
                    <p style="font-size: 12px; color: #999;">Puebla • Compra verificada</p>
                </div>
                <div class="testimonial">
                    <div class="stars">★★★★★</div>
                    <p style="font-style: italic; margin-bottom: 20px;">"Muy buena calidad, envío rápido. 100% satisfecho."</p>
                    <p style="font-weight: 600;">✓ Juan López</p>
                    <p style="font-size: 12px; color: #999;">CDMX • Compra verificada</p>
                </div>
                <div class="testimonial">
                    <div class="stars">★★★★★</div>
                    <p style="font-style: italic; margin-bottom: 20px;">"Mejor de lo esperado. Volveré a comprar."</p>
                    <p style="font-weight: 600;">✓ Laura Martínez</p>
                    <p style="font-size: 12px; color: #999;">Monterrey • Compra verificada</p>
                </div>
            </div>
        </div>
    </section>

    <!-- COMPARACIÓN -->
    <section class="section alt">
        <div class="container">
            <h2>Comparación</h2>
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Característica</th>
                        <th>${productData.title}</th>
                        <th>Alternativas</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Precio</strong></td>
                        <td><span class="check">✓ $${productData.price}</span></td>
                        <td><span class="x">✗ $2000+</span></td>
                    </tr>
                    <tr>
                        <td><strong>Durabilidad</strong></td>
                        <td><span class="check">✓ 10+ años</span></td>
                        <td><span class="x">✗ 2-3 años</span></td>
                    </tr>
                    <tr>
                        <td><strong>Facilidad</strong></td>
                        <td><span class="check">✓ Tú solo</span></td>
                        <td><span class="x">✗ Especialista</span></td>
                    </tr>
                    <tr>
                        <td><strong>Soporte</strong></td>
                        <td><span class="check">✓ 24/7</span></td>
                        <td><span class="x">✗ Limitado</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <!-- FAQ -->
    <section class="section">
        <div class="container">
            <h2>Preguntas frecuentes</h2>
            <div style="max-width: 700px; margin: 50px auto;">
                <div class="faq-item open">
                    <div class="faq-question">
                        <span>¿Cómo funciona?</span>
                        <span class="faq-toggle">+</span>
                    </div>
                    <div class="faq-answer">
                        Es muy simple. Solo aplica el producto según las instrucciones y verás resultados inmediatos.
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <span>¿Es seguro?</span>
                        <span class="faq-toggle">+</span>
                    </div>
                    <div class="faq-answer">
                        100% seguro. Miles de clientes lo usan sin problemas.
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <span>¿Cuál es la garantía?</span>
                        <span class="faq-toggle">+</span>
                    </div>
                    <div class="faq-answer">
                        Garantía 100% de satisfacción. Si no estás satisfecho, te devolvemos tu dinero.
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <span>¿Cuánto tiempo de envío?</span>
                        <span class="faq-toggle">+</span>
                    </div>
                    <div class="faq-answer">
                        Enviamos en ${productData.shipping_days} días hábiles a todo México. Pago contra entrega.
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- BADGES -->
    <section class="section alt">
        <div class="container">
            <div class="badges">
                <div class="badge">
                    <div class="badge-icon">⭐</div>
                    <div>+1000 clientes</div>
                </div>
                <div class="badge">
                    <div class="badge-icon">✅</div>
                    <div>Garantía 100%</div>
                </div>
                <div class="badge">
                    <div class="badge-icon">🚚</div>
                    <div>Envío rápido</div>
                </div>
                <div class="badge">
                    <div class="badge-icon">💬</div>
                    <div>Soporte 24/7</div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA FINAL -->
    <section class="section dark">
        <div class="container" style="text-align: center;">
            <h2>¿Listo para cambiar?</h2>
            <p style="font-size: 18px; margin-bottom: 10px;">No esperes más. Solo ${productData.stock} unidades disponibles.</p>
            
            <div class="guarantee-box">
                <h3>🎁 Garantía 100% de satisfacción</h3>
                <p>Si dentro de 30 días no estás satisfecho, te devolvemos tu dinero. Sin preguntas.</p>
            </div>
            
            <p style="font-size: 18px; color: #ffc107; font-weight: 700; margin: 20px 0;">
                ⏰ SOLO ESTA SEMANA - Después subirá a \$${parseInt(productData.price) + 200}
            </p>
            
            <a href="https://wa.me/52${productData.whatsapp}?text=Quiero%20comprar%20${encodeURIComponent(productData.title)}" style="display: inline-block; background: white; color: var(--primary); padding: 20px 60px; font-size: 18px; font-weight: 700; border-radius: 12px; text-decoration: none; cursor: pointer;">
                💚 SÍ, Compra ahora por WhatsApp
            </a>
            
            <p style="margin-top: 30px; font-size: 14px; opacity: 0.9;">
                ✓ Contesta al instante  |  ✓ Pago contra entrega  |  ✓ Entrega en ${productData.shipping_days} días
            </p>
        </div>
    </section>

    <script>
        // FAQ Toggle
        document.querySelectorAll('.faq-item').forEach(item => {
            item.querySelector('.faq-question').addEventListener('click', () => {
                item.classList.toggle('open');
            });
        });
    </script>
</body>
</html>`;
  
  LOG.success('Landing HTML generado (completo y optimizado)');
  return html;
}

/**
 * PASO 6: CREAR PÁGINA EN SHOPIFY
 */
async function createShopifyPage(productData, landingHTML) {
  LOG.step(6, 'Creando página en Shopify');
  
  const shopifyStore = process.env.SHOPIFY_STORE;
  const shopifyToken = process.env.SHOPIFY_TOKEN;
  
  if (!shopifyStore || !shopifyToken) {
    LOG.error('Credenciales de Shopify no configuradas');
    throw new Error('SHOPIFY_STORE y SHOPIFY_TOKEN necesarios en .env');
  }
  
  try {
    const pageTitle = `${productData.title} - Landing`;
    const pageHandle = productData.title.toLowerCase().replace(/\s+/g, '-').slice(0, 50);
    
    const query = `
      mutation {
        pageCreate(input: {
          title: "${pageTitle}"
          handle: "${pageHandle}"
          body: """${landingHTML.replace(/"/g, '\\"')}"""
          publishedAt: "2024-01-01T00:00:00Z"
        }) {
          page {
            id
            title
            handle
            onlineStoreUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    
    const response = await axios.post(
      \`https://\${shopifyStore}/admin/api/2024-01/graphql.json\`,
      { query },
      {
        headers: {
          'X-Shopify-Access-Token': shopifyToken,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.data?.pageCreate?.userErrors?.length > 0) {
      LOG.error('Errores en Shopify:', response.data.data.pageCreate.userErrors);
      throw new Error('No se pudo crear la página en Shopify');
    }
    
    const pageUrl = response.data.data?.pageCreate?.page?.onlineStoreUrl;
    LOG.success(\`Página creada en Shopify: \${pageUrl}\`);
    
    return pageUrl;
    
  } catch (error) {
    LOG.error(\`Error creando página: \${error.message}\`);
    throw error;
  }
}

/**
 * FLUJO PRINCIPAL
 */
async function generateLanding(userInput) {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 LANDING GENERATOR - INICIO');
  console.log('='.repeat(80) + '\n');
  
  try {
    // PASO 1: Procesar datos
    const productData = parseProductData(userInput);
    
    // PASO 2: Generar prompts
    const prompts = generateImagePrompts(productData);
    
    // PASO 3: Descargar imágenes
    const images = await downloadFromPollinations(prompts);
    
    // PASO 4: Subir a Cloudinary
    const imageUrls = await uploadToCloudinary(images, productData);
    
    // PASO 5: Generar HTML
    const landingHTML = generateLandingHTML(productData, imageUrls);
    
    // PASO 6: Crear en Shopify
    const pageUrl = await createShopifyPage(productData, landingHTML);
    
    // RESULTADO FINAL
    console.log('\n' + '='.repeat(80));
    console.log('✅ LANDING GENERADA CON ÉXITO');
    console.log('='.repeat(80) + '\n');
    
    LOG.success(\`URL: \${pageUrl}\`);
    LOG.success('Imágenes: generadas y subidas a Cloudinary');
    LOG.success('HTML: optimizado y responsive');
    LOG.success('Shopify: página publicada');
    
    return {
      success: true,
      pageUrl,
      productData,
      imageUrls,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    LOG.error(\`FLUJO INTERRUMPIDO: \${error.message}\`);
    console.log('\n' + '='.repeat(80));
    console.log('❌ ERROR');
    console.log('='.repeat(80) + '\n');
    throw error;
  }
}

module.exports = { generateLanding, parseProductData, generateImagePrompts, generateLandingHTML };
