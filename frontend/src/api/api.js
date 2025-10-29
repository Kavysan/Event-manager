
// const BASE_URL = "https://app.ticketmaster.com/discovery/v2";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const fetchEvents = async (keyword = "") => {
    try {
        const url = `${BASE_URL}/events.json?countryCode=US${
            keyword ? `&keyword=${encodeURIComponent(keyword)}` : ""
        }&apikey=${API_KEY}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        return data._embedded?.events || [];
    } catch (error) {
        console.error("Failed to fetch events from API:", error);
        return [];
    }
};

export const searchEvents = async (query) => {
    try {
        const url = `${BASE_URL}/events.json?countryCode=US&keyword=${encodeURIComponent(query)}&apikey=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data._embedded?.events || [];
    } catch (error) {
        console.error("Failed to search events:", error);
        return [];
    }
};
