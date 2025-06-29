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
};

// Enter key to add API key
document.getElementById('new-api-key').onkeypress = (e) => {
  if (e.key === 'Enter') {
    addApiKey();
  }
};

sentenceTypeSelect.onchange = function() {
  if (sentenceTypeSelect.value === 'custom') {
    customPromptInput.style.display = '';
  } else {
    customPromptInput.style.display = 'none';
  }
};

async function getRandomSentence() {
  const apiKey = getNextApiKey();
  if (!apiKey) {
    return "Please add at least one API key in settings (click the key icon in the top right).";
  }
  
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

  const wordCount = wordCountSelect.value;
  let wordCountInstruction = "";
  if (wordCount === 'short') {
    wordCountInstruction = "Make it short (5-10 words). ";
  } else if (wordCount === 'medium') {
    wordCountInstruction = "Make it medium length (10-20 words). ";
  } else if (wordCount === 'long') {
    wordCountInstruction = "Make it long (20-30 words). ";
  }

  // Add a random seed for uniqueness
  const randomSeed = Math.floor(Math.random() * 1000000) + '-' + Date.now();
  const seedInstruction = `Use this random seed for uniqueness: [${randomSeed}].`;
  
  // Add simple context for variety without being too random
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

  let prompt = `Give me one simple, natural English sentence that people actually use in everyday conversations. ${wordCountInstruction}${seedInstruction} ${contextInstruction} Make it casual and conversational - like what friends, family, or colleagues would say to each other. Use simple, common words that everyone knows. Write exactly how people talk in real conversations. Make it practical and meaningful. Only output the sentence, nothing else.`;
  const type = sentenceTypeSelect.value;
  
  // Debug logging
  console.log('Selected type:', type);
  console.log('Word count:', wordCount);
  
  if (type === 'vocab') {
    prompt = `Give me one natural English sentence that uses slightly more interesting vocabulary but is still conversational. ${wordCountInstruction}${seedInstruction} ${contextInstruction} Use words that are a bit more advanced than basic but still commonly used in everyday speech. Include maybe one or two interesting words or phrases that people actually use in conversations. Keep it natural and practical. Only output the sentence, nothing else.`;
    console.log('Using vocab prompt');
  } else if (type === 'indian') {
    prompt = `Give me one simple, correct English sentence that you think i might be saying wrong. ${wordCountInstruction}${seedInstruction} ${contextInstruction} Make it conversational and natural - like what people actually say in daily life. Focus on common mistakes with articles, prepositions, verb tenses, or word order that Indian speakers make. Use simple, everyday language. Make it practical and meaningful. Only output the correct sentence, nothing else.`;
    console.log('Using indian prompt');
  } else if (type === 'custom') {
    const custom = customPromptInput.value.trim();
    if (!custom) {
      showSnackbar('Please enter your custom prompt.');
      return '';
    }
    prompt = `Generate a sentence similar to this example: "${custom}". ${wordCountInstruction}${seedInstruction} ${contextInstruction} Make it similar in style, topic, or structure to the example sentence. Keep it conversational and natural - like what people actually say in everyday conversations. Use common words and natural language. Make it practical and meaningful. Only output the new sentence, nothing else.`;
    console.log('Using custom prompt with:', custom);
  } else {
    console.log('Using general prompt (default)');
  }

  console.log('Final prompt:', prompt);

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
  const prompt = `Explain this English sentence in simple, clear terms that a language learner can easily understand. Keep it short and direct. Only output the explanation, nothing else: ${englishSentence}`;
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
  const prompt = `Analyze this English sentence and explain the key words/phrases in simple terms. Focus on important vocabulary, idioms, phrasal verbs, or complex words. Format as bullet points with short, clear explanations. Use this exact format:
• "word/phrase" - explanation
• "word/phrase" - explanation
Only output the bullet points, nothing else: ${englishSentence}`;
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
    // Ensure proper formatting if the AI doesn't format correctly
    if (!result.includes('•')) {
      // If no bullet points, try to format the response
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
const clearAllBtn = document.getElementById("clear-all");

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
    </div>
  `;
  const playpauseBtn = unsavedAudioContainer.querySelector('.playpause');
  const slider = unsavedAudioContainer.querySelector('.audio-slider');
  const timeDisplay = unsavedAudioContainer.querySelector('.audio-time');

  audio.addEventListener('loadedmetadata', () => {
    duration = audio.duration;
    timeDisplay.textContent = `0:00 / ${formatTime(duration)}`;
    slider.max = Math.floor(duration);
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
  const sentence = await getRandomSentence();
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
    recordBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Stop';
    recordBtn.classList.add('recording', 'recording-active');
    saveBtn.disabled = true;
    showSnackbar("Recording started");
  } else {
    // Stop recording
    mediaRecorder.stop();
    isRecording = false;
    recordBtn.innerHTML = '<i class="fa-solid fa-microphone"></i> Record';
    recordBtn.classList.remove('recording', 'recording-active');
  }
};

// --- Save Recording Locally ---
saveBtn.onclick = () => {
  const sentence = sentenceEl.textContent;
  const timestamp = new Date().toLocaleString();
  const reader = new FileReader();
  reader.onload = function() {
    const base64Audio = reader.result;
    const recording = { sentence, audio: base64Audio, timestamp };
    let recordings = JSON.parse(localStorage.getItem("recordings") || "[]");
    recordings.push(recording);
    localStorage.setItem("recordings", JSON.stringify(recordings));
    loadRecordings();
    showSnackbar("Recording saved");
    clearUnsavedAudioPlayer();
  };
  reader.readAsDataURL(audioBlob);
};

// --- Custom Audio Player for Recordings ---
function formatTime(sec) {
  sec = Math.floor(sec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

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
      <button class="speak-btn" title="Speak sentence"><i class="fa-solid fa-volume-up"></i></button>
    </div>
    <hr class="recording-divider">
    <div class="audio-player">
      <button class="playpause" aria-label="Play/Pause"><i class="fa-solid fa-play"></i></button>
      <input type="range" min="0" max="100" value="0" class="audio-slider" aria-label="Seek">
      <span class="audio-time">0:00 / 0:00</span>
      <button class="rename" title="Rename" aria-label="Rename"><i class="fa-solid fa-pen"></i></button>
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
    duration = audio.duration;
    timeDisplay.textContent = `0:00 / ${formatTime(duration)}`;
    slider.max = Math.floor(duration);
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

  // Also allow editing by clicking the sentence
  sentenceDiv.onclick = renameBtn.onclick;
  sentenceDiv.onkeydown = (e) => { if (e.key === 'Enter') renameBtn.onclick(); };

  recordingsList.appendChild(li);
}

function loadRecordings() {
  recordingsList.innerHTML = "";
  let recordings = JSON.parse(localStorage.getItem("recordings") || "[]");
  allRecordings = recordings;
  const recordingsSection = document.getElementById('recordings-section');
  const clearAllBtn = document.getElementById('clear-all');
  if (recordings.length === 0) {
    if (recordingsSection) recordingsSection.style.display = 'none';
    if (clearAllBtn) clearAllBtn.style.display = 'none';
  } else {
    if (recordingsSection) recordingsSection.style.display = '';
    if (clearAllBtn) clearAllBtn.style.display = '';
    filterAndDisplayRecordings();
  }
}

function filterAndDisplayRecordings() {
  const query = (searchBar.value || "").toLowerCase();
  recordingsList.innerHTML = "";
  let hasAny = false;
  allRecordings.forEach((rec, idx) => {
    if (
      rec.sentence.toLowerCase().includes(query) ||
      rec.timestamp.toLowerCase().includes(query)
    ) {
      addRecordingToList(rec, idx);
      hasAny = true;
    }
  });
  const recordingsSection = document.getElementById('recordings-section');
  const clearAllBtn = document.getElementById('clear-all');
  if (!hasAny) {
    if (recordingsSection) recordingsSection.style.display = 'none';
    if (clearAllBtn) clearAllBtn.style.display = 'none';
  } else {
    if (recordingsSection) recordingsSection.style.display = '';
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

// --- Init ---
window.onload = () => {
  loadApiKeys();
  loadRecordings();
};
