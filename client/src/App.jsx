import React, { useState, useEffect } from "react";

export default function App() {
  const [bills, setBills] = useState([]);
  const [utilityType, setUtilityType] = useState("");
  const [amount, setAmount] = useState("");
  const [billDate, setBillDate] = useState("");
  const [paidBy, setPaidBy] = useState("");

  // Add a new bill entry
  const addBill = () => {
    if (!utilityType || !amount || !billDate || !paidBy) {
      alert("Please fill all fields");
      return;
    }
    const newBill = {
      id: Date.now(),
      utilityType,
      amount: parseFloat(amount).toFixed(2),
      billDate,
      paidBy,
    };
    setBills([...bills, newBill]);
    setUtilityType("");
    setAmount("");
    setBillDate("");
    setPaidBy("");
  };

  // Delete a bill entry by id
  const deleteBill = (id) => {
    setBills(bills.filter((bill) => bill.id !== id));
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Collaborative Utility Bills Tracker</h1>

      {/* Input Row */}
      <div className="input-row">
        <input
          className="input-utility-type"
          type="text"
          placeholder="Utility Type (Electricity, Gas)"
          value={utilityType}
          onChange={(e) => setUtilityType(e.target.value)}
        />
        <input
          className="input-amount"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.01"
        />
        <input
          className="input-bill-date"
          type="date"
          value={billDate}
          onChange={(e) => setBillDate(e.target.value)}
        />
        <input
          className="input-paid-by"
          type="text"
          placeholder="Paid By"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
        />
        <button className="button-primary" onClick={addBill}>
          Add Bill
        </button>
      </div>

      {/* Bills Table Header */}
      <div className="bills-list-header">
        <div className="bill-column">Utility</div>
        <div className="bill-column">Amount ($)</div>
        <div className="bill-column">Date</div>
        <div className="bill-column">Paid By</div>
        <div className="bill-column-actions">Actions</div>
      </div>

      {/* Bills List */}
      <div className="bills-list">
        {bills.length === 0 ? (
          <div className="no-bills">No bills added yet</div>
        ) : (
          bills.map(({ id, utilityType, amount, billDate, paidBy }) => (
            <div className="bills-list-item" key={id}>
              <div className="bill-column">{utilityType}</div>
              <div className="bill-column">${amount}</div>
              <div className="bill-column">{billDate}</div>
              <div className="bill-column">{paidBy}</div>
              <div className="bill-column-actions">
                <button
                  className="button-secondary"
                  onClick={() => deleteBill(id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
