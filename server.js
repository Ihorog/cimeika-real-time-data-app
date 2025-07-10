const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'YOUR_WEATHER_API_KEY';
const ASTROLOGY_API_KEY = process.env.ASTROLOGY_API_KEY || 'YOUR_ASTROLOGY_API_KEY';

app.get('/api/weather', async (req, res) => {
  const city = req.query.city || 'London';
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, appid: WEATHER_API_KEY }
    });
    res.json(response.data);
  }  catch  ( помилка )  {
    консоль.помилка ( повідомлення про помилку ) ;​​
    якщо  ( помилка.відповідь ) {​​ 
      // API апстріму повернув відповідь про помилку
      res.status ( error.response.status ) .json ( {​​​​​​​
        помилка: помилка.відповідь.дані ?.повідомлення || ' Помилка API вищого рівня '  
      } ) ;
    }  інакше  якщо  ( помилка.запит ) {​​ 
      // Відповіді від API основного потоку не отримано
      res.status ( 502 ) .json ( { error : ' Немає відповіді від метеослужби' } ) ;  
    }  інше  {
      // Інші помилки (наприклад, помилки кодування)
      res.status ( 500 ) .json ( { error : ' Не вдалося отримати дані про погоду ' } ) ;  
    }
  }
});

app.get('/api/astrology', async (req, res) => {
  const sign = req.query.sign || 'aries';
  try {
    const response = await axios.get('https://api.freeastrologyapi.com/forecast', {
      params: { sign, apikey: ASTROLOGY_API_KEY }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch astrology data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
