import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#ffc0cb',
];

const ItemPieChart = () => {
  const [data, setData] = useState([]);
  const [fsnSummary, setFsnSummary] = useState({ fast: [], slow: [], non: [] });
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://10.10.10.61:5000/api/item-sales-summary');
        const items = res.data;

        setData(items.map(item => ({
          name: item.ItemName,
          value: item.saleCount,
        })));

        // FSN Classification logic (example thresholds)
        const fast = [], slow = [], non = [], trend = [];
        items.forEach(item => {
          if (item.saleCount > 100) {
            fast.push(item.ItemName);
            trend.push(item.ItemName);
          } else if (item.saleCount > 20) {
            slow.push(item.ItemName);
          } else {
            non.push(item.ItemName);
          }
        });

        setFsnSummary({ fast, slow, non });
        setTrending(trend);
      } catch (err) {
        console.error('Failed to fetch item sales summary:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Item Sales Distribution (Pie Chart)</h2>
      <div className="flex flex-col md:flex-row gap-10">
        <PieChart width={400} height={400}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            label
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>

        <div className="flex-1">
          <h3 className="text-xl font-medium">FSN Summary</h3>
          <ul className="list-disc list-inside mt-2">
            <li><strong>Fast Moving:</strong> {fsnSummary.fast.join(', ') || 'None'}</li>
            <li><strong>Slow Moving:</strong> {fsnSummary.slow.join(', ') || 'None'}</li>
            <li><strong>Non Moving:</strong> {fsnSummary.non.join(', ') || 'None'}</li>
          </ul>

          <h3 className="text-xl font-medium mt-4">🔥 Trending Items</h3>
          <ul className="list-disc list-inside mt-2">
            {trending.length > 0 ? trending.map((item, i) => (
              <li key={i}>{item}</li>
            )) : <li>No trending items</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ItemPieChart;
