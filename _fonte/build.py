"""Gera as páginas estáticas do site da Quinta Geraldino.

Cada ficheiro em build/pages/*.html começa com um comentário JSON:
<!--{"file":"index.html","title":"...","title_en":"...","desc":"...","nav":"inicio","body":"page-home"}-->
Macro de imagem: <qg-img id="039" alt="..." en="..." class="..." sizes="..." eager>
"""
import json, re, html, os, glob

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)  # raiz do site
META = json.load(open(os.path.join(HERE, 'meta.json')))
SIZES = META['sizes']

NAV = [
    ("inicio", "index.html", "Início", "Home"),
    ("espacos", "espacos.html", "Espaços", "Spaces"),
    ("eventos", "eventos.html", "Eventos", "Events"),
    ("galeria", "galeria.html", "Galeria", "Gallery"),
    ("visitas", "visitas.html", "Agendar visita", "Book a visit"),
    ("contactos", "contactos.html", "Contactos", "Contact"),
]

ICON = {
 "wa": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"/></svg>',
 "menu": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
 "close": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5l14 14M19 5L5 19"/></svg>',
 "cal": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
 "left": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 5l-7 7 7 7"/></svg>',
 "right": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 5l7 7-7 7"/></svg>',
 "mail": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3.5 6l8.5 7 8.5-7"/></svg>',
 "pin": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.8" r="2.3"/></svg>',
}

LOGO = '''<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" fill="#547968"/><text x="24" y="20.5" text-anchor="middle" font-family="Gloock, Georgia, serif" font-size="15" fill="#F1EDE4">Q</text><path d="M18 24.5h12" stroke="#F1EDE4" stroke-width=".8"/><text x="24" y="40" text-anchor="middle" font-family="Gloock, Georgia, serif" font-size="15" fill="#F1EDE4">G</text></svg>'''

def esc(s): return html.escape(s, quote=True)

def img_macro(m):
    attrs = dict(re.findall(r'(\w[\w-]*)="([^"]*)"', m.group(1)))
    flags = re.sub(r'(\w[\w-]*)="[^"]*"', '', m.group(1)).split()
    i = attrs['id']
    s = SIZES[i]
    lw, lh = s['l']; mw = s['m'][0]
    only_m = attrs.get('size') == 'm'
    src = f'assets/img/{i}-m.jpg' if only_m else f'assets/img/{i}-l.jpg'
    out = [f'<img src="{src}"']
    if not only_m:
        out.append(f'srcset="assets/img/{i}-m.jpg {mw}w, assets/img/{i}-l.jpg {lw}w"')
        out.append(f'sizes="{attrs.get("sizes", "(max-width: 860px) 100vw, 50vw")}"')
    out.append(f'width="{lw}" height="{lh}"')
    out.append(f'alt="{attrs.get("alt", "")}"')
    if attrs.get('en'): out.append(f'data-en-alt="{attrs["en"]}"')
    if attrs.get('class'): out.append(f'class="{attrs["class"]}"')
    if attrs.get('style'): out.append(f'style="{attrs["style"]}"')
    if 'eager' in flags: out.append('fetchpriority="high"')
    else: out.append('loading="lazy" decoding="async"')
    return ' '.join(out) + '>'

def head(meta):
    return f'''<!doctype html>
<html lang="pt-PT" class="no-js" data-title-en="{esc(meta['title_en'])}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(meta['title'])}</title>
<meta name="description" content="{esc(meta['desc'])}">
<meta name="theme-color" content="#283024">
<meta property="og:type" content="website">
<meta property="og:title" content="{esc(meta['title'])}">
<meta property="og:description" content="{esc(meta['desc'])}">
<meta property="og:image" content="assets/img/039-l.jpg">
<meta property="og:locale" content="pt_PT">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/gloock-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/style.css">
{meta.get('extra_head', '')}
</head>'''

def header(active):
    links = '\n'.join(
        f'<a href="{href}"{" aria-current=\"page\"" if key == active else ""} data-en="{en}">{pt}</a>'
        for key, href, pt, en in NAV if key != 'visitas')
    mlinks = '\n'.join(
        f'<a href="{href}"{" aria-current=\"page\"" if key == active else ""} data-en="{en}">{pt}</a>'
        for key, href, pt, en in NAV)
    lang = '<div class="lang" role="group" aria-label="Idioma" data-en-aria="Language"><button type="button" data-lang="pt" aria-pressed="true"><span>PT</span></button><button type="button" data-lang="en" aria-pressed="false"><span>EN</span></button></div>'
    return f'''<a class="skip" href="#conteudo" data-en="Skip to content">Saltar para o conteúdo</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="Quinta Geraldino, página inicial" data-en-aria="Quinta Geraldino, home">{LOGO}<span>Quinta Geraldino</span></a>
    <nav class="nav" aria-label="Principal" data-en-aria="Main">
{links}
    </nav>
    <div class="header-actions">
      {lang}
      <a class="btn btn--limao header-cta" href="visitas.html" data-en="Book a visit">Agendar visita</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu-movel" aria-label="Abrir menu" data-en-aria="Open menu">{ICON['menu']}</button>
    </div>
  </div>
</header>
<div class="mobile-menu" id="menu-movel">
  <div class="top">
    <a class="brand" href="index.html">{LOGO}<span>Quinta Geraldino</span></a>
    <button class="close-btn" type="button" aria-label="Fechar menu" data-en-aria="Close menu">{ICON['close']}</button>
  </div>
  <nav aria-label="Menu" data-en-aria="Menu">
{mlinks}
  </nav>
  <div class="bottom">
    {lang}
    <a class="btn btn--limao" href="https://wa.me/351916604527" data-wa="Olá! Gostava de saber mais sobre a Quinta Geraldino." data-wa-en="Hello! I would like to know more about Quinta Geraldino.">{ICON['wa']}<span data-en="Talk on WhatsApp">Falar pelo WhatsApp</span></a>
  </div>
</div>'''

def footer(active):
    pages = '\n'.join(f'<li><a href="{href}" data-en="{en}">{pt}</a></li>' for key, href, pt, en in NAV)
    wa = '' if active == 'visitas' else f'''
<a class="wa-float" href="https://wa.me/351916604527" target="_blank" rel="noopener" data-wa="Olá! Gostava de saber mais sobre a Quinta Geraldino." data-wa-en="Hello! I would like to know more about Quinta Geraldino." aria-label="Falar pelo WhatsApp" data-en-aria="Talk on WhatsApp">{ICON['wa']}<span class="txt" data-en="Talk to us">Fale connosco</span></a>'''
    return f'''<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div>
        <a class="brand" href="index.html">{LOGO}<span>Quinta Geraldino</span></a>
        <p data-en="A welcoming place for weddings, christenings and celebrations, where we want everyone to feel at home.">Um lugar acolhedor para casamentos, batizados e celebrações, onde queremos que todos se sintam em casa.</p>
      </div>
      <div>
        <h3 data-en="Pages">Páginas</h3>
        <ul>{pages}</ul>
      </div>
      <div>
        <h3 data-en="Contact">Contactos</h3>
        <ul>
          <li><a href="https://wa.me/351916604527" target="_blank" rel="noopener">WhatsApp +351 916 604 527</a></li>
          <li><a href="tel:+351916604527" data-en="Call +351 916 604 527">Ligar +351 916 604 527</a></li>
          <li><a href="mailto:geral@jalmeida.pt">geral@jalmeida.pt</a></li>
          <li><a href="https://www.instagram.com/quinta_geraldino/" target="_blank" rel="noopener">Instagram</a></li>
        </ul>
      </div>
      <div>
        <h3 data-en="Visits">Visitas</h3>
        <ul>
          <li data-en="Monday to Friday, 9am to 5pm">Segunda a sexta, 9h às 17h</li>
          <li data-en="Weekends, 9am to 12pm">Fins de semana, 9h às 12h</li>
          <li><a href="https://www.google.com/maps/dir/?api=1&amp;destination=Rua+Nova+da+Bajouca+572,+4475-144+Gemunde,+Maia" target="_blank" rel="noopener">Rua Nova da Bajouca 572<br>4475-144 Gemunde, Maia</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>2026</span> Quinta Geraldino</span>
      <span data-en="Website by UNO Studio">Website por UNO Studio</span>
    </div>
  </div>
</footer>{wa}
<script src="assets/js/main.js"></script>
{''}'''

def gallery_html():
    labels = {"casamentos": ("Casamento", "Wedding"), "batizados": ("Batizado", "Christening"),
              "festas": ("Festa", "Party"), "natal": ("Festas de Natal", "Christmas"),
              "mesas": ("Mesa e detalhes", "Table and details"), "espacos": ("Espaços da Quinta", "Spaces at the Quinta")}
    # intercalar categorias para que a vista "Todas" seja variada
    groups = {}
    for g in META['gallery']: groups.setdefault(g['cat'], []).append(g)
    order, cats = [], list(groups)
    while any(groups.values()):
        for c in cats:
            if groups[c]: order.append(groups[c].pop(0))
    out = []
    for k, g in enumerate(order):
        i, c = g['id'], g['cat']
        w, h = SIZES[i]['m']
        pt, en = labels[c]
        out.append(f'<button type="button" data-cat="{c}" data-full="assets/img/{i}-l.jpg" aria-label="Ver fotografia: {pt}" data-en-aria="View photo: {en}"><img src="assets/img/{i}-m.jpg" width="{w}" height="{h}" alt="{pt}, Quinta Geraldino" data-en-alt="{en}, Quinta Geraldino" loading="{"eager" if k < 6 else "lazy"}" decoding="async"></button>')
    counts = {}
    for g in META['gallery']: counts[g['cat']] = counts.get(g['cat'], 0) + 1
    return '\n'.join(out), counts

def build():
    gal, counts = gallery_html()
    for path in sorted(glob.glob(os.path.join(HERE, 'pages', '*.html'))):
        src = open(path, encoding='utf-8').read()
        m = re.match(r'<!--(\{.*?\})-->\s*', src, re.S)
        meta = json.loads(m.group(1)); body = src[m.end():]
        body = body.replace('{{GALLERY}}', gal)
        for k, v in counts.items(): body = body.replace('{{N_' + k + '}}', str(v))
        body = body.replace('{{N_all}}', str(sum(counts.values())))
        for k, v in ICON.items(): body = body.replace('{{icon:' + k + '}}', v)
        body = re.sub(r'<qg-img\s+([^>]*)>', img_macro, body)
        page = (head(meta) + f'\n<body class="{meta.get("body", "page-inner")}">\n' + header(meta['nav'])
                + '\n<main id="conteudo">\n' + body + '\n</main>\n' + footer(meta['nav'])
                + meta.get('extra_js', '') + '\n</body>\n</html>\n')
        open(f'{OUT}/{meta["file"]}', 'w', encoding='utf-8').write(page)
        print('ok', meta['file'])

if __name__ == '__main__':
    build()
