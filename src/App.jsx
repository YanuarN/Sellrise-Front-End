import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layout';
import LeadManagement from './pages/LeadManagement/LeadManagement';
import LandingPage from './pages/LandingPage/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <LeadManagement />
            </MainLayout>
          }
        />
        <Route
          path="/crm"
          element={
            <MainLayout>
              <LeadManagement />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
