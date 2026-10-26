    // ㄅㄆㄇ Data Dictionary
    const zhuyinData = [
      // Initials (聲母)
      { symbol: "ㄅ", word: "爸爸", emoji: "👨", type: "initial" },
      { symbol: "ㄆ", word: "蘋果", emoji: "🍎", type: "initial" },
      { symbol: "ㄇ", word: "貓咪", emoji: "🐱", type: "initial" },
      { symbol: "ㄈ", word: "飛機", emoji: "✈️", type: "initial" },
      { symbol: "ㄉ", word: "大象", emoji: "🐘", type: "initial" },
      { symbol: "ㄊ", word: "兔子", emoji: "🐰", type: "initial" },
      { symbol: "ㄋ", word: "牛奶", emoji: "🥛", type: "initial" },
      { symbol: "ㄌ", word: "老虎", emoji: "🐯", type: "initial" },
      { symbol: "ㄍ", word: "哥哥", emoji: "🧒", type: "initial" },
      { symbol: "ㄎ", word: "恐龍", emoji: "🦖", type: "initial" },
      { symbol: "ㄏ", word: "猴子", emoji: "🐒", type: "initial" },
      { symbol: "ㄐ", word: "雞蛋", emoji: "🥚", type: "initial" },
      { symbol: "ㄑ", word: "氣球", emoji: "🎈", type: "initial" },
      { symbol: "ㄒ", word: "香蕉", emoji: "🍌", type: "initial" },
      { symbol: "ㄓ", word: "蜘蛛", emoji: "🕷️", type: "initial" },
      { symbol: "ㄔ", word: "汽車", emoji: "🚗", type: "initial" },
      { symbol: "ㄕ", word: "獅子", emoji: "🦁", type: "initial" },
      { symbol: "ㄖ", word: "日光", emoji: "☀️", type: "initial" },
      { symbol: "ㄗ", word: "盤子", emoji: "🍽️", type: "initial" },
      { symbol: "ㄘ", word: "刺蝟", emoji: "🦔", type: "initial" },
      { symbol: "ㄙ", word: "三明治", emoji: "🥪", type: "initial" },

      // Medials (介母)
      { symbol: "ㄧ", word: "衣服", emoji: "👕", type: "medial" },
      { symbol: "ㄨ", word: "烏龜", emoji: "🐢", type: "medial" },
      { symbol: "ㄩ", word: "金魚", emoji: "🐠", type: "medial" },

      // Finals (韻母)
      { symbol: "ㄚ", word: "鴨子", emoji: "🦆", type: "final" },
      { symbol: "ㄛ", word: "蘑菇", emoji: "🍄", type: "final" },
      { symbol: "ㄜ", word: "鵝", emoji: "🦢", type: "final" },
      { symbol: "ㄝ", word: "椰子", emoji: "🥥", type: "final" },
      { symbol: "ㄞ", word: "愛心", emoji: "❤️", type: "final" },
      { symbol: "ㄟ", word: "水", emoji: "🫗", type: "final" },
      { symbol: "ㄠ", word: "烤雞腿", emoji: "🍗", type: "final" },
      { symbol: "ㄡ", word: "海鷗", emoji: "🕊️", type: "final" },
      { symbol: "ㄢ", word: "飯糰", emoji: "🍙", type: "final" },
      { symbol: "ㄣ", word: "門", emoji: "🚪", type: "final" },
      { symbol: "ㄤ", word: "太陽", emoji: "🌞", type: "final" },
      { symbol: "ㄥ", word: "櫻桃", emoji: "🍒", type: "final" },
      { symbol: "ㄦ", word: "耳朵", emoji: "👂", type: "final" }
    ];

    let currentScore = 0;
    let currentQuizTarget = null;
    let currentPicTarget = null;
    let activeModalItem = null;

    // Speech Synthesis helper
    function speak(text) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-TW';
        utterance.rate = 0.85; // Slightly slower for clarity
        utterance.pitch = 1.1; // Slightly higher pitch for child friendliness
        window.speechSynthesis.speak(utterance);
      }
    }
    // Speech Synthesis helper - English
    function speak_en(text) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85; // Slightly slower for clarity
        utterance.pitch = 1.0; // Slightly higher pitch for child friendliness
        window.speechSynthesis.speak(utterance);
      }
    }

    // Audio synth for feedback sounds (Web Audio API)
    function playBeep(type) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'correct') {
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
          osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } else {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch (e) {
        // Fallback silently if audio context is blocked
      }
    }

    // Render Zhuyin Board
    function renderBoard() {
      const initialsGrid = document.getElementById('initials-grid');
      const medialsGrid = document.getElementById('medials-grid');
      const finalsGrid = document.getElementById('finals-grid');

      initialsGrid.innerHTML = '';
      medialsGrid.innerHTML = '';
      finalsGrid.innerHTML = '';

      zhuyinData.forEach(item => {
        const card = document.createElement('button');
        card.className = "card-pop bg-white border-2 border-amber-200 hover:border-amber-400 rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-sm active:bg-amber-100 transition focus:outline-none";

        let colorClass = "text-amber-600";
        if (item.type === "medial") colorClass = "text-teal-600";
        if (item.type === "final") colorClass = "text-rose-600";

        card.innerHTML = `
          <span class="text-2xl sm:text-3xl font-black ${colorClass}">${item.symbol}</span>
          <span class="text-lg mt-1">${item.emoji}</span>
          <span class="text-[10px] sm:text-xs text-slate-500 font-bold">${item.word}</span>
        `;

        card.onclick = () => showDetailModal(item);

        if (item.type === 'initial') initialsGrid.appendChild(card);
        else if (item.type === 'medial') medialsGrid.appendChild(card);
        else if (item.type === 'final') finalsGrid.appendChild(card);
      });
    }

    // Modal
    function showDetailModal(item) {
      activeModalItem = item;
      document.getElementById('modal-symbol').textContent = item.symbol;
      document.getElementById('modal-emoji').textContent = item.emoji;
      document.getElementById('modal-word').textContent = item.word;
      document.getElementById('detail-modal').classList.remove('hidden');

      // Speak symbol and word
      speak(`${item.symbol}，${item.word}`);
    }

    function closeModal() {
      document.getElementById('detail-modal').classList.add('hidden');
    }

    function playModalSound() {
      if (activeModalItem) {
        speak(`${activeModalItem.symbol}，${activeModalItem.word}`);
      }
    }

    // Tab Switching
    function switchTab(tab) {
      ['board', 'quiz', 'picture'].forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        const sec = document.getElementById(`mode-${t}`);
        if (t === tab) {
          btn.className = "tab-btn flex-1 py-2 px-3 text-center rounded-xl font-bold text-sm sm:text-base bg-amber-500 text-white shadow-sm transition";
          sec.classList.remove('hidden');
        } else {
          btn.className = "tab-btn flex-1 py-2 px-3 text-center rounded-xl font-bold text-sm sm:text-base text-amber-700 hover:bg-amber-100 transition";
          sec.classList.add('hidden');
        }
      });

      if (tab === 'quiz') generateQuizQuestion();
      if (tab === 'picture') generatePictureQuestion();
    }

    // --- Quiz 1: Listening Quiz ---
    function generateQuizQuestion() {
      document.getElementById('quiz-feedback').innerHTML = '';

      // Choose random target
      const target = zhuyinData[Math.floor(Math.random() * zhuyinData.length)];
      currentQuizTarget = target;

      // Choose 3 random wrong options
      let options = [target];
      while (options.length < 4) {
        const rand = zhuyinData[Math.floor(Math.random() * zhuyinData.length)];
        if (!options.some(o => o.symbol === rand.symbol)) {
          options.push(rand);
        }
      }

      // Shuffle options
      options.sort(() => Math.random() - 0.5);

      const optionsGrid = document.getElementById('quiz-options');
      optionsGrid.innerHTML = '';

      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = "card-pop bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-2xl py-4 text-3xl font-black text-amber-800 shadow-md active:bg-amber-200 transition";
        btn.textContent = opt.symbol;
        btn.onclick = () => checkQuizAnswer(opt.symbol, btn);
        optionsGrid.appendChild(btn);
      });

      // Play target sound after short delay
      setTimeout(() => playQuizSound(), 300);
    }

    function playQuizSound() {
      if (currentQuizTarget) {
        speak(currentQuizTarget.symbol);
      }
    }

    function checkQuizAnswer(selectedSymbol, btnElement) {
      const feedback = document.getElementById('quiz-feedback');

      if (selectedSymbol === currentQuizTarget.symbol) {
        playBeep('correct');
        speak_en("Correct！Excellent！");
        feedback.innerHTML = `<span class="text-emerald-500">🎉 Correct！ +10 分</span>`;
        btnElement.classList.add('bg-emerald-200', 'border-emerald-500', 'animate-success');

        currentScore += 10;
        document.getElementById('score-display').textContent = currentScore;

        setTimeout(() => generateQuizQuestion(), 1200);
      } else {
        playBeep('wrong');
        speak_en("Let's try again！");
        feedback.innerHTML = `<span class="text-rose-500">❌ Let's try again！</span>`;
        btnElement.classList.add('bg-rose-100', 'border-rose-400', 'animate-error');
      }
    }

    // --- Quiz 2: Picture Quiz ---
    function generatePictureQuestion() {
      document.getElementById('pic-feedback').innerHTML = '';

      // Choose random target
      const target = zhuyinData[Math.floor(Math.random() * zhuyinData.length)];
      currentPicTarget = target;

      document.getElementById('pic-emoji').textContent = target.emoji;
      document.getElementById('pic-word').textContent = target.word;

      // Choose 3 random wrong options
      let options = [target];
      while (options.length < 4) {
        const rand = zhuyinData[Math.floor(Math.random() * zhuyinData.length)];
        if (!options.some(o => o.symbol === rand.symbol)) {
          options.push(rand);
        }
      }

      options.sort(() => Math.random() - 0.5);

      const optionsGrid = document.getElementById('picture-options');
      optionsGrid.innerHTML = '';

      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = "card-pop bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 rounded-2xl py-4 text-3xl font-black text-rose-800 shadow-md active:bg-rose-200 transition";
        btn.textContent = opt.symbol;
        btn.onclick = () => checkPictureAnswer(opt.symbol, btn);
        optionsGrid.appendChild(btn);
      });

      speakCurrentPicWord();
    }

    function speakCurrentPicWord() {
      if (currentPicTarget) {
        speak(currentPicTarget.word);
      }
    }

    function checkPictureAnswer(selectedSymbol, btnElement) {
      const feedback = document.getElementById('pic-feedback');

      if (selectedSymbol === currentPicTarget.symbol) {
        playBeep('correct');
        speak_en(`Correct!`);
        feedback.innerHTML = `<span class="text-emerald-500">🎉 Awesome！ +10 points</span>`;
        btnElement.classList.add('bg-emerald-200', 'border-emerald-500', 'animate-success');

        currentScore += 10;
        document.getElementById('score-display').textContent = currentScore;

        setTimeout(() => generatePictureQuestion(), 1400);
      } else {
        playBeep('wrong');
        speak_en("Let's try again！");
        feedback.innerHTML = `<span class="text-rose-500">❌ Let's try again！</span>`;
        btnElement.classList.add('bg-rose-100', 'border-rose-400', 'animate-error');
      }
    }

    // Initialize Page
    document.addEventListener('DOMContentLoaded', () => {
      renderBoard();
    });
