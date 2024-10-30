const apiUrl = "https://restcountries.com/v3.1/all"; // URL to fetch country data

// Wait until the document is fully loaded before executing the code
document.addEventListener("DOMContentLoaded", () => {
    // Grab references to all relevant HTML elements for interactivity
    const searchInput = document.getElementById("searchInput");
    const countryList = document.getElementById("countryList");
    const showMoreBtn = document.getElementById("showMoreBtn");
    const favoritesSection = document.getElementById("favoritesSection");
    const favoritesList = document.getElementById("favoritesList");
    const regionFilter = document.getElementById("regionFilter");
    const languageFilter = document.getElementById("languageFilter");

    let currentPage = 1; // Track the current page for pagination
    let countriesData = []; // Stores all fetched country data
    let favorites = JSON.parse(localStorage.getItem("favorites")) || []; // Load favorites from localStorage or initialize as empty array

    // Show favorites section if there are any saved favorites
    if (favorites.length > 0) favoritesSection.classList.remove("hidden");

    // Initialize the app by fetching all countries and populating dropdowns
    const initializeApp = async () => {
        const response = await fetch(apiUrl);
        countriesData = await response.json();

        populateLanguageDropdown(countriesData); // Populate language dropdown based on country data
        fetchCountries(); // Initial display of countries
    };

    // Populate the language filter dropdown with unique languages from the fetched data
    const populateLanguageDropdown = (data) => {
        const languageSet = new Set();
        data.forEach(country => {
            // If languages are defined for a country, add each to the languageSet
            if (country.languages) {
                Object.values(country.languages).forEach(lang => languageSet.add(lang));
            }
        });
        // Sort languages alphabetically and create an option element for each
        const sortedLanguages = [...languageSet].sort();
        sortedLanguages.forEach(language => {
            const option = document.createElement("option");
            option.value = language;
            option.textContent = language;
            languageFilter.appendChild(option);
        });
    };

    // Filter and display countries based on search, region, and language
    const fetchCountries = (query = "", page = 1, region = "", language = "") => {
        // Filter the countries based on search input, selected region, and language
        const filteredData = countriesData.filter(country => {
            const matchesQuery = country.name.common.toLowerCase().includes(query.toLowerCase());
            const matchesRegion = region ? country.region === region : true;
            const matchesLanguage = language ? Object.values(country.languages || {}).includes(language) : true;
            return matchesQuery && matchesRegion && matchesLanguage;
        });

        // Display the filtered data in paginated format
        renderCountryCards(filteredData.slice((page - 1) * 10, page * 10));
    };

    // Render country cards to display each country's details
    const renderCountryCards = countries => {
        countryList.innerHTML = ""; // Clear current list before rendering new data
        countries.forEach(country => {
            const card = document.createElement("div");
            card.className = "country-card";
            // Display the country name, flag, and favorite button
            card.innerHTML = `
                <h2>${country.name.common}</h2>
                <img src="${country.flags.svg}" alt="Flag of ${country.name.common}" />
                <button class="favorite-btn" data-country="${country.name.common}">${favorites.includes(country.name.common) ? 'Remove from Favorites' : 'Add to Favorites'}</button>
            `;
            // Navigate to country details page on card click
            card.addEventListener("click", () => {
                window.location.href = `country.html?name=${encodeURIComponent(country.name.common)}`;
            });
            countryList.appendChild(card);
        });

        // Attach event listeners to favorite buttons on each card
        document.querySelectorAll('.favorite-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent card click from triggering
                const countryName = button.dataset.country;
                toggleFavorite(countryName); // Toggle favorite status
            });
        });
    };

    // Toggle a country's favorite status and update the display
    const toggleFavorite = (countryName) => {
        if (favorites.includes(countryName)) {
            // Remove country from favorites if it's already in the list
            favorites = favorites.filter(fav => fav !== countryName);
            alert(`${countryName} removed from favorites.`);
        } else {
            // Add country to favorites if the list has fewer than 5 items
            if (favorites.length < 5) {
                favorites.push(countryName);
                alert(`${countryName} added to favorites.`);
            } else {
                // Alert user if they try to add more than 5 favorites
                alert("You can only have up to 5 favorites. Please remove one before adding a new one.");
                return; // Stop execution if limit is reached
            }
        }
        localStorage.setItem("favorites", JSON.stringify(favorites)); // Save favorites to localStorage
        updateFavorites(); // Update the favorites display
        fetchCountries(searchInput.value, currentPage, regionFilter.value, languageFilter.value); // Refresh country list
    
        
    };

    // Update the favorites section display based on the favorites list
    const updateFavorites = () => {
        favoritesList.innerHTML = ""; // Clear the current list
        favorites.forEach(countryName => {
            const li = document.createElement("li");
            li.textContent = countryName;
            // Add remove button to each favorite
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent list item click event
                removeFromFavorites(countryName); // Remove favorite
            });
            li.appendChild(removeBtn);
            favoritesList.appendChild(li);
        });
        // Hide the favorites section if there are no favorites
        favoritesSection.classList.toggle("hidden", favorites.length === 0);
        localStorage.setItem("favorites", JSON.stringify(favorites)); // Save updated favorites
    };

    // Remove a country from the favorites list
    const removeFromFavorites = (countryName) => {
        favorites = favorites.filter(fav => fav !== countryName); // Remove from list
        alert(`${countryName} removed from favorites.`);
        updateFavorites(); // Update display
    };

    // Event listener for search input to filter countries on user input
    searchInput.addEventListener("input", () => {
        currentPage = 1; // Reset to first page for new search
        fetchCountries(searchInput.value, currentPage, regionFilter.value, languageFilter.value);
    });

    // Event listener for region filter to update displayed countries
    regionFilter.addEventListener("change", () => {
        currentPage = 1; // Reset to first page for new filter
        fetchCountries(searchInput.value, currentPage, regionFilter.value, languageFilter.value);
    });

    // Event listener for language filter to update displayed countries
    languageFilter.addEventListener("change", () => {
        currentPage = 1; // Reset to first page for new filter
        fetchCountries(searchInput.value, currentPage, regionFilter.value, languageFilter.value);
    });

    // Load more countries when 'Show More' button is clicked
    showMoreBtn.addEventListener("click", () => {
        currentPage += 1;
        fetchCountries(searchInput.value, currentPage, regionFilter.value, languageFilter.value);
    });

    updateFavorites(); // Initial load of favorites
    initializeApp(); // Fetch countries and initialize app on load
});
