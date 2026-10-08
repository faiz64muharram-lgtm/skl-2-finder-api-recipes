console.log("hello guys");

const API_URL = "https://dummyjson.com/recipes";

const favoriteButton = document.getElementById("favorite-button");
const favoriteCount = document.getElementById("favorite-count");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const cuisineFilter = document.getElementById("cuisine-filter");
const difficultyFilter = document.getElementById("difficulty-filter");
const sectionTitle = document.getElementById("section-title");
const recipeCount = document.getElementById("recipe-count");
const resetFilterButton = document.getElementById("reset-filter-button");

const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const emptyState = document.getElementById("empty-state");
const recipeGrid = document.getElementById("recipe-grid");

const recipeDialog = document.getElementById("recipe-dialog");
const closeDialog = document.getElementById("close-dialog");
const dialogContent = document.getElementById("dialog-content");

let recipes = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

fetchRecipes();

async function fetchRecipes() {
    try {
        loadingState.hidden = false;
        errorState.hidden = true;
        recipeGrid.hidden = true;

        const response = await fetch(API_URL);
        const data = await response.json();

        recipes = data.recipes;

        showCuisine();
        displayRecipes(recipes);
        updateFavoriteCount();

        loadingState.hidden = true;
        recipeGrid.hidden = false;

    } catch (error) {
        console.log(error);

        loadingState.hidden = true;
        errorState.hidden = false;
    }
}

function displayRecipes(data) {
    recipeGrid.innerHTML = "";

    recipeCount.textContent = `${data.length} recipes`;

    if (data.length === 0) {
        emptyState.hidden = false;
        recipeGrid.hidden = true;
        return;
    }

    emptyState.hidden = true;
    recipeGrid.hidden = false;

    data.forEach(function(recipe) {
        const isFavorite = favorites.includes(recipe.id);

        recipeGrid.innerHTML += `
            <article class="recipe-card">
                <img class="recipe-image" src="${recipe.image}" alt="${recipe.name}">

                <div class="recipe-body">
                    <span class="recipe-cuisine">${recipe.cuisine}</span>

                    <h3 class="recipe-title">${recipe.name}</h3>

                    <div class="recipe-meta">
                        <span>⭐ ${recipe.rating}</span>
                        <span>⏱️ ${recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</span>
                        <span>📊 ${recipe.difficulty}</span>
                    </div>

                    <div class="recipe-actions">
                        <button class="detail-button" onclick="showDetail(${recipe.id})">
                            View Detail
                        </button>

                        <button class="like-button" onclick="toggleFavorite(${recipe.id})">
                            ${isFavorite ? "❤️" : "🤍"}
                        </button>
                    </div>
                </div>
            </article>
        `;
    });
}

function showCuisine() {
    const cuisines = [];

    recipes.forEach(function(recipe) {
        if (!cuisines.includes(recipe.cuisine)) {
            cuisines.push(recipe.cuisine);
        }
    });

    cuisines.sort();

    cuisines.forEach(function(cuisine) {
        cuisineFilter.innerHTML += `
            <option value="${cuisine}">${cuisine}</option>
        `;
    });
}

searchForm.addEventListener("submit", function(event) {
    event.preventDefault();

    filterRecipes();
});

cuisineFilter.addEventListener("change", function() {
    filterRecipes();
});

difficultyFilter.addEventListener("change", function() {
    filterRecipes();
});

function filterRecipes() {
    const keyword = searchInput.value.toLowerCase();
    const cuisine = cuisineFilter.value;
    const difficulty = difficultyFilter.value;

    const filteredRecipes = recipes.filter(function(recipe) {
        const matchName = recipe.name.toLowerCase().includes(keyword);
        const matchCuisine = cuisine === "" || recipe.cuisine === cuisine;
        const matchDifficulty = difficulty === "" || recipe.difficulty === difficulty;

        return matchName && matchCuisine && matchDifficulty;
    });

    displayRecipes(filteredRecipes);

    sectionTitle.textContent = keyword || cuisine || difficulty
        ? "Search Results"
        : "Explore Recipes";

    resetFilterButton.hidden = !(keyword || cuisine || difficulty);
}

resetFilterButton.addEventListener("click", function() {
    searchInput.value = "";
    cuisineFilter.value = "";
    difficultyFilter.value = "";

    displayRecipes(recipes);

    sectionTitle.textContent = "Explore Recipes";

    resetFilterButton.hidden = true;
});

function showDetail(id) {
    const recipe = recipes.find(function(recipe) {
        return recipe.id === id;
    });

    if (!recipe) {
        return;
    }

    dialogContent.innerHTML = `
        <img class="dialog-image" src="${recipe.image}" alt="${recipe.name}">

        <div class="dialog-body">
            <h2>${recipe.name}</h2>

            <div class="dialog-meta">
                <span>🍴 ${recipe.cuisine}</span>
                <span>📊 ${recipe.difficulty}</span>
                <span>⭐ ${recipe.rating}</span>
                <span>👨‍🍳 ${recipe.servings} servings</span>
                <span>🔥 ${recipe.caloriesPerServing} calories</span>
            </div>

            <h3>Ingredients</h3>

            <ul class="ingredients">
                ${recipe.ingredients.map(function(ingredient) {
                    return `<li>${ingredient}</li>`;
                }).join("")}
            </ul>

            <h3>Instructions</h3>

            <div class="instructions">
                ${recipe.instructions.map(function(instruction, index) {
                    return `<p>${index + 1}. ${instruction}</p>`;
                }).join("")}
            </div>
        </div>
    `;

    recipeDialog.showModal();
}

closeDialog.addEventListener("click", function() {
    recipeDialog.close();
});

function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(function(favoriteId) {
            return favoriteId !== id;
        });
    } else {
        favorites.push(id);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));

    updateFavoriteCount();

    filterRecipes();
}

function updateFavoriteCount() {
    favoriteCount.textContent = favorites.length;
}

favoriteButton.addEventListener("click", function() {
    const favoriteRecipes = recipes.filter(function(recipe) {
        return favorites.includes(recipe.id);
    });

    displayRecipes(favoriteRecipes);

    sectionTitle.textContent = "My Favorites";

    resetFilterButton.hidden = false;
});