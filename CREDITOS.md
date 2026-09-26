# Crèdits i llicències — Cub AR Cervell humà

## Model 3D d'origen

**Brain, Male (3D Reference Organ, v1.3)** — Human Reference Atlas (HRA, programa HuBMAP)

| | |
|---|---|
| Font | NIH 3D (National Institutes of Health), entrada `3DPX-020960` |
| Enllaç | https://3d.nih.gov/entries/3DPX-020960 |
| Autoria | Kristen Browne; Heidi Schlehlein |
| Dades de partida | Allen Human Reference Atlas – 3D, 2020 (Ding et al., 2016): 141 estructures d'un hemisferi, reflectides per fer el cervell sencer i redimensionades per al Visible Human Male |
| DOI | https://doi.org/10.48539/HBM929.XKCL.339 |
| **Llicència** | **Creative Commons Reconeixement 4.0 Internacional (CC BY 4.0)** — https://creativecommons.org/licenses/by/4.0/deed.ca |
| Atribució | **Obligatòria** (CC BY). Es mostra al visor (peu fix i botó «Crèdits»), al README i a les plantilles. |
| Fitxer baixat | `3d-vh-m-allen-brain.glb` (etiqueta `hra-reference-organ-brain-male-v1.3.glb`), 11 977 312 bytes, 26-09-2026 |
| SHA-256 | `2b9ad5b53e40e9f0936da74f7be38d2eed15604e26358c3870a0ea13499b9a35` |
| Còpia íntegra sense modificar | `variantes/cervell_original_NIH3D_3DPX-020960_HRA-v1.3.glb` |

### Cita exacta (tal com la demana la fitxa de NIH 3D)

> Kristen Browne; Heidi Schlehlein. 2023. 3D Reference Organ for Brain, Male v1.3 . https://doi.org/10.48539/HBM929.XKCL.339 . Accessed on December 15, 2023.

(La data «Accessed on December 15, 2023» forma part del text d'atribució que proposa la fitxa; la nostra
descàrrega és del 26-09-2026.)

Bibliografia de les dades: Ding, S.-L., Royall, J. J., Sunkin, S. M., et al. (2016). *Comprehensive
Cellular-Resolution Atlas of the Adult Human Brain*. Journal of Comparative Neurology, 524(16), 3127-3481.

## Canvis fets al model (obligatori indicar-los amb CC BY)

El fitxer `modelos/cervell.glb` és una **obra derivada**. Els canvis els fa l'script `fer-model.py`
(reproduïble) i es resumeixen així:

- **Agrupació:** les 283 malles de l'original (girs, nuclis i vies, esquerra i dreta) s'han agrupat en
  19 grups per hemisferi (38 nodes): lòbuls frontal, parietal, temporal i occipital, ínsula, sistema límbic
  (gir cingulat i parahipocampal), cerebel, vermis, mesencèfal, protuberància, bulb raquidi, cos callós,
  tàlem, hipotàlem, fòrnix, ventricles, nuclis basals, substància blanca i altres estructures internes.
- **Tres malles reclassificades pel lloc que ocupen:** a l'original, `frontal_pole` i
  `frontomarginal_gyrus` són a la cara inferior del lòbul temporal, i `posteroventral_putamen` és una
  franja d'escorça medial frontal. Es van comprovar a les captures i s'han posat al lòbul on són.
- **Simplificació:** de 656 268 a 165 552 triangles (quadric decimation, `fast_simplification`): el 20 %
  a l'escorça i el 50 % al cerebel i al tronc. Sense UV ni textures, amb normals suaus.
- **Recentrat** a l'origen (+Y amunt, +Z anterior, unitats en metres) i **colors didàctics** per grup.
- Sense Draco ni animació: la separació dels lòbuls la fa el visor.
- Pes: 11,98 MB → **4,0 MB**.

## Tipografia

`fuentes/dejavu-ca.json` + `.png`: font SDF generada amb `msdf-bmfont-xml` (mode `sdf`) a partir de
**DejaVu Sans Bold 2.37** amb el joc de caràcters català (à è é í ï ò ó ú ü ç, majúscules i punt volat
per a la ela geminada «l·l»). Llicència DejaVu Fonts (lliure i redistribuïble):
`fuentes/LICENSE-DejaVu.txt`.

## Marcadors

`marcadores/marker-0.png` … `marker-3.png`: col·lecció oficial de marcadors *barcode* 3×3 d'AR.js
(`nicolocarpignoli/artoolkit-barcode-markers-collection`).

## Eines

- Python 3.14 amb trimesh 4.12 i fast_simplification (agrupació i simplificació del GLB).
- A-Frame 1.4.2 i AR.js 3.4.5 (visor), Google Chrome sense capçalera (proves i PDF).
