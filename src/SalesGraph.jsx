// SalesGraph.jsx

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const SalesGraph = () => {
  const [graphData, setGraphData] = useState([]);
  const [aggregation, setAggregation] = useState('monthly'); // Options: 'monthly', 'yearly', or 'weekly'
  const [graphStartDate, setGraphStartDate] = useState('');
  const [graphEndDate, setGraphEndDate] = useState('');
  const [selectedTerminal, setSelectedTerminal] = useState('All');

  // Function to fetch aggregated sales data from the backend.
  const fetchGraphData = async () => {
    try {
      // Build query parameters for aggregation, date range, and terminal filter.
      let query = `?aggregation=${aggregation}&terminal=${selectedTerminal}`;
      if (graphStartDate && graphEndDate) {
        query += `&startDate=${graphStartDate}&endDate=${graphEndDate}`;
      }
      const response = await fetch(`http://10.10.10.61:5000/api/sales-graph${query}`);
      const data = await response.json();
      setGraphData(data);
    } catch (error) {
      console.error('Error fetching graph data:', error);
    }
  };

  // Refresh the graph whenever filter options change.
  useEffect(() => {
    fetchGraphData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aggregation, graphStartDate, graphEndDate, selectedTerminal]);

  return (
    <div className="my-8">
      <h3 className="text-xl font-bold mb-4">Sales Graph</h3>
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={graphStartDate}
            onChange={(e) => setGraphStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            value={graphEndDate}
            onChange={(e) => setGraphEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Aggregation</label>
          <select
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Terminal</label>
          <select
            value={selectedTerminal}
            onChange={(e) => setSelectedTerminal(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="All">All Terminals</option>
            <option value="1">Terminal1</option>
            <option value="2">Terminal2</option>
            {/* Add more options as needed */}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchGraphData}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Apply Filter
          </button>
        </div>
      </div>
      {/* Responsive Line Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={graphData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {/* Using "stepAfter" to create a pointy (stepped) line graph */}
          <Line type="monotone" dataKey="grossSales" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesGraph;
