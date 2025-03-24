import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrashAlt, faEllipsisV } from '@fortawesome/free-solid-svg-icons';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    searchQuery: '',
    timeframe: 'all',
  });
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  useEffect(() => {
    const fetchBookings = () => {
      try {
        setLoading(true);
        console.log("Fetching from localStorage with filters:", filters);

        // Get bookings from localStorage
        const storedBookings = localStorage.getItem('bookings');
        let bookingsData = storedBookings ? JSON.parse(storedBookings) : [];

        // Apply filters
        if (filters.status && filters.status !== 'all') {
          bookingsData = bookingsData.filter(booking => booking.status === filters.status);
        }

        if (filters.searchQuery.trim() !== '') {
          const query = filters.searchQuery.toLowerCase();
          bookingsData = bookingsData.filter(booking => 
            booking.clientName.toLowerCase().includes(query) ||
            booking.location.toLowerCase().includes(query)
          );
        }

        if (filters.timeframe && filters.timeframe !== 'all') {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

          bookingsData = bookingsData.filter(booking => {
            const bookingDate = new Date(booking.startDateTime);
            switch (filters.timeframe) {
              case 'upcoming':
                return bookingDate >= now;
              case 'past':
                return bookingDate < now;
              case 'thisMonth':
                return bookingDate >= startOfMonth && bookingDate < startOfNextMonth;
              case 'nextMonth':
                return bookingDate >= startOfNextMonth && bookingDate < new Date(now.getFullYear(), now.getMonth() + 2, 1);
              default:
                return true;
            }
          });
        }

        console.log("Filtered bookings:", bookingsData);
        setBookings(bookingsData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch bookings from localStorage');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [filters]);

  const handleDelete = (bookingId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this booking?');
    if (!confirmDelete) return;

    try {
      // Get current bookings from localStorage
      const storedBookings = localStorage.getItem('bookings');
      let bookingsData = storedBookings ? JSON.parse(storedBookings) : [];
      
      // Filter out the booking to delete
      bookingsData = bookingsData.filter(booking => booking._id !== bookingId);
      
      // Save updated bookings back to localStorage
      localStorage.setItem('bookings', JSON.stringify(bookingsData));
      
      // Update state
      setBookings(bookingsData);
      console.log('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking.');
    }
  };

  const toggleDropdown = (event, bookingId) => {
    if (dropdownOpen === bookingId) {
      setDropdownOpen(null);
      return;
    }
  
    const rect = event.currentTarget.getBoundingClientRect();
    const dropdownHeight = 100; // Approximate dropdown height
  
    // Check if dropdown fits below, otherwise open it above
    const isAbove = window.innerHeight - rect.bottom < dropdownHeight;
  
    setDropdownPosition({
      top: isAbove ? rect.top - dropdownHeight + window.scrollY : rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      isAbove,
    });
  
    setDropdownOpen(bookingId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value || 'all', // Default to 'all' if value is empty
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search triggered with query:", filters.searchQuery);
  };

  if (loading) return <div className="text-center text-gray-500">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container-fluid mx-auto p-2 sm:p-4 mt-64 sm:mt-24 w-full" style={{width: "80vw"}}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold dark:text-white">Bookings</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <Link 
            to="/bookings/new" 
            className=" sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition text-center flex items-center justify-center"
          >
            <i className="mr-2 fas fa-plus"></i> New Booking
          </Link>
          <Link 
            to="/calendar" 
            className=" sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition text-center flex items-center justify-center"
          >
            <i className="mr-2 fas fa-calendar"></i> Calendar
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-4">
        {/* Search input */}
        <form onSubmit={handleSearch} className="w-full">
          <input
            type="text"
            name="searchQuery"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            placeholder="Search client or location..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        {/* Filter dropdowns */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Status filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto gap-2">
            <label htmlFor="status" className="text-gray-900 dark:text-white whitespace-nowrap font-medium">Status:</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={(e) => {
                console.log("Selected status:", e.target.value);
                setFilters(prevFilters => ({
                  ...prevFilters,
                  status: e.target.value
                }));
              }}
              className="w-full sm:w-auto px-4 py-2 border dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white appearance-none bg-white dark:bg-gray-800"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Timeframe filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto gap-2">
            <label htmlFor="timeframe" className="text-gray-900 dark:text-white whitespace-nowrap font-medium">Timeframe:</label>
            <select
              id="timeframe"
              name="timeframe"
              value={filters.timeframe}
              onChange={handleFilterChange}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white appearance-none bg-white dark:bg-gray-800"
            >
              <option value="all">All Time</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="thisMonth">This Month</option>
              <option value="nextMonth">Next Month</option>
            </select>
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No bookings found matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                    <th scope="col" className="hidden sm:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Event</th>
                    <th scope="col" className="hidden sm:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                    <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                  {bookings.map(booking => {
                    const totalAmount = Number(booking.totalAmount) || 0;
                    const depositAmount = Number(booking.depositAmount) || 0;
                    const pendingAmount = totalAmount - depositAmount;
                    let status = 'Pending';
                    if (totalAmount === 0 || pendingAmount <= 0) {
                      status = 'Confirmed';
                    }

                    return (
                      <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-300">
                          {new Date(booking.startDateTime).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-300">
                          {booking.clientName}
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-300">
                          {booking.eventType}
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-300">
                          {booking.location}
                        </td>
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-300">
                          ₹{pendingAmount.toFixed(2)}
                        </td>
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap">
                          <span className={`inline-flex text-xs px-2 py-1 rounded-full font-medium ${
                            status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-center text-sm">
                          <div className="relative inline-block">
                            <button
                              className="text-gray-400 hover:text-gray-500 focus:outline-none p-2"
                              onClick={(e) => toggleDropdown(e, booking._id)}
                            >
                              <FontAwesomeIcon icon={faEllipsisV} />
                            </button>

                            {dropdownOpen === booking._id && (
                              <div
                                ref={dropdownRef}
                                className={`fixed bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700 ${
                                  dropdownPosition.isAbove ? 'bottom-full mb-1' : 'top-full mt-1'
                                }`}
                                style={{
                                  top: dropdownPosition.top,
                                  left: dropdownPosition.left,
                                  width: "160px",
                                  transform: 'scale(1)',
                                  transformOrigin: dropdownPosition.isAbove ? 'bottom' : 'top',
                                  animation: 'scaleIn 0.2s ease-out',
                                }}
                              >
                                <Link 
                                  to={`/bookingsdetails`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => {
                                    localStorage.setItem('selectedBooking', JSON.stringify(booking));
                                    setDropdownOpen(null);
                                  }}
                                >
                                  <FontAwesomeIcon icon={faEye} className="mr-3 text-gray-400" />
                                  View
                                </Link>
                                <Link
                                  to={`/bookings/${booking._id}/edit`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => setDropdownOpen(null)}
                                >
                                  <FontAwesomeIcon icon={faEdit} className="mr-3 text-gray-400" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => {
                                    setDropdownOpen(null);
                                    handleDelete(booking._id);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <FontAwesomeIcon icon={faTrashAlt} className="mr-3 text-red-400" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;