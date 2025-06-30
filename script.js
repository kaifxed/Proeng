// --- Gemini API: Get a random English sentence ---
const sentenceTypeSelect = document.getElementById('sentence-type');
const customPromptInput = document.getElementById('custom-prompt');
const wordCountSelect = document.getElementById('word-count');

// API Keys management
let apiKeys = [];
let currentApiKeyIndex = 0;

// Load API keys from localStorage
function loadApiKeys() {
  const savedKeys = localStorage.getItem('geminiApiKeys');
  if (savedKeys) {
    apiKeys = JSON.parse(savedKeys);
  }
  updateApiStatus();
}

// Save API keys to localStorage
function saveApiKeys() {
  localStorage.setItem('geminiApiKeys', JSON.stringify(apiKeys));
  updateApiStatus();
}

// Update API status display
function updateApiStatus() {
  const apiCount = document.getElementById('api-count');
  const apiStatusText = document.getElementById('api-status-text');
  
  if (apiCount) {
    apiCount.textContent = `${apiKeys.length} key${apiKeys.length !== 1 ? 's' : ''} added`;
  }
  
  if (apiStatusText) {
    if (apiKeys.length === 0) {
      apiStatusText.textContent = 'No API keys added';
      apiStatusText.className = 'error';
    } else {
      apiStatusText.textContent = 'Ready to use';
      apiStatusText.className = '';
    }
  }
}

// Function to get next API key in rotation
function getNextApiKey() {
  if (apiKeys.length === 0) {
    showSnackbar('Please add at least one API key in settings.');
    return null;
  }
  const apiKey = apiKeys[currentApiKeyIndex];
  currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
  return apiKey;
}

// Render API keys list
function renderApiKeysList() {
  const apiKeysList = document.getElementById('api-keys-list');
  if (!apiKeysList) return;
  
  apiKeysList.innerHTML = '';
  
  apiKeys.forEach((key, index) => {
    const keyItem = document.createElement('div');
    keyItem.className = 'api-key-item';
    keyItem.innerHTML = `
      <span class="api-key-text">${key.substring(0, 20)}...</span>
      <button class="remove-api-btn" onclick="removeApiKey(${index})">Remove</button>
    `;
    apiKeysList.appendChild(keyItem);
  });
}

// Add API key
function addApiKey() {
  const newApiKeyInput = document.getElementById('new-api-key');
  const newKey = newApiKeyInput.value.trim();
  
  if (!newKey) {
    showSnackbar('Please enter an API key.');
    return;
  }
  
  if (newKey.length < 30) {
    showSnackbar('Please enter a valid API key.');
    return;
  }
  
  if (apiKeys.includes(newKey)) {
    showSnackbar('This API key is already added.');
    return;
  }
  
  apiKeys.push(newKey);
  saveApiKeys();
  renderApiKeysList();
  newApiKeyInput.value = '';
  showSnackbar('API key added successfully!');
}

// Remove API key
function removeApiKey(index) {
  apiKeys.splice(index, 1);
  saveApiKeys();
  renderApiKeysList();
  showSnackbar('API key removed.');
}

// Modal management
const apiModal = document.getElementById('api-modal');
const apiSettingsBtn = document.getElementById('api-settings-btn');
const closeModalBtn = document.getElementById('close-modal');
const addApiKeyBtn = document.getElementById('add-api-key');

apiSettingsBtn.onclick = () => {
  apiModal.style.display = 'block';
  renderApiKeysList();
  updateApiStatus();
};

closeModalBtn.onclick = () => {
  apiModal.style.display = 'none';
};

addApiKeyBtn.onclick = addApiKey;

// Close modal when clicking outside
window.onclick = (event) => {
  if (event.target === apiModal) {
    apiModal.style.display = 'none';
  }
  if (event.target === settingsModal) {
    settingsModal.style.display = 'none';
  }
};

// Enter key to add API key
document.getElementById('new-api-key').onkeypress = (e) => {
  if (e.key === 'Enter') {
    addApiKey();
  }
};

// --- Category Management ---
const categoryDropdownContainer = document.getElementById('category-dropdown-container');
const addCategoryContainer = document.getElementById('add-category-container');
const newCategoryInput = document.getElementById('new-category-input');
const addCategoryBtn = document.getElementById('add-category-btn');

let categories = [];
let selectedCategoryValue = null;
let isEditing = false;
const DEFAULT_CATEGORIES = [
  // Empty array - no default categories
];

function loadCategories() {
  const saved = localStorage.getItem('sentenceCategories');
  if (saved) {
    categories = JSON.parse(saved);
  } else {
    categories = DEFAULT_CATEGORIES.slice();
    saveCategories();
  }
  // Load selected category from localStorage
  const savedSelected = localStorage.getItem('selectedCategory');
  if (savedSelected && categories.find(cat => cat.value === savedSelected)) {
    selectedCategoryValue = savedSelected;
  } else {
    selectedCategoryValue = categories[0]?.value || null;
  }
}
function saveCategories() {
  localStorage.setItem('sentenceCategories', JSON.stringify(categories));
}
function setSelectedCategory(value) {
  selectedCategoryValue = value;
  localStorage.setItem('selectedCategory', value); // Persist selected category
  renderCategoryDropdown();
}
function renderCategoryDropdown() {
  categoryDropdownContainer.innerHTML = '';
  const dropdown = document.createElement('div');
  dropdown.className = 'custom-dropdown';
  dropdown.style.position = 'relative';
  dropdown.style.width = '100%';

  // Selected display
  const selected = document.createElement('div');
  selected.className = 'selected-category';
  selected.style.padding = '8px 14px';
  selected.style.borderRadius = '8px';
  selected.style.border = '1.5px solid #444';
  selected.style.background = '#23272f';
  selected.style.color = '#ffd700';
  selected.style.fontSize = '1em';
  selected.style.cursor = 'pointer';
  selected.style.display = 'flex';
  selected.style.alignItems = 'center';
  selected.style.justifyContent = 'space-between';
  selected.tabIndex = 0;
  const selCat = categories.find(cat => cat.value === selectedCategoryValue) || categories[0];
  selected.textContent = selCat ? selCat.label : 'Select category';
  const arrow = document.createElement('span');
  arrow.innerHTML = '<i class="fa fa-chevron-down"></i>';
  arrow.style.marginLeft = '8px';
  selected.appendChild(arrow);
  dropdown.appendChild(selected);

  // Dropdown list
  const list = document.createElement('div');
  list.className = 'dropdown-list';
  list.style.position = 'absolute';
  list.style.top = '110%';
  list.style.left = '0';
  list.style.width = '100%';
  list.style.background = '#23272f';
  list.style.border = '1.5px solid #444';
  list.style.borderRadius = '8px';
  list.style.boxShadow = '0 2px 8px rgba(0,0,0,0.13)';
  list.style.zIndex = '20';
  list.style.display = 'none';
  list.style.maxHeight = '220px';
  list.style.overflowY = 'auto';

  // Render categories
  categories.forEach(cat => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.justifyContent = 'space-between';
    item.style.padding = '8px 12px';
    item.style.cursor = 'pointer';
    item.style.color = '#ffd700';
    item.style.background = (cat.value === selectedCategoryValue) ? '#2a2f3a' : 'transparent';
    item.style.fontWeight = (cat.value === selectedCategoryValue) ? '700' : '500';
    item.tabIndex = 0;
    // Category label
    const label = document.createElement('span');
    label.textContent = cat.label;
    label.style.flex = '1';
    label.onclick = () => {
      if (!isEditing) {
        setSelectedCategory(cat.value);
        list.style.display = 'none';
      }
    };
    item.appendChild(label);
    // Edit/delete buttons for all categories
    // Edit
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="fa fa-pen"></i>';
    editBtn.title = 'Edit';
    editBtn.style.background = 'none';
    editBtn.style.border = 'none';
    editBtn.style.color = '#4CAF50';
    editBtn.style.marginRight = '6px';
    editBtn.style.cursor = 'pointer';
    editBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      isEditing = true;
      // Inline edit
      label.style.display = 'none';
      editBtn.style.display = 'none';
      deleteBtn.style.display = 'none';
      
      // Create input container for inline editing
      const inputContainer = document.createElement('div');
      inputContainer.style.display = 'flex';
      inputContainer.style.alignItems = 'center';
      inputContainer.style.gap = '6px';
      inputContainer.style.flex = '1';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.value = cat.label;
      input.style.flex = '1';
      input.style.padding = '4px 8px';
      input.style.borderRadius = '6px';
      input.style.fontSize = '1em';
      input.style.background = '#fff';
      input.style.color = '#000';
      input.style.border = '1px solid #007bff';
      
      // Confirm button
      const confirmBtn = document.createElement('button');
      confirmBtn.innerHTML = '<i class="fa fa-check"></i>';
      confirmBtn.title = 'Save';
      confirmBtn.style.background = '#4CAF50';
      confirmBtn.style.color = '#fff';
      confirmBtn.style.border = 'none';
      confirmBtn.style.borderRadius = '6px';
      confirmBtn.style.padding = '6px 8px';
      confirmBtn.style.cursor = 'pointer';
      confirmBtn.style.fontSize = '0.9em';
      
      // Cancel button
      const cancelBtn = document.createElement('button');
      cancelBtn.innerHTML = '<i class="fa fa-times"></i>';
      cancelBtn.title = 'Cancel';
      cancelBtn.style.background = '#e74c3c';
      cancelBtn.style.color = '#fff';
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '6px';
      cancelBtn.style.padding = '6px 8px';
      cancelBtn.style.cursor = 'pointer';
      cancelBtn.style.fontSize = '0.9em';
      
      input.onkeydown = (ev) => {
        if (ev.key === 'Enter') {
          finishEdit();
        } else if (ev.key === 'Escape') {
          cancelEdit();
        }
      };
      input.onblur = () => {
        // Don't auto-cancel on blur anymore since we have buttons
      };
      
      confirmBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        finishEdit();
      };
      
      cancelBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        cancelEdit();
      };
      
      inputContainer.appendChild(input);
      inputContainer.appendChild(confirmBtn);
      inputContainer.appendChild(cancelBtn);
      item.insertBefore(inputContainer, item.firstChild);
      input.focus();
      input.select();
      
      function finishEdit() {
        const newName = input.value.trim();
        if (!newName) {
          showSnackbar('Category name cannot be empty.');
          return;
        }
        if (categories.some(c => c.label.toLowerCase() === newName.toLowerCase() && c.value !== cat.value)) {
          showSnackbar('Category already exists.');
          return;
        }
        cat.label = newName;
        saveCategories();
        isEditing = false;
        renderCategoryDropdown();
      }
      function cancelEdit() {
        isEditing = false;
        renderCategoryDropdown();
      }
    };
    item.appendChild(editBtn);
    // Delete
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fa fa-times"></i>';
    deleteBtn.title = 'Delete';
    deleteBtn.style.background = 'none';
    deleteBtn.style.border = 'none';
    deleteBtn.style.color = '#e74c3c';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (confirm('Delete this category?')) {
        removeCategory(cat.value);
        list.style.display = 'none';
      }
    };
    item.appendChild(deleteBtn);
    list.appendChild(item);
  });
  // Add Category option
  const addItem = document.createElement('div');
  addItem.className = 'dropdown-item';
  addItem.style.padding = '8px 12px';
  addItem.style.cursor = 'pointer';
  addItem.style.color = '#007bff';
  addItem.style.fontWeight = '600';
  addItem.textContent = '+ Add Category...';
  addItem.onclick = () => {
    if (!isEditing) {
      list.style.display = 'none';
      showAddCategoryInput(true);
    }
  };
  list.appendChild(addItem);

  dropdown.appendChild(list);
  categoryDropdownContainer.appendChild(dropdown);

  // Dropdown open/close logic
  let dropdownOpen = false;
  selected.onclick = (e) => {
    if (!isEditing) {
      list.style.display = (list.style.display === 'none' || !list.style.display) ? 'block' : 'none';
      dropdownOpen = list.style.display === 'block';
    }
  };

  // Add document mousedown listener to close dropdown when clicking outside
  function handleOutsideClick(event) {
    if (!dropdown.contains(event.target)) {
      list.style.display = 'none';
      dropdownOpen = false;
      document.removeEventListener('mousedown', handleOutsideClick);
    }
  }
  selected.addEventListener('click', function(e) {
    if (!isEditing && list.style.display === 'block') {
      // Wait a tick to allow click on dropdown items
      setTimeout(() => {
        document.addEventListener('mousedown', handleOutsideClick);
      }, 0);
    }
  });
}
function showAddCategoryInput(show) {
  addCategoryContainer.style.display = show ? 'flex' : 'none';
  if (show) newCategoryInput.focus();
}
addCategoryBtn.onclick = function() {
  const name = newCategoryInput.value.trim();
  if (!name) {
    showSnackbar('Enter a category name.');
    return;
  }
  // Prevent duplicates
  if (categories.some(cat => cat.label.toLowerCase() === name.toLowerCase())) {
    showSnackbar('Category already exists.');
    return;
  }
  // Generate a safe value
  const value = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  categories.push({ value, label: name, promptType: 'general' });
  saveCategories();
  setSelectedCategory(value);
  showAddCategoryInput(false);
  newCategoryInput.value = '';
  showSnackbar('Category added!');
};
newCategoryInput.onkeypress = function(e) {
  if (e.key === 'Enter') addCategoryBtn.onclick();
};
function removeCategory(value) {
  const idx = categories.findIndex(cat => cat.value === value);
  if (idx > -1) {
    categories.splice(idx, 1);
    saveCategories();
    if (selectedCategoryValue === value) {
      setSelectedCategory(categories[0]?.value || null);
    } else {
      renderCategoryDropdown();
    }
    showSnackbar('Category removed.');
  }
}
// Call on load
loadCategories();
renderCategoryDropdown();

async function getRandomSentence() {
  const apiKey = getNextApiKey();
  if (!apiKey) {
    return "Please add at least one API key in settings (click the key icon in the top right).";
  }
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
  const wordCountInput = document.getElementById('word-count');
  let wordCount = parseInt(wordCountInput.value, 10);
  if (isNaN(wordCount) || wordCount < 3 || wordCount > 49) {
    showSnackbar('Please enter a number of words between 3 and 49.');
    return;
  }
  let wordCountInstruction = `Make it about ${wordCount} words. `;
  const randomSeed = Math.floor(Math.random() * 1000000) + '-' + Date.now();
  const seedInstruction = `Use this random seed for uniqueness: [${randomSeed}].`;
  const simpleContexts = [
    'talking to a friend',
    'at work or office',
    'at home with family',
    'making plans',
    'asking for help',
    'sharing news',
    'giving an opinion',
    'asking a question',
    'making small talk',
    'expressing feelings'
  ];
  const randomContext = simpleContexts[Math.floor(Math.random() * simpleContexts.length)];
  const contextInstruction = `Context: ${randomContext}.`;
  const sentenceLang = document.getElementById('sentence-lang-input').value.trim() || 'English';
  let prompt = '';
  const type = selectedCategoryValue;
  // Find the category object
  const catObj = categories.find(cat => cat.value === type);
  if (catObj) {
    prompt = `Give me one simple, natural sentence for the category '${catObj.label}'. Generate the sentence in ${sentenceLang}. ${wordCountInstruction}${seedInstruction} ${contextInstruction} Make it casual and conversational. Only output the sentence, nothing else.`;
  } else {
    prompt = `Give me one simple, natural sentence that people actually use in everyday conversations. Generate the sentence in ${sentenceLang}. ${wordCountInstruction}${seedInstruction} ${contextInstruction} Make it casual and conversational. Only output the sentence, nothing else.`;
  }
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  try {
    return data.candidates[0].content.parts[0].text.trim();
  } catch {
    return "Sorry, couldn't fetch a sentence.";
  }
}

const translationEl = document.getElementById('translation');

const translateBtn = document.getElementById('translate-btn');
const wordByWordBtn = document.getElementById('word-by-word-btn');

async function getEnglishExplanation(englishSentence) {
  const apiKey = getNextApiKey();
  if (!apiKey) {
    return "Please add at least one API key in settings.";
  }
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
  const explanationLang = document.getElementById('explanation-lang-input').value.trim() || 'English';
  const prompt = `Explain this sentence in very short, simple, and clear terms that a language learner can easily understand. Be concise and to the point, avoid unnecessary details. Explain in ${explanationLang}. Only output the explanation, nothing else: ${englishSentence}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  try {
    return data.candidates[0].content.parts[0].text.trim();
  } catch {
    return "(Could not fetch explanation)";
  }
}

async function getWordByWordExplanation(englishSentence) {
  const apiKey = getNextApiKey();
  if (!apiKey) {
    return "Please add at least one API key in settings.";
  }
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
  const explanationLang = document.getElementById('explanation-lang-input').value.trim() || 'English';
  const prompt = `Analyze this sentence and explain the key words/phrases in very short, simple terms. Focus only on the most important vocabulary, idioms, or complex words. Format as bullet points with very short, clear explanations. Be concise and to the point. Use this exact format:
• "word/phrase" - explanation
• "word/phrase" - explanation
Explain in ${explanationLang}. Only output the bullet points, nothing else: ${englishSentence}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  try {
    let result = data.candidates[0].content.parts[0].text.trim();
    if (!result.includes('•')) {
      const lines = result.split('\n').filter(line => line.trim());
      result = lines.map(line => {
        if (line.trim() && !line.startsWith('•')) {
          return `• ${line.trim()}`;
        }
        return line;
      }).join('\n');
    }
    return result;
  } catch {
    return "(Could not fetch word-by-word explanation)";
  }
}

// --- DOM Elements ---
const sentenceEl = document.getElementById("sentence");
const getSentenceBtn = document.getElementById("get-sentence");
const recordBtn = document.getElementById("record");
const saveBtn = document.getElementById("save");
const recordingsList = document.getElementById("recordings-list");
const recordingIndicator = document.getElementById("recording-indicator");
const snackbar = document.getElementById("snackbar");
const searchBar = document.getElementById("search-bar");
const searchSentencesBar = document.getElementById('search-sentences-bar');
const clearAllBtn = document.getElementById("clear-all");
// --- Speak Tab DOM Elements ---
const tabRead = document.getElementById('tab-read');
const tabSpeak = document.getElementById('tab-speak');
const readTabContent = document.getElementById('read-tab-content');
const speakTabContent = document.getElementById('speak-tab-content');
const speakRecordBtn = document.getElementById('speak-record-btn');
const speakTranscript = document.getElementById('speak-transcript');
const speakCheckBtn = document.getElementById('speak-check-btn');
const speakFeedback = document.getElementById('speak-feedback');
const sentenceLangInput = document.getElementById('sentence-lang-input');

// --- State ---
let mediaRecorder;
let audioChunks = [];
let audioBlob;
let audioUrl;
let audio;
let isRecording = false;
let allRecordings = [];

const unsavedAudioContainer = document.createElement('div');
unsavedAudioContainer.id = 'unsaved-audio-player';
unsavedAudioContainer.style.marginTop = '18px';

function clearUnsavedAudioPlayer() {
  if (unsavedAudioContainer.parentNode) {
    unsavedAudioContainer.parentNode.removeChild(unsavedAudioContainer);
  }
}

// --- Custom Audio Player for Recordings ---
function formatTime(sec) {
  sec = Math.floor(sec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// --- Fix for mobile browsers: audio duration Infinity/NaN ---
function fixAudioDuration(audio, callback) {
  if (isNaN(audio.duration) || !isFinite(audio.duration) || audio.duration === 0) {
    const onTimeUpdate = () => {
      audio.currentTime = 0;
      audio.removeEventListener('timeupdate', onTimeUpdate);
      if (callback) callback(audio.duration);
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.currentTime = 1e101;
  } else {
    if (callback) callback(audio.duration);
  }
}

function showUnsavedAudioPlayer(audioBlob) {
  clearUnsavedAudioPlayer();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  let duration = 0;
  let isPlaying = false;

  unsavedAudioContainer.innerHTML = `
    <div class="audio-player">
      <button class="playpause" aria-label="Play/Pause"><i class="fa-solid fa-play"></i></button>
      <input type="range" min="0" max="100" value="0" class="audio-slider" aria-label="Seek">
      <span class="audio-time">0:00 / 0:00</span>
      <button class="delete-unsaved" title="Delete unsaved audio" aria-label="Delete unsaved audio"><i class="fa-solid fa-trash"></i></button>
    </div>
  `;
  const playpauseBtn = unsavedAudioContainer.querySelector('.playpause');
  const slider = unsavedAudioContainer.querySelector('.audio-slider');
  const timeDisplay = unsavedAudioContainer.querySelector('.audio-time');
  const deleteUnsavedBtn = unsavedAudioContainer.querySelector('.delete-unsaved');

  audio.addEventListener('loadedmetadata', () => {
    fixAudioDuration(audio, (realDuration) => {
      duration = realDuration;
      timeDisplay.textContent = `0:00 / ${formatTime(duration)}`;
      slider.max = Math.floor(duration);
    });
  });

  audio.addEventListener('timeupdate', () => {
    slider.value = Math.floor(audio.currentTime);
    timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(duration)}`;
  });

  slider.addEventListener('input', () => {
    audio.currentTime = slider.value;
  });

  playpauseBtn.onclick = () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  audio.addEventListener('play', () => {
    isPlaying = true;
    playpauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  });
  audio.addEventListener('pause', () => {
    isPlaying = false;
    playpauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  });
  audio.addEventListener('ended', () => {
    isPlaying = false;
    playpauseBtn.innerHTML = '<i class=\'fa-solid fa-play\'></i>';
    slider.value = 0;
    timeDisplay.textContent = `0:00 / ${formatTime(duration)}`;
  });

  // Delete/clear unsaved audio
  deleteUnsavedBtn.onclick = () => {
    clearUnsavedAudioPlayer();
    saveBtn.disabled = true;
    showSnackbar('Unsaved audio cleared');
  };

  // Insert below the recorder controls
  const recorderSection = document.getElementById('recorder-section');
  if (recorderSection) {
    recorderSection.appendChild(unsavedAudioContainer);
  }
}

// --- Snackbar Notification ---
function showSnackbar(message) {
  snackbar.textContent = message;
  snackbar.className = "show";
  setTimeout(() => {
    snackbar.className = snackbar.className.replace("show", "");
  }, 2200);
}

// --- Get Sentence ---
getSentenceBtn.onclick = async () => {
  sentenceEl.textContent = "Loading...";
  translationEl.textContent = "";
  sentenceEl.classList.remove("highlight");
  let sentence = await getRandomSentence();
  // Remove leading/trailing quotes (single, double, curly)
  sentence = sentence.replace(/^["'""'']+|["'""'']+$/g, '');
  sentenceEl.textContent = sentence;
  sentenceEl.classList.add("highlight");
  // No auto-translation here
};

// --- Toggle Recording ---
recordBtn.onclick = async () => {
  if (!isRecording) {
    // Start recording
    clearUnsavedAudioPlayer();
    if (!navigator.mediaDevices) {
      showSnackbar("Audio recording not supported in this browser.");
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      audioUrl = URL.createObjectURL(audioBlob);
      audio = new Audio(audioUrl);
      saveBtn.disabled = false;
      showSnackbar("Recording stopped");
      showUnsavedAudioPlayer(audioBlob);
    };

    mediaRecorder.start();
    isRecording = true;
    recordBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
    recordBtn.classList.add('recording', 'recording-active');
    saveBtn.disabled = true;
    showSnackbar("Recording started");
  } else {
    // Stop recording
    mediaRecorder.stop();
    isRecording = false;
    recordBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    recordBtn.classList.remove('recording', 'recording-active');
  }
};

// --- Save Recording Locally ---
saveBtn.onclick = () => {
  if (saveBtn.disabled) return; // Prevent double save
  saveBtn.disabled = true;
  const sentence = sentenceEl.textContent;
  const timestamp = new Date().toLocaleString();
  const reader = new FileReader();
  reader.onload = function() {
    const base64Audio = reader.result;
    const recording = { sentence, audio: base64Audio, timestamp };
    let recordings = JSON.parse(localStorage.getItem("recordings") || "[]");
    recordings.unshift(recording); // Add new recording to the top
    localStorage.setItem("recordings", JSON.stringify(recordings));
    loadRecordings();
    showSnackbar("Recording saved");
    clearUnsavedAudioPlayer();
    saveBtn.disabled = true;
  };
  reader.readAsDataURL(audioBlob);
};

// --- Speech Synthesis for Pronouncing Sentences ---
function speakText(text) {
  if (!window.speechSynthesis) {
    showSnackbar('Speech synthesis not supported in this browser.');
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 1;
  window.speechSynthesis.speak(utter);
}

const speakSentenceBtn = document.getElementById('speak-sentence');
speakSentenceBtn.onclick = () => {
  speakText(sentenceEl.textContent);
};

function addRecordingToList(recording, idx) {
  const li = document.createElement("li");
  li.classList.add("fade-in");
  li.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;">
      <div class="recording-sentence" title="Click to edit" tabindex="0" style="flex:1;">${recording.sentence}</div>
      <button class="rename" title="Rename" aria-label="Rename"><i class="fa-solid fa-pen"></i></button>
      <button class="speak-btn" title="Speak sentence"><i class="fa-solid fa-volume-up"></i></button>
    </div>
    <hr class="recording-divider">
    <div class="audio-player">
      <button class="playpause" aria-label="Play/Pause"><i class="fa-solid fa-play"></i></button>
      <input type="range" min="0" max="100" value="0" class="audio-slider" aria-label="Seek">
      <span class="audio-time">0:00 / 0:00</span>
      <button class="delete" title="Delete" aria-label="Delete"><i class="fa-solid fa-trash"></i></button>
    </div>
    <span style="font-size:0.85em;color:#888;">${recording.timestamp}</span>
  `;
  const audio = new Audio(recording.audio);
  const playpauseBtn = li.querySelector(".playpause");
  const slider = li.querySelector(".audio-slider");
  const timeDisplay = li.querySelector(".audio-time");
  const deleteBtn = li.querySelector(".delete");
  const renameBtn = li.querySelector(".rename");
  const sentenceDiv = li.querySelector(".recording-sentence");
  const speakBtn = li.querySelector(".speak-btn");

  let isPlaying = false;
  let duration = 0;

  audio.addEventListener('loadedmetadata', () => {
    fixAudioDuration(audio, (realDuration) => {
      duration = realDuration;
      timeDisplay.textContent = `0:00 / ${formatTime(duration)}`;
      slider.max = Math.floor(duration);
    });
  });

  audio.addEventListener('timeupdate', () => {
    slider.value = Math.floor(audio.currentTime);
    timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(duration)}`;
  });

  slider.addEventListener('input', () => {
    audio.currentTime = slider.value;
  });

  playpauseBtn.onclick = () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  audio.addEventListener('play', () => {
    isPlaying = true;
    playpauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  });
  audio.addEventListener('pause', () => {
    isPlaying = false;
    playpauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  });
  audio.addEventListener('ended', () => {
    isPlaying = false;
    playpauseBtn.innerHTML = '<i class=\'fa-solid fa-play\'></i>';
    slider.value = 0;
    timeDisplay.textContent = `0:00 / ${formatTime(duration)}`;
  });

  speakBtn.onclick = () => {
    speakText(recording.sentence);
  };

  deleteBtn.onclick = () => {
    if (confirm("Delete this recording?")) {
      let recordings = JSON.parse(localStorage.getItem("recordings") || "[]");
      recordings.splice(idx, 1);
      localStorage.setItem("recordings", JSON.stringify(recordings));
      loadRecordings();
      showSnackbar("Recording deleted");
    }
  };

  renameBtn.onclick = () => {
    const newSentence = prompt("Edit sentence/label:", recording.sentence);
    if (newSentence && newSentence.trim() !== "") {
      let recordings = JSON.parse(localStorage.getItem("recordings") || "[]");
      recordings[idx].sentence = newSentence.trim();
      localStorage.setItem("recordings", JSON.stringify(recordings));
      loadRecordings();
      showSnackbar("Recording renamed");
    }
  };

  recordingsList.appendChild(li);
}

function loadRecordings() {
  recordingsList.innerHTML = "";
  let recordings = JSON.parse(localStorage.getItem("recordings") || "[]");
  allRecordings = recordings;
  const clearAllBtn = document.getElementById('clear-all');
  if (recordings.length === 0) {
    if (clearAllBtn) clearAllBtn.style.display = 'none';
    // Show 'No recordings found.' message in the list area
    const li = document.createElement('li');
    li.textContent = 'No recordings found.';
    li.style.textAlign = 'center';
    li.style.color = '#888';
    li.style.padding = '18px 0';
    recordingsList.appendChild(li);
  } else {
    if (clearAllBtn) clearAllBtn.style.display = '';
    filterAndDisplayRecordings();
  }
}

function filterAndDisplayRecordings() {
  const query = (searchBar.value || "").toLowerCase();
  recordingsList.innerHTML = "";
  let hasAny = false;
  // Show newest first
  allRecordings.slice().forEach((rec, idx) => {
    if (
      rec.sentence.toLowerCase().includes(query) ||
      rec.timestamp.toLowerCase().includes(query)
    ) {
      addRecordingToList(rec, idx);
      hasAny = true;
    }
  });
  const clearAllBtn = document.getElementById('clear-all');
  if (!hasAny) {
    // Show a message in the list area
    const li = document.createElement('li');
    li.textContent = 'No recordings found.';
    li.style.textAlign = 'center';
    li.style.color = '#888';
    li.style.padding = '18px 0';
    recordingsList.appendChild(li);
    if (clearAllBtn) clearAllBtn.style.display = 'none';
  } else {
    if (clearAllBtn) clearAllBtn.style.display = '';
  }
}

searchBar.oninput = filterAndDisplayRecordings;

clearAllBtn.onclick = () => {
  if (confirm("Are you sure you want to delete all recordings?")) {
    localStorage.removeItem("recordings");
    loadRecordings();
    showSnackbar("All recordings cleared");
  }
};

translateBtn.onclick = async () => {
  const sentence = sentenceEl.textContent;
  if (!sentence || sentence === "Click Get Sentence to start!" || sentence === "Loading..." || sentence === "Sorry, couldn't fetch a sentence.") {
    showSnackbar('Please get a sentence first.');
    return;
  }
  translationEl.textContent = "Explaining...";
  const explanation = await getEnglishExplanation(sentence);
  translationEl.textContent = explanation;
};

wordByWordBtn.onclick = async () => {
  const sentence = sentenceEl.textContent;
  if (!sentence || sentence === "Click Get Sentence to start!" || sentence === "Loading..." || sentence === "Sorry, couldn't fetch a sentence.") {
    showSnackbar('Please get a sentence first.');
    return;
  }
  translationEl.textContent = "Analyzing...";
  const wordByWordExplanation = await getWordByWordExplanation(sentence);
  
  // Convert plain text bullet points to HTML formatting
  const formattedExplanation = wordByWordExplanation
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      if (line.startsWith('•')) {
        return line.replace('•', '•');
      }
      return line;
    })
    .join('\n');
  
  translationEl.textContent = formattedExplanation;
};

// --- Language and word count persistence ---
function loadLanguageAndWordCount() {
  const sentenceLangInput = document.getElementById('sentence-lang-input');
  const explanationLangInput = document.getElementById('explanation-lang-input');
  const wordCountInput = document.getElementById('word-count');
  sentenceLangInput.value = localStorage.getItem('sentenceLang') || 'English';
  explanationLangInput.value = localStorage.getItem('explanationLang') || 'English';
  wordCountInput.value = localStorage.getItem('wordCount') || '10';
  sentenceLangInput.addEventListener('input', () => {
    localStorage.setItem('sentenceLang', sentenceLangInput.value.trim());
  });
  explanationLangInput.addEventListener('input', () => {
    localStorage.setItem('explanationLang', explanationLangInput.value.trim());
  });
  wordCountInput.addEventListener('input', () => {
    localStorage.setItem('wordCount', wordCountInput.value.trim());
  });
}

// --- Init ---
window.onload = () => {
  loadApiKeys();
  loadRecordings();
  loadLanguageAndWordCount();
};

// --- Settings Modal Logic ---
const settingsModal = document.getElementById('settings-modal');
const settingsBtn = document.getElementById('settings-btn');
const closeSettingsModalBtn = document.getElementById('close-settings-modal');
settingsBtn.onclick = () => {
  settingsModal.style.display = 'block';
};
closeSettingsModalBtn.onclick = () => {
  settingsModal.style.display = 'none';
};

// --- Save Generated Sentence (Text Only) ---
const saveSentenceBtn = document.getElementById('save-sentence-btn');
const savedSentencesList = document.getElementById('saved-sentences-list');

function getCurrentSentenceData() {
  const sentence = sentenceEl.textContent.trim();
  if (!sentence || sentence === "Click Get Sentence to start!" || sentence === "Loading..." || sentence === "Sorry, couldn't fetch a sentence.") {
    return null;
  }
  const timestamp = new Date().toLocaleString();
  const category = categories.find(cat => cat.value === selectedCategoryValue)?.label || '';
  return { sentence, timestamp, category };
}

function loadSavedSentences() {
  const saved = JSON.parse(localStorage.getItem('savedSentences') || '[]');
  renderSavedSentences(saved);
}

function renderSavedSentences(sentences) {
  savedSentencesList.innerHTML = '';
  // Filter by search
  const query = (searchSentencesBar?.value || '').toLowerCase();
  const filtered = sentences.filter(item =>
    item.sentence.toLowerCase().includes(query) ||
    item.timestamp.toLowerCase().includes(query)
  );
  if (!filtered.length) {
    const li = document.createElement('li');
    li.textContent = 'No saved sentences.';
    li.style.textAlign = 'center';
    li.style.color = '#888';
    li.style.padding = '18px 0';
    savedSentencesList.appendChild(li);
    return;
  }
  filtered.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'saved-sentence-item';
    li.innerHTML = `
      <div style="display: flex; flex-direction: column; flex: 1;">
        <span class="saved-sentence-text">${item.sentence}</span>
        <span class="saved-sentence-meta">${item.timestamp}</span>
      </div>
      <span class="saved-sentence-actions">
        <button class="copy-saved-sentence" title="Copy sentence" aria-label="Copy"><i class="fa-solid fa-copy"></i></button>
        <button class="delete-saved-sentence" title="Delete sentence" aria-label="Delete"><i class="fa-solid fa-trash"></i></button>
      </span>
    `;
    // Copy
    li.querySelector('.copy-saved-sentence').onclick = () => {
      navigator.clipboard.writeText(item.sentence);
      showSnackbar('Sentence copied!');
    };
    // Delete
    li.querySelector('.delete-saved-sentence').onclick = () => {
      const saved = JSON.parse(localStorage.getItem('savedSentences') || '[]');
      saved.splice(idx, 1);
      localStorage.setItem('savedSentences', JSON.stringify(saved));
      loadSavedSentences();
      showSnackbar('Sentence deleted');
    };
    savedSentencesList.appendChild(li);
  });
}

if (saveSentenceBtn) {
  saveSentenceBtn.onclick = () => {
    const data = getCurrentSentenceData();
    if (!data) {
      showSnackbar('No sentence to save!');
      return;
    }
    let saved = JSON.parse(localStorage.getItem('savedSentences') || '[]');
    // Prevent duplicate saves
    if (saved.some(s => s.sentence === data.sentence)) {
      showSnackbar('Sentence already saved!');
      return;
    }
    saved.unshift(data);
    localStorage.setItem('savedSentences', JSON.stringify(saved));
    loadSavedSentences();
    showSnackbar('Sentence saved!');
  };
}

// Load saved sentences on page load
window.addEventListener('DOMContentLoaded', loadSavedSentences);

// --- Tab switching for recordings/sentences ---
const tabRecordings = document.getElementById('tab-recordings');
const tabSentences = document.getElementById('tab-sentences');
const recordingsListEl = document.getElementById('recordings-list');
const savedSentencesListEl = document.getElementById('saved-sentences-list');
const clearAllBtnEl = document.getElementById('clear-all');

function showRecordingsTab() {
  tabRecordings.classList.add('active');
  tabSentences.classList.remove('active');
  recordingsListEl.style.display = '';
  savedSentencesListEl.style.display = 'none';
  if (clearAllBtnEl) clearAllBtnEl.style.display = '';
  if (searchBar) searchBar.style.display = '';
  if (searchSentencesBar) searchSentencesBar.style.display = 'none';
  if (clearAllSentencesBtn) clearAllSentencesBtn.style.display = 'none';
}
function showSentencesTab() {
  tabRecordings.classList.remove('active');
  tabSentences.classList.add('active');
  recordingsListEl.style.display = 'none';
  savedSentencesListEl.style.display = '';
  if (clearAllBtnEl) clearAllBtnEl.style.display = 'none';
  if (searchBar) searchBar.style.display = 'none';
  if (searchSentencesBar) searchSentencesBar.style.display = '';
  if (clearAllSentencesBtn) clearAllSentencesBtn.style.display = '';
}
if (tabRecordings && tabSentences) {
  tabRecordings.onclick = showRecordingsTab;
  tabSentences.onclick = showSentencesTab;
}
// Show recordings tab by default on load

// Search/filter for saved sentences
if (searchSentencesBar) {
  searchSentencesBar.oninput = loadSavedSentences;
}

// --- Clear all saved sentences button ---
const clearAllSentencesBtn = document.createElement('button');
clearAllSentencesBtn.id = 'clear-all-sentences';
clearAllSentencesBtn.title = 'Clear all saved sentences';
clearAllSentencesBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
clearAllSentencesBtn.style.display = 'none';
clearAllSentencesBtn.style.margin = '18px auto 0 auto';
clearAllSentencesBtn.onclick = () => {
  if (confirm('Are you sure you want to delete all saved sentences?')) {
    localStorage.removeItem('savedSentences');
    loadSavedSentences();
    showSnackbar('All saved sentences cleared');
  }
};
// Insert after saved sentences list
if (savedSentencesListEl && savedSentencesListEl.parentNode) {
  savedSentencesListEl.parentNode.insertBefore(clearAllSentencesBtn, savedSentencesListEl.nextSibling);
}

// --- Tab Switching Logic ---
if (tabRead && tabSpeak && readTabContent && speakTabContent) {
  tabRead.onclick = () => {
    tabRead.classList.add('active');
    tabSpeak.classList.remove('active');
    readTabContent.style.display = '';
    speakTabContent.style.display = 'none';
    // Show all settings options in Read tab
    const sentenceLangInputRow = document.getElementById('sentence-lang-input');
    const explanationLangInputRow = document.getElementById('explanation-lang-input');
    const categoryDropdown = document.getElementById('category-dropdown-container');
    const wordCountInput = document.getElementById('word-count');
    if (sentenceLangInputRow) sentenceLangInputRow.parentElement.style.display = '';
    if (explanationLangInputRow) explanationLangInputRow.style.display = '';
    if (categoryDropdown) categoryDropdown.style.display = '';
    if (wordCountInput) wordCountInput.style.display = '';
    // Show explanation icon
    const explanationIcons = document.querySelectorAll('.fa-comment-dots.language-icon');
    explanationIcons.forEach(icon => icon.style.display = '');
  };
  tabSpeak.onclick = () => {
    tabSpeak.classList.add('active');
    tabRead.classList.remove('active');
    readTabContent.style.display = 'none';
    speakTabContent.style.display = '';
    // Only show sentence language input in settings modal
    const sentenceLangInputRow = document.getElementById('sentence-lang-input');
    const explanationLangInputRow = document.getElementById('explanation-lang-input');
    const categoryDropdown = document.getElementById('category-dropdown-container');
    const wordCountInput = document.getElementById('word-count');
    if (sentenceLangInputRow) sentenceLangInputRow.parentElement.style.display = '';
    if (explanationLangInputRow) explanationLangInputRow.style.display = 'none';
    if (categoryDropdown) categoryDropdown.style.display = 'none';
    if (wordCountInput) wordCountInput.style.display = 'none';
    // Hide explanation icon
    const explanationIcons = document.querySelectorAll('.fa-comment-dots.language-icon');
    explanationIcons.forEach(icon => icon.style.display = 'none');
  };
}

// --- Speak Tab Logic ---
let recognition = null;
let recognizing = false;
let lastTranscript = '';

if (speakRecordBtn && speakTranscript && speakCheckBtn && speakFeedback) {
  // Hide check button initially
  speakCheckBtn.style.display = 'none';
  speakTranscript.textContent = '';
  speakFeedback.textContent = '';

  // Speech Recognition setup
  function getSpeechRecognition() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  // Helper to get language code for SpeechRecognition
  function getSpeechRecognitionLang() {
    if (!sentenceLangInput) return 'en-US';
    const lang = sentenceLangInput.value.trim().toLowerCase();
    const langMap = {
      'english': 'en-US',
      'spanish': 'es-ES',
      'french': 'fr-FR',
      'hindi': 'hi-IN',
      'german': 'de-DE',
      'italian': 'it-IT',
      'russian': 'ru-RU',
      'chinese': 'zh-CN',
      'japanese': 'ja-JP',
      'korean': 'ko-KR',
      // add more as needed
    };
    if (langMap[lang]) return langMap[lang];
    // Try startsWith for language codes
    if (lang.startsWith('en')) return 'en-US';
    if (lang.startsWith('es')) return 'es-ES';
    if (lang.startsWith('fr')) return 'fr-FR';
    if (lang.startsWith('hi')) return 'hi-IN';
    if (lang.startsWith('de')) return 'de-DE';
    if (lang.startsWith('it')) return 'it-IT';
    if (lang.startsWith('ru')) return 'ru-RU';
    if (lang.startsWith('zh')) return 'zh-CN';
    if (lang.startsWith('ja')) return 'ja-JP';
    if (lang.startsWith('ko')) return 'ko-KR';
    return 'en-US';
  }

  speakRecordBtn.onclick = () => {
    if (recognizing) {
      recognition.stop();
      return;
    }
    const SR = getSpeechRecognition();
    if (!SR) {
      showSnackbar('Speech recognition not supported in this browser.');
      return;
    }
    recognition = new SR();
    recognition.lang = getSpeechRecognitionLang();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognizing = true;
    speakTranscript.textContent = 'Listening...';
    speakFeedback.textContent = '';
    speakCheckBtn.style.display = 'none';
    speakRecordBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      lastTranscript = transcript;
      speakTranscript.textContent = transcript;
      speakCheckBtn.style.display = '';
      recognizing = false;
      speakRecordBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    };
    recognition.onerror = (event) => {
      speakTranscript.textContent = '';
      speakCheckBtn.style.display = 'none';
      recognizing = false;
      speakRecordBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
      showSnackbar('Speech recognition error. Try again.');
    };
    recognition.onend = () => {
      if (recognizing) {
        recognizing = false;
        speakRecordBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        if (!lastTranscript) {
          speakTranscript.textContent = '';
          speakCheckBtn.style.display = 'none';
        }
      }
    };
    recognition.start();
  };

  speakCheckBtn.onclick = async () => {
    const sentence = lastTranscript;
    if (!sentence) {
      showSnackbar('No sentence to check.');
      return;
    }
    speakFeedback.textContent = 'Checking...';
    const apiKey = getNextApiKey ? getNextApiKey() : null;
    if (!apiKey) {
      speakFeedback.textContent = 'Please add at least one API key in settings.';
      return;
    }
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
    let lang = 'English';
    if (sentenceLangInput && sentenceLangInput.value.trim()) {
      lang = sentenceLangInput.value.trim();
    }
    const prompt = `"${sentence}". Is this a correct ${lang} sentence for *spoken* conversation? Ignore all spelling, capitalization, punctuation, accents, and number formatting (numerals or words). Only focus on grammar, word order, and vocabulary used in casual speech. Do not mention or correct spelling, punctuation, accents, or number formatting. Do not change the script (Devanagari or Latin) of the sentence. If the input is in Devanagari, return the correction in Devanagari. If the input is in Latin, return in Latin. If the sentence is natural for speaking, return it as-is. If it's wrong, return only the corrected version, no extra comments. Be concise.`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await response.json();
      let feedback = '';
      try {
        feedback = data.candidates[0].content.parts[0].text.trim();
      } catch {
        feedback = "Sorry, couldn't get feedback.";
      }
      // Format markdown-like bold (**text**) and newlines
      let formatted = feedback.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      formatted = formatted.replace(/\n/g, '<br>');

      // --- Post-processing: compare normalized input and correction ---
      function normalizeText(str) {
        return str
          .toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
          .replace(/[.,\/#!$%^&*;:{}=\-_`~()?¿¡\"'’]/g, '') // remove punctuation
          .replace(/\s+/g, ' ') // collapse whitespace
          .trim();
      }
      // Try to extract only the corrected sentence from Gemini's response
      let corrected = '';
      // Look for: The correct sentence is "..."
      const match1 = feedback.match(/correct (sentence|version) is\s*[:\-]?\s*"([^"]+)"/i);
      if (match1) {
        corrected = match1[2];
      } else {
        // Look for: "..." (first quoted string)
        const match2 = feedback.match(/"([^"]+)"/);
        if (match2) {
          corrected = match2[1];
        } else {
          // Fallback: just show the whole feedback
          corrected = feedback;
        }
      }
      // Compare normalized input and correction
      const normInput = normalizeText(lastTranscript || '');
      const normCorrection = normalizeText(corrected || '');
      if (normInput && normCorrection && normInput === normCorrection) {
        // Show green tick (correct)
        speakFeedback.innerHTML = `<div class=\"feedback-centered-box\" style=\"padding:24px 0 18px 0;text-align:center;\">\
          <span class=\"feedback-animated-icon tick\">\
            <svg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>\
              <circle cx='24' cy='24' r='22' stroke='#4CAF50' stroke-width='4' fill='none'/>\
              <path d='M14 25.5L22 33L34 17' stroke='#4CAF50' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/>\
            </svg>\
          </span>\
        </div>`;
      } else {
        // Show red cross and correction
        speakFeedback.innerHTML = `<div class=\"feedback-centered-box\" style=\"padding:24px 0 18px 0;text-align:center;\">\
          <span class=\"feedback-animated-icon cross\">\
            <svg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>\
              <circle cx='24' cy='24' r='22' stroke='#e74c3c' stroke-width='4' fill='none'/>\
              <path d='M17 17L31 31M31 17L17 31' stroke='#e74c3c' stroke-width='4' stroke-linecap='round'/>\
            </svg>\
          </span>\
          <div style='margin-top:18px;font-size:1.15em;font-weight:600;color:#ffd700;'>${corrected}</div>\
        </div>`;
      }
      // Add fade-in animation and box style
      const style = document.createElement('style');
      style.innerHTML = `
        .feedback-animated-icon { display:inline-block; vertical-align:middle; animation: fadeInScale 0.7s cubic-bezier(.4,2,.6,1) both; }
        @keyframes fadeInScale { from { opacity:0; transform:scale(0.7);} to { opacity:1; transform:scale(1);} }
        .feedback-centered-box { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px 0 18px 0; }
      `;
      document.head.appendChild(style);
    } catch (e) {
      speakFeedback.textContent = 'Error contacting Gemini API.';
    }
  };
}