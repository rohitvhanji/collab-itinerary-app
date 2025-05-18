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
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editUtilityType, setEditUtilityType] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editBillDate, setEditBillDate] = useState('');
  const [editPaidBy, setEditPaidBy] = useState('');

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
    if (!utilityType.trim() || !amount || !billDate || !paidBy.trim()) return;
    try {
      const newBill = {
        home_id: homeId,
        utility_type: utilityType.trim(),
        amount: parseFloat(amount),
        bill_date: billDate,
        added_by: paidBy.trim(),
      };
      await axios.post('https://collab-itinerary-app.onrender.com/api/bills', newBill);
      fetchBills();
      setUtilityType('');
      setAmount('');
      setBillDate('');
      setPaidBy('');
    } catch (err) {
      console.error('Error adding bill:', err);
    }
  };

  const deleteBill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    try {
      await axios.delete(`https://collab-itinerary-app.onrender.com/api/bills/${id}`);
      fetchBills();
    } catch (err) {
      console.error('Error deleting bill:', err);
    }
  };

  const startEditing = (bill) => {
    setEditingId(bill.id);
    setEditUtilityType(bill.utility_type);
    setEditAmount(bill.amount);
    setEditBillDate(bill.bill_date);
    setEditPaidBy(bill.added_by);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editUtilityType.trim() || !editAmount || !editBillDate || !editPaidBy.trim()) return;
    try {
      const updatedBill = {
        utility_type: editUtilityType.trim(),
        amount: parseFloat(editAmount),
        bill_date: editBillDate,
        added_by: editPaidBy.trim(),
      };
      await axios.put(`https://collab-itinerary-app.onrender.com/api/bills/${editingId}`, updatedBill);
      setEditingId(null);
      fetchBills();
    } catch (err) {
      console.error('Error updating bill:', err);
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
        <input
          type="text"
          placeholder="Paid By"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
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
            {editingId === bill.id ? (
              <>
                <input
                  className="edit-input utility-edit"
                  type="text"
                  value={editUtilityType}
                  onChange={(e) => setEditUtilityType(e.target.value)}
                />
                <input
                  className="edit-input amount-edit"
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                />
                <input
                  className="edit-input date-edit"
                  type="date"
                  value={editBillDate}
                  onChange={(e) => setEditBillDate(e.target.value)}
                />
                <input
                  className="edit-input paidby-edit"
                  type="text"
                  value={editPaidBy}
                  onChange={(e) => setEditPaidBy(e.target.value)}
                />
                <button className="save-btn" onClick={saveEdit}>Save</button>
                <button className="cancel-btn" onClick={cancelEditing}>Cancel</button>
              </>
            ) : (
              <>
                <span className="bill-date">{bill.bill_date}</span>
                <span className="bill-utility">{bill.utility_type}</span>
                <span className="bill-amount">₹{bill.amount.toFixed(2)}</span>
                <span className="bill-addedby">(paid by {bill.added_by})</span>
                <div className="actions">
                  <button className="edit-btn" onClick={() => startEditing(bill)}>Edit</button>
                  <button className="delete-btn" onClick={() => deleteBill(bill.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
