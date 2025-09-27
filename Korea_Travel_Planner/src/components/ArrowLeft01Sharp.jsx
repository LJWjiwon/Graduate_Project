// src/components/icons/LeftArrowIcon.jsx

import React from 'react';

// props로 color, width, height, strokeWidth, 그리고 className을 받도록 설정합니다.
const ArrowLeft01Sharp = ({ 
  color = '#141B34', // 기본 색상
  width = 11,        // 기본 너비
  height = 20,       // 기본 높이
  strokeWidth = '1.5', // 기본 선 두께
  className = '',    // CSS 클래스를 받을 수 있도록 추가
  ...props           // 그 외 다른 HTML 속성들을 받기 위함 (예: onClick 등)
}) => {
  return (
    // className과 ...props를 <svg> 태그에 전달하여 외부에서 제어할 수 있게 합니다.
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 11 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className} // className prop 적용
      {...props}             // 나머지 props 적용
    >
      <path 
        d="M9.875 1.25L1.83211 9.29289C1.49877 9.62623 1.33211 9.79289 1.33211 10C1.33211 10.2071 1.49877 10.3738 1.83211 10.7071L9.875 18.75" 
        stroke={color} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowLeft01Sharp;