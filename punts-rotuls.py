# -*- coding: utf-8 -*-
"""Calcula el punt de superficie de cada retol i escriu punts-rotuls.js.

Per a cada retol es dona el node del GLB i un punt EXTERIOR situat al costat
des d'on es mira aquella cara; el punt del retol es el punt de la malla del
node mes proper a aquest punt exterior (queda a la superficie visible).
L'ordre de cada llista ha de coincidir amb window.ROTULS de cervell.js.

Us:  python punts-rotuls.py
"""
import json
import os
import numpy as np
import trimesh

AQUI = os.path.dirname(os.path.abspath(__file__))
GLB = os.path.join(AQUI, 'modelos', 'cervell.glb')
SORTIDA = os.path.join(AQUI, 'punts-rotuls.js')

# (node, punt exterior en metres; x+ = costat R, y+ = amunt, z+ = anterior)
CONJUNTS = {
    'sencer': [   # vista lateral del costat R
        ('frontal_R', (0.12, 0.035, 0.045)),
        ('parietal_R', (0.12, 0.045, -0.035)),
        ('temporal_R', (0.12, -0.020, 0.000)),
        ('occipital_R', (0.12, -0.005, -0.070)),
        ('cerebel_R', (0.12, -0.045, -0.045)),
    ],
    'explosio': [
        ('frontal_R', (0.12, 0.030, 0.060)),
        ('parietal_R', (0.12, 0.050, -0.030)),
        ('temporal_R', (0.12, -0.020, 0.010)),
        ('occipital_R', (0.12, -0.005, -0.075)),
        ('insula_R', (0.12, 0.000, 0.015)),
        ('substancia_blanca_R', (0.12, 0.030, -0.005)),
        ('cerebel_R', (0.12, -0.045, -0.045)),
        ('protuberancia_R', (0.10, -0.035, 0.040)),
    ],
    'cerebel': [
        ('cerebel_R', (0.12, -0.040, -0.035)),
        ('cerebel_L', (-0.12, -0.040, -0.035)),
        ('vermis_R', (0.00, -0.030, -0.120)),
        ('mesencefal_R', (0.02, -0.012, 0.100)),
        ('protuberancia_R', (0.02, -0.035, 0.100)),
        ('bulb_R', (0.02, -0.060, 0.100)),
    ],
    'medial': [   # cara medial del costat R (es mira des de x-)
        ('cos_callos_R', (-0.05, 0.028, 0.010)),
        ('limbic_R', (-0.05, 0.042, -0.010)),
        ('fornix_R', (-0.05, 0.004, -0.004)),
        ('talem_R', (-0.05, -0.002, -0.012)),
        ('hipotalem_R', (-0.05, -0.013, 0.016)),
        ('ventricles_R', (-0.05, 0.012, 0.022)),
    ],
}


def main():
    escena = trimesh.load(GLB)
    malles = {}
    for node in escena.graph.nodes_geometry:
        T, g = escena.graph[node]
        m = escena.geometry[g].copy()
        m.apply_transform(T)
        malles[node] = m
    res = {}
    for nom, llista in CONJUNTS.items():
        res[nom] = []
        for node, ext in llista:
            p, dist, _ = trimesh.proximity.closest_point(malles[node], np.array([ext]))
            res[nom].append([round(float(x), 5) for x in p[0]])
            print(nom, node, res[nom][-1])
    with open(SORTIDA, 'w', encoding='utf-8') as f:
        f.write('// Generat per punts-rotuls.py: punts de superficie dels retols (coordenades del GLB)\n')
        f.write('window.PUNTS_ROTULS = ' + json.dumps(res) + ';\n')


if __name__ == '__main__':
    main()
