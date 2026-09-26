# -*- coding: utf-8 -*-
"""Genera modelos/cervell.glb a partir de l'original del Human Reference Atlas.

Original (intacte): variantes/cervell_original_NIH3D_3DPX-020960_HRA-v1.3.glb
Llicencia: CC BY 4.0 (vegeu CREDITOS.md).

Que fa:
  1. Agrupa les 283 malles (girs i nuclis de l'atles Allen) en lobuls i
     estructures, un node per grup i hemisferi (p. ex. frontal_R, frontal_L).
  2. Redueix els triangles (fast_simplification) per quedar per sota de 5 MB.
  3. Centra el cervell a l'origen (+Y amunt, +Z anterior) i assigna un color
     per grup. Sense Draco ni animacio: l'explosio la fa el visor.

Us:  python fer-model.py
"""
import json
import os
import sys

import numpy as np
import trimesh
import fast_simplification

AQUI = os.path.dirname(os.path.abspath(__file__))
ORIGEN = os.path.join(AQUI, 'variantes', 'cervell_original_NIH3D_3DPX-020960_HRA-v1.3.glb')
DESTI = os.path.join(AQUI, 'modelos', 'cervell.glb')
RESUM = os.path.join(AQUI, 'variantes', 'grups.json')

# --- Grups: nom de l'estructura Allen (sense prefix ni costat) -> grup ------
# ATENCIO: a l'original hi ha tres malles amb el nom canviat, comprovat per la
# seva posicio i a les captures: 'frontal_pole' i 'frontomarginal_gyrus' son a
# la cara inferior del lobul temporal, i 'posteroventral_putamen' es una franja
# de l'escorca medial frontal (per sobre del gir cingulat). Es classifiquen pel
# lloc que ocupen, no pel nom.
GRUPS = {
    'frontal': """precentral_gyrus superior_frontal_gyrus middle_frontal_gyrus
        inferior_frontal_gyrus_opercular_part inferior_frontal_gyrus_triangular_part
        frontal_operculum lateral_orbital_gyrus medial_orbital_gyrus
        anterior_intermediate_orbital_gyrus posterior_intermediate_orbital_gyrus
        gyrus_rectus_straight_gyrus rostral_gyrus paracingulate_gyrus
        paracentral_lobule_rostral_part posteroventral_putamen""",
    'parietal': """postcentral_gyrus supramarginal_gyrus angular_gyrus
        supraparietal_lobule precuneus paracentral_lobule_caudal_part parietal_operculum""",
    'temporal': """superior_temporal_gyrus middle_temporal_gyrus inferior_temporal_gyrus
        temporal_pole transverse_temporal_gyrus_Heschls_gyrus planum_polare planum_temporale
        occipitotemporal_fusiform_gyrus_temporal_part perirhinal_gyrus_rostral_part_of_FuGt
        frontal_pole frontomarginal_gyrus""",
    'occipital': """cuneus lingual_gyrus_medial_occipitotemporal_gyrus superior_occipital_gyrus
        inferior_occipital_gyrus occipital_pole lateral_occipitotemporal_fusiform_gyrus_occipital_part""",
    'insula': """long_insular_gyri short_insular_gyri limen_insula
        frontal_agranular_insular_cortex_area_Fl temporal_agranular_insular_cortex_area_Tl""",
    'limbic': """cingulate_gyrus_caudal_posterior_part cingulate_gyrus_rostral_anterior_part
        anterior_parahippocampal_gyrus posterior_parahippocampal_gyrus ingulo_parahippocampal_isthmus
        subcallosal_gyrus_parolfactory_gyrus gyrus_ambiens piriform_region""",
    'cerebel': """lateral_hemisphere_of_cerebellum paravermis_of_cerebellum cerebellar_deep_nuclei
        white_matter_of_hindbrain superior_cerebellar_peduncle_brachium_conjunctivum
        middle_cerebellar_peduncle inferior_cerebellar_peduncle""",
    'vermis': "cerebellar_vermis",
    'mesencefal': """midbrain_tegmentum cerebral_peduncle_crus_cerebri red_nucleus substantia_nigra
        superior_colliculus inferior_colliculus pretectal_region cerebral_aqueduct""",
    'protuberancia': "basilar_part_of_pons pontine_tegmentum",
    'bulb': """tegmentum_of_medulla_oblongata pyramidal_part_of_medulla_oblongata inferior_olive
        central_canal_of_medulla_oblongata""",
    'cos_callos': "corpus_callosum",
    'talem': """thalamus anterior_nuclear_complex_of_thalamus centromedian_nucleus_of_thalamus
        lateral_dorsal_nucleus_of_thalamus lateral_posterior_nucleus_of_thalamus
        mediodorsal_nucleus_of_thalamus midline_nuclear_complex parafascicular_nucleus_of_thalamus
        pulvinar_of_thalamus reuniens_nucleus_medioventral_nucleus_of_thalamus
        ventral_anterior_nucleus_of_thalamus ventral_lateral_nucleus_of_thalamus
        ventral_posterior_lateral_nucleus ventral_posterior_medial_nucleus habenular_nuclei
        dorsal_lateral_geniculate_nucleus medial_geniculate_nuclei""",
    'hipotalem': """hypothalamus mammillary_region_of_HTH preoptic_region_of_HTH
        supraoptic_region_of_HTH tuberal_region_of_HTH""",
    'fornix': "fornix",
    'ventricles': """anterior_horn_of_lateral_ventricle body_of_lateral_ventricle
        atrium_of_lateral_ventricle posterior_horn_of_lateral_ventricle
        inferior_horn_of_lateral_ventricle third_ventricle fourth_ventricle""",
    'nuclis_basals': """head_of_caudate body_of_caudate tail_of_caudate putamen
        external_segment_of_globus_pallidus
        internal_segment_of_globus_pallidus nucleus_accumbens claustrum""",
    'substancia_blanca': "white_matter_of_forebrain",
    # la resta (amigdala, hipocamp, nuclis petits...) va a 'interior'
}
NOM_GRUP = {}
for g, noms in GRUPS.items():
    for n in noms.split():
        NOM_GRUP[n] = g

# Colors sRGB per grup
COLORS = {
    'frontal': '#4F86C6', 'parietal': '#E8B04B', 'temporal': '#5BAF6A',
    'occipital': '#C9577F', 'insula': '#9B7ED1', 'limbic': '#E58B6B',
    'cerebel': '#D9774A', 'vermis': '#B8542C',
    'mesencefal': '#8FD3CC', 'protuberancia': '#4FA3A0', 'bulb': '#2E7D7A',
    'cos_callos': '#F4EFE6', 'talem': '#7E6BC4', 'hipotalem': '#D6A3D8',
    'fornix': '#F3D98B', 'ventricles': '#5EC8F0', 'nuclis_basals': '#A68A64',
    'substancia_blanca': '#D8CCBA', 'interior': '#B8A99A',
}

# Fraccio de triangles que es conserva (la resta es simplifica)
REDUCCIO = float(sys.argv[1]) if len(sys.argv) > 1 else 0.20
# El cerebel i el tronc de l'original ja son de baixa resolucio i a la cara 2
# es veuen molt ampliats: se'n conserva la meitat dels triangles. (Suavitzar-los
# amb Taubin es va provar i es va descartar: les vores obertes de la linia mitjana
# fan punxes i separen les dues meitats del tronc.)
REDUCCIO_GRUP = {'cerebel': 0.5, 'vermis': 0.5, 'mesencefal': 0.5, 'protuberancia': 0.5, 'bulb': 0.5}


def srgb_a_lineal(h):
    c = np.array([int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)])
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def main():
    escena = trimesh.load(ORIGEN)
    grups = {}
    for node in escena.graph.nodes_geometry:
        T, g = escena.graph[node]
        if not node.startswith('Allen_') or node[-2:] not in ('_L', '_R'):
            continue
        base, costat = node[6:-2], node[-1]
        grup = NOM_GRUP.get(base, 'interior')
        m = escena.geometry[g].copy()
        m.apply_transform(T)
        grups.setdefault((grup, costat), []).append((base, m))

    # Centre = centre de la caixa de tot el cervell
    tot = trimesh.util.concatenate([m for v in grups.values() for _, m in v])
    centre = tot.bounds.mean(axis=0)

    sortida = trimesh.Scene()
    resum = {}
    total_tris = 0
    for (grup, costat), parts in sorted(grups.items()):
        malles = []
        for base, m in parts:
            m = m.copy()
            m.apply_translation(-centre)
            m.merge_vertices()
            n = len(m.faces)
            if n > 400:
                r = REDUCCIO_GRUP.get(grup, REDUCCIO)
                v, f = fast_simplification.simplify(m.vertices.astype(np.float32),
                                                    m.faces.astype(np.int32),
                                                    target_reduction=1 - r)
                m = trimesh.Trimesh(v, f, process=True)
            malles.append(m)
        m = trimesh.util.concatenate(malles)
        m.merge_vertices()
        # Nomes posicions + normals suaus (sense UV)
        m = trimesh.Trimesh(m.vertices, m.faces, process=False)
        _ = m.vertex_normals
        col = np.append(srgb_a_lineal(COLORS[grup]), 1.0)
        m.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
            name=grup, baseColorFactor=col, metallicFactor=0.0, roughnessFactor=0.55,
            doubleSided=False))
        nom = f'{grup}_{costat}'
        sortida.add_geometry(m, node_name=nom, geom_name=nom)
        resum[nom] = {'triangles': int(len(m.faces)),
                      'estructures': sorted(b for b, _ in parts),
                      'centre': m.bounds.mean(axis=0).round(5).tolist(),
                      'min': m.bounds[0].round(5).tolist(), 'max': m.bounds[1].round(5).tolist()}
        total_tris += len(m.faces)

    os.makedirs(os.path.dirname(DESTI), exist_ok=True)
    sortida.export(DESTI, include_normals=True)
    with open(RESUM, 'w', encoding='utf-8') as f:
        json.dump(resum, f, ensure_ascii=False, indent=1)
    print('triangles', total_tris, '| bytes', os.path.getsize(DESTI), '| centre original', centre.round(4))


if __name__ == '__main__':
    main()
