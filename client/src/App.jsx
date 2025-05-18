import React, { useState, useEffect, useMemo } from "react";

const months = [
  { value: "", label: "All Months" },
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// Change this to the real home id you want to work with
const HOME_ID = "123";

export default function App() {
  const [bills, setBills] = useState([]);
  const [utilityType, setUtilityType] = useState("");
  const [amount, setAmount] = useState("");
  const [billDate, setBillDate] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filterMonth, setFilterMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch bills from backend on mount
  useEffect(() => {
    console.log("useEffect called");  // Debug: confirm useEffect runs
    async function fetchBills() {
      console.log("fetch bills called");  // Debug: confirm useEffect runs
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/bills/${HOME_ID}`);
        if (!response.ok) throw new Error("Failed to fetch bills");
        const data = await response.json();
        // Normalize data if needed
        const normalized = data.map((bill) => ({
          id: bill.id,
          utilityType: bill.utility_type,
          amount: Number(bill.amount).toFixed(2),
          billDate: bill.bill_date,
          paidBy: bill.added_by,
          home_id: bill.home_id,
        }));
        setBills(normalized);
      } catch (err) {
        setError(err.message || "Unknown error");
      }
      setLoading(false);
    }
    fetchBills();
  }, []);

  // Save or update bill
  const saveBill = async () => {
    if (!utilityType || !amount || !billDate || !paidBy) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (editingId) {
        // Update bill via PUT
        const response = await fetch(`/api/bills/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            utility_type: utilityType,
            amount: parseFloat(amount),
            bill_date: billDate,
            added_by: paidBy,
          }),
        });
        if (!response.ok) throw new Error("Failed to update bill");
        const updated = await response.json();
        // Update state
        setBills((prev) =>
          prev.map((bill) =>
            bill.id === editingId
              ? {
                  ...bill,
                  utilityType,
                  amount: parseFloat(amount).toFixed(2),
                  billDate,
                  paidBy,
                }
              : bill
          )
        );
        setEditingId(null);
      } else {
        // Create new bill via POST
        const response = await fetch(`/api/bills`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            home_id: HOME_ID,
            utility_type: utilityType,
            amount: parseFloat(amount),
            bill_date: billDate,
            added_by: paidBy,
          }),
        });
        if (!response.ok) throw new Error("Failed to add bill");
        const newBills = await response.json(); // API returns inserted record(s)
        // Append new bill(s) to state (assume first inserted record)
        const newBill = newBills[0];
        setBills((prev) => [
          ...prev,
          {
            id: newBill.id,
            utilityType: newBill.utility_type,
            amount: Number(newBill.amount).toFixed(2),
            billDate: newBill.bill_date,
            paidBy: newBill.added_by,
            home_id: newBill.home_id,
          },
        ]);
      }
      // Reset inputs
      setUtilityType("");
      setAmount("");
      setBillDate("");
      setPaidBy("");
    } catch (err) {
      setError(err.message || "Unknown error");
    }
    setLoading(false);
  };

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

  // Delete bill
  const deleteBill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete bill");
      setBills((prev) => prev.filter((bill) => bill.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setUtilityType("");
        setAmount("");
        setBillDate("");
        setPaidBy("");
      }
    } catch (err) {
      setError(err.message || "Unknown error");
    }
    setLoading(false);
  };

  // Filter bills by month
  const filteredBills = useMemo(() => {
    if (!filterMonth) return bills;
    return bills.filter(
      (bill) => bill.billDate && bill.billDate.substring(5, 7) === filterMonth
    );
  }, [bills, filterMonth]);

  // Summary calculation
  const summary = useMemo(() => {
    return filteredBills.reduce(
      (acc, bill) => {
        acc.total += parseFloat(bill.amount);
        acc.byPerson[bill.paidBy] = (acc.byPerson[bill.paidBy] || 0) + parseFloat(bill.amount);
        return acc;
      },
      { total: 0, byPerson: {} }
    );
  }, [filteredBills]);

  return (
    <div className="app-container">
      <h1 className="app-title">Collaborative Utility Bills Tracker</h1>

      {error && <div style={{ color: "red", marginBottom: 10 }}>Error: {error}</div>}

      <div className="input-row">
        <input
          className="input-utility-type"
          type="text"
          placeholder="Utility Type (Electricity, Gas)"
          value={utilityType}
          onChange={(e) => setUtilityType(e.target.value)}
          disabled={loading}
        />
        <input
          className="input-amount"
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.01"
          disabled={loading}
        />
        <input
          className="input-bill-date"
          type="date"
          value={billDate}
          onChange={(e) => setBillDate(e.target.value)}
          disabled={loading}
        />
        <input
          className="input-paid-by"
          type="text"
          placeholder="Paid By"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          disabled={loading}
        />
        <button className="button-primary" onClick={saveBill} disabled={loading}>
          {editingId ? "Update Bill" : "Add Bill"}
        </button>
      </div>

      <div className="main-content">
        <div className="bills-section">
          <div className="bills-list-header">
            <div className="bill-column">Utility</div>
            <div className="bill-column">Amount (₹)</div>
            <div className="bill-column">Date</div>
            <div className="bill-column">Paid By</div>
            <div className="bill-column-actions">Actions</div>
          </div>

          {loading && <div>Loading...</div>}

          {!loading && filteredBills.length === 0 && (
            <div className="no-bills">No bills added yet</div>
          )}

          {!loading &&
            filteredBills.map(({ id, utilityType, amount, billDate, paidBy }) => (
              <div className="bills-list-item" key={id}>
                <div className="bill-column">{utilityType}</div>
                <div className="bill-column">₹ {amount}</div>
                <div className="bill-column">{billDate}</div>
                <div className="bill-column">{paidBy}</div>
                <div className="bill-column-actions">
                  <button className="button-secondary" onClick={() => editBill(id)} disabled={loading}>
                    Edit
                  </button>
                  <button className="button-secondary" onClick={() => deleteBill(id)} disabled={loading}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div className="summary-section">
          <h2>Summary</h2>

          <label htmlFor="month-filter" className="filter-label">
            Filter by month:
          </label>
          <select
            id="month-filter"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="month-filter"
            disabled={loading}
          >
            {months.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <div className="summary-info">
            <p>
              <strong>Total Amount:</strong> ₹ {summary.total.toFixed(2)}
            </p>

            <h3>Spend by Person:</h3>
            {Object.keys(summary.byPerson).length === 0 ? (
              <p>No data for selected month.</p>
            ) : (
              <ul>
                {Object.entries(summary.byPerson).map(([person, amt]) => (
                  <li key={person}>
                    {person}: ₹ {amt.toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
