import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layout';
import LeadManagement from './pages/LeadManagement/LeadManagement';

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<LeadManagement />} />
          <Route path="/crm" element={<LeadManagement />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
