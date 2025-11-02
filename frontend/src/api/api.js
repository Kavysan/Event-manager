// const BASE_URL = "https://app.ticketmaster.com/discovery/v2";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

console.log("Using API:", import.meta.env.VITE_BASE_URL, import.meta.env.VITE_API_KEY);

// 🟢 Fetch general events (homepage)
export const fetchEvents = async (keyword = "") => {
  try {
    const allEvents = [];

    // Load multiple pages to get a richer dataset
    for (let page = 0; page < 3; page++) {
      const url = `${BASE_URL}/events.json?countryCode=US&page=${page}&size=50${
        keyword ? `&keyword=${encodeURIComponent(keyword)}` : ""
      }&apikey=${API_KEY}`;

      const response = await fetch(url);
      if (!response.ok) break;

      const data = await response.json();
      const events = data._embedded?.events || [];
      allEvents.push(...events);
    }

    return allEvents;
  } catch (error) {
    console.error("Failed to fetch events from API:", error);
    return [];
  }
};

// 🔍 Search events (supports partial match)
export const searchEvents = async (query) => {
  try {
    if (!query.trim()) return await fetchEvents(); // fallback to default

    const allEvents = [];

    // Fetch first 3 pages of US events
    for (let page = 0; page < 3; page++) {
      const url = `${BASE_URL}/events.json?countryCode=US&page=${page}&size=50&apikey=${API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) break;

      const data = await response.json();
      const events = data._embedded?.events || [];
      allEvents.push(...events);
    }

    // 🧠 Case-insensitive, partial word match
    const filtered = allEvents.filter((e) =>
      e.name?.toLowerCase().includes(query.toLowerCase())
    );

    console.log(`Search "${query}" → ${filtered.length} matches`);
    return filtered;
  } catch (error) {
    console.error("Failed to search events:", error);
    return [];
  }
};
