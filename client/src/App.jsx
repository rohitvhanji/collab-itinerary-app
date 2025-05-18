import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [bills, setBills] = useState([]);
  const [homeId, setHomeId] = useState('home_001');
  const [utilityType, setUtilityType] = useState('');
  const [amount, setAmount] = useState('');
  const [billDate, setBillDate] = useState('');

  const fetchBills = async () => {
    try {
      const res = await axios.get(`https://collab-itinerary-app.onrender.com/api/bills/${homeId}`);
      setBills(res.data);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [homeId]);

  const addBill = async () => {
    if (!utilityType || !amount || !billDate) return;
    const newBill = {
      home_id: homeId,
      utility_type: utilityType,
      amount: parseFloat(amount),
      bill_date: billDate,
      added_by: 'User'
    };
    try {
      await axios.post('https://collab-itinerary-app.onrender.com/api/bills', newBill);
      // After adding, fetch all bills again
      fetchBills();
      setUtilityType('');
      setAmount('');
      setBillDate('');
    } catch (error) {
      console.error('Failed to add bill:', error);
    }
  };

  return (
    <div className="container">
      <h1>Utility Bill Tracker</h1>
      <div className="form">
        <input
          value={utilityType}
          onChange={e => setUtilityType(e.target.value)}
          placeholder="Utility Type"
        />
        <input
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount"
          type="number"
        />
        <input
          value={billDate}
          onChange={e => setBillDate(e.target.value)}
          placeholder="Bill Date"
          type="date"
        />
        <button onClick={addBill}>Add Bill</button>
      </div>
      <ul>
        {bills.map((bill, index) => (
          <li key={index}>
            {bill.bill_date} - {bill.utility_type}: ₹{bill.amount} (by {bill.added_by})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
