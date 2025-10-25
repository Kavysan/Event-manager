import { createContext, useState, useContext, useEffect } from "react";
import { fetchEvents as fetchAllEvents, searchEvents as apiSearchEvents } from "../api/api.js"; 
import { useAuth } from "./AuthContext.jsx";

const EventContext = createContext();

export const useEventContext = () => useContext(EventContext);

export const EventProvider = ({children}) => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);

    const {user} = useAuth();

    useEffect(() => {
        if (user) {
            const saveCart = JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];
            setCart(saveCart)
        } else {
            setCart([]);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            localStorage.setItem(`cart_${user.id}`,JSON.stringify(cart))
        }
    }, [user,cart])

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await fetchAllEvents();
            setEvents(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to load events");
        } finally {
            setLoading(false);
        }
    };


    //search for events
    const searchForEvents = async (query) => {
        setLoading(true);
        try {
            const data = await apiSearchEvents(query);
            setEvents(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to search events");
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = async () => {
        setSearchQuery("");
        await fetchEvents();
    }

    const addToCart = (event, quantityToAdd = 1) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.event.id === event.id);

            if (existing) {
            return prev.map((item) =>
                item.event.id === event.id
                ? { ...item, quantity: item.quantity + quantityToAdd }
                : item
            );
            }

            // If new event, add with selected quantity
            return [...prev, { event, quantity: quantityToAdd }];
        });
    };

    const removeFromCart = (eventId) => {
        setCart(prev => prev.filter(item => item.event.id !== eventId));
    };

    const updateQuantity = (eventId, quantity) => {
        if (quantity <= 0) return removeFromCart(eventId);
        setCart(prev => prev.map(item =>
            item.event.id === eventId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => setCart([]);

    const value = {
        selectedEvent,
        setSelectedEvent,
        events,
        setEvents,
        loading,
        setLoading,
        searchQuery,
        setSearchQuery,
        fetchEvents,
        searchForEvents,
        clearSearch,
        cart,
        setCart,
        addToCart,
        clearCart,
        removeFromCart,
        updateQuantity
    };

    return (
        <EventContext.Provider value={value}>
            {children}
        </EventContext.Provider>
    );

};