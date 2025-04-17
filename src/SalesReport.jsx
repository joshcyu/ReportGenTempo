// SalesReport.jsx

import React, { useState, useEffect } from 'react';
import SalesGraph from './SalesGraph';
import ItemPieChart from './ItemPieChart';

const SalesReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [details, setDetails] = useState([]);
  const [selectedTrans, setSelectedTrans] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch transactions whenever the page or date range changes
  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      // Build query parameters for pagination and date filter
      let query = `?page=${currentPage}`;
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await fetch(`http://10.10.10.61:5000/api/transactions${query}`);
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  // Fetch the details for a specific transaction
  const fetchDetails = async (transId) => {
    try {
      const response = await fetch(`http://10.10.10.61:5000/api/transactions/${transId}/details`);
      const data = await response.json();
      setDetails(data);
      setSelectedTrans(transId);
    } catch (err) {
      console.error('Error fetching transaction details:', err);
    }
  };

  // Handler for back button
  const backToTransactions = () => {
    setSelectedTrans(null);
    setDetails([]);
  };

  // Handler for applying date filter
  const applyDateFilter = () => {
    setCurrentPage(1);
    fetchTransactions();
  };

  // Pagination handlers
  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const goToNext = () => {
    if (transactions.length === 100) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  // Render the details view if a transaction is selected
  if (selectedTrans) {
    return (
      <div className="container mx-auto px-4 py-4">
        <button
          className="mb-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          onClick={backToTransactions}
        >
          Back
        </button>
        <h2 className="text-2xl font-bold mb-4">
          Transaction Details for <span className="text-blue-600">{selectedTrans}</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 text-left">RecordID</th>
                <th className="py-2 px-4 text-left">Item Code</th>
                <th className="py-2 px-4 text-left">Item Name</th>
                <th className="py-2 px-4 text-left">Unit Price</th>
                <th className="py-2 px-4 text-left">QTY</th>
                <th className="py-2 px-4 text-left">UOM</th>
                <th className="py-2 px-4 text-left">Gross Price</th>
                <th className="py-2 px-4 text-left">Net Price</th>
                <th className="py-2 px-4 text-left">Discount Special</th>
                <th className="py-2 px-4 text-left">Date Created</th>
                <th className="py-2 px-4 text-left">SC PWD Discount</th>
                <th className="py-2 px-4 text-left">VAT Discount</th>
              </tr>
            </thead>
            <tbody>
              {details.map((detail) => (
                <tr key={detail.RecordID} className="border-t">
                  <td className="py-2 px-4">{detail.RecordID}</td>
                  <td className="py-2 px-4">{detail.ItemCode}</td>
                  <td className="py-2 px-4">{detail.ItemName}</td>
                  <td className="py-2 px-4">{detail.UnitPrice}</td>
                  <td className="py-2 px-4">{detail.QTY}</td>
                  <td className="py-2 px-4">{detail.UOM}</td>
                  <td className="py-2 px-4">{detail.GrossPrice}</td>
                  <td className="py-2 px-4">{detail.NetPrice}</td>
                  <td className="py-2 px-4">{detail.DiscountSpecial}</td>
                  <td className="py-2 px-4">{detail.DateCreated}</td>
                  <td className="py-2 px-4">{detail.SCPWDDiscount}</td>
                  <td className="py-2 px-4">{detail.VATDiscount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Render the main transactions view (including the sales graph)
  return (
    <div className="container mx-auto px-4 py-4">
      {/* Sales Graph Module */}
      <ItemPieChart/>
      <SalesGraph />

      <h2 className="text-2xl font-bold mb-4">Sales Transactions</h2>
      {/* Date Range Filter */}
      <div className="flex space-x-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            onClick={applyDateFilter}
          >
            Apply Filter
          </button>
        </div>
      </div>
      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 text-left">TransID</th>
              <th className="py-2 px-4 text-left">TerminalID</th>
              <th className="py-2 px-4 text-left">POS_No</th>
              <th className="py-2 px-4 text-left">DatePOS</th>
              <th className="py-2 px-4 text-left">NetPurchase</th>
              <th className="py-2 px-4 text-left">GrossSales</th>
              <th className="py-2 px-4 text-left">WhoCreated</th>
              <th className="py-2 px-4 text-left">DiscountRegular</th>
              <th className="py-2 px-4 text-left">DiscountSpecial</th>
              <th className="py-2 px-4 text-left">PaymentType</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr
                key={txn.TransID}
                className="border-t cursor-pointer hover:bg-gray-100"
                onClick={() => fetchDetails(txn.TransID)}
              >
                <td className="py-2 px-4">{txn.TransID}</td>
                <td className="py-2 px-4">{txn.TerminalID}</td>
                <td className="py-2 px-4">{txn.POS_No}</td>
                <td className="py-2 px-4">{txn.DatePOS}</td>
                <td className="py-2 px-4">{txn.NetPurchase}</td>
                <td className="py-2 px-4">{txn.GrossSales}</td>
                <td className="py-2 px-4">{txn.WhoCreated}</td>
                <td className="py-2 px-4">{txn.DiscountRegular}</td>
                <td className="py-2 px-4">{txn.DiscountSpecial}</td>
                <td className="py-2 px-4">{txn.PaymentType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <button
          onClick={goToPrevious}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded disabled:opacity-50"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <div className="flex items-center">Page {currentPage}</div>
        <button
          onClick={goToNext}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded disabled:opacity-50"
          disabled={transactions.length < 100}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SalesReport;
