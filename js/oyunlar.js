// Novarge – oyun ekranları
(function () {
  const E = (N.ekranlar = N.ekranlar || {});

  function dugme(metin, sinif, tik) {
    const b = N.el('button', sinif, metin);
    b.onclick = tik;
    return b;
  }

  // ======================= YAZMA: harf çizme =======================
  E.ciz = function (kok, { harf, buyuk = false }) {
    kok.append(N.ust('Harf Çiz', ['yazMenu']));
    const [ornek, emoji] = N.HARF_ORNEK[harf];
    const gosterilen = buyuk ? N.buyuk(harf) : harf;

    const bilgi = N.el('div', 'harf-bilgi');
    bilgi.innerHTML = `<span class="ornek-emoji">${emoji}</span>
      <span class="ornek-kelime"><b>${N.buyuk(ornek[0])}</b>${ornek.slice(1)}</span>`;
    const dinleBtn = dugme('🔊', 'yuvarlak', () => N.harfiSoyle(harf));
    const boyBtn = dugme(buyuk ? 'küçük' : 'BÜYÜK', 'kucuk-dugme', () => N.git('ciz', { harf, buyuk: !buyuk }));
    bilgi.append(dinleBtn, boyBtn);
    kok.append(bilgi);
    kok.append(N.novaKutu(`Bu ${gosterilen} harfi. Dinle!`));

    const alan = N.el('div', 'cizim-alani');
    kok.append(alan);
    let bitti = false;
    const cizim = new N.CizimAlani(alan, gosterilen, { basari: () => basarili() });

    const araclar = N.el('div', 'araclar');
    araclar.append(
      dugme('↩️ Geri al', 'arac', () => cizim.geriAl()),
      dugme('🧽 Sil', 'arac', () => { cizim.temizle(); bitti = false; }),
      dugme('✅ Bitti', 'arac ana-arac', () => kontrol())
    );
    kok.append(araclar);

    function kontrol() {
      if (bitti) return;
      if (cizim.bosMu()) return N.novaDesin('Önce parmağınla harfin üzerinden çiz!');
      const s = cizim.degerlendir();
      if (s.kapsama >= 0.6 && s.isabet >= 0.6) return basarili();
      N.efekt.yanlis();
      if (s.kapsama < 0.6) N.novaDesin('Harfin her yerini boyamayı unutma. Bir daha deneyelim!');
      else N.novaDesin('Çizginin dışına çıkmamaya çalış. Haydi tekrar!');
    }

    async function basarili() {
      if (bitti) return;
      bitti = true;
      const kayit = N.ilerleme.harf[harf] || (N.ilerleme.harf[harf] = {});
      const anahtar = buyuk ? 'buyuk' : 'kucuk';
      const ilk = !kayit[anahtar];
      const oncekiGrup = N.acikGrupSayisi();
      kayit[anahtar] = true;
      N.yildizVer(ilk ? 2 : 1);
      await N.kutla(`${harf} harfini yazdın!`);
      if (N.acikGrupSayisi() > oncekiGrup) await N.novaDesin('Yaşasın! Yeni harfler açıldı!');
      // Sonraki adım: küçük → büyük → sonraki harf
      const sira = N.acikHarfler();
      const sonraki = sira[sira.indexOf(harf) + 1];
      const devam = N.el('div', 'devam');
      if (!buyuk) devam.append(dugme(`${N.buyuk(harf)} büyük harfini yaz ➡`, 'buyuk-dugme', () => N.git('ciz', { harf, buyuk: true })));
      if (sonraki) devam.append(dugme(`Sıradaki harf: ${sonraki} ➡`, 'buyuk-dugme', () => N.git('ciz', { harf: sonraki })));
      devam.append(dugme('Tekrar çiz', 'kucuk-dugme', () => N.git('ciz', { harf, buyuk })));
      kok.append(devam);
      devam.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    setTimeout(async () => {
      await N.harfiSoyle(harf);
      N.novaDesin(`Şimdi ${buyuk ? 'büyük' : 'küçük'} ${harf} harfinin üzerinden parmağınla çiz.`);
    }, 300);
    return () => cizim.yokEt();
  };

  // ======================= YAZMA: kelime çizme =======================
  E.kelimeYaz = function (kok) {
    kok.append(N.ust('Kelime Yaz', ['yazMenu']));
    const havuz = N.kelimeHavuzu().filter((k) => k.kelime.length <= 5);
    const { kelime, emoji } = N.rastgele(havuz);
    const bilgi = N.el('div', 'harf-bilgi', `<span class="ornek-emoji">${emoji}</span>`);
    bilgi.append(dugme('🔊', 'yuvarlak', () => N.soyle(kelime)));
    kok.append(bilgi, N.novaKutu(''));
    const alan = N.el('div', 'cizim-alani genis');
    kok.append(alan);
    let bitti = false;
    const cizim = new N.CizimAlani(alan, kelime, { basari: () => basarili(), kalemRengi: '#2ec4b6' });
    const araclar = N.el('div', 'araclar');
    araclar.append(
      dugme('↩️ Geri al', 'arac', () => cizim.geriAl()),
      dugme('🧽 Sil', 'arac', () => cizim.temizle()),
      dugme('✅ Bitti', 'arac ana-arac', () => {
        if (cizim.bosMu()) return N.novaDesin('Önce kelimenin üzerinden çiz!');
        const s = cizim.degerlendir();
        if (s.kapsama >= 0.55 && s.isabet >= 0.55) basarili();
        else N.tesvik();
      })
    );
    kok.append(araclar);
    async function basarili() {
      if (bitti) return;
      bitti = true;
      N.ilerleme.kelimeYaz[kelime] = true;
      N.yildizVer(2, 'kelimeYaz');
      await N.kutla(`${kelime} yazdın!`);
      devamDugmesi(kok, 'Yeni kelime ➡', () => N.git('kelimeYaz'));
    }
    setTimeout(() => N.novaDesin(`${kelime}. Haydi ${kelime} kelimesini yazalım!`), 300);
    return () => cizim.yokEt();
  };

  // ======================= Ortak: parçaları sırayla dizme =======================
  // parcalar: doğru sıra, secenekler: karışık taşlar, seslendir: taş dokununca okunacak metin
  function diziOyunu(kap, { parcalar, secenekler, golge, seslendir, ayrac = '', tamam }) {
    const slotlar = N.el('div', 'slotlar' + (ayrac ? ' kelimeli' : ''));
    const taslar = N.el('div', 'taslar');
    const yuvalar = parcalar.map((p) => {
      const y = N.el('div', 'slot', golge ? `<span class="golge">${p}</span>` : '');
      slotlar.append(y);
      return y;
    });
    let sira = 0, hata = 0;
    for (const s of secenekler) {
      const t = N.el('button', 'tas', s);
      t.onclick = async () => {
        if (sira >= parcalar.length || t.disabled) return;
        if (s === parcalar[sira]) {
          N.efekt.tik();
          t.disabled = true;
          t.classList.add('gitti');
          yuvalar[sira].innerHTML = `<span class="dolu">${s}</span>`;
          yuvalar[sira].classList.add('tamam');
          sira++;
          hata = 0;
          taslar.querySelectorAll('.ipucu').forEach((x) => x.classList.remove('ipucu'));
          if (sira === parcalar.length) tamam();
          else if (seslendir) N.soyle(seslendir(s));
        } else {
          t.classList.remove('salla');
          void t.offsetWidth;
          t.classList.add('salla');
          N.efekt.yanlis();
          if (++hata >= 2) {
            const dogru = [...taslar.children].find((x) => !x.disabled && x.textContent === parcalar[sira]);
            if (dogru) dogru.classList.add('ipucu');
          }
        }
      };
      taslar.append(t);
    }
    kap.append(slotlar, taslar);
  }

  function devamDugmesi(kap, metin, tik) {
    const d = N.el('div', 'devam');
    d.append(dugme(metin, 'buyuk-dugme', tik));
    kap.append(d);
  }

  // ======================= OKUMA: hece yapma =======================
  E.hece = function (kok) {
    kok.append(N.ust('Hece Yap', ['okuMenu']));
    kok.append(N.novaKutu(''));
    const oyun = N.el('div', 'oyun');
    kok.append(oyun);
    const acik = N.acikHarfler();
    const unluler = acik.filter((h) => N.UNLULER.includes(h));
    const unsuzler = acik.filter((h) => !N.UNLULER.includes(h) && h !== 'ğ');

    function tur() {
      oyun.innerHTML = '';
      const v = N.rastgele(unluler);
      const c = N.rastgele(unsuzler);
      const parcalar = Math.random() < 0.7 ? [c, v] : [v, c];
      const hece = parcalar.join('');
      const yanlislar = N.karistir(acik.filter((h) => !parcalar.includes(h))).slice(0, 2);
      const ust = N.el('div', 'hedef-satir', `<span class="hedef-metin">${hece}</span>`);
      ust.append(dugme('🔊', 'yuvarlak', () => N.soyle(hece)));
      oyun.append(ust);
      diziOyunu(oyun, {
        parcalar,
        secenekler: N.karistir(parcalar.concat(yanlislar)),
        golge: (N.ilerleme.oyun.hece || 0) < 5,
        seslendir: (s) => s,
        tamam: async () => {
          N.yildizVer(1, 'hece');
          await N.soyle(`${parcalar[0]}, ${parcalar[1]}... ${hece}!`);
          await N.kutla();
          devamDugmesi(oyun, 'Yeni hece ➡', tur);
        },
      });
      N.novaDesin(`${hece} hecesini yapalım. ${parcalar[0]} ile ${parcalar[1]} birleşince: ${hece}`);
    }
    tur();
  };

  // ======================= OKUMA: kelime kurma =======================
  E.kelimeKur = function (kok) {
    kok.append(N.ust('Kelime Kur', ['okuMenu']));
    kok.append(N.novaKutu(''));
    const oyun = N.el('div', 'oyun');
    kok.append(oyun);
    let son = null;

    function tur() {
      oyun.innerHTML = '';
      const havuz = N.kelimeHavuzu().filter((k) => k.kelime.length <= 7 && k.kelime !== son);
      const { kelime, emoji } = N.rastgele(havuz);
      son = kelime;
      const parcalar = [...kelime];
      const yanlislar = N.karistir(N.acikHarfler().filter((h) => !parcalar.includes(h))).slice(0, 2);
      const ust = N.el('div', 'hedef-satir', `<span class="buyuk-emoji">${emoji}</span>`);
      ust.append(dugme('🔊', 'yuvarlak', () => N.soyle(kelime, 0.6)));
      oyun.append(ust);
      diziOyunu(oyun, {
        parcalar,
        secenekler: N.karistir(parcalar.concat(yanlislar)),
        golge: (N.ilerleme.oyun.kelime || 0) < 5,
        seslendir: (s) => s,
        tamam: async () => {
          N.yildizVer(1, 'kelime');
          await N.soyle(kelime, 0.7);
          await N.kutla(`${kelime} kelimesini kurdun!`);
          devamDugmesi(oyun, 'Yeni kelime ➡', tur);
        },
      });
      N.novaDesin(`Bu bir ${kelime}. Harfleri sırayla dizerek ${kelime} kelimesini kur.`);
    }
    tur();
  };

  // ======================= OKUMA: cümle kurma =======================
  E.cumleKur = function (kok) {
    kok.append(N.ust('Cümle Kur', ['okuMenu']));
    kok.append(N.novaKutu(''));
    const oyun = N.el('div', 'oyun');
    kok.append(oyun);
    let son = null;

    // Yapay zeka açıksa çocuğun harflerine göre yeni cümleler iste (arka planda)
    if (N.yz.aktif && N.ekCumleler.length < 10) {
      N.yz.cumleUret(N.acikHarfler()).then((liste) => {
        for (const c of liste) if (!N.ekCumleler.includes(c)) N.ekCumleler.push(c);
      });
    }

    function tur() {
      oyun.innerHTML = '';
      const cumle = N.rastgele(N.cumleHavuzu().filter((c) => c !== son));
      son = cumle;
      const parcalar = cumle.replace(/[.!?,]/g, '').split(/\s+/);
      const deneyimli = (N.ilerleme.oyun.cumle || 0) >= 5;
      const fazla = deneyimli
        ? N.karistir(N.kelimeHavuzu().map((k) => k.kelime).filter((k) => !parcalar.includes(k))).slice(0, 1)
        : [];
      const ust = N.el('div', 'hedef-satir', '<span class="buyuk-emoji">📝</span>');
      ust.append(dugme('🔊', 'yuvarlak', () => N.soyle(cumle, 0.7)));
      oyun.append(ust);
      diziOyunu(oyun, {
        parcalar,
        secenekler: N.karistir(parcalar.concat(fazla)),
        golge: !deneyimli,
        ayrac: ' ',
        seslendir: (s) => s,
        tamam: async () => {
          N.yildizVer(2, 'cumle');
          await N.soyle(cumle, 0.75);
          await N.kutla('Cümleyi kurdun!');
          devamDugmesi(oyun, 'Yeni cümle ➡', tur);
        },
      });
      N.novaDesin(`Dinle: ${cumle} Şimdi kelimeleri sırayla diz.`);
    }
    tur();
  };

  // ======================= DİNLEME: harf avı =======================
  E.harfAvi = function (kok) {
    kok.append(N.ust('Harf Avı', ['dinleMenu']));
    kok.append(N.novaKutu(''));
    const oyun = N.el('div', 'oyun');
    kok.append(oyun);
    let son = null;
    function tur() {
      oyun.innerHTML = '';
      const acik = N.acikHarfler();
      const hedef = N.rastgele(acik.filter((h) => h !== son));
      son = hedef;
      const secenekler = N.karistir([hedef, ...N.karistir(acik.filter((h) => h !== hedef)).slice(0, 3)]);
      const ust = N.el('div', 'hedef-satir', '<span class="buyuk-emoji">👂</span>');
      ust.append(dugme('🔊 Tekrar', 'kucuk-dugme', () => N.harfiSoyle(hedef)));
      oyun.append(ust);
      const izgara = N.el('div', 'secim-izgara');
      let bitti = false;
      for (const s of secenekler) {
        const b = dugme(s, 'secim harf-secim', async () => {
          if (bitti) return;
          if (s === hedef) {
            bitti = true;
            b.classList.add('dogru');
            N.yildizVer(1, 'harfAvi');
            await N.kutla(`Bu ${hedef} harfi!`);
            setTimeout(tur, 400);
          } else {
            b.classList.add('yanlis');
            N.tesvik();
          }
        });
        izgara.append(b);
      }
      oyun.append(izgara);
      N.novaDesin('Hangi harfi duydun?').then(() => N.harfiSoyle(hedef));
    }
    tur();
  };

  // ======================= DİNLEME: ne duydun? =======================
  E.hangisi = function (kok) {
    kok.append(N.ust('Ne Duydun?', ['dinleMenu']));
    kok.append(N.novaKutu(''));
    const oyun = N.el('div', 'oyun');
    kok.append(oyun);
    let son = null;
    function tur() {
      oyun.innerHTML = '';
      const havuz = N.kelimeHavuzu();
      const hedef = N.rastgele(havuz.filter((k) => k.kelime !== son));
      son = hedef.kelime;
      const digerleri = N.karistir(N.KELIMELER.filter((k) => k.kelime !== hedef.kelime)).slice(0, 2);
      const ust = N.el('div', 'hedef-satir', '<span class="buyuk-emoji">👂</span>');
      ust.append(dugme('🔊 Tekrar', 'kucuk-dugme', () => N.soyle(hedef.kelime)));
      oyun.append(ust);
      const izgara = N.el('div', 'secim-izgara uclu');
      let bitti = false;
      for (const k of N.karistir([hedef, ...digerleri])) {
        const b = dugme(`<span class="buyuk-emoji">${k.emoji}</span><small>${k.kelime}</small>`, 'secim', async () => {
          if (bitti) return;
          if (k === hedef) {
            bitti = true;
            b.classList.add('dogru');
            N.yildizVer(1, 'dinle');
            await N.kutla();
            setTimeout(tur, 400);
          } else {
            b.classList.add('yanlis');
            await N.tesvik();
            N.soyle(hedef.kelime);
          }
        });
        izgara.append(b);
      }
      oyun.append(izgara);
      N.novaDesin('Dinle ve resmini bul!').then(() => N.soyle(hedef.kelime));
    }
    tur();
  };

  // ======================= KONUŞMA: sesli okuma =======================
  E.sesliOku = function (kok, tur = 'kelime') {
    const cumleMi = tur === 'cumle';
    kok.append(N.ust(cumleMi ? 'Cümle Oku' : 'Sesli Oku', ['dinleMenu']));
    kok.append(N.novaKutu(''));
    const oyun = N.el('div', 'oyun');
    kok.append(oyun);
    let son = null;

    function yeni() {
      oyun.innerHTML = '';
      let metin, emoji = '';
      if (cumleMi) {
        metin = N.rastgele(N.cumleHavuzu().filter((c) => c !== son));
      } else {
        const k = N.rastgele(N.kelimeHavuzu().filter((x) => x.kelime !== son));
        metin = k.kelime;
        emoji = k.emoji;
      }
      son = metin;
      oyun.append(N.el('div', 'okuma-karti', `${emoji ? `<span class="buyuk-emoji">${emoji}</span>` : ''}<p class="okunacak">${metin}</p>`));
      const satir = N.el('div', 'araclar');
      const dinleBtn = dugme('🔊 Nova okusun', 'arac', () => N.soyle(metin, 0.7));
      const mikrofon = dugme('🎤 Ben okuyayım', 'arac ana-arac mikrofon', () => oku());
      satir.append(dinleBtn, mikrofon);
      oyun.append(satir);
      const sonuc = N.el('p', 'duyulan');
      oyun.append(sonuc);
      let bitti = false;

      async function basarili() {
        bitti = true;
        N.yildizVer(cumleMi ? 2 : 1, 'soyle');
        await N.kutla('Çok güzel okudun!');
        devamDugmesi(oyun, cumleMi ? 'Yeni cümle ➡' : 'Yeni kelime ➡', yeni);
      }

      async function oku() {
        if (bitti) return;
        if (!N.dinlemeVarMi()) {
          // Ses tanıma yoksa ebeveyn onaylar
          sonuc.textContent = 'Bu cihazda mikrofonla dinleme yok. Çocuğunuz doğru okuduysa “Okudu!” deyin.';
          if (!oyun.querySelector('.onay')) oyun.append(dugme('👍 Okudu!', 'buyuk-dugme onay', basarili));
          return;
        }
        mikrofon.classList.add('dinliyor');
        mikrofon.textContent = '👂 Dinliyorum...';
        try {
          const duyulan = await N.dinle();
          const { dogru } = N.dogruSoylendiMi(metin, duyulan);
          sonuc.textContent = duyulan.length ? `Duyduğum: “${duyulan[0]}”` : 'Seni duyamadım.';
          if (dogru) return basarili();
          if (!duyulan.length) return N.novaDesin('Seni duyamadım. Biraz daha yüksek sesle oku!');
          N.efekt.yanlis();
          const ipucu = await N.yz.geriBildirim(metin, duyulan[0]);
          await N.novaDesin(ipucu || `${N.rastgele(N.TESVIKLER)} Önce beni dinle.`);
          if (!ipucu) N.soyle(metin, 0.65);
        } catch (e) {
          sonuc.textContent = e.message === 'not-allowed'
            ? 'Mikrofon izni gerekli. Tarayıcı ayarlarından mikrofona izin verin.'
            : 'Dinlerken bir sorun oldu, tekrar dene.';
        } finally {
          mikrofon.classList.remove('dinliyor');
          mikrofon.textContent = '🎤 Ben okuyayım';
        }
      }

      N.novaDesin(cumleMi ? 'Bu cümleyi yüksek sesle oku!' : 'Bu kelimeyi yüksek sesle oku!');
    }
    yeni();
  };
})();
