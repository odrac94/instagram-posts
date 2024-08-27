const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Endpoint para obtener posts de Instagram
app.get('/api/instagram-posts', async (req, res) => {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const response = await axios.get(`https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,timestamp&access_token=${accessToken}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    res.status(500).json({ error: 'Error fetching Instagram posts' });
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Instagram Posts API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
