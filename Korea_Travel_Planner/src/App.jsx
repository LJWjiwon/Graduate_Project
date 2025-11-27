//페이지 라우팅
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/home.jsx'; 
import Login from './components/login.jsx';
import Plan from './components/plan.jsx';
import Manage from './components/plan_manage.jsx';

function App() {
  return (
    <BrowserRouter>
      {/* URL 경로에 따라 이 부분만 바뀜 */}
      <main>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Login />} />
          <Route path="/plan/:planId" element={<Plan />} />
          <Route path="/manage" element={<Manage />} />
        </Routes>

      </main>
    </BrowserRouter>
  );
}

export default App;