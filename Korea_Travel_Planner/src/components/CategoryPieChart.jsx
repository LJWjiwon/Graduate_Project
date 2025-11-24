import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Chart.js 모듈 등록
ChartJS.register(ArcElement, Tooltip, Legend);

// 차트 색상 팔레트 정의
const CHART_COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
    '#808080', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#778899', '#B0C4DE'
];

const CategoryPieChart = ({ categoryVisits }) => {
    // categoryVisits 객체를 { label: 이름, value: 횟수 } 배열로 변환
    const labels = Object.keys(categoryVisits);
    const dataValues = Object.values(categoryVisits);

    const data = {
        labels: labels, // 카테고리 이름 (예: 문화,예술, 여행,관광)
        datasets: [
            {
                data: dataValues, // 카테고리별 횟수
                backgroundColor: CHART_COLORS.slice(0, labels.length), // 데이터 수만큼 색상 사용
                hoverBackgroundColor: CHART_COLORS.slice(0, labels.length),
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right', // 범례를 오른쪽에 배치하여 원 그래프 공간 확보
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1) + '%';
                        return `${label}: ${value}회 (${percentage})`;
                    }
                }
            }
        },
    };

    return (
        <div className="chart-box category-pie-chart">
            <h3 className='chart-title'>📍 장소 방문 유형</h3>
            <Pie data={data} options={options} />
        </div>
    );
};

export default CategoryPieChart;