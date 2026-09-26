# Cub AR — Cervell humà

Cub de paper estil *Merge Cube* amb **quatre marcadors**. Cada cara amb marcador mostra al visor
web una vista diferent del **cervell en 3D**, separat en lòbuls i estructures. Les altres dues cares
porten el QR del visor i el títol.

Motor: **A-Frame 1.4.2 + AR.js 3.4.5** per CDN, marcadors *barcode* 3×3
(`detectionMode: mono_and_matrix; matrixCodeType: 3x3`). Projecte germà del Cub AR del cor.

## Contingut

| Fitxer | Funció |
|---|---|
| `index.html` | Visor AR web (4 marcadors, barcode 3×3 núm. 0-3) |
| `cervell.js` | Components del visor: `vista-cervell`, `explosio`, `rotuls`, entorn, ombres |
| `punts-rotuls.js` | Punts de superfície dels rètols (generat per `punts-rotuls.py`) |
| `plantilla.html` | Plantilla imprimible, cares de **6 cm**, 1 pàgina A4 vertical |
| `plantilla-8cm.html` | Plantilla imprimible, cares de **8 cm**, 2 pàgines A4 horitzontals |
| `cubo-cervell-6cm.pdf` | PDF per imprimir (A4 vertical, 210 × 297 mm, 1 pàgina) |
| `cubo-cervell-8cm.pdf` | PDF per imprimir (A4 horitzontal, 297 × 210 mm, 2 pàgines) |
| `marcadores/marker-0.png` … `marker-3.png` | Marcadors barcode 3×3 núm. 0 a 3 (col·lecció oficial d'AR.js, 226 × 226 px) |
| `modelos/cervell.glb` | Model 3D (4,0 MB, 38 nodes: un per grup i hemisferi; sense Draco ni animació) |
| `fuentes/dejavu-ca.json` + `.png` | Font SDF pròpia amb **à è é í ï ò ó ú ü ç** i **l·l** per als rètols 3D |
| `qr-visor.png` | QR amb l'URL pública del visor |
| `fer-qr.py` | Regenera el QR: `python fer-qr.py https://…` |
| `fer-model.py` | Regenera `modelos/cervell.glb` des de l'original (agrupa, simplifica, acoloreix) |
| `punts-rotuls.py` | Recalcula els punts dels rètols si canvia el model |
| `CREDITOS.md` | Origen, llicència (CC BY 4.0) i canvis del model |

## Les sis cares del cub

| Cara | Marcador | Contingut al visor |
|---|---|---|
| Davant | **núm. 0** | **Cervell sencer**, vista lateral, amb el nom dels lòbuls frontal, parietal, temporal i occipital i del cerebel |
| Dreta | **núm. 1** | **Lòbuls separats**: vista explosionada animada en bucle; els lòbuls s'allunyen del nucli i hi tornen. Rètols que segueixen cada peça: frontal, parietal, temporal, occipital, ínsula, substància blanca, cerebel i tronc de l'encèfal |
| Darrere | **núm. 2** | **Cerebel i tronc de l'encèfal**, girant sobre si mateix: hemisferis cerebel·losos, vermis, mesencèfal, protuberància i bulb raquidi |
| Esquerra | **núm. 3** | **Vista medial** (tall sagital d'un hemisferi): cos callós, gir cingulat, fòrnix, tàlem, hipotàlem i ventricle lateral |
| Dalt | — | QR que obre el visor |
| Baix | — | Títol del cub |

Cap cara repeteix la funció d'una altra: la 0 situa els lòbuls, la 1 mostra com encaixen (i què hi
ha a sota: ínsula i substància blanca), la 2 amplia el rombencèfal i la 3 ensenya l'interior.

Botons del visor: **Noms** (mostra o amaga tots els rètols) i **Crèdits** (cita del model).

## Com s'imprimeix

1. Obriu el PDF (`cubo-cervell-6cm.pdf` o `cubo-cervell-8cm.pdf`).
2. Imprimiu **al 100 %, sense «ajusta a la pàgina»**: si s'escala, els marcadors deixen de fer la
   mida que toca i la detecció empitjora.
3. Millor paper **mat** (els reflexos dificulten la lectura del marcador), de 160-200 g.
4. Retalleu per la vora exterior **incloent-hi les pestanyes grises**, doblegueu per totes les línies
   i enganxeu les pestanyes per dins.
5. La versió de 8 cm va en dues pàgines: la pestanya ratllada **UNIÓ** de la pàgina 2 s'enganxa per
   sota de la vora inferior de la cara CERVELL SENCER de la pàgina 1.

## Com s'utilitza

### A l'ordinador (webcam)

```powershell
cd D:\Cubo-AR-Cervell
python -m http.server 8080
```

Obriu <http://localhost:8080>, permeteu la càmera i ensenyeu una cara amb marcador.
Amb la webcam del portàtil és millor la versió de **8 cm**.

### Al mòbil de l'alumnat

La càmera del mòbil exigeix **HTTPS**: cal publicar la carpeta (GitHub Pages: Settings → Pages →
Deploy from branch → `main`, arrel). El QR imprès apunta a
`https://angelortiz90.github.io/cubo-ar-cervell/`; **si el repositori acaba amb un altre nom,
regenereu el QR** amb `python fer-qr.py <URL bona>` i torneu a generar els PDF.

### Regenerar els PDF

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu \
  --no-pdf-header-footer --print-to-pdf="D:\Cubo-AR-Cervell\cubo-cervell-6cm.pdf" \
  "file:///D:/Cubo-AR-Cervell/plantilla.html"
```

(igual per a `plantilla-8cm.html` → `cubo-cervell-8cm.pdf`).

## Memòria cau: pujar `?v=N` a cada publicació

A `index.html` el model, `cervell.js` i `punts-rotuls.js` es carreguen amb `?v=1`. **Cada vegada que
es publiqui una versió nova d'algun d'aquests fitxers, cal pujar el número** (`?v=2`, `?v=3`…); si no,
el mòbil i la CDN de GitHub Pages continuen servint la versió antiga.

## Notes tècniques

- **Un sol GLB per a les quatre cares.** Cada cara el carrega amb `vista-cervell="parts: …"`, que
  mostra només els nodes indicats (prefixos del nom: `frontal`, `cerebel`, `cos_callos_R`…) i escala
  i centra **només el que es veu** sobre el marcador.
- **L'explosió la fa el visor**, no el GLB: el component `explosio` desplaça cada node en una direcció
  pròpia (frontal cap endavant, parietal amunt, temporal avall i enfora, occipital enrere, cerebel i
  tronc avall). El valor `explosio.factor` l'anima el component `animation` d'A-Frame
  (`dir: alternate; loop: true`); els extrems -0,35 i 1,35 es retallen a 0-1 per fer una pausa a
  cada punta.
- **Rètols.** `rotuls="conjunt: …"` dibuixa punt, línia i cartell per a cada estructura. Els cartells
  es col·loquen cada fotograma en dues columnes als costats del model tal com el veu la càmera i
  s'amaguen quan l'estructura queda d'esquena. Els punts van enganxats al node, així segueixen
  l'explosió i el gir.
- **Orientació.** Cada model penja d'un pivot amb la rotació de la vista (lateral, 3/4, medial) o amb
  l'animació de gir (cara 2).
- **Tipografia.** La font per defecte d'A-Frame no té accents. Aquí es fa servir una font **SDF**
  (no MSDF: l'MSDF generat tenia taques a les cantonades dels glifs):

  ```html
  <a-text value="Hemisferi cerebel·lós" font="fuentes/dejavu-ca.json" shader="sdf"></a-text>
  ```

- **Il·luminació**: llums d'estudi i mapa d'entorn generat per codi (`entorno-estudio`), com al cub del cor.
- Cal connexió a internet: A-Frame i AR.js es carreguen per CDN.

## Prova sense AR

Per revisar les escenes sense càmera es genera una pàgina `_prueba.html` (ignorada per git) sense
`aframe-ar.js` ni `a-sky`, on cada `<a-marker>` passa a ser una entitat que es col·loca **després de
`model-loaded`**. Paràmetres: `?cara=0..3`, `&f=0.5` (fixa l'explosió), `&gir=40` (fixa el gir de la
cara 2). Les captures són a `variantes/capturas/`.

## Crèdits

**Model 3D** (CC BY 4.0, atribució obligatòria):
Kristen Browne; Heidi Schlehlein. 2023. 3D Reference Organ for Brain, Male v1.3 .
https://doi.org/10.48539/HBM929.XKCL.339 . Accessed on December 15, 2023.
Human Reference Atlas (HuBMAP), a partir de l'Allen Human Reference Atlas – 3D (Ding et al., 2016),
obtingut de NIH 3D (`3DPX-020960`). Model adaptat: vegeu els canvis a `CREDITOS.md`.

La font deriva de **DejaVu Sans** (llicència DejaVu Fonts, lliure). Els marcadors són de la col·lecció
oficial d'AR.js (`artoolkit-barcode-markers-collection`).
