import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

const DailyTerminalReport = () => {
  const [report, setReport] = useState([]);
  const [detailsByDate, setDetailsByDate] = useState({});
  const [expandedDate, setExpandedDate] = useState(null);
  const [txnDetails, setTxnDetails] = useState({});
  const [expandedTxn, setExpandedTxn] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const terminals = [
    'Kai Inan','Ramen Ki','Ihaw Ihaw','Stacks','QuickSilog',
    'Cozy Taco','Kanpai','Stomping','D&D','MamaBear',
    'Wanna Wok','Kai World','Kai Bar','Grab & Go'
  ];

  const cutoffDate = dayjs("2024-03-31");

  const formatNumber = v =>
    v != null
      ? Number(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
      : '0.00';

  // Fetch summary per day
  const fetchReport = async () => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate)   params.endDate   = endDate;

    const endpoint =
      endDate && dayjs(endDate).isBefore(cutoffDate.add(1,'day'))
        ? "https://69dc-120-28-70-52.ngrok-free.app/api/daily-terminal-report"
        : "https://69dc-120-28-70-52.ngrok-free.app/api/daily-terminal-report";

    const res = await axios.get(endpoint, { params });
    setReport(res.data);
    setExpandedDate(null);
    setDetailsByDate({});
    setExpandedTxn(null);
    setTxnDetails({});
  };

  // Fetch transactions for a day
  const fetchDetailsForDate = async (rawDate) => {
    if (expandedDate === rawDate) {
      setExpandedDate(null);
      return;
    }
    const res = await axios.get(
      "https://69dc-120-28-70-52.ngrok-free.app/api/daily-terminal-report/details",
      { params: { date: rawDate } }
    );
    setDetailsByDate(d => ({ ...d, [rawDate]: res.data }));
    setExpandedDate(rawDate);
    setExpandedTxn(null);
  };

  // Fetch items for a transaction
  const fetchTxnDetails = async (transID) => {
    if (expandedTxn === transID) {
      setExpandedTxn(null);
      return;
    }
    if (!txnDetails[transID]) {
      const res = await axios.get(
        `https://69dc-120-28-70-52.ngrok-free.app/api/transactions/${transID}/details`
      );
      setTxnDetails(d => ({ ...d, [transID]: res.data }));
    }
    setExpandedTxn(transID);
  };

  useEffect(() => { fetchReport(); }, []);
  

  return (
    <div className="p-8 bg-white shadow-xl rounded-2xl">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">📊 Daily Sales Report Per Terminal</h2>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        {['Start Date','End Date'].map((label, idx) => (
          <div key={idx}>
            <label className="block text-gray-600 text-sm">{label}</label>
            <input
              type="date"
              value={idx===0 ? startDate : endDate}
              onChange={e => idx===0 ? setStartDate(e.target.value) : setEndDate(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-blue-300"
            />
          </div>
        ))}
        <button
          onClick={fetchReport}
          className="self-end bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Apply Filter
        </button>
        <button
          onClick={() => {/* exportToExcel() */}}
          className="self-end bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Export to Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-blue-100 text-gray-800">
            <tr>
              <th className="px-3 py-2"></th>
              <th className="px-3 py-2">📅 Date</th>
              {terminals.map((t,i) => (
                <th key={i} className="px-3 py-2 text-center">{t}</th>
              ))}
              {['Gross Sales','Gross Discount','No POS','Net Sales','VAT','Net w/o VAT']
                .map((h,j) => (
                  <th key={j} className="px-3 py-2 text-center font-semibold">{h}</th>
                ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-center">
            {report.map((row, i) => (
              <React.Fragment key={i}>
                {/* Day Row */}
                <tr
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => fetchDetailsForDate(row.RawDate)}
                >
                  <td className="px-3 py-2 text-right">
                    <span
                      className={`inline-block transform transition-transform duration-200 ${
                        expandedDate===row.RawDate ? 'rotate-90' : ''
                      }`}
                    >▶</span>
                  </td>
                  <td className="px-3 py-2 text-center">{row.ReportDate}</td>
                  {terminals.map((t,idx) => (
                    <td key={idx} className="px-3 py-2 text-center">{formatNumber(row[t])}</td>
                  ))}
                  <td className="px-3 py-2 text-center">{formatNumber(row.GrossSales)}</td>
                  <td className="px-3 py-2 text-center">{formatNumber(row.GrossDiscount)}</td>
                  <td className="px-3 py-2 text-center"><input className="border rounded p-1 w-full" placeholder="—" /></td>
                  <td className="px-3 py-2 text-center">{formatNumber(row.NetSales)}</td>
                  <td className="px-3 py-2 text-center">{formatNumber(row.VAT)}</td>
                  <td className="px-3 py-2 text-center">{formatNumber(row.NetSalesWithoutVAT)}</td>
                </tr>

                {/* Transactions */}
                <tr>
                  <td colSpan={2 + terminals.length + 6} className="p-0">
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{ maxHeight: expandedDate===row.RawDate ? '1000px' : '0px' }}
                    >
                      <table className="min-w-full bg-gray-50">
                        <thead className="bg-gray-200 text-gray-700">
                          <tr>
                            <th className="pl-10 py-2 text-left">▶</th>
                            {[
                              'TransID','TerminalID','SI No','Date',
                              'Net Purchase','Gross Sale','Cashier',
                              'Discount Regular','Discount Special','Payment Type'
                            ].map((h,k) => (
                              <th key={k} className="px-4 py-2">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className=" divide-gray-300">
                          {detailsByDate[row.RawDate]?.map(txn => (
                            <React.Fragment key={txn.TransID}>
                              <tr
                                className="bg-gray-50 hover:bg-gray-100 cursor-pointer"
                                onClick={() => fetchTxnDetails(txn.TransID)}
                              >
                                <td className="pl-10 py-2 text-center">
                                  <span className={`inline-block transform transition-transform duration-200 ${
                                    expandedTxn===txn.TransID ? 'rotate-90' : ''
                                  }`}>▶</span>
                                </td>
                                <td className="px-4 py-2">{txn.TransID}</td>
                                <td className="px-4 py-2">{txn.TerminalID}</td>
                                <td className="px-4 py-2">{txn.POS_No}</td>
                                <td className="px-4 py-2">{dayjs(txn.DatePOS).format('MM/DD HH:mm')}</td>
                                <td className="px-4 py-2 text-center">{formatNumber(txn.NetPurchase)}</td>
                                <td className="px-4 py-2 text-center">{formatNumber(txn.GrossSales)}</td>
                                <td className="px-4 py-2">{txn.WhoCreated}</td>
                                <td className="px-4 py-2 text-center">{formatNumber(txn.DiscountRegular)}</td>
                                <td className="px-4 py-2 text-center">{formatNumber(txn.DiscountSpecial)}</td>
                                <td className="px-4 py-2">{txn.PaymentType}</td>
                              </tr>
                              {/* Item rows */}
                              <tr>
                                <td colSpan={2 + terminals.length + 6} className="p-0">
                                  <div
                                    className="overflow-hidden transition-all duration-300"
                                    style={{ maxHeight: expandedTxn===txn.TransID ? '1000px' : '0px' }}
                                  >
                                    <table className="min-w-full bg-white">
                                      <thead className="bg-gray-200 text-gray-700">
                                        <tr>
                                          {[
                                            'Item Code','Item Name','Unit Price','QTY','UOM',
                                            'Gross Price','Net Price','Discount Special',
                                            'Date Created','SC PWD','VAT'
                                          ].map((h2,m) => (
                                            <th key={m} className="px-4 py-2">{h2}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-300">
                                        {txnDetails[txn.TransID]?.map(item => (
                                          <tr key={item.RecordID} className="bg-white hover:bg-gray-50">
                                            <td className="px-4 py-2">{item.ItemCode}</td>
                                            <td className="px-4 py-2">{item.ItemName}</td>
                                            <td className="px-4 py-2 text-center">{formatNumber(item.UnitPrice)}</td>
                                            <td className="px-4 py-2">{item.QTY}</td>
                                            <td className="px-4 py-2">{item.UOM}</td>
                                            <td className="px-4 py-2 text-center">{formatNumber(item.GrossPrice)}</td>
                                            <td className="px-4 py-2 text-center">{formatNumber(item.NetPrice)}</td>
                                            <td className="px-4 py-2 text-center">{formatNumber(item.DiscountSpecial)}</td>
                                            <td className="px-4 py-2">{dayjs(item.DateCreated).format('MM/DD HH:mm')}</td>
                                            <td className="px-4 py-2 text-center">{formatNumber(item.SCPWDDiscount)}</td>
                                            <td className="px-4 py-2 text-center">{formatNumber(item.VATDiscount)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyTerminalReport;
