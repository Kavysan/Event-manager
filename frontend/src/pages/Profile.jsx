import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import { getToken } from "../utils/auth";
import "../css/Profile.css";

function Profile() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [ticketCounts, setTicketCounts] = useState({}); // tickets per booking

  // Fetch bookings from API
  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) {
        setError("❌ You are not logged in.");
        setBookings([]);
        return;
      }
      const response = await api.get("/events/my-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
    //   console.log("Bookings from API:", response.data);
      setBookings(response.data);

      // Initialize ticketCounts for each booking
      const counts = {};
      response.data.forEach((b) => {
        counts[b.event.id] = b.tickets_booked;
      });
      setTicketCounts(counts);
    } catch (err) {
      console.error(err);
      setError("Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  // Update booking
  const updateBooking = async (eventId) => {
    try {
      const token = getToken();
      if (!token) {
        setError("❌ You are not logged in.");
        return;
      }

      const newTickets = ticketCounts[eventId];
      const response = await api.put(
        `/events/${eventId}/register`,
        { tickets_booked: newTickets },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b.event.id === eventId ? { ...b, tickets_booked: newTickets } : b
        )
      );

      setEditingId(null);
      alert(response.data.message || "Booking updated successfully!");
    } catch (err) {
      console.error("Couldn't update registration", err);
      setError("Failed to update booking.");
    }
  };

  // Delete booking
  const deleteBooking = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel the booking?")) return;

    try {
      const token = getToken();
      if (!token) {
        setError("❌ You are not logged in.");
        return;
      }

      await api.delete(`/events/${eventId}/register`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings((prev) => prev.filter((b) => b.event.id !== eventId));
      setEditingId(null);
      alert("Booking deleted successfully!");
    } catch (err) {
      console.error("Unable to delete booking", err);
      setError("Failed to delete booking.");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) fetchBookings();
  }, [location.state]);

  const incrementTicket = (id) => {
    setTicketCounts((prev) => ({
      ...prev,
      [id]: prev[id] + 1,
    }));
  };

  const decrementTicket = (id) => {
    setTicketCounts((prev) => ({
      ...prev,
      [id]: prev[id] > 1 ? prev[id] - 1 : 1,
    }));
  };

  // Debug editingId changes
  useEffect(() => {
  }, [editingId]);

  // Ensure ticket counts are initialized when bookings change
  useEffect(() => {
    if (bookings.length > 0) {
      const counts = {};
      bookings.forEach((b) => {
        if (b.event?.id) counts[b.event.id] = b.tickets_booked;
      });
      setTicketCounts(counts);
    }
  }, [bookings]);

  return (
    <div className="profile p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">My Bookings</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && bookings.length === 0 && <p>You have not registered for any events yet.</p>}

      {!loading && bookings.length > 0 && (
        <div className="bookings-list space-y-4">
          {bookings.map((item, index) => {
            // console.log("Booking item:", item); // DEBUG: check structure
            const eventId = item.event?.id; // safely get id
            return (
              <div
                key={eventId || index}
                className="booking-item border p-4 rounded-lg bg-gray-50 shadow-sm flex flex-col gap-3"
              >
                <h3 className="font-bold text-lg">{item.event?.name}</h3>
                <p>Tickets booked: {item.tickets_booked}</p>

                <div className="flex gap-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => {
                    //   console.log("Event ID clicked:", eventId);
                      setEditingId(eventId);
                    }}
                  >
                    Update Booking
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => deleteBooking(eventId)}
                  >
                    Delete
                  </button>
                </div>

                {editingId === eventId && (
                  <div className="flex flex-col gap-3 mt-2">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => decrementTicket(eventId)}
                        className="bg-gray-300 text-black px-3 py-1 rounded"
                      >
                        -
                      </button>
                      <span className="font-semibold">{ticketCounts[eventId]}</span>
                      <button
                        onClick={() => incrementTicket(eventId)}
                        className="bg-gray-300 text-black px-3 py-1 rounded"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => updateBooking(eventId)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Profile;
