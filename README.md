# Quinta do Geraldino — Website

Site estático (HTML + CSS + JS puro, sem frameworks) para a Quinta do Geraldino.
5 páginas: `index.html` (Home), `a-quinta.html`, `casamentos.html`, `eventos.html`, `contacto.html`.

## Antes de publicar

- Todos os quadrados a dizer `[ FOTO — ... ]` são placeholders. Substitui pelas
  fotografias reais dentro de `assets/img/` e troca cada `<div class="img-placeholder">`
  por `<img src="assets/img/nome-do-ficheiro.jpg" alt="...">`.
- Tudo marcado a verde `[ A CONFIRMAR ]` no site (capacidade, telefone, email,
  cerimónia civil, etc.) precisa de confirmação da Quinta antes de ir ao ar.

## 1. Colocar no GitHub

1. Cria um repositório novo em https://github.com/new (ex: `quinta-geraldino-site`).
2. No teu computador, dentro desta pasta:
   ```bash
   git init
   git add .
   git commit -m "Primeira versão do site"
   git branch -M main
   git remote add origin https://github.com/TEU-UTILIZADOR/quinta-geraldino-site.git
   git push -u origin main
   ```
   (substitui `TEU-UTILIZADOR` pelo teu nome de utilizador no GitHub)

## 2. Publicar no Netlify

1. Entra em https://app.netlify.com e faz login (podes usar a conta GitHub).
2. Clica em **Add new site → Import an existing project**.
3. Escolhe **GitHub** e seleciona o repositório `quinta-geraldino-site`.
4. Não precisas de "build command" nem "publish directory" especiais —
   deixa o **Publish directory** como `/` (a raiz) porque é um site estático.
5. Clica em **Deploy site**. Em menos de um minuto tens um link tipo
   `https://nome-aleatorio.netlify.app` já online.
6. (Opcional) Em **Site settings → Change site name** podes escolher um
   nome mais bonito, ex: `quintadogeraldino.netlify.app`.
7. (Opcional) Em **Domain settings** podes ligar um domínio próprio
   (ex: `quintadogeraldino.pt`) se o cliente tiver um.

A partir daqui, sempre que fizeres `git push` para o `main`, o Netlify
publica automaticamente a nova versão — não precisas de repetir o deploy manualmente.

## 3. Ativar o formulário de contacto (Netlify Forms — grátis)

O formulário em `contacto.html` já está preparado. Para começar a receber
os pedidos por email:

1. Abre `contacto.html`.
2. No `<form>`, muda `data-netlify="false"` para `data-netlify="true"`.
3. Faz commit e push. O Netlify deteta o formulário automaticamente no deploy seguinte.
4. Em **Site settings → Forms → Form notifications** no Netlify, adiciona
   o teu email (ou o do cliente) para receberes uma notificação a cada pedido.

## Estrutura de ficheiros

```
quinta-geraldino/
├── index.html
├── a-quinta.html
├── casamentos.html
├── eventos.html
├── contacto.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── assets/img/   ← colocar aqui as fotografias reais
```
