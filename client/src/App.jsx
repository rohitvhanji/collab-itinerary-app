<div style={{
  display: 'flex',
  gap: '1rem',
  marginBottom: '2rem',
  alignItems: 'center',
  flexWrap: 'nowrap',          // <-- no wrapping, keep all on one line
  overflowX: 'auto',           // <-- horizontal scroll if too narrow screen
}}>
  <input
    type="text"
    placeholder="Utility Type"
    value={utilityType}
    onChange={e => setUtilityType(e.target.value)}
    style={{ ...inputStyle, flex: '0 0 180px' }}  // fixed width to avoid shrinking
  />
  <input
    type="number"
    placeholder="Amount"
    value={amount}
    onChange={e => setAmount(e.target.value)}
    style={{ ...inputStyle, flex: '0 0 120px' }}
  />
  <input
    type="date"
    placeholder="Bill Date"
    value={billDate}
    onChange={e => setBillDate(e.target.value)}
    style={{ ...inputStyle, flex: '0 0 160px' }}
  />
  <input
    type="text"
    placeholder="Paid By"
    value={paidBy}
    onChange={e => setPaidBy(e.target.value)}
    style={{ ...inputStyle, flex: '0 0 150px' }}
  />

  <button
    onClick={addOrUpdateBill}
    style={buttonStylePrimary}
  >
    {editingBill ? 'Update Bill' : 'Add Bill'}
  </button>

  {editingBill && (
    <button
      onClick={cancelEdit}
      style={buttonStyleSecondary}
    >
      Cancel
    </button>
  )}
</div>
