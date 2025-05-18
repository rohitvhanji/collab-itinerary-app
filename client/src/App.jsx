import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const tripId = 'my_trip_123'; // demo trip id

  useEffect(() => {
    axios.get(`http://localhost:5000/api/itinerary/${tripId}`)
      .then(res => setItems(res.data));
  }, []);

  const addItem = async () => {
    if (!title || !time) return;
    const newItem = { trip_id: tripId, title, time, added_by: 'Alice' };
    const res = await axios.post('http://localhost:5000/api/itinerary', newItem);
    setItems([...items, ...res.data]);
    setTitle('');
    setTime('');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Collaborative Trip Itinerary</h1>
      <div className="mb-4">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Activity" className="border p-2 mr-2" />
        <input value={time} onChange={e => setTime(e.target.value)} placeholder="Time" className="border p-2 mr-2" />
        <button onClick={addItem} className="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
      </div>
      <ul className="list-disc pl-5">
        {items.map((item, index) => (
          <li key={index}>{item.time} – {item.title} (by {item.added_by})</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
