const OpenAI = require("openai");
require("dotenv").config();

const CATEGORIES = [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Entertainment",
    "Other",
];

let client = null;

if (process.env.OPENAI_API_KEY) {
    client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

function getRandomCategory() {
    const index = Math.floor(Math.random() * CATEGORIES.length);
    return CATEGORIES[index];
}

async function categorizeExpense(description = "") {
    if (!client || !description) {
        return getRandomCategory();
    }

    try {
        const prompt = `
Categorize this expense into one of the following categories only:
${CATEGORIES.join(", ")}

Expense description: "${description}"

Return only the category name.
`;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
        });

        const category = response.choices[0].message.content.trim();

        return CATEGORIES.includes(category)
            ? category
            : getRandomCategory();
    } catch (err) {
        console.error("AI categorization failed:", err.message);
        return getRandomCategory();
    }
}

module.exports = { categorizeExpense };
