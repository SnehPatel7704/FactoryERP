import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

// 1. Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// 2. Master Data
import UserMaster from './pages/master/UserMaster';
import ItemMaster from './pages/master/ItemMaster';
import ColorMaster from './pages/master/ColorMaster';
import SizeMaster from './pages/master/SizeMaster';
import QualityMaster from './pages/master/QualityMaster';
import WeightMaster from './pages/master/WeightMaster';
import MeterMaster from './pages/master/MeterMaster';
import ManagementMaster from './pages/master/ManagementMaster';

// 3. Sales & Orders
import SalesOrderPage from './pages/sales/SalesOrderPage';

// 4. Dispatch & Logistics
import PreDispatchStaging from './pages/sales/PreDispatchStaging';
import DispatchChallanGeneration from './pages/dispatch/DispatchChallanGeneration';
import DispatchChallanGenerationPage from './pages/Extra/DispatchChallanGenerationPage';
import DispatchReturn from './pages/dispatch/DispatchReturn';

// 5. Production
import ProductionPage from './pages/inventory/ProductionPage';
import ProductionReturn from './pages/inventory/ProductionReturn';


// 6. Reports
import Reports from './pages/reports/Reports';
import AnnualPerformanceReport from './pages/reports/AnnualPerformanceReport';
import DailyProductionSalesReport from './pages/reports/DailyProductionSalesReport';
import MonthlyWastageReport from './pages/reports/MonthlyWastageReport';
import DetailedProductionReport from './pages/reports/DetailedProductionReport';
import AnalyticsDashboard from './pages/reports/AnalyticsDashboard';

// Auth
import Login from './pages/Login';

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Miscellaneous
import DeliveryChallanPDF from './pages/dispatch/DeliveryChallanPDF';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Secure Application Core */}
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/analytics" element={<AnalyticsDashboard />} />
          <Route path="reports/analytics" element={<Reports />} />
          <Route path="reports/annual-performance" element={<AnnualPerformanceReport />} />
          <Route path="reports/daily-production-sales" element={<DailyProductionSalesReport />} />
          <Route path="reports/monthly-wastage" element={<MonthlyWastageReport />} />
          <Route path="reports/detailed-production" element={<DetailedProductionReport />} />

          {/* Master Data */}
          <Route path="master" element={<ManagementMaster />} />
          <Route path="master/users" element={<UserMaster />} />
          <Route path="master/items" element={<ItemMaster />} />
          <Route path="master/colors" element={<ColorMaster />} />
          <Route path="master/sizes" element={<SizeMaster />} />
          <Route path="master/qualities" element={<QualityMaster />} />
          <Route path="master/weights" element={<WeightMaster />} />
          <Route path="master/meters" element={<MeterMaster />} />

          {/* Inventory */}
          <Route path="inventory/production" element={<ProductionPage />} />


          {/* Sales & Dispatch */}
          <Route path="sales/order" element={<SalesOrderPage />} />
          <Route path="sales/staging" element={<PreDispatchStaging />} />
          <Route path="sales/dispatch" element={<DispatchChallanGeneration />} />
          <Route path="sales/dispatchPage" element={<DispatchChallanGenerationPage />} />

          {/* Returns */}
          <Route path="returns/production" element={<ProductionReturn />} />
          <Route path="returns/dispatch" element={<DispatchReturn />} />

          <Route path="challan/delivery/:id" element={<DeliveryChallanPDF />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
