// 🔴 ENTER YOUR API KEY HERE
const API_KEY = "YOUR_GEMINI_API_KEY"; 

const codeInput = document.getElementById('code-input');
const codeOutput = document.getElementById('code-output');
const loading = document.getElementById('loading');
const btnText = document.getElementById('btn-text');
const targetLangSelect = document.getElementById('target-lang');

let currentMode = 'debug'; // Modes: debug, convert, explain

// 1. SWITCH MODES (UI Logic)
function setMode(mode) {
    currentMode = mode;
    
    // UI Updates
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${mode}`).classList.add('active');

    // Show/Hide specific controls
    if (mode === 'convert') {
        targetLangSelect.classList.remove('hidden');
        btnText.innerHTML = "Convert Code";
        codeInput.placeholder = "// Paste code to convert (e.g., Python to Java)...";
    } else if (mode === 'explain') {
        targetLangSelect.classList.add('hidden');
        btnText.innerHTML = "Explain Code";
        codeInput.placeholder = "// Paste complex code to understand...";
    } else { // debug
        targetLangSelect.classList.add('hidden');
        btnText.innerHTML = "Fix My Code";
        codeInput.placeholder = "// Paste broken code here...";
    }
}

// 2. PROCESS CODE (AI Logic)
async function processCode() {
    const code = codeInput.value.trim();
    if (!code) {
        alert("Please enter some code first!");
        return;
    }

    // Show Loading
    loading.classList.remove('hidden');
    loading.classList.add('flex');
    codeOutput.textContent = "";

    // CONSTRUCT PROMPT (The Secret Sauce)
    let prompt = "";
    
    if (currentMode === 'debug') {
        prompt = `You are a World-Class Senior Software Engineer. 
        Your task: Analyze this code, find bugs/errors, and fix them.
        Output Format: Provide ONLY the fixed code first, followed by a short comment explaining the fix.
        Do not use markdown backticks.
        Code:
        ${code}`;
    } 
    else if (currentMode === 'convert') {
        const target = targetLangSelect.value;
        prompt = `You are a Code Translator. 
        Your task: Convert the following code to ${target}.
        Output Format: Provide ONLY the converted code. No explanations.
        Do not use markdown backticks.
        Code:
        ${code}`;
    } 
    else if (currentMode === 'explain') {
        prompt = `You are a Coding Tutor. 
        Your task: Explain this code simply (like I am a beginner).
        Output Format: Use bullet points. Keep it clear and concise.
        Code:
        ${code}`;
    }

    try {
        // Call Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            let result = data.candidates[0].content.parts[0].text;
            
            // Clean Markdown (```) if AI adds them
            result = result.replace(/^```[a-z]*\n/i, '').replace(/```$/g, '');
            
            codeOutput.textContent = result.trim();
            
            // Re-apply Colors (Syntax Highlight)
            Prism.highlightElement(codeOutput);
        } else {
            codeOutput.textContent = "// Error: AI could not process your request.";
        }

    } catch (error) {
        codeOutput.textContent = "// System Error: Please check your Internet or API Key.";
        console.error(error);
    } finally {
        loading.classList.add('hidden');
        loading.classList.remove('flex');
    }
}

// 3. COPY FUNCTION
function copyOutput() {
    const text = codeOutput.textContent;
    if(text) {
        navigator.clipboard.writeText(text);
        // Visual Feedback
        const copyBtn = document.querySelector('button[onclick="copyOutput()"]');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => copyBtn.innerHTML = originalText, 2000);
    }
}
