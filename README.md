# Quinta Geraldino — website

Site multipágina (PT/EN) da Quinta Geraldino, espaço para casamentos e eventos em Gemunde, Maia.
Feito pela UNO Studio. Site estático, pronto para GitHub Pages ou Netlify (sem passo de build no servidor).

## Páginas

| Ficheiro | Conteúdo |
|---|---|
| `index.html` | Início: apresentação com os momentos do dia, "Um dia na Quinta" hora a hora, tipos de evento, Réveillon 2027, chamada para visita |
| `espacos.html` | Salão interior, jardim, cerimónia ao ar livre, lounge, catering, mobiliário e decoração, estacionamento |
| `eventos.html` | Casamentos, batizados, aniversários, empresas e Réveillon 2027 |
| `avaliacoes.html` | Avaliações de clientes com fotografias (enviadas pelo formulário, publicadas depois de verificadas) e ligação às avaliações do Google |
| `galeria.html` | 79 fotografias com filtros e visualizador (nenhuma repete as fotos usadas nas outras páginas) |
| `visitas.html` | Agendamento de visitas: calendário com os horários da Quinta e pedido enviado por WhatsApp ou email |
| `contactos.html` | WhatsApp, telefone, email, morada, mapa e horário de visitas |

## Regras do agendamento (`assets/js/visitas.js`)

- Segunda a sexta: 9h–17h, visitas de hora a hora (última às 16h, porque a visita dura até 60 min).
- Sábado e domingo: 9h–12h (última às 11h).
- Marcações a partir do dia seguinte, até 4 meses à frente.
- O pedido abre o WhatsApp da Quinta (+351 916 604 527) com a mensagem preenchida. A Quinta confirma ou sugere outra hora.

A área de cliente e da gerente (login, aprovação de visitas, calendário de ocupação e notificações automáticas) fica para a fase 2, com base de dados.

## Como editar

Os textos estão nas páginas em `_fonte/pages/`. Cada texto tem a versão inglesa no atributo `data-en`.
Depois de editar, gerar as páginas outra vez:

```bash
cd _fonte
python3 build.py   # escreve os .html na pasta raiz (ajustar ROOT/OUT no topo do ficheiro)
```

`proc.py` gera as versões web das fotografias (`-l` 1800 px e `-m` 820 px) a partir das originais.

## Tipografia

Gloock e Hanken Grotesk, alojadas no próprio site (`assets/fonts`, licença SIL Open Font License).

## Publicação (Netlify)

Sem comando de build. *Publish directory* = `/` (raiz). Cada `git push` para `main` publica a nova versão.

Os endereços da versão antiga (`a-quinta.html`, `casamentos.html`, `contacto.html`) redirecionam para as páginas novas, para não haver links partidos.

## Vista aérea 3D (página inicial)

`assets/js/aerial.js` desenha a Quinta em 3D (three.js) a partir da planta do Google Maps em satélite: salão de telhado branco, relvado, jardim, estacionamento e entrada pela Rua Nova da Bajouca. A câmara começa vista de cima e dá a volta à Quinta à medida que se desce a página. Em telemóveis sem WebGL aparece uma fotografia.

## Vídeo de drone

Quando houver vídeo aéreo, basta colocar:

- `assets/video/quinta-drone.mp4` (computador: 1920×1080, H.264, sem som, 20–40 s, até ~15 MB)
- `assets/video/quinta-drone-telemovel.mp4` (opcional, telemóvel: 720×1280 ou 1080×1920, até ~6 MB)

Depois correr `python3 _fonte/build.py`. Sem o ficheiro, a secção mostra fotografias em sequência.

## Avaliações (moderação)

1. O formulário de `avaliacoes.html` usa Netlify Forms (`name="avaliacao"`), com até 3 fotografias reduzidas no telemóvel antes de enviar.
2. No Netlify: **Forms → avaliacao** mostra cada envio. Ativar notificação por email em *Form notifications*.
3. Para publicar uma avaliação: guardar as fotografias em `assets/reviews/` e acrescentar a entrada em `assets/data/avaliacoes.json` (modelo em `avaliacoes-exemplo.json`). Publicar também as negativas, desde que respeitosas.
4. Nunca inventar avaliações nem copiar texto das avaliações do Google para o site.

## Animações

GSAP + ScrollTrigger (animações ao descer), Lenis (scroll suave só no computador) e View Transitions (transição entre páginas). Tudo desliga quando o sistema pede "reduzir movimento".
