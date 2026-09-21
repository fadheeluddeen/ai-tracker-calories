(function () {
  const views = {
    home: document.getElementById('view-home'),
    camera: document.getElementById('view-camera'),
    result: document.getElementById('view-result'),
  };

  function showView(name) {
    Object.entries(views).forEach(([key, el]) => {
      el.hidden = key !== name;
    });
  }

  function fmt(n) {
    return (n ?? 0).toLocaleString();
  }

  // ── HOME ──────────────────────────────────────────────────
  async function loadToday() {
    document.getElementById('home-date').textContent = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    try {
      const res = await fetch('/api/meals/today');
      if (!res.ok) throw new Error(`server responded ${res.status}`);
      const data = await res.json();
      renderTotals(data.totals);
      renderMealList(data.meals);
    } catch (err) {
      console.error('failed to load today:', err);
    }
  }

  function renderTotals(totals) {
    document.getElementById('total-calories').textContent = fmt(totals.calories);
    document.getElementById('total-protein').textContent = `${fmt(totals.protein_g)}g`;
    document.getElementById('total-carbs').textContent = `${fmt(totals.carbs_g)}g`;
    document.getElementById('total-fat').textContent = `${fmt(totals.fat_g)}g`;
  }

  function renderMealList(meals) {
    const list = document.getElementById('meal-list');
    const empty = document.getElementById('empty-state');

    list.querySelectorAll('.meal-row').forEach((el) => el.remove());

    if (!meals.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    for (const meal of meals) {
      const li = document.createElement('li');
      li.className = 'meal-row glass' + (meal.analysis_failed ? ' is-failed' : '');

      const time = new Date(meal.created_at).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      });

      li.innerHTML = `
        <img class="meal-thumb" src="/${meal.photo_disk_path}" alt="" />
        <div class="meal-info">
          <div class="meal-name">${escapeHtml(meal.food_name || 'Unidentified meal')}</div>
          <div class="meal-meta">${time}</div>
        </div>
        <div class="meal-kcal">${meal.analysis_failed ? 'not analyzed' : `${fmt(meal.calories)} kcal`}</div>
      `;
      list.appendChild(li);
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── CAMERA ────────────────────────────────────────────────
  const cameraInput = document.getElementById('camera-input');
  const cameraPreview = document.getElementById('camera-preview');
  const cameraSubmit = document.getElementById('camera-submit');
  const loadingOverlay = document.getElementById('loading-overlay');
  let selectedFile = null;

  document.getElementById('open-camera').addEventListener('click', () => {
    selectedFile = null;
    cameraInput.value = '';
    cameraPreview.innerHTML = '<span class="camera-placeholder">No photo yet</span>';
    cameraSubmit.disabled = true;
    showView('camera');
  });

  document.getElementById('camera-back').addEventListener('click', () => showView('home'));

  cameraInput.addEventListener('change', () => {
    const file = cameraInput.files[0];
    if (!file) return;
    selectedFile = file;
    cameraPreview.innerHTML = '';
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    cameraPreview.appendChild(img);
    cameraSubmit.disabled = false;
  });

  cameraSubmit.addEventListener('click', async () => {
    if (!selectedFile) return;
    loadingOverlay.hidden = false;
    cameraSubmit.disabled = true;

    const formData = new FormData();
    formData.append('photo', selectedFile);

    try {
      const res = await fetch('/api/meals', { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`server responded ${res.status}`);
      const meal = await res.json();
      showResult(meal);
    } catch (err) {
      console.error('upload failed:', err);
      alert("Couldn't reach the server — check your connection and try again.");
      cameraSubmit.disabled = false;
    } finally {
      loadingOverlay.hidden = true;
    }
  });

  // ── RESULT ────────────────────────────────────────────────
  function showResult(meal) {
    document.getElementById('result-photo').src = `/${meal.photo_disk_path}`;
    document.getElementById('result-name').textContent = meal.food_name || 'Unidentified meal';
    document.getElementById('result-calories').textContent = fmt(meal.calories);
    document.getElementById('result-protein').textContent = `${fmt(meal.protein_g)}g`;
    document.getElementById('result-carbs').textContent = `${fmt(meal.carbs_g)}g`;
    document.getElementById('result-fat').textContent = `${fmt(meal.fat_g)}g`;

    const confidenceBadge = document.getElementById('result-confidence');
    const providerBadge = document.getElementById('result-provider');
    const failedNote = document.getElementById('result-failed-note');

    if (meal.analysis_failed) {
      confidenceBadge.textContent = 'Not analyzed';
      providerBadge.hidden = true;
      failedNote.hidden = false;
    } else {
      confidenceBadge.textContent = `${meal.confidence} confidence`;
      providerBadge.textContent = `via ${meal.provider}`;
      providerBadge.hidden = false;
      failedNote.hidden = true;
    }

    showView('result');
  }

  document.getElementById('result-close').addEventListener('click', backToHome);
  document.getElementById('result-done').addEventListener('click', backToHome);

  function backToHome() {
    showView('home');
    loadToday();
  }

  // ── boot ──────────────────────────────────────────────────
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  loadToday();
})();
