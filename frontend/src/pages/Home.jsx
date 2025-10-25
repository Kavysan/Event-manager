import { useState, useEffect } from "react";
import { useEventContext } from "../contexts/EventContext";
import '../css/Home.css';
import EventCard from "../components/EventCard"



function Home() {
    const {
        events,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        fetchEvents,
        searchForEvents,
        clearSearch,
    } = useEventContext();
    // const [registeredEvents, setRegisteredEvents] = useState([]);
    // useEffect(() => {
    //   const fetchRegisteredEvents = async () => {
    //     try {
    //       const token = localStorage.getItem("access_token");
    //       const response = await api.get("/users/me/registered-events", {
    //         headers: { Authorization: `Bearer ${token}` },
    //       });
    //       setRegisteredEvents(response.data);
    //     } catch (err) {
    //       console.error("Failed to fetch registered events:", err);
    //     }
    //   };
    //   fetchRegisteredEvents();
    // }, []);


    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        await searchForEvents(searchQuery)
    };

    
    return <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">🎉 Upcoming Events in the USA</h1>
        {/* Search bar */}
        <form onSubmit={handleSearch} className="search-form">
            <input 
                type="text"
                className="search-input"
                placeholder="Search for events"
                value={searchQuery}
                onChange={(e) =>setSearchQuery(e.target.value)} 
            />
            <button className="search-button" type="submit">Search</button>
        </form>

        {loading ? ( <div className="loading"> Loading...</div>
        ) : events.length === 0 ? (
        <p className="text-center">No events found.</p>
      ) : (
        <div className="events-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>

}
export default  Home;