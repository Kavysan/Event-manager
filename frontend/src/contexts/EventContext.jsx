import { createContext, useState, useContext, useEffect } from "react";
import { fetchEvents as fetchAllEvents, searchEvents as apiSearchEvents } from "../api/api.js";
import { useAuth } from "./AuthContext.jsx";

const EventContext = createContext();

export const useEventContext = () => useContext(EventContext);

export const EventProvider = ({ children }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);

  const { user } = useAuth();

  // 🧾 Load cart from localStorage for each user
  useEffect(() => {
    if (user) {
      const savedCart = JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];
      setCart(savedCart);
    } else {
      setCart([]);
    }
  }, [user]);

  // 💾 Save cart to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
    }
  }, [user, cart]);

  // 🎫 Fetch all events (default view)
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

  // 🔍 Search Ticketmaster API directly (not just local filtering)
  const searchForEvents = async (query) => {
    setLoading(true);
    try {
      let data = [];

      if (!query || query.trim() === "") {
        // If query empty → load all events
        data = await fetchAllEvents();
      } else {
        // Fetch directly from Ticketmaster search API
        data = await apiSearchEvents(query);
      }

      setEvents(data);
      setError(null);
    } catch (err) {
      console.error("Failed to search events:", err);
      setError("Failed to search events");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Clear search and reload all events
  const clearSearch = async () => {
    setSearchQuery("");
    await fetchEvents();
  };

  // 🛒 Add event to cart
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
      return [...prev, { event, quantity: quantityToAdd }];
    });
  };

  // 🗑 Remove event from cart
  const removeFromCart = (eventId) => {
    setCart((prev) => prev.filter((item) => item.event.id !== eventId));
  };

  // 🔢 Update event quantity in cart
  const updateQuantity = (eventId, quantity) => {
    if (quantity <= 0) return removeFromCart(eventId);
    setCart((prev) =>
      prev.map((item) =>
        item.event.id === eventId ? { ...item, quantity } : item
      )
    );
  };

  // 🧹 Clear entire cart
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
    updateQuantity,
    error,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};
