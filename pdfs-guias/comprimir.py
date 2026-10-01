# Depois de rodar gerar-pdfs.js: recomprime as fotos de produto dentro dos
# PDFs e monta o arquivo com todos os guias. Sem isso, o guia do mercado passa
# de 18 MB (o Chromium grava as fotos sem compressão); com isso fica em ~4 MB.
# Troca só as fotos (imagens com 200 px ou mais) por JPEG, uma a uma: a
# reescrita automática de imagens do PyMuPDF quebrava os degradês do PDF.
# Requer PyMuPDF e Pillow: pip install pymupdf pillow
import glob, io, os, sys
import pymupdf
from PIL import Image

# Pasta opcional como argumento (padrão: a pasta deste script).
aqui = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
guias = sorted(glob.glob(os.path.join(aqui, '[1-4]-*.pdf')))

for f in guias:
    # Junta a capa (gerada à parte por gerar-pdfs.js) na frente do guia.
    capa = os.path.join(os.path.dirname(f), '_capa-' + os.path.basename(f))
    if os.path.exists(capa):
        # Insere a capa na frente do próprio guia (e não o contrário): assim
        # os links internos do sumário continuam apontando para as seções.
        junto = pymupdf.open(f)
        junto.insert_pdf(pymupdf.open(capa), start_at=0)
        junto.save(f + '.tmp')
        junto.close()
        os.replace(f + '.tmp', f)
        os.remove(capa)
    d = pymupdf.open(f)
    feitos = set()
    for pagina in d:
        for img in pagina.get_images(full=True):
            xref, largura, altura = img[0], img[2], img[3]
            if xref in feitos or largura < 200 or altura < 200:
                continue
            feitos.add(xref)
            pix = pymupdf.Pixmap(d, xref)
            if pix.alpha:
                pix = pymupdf.Pixmap(pix, 0)
            if pix.n != 3:
                pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
            im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
            im.thumbnail((420, 420))
            b = io.BytesIO()
            im.save(b, 'JPEG', quality=84, optimize=True)
            pagina.replace_image(xref, stream=b.getvalue())
    d.save(f + '.tmp', garbage=3, deflate=True)
    d.close()
    os.replace(f + '.tmp', f)

todos = pymupdf.open()
for f in guias:
    guia = pymupdf.open(f)
    inicio = todos.page_count
    todos.insert_pdf(guia)
    # Os links do sumário são destinos nomeados, que a junção descarta:
    # recria cada um apontando direto para a página dentro do arquivo único.
    for n, pagina in enumerate(guia):
        for link in pagina.get_links():
            if link.get('kind') == pymupdf.LINK_NAMED and link.get('page', -1) >= 0:
                todos[inicio + n].insert_link({'kind': pymupdf.LINK_GOTO, 'from': link['from'],
                                               'page': inicio + link['page']})
todos.set_metadata({'title': 'Guias · Rafaela Schumacher', 'author': 'Rafaela Schumacher'})
todos.save(os.path.join(aqui, '0-todos-os-guias.pdf'), garbage=3, deflate=True)
