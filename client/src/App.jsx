// App.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [bills, setBills] = useState([]);
  const [homeId, setHomeId] = useState('home_001');
  const [utilityType, setUtilityType] = useState('');
  const [amount, setAmount] = useState('');
  const [billDate, setBillDate] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    fetchBills();
  }, [homeId]);

  const fetchBills = async () => {
    try {
      const res = await axios.get(`https://collab-itinerary-app.onrender.com/api/bills/${homeId}`);
      setBills(res.data);
    } catch (err) {
      console.error('Error fetching bills:', err);
    }
  };

  const handleSubmit = async () => {
    if (!utilityType || !amount || !billDate || !paidBy) return;
    const billData = {
      home_id: homeId,
      utility_type: utilityType,
      amount: parseFloat(amount),
      bill_date: billDate,
      added_by: paidBy
    };

    try {
      if (editingIndex !== null) {
        const id = bills[editingIndex].id;
        await axios.put(`https://collab-itinerary-app.onrender.com/api/bills/${id}`, billData);
        setEditingIndex(null);
      } else {
        await axios.post('https://collab-itinerary-app.onrender.com/api/bills', billData);
      }
      setUtilityType('');
      setAmount('');
      setBillDate('');
      setPaidBy('');
      fetchBills();
    } catch (err) {
      console.error('Error adding/updating bill:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://collab-itinerary-app.onrender.com/api/bills/${id}`);
      fetchBills();
    } catch (err) {
      console.error('Error deleting bill:', err);
    }
  };

  const handleEdit = (index) => {
    const bill = bills[index];
    setUtilityType(bill.utility_type);
    setAmount(bill.amount);
    setBillDate(bill.bill_date);
    setPaidBy(bill.added_by);
    setEditingIndex(index);
  };

  return (
    <div className="app-container">
      <h1>Spendly - Expense Tracker</h1>
      <div className="input-row">
        <input value={utilityType} onChange={e => setUtilityType(e.target.value)} placeholder="Utility Type" />
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" type="number" />
        <input value={billDate} onChange={e => setBillDate(e.target.value)} placeholder="Bill Date" type="date" />
        <input value={paidBy} onChange={e => setPaidBy(e.target.value)} placeholder="Paid By" />
        <button onClick={handleSubmit}>{editingIndex !== null ? 'Update' : 'Add'} Bill</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Utility Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Paid By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill, index) => (
            <tr key={bill.id}>
              <td>{bill.utility_type}</td>
              <td>₹{bill.amount}</td>
              <td>{bill.bill_date}</td>
              <td>{bill.added_by}</td>
              <td>
                <span className="icon" onClick={() => handleEdit(index)}>✎</span>
                <span className="icon" onClick={() => handleDelete(bill.id)}>🗑</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
