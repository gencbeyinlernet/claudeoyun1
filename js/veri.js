// Novarge – içerik verisi
// Harfler, Türkiye'de 1. sınıfta kullanılan "ses temelli cümle yöntemi" sırasına göre gruplanmıştır.
window.N = window.N || {};

N.GRUPLAR = [
  { ad: '1. Grup', renk: '#ff7a59', harfler: ['e', 'l', 'a', 'k', 'i', 'n'] },
  { ad: '2. Grup', renk: '#ffb627', harfler: ['o', 'm', 'u', 't', 'ü', 'y'] },
  { ad: '3. Grup', renk: '#3ec300', harfler: ['ö', 'r', 'ı', 'd', 's', 'b'] },
  { ad: '4. Grup', renk: '#2ec4b6', harfler: ['z', 'ç', 'g', 'ş', 'c', 'p'] },
  { ad: '5. Grup', renk: '#7b61ff', harfler: ['h', 'ğ', 'v', 'f', 'j'] },
];

N.UNLULER = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];

// Her harf için örnek kelime + resim (emoji)
N.HARF_ORNEK = {
  a: ['arı', '🐝'], b: ['balık', '🐟'], c: ['civciv', '🐥'], 'ç': ['çiçek', '🌸'],
  d: ['deniz', '🌊'], e: ['elma', '🍎'], f: ['fil', '🐘'], g: ['güneş', '☀️'],
  'ğ': ['dağ', '⛰️'], h: ['havuç', '🥕'], 'ı': ['ılık su', '💧'], i: ['inek', '🐄'],
  j: ['jöle', '🍮'], k: ['kedi', '🐱'], l: ['lale', '🌷'], m: ['muz', '🍌'],
  n: ['nine', '👵'], o: ['okul', '🏫'], 'ö': ['ördek', '🦆'], p: ['pasta', '🎂'],
  r: ['robot', '🤖'], s: ['saat', '⌚'], 'ş': ['şeker', '🍬'], t: ['top', '⚽'],
  u: ['uçak', '✈️'], 'ü': ['üzüm', '🍇'], v: ['vapur', '⛴️'], y: ['yıldız', '⭐'],
  z: ['zil', '🔔'],
};

// Okuma / dinleme / yazma kelimeleri
N.KELIMELER = [
  ['el', '✋'], ['at', '🐴'], ['ev', '🏠'], ['ay', '🌙'], ['ok', '🏹'], ['su', '💧'],
  ['top', '⚽'], ['kek', '🧁'], ['lale', '🌷'], ['kale', '🏰'], ['elma', '🍎'], ['anne', '👩'],
  ['nine', '👵'], ['kalem', '✏️'], ['kedi', '🐱'], ['inek', '🐄'], ['muz', '🍌'], ['tuz', '🧂'],
  ['kuş', '🐦'], ['kuzu', '🐑'], ['ayı', '🐻'], ['arı', '🐝'], ['bal', '🍯'], ['balık', '🐟'],
  ['ördek', '🦆'], ['robot', '🤖'], ['deniz', '🌊'], ['dede', '👴'], ['bebek', '👶'], ['saat', '⌚'],
  ['simit', '🥯'], ['süt', '🥛'], ['üzüm', '🍇'], ['zil', '🔔'], ['çiçek', '🌸'], ['güneş', '☀️'],
  ['şeker', '🍬'], ['civciv', '🐥'], ['pasta', '🎂'], ['havuç', '🥕'], ['ağaç', '🌳'], ['dağ', '⛰️'],
  ['fil', '🐘'], ['vapur', '⛴️'], ['jöle', '🍮'], ['yıldız', '⭐'], ['kitap', '📖'], ['okul', '🏫'],
  ['araba', '🚗'], ['uçak', '✈️'], ['tavuk', '🐔'], ['köpek', '🐶'], ['tavşan', '🐰'], ['limon', '🍋'],
  ['çilek', '🍓'], ['ekmek', '🍞'], ['peynir', '🧀'], ['kalp', '❤️'], ['bulut', '☁️'], ['kar', '❄️'],
  ['ateş', '🔥'], ['gemi', '🚢'], ['tren', '🚂'], ['mum', '🕯️'], ['nar', '🔴'], ['kutu', '📦'],
  ['etek', '👗'], ['kemik', '🦴'], ['yaka', '👔'], ['anahtar', '🔑'], ['ayakkabı', '👟'], ['balon', '🎈'],
].map(([kelime, emoji]) => ({ kelime, emoji }));

// Cümleler (kolaydan zora)
N.CUMLELER = [
  'Ela lale al.', 'Ali kale al.', 'Anne kek al.', 'Nine elma al.', 'Ela kalem al.',
  'Ali top at.', 'Kuzu süt içti.', 'Kedi süt içti.', 'Ayı bal yedi.', 'Kuş uçtu.',
  'Dede kitap okudu.', 'Bebek uyudu.', 'Güneş doğdu.', 'Tavşan havuç yedi.', 'Annem kek yaptı.',
  'Ördek suda yüzdü.', 'Kar yağdı.', 'Çiçek açtı.', 'Ben okula gittim.', 'Köpek top getirdi.',
  'Babam araba sürdü.', 'Civciv cik cik dedi.', 'Fil suyu sever.', 'Vapur denizde gider.',
];

N.OVGULER = ['Harikasın!', 'Süpersin!', 'Aferin sana!', 'Bravo!', 'Çok güzel!', 'Muhteşem!', 'Sen bir yıldızsın!'];
N.TESVIKLER = ['Haydi bir daha deneyelim!', 'Neredeyse oldu!', 'Hiç sorun değil, tekrar dene!', 'Az kaldı, yapabilirsin!'];

// --- yardımcılar ---
N.buyuk = (s) => s.toLocaleUpperCase('tr-TR');
N.kucuk = (s) => s.toLocaleLowerCase('tr-TR');
N.rastgele = (dizi) => dizi[Math.floor(Math.random() * dizi.length)];
N.karistir = (dizi) => {
  const d = dizi.slice();
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
};
N.harflerinden = (metin) => [...N.kucuk(metin).replace(/[^a-zçğıöşü]/g, '')];
N.TUM_HARFLER = N.GRUPLAR.flatMap((g) => g.harfler);
