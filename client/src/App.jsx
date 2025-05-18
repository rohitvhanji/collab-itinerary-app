import { useEffect, useState } from 'react';
import axios from 'axios';

const inputStyle = {
  padding: '0.5rem 0.75rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '1rem',
};

const buttonStylePrimary = {
  backgroundColor: '#0070d2', // Salesforce Blue
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  fontWeight: '600',
};

const buttonStyleSecondary = {
  backgroundColor: '#e0e6ed',
  color: '#333',
  border: 'none',
  borderRadius: '4px',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  fontWeight: '600',
  marginLeft: '0.5rem',
};

function App() {
  const [bills, setBills] = useState([]);
  const [homeId, setHomeId] = useState('home_001');
  const [utilityType, setUtilityType] = useState('');
  const [amount, setAmount] = useState('');
  const [billDate, setBillDate] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [editingBill, setEditingBill] = useState(null); // id of bill being edited or null

  // Fetch bills from backend
  const fetchBills = async () => {
    try {
      const res = await axios.get(`https://collab-itinerary-app.onrender.com/api/bills/${homeId}`);
      setBills(res.data);
    } catch (err) {
      console.error('Error fetching bills:', err);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [homeId]);

  // Reset all inputs
  const resetInputs = () => {
    setUtilityType('');
    setAmount('');
    setBillDate('');
    setPaidBy('');
    setEditingBill(null);
  };

  // Add or update bill handler
  const addOrUpdateBill = async () => {
    if (!utilityType || !amount || !billDate || !paidBy) return;

    try {
      if (editingBill) {
        // Update existing bill
        await axios.put(`https://collab-itinerary-app.onrender.com/api/bills/${editingBill}`, {
          home_id: homeId,
          utility_type: utilityType,
          amount: parseFloat(amount),
          bill_date: billDate,
          added_by: paidBy,
        });
      } else {
        // Add new bill
        await axios.post('https://collab-itinerary-app.onrender.com/api/bills', {
          home_id: homeId,
          utility_type: utilityType,
          amount: parseFloat(amount),
          bill_date: billDate,
          added_by: paidBy,
        });
      }
      await fetchBills();
      resetInputs();
    } catch (err) {
      console.error('Error adding/updating bill:', err);
    }
  };

  // Delete bill handler
  const deleteBill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;

    try {
      await axios.delete(`https://collab-itinerary-app.onrender.com/api/bills/${id}`);
      await fetchBills();
      if (editingBill === id) resetInputs();
    } catch (err) {
      console.error('Error deleting bill:', err);
    }
  };

  // Edit button handler: populate inputs with selected bill data
  const startEditBill = (bill) => {
    setEditingBill(bill.id);
    setUtilityType(bill.utility_type);
    setAmount(bill.amount);
    setBillDate(bill.bill_date);
    setPaidBy(bill.added_by);
  };

  // Cancel editing
  const cancelEdit = () => {
    resetInputs();
  };

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '2rem auto',
        padding: '2rem',
        backgroundColor: '#f0f8ff', // Salesforce light blue background
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgb(0 0 0 / 0.1)',
        minHeight: '550px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 style={{ textAlign: 'center', color: '#0070d2', marginBottom: '2rem' }}>
        Spendly — Utility Bill Tracker
      </h1>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          alignItems: 'center',
          flexWrap: 'nowrap',
          overflowX: 'auto',
        }}
      >
        <input
          type="text"
          placeholder="Utility Type"
          value={utilityType}
          onChange={e => setUtilityType(e.target.value)}
          style={{ ...inputStyle, flex: '0 0 180px' }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ ...inputStyle, flex: '0 0 120px' }}
        />
        <input
          type="date"
          placeholder="Bill Date"
          value={billDate}
          onChange={e => setBillDate(e.target.value)}
          style={{ ...inputStyle, flex: '0 0 160px' }}
        />
        <input
          type="text"
          placeholder="Paid By"
          value={paidBy}
          onChange={e => setPaidBy(e.target.value)}
          style={{ ...inputStyle, flex: '0 0 150px' }}
        />

        <button onClick={addOrUpdateBill} style={buttonStylePrimary}>
          {editingBill ? 'Update Bill' : 'Add Bill'}
        </button>

        {editingBill && (
          <button onClick={cancelEdit} style={buttonStyleSecondary}>
            Cancel
          </button>
        )}
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {bills.map((bill) => (
          <li
            key={bill.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: 'white',
              marginBottom: '0.8rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              fontSize: '1rem',
            }}
          >
            <div style={{ flex: '1 1 auto' }}>
              <strong>{bill.bill_date}</strong> — {bill.utility_type}: ₹{bill.amount} (Paid by: {bill.added_by})
            </div>
            <div style={{ flexShrink: 0, display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => startEditBill(bill)}
                style={{
                  ...buttonStyleSecondary,
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.85rem',
                }}
              >
                Edit
              </button>
              <button
                onClick={() => deleteBill(bill.id)}
                style={{
                  backgroundColor: '#d9534f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
