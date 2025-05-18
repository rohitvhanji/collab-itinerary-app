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

  // New state to hold selected month for analytics filter
  // Format: "YYYY-MM" e.g. "2025-05"
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Initialize to current month in YYYY-MM format
    const now = new Date();
    return now.toISOString().slice(0, 7);
  });

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

  // -- New Analytics Computations --

  // Filter bills for the selected month (YYYY-MM)
  const filteredBills = bills.filter((bill) => {
    // bill.bill_date format assumed "YYYY-MM-DD"
    return bill.bill_date.startsWith(selectedMonth);
  });

  // Compute total expense for selected month
  const totalExpense = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);

  // Compute expense by person
  const expenseByPerson = {};
  filteredBills.forEach((bill) => {
    if (!expenseByPerson[bill.added_by]) expenseByPerson[bill.added_by] = 0;
    expenseByPerson[bill.added_by] += bill.amount;
  });

  // Compute expense by category
  const expenseByCategory = {};
  filteredBills.forEach((bill) => {
    if (!expenseByCategory[bill.utility_type]) expenseByCategory[bill.utility_type] = 0;
    expenseByCategory[bill.utility_type] += bill.amount;
  });

  return (
    <>
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
                <div className="bill-column">{bill.utility_type}</div>
                <div className="bill-column">₹{bill.amount.toFixed(2)}</div>
                  <div className="bill-column">
                    {new Date(bill.bill_date).toLocaleDateString("en-GB")}
                  </div>
                <div className="bill-column">{bill.added_by}</div>
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

      {/* New Analytics Container */}
      <div className="analytics-container">
        <h2>Expense Summary</h2>

        <label htmlFor="monthPicker">Select Month:</label>
        <input
          id="monthPicker"
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="month-picker"
        />

        <div className="analytics-summary">
          <h3>Total Expense: ₹{totalExpense.toFixed(2)}</h3>

          <div className="analytics-section">
            <h4>Expense by Person:</h4>
            <ul>
              {Object.entries(expenseByPerson).length === 0 && <li>No data</li>}
              {Object.entries(expenseByPerson).map(([person, amount]) => (
                <li key={person}>
                  {person}: ₹{amount.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>

          <div className="analytics-section">
            <h4>Expense by Category:</h4>
            <ul>
              {Object.entries(expenseByCategory).length === 0 && <li>No data</li>}
              {Object.entries(expenseByCategory).map(([category, amount]) => (
                <li key={category}>
                  {category}: ₹{amount.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
