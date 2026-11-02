"""Gera as versões web das fotografias e os metadados da galeria."""
from PIL import Image, ImageOps
import json, os
from concurrent.futures import ProcessPoolExecutor

SRC = '/home/claude/all'
OUT = '/home/claude/site/assets/img'
PAGE = "039 013 161 027 001 025 038 166 097 029 064 104 050 191 018 219 059 051 055 186 200 005 014 173 177 176 175 020 008 033 042 040 162 169 082 107 036".split()
GAL = {
 "casamentos": "021 022 028 031 032 061 063 066 075 078 098 102 108 207 209 213 217 220".split(),
 "batizados": "046 047 048 049 052 053 054 057".split(),
 "festas": "184 185 187 188 190 193 194 197 201".split(),
 "natal": "170 171 180 181 182 183 189".split(),
 "mesas": "002 006 011 012 016 083 085 090 093 106 110 114 118 124 127 133 134 139 148 154 198 203 205 214".split(),
 "espacos": "035 041 026 030 105 157 158 160 163 165 168 174 208".split(),
}

def work(n):
    im = ImageOps.exif_transpose(Image.open(f'{SRC}/{n}.jpg')).convert('RGB')
    out = {}
    for suf, size, q in (('l', 1800, 78), ('m', 820, 74)):
        c = im.copy(); c.thumbnail((size, size), Image.LANCZOS)
        p = f'{OUT}/{n}-{suf}.jpg'
        if not os.path.exists(p):
            c.save(p, quality=q, optimize=True, progressive=True)
        out[suf] = c.size
    return n, out

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    allg = [i for v in GAL.values() for i in v]
    assert not set(allg) & set(PAGE), set(allg) & set(PAGE)
    assert len(set(PAGE)) == len(PAGE)
    assert len(set(allg)) == len(allg)
    with ProcessPoolExecutor() as ex:
        meta = dict(ex.map(work, sorted(set(PAGE + allg))))
    json.dump({"gallery": [{"id": i, "cat": c} for c, v in GAL.items() for i in v],
               "sizes": meta}, open('/home/claude/build/meta.json', 'w'))
    print(len(PAGE), 'page', len(allg), 'gallery')
