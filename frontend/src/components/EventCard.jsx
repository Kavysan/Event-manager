import "../css/EventCard.css";
import { useEventContext } from "../contexts/EventContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function EventCard({ event }) {
    const navigate = useNavigate();
    const { addToCart, cart, updateQuantity, removeFromCart } = useEventContext();
    const [showCartOptions, setShowCartOptions] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const imageUrl =
        event.images?.[0]?.url ||
        "https://via.placeholder.com/300x200?text=No+Image";
    const eventDate = event.dates?.start?.localDate;
    const eventTime = event.dates?.start?.localTime;
    const venue = event._embedded?.venues?.[0]?.name || "Unknown venue";
    const city = event._embedded?.venues?.[0]?.city?.name || "";
    const state = event._embedded?.venues?.[0]?.state?.name || "";

    const cartItem = cart.find((item) => item.event.id === event.id);

    const handleBuyClick = async () => {
        const token = localStorage.getItem("access_token");
        if (!token || token === "undefined" || token === "null") {
            navigate('/login', { state: { message: "Please login to buy tickets first." } });
            return
        } 
        else setShowCartOptions(true);
    };


    const handleAddToCartClick = async () => {
        const token = localStorage.getItem("access_token"); // get user token
        try {
            // Add the event to backend if not already added
            await api.post(
            "/events/",
            {
                id: event.id,
                title: event.name || event.title,
                description: event.info || "No Description",
            },
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );

            // Always just add to cart in frontend
            addToCart(event, quantity);
            setShowCartOptions(false);
            setQuantity(1);
        } catch (err) {
            if (err.response && err.response.status === 400) {
            console.log("Event already exists in backend, adding to cart only");
            addToCart(event, quantity);
            setShowCartOptions(false);
            setQuantity(1);
            } else {
            console.error("Error adding event to backend:", err);
            }
        }
    };





  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="event-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-200">
        <div className="event-poster relative">
        <img
            src={imageUrl}
            alt={event.name}
            className="w-full h-48 object-cover"
        />
        </div>

        <div className="event-info p-4">
        <h3 className="text-lg font-bold mb-1">{event.name}</h3>
        <p className="text-sm text-gray-600 mb-1">
            {eventDate} {eventTime && `at ${eventTime}`}
        </p>
        <p className="text-sm text-gray-600 mb-2">
            {venue}, {city} {state}
        </p>

        {event.registeredTickets ? (
            <p className="text-green-600 font-semibold mt-2">
            Tickets registered: {event.registeredTickets}
            </p>
        ) : 
        cartItem ? (
            <div className="cart-controls flex items-center gap-2 mt-3">
            <button
                className="quantity-btn bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                onClick={() => updateQuantity(event.id, cartItem.quantity - 1)}
            >
                -
            </button>
            <span className="quantity">{cartItem.quantity}</span>
            <button
                className="quantity-btn bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                onClick={() => updateQuantity(event.id, cartItem.quantity + 1)}
            >
                +
            </button>
            <button
                className="delete-btn text-red-600 ml-2"
                onClick={() => removeFromCart(event.id)}
            >
                <FontAwesomeIcon icon={faTrash} />
            </button>
            </div>
        ) : 
        !showCartOptions && (
            <button
            className="buy-button inline-block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition w-full"
            onClick={handleBuyClick}
            >
            Buy Tickets
            </button>
        )}

        {/* Cart quantity controls when Buy Tickets clicked */}
        {showCartOptions && !cartItem && (
            <div className="flex flex-col items-center gap-3 mt-2">
            <div className="flex items-center gap-4">
                <button
                className="px-3 py-1 border rounded-lg bg-gray-200 hover:bg-gray-300"
                onClick={decrement}
                >
                −
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                className="px-3 py-1 border rounded-lg bg-gray-200 hover:bg-gray-300"
                onClick={increment}
                >
                +
                </button>
            </div>
            <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded w-full"
                onClick={handleAddToCartClick}
            >
                Add to Cart
            </button>
            </div>
        )}
        </div>
    </div>
    );

}

export default EventCard;
