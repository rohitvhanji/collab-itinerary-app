const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

app.use(cors());

app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Get bills for a home
app.get('/api/bills/:homeId', async (req, res) => {
  const { homeId } = req.params;
  const { data, error } = await supabase
    .from('utility_bills')
    .select('*')
    .eq('home_id', homeId);
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// Add new bill
app.post('/api/bills', async (req, res) => {
  const { home_id, utility_type, amount, bill_date, added_by } = req.body;
  const { data, error } = await supabase
    .from('utility_bills')
    .insert([{ home_id, utility_type, amount, bill_date, added_by }]);
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// Update a bill by id
app.put('/api/bills/:id', async (req, res) => {
  const { id } = req.params;
  const { utility_type, amount, bill_date, added_by } = req.body;
  const { data, error } = await supabase
    .from('utility_bills')
    .update({ utility_type, amount, bill_date, added_by })
    .eq('id', id);
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// Delete a bill by id
app.delete('/api/bills/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('utility_bills')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error });
  res.json({ message: 'Deleted successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
