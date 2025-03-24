import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        // Get current expenses from localStorage
        const currentExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        // Filter out the deleted expense
        const updatedExpenses = currentExpenses.filter(expense => expense._id !== id);
        // Save back to localStorage
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
        // Update UI
        setExpenses(updatedExpenses);
      } catch (err) {
        console.error('Error deleting expense:', err);
        alert('Failed to delete expense');
      }
    }
  };

  const [filters, setFilters] = useState({
    category: 'all',
    searchQuery: '',
    timeframe: 'thisMonth',
    sortBy: 'date'
  });
  const [summary, setSummary] = useState({
    totalAmount: 0,
    categoryBreakdown: {}
  });

  const filterExpenses = (expenses, filters) => {
    let filtered = [...expenses];

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(expense => expense.category === filters.category);
    }

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query)
      );
    }

    // Apply timeframe filter
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);

    switch (filters.timeframe) {
      case 'thisMonth':
        filtered = filtered.filter(expense => new Date(expense.expenseDate) >= startOfMonth);
        break;
      case 'lastMonth':
        filtered = filtered.filter(expense => {
          const date = new Date(expense.expenseDate);
          return date >= startOfLastMonth && date < startOfMonth;
        });
        break;
      case 'thisQuarter':
        filtered = filtered.filter(expense => new Date(expense.expenseDate) >= startOfQuarter);
        break;
      case 'thisYear':
        filtered = filtered.filter(expense => new Date(expense.expenseDate) >= startOfYear);
        break;
      case 'lastYear':
        filtered = filtered.filter(expense => {
          const date = new Date(expense.expenseDate);
          return date >= startOfLastYear && date < startOfYear;
        });
        break;
      default:
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(b.expenseDate) - new Date(a.expenseDate);
        case 'dateAsc':
          return new Date(a.expenseDate) - new Date(b.expenseDate);
        case 'amountDesc':
          return b.amount - a.amount;
        case 'amountAsc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return filtered;
  };

  useEffect(() => {
    const fetchExpenses = () => {
      try {
        setLoading(true);
        // Get expenses from localStorage
        const allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        
        // Apply filters
        const filteredExpenses = filterExpenses(allExpenses, filters);
        setExpenses(filteredExpenses);

        // Calculate summary
        const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const breakdown = filteredExpenses.reduce((acc, expense) => {
          const category = expense.category;
          if (!acc[category]) {
            acc[category] = 0;
          }
          acc[category] += expense.amount;
          return acc;
        }, {});

        setSummary({
          totalAmount: total,
          categoryBreakdown: breakdown
        });

        setError(null);
      } catch (err) {
        setError('Failed to fetch expenses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  if (loading) return <div className="text-center text-gray-500 dark:text-gray-400">Loading expenses...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container-fluid mx-auto p-2 sm:p-4 mt-80 sm:mt-24 w-full" style={{width: '80vw'}}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold mb-2 sm:mb-0 dark:text-white">Expenses</h2>
        <div className="text-xl font-bold mb-2 sm:mb-0 dark:text-white">Total: <span className="text-green-600 dark:text-green-400">₹{summary.totalAmount.toFixed(2)}</span></div>
        <Link to="/expenses/new" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 sm:w-auto text-center">
          <i className="icon-plus"></i> Add Expense
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(summary.categoryBreakdown).map(([category, amount]) => (
          <div key={category} className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
            <h4 className="font-semibold dark:text-white">{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
            <div className="text-lg text-gray-700 dark:text-gray-300">₹{amount.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            name="searchQuery"
            value={filters.searchQuery}
            onChange={handleFilterChange}
            placeholder="Search description..."
            className="bg-white border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md w-full sm:w-64 dark:bg-gray-800 dark:text-white"
          />
        </form>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="category" className="block text-gray-700 dark:text-gray-300">Category:</label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="bg-white border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            >
              <option value="all" className="dark:bg-gray-800 dark:text-white">All Categories</option>
              <option value="equipment" className="dark:bg-gray-800 dark:text-white">Equipment</option>
              <option value="travel" className="dark:bg-gray-800 dark:text-white">Travel</option>
              <option value="software" className="dark:bg-gray-800 dark:text-white">Software</option>
              <option value="marketing" className="dark:bg-gray-800 dark:text-white">Marketing</option>
              <option value="office" className="dark:bg-gray-800 dark:text-white">Office Supplies</option>
              <option value="venue" className="dark:bg-gray-800 dark:text-white">Venue Fees</option>
              <option value="contractors" className="dark:bg-gray-800 dark:text-white">Contractors</option>
              <option value="insurance" className="dark:bg-gray-800 dark:text-white">Insurance</option>
              <option value="other" className="dark:bg-gray-800 dark:text-white">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="timeframe" className="block text-gray-700 dark:text-gray-300">Timeframe:</label>
            <select
              id="timeframe"
              name="timeframe"
              value={filters.timeframe}
              onChange={handleFilterChange}
              className="bg-white border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            >
              <option value="thisMonth" className="dark:bg-gray-800 dark:text-white">This Month</option>
              <option value="lastMonth" className="dark:bg-gray-800 dark:text-white">Last Month</option>
              <option value="thisQuarter" className="dark:bg-gray-800 dark:text-white">This Quarter</option>
              <option value="thisYear" className="dark:bg-gray-800 dark:text-white">This Year</option>
              <option value="lastYear" className="dark:bg-gray-800 dark:text-white">Last Year</option>
              <option value="all" className="dark:bg-gray-800 dark:text-white">All Time</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortBy" className="block text-gray-700 dark:text-gray-300">Sort By:</label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="bg-white border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            >
              <option value="date" className="dark:bg-gray-800 dark:text-white">Date (Newest)</option>
              <option value="dateAsc" className="dark:bg-gray-800 dark:text-white">Date (Oldest)</option>
              <option value="amountDesc" className="dark:bg-gray-800 dark:text-white">Amount (Highest)</option>
              <option value="amountAsc" className="dark:bg-gray-800 dark:text-white">Amount (Lowest)</option>
            </select>
          </div>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">No expenses found matching your criteria.</div>
      ) : (
        <div className="overflow-x-auto mt-2">
          <table className="bg-white rounded-md table-auto w-full dark:bg-gray-900 shadow-md rounded-md">
            <thead>
              <tr className="bg-white dark:bg-gray-800">
                <th className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-300">Date</th>
                <th className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-300">Description</th>
                <th className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-300">Category</th>
                <th className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-300">Amount</th>
                <th className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-300">Method</th>
                <th className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <tr key={expense._id} className="border-b dark:border-gray-700">
                  <td className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-200">{new Date(expense.expenseDate).toLocaleDateString()}</td>
                  <td className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-200">{expense.description}</td>
                  <td className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-200">{expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</td>
                  <td className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-200">₹{expense.amount.toFixed(2)}</td>
                  <td className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-200">{expense.paymentMethod}</td>
                  <td className="d-flex gap-2 border-b dark:border-gray-700 px-4 py-2">
                    <Link to={`/expenses/${expense._id}/edit`} className="block text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <FontAwesomeIcon icon={faEye} className="mr-2" />
                    </Link>
                    <button onClick={() => handleDelete(expense._id)} className="w-full text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <FontAwesomeIcon icon={faTrashAlt} className="mr-2" /> 
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;