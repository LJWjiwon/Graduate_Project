import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Chart.js 모듈 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyBarChart = ({ monthlyCounts }) => {
  const data = {
    labels: [
      '1월', '2월', '3월', '4월', '5월', '6월', 
      '7월', '8월', '9월', '10월', '11월', '12월'
    ],
    datasets: [
      {
        label: '월별 여행 횟수',
        data: monthlyCounts, // Home.jsx에서 전달받은 데이터
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: '월별 여행 횟수',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        // Y축 레이블을 정수로 표시
        ticks: {
            stepSize: 1,
            callback: function(value) { if (value % 1 === 0) { return value; } }
        }
      }
    }
  };

  return (
    <div className="chart-box monthly-bar-chart">
        <h3 className='chart-title'>📅 올해 월별 여행 횟수</h3>
        <Bar data={data} options={options} />
    </div>
  );
};

export default MonthlyBarChart;