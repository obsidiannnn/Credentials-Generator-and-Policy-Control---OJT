// SecurePass Studio - Main JavaScript

// State
let passwords = JSON.parse(localStorage.getItem('passwords') || '[]');
let currentPage = 1;
const pageSize = 5;
let gameState = { score: 0, level: 1, time: 10, highScore: parseInt(localStorage.getItem('highScore') || '0'), timer: null, currentPassword: '' };

// Utility Functions
const toast = (msg, type = 'info') => {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `padding:12px 20px;background:${type === 'error' ? 'var(--error)' : type === 'success' ? 'var(--success)' : 'var(--accent)'};color:#fff;border-radius:var(--radius-sm);box-shadow:var(--shadow-md);animation:slideUp 0.3s;`;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(() => t.remove(), 3000);
};

const $ = (id) => document.getElementById(id);
const hide = (el) => el?.classList.add('hide');
const show = (el) => el?.classList.remove('hide');

// Password Generation
const generatePassword = (length, minUpper, minLower, minDigits, minSymbols, avoidSimilar, noRepeating) => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let upperSet = upper;
  let lowerSet = lower;
  let digitSet = digits;
  
  if (avoidSimilar) {
    upperSet = upper.replace(/[IO]/g, '');
    lowerSet = lower.replace(/[l]/g, '');
    digitSet = digits.replace(/[10]/g, '');
  }
  
  const total = minUpper + minLower + minDigits + minSymbols;
  if (total > length) throw new Error('Minimum requirements exceed password length');
  
  let pwd = [];
  
  for (let i = 0; i < minUpper; i++) pwd.push(upperSet[Math.floor(Math.random() * upperSet.length)]);
  for (let i = 0; i < minLower; i++) pwd.push(lowerSet[Math.floor(Math.random() * lowerSet.length)]);
  for (let i = 0; i < minDigits; i++) pwd.push(digitSet[Math.floor(Math.random() * digitSet.length)]);
  for (let i = 0; i < minSymbols; i++) pwd.push(symbols[Math.floor(Math.random() * symbols.length)]);
  
  const allChars = upperSet + lowerSet + digitSet + symbols;
  const remaining = length - total;
  
  for (let i = 0; i < remaining; i++) {
    let char;
    do {
      char = allChars[Math.floor(Math.random() * allChars.length)];
    } while (noRepeating && pwd.includes(char));
    pwd.push(char);
  }
  
  // Shuffle
  for (let i = pwd.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
  }
  
  return pwd.join('');
};

const calculateEntropy = (pwd) => {
  let pool = 0;
  if (/[a-z]/.test(pwd)) pool += 26;
  if (/[A-Z]/.test(pwd)) pool += 26;
  if (/[0-9]/.test(pwd)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32;
  return Math.log2(Math.pow(pool, pwd.length));
};

const updateStrengthMeter = (pwd) => {
  const entropy = calculateEntropy(pwd);
  const segments = [1, 2, 3, 4, 5];
  
  segments.forEach(i => {
    const seg = $(`strengthSegment${i}`);
    seg.style.background = 'var(--border)';
  });
  
  let color, label, active;
  if (entropy < 40) { color = 'var(--error)'; label = 'Weak'; active = 1; }
  else if (entropy < 60) { color = 'var(--warning)'; label = 'Fair'; active = 2; }
  else if (entropy < 80) { color = '#c98a2e'; label = 'Good'; active = 3; }
  else if (entropy < 100) { color = 'var(--success)'; label = 'Strong'; active = 4; }
  else { color = 'var(--success)'; label = 'Very Strong'; active = 5; }
  
  for (let i = 1; i <= active; i++) {
    $(`strengthSegment${i}`).style.background = color;
  }
  
  $('entropyDisplay').textContent = `Entropy: ${entropy.toFixed(1)} bits`;
  $('strengthLabel').textContent = `Strength: ${label}`;
};

// Password History
const savePassword = (pwd) => {
  passwords.unshift({ 
    password: pwd, 
    entropy: calculateEntropy(pwd),
    timestamp: Date.now() 
  });
  localStorage.setItem('passwords', JSON.stringify(passwords));
  renderHistory();
};

const renderHistory = () => {
  const search = $('historySearch').value.toLowerCase();
  const sort = $('historySort').value;
  
  let filtered = passwords.filter(p => p.password.toLowerCase().includes(search));
  
  // Sort
  if (sort === 'newest') filtered.sort((a, b) => b.timestamp - a.timestamp);
  else if (sort === 'oldest') filtered.sort((a, b) => a.timestamp - b.timestamp);
  else if (sort === 'strongest') filtered.sort((a, b) => b.entropy - a.entropy);
  else if (sort === 'weakest') filtered.sort((a, b) => a.entropy - b.entropy);
  else if (sort === 'longest') filtered.sort((a, b) => b.password.length - a.password.length);
  else if (sort === 'shortest') filtered.sort((a, b) => a.password.length - b.password.length);
  
  const start = (currentPage - 1) * pageSize;
  const page = filtered.slice(start, start + pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);
  
  const list = $('historyList');
  list.innerHTML = page.length ? page.map((p, i) => `
    <div style="padding:12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:12px;">
      <div style="flex:1;font-family:var(--font-mono);word-break:break-all;font-size:0.95rem;">${p.password}</div>
      <div style="display:flex;gap:8px;">
        <button onclick="copyHistoryPassword(${start + i})" style="padding:6px 12px;background:var(--accent);color:#fff;border-radius:var(--radius-sm);font-size:0.85rem;">Copy</button>
        <button onclick="deletePassword(${start + i})" style="padding:6px 12px;background:var(--error);color:#fff;border-radius:var(--radius-sm);font-size:0.85rem;">Del</button>
      </div>
    </div>
  `).join('') : '<div class="empty"><p>🔍 No passwords found</p></div>';
  
  $('pageInfo').textContent = `Page ${currentPage} of ${totalPages || 1}`;
  $('prevPage').disabled = currentPage === 1;
  $('nextPage').disabled = currentPage >= totalPages;
  $('pagination').classList.toggle('off', filtered.length <= pageSize);
};

window.copyHistoryPassword = (idx) => {
  const pwd = passwords[idx].password;
  navigator.clipboard.writeText(pwd);
  toast('Password copied!', 'success');
};

window.deletePassword = (idx) => {
  passwords.splice(idx, 1);
  localStorage.setItem('passwords', JSON.stringify(passwords));
  renderHistory();
  toast('Password deleted', 'info');
};

// Theme
const setTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('theme', theme);
  $('themeBtn').textContent = theme === 'dark' ? '🌙' : '☀️';
};

// Game Logic
const startGame = () => {
  gameState.score = 0;
  gameState.level = 1;
  gameState.time = 10;
  $('gameScore').textContent = '0';
  $('gameLevel').textContent = '1';
  $('gameStartBtn').disabled = true;
  $('gameRestartBtn').disabled = false;
  $('gameInput').disabled = false;
  $('gameInput').value = '';
  $('gameInput').focus();
  $('gameFeedback').textContent = '';
  nextRound();
};

const nextRound = () => {
  clearInterval(gameState.timer);
  const len = 6 + gameState.level;
  gameState.currentPassword = generatePassword(len, 1, 1, 1, 1, false, false);
  $('gamePassword').textContent = gameState.currentPassword;
  gameState.time = 10;
  $('gameTimer').textContent = '10';
  $('gameInput').value = '';
  
  gameState.timer = setInterval(() => {
    gameState.time--;
    $('gameTimer').textContent = gameState.time;
    if (gameState.time <= 0) {
      endGame();
    }
  }, 1000);
};

const endGame = () => {
  clearInterval(gameState.timer);
  $('gameStartBtn').disabled = false;
  $('gameRestartBtn').disabled = true;
  $('gameInput').disabled = true;
  $('gameFeedback').textContent = `Game Over! Final Score: ${gameState.score}`;
  $('gameFeedback').style.color = 'var(--error)';
  
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem('highScore', gameState.highScore);
    $('gameHighScore').textContent = gameState.highScore;
    toast('New High Score! 🎉', 'success');
  }
};

// Event Listeners
$('generateBtn').onclick = () => {
  try {
    $('policyError').textContent = '';
    const pwd = generatePassword(
      +$('length').value,
      +$('minUpper').value,
      +$('minLower').value,
      +$('minDigits').value,
      +$('minSymbols').value,
      $('avoidSimilar').checked,
      $('noRepeating').checked
    );
    $('passwordOutput').textContent = pwd;
    updateStrengthMeter(pwd);
    $('copyBtn').disabled = false;
    savePassword(pwd);
    toast('Password generated!', 'success');
  } catch (e) {
    $('policyError').textContent = e.message;
  }
};

$('copyBtn').onclick = () => {
  const pwd = $('passwordOutput').textContent;
  if (pwd !== '—') {
    navigator.clipboard.writeText(pwd);
    toast('Copied to clipboard!', 'success');
  }
};

$('loadExampleBtn').onclick = () => {
  $('length').value = 20;
  $('minUpper').value = 3;
  $('minLower').value = 3;
  $('minDigits').value = 3;
  $('minSymbols').value = 3;
  toast('Example policy loaded', 'info');
};

$('toggleVisibility').onclick = () => {
  const out = $('passwordOutput');
  out.style.webkitTextSecurity = out.style.webkitTextSecurity === 'disc' ? 'none' : 'disc';
};

$('clearHistoryBtn').onclick = () => {
  if (confirm('Clear all password history?')) {
    passwords = [];
    localStorage.setItem('passwords', '[]');
    renderHistory();
    toast('History cleared', 'info');
  }
};

$('prevPage').onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    renderHistory();
  }
};

$('nextPage').onclick = () => {
  currentPage++;
  renderHistory();
};

$('historySearch').oninput = () => {
  currentPage = 1;
  renderHistory();
};

$('historySort').onchange = renderHistory;

$('themeBtn').onclick = () => {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
};

$('gameStartBtn').onclick = startGame;
$('gameRestartBtn').onclick = startGame;

$('gameInput').oninput = (e) => {
  const input = e.target.value;
  if (input === gameState.currentPassword) {
    gameState.score += 10;
    gameState.level++;
    $('gameScore').textContent = gameState.score;
    $('gameLevel').textContent = gameState.level;
    $('gameFeedback').textContent = '✅ Correct!';
    $('gameFeedback').style.color = 'var(--success)';
    setTimeout(nextRound, 500);
  }
};

// AI Password Generation (Using Gemini API)
const GEMINI_API_KEY = 'AIzaSyD9xtOoVde1y-kKPUT_Hy4Rn5wfXOm8PEk';

$('aiGenerateBtn').onclick = async () => {
  const prompt = $('aiPrompt').value.trim();
  if (!prompt) {
    $('aiError').textContent = 'Please describe the password you want';
    return;
  }
  
  $('aiError').textContent = '';
  const btn = $('aiGenerateBtn');
  btn.disabled = true;
  show(btn.querySelector('.spin'));
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a secure password based on this description: "${prompt}". 
            
Rules:
- Return ONLY the password itself, nothing else
- No explanations, no quotes, no markdown, no extra text
- Make it secure and match the user's requirements
- Use a mix of uppercase, lowercase, numbers, and symbols unless they request otherwise
- Password should be between 12-32 characters`
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 100
        }
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    const pwd = data.candidates[0].content.parts[0].text.trim()
      .replace(/```/g, '')
      .replace(/^["']|["']$/g, '')
      .split('\n')[0];
    
    $('passwordOutput').textContent = pwd;
    updateStrengthMeter(pwd);
    $('copyBtn').disabled = false;
    savePassword(pwd);
    toast('AI password generated!', 'success');
  } catch (err) {
    $('aiError').textContent = `Failed: ${err.message || 'Please check your API key'}`;
  } finally {
    btn.disabled = false;
    hide(btn.querySelector('.spin'));
  }
};

$('aiPrompt').onkeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    $('aiGenerateBtn').click();
  }
};

// Keyboard Shortcuts
document.onkeydown = (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  if (e.key === 'g' || e.key === 'G') {
    e.preventDefault();
    $('generateBtn').click();
  } else if (e.key === 'c' || e.key === 'C') {
    e.preventDefault();
    $('copyBtn').click();
  } else if (e.key === 't' || e.key === 'T') {
    e.preventDefault();
    $('themeBtn').click();
  } else if (e.key === 'h' || e.key === 'H') {
    e.preventDefault();
    $('toggleVisibility').click();
  } else if (e.key === '/') {
    e.preventDefault();
    $('historySearch').focus();
  } else if (e.key === '?') {
    e.preventDefault();
    $('helpModal').showModal();
  }
};

$('helpModal').querySelector('.close').onclick = () => $('helpModal').close();
$('helpModal').onclick = (e) => {
  if (e.target === $('helpModal')) $('helpModal').close();
};

// Initialize - Force light theme by default
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  setTheme('dark');
} else {
  // Explicitly set light theme
  document.documentElement.removeAttribute('data-theme');
  localStorage.setItem('theme', 'light');
  $('themeBtn').textContent = '☀️';
}

renderHistory();
$('gameHighScore').textContent = gameState.highScore;

// Add animation styles
const style = document.createElement('style');
style.textContent = '@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }';
document.head.appendChild(style);