// Novarge – yapay zeka istemcisi (sunucu varsa kullanılır, yoksa uygulama çevrimdışı çalışır)
(function () {
  N.yz = { aktif: false };

  async function istek(yol, govde) {
    const r = await fetch(yol, {
      method: govde ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: govde ? JSON.stringify(govde) : undefined,
    });
    if (!r.ok) throw new Error('yz-hata ' + r.status);
    return r.json();
  }

  N.yz.kontrol = async function () {
    if (location.protocol === 'file:') return false;
    try {
      const s = await istek('api/saglik');
      N.yz.aktif = !!s.yz;
    } catch (_) {
      N.yz.aktif = false;
    }
    return N.yz.aktif;
  };

  // Çocuğun bildiği harflerle yeni cümleler üretir → ['Ela lale al.', ...]
  N.yz.cumleUret = async function (harfler) {
    if (!N.yz.aktif) return [];
    try {
      const s = await istek('api/uret', { tur: 'cumle', harfler: harfler.join('') });
      return (s.liste || []).filter((c) => typeof c === 'string');
    } catch (_) {
      return [];
    }
  };

  // Çocuğun söylediğine göre sıcak, kısa bir ipucu → 'Çok yaklaştın! ...'
  N.yz.geriBildirim = async function (hedef, soylenen) {
    if (!N.yz.aktif) return null;
    try {
      const s = await istek('api/geri-bildirim', { hedef, soylenen });
      return s.mesaj || null;
    } catch (_) {
      return null;
    }
  };
})();
