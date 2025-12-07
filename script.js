// ==========================================
// DEVFIX AI - CONFIGURATION & LOGIC
// ==========================================

// 🔴 STEP 1: PASTE YOUR GOOGLE GEMINI API KEY INSIDE THE QUOTES BELOW
const API_KEY = "AIzaSyATjNf7JP4_0ls38iekN5xMPhVYft421ls"; 

// DOM Elements
const inputCode = document.getElementById('input-code');
const outputCode = document.getElementById('output-code');
const fixBtn = document.getElementById('fix-btn');
const loading = document.getElementById('loading');

// 2. MAIN FUNCTION TO FIX CODE
async function fixMyCode() {
    const code = inputCode.value.trim();
    
    // Validation: Check if code is empty
    if (!code) {
        alert("Please paste some broken code first!");
        return;
    }

    // Validation: Check if API Key is set
    if (API_KEY === "PASTE_YOUR_API_KEY_HERE" || API_KEY === "") {
        alert("API Key is missing! Please open script.js and add your Google Gemini API Key.");
        return;
    }

    // UI: Show Loading State
    loading.classList.remove('hidden');
    outputCode.innerHTML = "";
    fixBtn.disabled = true;
    fixBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing Bug...';

    // 3. AI PROMPT ENGINEERING
    const prompt = `
    You are an expert Senior Software Engineer and Debugger. 
    I have a piece of broken or buggy code. 
    
    Your task:
    1. Identify the error/bug.
    2. Fix the code.
    3. Explain the solution clearly and concisely.
    4. Provide the complete corrected code block.
    
    Here is the broken code:
    ${code}
    `;

    try {
        // Fetch Request to Google Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        // UI: Remove Loading
        loading.classList.add('hidden');
        fixBtn.disabled = false;
        fixBtn.innerHTML = '<i class="fas fa-tools"></i> Fix My Code';

        // Check for Valid Response
        if (data.candidates && data.candidates[0].content) {
            let result = data.candidates[0].content.parts[0].text;
            
            // Formatting: Convert Markdown to HTML for better display
            result = result
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-400">$1</strong>') // Bold text
                .replace(/```(.*?)```/gs, '<div class="bg-black p-4 rounded-lg border border-gray-700 my-3 text-green-400 font-mono text-xs md:text-sm overflow-x-auto">$1</div>'); // Code blocks

            outputCode.innerHTML = result;
        } else {
            outputCode.innerText = "Error: AI could not fix this code. Please try again.";
        }

    } catch (error) {
        // Error Handling
        loading.classList.add('hidden');
        fixBtn.disabled = false;
        fixBtn.innerHTML = '<i class="fas fa-tools"></i> Fix My Code';
        outputCode.innerText = "Connection Error! Please check your internet connection or API Key.";
        console.error("DevFix Error:", error);
    }
}

// Event Listener for Button Click
fixBtn.addEventListener('click', fixMyCode);

// Utility: Clear Input/Output
function clearAll() {
    inputCode.value = "";
    outputCode.innerHTML = "// Solution will appear here...";
}

// Utility: Copy Result to Clipboard
function copyOutput() {
    const text = outputCode.innerText;
    if(text && text !== "// Solution will appear here...") {
        navigator.clipboard.writeText(text);
        alert("Solution Copied to Clipboard!");
    } else {
        alert("Nothing to copy yet!");
    }
}
