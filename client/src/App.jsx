import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [bills, setBills] = useState([]);
  const [homeId, setHomeId] = useState('home_001');
  const [utilityType, setUtilityType] = useState('');
  const [amount, setAmount] = useState('');
  const [billDate, setBillDate] = useState('');
  const [loading, setLoading] = useState(false);

  const backendUrl = 'https://collab-itinerary-app.onrender.com'; // replace with your backend URL

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/bills/${homeId}`);
      setBills(res.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [homeId]);

  const addBill = async () => {
    if (!utilityType || !amount || !billDate) {
      alert('Please fill all fields');
      return;
    }

    const newBill = {
      home_id: homeId,
      utility_type: utilityType,
      amount: parseFloat(amount),
      bill_date: billDate,
      added_by: 'User',
    };

    try {
      setLoading(true);
      await axios.post(`${backendUrl}/api/bills`, newBill);
      await fetchBills();
      setUtilityType('');
      setAmount('');
      setBillDate('');
    } catch (error) {
      console.error('Error adding bill:', error);
      alert('Failed to add bill, try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{ maxWidth: 600, margin: 'auto', padding: 20, fontFamily: 'Arial, sans-serif' }}
    >
      <h1 style={{ textAlign: 'center' }}>Utility Bill Tracker</h1>

      <div
        className="form"
        style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}
      >
        <input
          value={utilityType}
          onChange={e => setUtilityType(e.target.value)}
          placeholder="Utility Type (e.g. Electricity)"
          style={{ flex: '1 1 150px', padding: 8 }}
        />
        <input
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount"
          type="number"
          style={{ flex: '1 1 100px', padding: 8 }}
        />
        <input
          value={billDate}
          onChange={e => setBillDate(e.target.value)}
          placeholder="Bill Date"
          type="date"
          style={{ flex: '1 1 150px', padding: 8 }}
        />
        <button
          onClick={addBill}
          disabled={loading}
          style={{
            padding: '8px 16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: '#2563EB', // nice blue
            color: 'white',
            border: 'none',
            borderRadius: 5,
            transition: 'background-color 0.2s, transform 0.1s',
            userSelect: 'none',
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={e => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onFocus={e => {
            e.currentTarget.style.outline = '2px solid #60A5FA';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={e => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          {loading ? 'Processing...' : 'Add Bill'}
        </button>
      </div>

      {loading && bills.length === 0 ? (
        <p>Loading bills...</p>
      ) : bills.length === 0 ? (
        <p>No bills found for home: {homeId}</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {bills.map(bill => (
            <li
              key={bill.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: 5,
                marginBottom: 10,
                padding: 10,
                background: '#f9f9f9',
              }}
            >
              <strong>{bill.utility_type}</strong> — ₹{bill.amount.toFixed(2)} on {bill.bill_date} <br />
              <small>Added by: {bill.added_by}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
