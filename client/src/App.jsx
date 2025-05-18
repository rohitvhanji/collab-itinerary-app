import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [bills, setBills] = useState([]);
  const [homeId] = useState("home_001");
  const [utilityType, setUtilityType] = useState("");
  const [amount, setAmount] = useState("");
  const [billDate, setBillDate] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [editingBillId, setEditingBillId] = useState(null);

  async function fetchBills() {
    try {
      const res = await axios.get(
        `https://collab-itinerary-app.onrender.com/api/bills/${homeId}`
      );
      setBills(res.data);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setBills([]); // reset on error
    }
  }

  useEffect(() => {
    fetchBills();
  }, [homeId]);

  const resetInputs = () => {
    setUtilityType("");
    setAmount("");
    setBillDate("");
    setPaidBy("");
    setEditingBillId(null);
  };

  const addOrUpdateBill = async () => {
    if (!utilityType || !amount || !billDate || !paidBy) {
      alert("All fields are required");
      return;
    }

    try {
      if (editingBillId) {
        await axios.put(
          `https://collab-itinerary-app.onrender.com/api/bills/${editingBillId}`,
          {
            utility_type: utilityType,
            amount: parseFloat(amount),
            bill_date: billDate,
            added_by: paidBy,
          }
        );
      } else {
        await axios.post("https://collab-itinerary-app.onrender.com/api/bills", {
          home_id: homeId,
          utility_type: utilityType,
          amount: parseFloat(amount),
          bill_date: billDate,
          added_by: paidBy,
        });
      }
      await fetchBills();
      resetInputs();
    } catch (error) {
      console.error("Error adding/updating expense:", error);
      alert("Failed to add or update expense.");
    }
  };

  const deleteBill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      await axios.delete(`https://collab-itinerary-app.onrender.com/api/bills/${id}`);
      if (editingBillId === id) resetInputs();
      await fetchBills();
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense.");
    }
  };

  const startEditBill = (bill) => {
    setEditingBillId(bill.id);
    setUtilityType(bill.utility_type);
    setAmount(bill.amount);
    setBillDate(bill.bill_date);
    setPaidBy(bill.added_by);
  };

  const cancelEdit = () => {
    resetInputs();
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Spendly — Expense Tracker</h1>

      <div className="input-row">
        <input
          type="text"
          placeholder="Expense Type"
          value={utilityType}
          onChange={(e) => setUtilityType(e.target.value)}
          className="input-utility-type"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-amount"
        />
        <input
          type="date"
          placeholder="Expense Date"
          value={billDate}
          onChange={(e) => setBillDate(e.target.value)}
          className="input-bill-date"
        />
        <input
          type="text"
          placeholder="Paid By"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="input-paid-by"
        />

        <button onClick={addOrUpdateBill} className="button-primary">
          {editingBillId ? "Update Expense" : "Add Expense"}
        </button>

        {editingBillId && (
          <button onClick={cancelEdit} className="button-secondary">
            Cancel
          </button>
        )}
      </div>

      <ul className="bills-list">
        {bills.length === 0 && <li className="no-bills">No expenses found.</li>}

        {bills.map((bill) => (
          <li key={bill.id} className="bills-list-item">
            <div className="bills-list-item-info">
              {bill.utility_type} - ₹{bill.amount.toFixed(2)} -{" "}
              {new Date(bill.bill_date).toLocaleDateString()} - Paid by: {bill.added_by}
            </div>
            <div className="bills-list-item-actions">
              <button
                onClick={() => startEditBill(bill)}
                className="button-primary"
              >
                Edit
              </button>
              <button
                onClick={() => deleteBill(bill.id)}
                className="button-secondary"
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
