// Novarge – parmakla harf/kelime çizme ve otomatik kontrol
// Yöntem: hedef metin görünmez bir tuvale çizilir; çocuğun çizgisinin hedefi ne kadar
// kapladığı (kapsama) ve hedefin dışına ne kadar taştığı (isabet) piksel bazında ölçülür.
(function () {
  const FONT = '"Andika", "Comic Sans MS", sans-serif';

  N.CizimAlani = class {
    constructor(kap, metin, secenek) {
      this.kap = kap;
      kap.cizim = this;
      this.metin = metin;
      this.secenek = Object.assign({ basari: () => {}, kalemRengi: '#ff7a59' }, secenek);
      this.cizgiler = [];
      this.kalemde = false;

      this.rehber = document.createElement('canvas');
      this.tuval = document.createElement('canvas');
      this.rehber.className = 'cizim-rehber';
      this.tuval.className = 'cizim-tuval';
      kap.append(this.rehber, this.tuval);

      this._olcekle = this.olcekle.bind(this);
      window.addEventListener('resize', this._olcekle);
      this.olaylar();
      (document.fonts ? document.fonts.load(`100px ${FONT}`) : Promise.resolve()).then(this._olcekle);
    }

    yokEt() {
      window.removeEventListener('resize', this._olcekle);
    }

    olcekle() {
      const r = this.kap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [this.rehber, this.tuval]) {
        c.width = Math.round(r.width * dpr);
        c.height = Math.round(r.height * dpr);
        c.style.width = r.width + 'px';
        c.style.height = r.height + 'px';
      }
      if (!r.width || !r.height) return;
      this.dpr = dpr;
      this.w = this.tuval.width;
      this.h = this.tuval.height;
      // Yazı boyutu: alana sığacak en büyük boyut
      const ctx = this.rehber.getContext('2d');
      // Harfin gerçek yüksekliği alanın ~%70'ini kaplasın (küçük "e" de büyük görünsün)
      ctx.font = `100px ${FONT}`;
      const m = ctx.measureText(this.metin);
      const yuk = (m.actualBoundingBoxAscent || 70) + (m.actualBoundingBoxDescent || 0);
      let boy = Math.min((this.h * 0.7 * 100) / yuk, this.h * 1.1);
      if ((m.width * boy) / 100 > this.w * 0.86) boy = (this.w * 0.86 * 100) / m.width;
      this.boy = boy;
      this.kalinlik = Math.max(10 * dpr, boy * 0.11);
      this.rehberCiz();
      this.maskeHazirla();
      this.yenidenCiz();
    }

    metniYerlestir(ctx) {
      ctx.font = `${this.boy}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      const m = ctx.measureText(this.metin);
      const ust = m.actualBoundingBoxAscent || this.boy * 0.7;
      const alt = m.actualBoundingBoxDescent || 0;
      // Metni dikeyde ortala
      this.taban = this.h / 2 + (ust - alt) / 2;
    }

    rehberCiz() {
      const ctx = this.rehber.getContext('2d');
      ctx.clearRect(0, 0, this.w, this.h);
      this.metniYerlestir(ctx);
      // Defter çizgileri
      ctx.strokeStyle = '#d6e4ff';
      ctx.lineWidth = 2 * this.dpr;
      const m = ctx.measureText('x');
      const xYuk = m.actualBoundingBoxAscent || this.boy * 0.45;
      for (const y of [this.taban, this.taban - xYuk, this.taban - this.boy * 0.72].filter((y) => y > 0)) {
        ctx.beginPath();
        ctx.setLineDash(y === this.taban ? [] : [12 * this.dpr, 10 * this.dpr]);
        ctx.moveTo(0, y);
        ctx.lineTo(this.w, y);
        ctx.stroke();
      }
      // Soluk harf + kesikli kenar
      ctx.setLineDash([]);
      ctx.fillStyle = '#eef1f7';
      ctx.fillText(this.metin, this.w / 2, this.taban);
      ctx.setLineDash([6 * this.dpr, 8 * this.dpr]);
      ctx.strokeStyle = '#9aa8c7';
      ctx.lineWidth = 2.5 * this.dpr;
      ctx.strokeText(this.metin, this.w / 2, this.taban);
      ctx.setLineDash([]);
    }

    maskeHazirla() {
      const ADIM = 4;
      const olustur = (genislet) => {
        const c = document.createElement('canvas');
        c.width = this.w; c.height = this.h;
        const ctx = c.getContext('2d');
        this.metniYerlestir(ctx);
        ctx.fillStyle = '#000';
        ctx.fillText(this.metin, this.w / 2, this.taban);
        if (genislet) {
          ctx.strokeStyle = '#000';
          ctx.lineJoin = 'round';
          ctx.lineWidth = this.kalinlik * 1.6;
          ctx.strokeText(this.metin, this.w / 2, this.taban);
        }
        return ctx.getImageData(0, 0, this.w, this.h).data;
      };
      this.ADIM = ADIM;
      this.hedef = olustur(false);
      this.genisHedef = olustur(true);
    }

    olaylar() {
      const nokta = (e) => {
        const r = this.tuval.getBoundingClientRect();
        return [(e.clientX - r.left) * this.dpr, (e.clientY - r.top) * this.dpr];
      };
      this.tuval.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.tuval.setPointerCapture(e.pointerId);
        this.kalemde = true;
        this.cizgiler.push([nokta(e)]);
        this.yenidenCiz();
      });
      this.tuval.addEventListener('pointermove', (e) => {
        if (!this.kalemde) return;
        e.preventDefault();
        const olaylar = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
        const c = this.cizgiler[this.cizgiler.length - 1];
        for (const o of olaylar) c.push(nokta(o));
        this.yenidenCiz();
      });
      const birak = () => {
        if (!this.kalemde) return;
        this.kalemde = false;
        const s = this.degerlendir();
        if (s.kapsama >= 0.85 && s.isabet >= 0.7) this.secenek.basari(s);
      };
      this.tuval.addEventListener('pointerup', birak);
      this.tuval.addEventListener('pointercancel', birak);
    }

    yenidenCiz() {
      const ctx = this.tuval.getContext('2d');
      ctx.clearRect(0, 0, this.w, this.h);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = this.secenek.kalemRengi;
      ctx.lineWidth = this.kalinlik;
      for (const c of this.cizgiler) {
        ctx.beginPath();
        ctx.moveTo(c[0][0], c[0][1]);
        if (c.length === 1) ctx.lineTo(c[0][0] + 0.1, c[0][1]);
        for (let i = 1; i < c.length; i++) ctx.lineTo(c[i][0], c[i][1]);
        ctx.stroke();
      }
    }

    temizle() {
      this.cizgiler = [];
      this.yenidenCiz();
    }

    geriAl() {
      this.cizgiler.pop();
      this.yenidenCiz();
    }

    bosMu() {
      return this.cizgiler.length === 0;
    }

    // { kapsama: hedefin çizilen oranı, isabet: çizginin hedef içinde kalan oranı }
    degerlendir() {
      const kalem = this.tuval.getContext('2d').getImageData(0, 0, this.w, this.h).data;
      let hedefSay = 0, kaplanan = 0, kalemSay = 0, icerde = 0;
      for (let y = 0; y < this.h; y += this.ADIM) {
        for (let x = 0; x < this.w; x += this.ADIM) {
          const i = (y * this.w + x) * 4 + 3;
          const h = this.hedef[i] > 128;
          const k = kalem[i] > 128;
          if (h) { hedefSay++; if (k) kaplanan++; }
          if (k) { kalemSay++; if (this.genisHedef[i] > 128) icerde++; }
        }
      }
      return {
        kapsama: hedefSay ? kaplanan / hedefSay : 0,
        isabet: kalemSay ? icerde / kalemSay : 0,
      };
    }
  };
})();
