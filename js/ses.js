// Novarge – sesli okuma (konuşma sentezi), ses tanıma ve efektler
(function () {
  const sentez = window.speechSynthesis;
  let trSes = null;

  function sesSec() {
    if (!sentez) return;
    const sesler = sentez.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith('tr'));
    // Varsa daha doğal (Google / Online / Natural) sesleri tercih et
    trSes = sesler.find((v) => /google|natural|online/i.test(v.name)) || sesler[0] || null;
  }
  if (sentez) {
    sesSec();
    sentez.onvoiceschanged = sesSec;
  }

  N.sesVarMi = () => !!sentez;
  N.trSesVarMi = () => !!trSes;

  // Metni Türkçe seslendirir; bitince çözülen bir Promise döner
  // Ekran değişince eski konuşma zincirleri (await N.soyle → sonraki adım) devam etmesin
  let nesil = 0;

  N.soyle = function (metin, hiz) {
    const benim = nesil;
    return new Promise((tamam) => {
      const coz = () => { if (benim === nesil) tamam(); };
      if (!sentez) return coz();
      sentez.cancel();
      const u = new SpeechSynthesisUtterance(metin);
      u.lang = 'tr-TR';
      if (trSes) u.voice = trSes;
      u.rate = hiz || N.ayar.konusmaHizi;
      u.pitch = 1.15;
      let bitti = false;
      const son = () => { if (!bitti) { bitti = true; coz(); } };
      u.onend = son;
      u.onerror = son;
      // Bazı tarayıcılarda onend tetiklenmeyebilir
      setTimeout(son, 600 + metin.length * 160);
      sentez.speak(u);
    });
  };

  N.sustur = () => {
    nesil++;
    if (sentez) sentez.cancel();
  };

  // Harfi çocuğa uygun şekilde seslendir: "e... e harfi... elma"
  N.harfiSoyle = function (harf) {
    const [kelime] = N.HARF_ORNEK[harf] || [''];
    return N.soyle(`${harf}. ${harf} harfi. ${kelime}`);
  };

  // --- Ses tanıma ---
  const Tanima = window.SpeechRecognition || window.webkitSpeechRecognition;
  N.dinlemeVarMi = () => !!Tanima;

  // Çocuğu dinler, olası metinleri (alternatifleri) döner
  N.dinle = function () {
    return new Promise((coz, reddet) => {
      if (!Tanima) return reddet(new Error('destek-yok'));
      if (sentez) sentez.cancel();
      const t = new Tanima();
      t.lang = 'tr-TR';
      t.interimResults = false;
      t.maxAlternatives = 5;
      let sonuc = [];
      t.onresult = (e) => {
        sonuc = Array.from(e.results[0]).map((a) => a.transcript);
      };
      t.onerror = (e) => reddet(new Error(e.error || 'hata'));
      t.onend = () => coz(sonuc);
      t.start();
    });
  };

  const sade = (s) => N.kucuk(s).replace(/[^a-zçğıöşü ]/g, '').replace(/\s+/g, ' ').trim();

  function benzerlik(a, b) {
    const m = a.length, n = b.length;
    if (!m || !n) return 0;
    const d = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return 1 - d[m][n] / Math.max(m, n);
  }

  // Söylenen, hedefe yeterince yakın mı? (çocuk telaffuzuna toleranslı)
  N.dogruSoylendiMi = function (hedef, alternatifler) {
    const h = sade(hedef);
    let enIyi = 0;
    for (const alt of alternatifler) {
      const s = sade(alt);
      if (s === h || s.split(' ').includes(h) || s.includes(h)) return { dogru: true, puan: 1 };
      enIyi = Math.max(enIyi, benzerlik(s, h));
    }
    return { dogru: enIyi >= 0.7, puan: enIyi };
  };

  // --- Basit efektler (WebAudio) ---
  let ctx = null;
  function ton(frekanslar, sure, tip) {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      let t = ctx.currentTime;
      for (const f of frekanslar) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = tip || 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + sure);
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t + sure);
        t += sure * 0.7;
      }
    } catch (_) { /* ses kapalı olabilir */ }
  }
  // Mobil tarayıcılar sesi ancak bir dokunuştan sonra açar: ilk dokunuşta çağrılır
  N.sesKilidiAc = function () {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    } catch (_) { /* yok say */ }
    if (sentez) {
      sesSec();
      if (sentez.paused) sentez.resume();
    }
  };

  N.efekt = {
    dogru: () => ton([523, 659, 784], 0.18),
    yanlis: () => ton([220, 180], 0.2, 'triangle'),
    tik: () => ton([880], 0.06),
    kutlama: () => ton([523, 659, 784, 1047], 0.2),
  };
})();
