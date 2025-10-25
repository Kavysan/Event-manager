import { useEventContext } from "../contexts/EventContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "../css/Checkout.css";
import api from "../api/axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Checkout() {
  const {getToken} = useAuth();
  const token = getToken();
  const [message, setMessage] = useState("");
  const { cart, updateQuantity, clearCart, removeFromCart, loading, setLoading } = useEventContext();
  const navigate = useNavigate();

  const handleDeleteEvent = async (eventId) => {
    const token = localStorage.getItem("access_token");
    try {
      await api.delete(`/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove from frontend cart
      removeFromCart(eventId);
      console.log("Event deleted from backend and cart");
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  const handleRegisterAll = async () => {
    const token = localStorage.getItem("access_token");
    setLoading(true);
    setMessage("");

    try {
      if (!token) {
        setMessage("❌ You are not logged in.");
        setLoading(false);
        return;
      }

      for (const item of cart) {
        console.log("Registering for event ID:", item.event.id);
        await api.post(
          `/events/${item.event.id}/register`,
          { tickets_booked: Number(item.quantity) || 1},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setMessage("🎟️ Successfully registered for all selected events!");
      clearCart();
      navigate("/profile");

    } catch (error) {
      console.error("Registration failed:", error);
      setMessage(
        error.response?.data?.detail ||
          "❌ Failed to register for one or more events."
      );
    } finally {
      setLoading(false);
    }
  };



  if (cart.length === 0) {
    return (
      <p className=" no-booking text-center mt-6">
        Your Cart is Empty! 
      </p>
    );
  }

  return (
    <div className="checkout p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Tickets</h2>
        <button
          onClick={clearCart}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Clear Cart
        </button>
      </div>

      <div className="checkout-list space-y-4">
        {cart.map((item) => (
          <div
            key={item.event.id}
            className="checkout-item flex justify-between items-center border p-4 rounded-lg"
          >
            <div>
              <h3 className="font-bold">{item.event.name}</h3>
              <p>Tickets: {item.quantity}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateQuantity(item.event.id, item.quantity - 1)
                }
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                -
              </button>
              <button
                onClick={() =>
                  updateQuantity(item.event.id, item.quantity + 1)
                }
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                +
              </button>
              <button
                onClick={() => handleDeleteEvent(item.event.id)}
                className="text-red-600"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* ✅ Register Button */}
      <div className="text-center mt-6">
        <button
          onClick={handleRegisterAll}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register for These Events"}
        </button>

        {typeof message === "string" && message.trim() !== "" && (
          <p className="msg mt-4 text-blue-600 font-medium text-center color-black">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Checkout;
