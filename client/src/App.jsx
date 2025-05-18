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

  // Selected month for analytics filter (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
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
      setBills([]);
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

  // Filter bills for selected month (YYYY-MM)
  const filteredBills = bills.filter((bill) => bill.bill_date.startsWith(selectedMonth));

  // Analytics calculations
  const totalExpense = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);

  const expenseByPerson = {};
  filteredBills.forEach((bill) => {
    if (!expenseByPerson[bill.added_by]) expenseByPerson[bill.added_by] = 0;
    expenseByPerson[bill.added_by] += bill.amount;
  });

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
            value={
