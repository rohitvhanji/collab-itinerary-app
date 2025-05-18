import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';  // We'll create this for styling

function App() {
  const [bills, setBills] = useState([]);
  const [homeId, setHomeId] = useState('home_001');
  const [utilityType, setUtilityType] = useState('');
  const [amount, setAmount] = useState('');
  const [billDate, setBillDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://collab-itinerary-app.onrender.com/api/bills/${homeId}`);
      setBills(res.data);
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [homeId]);

  const addBill = async () => {
    if (!utilityType.trim() || !amount || !billDate) return;
    try {
      const newBill = {
        home_id: homeId,
        utility_type: utilityType.trim(),
        amount: parseFloat(amount),
        bill_date: billDate,
        added_by: 'User',
      };
      await axios.post('https://collab-itinerary-app.onrender.com/api/bills', newBill);
      // Fetch updated bills
      fetchBills();
      setUtilityType('');
      setAmount('');
      setBillDate('');
    } catch (err) {
      console.error('Error adding bill:', err);
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Utility Bill Tracker</h1>

      <div className="form-container">
        <input
          type="text"
          placeholder="Utility Type"
          value={utilityType}
          onChange={(e) => setUtilityType(e.target.value)}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field"
        />
        <input
          type="date"
          value={billDate}
          onChange={(e) => setBillDate(e.target.value)}
          className="input-field"
        />
        <button className="add-button" onClick={addBill} disabled={loading}>
          {loading ? 'Adding...' : 'Add Bill'}
        </button>
      </div>

      <ul className="bills-list">
        {bills.length === 0 && !loading && <li className="empty-text">No bills added yet.</li>}
        {bills.map((bill) => (
          <li key={bill.id} className="bill-item">
            <span className="bill-date">{bill.bill_date}</span> —{' '}
            <span className="bill-utility">{bill.utility_type}</span>: ₹
            <span className="bill-amount">{bill.amount.toFixed(2)}</span> <span className="bill-addedby">(by {bill.added_by})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
