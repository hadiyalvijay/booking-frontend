import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useParams } from 'react-router-dom';

const localizer = momentLocalizer(moment);

const calendarStyles = {
  dayPropGetter: (date) => {
    const today = moment().startOf('day').toDate();
    const isToday = moment(date).isSame(today, 'day');
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    return {
      className: isToday ? (isDarkMode ? 'bg-cyan-900' : 'bg-cyan-200') : '',
      style: { 
        border: isDarkMode ? '1px solid #2d3748' : '1px solid #e2e8f0',
        backgroundColor: isDarkMode ? 'rgba(26, 32, 44, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        color: isDarkMode ? '#e2e8f0' : '#2d3748',
        backdropFilter: 'blur(5px)',
      }
    };
  },
  eventPropGetter: (event) => {
    let backgroundColor = 'linear-gradient(135deg, #00ddeb, #00b7c2)';
    const eventType = event.resource?.eventType?.toLowerCase() || '';

    if (eventType.includes('wedding')) {
      backgroundColor = 'linear-gradient(135deg, #ff6bd6, #d946ef)';
    } else if (eventType.includes('corporate')) {
      backgroundColor = 'linear-gradient(135deg, #00e676, #00c853)';
    } else if (eventType.includes('party')) {
      backgroundColor = 'linear-gradient(135deg, #ffaa00, #ff7b00)';
    }

    return {
      style: {
        background: backgroundColor,
        borderRadius: '10px',
        opacity: 0.95,
        color: '#fff',
        padding: '3px 6px',
        border: 'none',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
        fontSize: '10px',
        fontWeight: '600',
        transition: 'transform 0.2s',
      }
    };
  }
};

const BookingCalendar = () => {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode changes
  useEffect(() => {
    const isDarkModeEnabled = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDarkModeEnabled);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Fetch bookings from localStorage
  useEffect(() => {
    const fetchBookings = () => {
      setLoading(true);
      try {
        const storedBookings = localStorage.getItem('bookings');
        if (!storedBookings) {
          console.warn('No bookings found in localStorage. Initializing with empty array.');
          localStorage.setItem('bookings', JSON.stringify([]));
        }

        const bookings = JSON.parse(storedBookings || '[]');
        const filteredBookings = id ? bookings.filter(b => b._id === id) : bookings;

        const calendarEvents = filteredBookings.map(booking => {
          if (!booking._id || !booking.startDateTime || !booking.endDateTime) {
            console.error('Invalid booking data:', booking);
            throw new Error('Invalid booking data structure');
          }
          return {
            id: booking._id,
            title: `${booking.clientName || 'Unknown'} - ${booking.eventType || 'Event'}`,
            start: new Date(booking.startDateTime),
            end: new Date(booking.endDateTime),
            resource: {
              ...booking,
              totalAmount: booking.totalAmount ? Number(booking.totalAmount) : null // Convert to number
            }
          };
        });

        setEvents(calendarEvents);
        setError(null);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings from localStorage.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [id]);

  const handleSelectEvent = (event) => {
    console.log('Event clicked:', event);
    if (event && event.resource) {
      setSelectedEvent(event.resource);
      setShowModal(true);
      console.log(`Viewing details for event: ${event.id}`);
    } else {
      console.error('No resource found in event:', event);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  const formatDateTime = (dateTimeStr) => moment(dateTimeStr).format('MMM D, YYYY h:mm A');

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Cancel this event?')) {
      try {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const updatedBookings = bookings.filter(b => b._id !== bookingId);
        localStorage.setItem('bookings', JSON.stringify(updatedBookings));
        setEvents(events.filter(event => event.id !== bookingId));
        closeModal();
      } catch (err) {
        console.error('Error cancelling booking:', err);
        setError('Failed to cancel event.');
      }
    }
  };

  const EventModal = ({ event, onClose, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-fadeIn">
      <div 
        className={`${isDarkMode ? 'bg-gray-900/90 text-gray-100' : 'bg-white/90 text-gray-900'} 
          p-4 sm:p-6 rounded-2xl shadow-xl w-11/12 sm:w-96 md:w-[28rem] 
          backdrop-blur-md border ${isDarkMode ? 'border-gray-800' : 'border-gray-300'} 
          max-h-[85vh] overflow-y-auto animate-slideUp`}
      >
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-lg font-bold tracking-wide text-cyan-400 drop-shadow truncate">
            {event.clientName}
          </h5>
          <button 
            onClick={onClose} 
            className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} 
              text-2xl font-bold hover:scale-110 transition-transform`}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 gap-2">
            <p><span className="font-semibold text-cyan-400">Event:</span> {event.eventType || 'N/A'}</p>
            <p>
              <span className="font-semibold text-cyan-400">Time:</span> 
              {formatDateTime(event.startDateTime)} - {formatDateTime(event.endDateTime)}
            </p>
            <p><span className="font-semibold text-cyan-400">Location:</span> {event.location || 'N/A'}</p>
            <p>
              <span className="font-semibold text-cyan-400">Amount:</span> 
              ₹{typeof event.totalAmount === 'number' ? event.totalAmount.toFixed(2) : 'N/A'}
            </p>
            <p>
              <span className="font-semibold text-cyan-400">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                event.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' :
                event.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {event.status || 'Pending'}
              </span>
            </p>
            {event.notes && (
              <p>
                <span className="font-semibold text-cyan-400">Notes:</span>
                <span className="block mt-1 text-gray-300">{event.notes}</span>
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-5">
            <button
              onClick={() => window.location.href = `/edit-booking/${event._id}`}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-magenta-500 to-magenta-700 
                hover:from-magenta-600 hover:to-magenta-800 text-white shadow-lg 
                hover:shadow-magenta-500/50 transition-all duration-300"
            >
              Edit
            </button>
            <button
              onClick={() => onCancel(event._id)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-700 
                hover:from-red-600 hover:to-red-800 text-white shadow-lg 
                hover:shadow-red-500/50 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen p-4 sm:p-6 flex items-center justify-center`} style={{ width: "90vw" }}>
      <div className="max-w-4xl w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className={`text-2xl sm:text-3xl font-extrabold ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'} tracking-tight drop-shadow-md`}>
            Event Matrix
          </h2>
          <button
            onClick={() => window.location.href = '/new-booking'}
            className={`mt-3 sm:mt-0 px-5 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 shadow-lg hover:shadow-cyan-500/50 transition-all duration-300`}
          >
            New Event
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className={`animate-spin h-10 w-10 border-t-4 ${isDarkMode ? 'border-cyan-400' : 'border-cyan-600'} border-solid rounded-full`}></div>
          </div>
        ) : error ? (
          <div className={`${isDarkMode ? 'bg-red-950 text-red-300' : 'bg-red-300 text-red-900'} p-4 rounded-xl shadow-md`}>{error}</div>
        ) : (
          <div className={`${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} rounded-2xl shadow-2xl p-4 sm:p-6 backdrop-blur-md border ${isDarkMode ? 'border-gray-800' : 'border-gray-300'}`}>
            <div style={{ height: window.innerWidth < 640 ? '400px' : '600px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectEvent={handleSelectEvent}
                views={['month', 'week', 'day']}
                dayPropGetter={calendarStyles.dayPropGetter}
                eventPropGetter={calendarStyles.eventPropGetter}
                className={`rounded-xl ${isDarkMode ? 'dark-mode-calendar' : ''}`}
              />
            </div>
          </div>
        )}

        {showModal && selectedEvent && (
          <EventModal 
            event={selectedEvent}
            onClose={closeModal}
            onCancel={handleCancelBooking}
          />
        )}
      </div>

      {/* Move styles to a separate CSS file or use CSS-in-JS */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
          }
          
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          .dark-mode-calendar .rbc-toolbar {
            background: ${isDarkMode ? 'rgba(26, 32, 44, 0.9)' : 'rgba(243, 244, 246, 0.9)'};
            color: ${isDarkMode ? '#e2e8f0' : '#2d3748'};
            padding: 6px;
            border-radius: 12px 12px 0 0;
            flex-direction: column;
            gap: 4px;
            backdrop-filter: blur(5px);
          }
          
          .dark-mode-calendar .rbc-toolbar button {
            background: ${isDarkMode ? '#4a5568' : '#e2e8f0'};
            color: ${isDarkMode ? '#e2e8f0' : '#2d3748'};
            border: none;
            padding: 5px 10px;
            border-radius: 16px;
            font-size: 11px;
            font-weight: 600;
            transition: all 0.3s;
          }
          
          .dark-mode-calendar .rbc-toolbar button:hover {
            background: ${isDarkMode ? '#00ddeb' : '#00b7c2'};
            color: #fff;
          }
          
          .dark-mode-calendar .rbc-toolbar button.rbc-active {
            background: ${isDarkMode ? '#00ddeb' : '#00b7c2'};
            color: #fff;
          }
          
          .dark-mode-calendar .rbc-header {
            background: ${isDarkMode ? 'rgba(45, 55, 72, 0.8)' : 'rgba(247, 250, 252, 0.8)'};
            color: ${isDarkMode ? '#e2e8f0' : '#4a5568'};
            padding: 6px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            backdrop-filter: blur(5px);
          }
          
          .dark-mode-calendar .rbc-month-view, 
          .dark-mode-calendar .rbc-time-view {
            border-radius: 0 0 12px 12px;
            overflow: hidden;
          }
          
          .dark-mode-calendar .rbc-day-bg {
            transition: all 0.2s;
          }
          
          .dark-mode-calendar .rbc-day-bg:hover {
            background: ${isDarkMode ? 'rgba(45, 55, 72, 0.8)' : 'rgba(203, 213, 224, 0.5)'};
          }
          
          .dark-mode-calendar .rbc-off-range-bg {
            background: ${isDarkMode ? 'rgba(23, 25, 35, 0.8)' : 'rgba(237, 242, 247, 0.8)'};
          }
          
          .dark-mode-calendar .rbc-date-cell {
            font-size: 11px;
            padding: 3px;
            text-align: center;
          }
          
          .dark-mode-calendar .rbc-today {
            background: ${isDarkMode ? 'rgba(45, 55, 72, 0.9)' : 'rgba(236, 254, 255, 0.9)'};
          }
          
          .dark-mode-calendar .rbc-event:hover {
            transform: scale(1.05);
          }

          @media (max-width: 640px) {
            .rbc-month-view .rbc-row {
              min-height: 50px;
            }
            .rbc-month-view .rbc-date-cell {
              font-size: 9px;
              padding: 2px;
            }
            .rbc-event {
              padding: 2px 4px !important;
              font-size: 9px !important;
              border-radius: 6px !important;
            }
            .rbc-toolbar {
              padding: 4px;
              gap: 3px;
            }
            .rbc-btn-group {
              display: flex;
              flex-wrap: wrap;
              gap: 3px;
            }
            .rbc-btn-group button {
              flex: 1;
              min-width: 70px;
              padding: 4px 8px;
              font-size: 10px;
            }
            .dark-mode-calendar .rbc-header {
              font-size: 10px;
              padding: 4px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default BookingCalendar;