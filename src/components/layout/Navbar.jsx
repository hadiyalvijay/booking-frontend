import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaBars, FaUserCircle, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
import { ThemeContext } from "../../context/ThemeContext";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const localData = localStorage.getItem("token");
  const userData = localStorage.getItem("User Name") || "Profile";

  const changeHandler = () => {
    localStorage.clear();
    toast.success("Logout Successfully");
    navigate("/");
  };

  const navStyle = {
    background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  };

  const navLinkStyle = {
    color: "white",
    transition: "all 0.3s ease-in-out",
    textDecoration: "none",
    position: "relative",
    // padding: "8px 16px",
    borderRadius: "6px",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    }
  };

  const dropdownStyle = {
    position: "absolute",
    top: "100%",
    right: 0,
    minWidth: "220px",
    // padding: "0.5rem",
    marginTop: "0.5rem",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    animation: "fadeIn 0.2s ease-in-out",
    zIndex: 1000,
  };

  const themeButtonStyle = {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg  fixed-top" style={navStyle}>
        <div className="container-fluid ">
          {isMobile && (
            <button 
              className="btn text-white" 
              onClick={() => setIsSidebarOpen(true)}
              // style={{ 
              //   backgroundColor: "rgba(255, 255, 255, 0.1)",
              //   borderRadius: "10px",
              //   border: "1px solid rgba(255, 255, 255, 0.2)",
              //   transition: "all 0.3s ease"
              // }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              }}
            >
              <FaBars className="" />
            </button>
          )}

          <Link 
            className=" d-flex align-items-center text-white gap-2" 
            to="/"
            style={{ 
              fontSize: "1.5rem",
              fontWeight: "600",
              letterSpacing: "0.5px",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => e.target.style.opacity = "0.8"}
            onMouseLeave={(e) => e.target.style.opacity = "1"}
          >
            <span className="text-3xl"><img src="./public/assets/QBill__2.png" alt="" className="w-8"/></span>
            <span className="font-semibold tracking-wide">DJ Booking</span>
          </Link>

          {!isMobile && (
            <div className="mx-auto">
              <ul className="navbar-nav d-flex gap-3">
                {navLinks.map((item, index) => (
                  <li key={index} className="nav-item">
                    <Link 
                      className="nav-link text-white" 
                      to={item.path}
                      style={{
                        borderRadius: "8px",
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="d-flex align-items-center">
            <button 
              onClick={toggleTheme} 
              className=""
              style={{
                // backgroundColor: "rgba(255, 255, 255, 0.1)",
                // borderRadius: "10px",
                // border: "1px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              }}
            >
              {theme === "light" ? 
                <FaMoon size={20} className="text-white" /> : 
                <FaSun size={20} className="text-white" />
              }
            </button>

            {localData ? (
              <div className="dropdown" ref={dropdownRef}>
                <button
                  className="d-flex align-items-center gap-2 px-3 py-2"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "white",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  <FaUserCircle size={24} />
                  <span className="ms-2 d-none d-sm-inline">{userData}</span>
                </button>
                {dropdownOpen && (
                  <div style={dropdownStyle}>
                    <Link 
                      className="dropdown-item rounded-lg py-2 px-3 mb-1 gap-2" 
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      style={{ transition: "all 0.2s ease" }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                    >
                      <div className="d-flex align-items-center">
                        <FaUserCircle className="me-2" size={20} />
                        <span>{userData}</span>
                      </div>
                    </Link>
                    <hr className="my-2 opacity-10" />
                    <button 
                      className="dropdown-item rounded-lg py-2 px-3 text-danger" 
                      onClick={() => {
                        setDropdownOpen(false);
                        changeHandler();
                      }}
                      style={{ transition: "all 0.2s ease" }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#fee2e2"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                    >
                      <div className="d-flex align-items-center">
                        <FaSignOutAlt className="me-2" size={20} />
                        <span>Logout</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                className="btn px-4 py-2" 
                to="/login"
                style={{
                  // backgroundColor: "rgba(255, 255, 255, 0.1)",
                  // borderRadius: "10px",
                  // border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "white",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                }}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {isSidebarOpen && <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />}
    </>
  );
};

const navLinks = [
  { label: "Bookings", path: "/bookings" },
  { label: "Payments", path: "/payments" },
  { label: "Expenses", path: "/expenses" },
  { label: "Reports", path: "/reports" },
];

export default Navbar;