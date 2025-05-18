import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [bills, setBills] = useState([]);
  const [homeId, setHomeId] = useState('home_001');
  const [utilityType, setUtilityType] = useState('');
  const [amount, setAmount] = useState('');
  const [billDate, setBillDate] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`https://collab-itinerary-app.onrender.com/api/bills/${homeId}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setBills(res.data);
          setError(null);
        } else {
          setBills([]);
          setError('Unexpected response from server');
        }
      })
      .catch(() => setError('Failed to fetch bills'));
  }, [homeId]);

  const addBill = async () => {
    if (!utilityType || !amount || !billDate) return alert('Please fill all fields.');

    const newBill = {
      home_id: homeId,
      utility_type: utilityType,
      amount: parseFloat(amount),
      bill_date: billDate,
      added_by: 'User'
    };

    try {
      const res = await axios.post('https://collab-itinerary-app.onrender.com/api/bills', newBill);

      if (res.data) {
        // res.data might be an array or a single object
        if (Array.isArray(res.data)) {
          setBills(prev => [...prev, ...res.data]);
        } else {
          setBills(prev => [...prev, res.data]);
        }
        setUtilityType('');
        setAmount('');
        setBillDate('');
        setError(null);
      } else {
        setError('No data returned from server');
      }
    } catch {
      setError('Error adding bill');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Utility Bill Tracker</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          style={{ flexGrow: 1, padding: '0.5rem' }}
          value={utilityType}
          onChange={e => setUtilityType(e.target.value)}
          placeholder="Utility Type (Electricity, Gas...)"
        />
        <input
          style={{ width: '100px', padding: '0.5rem' }}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount"
          type="number"
          min="0"
        />
        <input
          style={{ padding: '0.5rem' }}
          value={billDate}
          onChange={e => setBillDate(e.target.value)}
          placeholder="Bill Date"
          type="date"
        />
        <button
          style={{ padding: '0.5rem 1rem', backgroundColor: '#0070f3', color: 'white', border: 'none', cursor: 'pointer' }}
          onClick={addBill}
        >
          Add Bill
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {bills.length === 0 && <li>No bills recorded yet.</li>}
        {bills.map((bill, index) => (
          <li
            key={index}
            style={{
              padding: '0.5rem',
              borderBottom: '1px solid #ccc',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>{bill.bill_date} - {bill.utility_type}</span>
            <span>₹{bill.amount.toFixed(2)}</span>
            <span style={{ fontStyle: 'italic', color: '#555' }}>by {bill.added_by}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
