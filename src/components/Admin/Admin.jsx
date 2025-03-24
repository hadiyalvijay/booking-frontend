import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGooglePlusG, faFacebookF, faGithub, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import './PageTransition.css';

const Admin = () => {
    // State for form inputs and active state
    const [isActive, setIsActive] = useState(false);
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [signinData, setSigninData] = useState({
        email: '',
        password: ''
    });
    const [users, setUsers] = useState([]);

    // Load users from localStorage on component mount
    useEffect(() => {
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        }
    }, []);

    // Save users to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users));
    }, [users]);

    // Handle input changes for signup form
    const handleSignupChange = (e) => {
        const { name, value } = e.target;
        setSignupData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle input changes for signin form
    const handleSigninChange = (e) => {
        const { name, value } = e.target;
        setSigninData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle signup form submission
    const handleSignup = (e) => {
        e.preventDefault();

        // Basic validation
        if (!signupData.name || !signupData.email || !signupData.password) {
            alert('Please fill all fields');
            return;
        }

        // Check if user already exists
        if (users.some(user => user.email === signupData.email)) {
            alert('User with this email already exists');
            return;
        }

        // Add new user
        const newUsers = [...users, signupData];
        setUsers(newUsers);

        // Clear form
        setSignupData({ name: '', email: '', password: '' });

        // Switch to sign in
        setIsActive(false);
        alert('Account created successfully! Please sign in.');
    };

    // Handle signin form submission
    const handleSignin = (e) => {
        e.preventDefault();

        // Basic validation
        if (!signinData.email || !signinData.password) {
            alert('Please fill all fields');
            return;
        }

        // Check credentials
        const user = users.find(user =>
            user.email === signinData.email && user.password === signinData.password
        );

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            alert(`Welcome back, ${user.name}!`);
            window.location.href = '/bookings';
        } else {
            alert('Invalid email or password');
        }
    };

    return (
        <div className="login-container">
            <div className={`container ${isActive ? 'active' : ''}`} id="login" style={{ width: '70vw', height: '80vh' }}>
                <div className="form-container sign-up">
                    <form onSubmit={handleSignup}>
                        <h1>Create Account</h1>
                        <div className="social-icons">
                            <a href="#" className="icon"><FontAwesomeIcon icon={faGooglePlusG} /></a>
                            <a href="#" className="icon"><FontAwesomeIcon icon={faFacebookF} /></a>
                            <a href="#" className="icon"><FontAwesomeIcon icon={faGithub} /></a>
                            <a href="#" className="icon"><FontAwesomeIcon icon={faLinkedinIn} /></a>
                        </div>
                        <span>or use your email for registration</span>
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={signupData.name}
                            onChange={handleSignupChange}
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={signupData.email}
                            onChange={handleSignupChange}
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={signupData.password}
                            onChange={handleSignupChange}
                        />
                        <button type="submit">Sign Up</button>
                    </form>
                </div>
                <div className="form-container sign-in">
                    <form onSubmit={handleSignin}>
                        <h1>Sign In</h1>
                        <div className="social-icons">
                            <a href="#" className="icon"><FontAwesomeIcon icon={faGooglePlusG} /></a>
                            <a href="#" className="icon"><FontAwesomeIcon icon={faFacebookF} /></a>
                            <a href="#" className="icon"><FontAwesomeIcon icon={faGithub} /></a>
                            <a href="#" className="icon"><FontAwesomeIcon icon={faLinkedinIn} /></a>
                        </div>
                        <span>or use your email password</span>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={signinData.email}
                            onChange={handleSigninChange}
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={signinData.password}
                            onChange={handleSigninChange}
                        />
                        <a href="#" className="forgot-password">Forget Your Password?</a>
                        <button type="submit">Sign In</button>
                    </form>
                </div>
                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h1>Welcome Back!</h1>
                            <p>Enter your personal details to use all of site features</p>
                            <button
                                className="hidden"
                                id="login"
                                onClick={() => setIsActive(false)}
                            >
                                Sign In
                            </button>

                            
                            <button className="toggle-button" onClick={() => setIsActive(!isActive)}>
                                {isActive ? 'Sign In' : 'Sign Up'}
                            </button>
                            
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1>Hello, Friend!</h1>
                            <p>Register with your personal details to use all of site features</p>
                            <button
                                className="hidden"
                                id="register"
                                onClick={() => setIsActive(true)}
                            >
                                Sign Up
                            </button>

                            <button className="toggle-button" onClick={() => setIsActive(!isActive)}>
                                {isActive ? 'Sign In' : 'Sign Up'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;