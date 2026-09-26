# -*- coding: utf-8 -*-
"""Genera qr-visor.png amb l'URL publica del visor AR.

Us:  python fer-qr.py [URL]
Si el repositori remot acaba amb un altre nom, torneu-lo a executar amb l'URL
bona i regenereu els PDF de les plantilles.
"""
import sys
import qrcode

URL = sys.argv[1] if len(sys.argv) > 1 else "https://angelortiz90.github.io/cubo-ar-cervell/"

qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=2)
qr.add_data(URL)
qr.make(fit=True)
qr.make_image(fill_color="black", back_color="white").save("qr-visor.png")
print("qr-visor.png ->", URL)
