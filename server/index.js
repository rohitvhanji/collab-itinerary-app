const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.get('/api/itinerary/:tripId', async (req, res) => {
  const { tripId } = req.params;
  const { data, error } = await supabase
    .from('itinerary_items')
    .select('*')
    .eq('trip_id', tripId);
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post('/api/itinerary', async (req, res) => {
  const { trip_id, title, time, added_by } = req.body;
  const { data, error } = await supabase
    .from('itinerary_items')
    .insert([{ trip_id, title, time, added_by }]);
  if (error) return res.status(500).json({ error });
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
