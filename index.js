const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar CORS para permitir solo orígenes específicos
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:3000', 'https://608da5-05.myshopify.com'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Configurar rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 solicitudes por ventana por IP
});
app.use(limiter);

// Función para sanitizar errores antes de registrarlos
const sanitizeError = (error) => {
  const sanitized = {
    message: error.message,
    stack: error.stack
  };
  // Eliminar información sensible si es necesario
  delete sanitized.config; // Elimina detalles de la configuración de axios
  return sanitized;
};

// Endpoint para obtener posts de Instagram
app.get('/api/instagram-posts', async (req, res) => {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('Instagram access token is not configured');
    }
    const response = await axios.get(`https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,timestamp&access_token=${accessToken}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Instagram posts:', sanitizeError(error));
    res.status(500).json({ error: 'Error fetching Instagram posts' });
  }
});

// Ruta de estado del servidor
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Instagram Posts API');
});

// Inicializar el servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
