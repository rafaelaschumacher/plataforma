# Depois de rodar gerar-pdfs.js: recomprime as fotos dentro dos PDFs e monta
# o arquivo com todos os guias. Sem isso, o guia do mercado passa de 15 MB
# (o Chromium grava as fotos sem compressão); com isso fica em ~2,5 MB, leve
# para mandar pelo WhatsApp. Requer PyMuPDF: pip install pymupdf
import glob, os, pymupdf

aqui = os.path.dirname(os.path.abspath(__file__))
guias = sorted(glob.glob(os.path.join(aqui, '[1-4]-*.pdf')))
for f in guias:
    d = pymupdf.open(f)
    d.rewrite_images(dpi_threshold=160, dpi_target=150, quality=82, lossy=True, lossless=True)
    d.save(f + '.tmp', garbage=4, deflate=True)
    d.close()
    os.replace(f + '.tmp', f)

todos = pymupdf.open()
for f in guias:
    todos.insert_pdf(pymupdf.open(f))
todos.set_metadata({'title': 'Guias · Rafaela Schumacher', 'author': 'Rafaela Schumacher'})
todos.save(os.path.join(aqui, '0-todos-os-guias.pdf'), garbage=4, deflate=True)
