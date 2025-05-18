import React, { useState, useMemo } from "react";

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

export default function App() {
  const [bills, setBills] = useState([]);
  const [utilityType, setUtilityType] = useState("");
  const [amount, setAmount] = useState("");
  const [billDate, setBillDate] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filterMonth, setFilterMonth] = useState("");

  const saveBill = () => {
    if (!utilityType || !amount || !billDate || !paidBy) {
      alert("Please fill all fields");
      return;
    }

    if (editingId) {
      setBills((prev) =>
        prev.map((bill) =>
          bill.id === editingId
            ? { id: editingId, utilityType, amount: parseFloat(amount).toFixed(2), billDate, paidBy }
            : bill
        )
      );
      setEditingId(null);
    } else {
      const newBill = {
        id: Date.now(),
        utilityType,
        amount: parseFloat(amount).toFixed(2),
        billDate,
        paidBy,
      };
      setBills((prev) => [...prev, newBill]);
    }

    setUtilityType("");
    setAmount("");
    setBillDate("");
    setPaidBy("");
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

  const deleteBill = (id) => {
    setBills((prev) => prev.filter((bill) => bill.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setUtilityType("");
      setAmount("");
      setBillDate("");
      setPaidBy("");
    }
  };

  // Filter bills by selected month (if any)
  const filteredBills = useMemo(() => {
    if (!filterMonth) return bills;
    return bills.filter((bill) => bill.billDate.substring(5, 7) === filterMonth);
  }, [bills, filterMonth]);

  // Summary calculations on filtered bills
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

      {/* Main content: bills list left, summary right */}
      <div className="main-content">
        {/* Bills list */}
        <div className="bills-section">
          <div className="bills-list-header">
            <div className="bill-column">Utility</div>
            <div className="bill-column">Amount ($)</div>
            <div className="bill-column">Date</div>
            <div className="bill-column">Paid By</div>
            <div className="bill-column-actions">Actions</div>
          </div>

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
        </div>

        {/* Summary panel */}
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
          >
            {months.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <div className="summary-info">
            <p>
              <strong>Total Amount:</strong> ${summary.total.toFixed(2)}
            </p>

            <h3>Spend by Person:</h3>
            {Object.keys(summary.byPerson).length === 0 ? (
              <p>No data for selected month.</p>
            ) : (
              <ul>
                {Object.entries(summary.byPerson).map(([person, amt]) => (
                  <li key={person}>
                    {person}: ${amt.toFixed(2)}
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
