import React, { useState } from "react";

export default function App() {
  const [bills, setBills] = useState([]);
  const [utilityType, setUtilityType] = useState("");
  const [amount, setAmount] = useState("");
  const [billDate, setBillDate] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Add or update bill
  const saveBill = () => {
    if (!utilityType || !amount || !billDate || !paidBy) {
      alert("Please fill all fields");
      return;
    }

    if (editingId) {
      // Update existing bill
      setBills((prev) =>
        prev.map((bill) =>
          bill.id === editingId
            ? { id: editingId, utilityType, amount: parseFloat(amount).toFixed(2), billDate, paidBy }
            : bill
        )
      );
      setEditingId(null);
    } else {
      // Add new bill
      const newBill = {
        id: Date.now(),
        utilityType,
        amount: parseFloat(amount).toFixed(2),
        billDate,
        paidBy,
      };
      setBills((prev) => [...prev, newBill]);
    }

    // Reset input fields
    setUtilityType("");
    setAmount("");
    setBillDate("");
    setPaidBy("");
  };

  // Edit a bill: populate fields
  const editBill = (id) => {
    const bill = bills.find((b) => b.id === id);
    if (bill) {
      setUtilityType(bill.utilityType);
      setAmount(bill.amount);
      setBillDate(bill.billDate);
      setPaidBy(bill.paidBy);
      setEditingId(id);
    }
  };

  // Delete a bill
  const deleteBill = (id) => {
    setBills((prev) => prev.filter((bill) => bill.id !== id));
    // If deleting the bill currently being edited, reset edit mode
    if (editingId === id) {
      setEditingId(null);
      setUtilityType("");
      setAmount("");
      setBillDate("");
      setPaidBy("");
    }
  };

  // Summary: total amount and count by utility type
  const summary = bills.reduce(
    (acc, bill) => {
      acc.count++;
      acc.total += parseFloat(bill.amount);
      acc.byUtility[bill.utilityType] = (acc.byUtility[bill.utilityType] || 0) + parseFloat(bill.amount);
      return acc;
    },
    { count: 0, total: 0, byUtility: {} }
  );

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
        <button className="button-primary" onClick={saveBill}>
          {editingId ? "Update Bill" : "Add Bill"}
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
                <button className="button-secondary" onClick={() => editBill(id)}>
                  Edit
                </button>
                <button className="button-secondary" onClick={() => deleteBill(id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {bills.length > 0 && (
        <div className="summary-container">
          <h2>Summary</h2>
          <p>
            Total Bills: <strong>{summary.count}</strong> | Total Amount: <strong>${summary.total.toFixed(2)}</strong>
          </p>
          <ul>
            {Object.entries(summary.byUtility).map(([util, amt]) => (
              <li key={util}>
                {util}: ${amt.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
