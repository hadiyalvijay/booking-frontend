import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import BookingProvider from './context/BookingContext';
import Navbar from './components/layout/Navbar';
import BookingCalendar from './components/bookings/BookingCalendar';
import BookingList from './components/bookings/BookingList';
import BookingForm from './components/bookings/BookingForm';
import ExpenseList from './components/expenses/ExpenseList';
import ExpenseForm from './components/expenses/ExpenseForm';
import FinancialSummary from './components/reports/FinancialSummary';
import MonthlyReport from './components/reports/MonthlyReport';
import TodayDateComponent from './components/layout/TodayDate';
import Spinner from './components/layout/Spinner';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import PaymentForm from './components/payments/PaymentForm';
import PaymentList from './components/payments/PaymentList';
import BookingDetails from './components/bookings/BookingDetails';
import AdminPanel from './components/Admin/Admin';
// import AdminRegister from './components/Admin/AdminRegister';

// Modified ProtectedRoute to use localStorage
const ProtectedRoute = ({ element }) => {
  const currentUser = localStorage.getItem('currentUser');

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login" || location.pathname === "/admin/register";

  if (isLoginPage) {
    return children;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="main-content flex-grow-1 p-4">{children}</div>
      <TodayDateComponent />
    </div>
  );
};

const App = () => {
  return (
    <BookingProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Login route outside of nested routes */}
            {/* <Route path="/admin/register" element={<AdminRegister />} /> */}
            <Route path="/login" element={<AdminPanel />} />
            
            {/* Home redirect */}
            <Route path="/" element={<Navigate to="/bookings" replace />} />
            
            {/* Protected routes */}
            <Route path="/bookings" element={<ProtectedRoute element={<BookingList />} />} />
            <Route path="/bookings/:id" element={<ProtectedRoute element={<BookingForm />} />} />
            <Route path="/payments" element={<ProtectedRoute element={<PaymentList />} />} />
            <Route path="/payments/:id" element={<ProtectedRoute element={<PaymentForm />} />} />
            <Route path="/calendar" element={<ProtectedRoute element={<BookingCalendar />} />} />
            <Route path="/expenses" element={<ProtectedRoute element={<ExpenseList />} />} />
            <Route path="/expenses/:id/edit" element={<ProtectedRoute element={<ExpenseForm />} />} />
            <Route path="/expenses/new" element={<ProtectedRoute element={<ExpenseForm />} />} />
            <Route path="/reports" element={<ProtectedRoute element={<FinancialSummary />} />} />
            <Route path="/reports/monthly" element={<ProtectedRoute element={<MonthlyReport />} />} />
            <Route path='/new-booking' element={<ProtectedRoute element={<BookingForm />} />} />
            <Route path="/bookings/:id/edit" element={<ProtectedRoute element={<BookingForm />} />} />
            <Route path="/bookingsdetails" element={<ProtectedRoute element={<BookingDetails />} />} />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/bookings" replace />} />
          </Routes>
        </Layout>
      </Router>
    </BookingProvider>
  );
};

export default App;