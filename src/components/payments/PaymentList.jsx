import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// import jsPDF from "jspdf";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import "jspdf-autotable";
import Spinner from '../layout/Spinner';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, backgroundColor: "#f0f4f8" },
  header: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    padding: 10,
    color: "#fff",
    backgroundColor: "#4A90E2",
    borderRadius: 5,
  },
  subHeader: { textAlign: "center", fontSize: 10, marginBottom: 10, color: "#666" },
  section: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    borderLeftWidth: 5,
  },
  label: { fontWeight: "bold", fontSize: 13, color: "#444", marginBottom: 2 },
  value: { fontSize: 12, color: "#333", marginBottom: 5 },
  statusPaid: { color: "green", fontWeight: "bold" },
  statusPending: { color: "red", fontWeight: "bold" },
  statusOther: { color: "orange", fontWeight: "bold" },
  footer: { textAlign: "center", fontSize: 10, marginTop: 20, color: "#444", fontStyle: "italic" },
});

const getStatusStyle = (status) => {
  switch (status.toLowerCase()) {
    case "paid": return styles.statusPaid;
    case "pending": return styles.statusPending;
    default: return styles.statusOther;
  }
};

// **PDF Receipt Component**
const PaymentReceipt = ({ payment, booking }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.header}>Payment Receipt</Text>
      <Text style={styles.subHeader}>Date: {new Date().toLocaleDateString()}</Text>

      <View style={{ ...styles.section, borderLeftColor: "#007BFF" }}>
        <Text style={styles.label}>Client Name</Text>
        <Text style={styles.value}>{booking?.clientName || "N/A"}</Text>
        <Text style={styles.label}>Event</Text>
        <Text style={styles.value}>{booking?.eventType || "N/A"}</Text>
      </View>

      <View style={{ ...styles.section, borderLeftColor: "#28A745" }}>
        <Text style={styles.label}>Payment ID</Text>
        <Text style={styles.value}>{payment._id}</Text>
        <Text style={styles.label}>Amount</Text>
        <Text style={styles.value}>₹{payment.amount.toFixed(2)}</Text>
        <Text style={styles.label}>Method</Text>
        <Text style={styles.value}>{payment.paymentMethod}</Text>
        <Text style={styles.label}>Status</Text>
        <Text style={{ ...styles.value, ...getStatusStyle(payment.status) }}>{payment.status}</Text>
      </View>

      <View style={{ ...styles.section, borderLeftColor: "#FFC107" }}>
        <Text style={styles.label}>Notes</Text>
        <Text style={styles.value}>{payment.notes || "N/A"}</Text>
      </View>

      <Text style={styles.footer}>Thank you for your payment!</Text>
    </Page>
  </Document>
);


const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    searchQuery: '',
    timeframe: 'thisMonth',
    paymentMethod: 'all'
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? savedMode === 'true' : false; // Default to false if no value is saved
  });
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
    const handleChange = (e) => {
      if (!localStorage.getItem('darkMode')) {
        setIsDarkMode(false); // Default to light mode
        document.documentElement.classList.remove('dark');
      }
    };
  
    mediaQuery.addEventListener('change', handleChange);
    
    // Ensure localStorage preference is applied
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isDarkMode]);
  

  // Set up listener for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (localStorage.getItem('darkMode') === null) {
        setIsDarkMode(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Apply dark mode to HTML element
    document.documentElement.classList.toggle('dark', isDarkMode);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isDarkMode]);

  useEffect(() => {
    const fetchPayments = () => {
      try {
        setLoading(true);
        // Get payments from localStorage
        const storedPayments = localStorage.getItem('payments');
        const parsedPayments = storedPayments ? JSON.parse(storedPayments) : [];
        setPayments(Array.isArray(parsedPayments) ? parsedPayments : []);
        setError(null);
      } catch (err) {
        console.error("LocalStorage Error:", err.message);
        setError("Failed to fetch payments from storage");
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = () => {
      try {
        // Get bookings from localStorage
        const storedBookings = localStorage.getItem('bookings');
        const parsedBookings = storedBookings ? JSON.parse(storedBookings) : [];
        setBookings(parsedBookings);
      } catch (error) {
        console.error("Error fetching bookings from storage:", error);
      }
    };

    fetchPayments();
    fetchBookings();
  }, []);

  const savePaymentsToStorage = (updatedPayments) => {
    try {
      localStorage.setItem('payments', JSON.stringify(updatedPayments));
    } catch (error) {
      console.error("Error saving payments to storage:", error);
    }
  };

  const saveBookingsToStorage = (updatedBookings) => {
    try {
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    } catch (error) {
      console.error("Error saving bookings to storage:", error);
    }
  };

  const getBookingDetails = (bookingId) => {
    return bookings.find((booking) => booking._id === bookingId) || {};
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const getTotalAmount = () => {
    return filteredPayments().reduce((total, payment) => {
      return payment.status === 'completed' ? total + payment.amount : total;
    }, 0);
  };

  // Filter payments based on selected filters
  const filteredPayments = () => {
    return payments.filter(payment => {
      // Filter by status
      if (filters.status !== 'all' && payment.status !== filters.status) return false;

      // Filter by payment method
      if (filters.paymentMethod !== 'all' && payment.paymentMethod !== filters.paymentMethod) return false;

      // Filter by search query (client name)
      if (filters.searchQuery && !payment.clientName?.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;

      // Filter by timeframe (date range)
      if (filters.timeframe !== 'all') {
        const paymentDate = new Date(payment.paymentDate);
        const now = new Date();
        let startDate;

        switch (filters.timeframe) {
          case 'thisMonth':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'lastMonth':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            break;
          case 'thisYear':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          case 'lastYear':
            startDate = new Date(now.getFullYear() - 1, 0, 1);
            break;
          default:
            startDate = new Date(0); // all time
        }

        if (paymentDate < startDate) return false;
      }

      return true; // If no filters are violated, include the payment
    });
  };

  if (loading) return <div className="loading text-center p-4 dark:bg-gray-900 dark:text-white"><Spinner /></div>;
  if (error) return <div className="error-message text-center p-4 text-red-500 dark:bg-gray-900">{error}</div>;

  return (
    <div className="container-fluid mx-auto p-2 sm:p-4 mt-64 sm:mt-24 w-full" style={{width: "80vw"}}>
      <div className="header-actions flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-bold">Payments</h2>
          <div className="total-summary mt-2 text-lg">
            Total: <strong className="text-green-500">₹{getTotalAmount().toFixed(2)}</strong>
          </div>
        </div>
        <Link to="/payments/new" className="new-payment-btn bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md flex items-center">
          <i className="icon-plus mr-2"></i> Add Payment
        </Link>
      </div>

      <div className="filters-bar mb-6">
        <form onSubmit={handleSearch} className="search-form flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
          <input
            type="text"
            name="searchQuery"
            value={filters.searchQuery}
            onChange={handleFilterChange}
            placeholder="Search client name..."
            className="w-100 search-input px-4 py-2 border rounded-md w-full sm:w-64 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
        </form>

        <div className="filter-options flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
          <div className="filter-group">
            <label htmlFor="status" className="block font-medium">Status:</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="bg-white filter-select p-2 border rounded-md w-full sm:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="paymentMethod" className="block font-medium">Method:</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={filters.paymentMethod}
              onChange={handleFilterChange}
              className="bg-white filter-select p-2 border rounded-md w-full sm:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="creditCard">Credit Card</option>
              <option value="bankTransfer">Bank Transfer</option>
              <option value="venmo">Venmo</option>
              <option value="paypal">PayPal</option>
              <option value="check">Check</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="timeframe" className="block font-medium">Timeframe:</label>
            <select
              id="timeframe"
              name="timeframe"
              value={filters.timeframe}
              onChange={handleFilterChange}
              className="bg-white filter-select p-2 border rounded-md w-full sm:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
              <option value="lastYear">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {filteredPayments().length === 0 ? (
        <div className="no-payments text-center p-4 text-gray-500 dark:text-gray-400">
          <p>No payments found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-md payments-table-container overflow-x-auto">
          <table className="payments-table w-full border-collapse table-auto dark:text-gray-200">
            <thead>
              <tr className="dark:border-gray-700">
                <th className="py-2 px-4 border-b dark:border-gray-700">Date</th>
                <th className="py-2 px-4 border-b dark:border-gray-700">Client</th>
                <th className="py-2 px-4 border-b dark:border-gray-700">Event</th>
                <th className="py-2 px-4 border-b dark:border-gray-700">Amount</th>
                <th className="py-2 px-4 border-b dark:border-gray-700">Method</th>
                <th className="py-2 px-4 border-b dark:border-gray-700">Status</th>
                <th className="py-2 px-4 border-b dark:border-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments().map(payment => {
                const booking = getBookingDetails(payment.bookingId);
                return (
                  <tr key={payment._id} className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-700">
                    <td className="py-2 px-4 border-b dark:border-gray-700">{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">{booking.clientName || "N/A"}</td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">{booking.eventType || "N/A"}</td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">₹{payment.amount.toFixed(2)}</td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">{payment.paymentMethod}</td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">
                      <span className={`status-badge px-3 py-1 rounded-full text-white ${payment.status === 'completed' ? 'bg-green-500' : payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">{payment.notes || '—'}</td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">
                      {payment.status === "completed" && (
                        <PDFDownloadLink document={<PaymentReceipt payment={payment} booking={booking} />} fileName="payment_receipt.pdf">
                          {({ loading }) => (
                            <button className="flex items-center justify-center">
                              {loading ? (
                                "Loading PDF..."
                              ) : (
                                <svg xmlns="https://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
                                  <path fill="#D32F2F" d="M4 2h12l6 6v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                                  <text x="5.5" y="19" fontSize="8" fontWeight="bold" fill="white">PDF</text>
                                </svg>
                              )}
                            </button>
                          )}
                        </PDFDownloadLink>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentList;