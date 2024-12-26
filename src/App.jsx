import { useState, useEffect, useRef } from "react";
import "./App.css";
import { FaHome, FaChalkboardTeacher, FaBuilding, FaSnowflake, FaMoon, FaSun } from "react-icons/fa";

// Step 1: Create JSON data
const venues = [
    { id: 1, type: "seminar hall", name: "SF1" },
    { id: 2, type: "seminar hall", name: "SF2" },
    { id: 3, type: "seminar hall", name: "SF3" },
    { id: 4, type: "seminar hall", name: "SF4" },
    { id: 5, type: "seminar hall", name: "SF5" },
    { id: 6, type: "auditorium", name: "Main Auditorium" },
    { id: 7, type: "chiller plant", name: "Chiller Plant 1" }
];

const bookings = [
    { venue: "SF1", from: "2024-12-19T10:00:00", to: "2024-12-19T12:00:00" },
    { venue: "Main Auditorium", from: "2024-12-19T14:00:00", to: "2024-12-25T16:00:00" }
];

const App = () => {
    const [selectedVenueType, setSelectedVenueType] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [bookingPopup, setBookingPopup] = useState(null);
    const [isDarkTheme, setIsDarkTheme] = useState(false); // New state for theme

    const popupRef = useRef(null);  // Ref to the booking popup

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleTheme = () => {
        setIsDarkTheme(!isDarkTheme);
    };

    const themeClass = isDarkTheme ? "dark-theme" : "light-theme";

    const isVenueAvailable = (venueName) => {
        const now = new Date();
        return !bookings.some(
            booking => booking.venue === venueName && new Date(booking.from) <= now && now <= new Date(booking.to)
        );
    };

    const formatDateTime = (dateTime) => {
        const options = { 
            year: "numeric", 
            month: "long", 
            day: "numeric", 
            hour: "numeric", 
            minute: "numeric", 
            hour12: true 
        };
        return new Date(dateTime).toLocaleString("en-US", options);
    };

    const getUpcomingBookings = (venueName) => {
        const now = new Date();
        const upcomingBookings = bookings
            .filter(booking => 
                booking.venue === venueName && new Date(booking.to) >= now
            )
            .map(booking => ({
                ...booking,
                formattedFrom: formatDateTime(booking.from),
                formattedTo: formatDateTime(booking.to),
            }));
    
        if (upcomingBookings.length === 0) {
            return [{ formattedFrom: "Available", formattedTo: "" }];
        }
    
        return upcomingBookings;
    };

    const handleBookVenue = (venueName, fromTime, toTime) => {
        const isConflict = bookings.some(
            booking => booking.venue === venueName && (
                (new Date(fromTime) >= new Date(booking.from) && new Date(fromTime) < new Date(booking.to)) ||
                (new Date(toTime) > new Date(booking.from) && new Date(toTime) <= new Date(booking.to))
            )
        );

        if (isConflict) {
            alert("Already booked at that time!");
            return;
        }

        bookings.push({ venue: venueName, from: fromTime, to: toTime });
        setBookingPopup(null);
        alert(`${venueName} booked successfully!`);
    };

    const renderCards = (type) => (
        venues.filter(venue => venue.type === type).map(venue => (
            <div 
                key={venue.id} 
                className="card" 
            >
                <h3>{venue.name}</h3>
                <div className={`status ${isVenueAvailable(venue.name) ? "green" : "red"}`}></div>
                <button onClick={() => setBookingPopup(venue.name)}>Book Now</button>
            </div>
        ))
    );

    const handleSidebarItemClick = (type) => {
        setSelectedVenueType(type);
        setIsSidebarOpen(false);
    };

    // Close booking popup when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setBookingPopup(null);  // Close popup if click is outside
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        // Clean up event listener on component unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className={`app ${themeClass}`}>
            <div className="burger-icon" onClick={toggleSidebar}>
                ☰
            </div>
            <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
                <button onClick={() => handleSidebarItemClick("dashboard")}>
                    <FaHome />
                    {isSidebarOpen && <span>Dashboard</span>}
                </button>
                <button onClick={() => handleSidebarItemClick("seminar hall")}>
                    <FaChalkboardTeacher />
                    {isSidebarOpen && <span>Seminar Hall</span>}
                </button>
                <button onClick={() => handleSidebarItemClick("auditorium")}>
                    <FaBuilding />
                    {isSidebarOpen && <span>Auditorium</span>}
                </button>
                <button onClick={() => handleSidebarItemClick("chiller plant")}>
                    <FaSnowflake />
                    {isSidebarOpen && <span>Chiller Plant</span>}
                </button>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDarkTheme ? <FaSun /> : <FaMoon />}
                    {isSidebarOpen && <span>{isDarkTheme ? "Light Theme" : "Dark Theme"}</span>}
                </button>
            </aside>

            <main className="main-content">
                {selectedVenueType === "dashboard" && (
                    <div className="dashboard">
                        <div className="section"><h2>Auditorium</h2><div className="venue-dash">{renderCards("auditorium")}</div></div>
                        <div className="section"><h2>Seminar Hall</h2><div className="venue-dash SH">{renderCards("seminar hall")}</div></div>
                        <div className="section"><h2>Chiller Plant</h2><div className="venue-dash">{renderCards("chiller plant")}</div></div>
                    </div>
                )}
                
                {selectedVenueType === "auditorium" && (<h1 style={{'textAlign':"center"}}>Auditorium</h1>)}
                
                {selectedVenueType === "seminar hall" && (<h1 style={{'textAlign':"center"}}>Seminar Hall</h1>)}
                
                {selectedVenueType === "chiller plant" && (<h1 style={{'textAlign':"center"}}>Chiller Plant</h1>)}

                {selectedVenueType !== "dashboard" && (
                    <div className="venue-list">
                        {renderCards(selectedVenueType)}
                    </div>
                )}

                {bookingPopup && (
                    <div className="booking-popup-overlay">
                        <div className="booking-popup" ref={popupRef}>
                            <div>
                                <h2>Book {bookingPopup}</h2>
                                <label>From:</label>
                                <input type="datetime-local" id="fromTime" />
                                <label>To:</label>
                                <input type="datetime-local" id="toTime" />
                                <button
                                    onClick={() => {
                                        const fromTime = document.getElementById("fromTime").value;
                                        const toTime = document.getElementById("toTime").value;
                                        handleBookVenue(bookingPopup, fromTime, toTime);
                                    }}
                                >
                                    Confirm Booking
                                </button>
                                <button onClick={() => setBookingPopup(null)}>Cancel</button>
                            </div>
                            <div className="upcoming-booking">
                                <p><span style={{'fontWeight':'bold'}}>Status : </span>{isVenueAvailable({bookingPopup}) ? "Available" : "Not Available"}</p>
                                <h4>Upcoming Bookings:</h4>
                                <ul>
                                {getUpcomingBookings({bookingPopup}).map((booking, index) => (
                                    <li key={index}>
                                    {booking.formattedFrom === "Available" ? (
                                        <p>{`No upcoming booking for ${bookingPopup}`}</p>
                                    ) : (
                                        `${booking.formattedFrom} To: ${booking.formattedTo}`
                                    )}
                                    </li>
                                ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
