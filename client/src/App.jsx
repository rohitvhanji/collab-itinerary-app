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

  // Fetch bills function with error handling
  const fetchBills = async () => {
    try {
      const res = await axios.get(`https://collab-itinerary-app.onrender.com/api/bills/${homeId}`);
      setBills(res.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [homeId]);

  // Add or Update bill function
  const addOrUpdateBill = async () => {
    if (!utilityType || !amount || !billDate || !paidBy) return;

    try {
      if (editingBill) {
        // Update existing bill
        await axios.put(`https://collab-itinerary-app.onrender.com/api/bills/${editingBill.id}`, {
          home_id: homeId,
          utility_type: utilityType,
          amount: parseFloat(amount),
          bill_date: billDate,
          paid_by: paidBy,
          added_by: 'User',
        });
        setEditingBill(null);
      } else {
        // Add new bill
        await axios.post('https://collab-itinerary-app.onrender.com/api/bills', {
          home_id: homeId,
          utility_type: utilityType,
          amount: parseFloat(amount),
          bill_date: billDate,
          paid_by: paidBy,
          added_by: 'User',
        });
      }
      // Refresh list after add/update
      await fetchBills();

      // Reset input fields
      setUtilityType('');
      setAmount('');
      setBillDate('');
      setPaidBy('');
    } catch (error) {
      console.error('Error adding/updating bill:', error);
    }
  };

  // Delete bill function with error handling
  const deleteBill = async (id) => {
    try {
      await axios.delete(`https://collab-itinerary-app.onrender.com/api/bills/${id}`);
      // Refresh list after delete
      await fetchBills();
    } catch (error) {
      console.error('Error deleting bill:', error);
    }
  };

  // Start editing a bill: populate fields
  const startEdit = (bill) => {
    setEditingBill(bill);
    setUtilityType(bill.utility_type);
    setAmount(bill.amount);
    setBillDate(bill.bill_date);
    setPaidBy(bill.paid_by || '');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingBill(null);
    setUtilityType('');
    setAmount('');
    setBillDate('');
    setPaidBy('');
  };

  return (
    <div className="container" style={{
      maxWidth: '900px',
      margin: '2rem auto',
      backgroundColor: '#F4F8FB',  // Salesforce light blue background
      borderRadius: '10px',
      padding: '2rem',
      boxShadow: '0 0 15px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '1.5rem', textAlign: 'center' }}>
        Spendly
      </h1>
      <div className="form" style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <input
          value={utilityType}
          onChange={e => setUtilityType(e.target.value)}
          placeholder="Utility Type"
          style={{ flex: '1 1 150px', padding: '0.5rem' }}
        />
        <input
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount"
          type="number"
          style={{ flex: '1 1 100px', padding: '0.5rem' }}
        />
        <input
          value={billDate}
          onChange={e => setBillDate(e.target.value)}
          placeholder="Bill Date"
          type="date"
          style={{ flex: '1 1 150px', padding: '0.5rem' }}
        />
        <input
          value={paidBy}
          onChange={e => setPaidBy(e.target.value)}
          placeholder="Paid By"
          style={{ flex: '1 1 150px', padding: '0.5rem' }}
        />
        <button
          onClick={addOrUpdateBill}
          style={{
            backgroundColor: '#27ae60',
            color: 'white',
            padding: '0.6rem 1.2rem',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            flex: '0 0 auto',
            alignSelf: 'center',
            minWidth: '100px',
          }}
        >
          {editingBill ? 'Update Bill' : 'Add Bill'}
        </button>
        {editingBill && (
          <button
            onClick={cancelEdit}
            style={{
              backgroundColor: '#e74c3c',
              color: 'white',
              padding: '0.6rem 1.2rem',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              flex: '0 0 auto',
              alignSelf: 'center',
              minWidth: '100px',
            }}
          >
            Cancel
          </button>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
        <thead style={{ backgroundColor: '#34495e', color: 'white' }}>
          <tr>
            <th style={{ padding: '0.8rem', border: '1px solid #ddd' }}>Date</th>
            <th style={{ padding: '0.8rem', border: '1px solid #ddd' }}>Utility Type</th>
            <th style={{ padding: '0.8rem', border: '1px solid #ddd' }}>Amount (₹)</th>
            <th style={{ padding: '0.8rem', border: '1px solid #ddd' }}>Paid By</th>
            <th style={{ padding: '0.8rem', border: '1px solid #ddd' }}>Added By</th>
            <th style={{ padding: '0.8rem', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bills.length === 0 && (
            <tr>
              <td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                No bills found.
              </td>
            </tr>
          )}
          {bills.map((bill) => (
            <tr key={bill.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '0.6rem', border: '1px solid #ddd' }}>{bill.bill_date}</td>
              <td style={{ padding: '0.6rem', border: '1px solid #ddd' }}>{bill.utility_type}</td>
              <td style={{ padding: '0.6rem', border: '1px solid #ddd' }}>{bill.amount.toFixed(2)}</td>
              <td style={{ padding: '0.6rem', border: '1px solid #ddd' }}>{bill.paid_by}</td>
              <td style={{ padding: '0.6rem', border: '1px solid #ddd' }}>{bill.added_by}</td>
              <td style={{ padding: '0.6rem', border: '1px solid #ddd', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => startEdit(bill)}
                  style={{
                    backgroundColor: '#2980b9',
                    color: 'white',
                    border: 'none',
                    padding: '0.3rem 0.7rem',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteBill(bill.id)}
                  style={{
                    backgroundColor: '#c0392b',
                    color: 'white',
                    border: 'none',
                    padding: '0.3rem 0.7rem',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
