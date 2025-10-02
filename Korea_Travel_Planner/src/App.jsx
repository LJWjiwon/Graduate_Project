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
        <Info />
        {/* <Search /> */}
        {/* <Survey /> */}
        {/* <Plan /> */}
        {/* <Manage /> */}

      </main>

      {/* 모든 페이지에 공통으로 보일 푸터 */}
      {/* <Footer /> */}
    </BrowserRouter>
  );
}

export default App;
