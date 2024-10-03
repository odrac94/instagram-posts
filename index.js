const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const InstagramStrategy = require('passport-instagram').Strategy;
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar CORS para permitir solo orígenes específicos
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Configurar rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 solicitudes por ventana por IP
});
app.use(limiter);

// Configurar express-session para almacenar la sesión del usuario
app.use(session({
  secret: 'secret', // cambia esto por un secreto seguro
  resave: false,
  saveUninitialized: true,
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar Passport para usar la estrategia de Instagram
passport.use(new InstagramStrategy({
  clientID: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  callbackURL: `${process.env.BASE_URL}/auth/instagram/callback`
}, (accessToken, refreshToken, profile, done) => {
  // Guardar el accessToken en la sesión para usarlo después
  return done(null, { profile, accessToken });
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Ruta para iniciar la autenticación con Instagram
app.get('/auth/instagram', passport.authenticate('instagram'));

// Ruta de callback de OAuth
app.get('/auth/instagram/callback',
  passport.authenticate('instagram', { failureRedirect: '/' }),
  (req, res) => {
    // Autenticación exitosa, redirigir al cliente
    res.redirect('/');
  }
);

// Ruta para obtener los posts de Instagram autenticados
app.get('/api/instagram-posts', async (req, res) => {
  try {
    if (!req.user || !req.user.accessToken) {
      return res.status(401).json({ error: 'Not authenticated with Instagram' });
    }

    const accessToken = req.user.accessToken;
    const response = await axios.get(`https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,timestamp&access_token=${accessToken}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    res.status(500).json({ error: 'Error fetching Instagram posts' });
  }
});

// Ruta de estado del servidor
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});