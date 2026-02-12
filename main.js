// ═══════════════════════════════════════════════════════════════
//          CHIEF AI - SAMBANOVA API INTEGRATION
//          Production-Ready Dynamic Recipe Generation
//          Created by Fusion - Swaraj Nerlekar & Claude AI
// ═══════════════════════════════════════════════════════════════

// Database storage
let feedbackDatabase = JSON.parse(localStorage.getItem('feedbackDB')) || [];
let recipeDatabase = JSON.parse(localStorage.getItem('recipeDB')) || [];
let currentRecipe = null;

// ═══════════════════════════════════════════════════════════════
//          SAMBANOVA API CONFIGURATION
// ═══════════════════════════════════════════════════════════════
// Add your SambaNova API key here:

const SAMBANOVA_API_KEY = 'd434cf1b-8843-4dc7-a50d-c127fadfafe7'; // 👈 Replace with your actual key
const SAMBANOVA_API_URL = 'https://api.sambanova.ai/v1/chat/completions';

// ⚠️ SECURITY NOTE:
// For production, move this to a backend/serverless function
// See SECURITY_GUIDE.txt for proper implementation

// ═══════════════════════════════════════════════════════════════
//          SEARCH FUNCTIONALITY
// ═══════════════════════════════════════════════════════════════

document.getElementById('searchBtn').addEventListener('click', () => {
    const query = document.getElementById('recipeSearch').value.trim();
    if (query) {
        searchRecipe(query);
    } else {
        alert('Please enter a dish name!');
    }
});

document.getElementById('recipeSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});

// ═══════════════════════════════════════════════════════════════
//          MAIN SEARCH FUNCTION
// ═══════════════════════════════════════════════════════════════

async function searchRecipe(dishName) {
    // Hide sections
    document.getElementById('recipeSection').classList.add('hidden');
    document.getElementById('feedbackSection').classList.add('hidden');
    
    // Show loading
    document.getElementById('loadingAnimation').classList.remove('hidden');
    
    try {
        // Check cache first
        const cachedRecipe = getCachedRecipe(dishName);
        if (cachedRecipe) {
            console.log('✅ Using cached recipe');
            setTimeout(() => {
                currentRecipe = cachedRecipe;
                displayRecipe(cachedRecipe, dishName);
                showRecipeSections();
            }, 1500);
            return;
        }

        // Generate recipe using SambaNova AI
        console.log('🤖 Generating recipe with SambaNova AI...');
        const recipe = await generateRecipeWithSambaNova(dishName);
        
        if (recipe) {
            currentRecipe = recipe;
            displayRecipe(recipe, dishName);
            
            // Save to database
            saveRecipeToDatabase(dishName, recipe);
            
            showRecipeSections();
        } else {
            throw new Error('Failed to generate recipe');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Sorry, there was an error generating the recipe. Please try again!');
        document.getElementById('loadingAnimation').classList.add('hidden');
    }
}

// ═══════════════════════════════════════════════════════════════
//          SAMBANOVA AI INTEGRATION
// ═══════════════════════════════════════════════════════════════

async function generateRecipeWithSambaNova(dishName) {
    // Check if API key is configured
    if (SAMBANOVA_API_KEY === 'YOUR_SAMBANOVA_API_KEY') {
        console.error('❌ SambaNova API key not configured!');
        alert('Please add your SambaNova API key in main.js (line 17)');
        return null;
    }

    try {
        const prompt = createRecipePrompt(dishName);
        
        const response = await fetch(SAMBANOVA_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SAMBANOVA_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'Meta-Llama-3.1-8B-Instruct', // SambaNova's model
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional chef and cooking expert. You provide detailed, authentic recipes with proper measurements and clear instructions.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('✅ SambaNova Response received');
        
        // Extract recipe from response
        const recipeText = data.choices[0].message.content;
        const recipe = parseRecipeFromAI(recipeText, dishName);
        
        return recipe;
        
    } catch (error) {
        console.error('❌ SambaNova API Error:', error);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════
//          PROMPT ENGINEERING
// ═══════════════════════════════════════════════════════════════

function createRecipePrompt(dishName) {
    return `Please provide a detailed recipe for "${dishName}". 

Format your response EXACTLY like this (use this exact structure):

RECIPE NAME:
[Name of the dish]

INGREDIENTS:
- [Ingredient 1 with quantity]
- [Ingredient 2 with quantity]
- [etc.]

INSTRUCTIONS:
1. [Step 1]
2. [Step 2]
3. [etc.]

TIPS:
- [Tip 1]
- [Tip 2]
- [etc.]

Requirements:
- Use proper measurements (cups, tbsp, tsp, grams, etc.)
- Include ALL necessary ingredients
- Provide clear, step-by-step instructions
- Add helpful cooking tips
- Be specific and detailed
- Make it authentic and delicious!`;
}

// ═══════════════════════════════════════════════════════════════
//          PARSE AI RESPONSE
// ═══════════════════════════════════════════════════════════════

function parseRecipeFromAI(text, dishName) {
    const recipe = {
        name: dishName,
        ingredients: [],
        instructions: [],
        tips: []
    };

    try {
        // Extract recipe name
        const nameMatch = text.match(/RECIPE NAME:\s*\n(.+)/i);
        if (nameMatch) {
            recipe.name = nameMatch[1].trim();
        }

        // Extract ingredients
        const ingredientsMatch = text.match(/INGREDIENTS:\s*\n([\s\S]*?)(?=\n\nINSTRUCTIONS:|INSTRUCTIONS:)/i);
        if (ingredientsMatch) {
            const ingredientsText = ingredientsMatch[1];
            recipe.ingredients = ingredientsText
                .split('\n')
                .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
                .map(line => {
                    const cleaned = line.replace(/^[-\d.]\s*/, '').trim();
                    const emoji = getIngredientEmoji(cleaned);
                    return `${emoji} ${cleaned}`;
                });
        }

        // Extract instructions
        const instructionsMatch = text.match(/INSTRUCTIONS:\s*\n([\s\S]*?)(?=\n\nTIPS:|TIPS:)/i);
        if (instructionsMatch) {
            const instructionsText = instructionsMatch[1];
            recipe.instructions = instructionsText
                .split('\n')
                .filter(line => line.trim().match(/^\d+\./))
                .map(line => line.replace(/^\d+\.\s*/, '').trim());
        }

        // Extract tips
        const tipsMatch = text.match(/TIPS:\s*\n([\s\S]*?)$/i);
        if (tipsMatch) {
            const tipsText = tipsMatch[1];
            recipe.tips = tipsText
                .split('\n')
                .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
                .map(line => line.replace(/^[-\d.]\s*/, '').trim());
        }

        // Validate recipe
        if (recipe.ingredients.length === 0) {
            throw new Error('No ingredients found');
        }
        if (recipe.instructions.length === 0) {
            throw new Error('No instructions found');
        }

        console.log('✅ Recipe parsed successfully:', recipe);
        return recipe;

    } catch (error) {
        console.error('❌ Error parsing recipe:', error);
        // Return a basic valid recipe structure
        return {
            name: dishName,
            ingredients: ['🥄 See full recipe in AI response'],
            instructions: text.split('\n').filter(l => l.trim()),
            tips: ['Please try searching again for better results']
        };
    }
}

// ═══════════════════════════════════════════════════════════════
//          HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function getIngredientEmoji(ingredient) {
    const ing = ingredient.toLowerCase();
    
    // Proteins
    if (ing.includes('chicken')) return '🍗';
    if (ing.includes('egg')) return '🥚';
    if (ing.includes('fish')) return '🐟';
    if (ing.includes('shrimp') || ing.includes('prawn')) return '🦐';
    if (ing.includes('meat') || ing.includes('beef')) return '🥩';
    if (ing.includes('pork')) return '🥓';
    
    // Vegetables
    if (ing.includes('tomato')) return '🍅';
    if (ing.includes('onion')) return '🧅';
    if (ing.includes('garlic')) return '🧄';
    if (ing.includes('potato')) return '🥔';
    if (ing.includes('carrot')) return '🥕';
    if (ing.includes('broccoli')) return '🥦';
    if (ing.includes('pepper') || ing.includes('bell pepper')) return '🫑';
    if (ing.includes('chili') || ing.includes('chilli')) return '🌶️';
    
    // Grains & Pasta
    if (ing.includes('rice')) return '🍚';
    if (ing.includes('pasta') || ing.includes('noodle') || ing.includes('spaghetti')) return '🍝';
    if (ing.includes('bread')) return '🍞';
    
    // Dairy
    if (ing.includes('milk') || ing.includes('cream')) return '🥛';
    if (ing.includes('cheese')) return '🧀';
    if (ing.includes('butter') || ing.includes('ghee')) return '🧈';
    if (ing.includes('yogurt') || ing.includes('curd')) return '🥛';
    
    // Seasonings
    if (ing.includes('salt')) return '🧂';
    if (ing.includes('sugar') || ing.includes('honey')) return '🍯';
    
    // Oils & Fats
    if (ing.includes('oil') || ing.includes('olive')) return '🫒';
    
    // Herbs & Spices
    if (ing.includes('basil') || ing.includes('herb') || ing.includes('coriander') || ing.includes('parsley')) return '🌿';
    if (ing.includes('lemon') || ing.includes('lime')) return '🍋';
    
    // Nuts & Seeds
    if (ing.includes('nut') || ing.includes('almond') || ing.includes('cashew')) return '🌰';
    
    // Default
    return '🥄';
}

function getCachedRecipe(dishName) {
    const cached = recipeDatabase.find(r => 
        r.name.toLowerCase().trim() === dishName.toLowerCase().trim()
    );
    return cached ? cached.recipe : null;
}

function saveRecipeToDatabase(dishName, recipe) {
    recipeDatabase.push({
        id: recipeDatabase.length + 1,
        name: dishName,
        recipe: recipe,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('recipeDB', JSON.stringify(recipeDatabase));
    console.log('💾 Recipe saved to database');
}

function showRecipeSections() {
    setTimeout(() => {
        document.getElementById('loadingAnimation').classList.add('hidden');
        document.getElementById('recipeSection').classList.remove('hidden');
        document.getElementById('feedbackSection').classList.remove('hidden');
        document.getElementById('recipeSection').scrollIntoView({ behavior: 'smooth' });
    }, 2000);
}

// ═══════════════════════════════════════════════════════════════
//          DISPLAY RECIPE
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
//          FEEDBACK SYSTEM
// ═══════════════════════════════════════════════════════════════

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

document.getElementById('sendFeedback').addEventListener('click', async () => {
    const feedback = document.getElementById('userFeedback').value.trim();
    if (!feedback) return;
    
    const chatMessages = document.getElementById('chatMessages');
    const userMsg = document.createElement('div');
    userMsg.className = 'user-message';
    userMsg.innerHTML = `<p>${feedback}</p>`;
    chatMessages.appendChild(userMsg);
    
    document.getElementById('userFeedback').value = '';
    
    setTimeout(() => {
        const aiResponse = generateAIResponse(feedback, currentRecipe?.name || 'recipe');
        
        const aiMsg = document.createElement('div');
        aiMsg.className = 'ai-message';
        aiMsg.innerHTML = `<p>${aiResponse}</p>`;
        chatMessages.appendChild(aiMsg);
        
        feedbackDatabase.push({
            id: feedbackDatabase.length + 1,
            recipe: currentRecipe?.name || 'Unknown',
            userFeedback: feedback,
            aiResponse: aiResponse,
            timestamp: new Date().toLocaleString()
        });
        localStorage.setItem('feedbackDB', JSON.stringify(feedbackDatabase));
        
        updateDatabaseStats();
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
});

// ═══════════════════════════════════════════════════════════════
//          DATABASE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

document.getElementById('toggleDatabase').addEventListener('click', () => {
    document.getElementById('databaseViewer').classList.remove('hidden');
    loadDatabase();
});

document.getElementById('closeDatabase').addEventListener('click', () => {
    document.getElementById('databaseViewer').classList.add('hidden');
});

function loadDatabase() {
    const tbody = document.getElementById('databaseBody');
    tbody.innerHTML = '';
    
    if (feedbackDatabase.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" style="text-align: center; padding: 30px;">No feedback yet! Try searching for a recipe and share your cooking experience.</td>`;
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

function updateDatabaseStats() {
    document.getElementById('totalFeedback').textContent = feedbackDatabase.length;
    document.getElementById('totalRecipes').textContent = recipeDatabase.length;
}

updateDatabaseStats();

// Check for dish selection from dishes page
window.addEventListener('DOMContentLoaded', () => {
    const selectedDish = sessionStorage.getItem('selectedDish');
    if (selectedDish) {
        document.getElementById('recipeSearch').value = selectedDish;
        sessionStorage.removeItem('selectedDish');
        setTimeout(() => {
            document.getElementById('searchBtn').click();
        }, 500);
    }
});

// ═══════════════════════════════════════════════════════════════
//          CONSOLE BRANDING
// ═══════════════════════════════════════════════════════════════

console.log('%c🚀 Chief AI - Powered by SambaNova 🚀', 'font-size: 20px; color: #ffd700; font-weight: bold;');
console.log('%c✨ Created by Fusion - Swaraj Nerlekar & Claude AI ✨', 'font-size: 14px; color: #4ecdc4;');
console.log('%cMaking AI Powerful and Accessible!', 'font-size: 12px; color: #ff6b6b;');
