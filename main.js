// Database storage (using localStorage for persistence)
let feedbackDatabase = JSON.parse(localStorage.getItem('feedbackDB')) || [];
let recipeDatabase = JSON.parse(localStorage.getItem('recipeDB')) || [];
let currentRecipe = null;

// Recipe database with detailed recipes for popular dishes
const recipeTemplates = {
    "butter chicken": {
        name: "Butter Chicken",
        ingredients: [
            "🍗 Chicken - 500g (boneless, cut into pieces)",
            "🧂 Salt - to taste",
            "🌶️ Red chili powder - 1 tsp",
            "🧄 Garlic paste - 1 tbsp",
            "🧅 Ginger paste - 1 tbsp",
            "🍅 Tomato puree - 2 cups",
            "🧈 Butter - 4 tbsp",
            "🥛 Fresh cream - 1/2 cup",
            "🥄 Garam masala - 1 tsp",
            "🌿 Kasuri methi - 1 tsp",
            "🥄 Cooking oil - 2 tbsp",
            "🍯 Honey - 1 tsp (optional)"
        ],
        instructions: [
            "Marinate chicken with salt, red chili powder, ginger-garlic paste for 30 minutes",
            "Heat oil in a pan and cook marinated chicken until golden brown",
            "In another pan, melt 2 tbsp butter and add tomato puree",
            "Add garam masala, kasuri methi, and salt to the tomato mixture",
            "Let it simmer for 10 minutes until the gravy thickens",
            "Add the cooked chicken pieces to the gravy",
            "Add fresh cream and remaining butter",
            "Mix well and cook for 5 more minutes",
            "Garnish with cream and serve hot with naan or rice"
        ],
        tips: [
            "Don't overcook the chicken - it should be tender and juicy",
            "Use fresh cream for the best flavor",
            "Kasuri methi gives it the authentic restaurant taste",
            "Add a pinch of sugar if the tomatoes are too tangy"
        ]
    },
    "egg masala": {
        name: "Egg Masala",
        ingredients: [
            "🥚 Eggs - 4 (boiled and peeled)",
            "🧅 Onions - 2 large (finely chopped)",
            "🍅 Tomatoes - 3 medium (chopped)",
            "🧄 Garlic - 6 cloves (minced)",
            "🌶️ Green chilies - 2 (chopped)",
            "🥄 Oil - 3 tbsp",
            "🧂 Salt - to taste",
            "🌶️ Red chili powder - 1 tsp",
            "🥄 Turmeric powder - 1/2 tsp",
            "🥄 Coriander powder - 1 tsp",
            "🥄 Garam masala - 1/2 tsp",
            "🌿 Fresh coriander - for garnish"
        ],
        instructions: [
            "Cut boiled eggs in half and set aside",
            "Heat oil in a pan and add chopped onions",
            "Sauté until golden brown, then add garlic and green chilies",
            "Add chopped tomatoes and cook until they become soft",
            "Add all the spices (turmeric, chili powder, coriander powder, salt)",
            "Cook the masala until oil separates from the sides",
            "Add 1 cup of water and bring to a boil",
            "Gently add the egg halves to the gravy",
            "Sprinkle garam masala and simmer for 5 minutes",
            "Garnish with fresh coriander and serve hot"
        ],
        tips: [
            "Don't overcook eggs - 10 minutes of boiling is perfect",
            "Make small cuts on the eggs so they absorb the flavors",
            "Cook the onion-tomato base well for rich flavor",
            "Adjust spice levels according to your taste"
        ]
    },
    "pasta": {
        name: "Classic Italian Pasta",
        ingredients: [
            "🍝 Pasta - 300g (penne or spaghetti)",
            "🍅 Tomatoes - 4 large (chopped)",
            "🧄 Garlic - 5 cloves (minced)",
            "🧅 Onion - 1 medium (chopped)",
            "🫒 Olive oil - 3 tbsp",
            "🌿 Fresh basil - 10-12 leaves",
            "🧂 Salt - to taste",
            "🌶️ Black pepper - 1/2 tsp",
            "🧀 Parmesan cheese - for topping",
            "🌶️ Red chili flakes - 1/2 tsp (optional)"
        ],
        instructions: [
            "Boil pasta in salted water until al dente (8-10 minutes)",
            "Drain and set aside, reserve 1 cup of pasta water",
            "Heat olive oil in a large pan",
            "Add garlic and onion, sauté until fragrant",
            "Add chopped tomatoes and cook until they break down",
            "Season with salt, pepper, and chili flakes",
            "Add cooked pasta to the sauce",
            "Toss well, adding pasta water if needed for consistency",
            "Add fresh basil leaves and mix",
            "Serve hot with grated parmesan cheese on top"
        ],
        tips: [
            "Don't overcook pasta - it should be firm to bite",
            "Save some pasta water - it helps bind the sauce",
            "Fresh basil adds amazing flavor - don't skip it",
            "Toss pasta in the sauce, don't just pour sauce on top"
        ]
    },
    "biryani": {
        name: "Chicken Biryani",
        ingredients: [
            "🍗 Chicken - 500g (cut into pieces)",
            "🍚 Basmati rice - 2 cups",
            "🧅 Onions - 3 large (sliced)",
            "🍅 Tomatoes - 2 medium (chopped)",
            "🥛 Yogurt - 1 cup",
            "🧄 Ginger-garlic paste - 2 tbsp",
            "🌶️ Green chilies - 4 (slit)",
            "🌿 Mint leaves - 1/2 cup",
            "🌿 Coriander leaves - 1/2 cup",
            "🥄 Biryani masala - 2 tbsp",
            "🧂 Salt - to taste",
            "🥄 Ghee - 4 tbsp",
            "💛 Saffron - a pinch (soaked in milk)",
            "🥄 Bay leaves - 2",
            "🌰 Whole spices - (cinnamon, cardamom, cloves)"
        ],
        instructions: [
            "Marinate chicken with yogurt, ginger-garlic paste, biryani masala, and salt for 1 hour",
            "Boil rice with whole spices until 70% cooked, drain and set aside",
            "Heat ghee in a heavy-bottomed pot and fry onions until golden brown",
            "Remove half the onions and set aside for garnish",
            "Add marinated chicken and cook until half done",
            "Add tomatoes, mint, and coriander leaves",
            "Layer the partially cooked rice over the chicken",
            "Top with fried onions and saffron milk",
            "Cover with a tight lid and cook on low heat (dum) for 20-25 minutes",
            "Gently mix and serve hot with raita"
        ],
        tips: [
            "Don't fully cook the rice initially - it will cook more during dum",
            "Keep the flame very low during dum cooking",
            "Use good quality basmati rice for best results",
            "The key is in the layering and slow cooking"
        ]
    },
    "pizza": {
        name: "Margherita Pizza",
        ingredients: [
            "🍞 Pizza dough - 1 ball (or pre-made base)",
            "🍅 Tomato sauce - 1 cup",
            "🧀 Mozzarella cheese - 200g (shredded)",
            "🍅 Fresh tomatoes - 2 (sliced)",
            "🌿 Fresh basil - 10-12 leaves",
            "🧄 Garlic - 2 cloves (minced)",
            "🫒 Olive oil - 2 tbsp",
            "🧂 Salt - to taste",
            "🌶️ Black pepper - 1/2 tsp",
            "🥄 Dried oregano - 1 tsp"
        ],
        instructions: [
            "Preheat oven to 220°C (425°F)",
            "Roll out pizza dough into a circle on a floured surface",
            "Spread tomato sauce evenly, leaving 1 inch border",
            "Sprinkle minced garlic over the sauce",
            "Add shredded mozzarella cheese generously",
            "Arrange fresh tomato slices on top",
            "Drizzle with olive oil and season with salt and pepper",
            "Bake for 12-15 minutes until crust is golden and cheese is bubbly",
            "Remove from oven and immediately add fresh basil leaves",
            "Sprinkle oregano and serve hot"
        ],
        tips: [
            "Use fresh mozzarella for authentic taste",
            "Don't overload with toppings - less is more for Margherita",
            "Add basil after baking to keep it fresh",
            "A pizza stone gives the best crispy crust"
        ]
    }
};

// Enhanced recipe generator with smart matching
function generateSmartRecipe(dishName) {
    const lowerDish = dishName.toLowerCase().trim();
    
    // Check for exact matches or partial matches
    for (let key in recipeTemplates) {
        if (lowerDish.includes(key) || key.includes(lowerDish)) {
            return recipeTemplates[key];
        }
    }
    
    // Generate generic recipe for unknown dishes
    return {
        name: dishName.charAt(0).toUpperCase() + dishName.slice(1),
        ingredients: [
            "🧂 Salt - to taste",
            "🌶️ Red chili powder - 1 tsp",
            "🧄 Garlic - 4-5 cloves (minced)",
            "🧅 Onion - 2 medium (chopped)",
            "🍅 Tomato - 3 medium (chopped)",
            "🥄 Cooking oil - 3 tbsp",
            "🌿 Fresh coriander - for garnish",
            "🌶️ Green chilies - 2 (optional)",
            "🥄 Garam masala - 1 tsp",
            "🥄 Turmeric powder - 1/2 tsp"
        ],
        instructions: [
            "Heat oil in a pan over medium heat",
            "Add chopped onions and sauté until golden brown",
            "Add minced garlic and green chilies, cook for 1 minute",
            "Add chopped tomatoes and cook until soft and mushy",
            "Add all the spice powders and salt, mix well",
            "Add your main ingredients and mix thoroughly",
            "Add water as needed and cook covered for 15-20 minutes",
            "Simmer until the desired consistency is reached",
            "Garnish with fresh coriander and serve hot"
        ],
        tips: [
            "Cook on low heat for better flavor development",
            "Fresh ingredients always give the best taste",
            "Adjust spices according to your preference",
            "Don't add too much water - it can make the dish watery",
            "Let it simmer - patience is key to great cooking!"
        ]
    };
}

// Search button event
document.getElementById('searchBtn').addEventListener('click', () => {
    const query = document.getElementById('recipeSearch').value.trim();
    if (query) {
        searchRecipe(query);
    } else {
        alert('Please enter a dish name!');
    }
});

// Enter key support
document.getElementById('recipeSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});

// Search recipe
async function searchRecipe(dishName) {
    // Hide recipe and feedback sections
    document.getElementById('recipeSection').classList.add('hidden');
    document.getElementById('feedbackSection').classList.add('hidden');
    
    // Show loading animation
    document.getElementById('loadingAnimation').classList.remove('hidden');
    
    // Simulate loading time
    setTimeout(() => {
        // Generate recipe
        const recipe = generateSmartRecipe(dishName);
        currentRecipe = recipe;
        displayRecipe(recipe, dishName);
        
        // Save to recipe database
        recipeDatabase.push({
            id: recipeDatabase.length + 1,
            name: dishName,
            recipe: recipe,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('recipeDB', JSON.stringify(recipeDatabase));
        
        // Hide loading and show recipe
        document.getElementById('loadingAnimation').classList.add('hidden');
        document.getElementById('recipeSection').classList.remove('hidden');
        document.getElementById('feedbackSection').classList.remove('hidden');
        
        // Scroll to recipe
        document.getElementById('recipeSection').scrollIntoView({ behavior: 'smooth' });
    }, 3000);
}

// Display recipe
function displayRecipe(recipe, dishName) {
    document.getElementById('recipeName').textContent = recipe.name || dishName;
    
    // Display ingredients
    const ingredientsList = document.getElementById('ingredientsList');
    ingredientsList.innerHTML = '';
    recipe.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;
        ingredientsList.appendChild(li);
    });
    
    // Display instructions
    const instructionsList = document.getElementById('instructionsList');
    instructionsList.innerHTML = '';
    recipe.instructions.forEach((instruction, index) => {
        const li = document.createElement('li');
        li.textContent = instruction;
        instructionsList.appendChild(li);
    });
    
    // Display tips
    const tipsList = document.getElementById('tipsList');
    tipsList.innerHTML = '';
    recipe.tips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        tipsList.appendChild(li);
    });
}

// AI-like responses for feedback
function generateAIResponse(feedback, recipeName) {
    const lowerFeedback = feedback.toLowerCase();
    
    if (lowerFeedback.includes('delicious') || lowerFeedback.includes('great') || lowerFeedback.includes('amazing') || lowerFeedback.includes('perfect')) {
        return `That's wonderful to hear! I'm so glad the ${recipeName} turned out delicious for you. Your cooking skills are improving! 🌟👨‍🍳`;
    } else if (lowerFeedback.includes('good') || lowerFeedback.includes('nice') || lowerFeedback.includes('tasty')) {
        return `Great job! I'm happy the ${recipeName} came out well. Keep experimenting with flavors and you'll become a master chef! 😊`;
    } else if (lowerFeedback.includes('okay') || lowerFeedback.includes('average')) {
        return `Thanks for trying! Next time, try adjusting the spices to your taste. Practice makes perfect with ${recipeName}! 💪`;
    } else if (lowerFeedback.includes('spicy') || lowerFeedback.includes('hot')) {
        return `I understand! Next time, reduce the chili powder by half for ${recipeName}. You can always add more later. Thanks for the feedback! 🌶️`;
    } else if (lowerFeedback.includes('bland') || lowerFeedback.includes('tasteless')) {
        return `Oh no! Try adding more spices and salt next time. Taste as you cook and adjust seasonings for better flavor in your ${recipeName}. 🧂`;
    } else if (lowerFeedback.includes('burnt') || lowerFeedback.includes('overcooked')) {
        return `Don't worry, it happens! Cook on medium-low heat and keep stirring. You'll nail the ${recipeName} next time! 🔥`;
    } else if (lowerFeedback.includes('undercooked') || lowerFeedback.includes('raw')) {
        return `Thanks for sharing! Make sure to cook for the full recommended time. Use a timer for perfect ${recipeName} every time! ⏰`;
    } else {
        return `Thank you for trying the ${recipeName} recipe! Your feedback helps improve the cooking experience. Keep cooking and experimenting! 🍳✨`;
    }
}

// Send feedback
document.getElementById('sendFeedback').addEventListener('click', async () => {
    const feedback = document.getElementById('userFeedback').value.trim();
    if (!feedback) return;
    
    // Display user message
    const chatMessages = document.getElementById('chatMessages');
    const userMsg = document.createElement('div');
    userMsg.className = 'user-message';
    userMsg.innerHTML = `<p>${feedback}</p>`;
    chatMessages.appendChild(userMsg);
    
    // Clear input
    document.getElementById('userFeedback').value = '';
    
    // Generate AI response
    setTimeout(() => {
        const aiResponse = generateAIResponse(feedback, currentRecipe?.name || 'recipe');
        
        // Display AI response
        const aiMsg = document.createElement('div');
        aiMsg.className = 'ai-message';
        aiMsg.innerHTML = `<p>${aiResponse}</p>`;
        chatMessages.appendChild(aiMsg);
        
        // Save to database
        feedbackDatabase.push({
            id: feedbackDatabase.length + 1,
            recipe: currentRecipe?.name || 'Unknown',
            userFeedback: feedback,
            aiResponse: aiResponse,
            timestamp: new Date().toLocaleString()
        });
        localStorage.setItem('feedbackDB', JSON.stringify(feedbackDatabase));
        
        // Update stats
        updateDatabaseStats();
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
});

// Database toggle
document.getElementById('toggleDatabase').addEventListener('click', () => {
    document.getElementById('databaseViewer').classList.remove('hidden');
    loadDatabase();
});

document.getElementById('closeDatabase').addEventListener('click', () => {
    document.getElementById('databaseViewer').classList.add('hidden');
});

// Load and display database
function loadDatabase() {
    const tbody = document.getElementById('databaseBody');
    tbody.innerHTML = '';
    
    if (feedbackDatabase.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" style="text-align: center; padding: 30px;">
                No feedback yet! Try searching for a recipe and share your cooking experience.
            </td>
        `;
        tbody.appendChild(row);
    } else {
        feedbackDatabase.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.id}</td>
                <td>${entry.recipe}</td>
                <td>${entry.userFeedback}</td>
                <td>${entry.aiResponse}</td>
                <td>${entry.timestamp}</td>
            `;
            tbody.appendChild(row);
        });
    }
    
    updateDatabaseStats();
}

// Update database stats
function updateDatabaseStats() {
    document.getElementById('totalFeedback').textContent = feedbackDatabase.length;
    document.getElementById('totalRecipes').textContent = recipeDatabase.length;
}

// Initialize stats on load
updateDatabaseStats();

// Check for dish selection from dishes page
window.addEventListener('DOMContentLoaded', () => {
    const selectedDish = sessionStorage.getItem('selectedDish');
    if (selectedDish) {
        document.getElementById('recipeSearch').value = selectedDish;
        sessionStorage.removeItem('selectedDish');
        // Trigger search after a short delay
        setTimeout(() => {
            document.getElementById('searchBtn').click();
        }, 500);
    }
});
