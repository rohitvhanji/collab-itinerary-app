import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [bills, setBills] = useState([]);
  const [homeId, setHomeId] = useState('home_001');
  const [utilityType, setUtilityType] = useState('');
  const [amount, setAmount] = useState('');
  const [billDate, setBillDate] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [editingBill, setEditingBill] = useState(null);

  useEffect(() => {
    fetchBills();
  }, [homeId]);

  const fetchBills = async () => {
    try {
      const res = await axios.get(`https://collab-itinerary-app.onrender.com/api/bills/${homeId}`);
      setBills(res.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const addOrUpdateBill = async () => {
    if (!utilityType || !amount || !billDate || !paidBy) return;

    try {
      if (editingBill) {
        // Update
        await axios.put(`https://collab-itinerary-app.onrender.com/api/bills/${editingBill.id}`, {
          home_id: homeId,
          utility_type: utilityType,
          amount: parseFloat(amount),
          bill_date: billDate,
          paid_by: paidBy,
          added_by: 'User'
        });
        setEditingBill(null);
      } else {
        // Add new
        await axios.post('https://collab-itinerary-app.onrender.com/api/bills', {
          home_id: homeId,
          utility_type: utilityType,
          amount: parseFloat(amount),
          bill_date: billDate,
          paid_by: paidBy,
          added_by: 'User'
        });
      }
      setUtilityType('');
      setAmount('');
      setBillDate('');
      setPaidBy('');
      fetchBills();
    } catch (error) {
      console.error('Error saving bill:', error);
    }
  };

  const startEdit = (bill) => {
    setEditingBill(bill);
    setUtilityType(bill.utility_type);
    setAmount(bill.amount.toString());
    setBillDate(bill.bill_date);
    setPaidBy(bill.paid_by);
  };

  const cancelEdit = () => {
    setEditingBill(null);
    setUtilityType('');
    setAmount('');
    setBillDate('');
    setPaidBy('');
  };

  const deleteBill = async (id) => {
    try {
      await axios.delete(`https://collab-itinerary-app.onrender.com/api/bills/${id}`);
      fetchBills();
    } catch (error) {
      console.error('Error deleting bill:', error);
    }
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '3rem auto',
      padding: '2rem',
      backgroundColor: '#f5faff',
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#005fb8' }}>Spendly - Utility Bill Tracker</h1>

      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        alignItems: 'center',
        flexWrap: 'nowrap',
      }}>
        <input
          type="text"
          placeholder="Utility Type"
          value={utilityType}
          onChange={e => setUtilityType(e.target.value)}
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={inputStyle}
        />
        <input
          type="date"
          placeholder="Bill Date"
          value={billDate}
          onChange={e => setBillDate(e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Paid By"
          value={paidBy}
          onChange={e => setPaidBy(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={addOrUpdateBill}
          style={buttonStylePrimary}
        >
          {editingBill ? 'Update Bill' : 'Add Bill'}
        </button>

        {editingBill && (
          <button
            onClick={cancelEdit}
            style={buttonStyleSecondary}
          >
            Cancel
          </button>
        )}
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {bills.map(bill => (
          <li key={bill.id} style={billRowStyle}>
            <div style={{ flex: 1 }}>{bill.bill_date}</div>
            <div style={{ flex: 1 }}>{bill.utility_type}</div>
            <div style={{ flex: 1 }}>₹{bill.amount.toFixed(2)}</div>
            <div style={{ flex: 1 }}>{bill.paid_by}</div>
            <div style={{ flex: 1 }}>{bill.added_by}</div>

            <button onClick={() => startEdit(bill)} style={iconButtonStyle} aria-label="Edit bill">✏️</button>
            <button onClick={() => deleteBill(bill.id)} style={iconButtonStyle} aria-label="Delete bill">🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Shared styles:
const inputStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  flex: '1 1 150px',
  fontSize: '14px',
  boxShadow: 'inset 0 1px 3px rgb(0 0 0 / 0.1)',
  transition: 'border-color 0.2s ease',
};

const buttonStylePrimary = {
  backgroundColor: '#0070d2',  // Salesforce blue
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  padding: '10px 16px',
  fontWeight: '600',
  cursor: 'pointer',
  minWidth: '110px',
  boxShadow: '0 4px 6px rgb(0 112 210 / 0.4)',
  transition: 'background-color 0.3s ease',
};

const buttonStyleSecondary = {
  backgroundColor: '#d9534f',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  padding: '10px 16px',
  fontWeight: '600',
  cursor: 'pointer',
  minWidth: '110px',
  boxShadow: '0 4px 6px rgb(217 83 79 / 0.4)',
  transition: 'background-color 0.3s ease',
  marginLeft: '8px',
};

const billRowStyle = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid #ddd',
  fontSize: '15px',
  color: '#333',
};

const iconButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '18px',
  marginLeft: '8px',
  color: '#0070d2',
  transition: 'color 0.2s ease',
};

export default App;
