# Quinta Geraldino — website

Site multipágina (PT/EN) da Quinta Geraldino, espaço para casamentos e eventos em Gemunde, Maia.
Feito pela UNO Studio. Site estático, pronto para GitHub Pages ou Netlify (sem passo de build no servidor).

## Páginas

| Ficheiro | Conteúdo |
|---|---|
| `index.html` | Início: apresentação com os momentos do dia, "Um dia na Quinta" hora a hora, tipos de evento, Réveillon 2027, chamada para visita |
| `espacos.html` | Salão interior, jardim, cerimónia ao ar livre, lounge, catering, mobiliário e decoração, estacionamento |
| `eventos.html` | Casamentos, batizados, aniversários, empresas e Réveillon 2027 |
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
