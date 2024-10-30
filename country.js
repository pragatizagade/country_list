document.addEventListener("DOMContentLoaded", () => {
    const countryDetails = document.getElementById("countryDetails");
    const backBtn = document.getElementById("backBtn");
    const favoriteBtn = document.getElementById("favoriteBtn");
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // Extract country name from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const countryName = urlParams.get("name");

    // Function to fetch country details
    const fetchCountryDetails = async (name) => {
        try {
            const response = await fetch(`https://restcountries.com/v3.1/name/${name}`);
            if (!response.ok) throw new Error("Failed to fetch country details");

            const [country] = await response.json();
            displayCountryDetails(country);

            // Set initial favorite button text
            if (favorites.includes(country.name.common)) {
                favoriteBtn.textContent = "Unmark as Favorite";
            } else {
                favoriteBtn.textContent = "Mark as Favorite";
            }
        } catch (error) {
            console.error("Error fetching country details:", error);
            countryDetails.innerHTML = `<p>Unable to load country details. Please try again later.</p>`;
        }
    };

    // Function to display country details in the DOM
    const displayCountryDetails = (country) => {
        countryDetails.innerHTML = `
            <h1>${country.name.common}</h1>
            <p>Top Level Domain: ${country.tld.join(", ")}</p>
            <p>Capital: ${country.capital}</p>
            <p>Region: ${country.region}</p>
            <p>Population: ${country.population}</p>
            <p>Area: ${country.area} km²</p>
            <p>Languages: ${Object.values(country.languages).join(", ")}</p>
            <img src="${country.flags.svg}" alt="Flag of ${country.name.common}" />
        `;
    };

    // Function to toggle favorite status
    const toggleFavorite = () => {
        if (favorites.includes(countryName)) {
            favorites.splice(favorites.indexOf(countryName), 1);
            favoriteBtn.textContent = "Mark as Favorite";
        } else if (favorites.length < 5) {
            favorites.push(countryName);
            favoriteBtn.textContent = "Unmark as Favorite";
        } else {
            alert("You can only favorite up to 5 countries.");
        }
        localStorage.setItem("favorites", JSON.stringify(favorites));
    };

    
    // Event listeners
    favoriteBtn.addEventListener("click", toggleFavorite);
    backBtn.addEventListener("click", () => window.history.back());

    // Fetch and display country details if countryName exists
    if (countryName) {
        fetchCountryDetails(countryName);
    } else {
        countryDetails.innerHTML = `<p>No country specified. Please select a country to view details.</p>`;
    }
});
