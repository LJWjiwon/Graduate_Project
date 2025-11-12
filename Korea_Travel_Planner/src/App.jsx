// App.jsx: 페이지 라우팅
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/home.jsx'; // 공통 헤더
import Login from './components/login.jsx'; 
import Info from './components/info.jsx'; 
import Search from './components/search.jsx'; 
import Survey from './components/survey.jsx'; 
import Plan from './components/plan.jsx'; 
import Manage from './components/plan_manage.jsx'; 

// import './styles/global.css'; // 전역 스타일

function App() {
  return (
    <BrowserRouter>
      {/* 모든 페이지에 공통으로 보일 헤더 */}
      {/* <Header /> */}

      {/* URL 경로에 따라 이 부분만 바뀜 */}
      <main>
        {/* <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes> */}

        {/* <Home /> */}
        {/* <Login /> */}
        {/* <Info /> */}
        {/* <Search /> */}
        {/* <Survey /> */}
        {/* <Plan /> */}
        <Manage />

      </main>

      {/* 모든 페이지에 공통으로 보일 푸터 */}
      {/* <Footer /> */}
    </BrowserRouter>
  );
}

export default App;


// import React, { useEffect, useState } from 'react';
// // 4단계에서 만든 firebase.js 파일에서 'db'를 가져옵니다.
// import { db } from './firebase'; 
// // Firestore에서 데이터를 가져오는 데 필요한 함수들입니다.
// import { collection, getDocs } from 'firebase/firestore';

// function FirebaseTest() { // 컴포넌트 이름은 자유롭게 (예: App, Board 등)
//   const [items, setItems] = useState([]); // 데이터를 담을 상태
//   const [loading, setLoading] = useState(true); // 로딩 중인지 확인

//   useEffect(() => {
//     // Firestore에서 'cities' 컬렉션의 데이터를 가져오는 비동기 함수
//     const fetchData = async () => {
//       try {
//         // 'cities' 컬렉션을 지정합니다. (이 이름은 Firestore에 만든 컬렉션과 같아야 함)
//         const querySnapshot = await getDocs(collection(db, "cities"));
        
//         const dataList = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
        
//         setItems(dataList); // 상태에 데이터 저장
//         setLoading(false); // 로딩 완료
        
//         console.log("✅ Firebase 데이터 로드 성공:", dataList);

//       } catch (error) {
//         console.error("❌ Firebase 데이터 로드 중 오류 발생:", error);
//         setLoading(false); // 로딩 완료 (오류 발생)
//       }
//     };

//     fetchData(); // 함수 실행
//   }, []); // [] 빈 배열: 컴포넌트가 처음 렌더링될 때 1번만 실행

//   // 로딩 중일 때 표시할 화면
//   if (loading) {
//     return <div>Firebase에서 데이터를 불러오는 중...</div>;
//   }

//   // 로딩 완료 후 표시할 화면
//   return (
//     <div>
//       <h1>Firebase 연동 테스트</h1>
//       {items.length > 0 ? (
//         <ul>
//           {items.map(item => (
//             // Firestore 문서에 'name' 필드가 있다고 가정합니다.
//             <li key={item.id}>
//               {item.name} (ID: {item.id})
//             </li> 
//           ))}
//         </ul>
//       ) : (
//         <p>데이터가 없거나 Firestore에서 'cities' 컬렉션을 찾을 수 없습니다.</p>
//       )}
//     </div>
//   );
// }

// export default FirebaseTest;