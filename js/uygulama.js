// Novarge – uygulama iskeleti: ilerleme, ayarlar, ekran yönetimi, ana menüler
(function () {
  const ANAHTAR = 'novarge-v1';

  // ---------- Kayıt ----------
  function yukle() {
    try {
      return JSON.parse(localStorage.getItem(ANAHTAR)) || {};
    } catch (_) {
      return {};
    }
  }
  const kayit = yukle();
  N.ilerleme = Object.assign({ yildiz: 0, harf: {}, kelimeYaz: {}, oyun: {} }, kayit.ilerleme);
  N.ayar = Object.assign({ konusmaHizi: 0.85, tumHarfler: false, ad: '' }, kayit.ayar);
  N.kaydet = () => {
    try {
      localStorage.setItem(ANAHTAR, JSON.stringify({ ilerleme: N.ilerleme, ayar: N.ayar }));
    } catch (_) { /* gizli mod vb. */ }
  };

  N.yildizVer = (adet = 1, oyun) => {
    N.ilerleme.yildiz += adet;
    if (oyun) N.ilerleme.oyun[oyun] = (N.ilerleme.oyun[oyun] || 0) + 1;
    N.kaydet();
    const y = document.querySelector('.yildiz-sayac b');
    if (y) y.textContent = N.ilerleme.yildiz;
  };

  // Çizilerek öğrenilmiş harfler
  N.ogrenilen = () => N.TUM_HARFLER.filter((h) => N.ilerleme.harf[h] && N.ilerleme.harf[h].kucuk);

  // Kilidi açık gruplar: bir grubun en az 4 harfi öğrenilince sonraki grup açılır
  N.acikGrupSayisi = () => {
    if (N.ayar.tumHarfler) return N.GRUPLAR.length;
    let acik = 1;
    for (let i = 0; i < N.GRUPLAR.length - 1; i++) {
      const bilinen = N.GRUPLAR[i].harfler.filter((h) => N.ilerleme.harf[h] && N.ilerleme.harf[h].kucuk).length;
      if (bilinen >= 4) acik = i + 2;
      else break;
    }
    return acik;
  };
  N.acikHarfler = () => N.GRUPLAR.slice(0, N.acikGrupSayisi()).flatMap((g) => g.harfler);

  // Çocuğun harf seviyesine uygun içerik havuzu
  function havuz(liste, metin, enAz) {
    const bilinen = new Set(N.acikHarfler());
    const puanli = liste.map((x) => {
      const harfler = N.harflerinden(metin(x));
      return { x, eksik: harfler.filter((h) => !bilinen.has(h)).length, uzunluk: harfler.length };
    });
    puanli.sort((a, b) => a.eksik - b.eksik || a.uzunluk - b.uzunluk);
    const tam = puanli.filter((p) => p.eksik === 0);
    return (tam.length >= enAz ? tam : puanli.slice(0, enAz + 2)).map((p) => p.x);
  }
  N.kelimeHavuzu = () => havuz(N.KELIMELER, (k) => k.kelime, 6);
  N.ekCumleler = [];
  N.cumleHavuzu = () => havuz(N.CUMLELER.concat(N.ekCumleler), (c) => c, 4);

  // ---------- Ekranlar ----------
  N.ekranlar = N.ekranlar || {};
  let temizlik = null;
  const app = () => document.getElementById('app');

  N.git = function (ad, param) {
    N.sustur();
    if (typeof temizlik === 'function') temizlik();
    temizlik = null;
    const kok = app();
    kok.innerHTML = '';
    kok.className = 'ekran ekran-' + ad;
    temizlik = N.ekranlar[ad](kok, param);
    window.scrollTo(0, 0);
  };

  // Üst çubuk
  N.ust = function (baslik, geri) {
    const d = document.createElement('header');
    d.className = 'ust';
    d.innerHTML = `
      ${geri ? '<button class="geri" aria-label="Geri">⬅</button>' : '<span class="logo">Novarge</span>'}
      <h1>${baslik}</h1>
      <span class="yildiz-sayac">⭐ <b>${N.ilerleme.yildiz}</b></span>`;
    if (geri) d.querySelector('.geri').onclick = () => N.git(geri[0], geri[1]);
    return d;
  };

  // Maskot Nova (baykuş) + konuşma balonu
  N.novaKutu = function (mesaj) {
    const d = document.createElement('div');
    d.className = 'nova';
    d.innerHTML = `<button class="nova-yuz" aria-label="Tekrar dinle">🦉</button><div class="balon"></div>`;
    d.querySelector('.balon').textContent = mesaj || '';
    return d;
  };
  N.novaDesin = function (mesaj, sesli = true) {
    const b = document.querySelector('.nova .balon');
    if (b) {
      b.textContent = mesaj;
      b.parentElement.classList.remove('zipla');
      void b.offsetWidth;
      b.parentElement.classList.add('zipla');
    }
    return sesli ? N.soyle(mesaj) : Promise.resolve();
  };

  // Kutlama: konfeti + sesli övgü
  N.kutla = function (ek) {
    N.efekt.kutlama();
    const k = document.createElement('div');
    k.className = 'konfeti';
    const parcalar = ['⭐', '🎉', '🌟', '✨', '🎈', '💖'];
    for (let i = 0; i < 26; i++) {
      const s = document.createElement('span');
      s.textContent = N.rastgele(parcalar);
      s.style.left = Math.random() * 100 + 'vw';
      s.style.animationDelay = Math.random() * 0.4 + 's';
      s.style.fontSize = 22 + Math.random() * 26 + 'px';
      k.appendChild(s);
    }
    document.body.appendChild(k);
    setTimeout(() => k.remove(), 2200);
    const ovgu = N.rastgele(N.OVGULER);
    return N.novaDesin(ek ? `${ovgu} ${ek}` : ovgu);
  };

  N.tesvik = function () {
    N.efekt.yanlis();
    return N.novaDesin(N.rastgele(N.TESVIKLER));
  };

  N.el = function (etiket, sinif, html) {
    const e = document.createElement(etiket);
    if (sinif) e.className = sinif;
    if (html != null) e.innerHTML = html;
    return e;
  };

  // ---------- Ana ekran ----------
  N.ekranlar.ana = function (kok) {
    kok.append(N.ust('Okuma Yazma'));
    const ad = N.ayar.ad ? `, ${N.ayar.ad}` : '';
    kok.append(N.novaKutu(`Merhaba${ad}! Ben Nova. Bugün ne öğrenelim?`));
    const kartlar = N.el('div', 'ana-kartlar');
    const bolumler = [
      ['yazMenu', '✏️', 'Yaz', 'Harfleri parmağınla çiz', 'turuncu'],
      ['okuMenu', '📖', 'Oku', 'Heceler, kelimeler, cümleler', 'yesil'],
      ['dinleMenu', '🎧', 'Dinle & Söyle', 'Duy, bul, sesli oku', 'mor'],
    ];
    bolumler.forEach(([hedef, ikon, baslik, alt, renk], i) => {
      const b = N.el('button', `ana-kart ${renk}`, `<span class="ikon">${ikon}</span><b>${i + 1}. ${baslik}</b><small>${alt}</small>`);
      b.onclick = () => { N.efekt.tik(); N.git(hedef); };
      kartlar.append(b);
    });
    kok.append(kartlar);
    const alt = N.el('div', 'alt-cubuk');
    const ebeveyn = N.el('button', 'kucuk-dugme', '👨‍👩‍👧 Ebeveyn');
    ebeveyn.onclick = () => N.git('ebeveyn');
    alt.append(ebeveyn);
    kok.append(alt);
    if (!N.trSesVarMi()) {
      kok.append(N.el('p', 'uyari', 'Bu cihazda Türkçe ses bulunamadı. Ayarlar → Dil → Metin okuma bölümünden Türkçe sesi yükleyebilirsiniz.'));
    }
    setTimeout(() => N.novaDesin(`Merhaba${ad}! Ben Nova. Bugün ne öğrenelim?`), 300);
  };

  function menu(kok, baslik, mesaj, ogeler) {
    kok.append(N.ust(baslik, ['ana']));
    kok.append(N.novaKutu(mesaj));
    const liste = N.el('div', 'menu-liste');
    for (const [hedef, ikon, ad, aciklama, param] of ogeler) {
      const b = N.el('button', 'menu-oge', `<span class="ikon">${ikon}</span><span><b>${ad}</b><small>${aciklama}</small></span>`);
      b.onclick = () => { N.efekt.tik(); N.git(hedef, param); };
      liste.append(b);
    }
    kok.append(liste);
    setTimeout(() => N.novaDesin(mesaj), 250);
  }

  N.ekranlar.okuMenu = (kok) => menu(kok, 'Oku', 'Harfleri birleştirip okumayı öğrenelim!', [
    ['hece', '🧩', 'Hece Yap', 'İki harfi birleştir: l + a = la'],
    ['kelimeKur', '🔤', 'Kelime Kur', 'Harfleri sırayla dizerek kelime yap'],
    ['cumleKur', '📝', 'Cümle Kur', 'Kelimeleri dizerek cümle kur'],
  ]);

  N.ekranlar.dinleMenu = (kok) => menu(kok, 'Dinle & Söyle', 'Kulaklarını aç, sesini hazırla!', [
    ['harfAvi', '🔎', 'Harf Avı', 'Duyduğun harfi bul'],
    ['hangisi', '👂', 'Ne Duydun?', 'Duyduğun kelimenin resmini bul'],
    ['sesliOku', '🎤', 'Sesli Oku', 'Kelimeyi yüksek sesle oku', 'kelime'],
    ['sesliOku', '🗣️', 'Cümle Oku', 'Cümleyi yüksek sesle oku', 'cumle'],
  ]);

  // ---------- Yaz menüsü: harf seçimi ----------
  N.ekranlar.yazMenu = function (kok) {
    kok.append(N.ust('Yaz', ['ana']));
    kok.append(N.novaKutu('Bir harf seç ve parmağınla üzerinden çiz!'));
    const acik = N.acikGrupSayisi();
    N.GRUPLAR.forEach((g, gi) => {
      const bolum = N.el('section', 'grup' + (gi >= acik ? ' kilitli' : ''));
      bolum.innerHTML = `<h2 style="color:${g.renk}">${gi >= acik ? '🔒 ' : ''}${g.ad}</h2>`;
      const izgara = N.el('div', 'harf-izgara');
      for (const h of g.harfler) {
        const d = N.ilerleme.harf[h] || {};
        const yildiz = (d.kucuk ? 1 : 0) + (d.buyuk ? 1 : 0);
        const b = N.el('button', 'harf-tus', `<span>${h}</span><small>${'⭐'.repeat(yildiz) || '&nbsp;'}</small>`);
        b.style.setProperty('--renk', g.renk);
        b.disabled = gi >= acik;
        b.onclick = () => N.git('ciz', { harf: h });
        izgara.append(b);
      }
      bolum.append(izgara);
      kok.append(bolum);
    });
    const kelime = N.el('button', 'menu-oge', '<span class="ikon">🖍️</span><span><b>Kelime Yaz</b><small>Bildiğin harflerle kelime çiz</small></span>');
    kelime.onclick = () => N.git('kelimeYaz');
    kok.append(kelime);
    setTimeout(() => N.novaDesin('Bir harf seç ve parmağınla üzerinden çiz!'), 250);
  };

  // ---------- Ebeveyn paneli ----------
  N.ekranlar.ebeveyn = function (kok) {
    kok.append(N.ust('Ebeveyn Paneli', ['ana']));
    const ogr = N.ogrenilen();
    const o = N.ilerleme.oyun;
    const p = N.el('div', 'panel');
    p.innerHTML = `
      <section class="kart">
        <h2>İlerleme</h2>
        <p>Toplam yıldız: <b>${N.ilerleme.yildiz}</b></p>
        <p>Öğrenilen harfler (${ogr.length}/${N.TUM_HARFLER.length}): <b class="harf-liste">${ogr.join(' ') || '—'}</b></p>
        <p>Hece: ${o.hece || 0} · Kelime kurma: ${o.kelime || 0} · Cümle kurma: ${o.cumle || 0}</p>
        <p>Harf avı: ${o.harfAvi || 0} · Dinleme: ${o.dinle || 0} · Sesli okuma: ${o.soyle || 0} · Kelime yazma: ${o.kelimeYaz || 0}</p>
      </section>
      <section class="kart">
        <h2>Ayarlar</h2>
        <label>Çocuğun adı <input id="ad" maxlength="20" value="${N.ayar.ad.replace(/"/g, '')}"></label>
        <label>Konuşma hızı <input id="hiz" type="range" min="0.5" max="1.2" step="0.05" value="${N.ayar.konusmaHizi}"></label>
        <label class="satir"><input id="tum" type="checkbox" ${N.ayar.tumHarfler ? 'checked' : ''}> Tüm harf gruplarını aç</label>
        <button id="dene" class="kucuk-dugme">🔊 Sesi dene</button>
      </section>
      <section class="kart">
        <h2>Cihaz desteği</h2>
        <p>Sesli okuma: ${N.sesVarMi() ? (N.trSesVarMi() ? '✅ Türkçe ses hazır' : '⚠️ Türkçe ses yüklü değil') : '❌ Desteklenmiyor'}</p>
        <p>Ses tanıma (mikrofon): ${N.dinlemeVarMi() ? '✅ Var' : '❌ Bu tarayıcıda yok (Chrome önerilir)'}</p>
        <p>Yapay zeka: ${N.yz.aktif ? '✅ Bağlı (yeni cümleler ve kişisel ipuçları açık)' : '⚪ Kapalı (uygulama çevrimdışı içerikle çalışır)'}</p>
      </section>
      <section class="kart">
        <button id="sifirla" class="kucuk-dugme tehlike">İlerlemeyi sıfırla</button>
      </section>`;
    kok.append(p);
    p.querySelector('#ad').oninput = (e) => { N.ayar.ad = e.target.value.trim(); N.kaydet(); };
    p.querySelector('#hiz').oninput = (e) => { N.ayar.konusmaHizi = +e.target.value; N.kaydet(); };
    p.querySelector('#tum').onchange = (e) => { N.ayar.tumHarfler = e.target.checked; N.kaydet(); };
    p.querySelector('#dene').onclick = () => N.soyle('Merhaba! Birlikte okumayı öğrenelim.');
    p.querySelector('#sifirla').onclick = () => {
      if (confirm('Tüm ilerleme silinsin mi?')) {
        N.ilerleme = { yildiz: 0, harf: {}, kelimeYaz: {}, oyun: {} };
        N.kaydet();
        N.git('ebeveyn');
      }
    };
  };

  // ---------- Başlangıç ekranı ----------
  // Telefon ve tabletlerde ses ancak bir dokunuştan sonra çalabildiği için uygulama bu ekranla açılır.
  N.ekranlar.baslangic = function (kok) {
    const d = N.el('div', 'baslangic');
    d.innerHTML = `
      <img src="ikonlar/ikon-512.png" alt="" class="baslangic-ikon" width="160" height="160">
      <h1>Novarge</h1>
      <p>Okuma Yazma</p>`;
    const basla = N.el('button', 'buyuk-dugme basla', '▶ Başla');
    basla.onclick = () => {
      N.sesKilidiAc();
      N.efekt.tik();
      N.git('ana');
    };
    d.append(basla);
    kok.append(d);
    basla.focus();
  };

  window.addEventListener('DOMContentLoaded', () => {
    N.git('baslangic');
    N.yz.kontrol();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  });
})();
