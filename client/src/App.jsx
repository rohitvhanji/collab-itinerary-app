import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [bills, setBills] = useState([]);
  const [homeId, setHomeId] = useState('home_001');

  // Form state
  const [utilityType, setUtilityType] = useState('');
  const [amount, setAmount] = useState('');
  const [billDate, setBillDate] = useState('');
  const [paidBy, setPaidBy] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editUtilityType, setEditUtilityType] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editBillDate, setEditBillDate] = useState('');
  const [editPaidBy, setEditPaidBy] = useState('');

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

  const addBill = async () => {
    if (!utilityType || !amount || !billDate || !paidBy) return alert('Please fill all fields');
    try {
      await axios.post('https://collab-itinerary-app.onrender.com/api/bills', {
        home_id: homeId,
        utility_type: utilityType,
        amount: parseFloat(amount),
        bill_date: billDate,
        added_by: paidBy,
      });
      setUtilityType('');
      setAmount('');
      setBillDate('');
      setPaidBy('');
      fetchBills();
    } catch (err) {
      console.error('Error adding bill:', err);
    }
  };

  const startEdit = (bill) => {
    setEditingId(bill.id);
    setEditUtilityType(bill.utility_type);
    setEditAmount(bill.amount);
    setEditBillDate(bill.bill_date);
    setEditPaidBy(bill.added_by);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editUtilityType || !editAmount || !editBillDate || !editPaidBy) return alert('Please fill all fields');
    try {
      await axios.put(`https://collab-itinerary-app.onrender.com/api/bills/${editingId}`, {
        utility_type: editUtilityType,
        amount: parseFloat(editAmount),
        bill_date: editBillDate,
        added_by: editPaidBy,
      });
      setEditingId(null);
      fetchBills();
    } catch (err) {
      console.error('Error updating bill:', err);
    }
  };

  const deleteBill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    try {
      await axios.delete(`https://collab-itinerary-app.onrender.com/api/bills/${id}`);
      // Remove from state immediately for UI responsiveness
      setBills(bills.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error deleting bill:', err);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '30px auto', padding: 20, backgroundColor: '#f0f4f8', borderRadius: 8, fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#0070d2' }}>Spendly - Utility Bill Tracker</h1>

      {/* Add bill form */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Utility Type"
          value={utilityType}
          onChange={e => setUtilityType(e.target.value)}
          style={{ flex: '1 1 150px', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ flex: '1 1 100px', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <input
          type="date"
          placeholder="Bill Date"
          value={billDate}
          onChange={e => setBillDate(e.target.value)}
          style={{ flex: '1 1 140px', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Paid By"
          value={paidBy}
          onChange={e => setPaidBy(e.target.value)}
          style={{ flex: '1 1 120px', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button
          onClick={addBill}
          style={{ backgroundColor: '#0070d2', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 15px', cursor: 'pointer' }}
          title="Add Bill"
        >
          + Add Bill
        </button>
      </div>

      {/* Bills table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 5px rgb(0 0 0 / 0.1)' }}>
        <thead style={{ backgroundColor: '#0070d2', color: 'white' }}>
          <tr>
            <th style={{ padding: 10, textAlign: 'left' }}>Utility Type</th>
            <th style={{ padding: 10, textAlign: 'right' }}>Amount (₹)</th>
            <th style={{ padding: 10, textAlign: 'center' }}>Bill Date</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Paid By</th>
            <th style={{ padding: 10, textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill) => (
            editingId === bill.id ? (
              <tr key={bill.id} style={{ backgroundColor: '#e3f2fd' }}>
                <td style={{ padding: 8 }}>
                  <input
                    type="text"
                    value={editUtilityType}
                    onChange={e => setEditUtilityType(e.target.value)}
                    style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc', textAlign: 'right' }}
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <input
                    type="date"
                    value={editBillDate}
                    onChange={e => setEditBillDate(e.target.value)}
                    style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <input
                    type="text"
                    value={editPaidBy}
                    onChange={e => setEditPaidBy(e.target.value)}
                    style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                </td>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  <button
                    onClick={saveEdit}
                    style={{ marginRight: 8, backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 4, padding: '5px 10px', cursor: 'pointer' }}
                    title="Save"
                  >
                    ✔
                  </button>
                  <button
                    onClick={cancelEdit}
                    style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4, padding: '5px 10px', cursor: 'pointer' }}
                    title="Cancel"
                  >
                    ✖
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={bill.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: 10 }}>{bill.utility_type}</td>
                <td style={{ padding: 10, textAlign: 'right' }}>{bill.amount.toFixed(2)}</td>
                <td style={{ padding: 10, textAlign: 'center' }}>{bill.bill_date}</td>
                <td style={{ padding: 10 }}>{bill.added_by}</td>
                <td style={{ padding: 10, textAlign: 'center' }}>
                  <button
                    onClick={() => startEdit(bill)}
                    style={{ marginRight: 8, backgroundColor: '#0070d2', color: 'white', border: 'none', borderRadius: 4, padding: '5px 10px', cursor: 'pointer' }}
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteBill(bill.id)}
                    style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4, padding: '5px 10px', cursor: 'pointer' }}
                    title="Delete"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            )
          ))}
          {bills.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#555' }}>
                No bills found. Add some!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
