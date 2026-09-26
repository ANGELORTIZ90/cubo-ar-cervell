/* Cub AR — Cervell humà. Components compartits pel visor (index.html) i per la
   prova sense AR. Requereix A-Frame 1.4.2 carregat abans.

   Estructura de cada cara:
     <a-marker>                     (o <a-entity data-marcador> a la prova)
       <a-entity rotation="...">    pivot: orientació de la vista (i gir, cara 2)
         <a-entity gltf-model vista-cervell="parts: ..." rotuls="conjunt: ...">
*/
(function () {
  'use strict';

  // Colors dels rètols = colors dels grups del GLB (fer-model.py)
  const C = {
    frontal: '#6FA3E0', parietal: '#F0BE5C', temporal: '#6CC47C', occipital: '#E07AA3',
    insula: '#B39BE6', limbic: '#F0A286', cerebel: '#EE8E5E', vermis: '#D8744A',
    mesencefal: '#9FE3DC', protuberancia: '#62C2BE', bulb: '#46A6A2',
    cos_callos: '#FFFFFF', talem: '#A08FE6', hipotalem: '#E6B8E8', fornix: '#F6DF95',
    ventricles: '#6FD3F7', substancia_blanca: '#EDE6D8'
  };

  // Rètols per cara. n = node del GLB; e = només es veu quan l'explosió passa
  // d'aquest valor (estructures tapades amb el cervell muntat). Punt de la superfície en
  // coordenades del GLB (metres, origen al centre del cervell), calculat amb
  // punts-rotuls.py. Text en català (la font pròpia té à è é í ï ò ó ú ü ç ·).
  window.ROTULS = {
    sencer: [
      { t: 'Lòbul\nfrontal',     n: 'frontal_R',   c: C.frontal },
      { t: 'Lòbul\nparietal',    n: 'parietal_R',  c: C.parietal },
      { t: 'Lòbul\ntemporal',    n: 'temporal_R',  c: C.temporal },
      { t: 'Lòbul\noccipital',   n: 'occipital_R', c: C.occipital },
      { t: 'Cerebel',            n: 'cerebel_R',   c: C.cerebel }
    ],
    explosio: [
      { t: 'Frontal',            n: 'frontal_R',   c: C.frontal },
      { t: 'Parietal',           n: 'parietal_R',  c: C.parietal },
      { t: 'Temporal',           n: 'temporal_R',  c: C.temporal },
      { t: 'Occipital',          n: 'occipital_R', c: C.occipital },
      { t: 'Ínsula',             n: 'insula_R',    c: C.insula, e: 0.6 },
      { t: 'Substància\nblanca', n: 'substancia_blanca_R', c: C.substancia_blanca, e: 0.6 },
      { t: 'Cerebel',            n: 'cerebel_R',   c: C.cerebel },
      { t: 'Tronc de\nl\'encèfal', n: 'protuberancia_R', c: C.protuberancia, e: 0.6 }
    ],
    cerebel: [
      { t: 'Hemisferi\ncerebel·lós', n: 'cerebel_R', c: C.cerebel },
      { t: 'Hemisferi\ncerebel·lós', n: 'cerebel_L', c: C.cerebel },
      { t: 'Vermis',             n: 'vermis_R',    c: C.vermis },
      { t: 'Mesencèfal',         n: 'mesencefal_R', c: C.mesencefal },
      { t: 'Protuberància',      n: 'protuberancia_R', c: C.protuberancia },
      { t: 'Bulb raquidi',       n: 'bulb_R',      c: C.bulb }
    ],
    medial: [
      { t: 'Cos callós',         n: 'cos_callos_R', c: C.cos_callos },
      { t: 'Gir cingulat',       n: 'limbic_R',    c: C.limbic },
      { t: 'Fòrnix',             n: 'fornix_R',    c: C.fornix },
      { t: 'Tàlem',              n: 'talem_R',     c: C.talem },
      { t: 'Hipotàlem',          n: 'hipotalem_R', c: C.hipotalem },
      { t: 'Ventricle\nlateral', n: 'ventricles_R', c: C.ventricles }
    ]
  };
  // Punts (els escriu punts-rotuls.py a punts-rotuls.json; es copien aquí)
  window.PUNTS_ROTULS = window.PUNTS_ROTULS || {};

  const ROTULS_TAM = 0.7;         // mida dels cartells (1 = original)
  const FONT = 'fuentes/dejavu-ca.json';

  // Marcador de què penja una entitat: <a-marker> al visor, [data-marcador] a la prova
  function marcadorDe(el) {
    return el.closest('a-marker') || el.closest('[data-marcador]');
  }

  // Cartell que sempre mira a la càmera
  AFRAME.registerComponent('mirar-camara', {
    init: function () { this.v = new THREE.Vector3(); },
    tick: function () {
      const cam = this.el.sceneEl.camera;
      if (!cam) { return; }
      cam.getWorldPosition(this.v);
      this.el.object3D.lookAt(this.v);
    }
  });

  /* vista-cervell: mostra només els nodes de 'parts' (prefixos; buit = tots),
     escala el conjunt visible a 'tam' i el centra sobre el marcador (el mateix
     que 'ajustar' del Cub del cor, però només amb el que es veu). Quan acaba,
     emet 'cervell-llest'. */
  AFRAME.registerComponent('vista-cervell', {
    schema: { parts: { default: '' }, tam: { default: 1.2 } },
    init: function () {
      this.el.addEventListener('model-loaded', () => this.preparar());
    },
    preparar: function () {
      const arrel = this.el.getObject3D('mesh');
      if (!arrel) { return; }
      const parts = this.data.parts.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      const nodes = this.nodes = {};
      arrel.traverse(function (n) {
        if (!n.isMesh) { return; }
        nodes[n.name] = n;
        n.visible = !parts.length || parts.some(function (p) { return n.name.indexOf(p) === 0; });
        n.userData.repos = n.position.clone();
        n.castShadow = n.receiveShadow = n.visible;
      });
      // Caixa del que es veu, en coordenades locals de l'entitat
      const o = this.el.object3D;
      o.scale.setScalar(1); o.position.set(0, 0, 0);
      o.updateMatrixWorld(true);
      const inv = new THREE.Matrix4().copy(o.matrixWorld).invert();
      const caixa = new THREE.Box3();
      Object.keys(nodes).forEach(function (k) {
        const n = nodes[k];
        if (!n.visible) { return; }
        n.geometry.computeBoundingBox();
        const rel = new THREE.Matrix4().multiplyMatrices(inv, n.matrixWorld);
        caixa.union(n.geometry.boundingBox.clone().applyMatrix4(rel));
      });
      this.caixa = caixa;
      const mida = caixa.getSize(new THREE.Vector3());
      const s = this.data.tam / Math.max(mida.x, mida.y, mida.z);
      const centre = caixa.getCenter(new THREE.Vector3());
      o.scale.setScalar(s);
      o.position.set(-centre.x * s, -caixa.min.y * s + 0.05, -centre.z * s);
      this.el.emit('cervell-llest', { nodes: nodes, caixa: caixa });
    }
  });

  /* explosio: separa els lòbuls del nucli central. 'factor' el mou el
     component 'animation' d'A-Frame (property: explosio.factor) en bucle; els
     extrems de -0,3 a 1,3 es retallen a 0..1 per fer una pausa a cada punta. */
  const DIR = {           // [x (cap enfora, se li aplica el signe del costat), y, z]
    frontal: [0.2, 0.15, 1.0], parietal: [0.2, 1.0, -0.3], occipital: [0.2, 0.0, -1.0],
    temporal: [0.45, -1.0, 0.2], cerebel: [0, -0.7, -0.7], vermis: [0, -0.7, -0.7],
    mesencefal: [0, -1.0, 0.35], protuberancia: [0, -1.0, 0.35], bulb: [0, -1.0, 0.35]
  };
  AFRAME.registerComponent('explosio', {
    schema: { factor: { default: 0 }, dist: { default: 0.06 } },
    init: function () {
      this.moviments = null;
      this.el.addEventListener('cervell-llest', (ev) => {
        const nodes = ev.detail.nodes;
        this.moviments = [];
        Object.keys(nodes).forEach((nom) => {
          const grup = nom.replace(/_[LR]$/, ''), costat = /_L$/.test(nom) ? -1 : 1;
          const d = DIR[grup];
          if (!d) { return; }
          const v = new THREE.Vector3(d[0] * costat, d[1], d[2]).normalize().multiplyScalar(this.data.dist);
          this.moviments.push({ node: nodes[nom], v: v });
        });
        this.update();
      });
    },
    update: function () {
      if (!this.moviments) { return; }
      let f = Math.min(1, Math.max(0, this.data.factor));
      f = f * f * (3 - 2 * f);
      this.moviments.forEach(function (m) {
        m.node.position.copy(m.node.userData.repos).addScaledVector(m.v, f);
      });
    }
  });

  /* rotuls: punt + línia + cartell per a cada rètol del conjunt. Els cartells
     es recol·loquen a cada fotograma en dues columnes als costats del model
     TAL COM EL VEU LA CÀMERA; els de la cara del darrere s'amaguen. Els punts
     van enganxats al seu node, així segueixen l'explosió i el gir. */
  AFRAME.registerComponent('rotuls', {
    schema: { conjunt: { default: '' } },
    init: function () {
      this.items = null;
      this.visibles = true;
      this.el.addEventListener('cervell-llest', (ev) => {
        setTimeout(() => this.crear(ev.detail), 0);
      });
    },
    crear: function (det) {
      if (this.items) { return; }
      const T = THREE.Vector3;
      const llista = (window.ROTULS[this.data.conjunt] || []);
      const punts = window.PUNTS_ROTULS[this.data.conjunt] || [];
      const marcador = marcadorDe(this.el);
      this.marcador = marcador.object3D;
      this.caixa = det.caixa;
      this.centreLocal = det.caixa.getCenter(new T());
      this.esquinesLocal = [];
      for (let i = 0; i < 8; i++) {
        this.esquinesLocal.push(new T(i & 1 ? det.caixa.max.x : det.caixa.min.x,
                                      i & 2 ? det.caixa.max.y : det.caixa.min.y,
                                      i & 4 ? det.caixa.max.z : det.caixa.min.z));
      }
      const grup = document.createElement('a-entity');
      marcador.appendChild(grup);
      this.grup = grup;
      const CAR = 0.052, LINIA = 0.085;
      const self = this;
      this.items = [];
      llista.forEach(function (r, i) {
        const node = det.nodes[r.n];
        const p = punts[i];
        if (!node || !node.visible || !p) { return; }
        const local = new T(p[0], p[1], p[2]);      // coordenades del GLB = locals del node en repòs
        const punt = new THREE.Mesh(new THREE.SphereGeometry(0.012, 14, 10),
                                    new THREE.MeshBasicMaterial({ color: r.c }));
        const geo = new THREE.BufferGeometry().setFromPoints([new T(), new T()]);
        const linia = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: r.c }));
        grup.object3D.add(punt, linia);
        const files = r.t.split('\n');
        const ample = Math.max.apply(null, files.map(function (f) { return f.length; })) * CAR + 0.1;
        const alt = files.length * LINIA + 0.06;
        const cartell = document.createElement('a-entity');
        cartell.setAttribute('mirar-camara', '');
        cartell.setAttribute('scale', ROTULS_TAM + ' ' + ROTULS_TAM + ' ' + ROTULS_TAM);
        const fons = document.createElement('a-plane');
        fons.setAttribute('width', ample);
        fons.setAttribute('height', alt);
        fons.setAttribute('material', 'shader: flat; color: #12151c; opacity: 0.82; transparent: true');
        const franja = document.createElement('a-plane');
        franja.setAttribute('width', 0.024);
        franja.setAttribute('height', alt);
        franja.setAttribute('material', 'shader: flat; transparent: true; color: ' + r.c);
        const text = document.createElement('a-text');
        text.setAttribute('value', r.t);
        text.setAttribute('font', FONT);
        text.setAttribute('shader', 'sdf');
        text.setAttribute('align', 'center');
        text.setAttribute('anchor', 'center');
        text.setAttribute('baseline', 'center');
        text.setAttribute('color', '#FFFFFF');
        text.setAttribute('width', 1.2);
        text.setAttribute('wrap-count', 22);
        cartell.appendChild(fons);
        cartell.appendChild(franja);
        cartell.appendChild(text);
        grup.appendChild(cartell);
        self.items.push({ node: node, local: local, e: r.e || 0,
                          fora: local.clone().sub(self.centreLocal).normalize(),
                          punt: punt, linia: linia, geo: geo, cartell: cartell, fons: fons,
                          franja: franja, text: text, ample: ample, alt: alt, costat: 0, costatCartell: 0 });
      });
      grup.object3D.visible = this.visibles;
    },
    tick: function () {
      if (!this.items || !this.visibles) { return; }
      const cam = this.el.sceneEl.camera;
      const m = this.marcador;
      if (!cam || !m.visible) { return; }
      const T = THREE.Vector3;
      const o = this.el.object3D;
      m.updateMatrixWorld(true);
      const camPos = cam.getWorldPosition(new T());
      const q = cam.getWorldQuaternion(new THREE.Quaternion());
      const dre = new T(1, 0, 0).applyQuaternion(q), amunt = new T(0, 1, 0).applyQuaternion(q);
      const Cw = o.localToWorld(this.centreLocal.clone());
      const escala = m.getWorldScale(new T()).x;
      const capCam = camPos.clone().sub(Cw).normalize();
      const gir = o.getWorldQuaternion(new THREE.Quaternion());
      let semi = 0;
      this.esquinesLocal.forEach(function (e) {
        semi = Math.max(semi, Math.abs(o.localToWorld(e.clone()).sub(Cw).dot(dre)));
      });
      // Sempre per sobre del model (el text MSDF apareix quan carrega la font)
      if (!this.damunt) {
        let llest = true;
        this.items.forEach(function (it) {
          if (it.damunt) { return; }
          let text = false;
          [it.punt, it.linia, it.cartell.object3D].forEach(function (arrel) {
            arrel.traverse(function (n) {
              if (!n.material) { return; }
              n.material.depthTest = false;
              const el = n.parent && n.parent.el;
              n.renderOrder = el === it.text ? 1003 : el === it.franja ? 1002 : 1001;
              if (n.geometry && n.geometry.type !== 'PlaneGeometry' && arrel === it.cartell.object3D) { text = true; }
            });
          });
          it.punt.renderOrder = it.linia.renderOrder = 1000;
          it.damunt = text;
          llest = llest && text;
        });
        this.damunt = llest;
      }
      const ex = this.el.components.explosio;
      const fx = ex ? Math.min(1, Math.max(0, ex.data.factor)) : 1;
      const columnes = { '-1': [], '1': [] };
      this.items.forEach(function (it) {
        const aW = it.node.localToWorld(it.local.clone());
        it.a = m.worldToLocal(aW.clone());
        const d = aW.clone().sub(Cw);
        const fora = it.fora.clone().applyQuaternion(gir);
        it.amagat = fora.dot(capCam) < -0.3 || fx < it.e;
        const x = d.dot(dre);
        if (it.costat === 0 || Math.abs(x) > 0.08 * escala) { it.costat = x < 0 ? -1 : 1; }
        it.u = d.dot(amunt);
        if (!it.amagat) { columnes[it.costat].push(it); }
        it.cartell.object3D.visible = !it.amagat;
        it.punt.visible = !it.amagat;
        it.linia.visible = !it.amagat;
        it.punt.position.copy(it.a);
        it.geo.attributes.position.setXYZ(0, it.a.x, it.a.y, it.a.z);
      });
      const marge = 0.12 * escala;
      [-1, 1].forEach(function (costat) {
        const col = columnes[costat].sort(function (p1, p2) { return p2.u - p1.u; });
        let sostre = Infinity, suma = 0;
        col.forEach(function (it) {
          const mitja = it.alt * ROTULS_TAM / 2 * escala;
          it.v = Math.min(it.u, sostre - mitja);
          sostre = it.v - mitja - 0.025 * escala;
          suma += it.u - it.v;
        });
        const puja = col.length ? suma / col.length : 0;
        col.forEach(function (it) {
          const L = Cw.clone().addScaledVector(dre, costat * (semi + marge))
                              .addScaledVector(amunt, it.v + puja);
          const local = m.worldToLocal(L);
          it.cartell.object3D.position.copy(local);
          it.geo.attributes.position.setXYZ(1, local.x, local.y, local.z);
          it.geo.attributes.position.needsUpdate = true;
          if (it.costatCartell !== costat) {
            it.costatCartell = costat;
            const dx = costat * it.ample / 2;
            it.fons.object3D.position.set(dx, 0, -0.002);
            it.franja.object3D.position.set(costat * 0.012, 0, -0.001);
            it.text.object3D.position.set(dx, 0, 0.001);
          }
        });
      });
    },
    mostrar: function (v) {
      this.visibles = v;
      if (this.grup) { this.grup.object3D.visible = v; }
    }
  });

  // Entorn d'estudi (IBL) generat per codi, com al Cub del cor
  AFRAME.registerComponent('entorno-estudio', {
    init: function () {
      const escena = this.el;
      const crear = () => {
        if (this.fet || !escena.renderer) { return; }
        this.fet = true;
        const pmrem = new THREE.PMREMGenerator(escena.renderer);
        const sala = new THREE.Scene();
        const cub = new THREE.BoxGeometry();
        const envolvent = new THREE.Mesh(cub, new THREE.MeshStandardMaterial({
          color: 0xb8c0cc, emissive: new THREE.Color(0xb8c0cc),
          emissiveIntensity: 0.17, roughness: 1, metalness: 0, side: THREE.BackSide
        }));
        envolvent.scale.set(12, 7, 12);
        sala.add(envolvent);
        const panell = function (color, forca, px, py, pz, sx, sy, sz) {
          const mm = new THREE.Mesh(cub, new THREE.MeshStandardMaterial({
            color: 0x000000, emissive: new THREE.Color(color),
            emissiveIntensity: forca, roughness: 1, metalness: 0, side: THREE.DoubleSide
          }));
          mm.position.set(px, py, pz);
          mm.scale.set(sx, sy, sz);
          sala.add(mm);
        };
        panell(0xffffff, 1.8, 0.0, 3.1, 0.0, 7.0, 0.1, 7.0);
        panell(0xdce8ff, 0.9, -4.4, 0.6, 0.0, 0.1, 4.0, 7.0);
        panell(0xffe8cc, 0.7, 4.4, 0.4, 0.0, 0.1, 4.0, 7.0);
        panell(0xffffff, 0.6, 0.0, 0.5, -4.4, 7.0, 4.0, 0.1);
        escena.object3D.environment = pmrem.fromScene(sala, 0.03).texture;
        pmrem.dispose();
      };
      if (escena.renderStarted) { crear(); } else { escena.addEventListener('renderstart', crear); }
    }
  });

  // Ombra de recolzament sota el model de cada marcador
  AFRAME.registerComponent('sombras-auto', {
    schema: { tam: { default: 2.4 }, opacidad: { default: 0.32 } },
    init: function () {
      this.el.addEventListener('cervell-llest', (ev) => {
        const marcador = marcadorDe(ev.target);
        if (!marcador || marcador.dataset.ombra) { return; }
        marcador.dataset.ombra = '1';
        const terra = new THREE.Mesh(new THREE.PlaneGeometry(this.data.tam, this.data.tam),
                                     new THREE.ShadowMaterial({ opacity: this.data.opacidad }));
        terra.rotation.x = -Math.PI / 2;
        terra.position.y = 0.002;
        terra.receiveShadow = true;
        marcador.object3D.add(terra);
      });
    }
  });

  // Avís si el GLB no carrega
  AFRAME.registerComponent('diagnostic-model', {
    init: function () {
      this.el.addEventListener('model-error', function () {
        const caixa = document.querySelector('.error');
        if (!caixa) { return; }
        caixa.textContent = 'No s\'ha pogut carregar modelos/cervell.glb. Comproveu que el fitxer existeix i recarregueu.';
        caixa.style.display = 'block';
      });
    }
  });
})();
