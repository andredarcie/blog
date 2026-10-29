---
title: "Making of: como faço vídeos 3D só com código e agentes de IA"
date: 2026-10-29
tags:
  - posts
  - tecnologia
translationKey: making-of-videos
---

![Seis vídeos feitos nesta semana: fotossíntese, fases da Lua, o Cavaleiro do Papel de Pano, A Janta e os dois episódios de Lendas de Divinolândia](/blog/img/making-of/videos.jpg)

Nos últimos dias eu fiz uma série de vídeos curtos: um sobre fotossíntese, um sobre as fases da Lua, uma fábula surreal sobre um cavaleiro de papel de pano, um poema sobre uma janta na roça e dois episódios de um documentário falso chamado *Lendas de Divinolândia*. Todos têm cenário 3D, personagens, câmera, narração, legenda e trilha sonora.

Nenhum deles foi gerado por um modelo de vídeo como o Sora ou o Veo. E eu não abri o Blender, um editor de vídeo ou um programa de música nenhuma vez.

Tudo é código. Cada árvore, cada personagem, cada movimento de câmera, cada nota da trilha. Quem escreve esse código é um agente de IA (o Claude Code). Eu faço o papel de diretor: escrevo ou dito a ideia, olho as prévias e peço ajustes.

Este post é o making of desse processo, com as partes técnicas e com outros projetos fazendo coisas parecidas.

## A diferença para o "vídeo de IA" comum

Quando se fala em vídeo com IA, quase sempre é um modelo que gera **pixels**: você escreve um prompt e recebe um clipe pronto. Funciona, mas você não controla quase nada. O personagem muda de rosto entre uma cena e outra, não dá para mover a câmera meio metro para a esquerda, e cada ajuste é uma nova rolada de dados.

O que eu faço é o caminho contrário: a IA não gera o vídeo, ela gera **o programa que desenha o vídeo**. E isso muda tudo:

- **Tudo é editável.** "A capivara está parecendo uma bolha rosa" vira uma mudança na geometria e na luz, não um prompt novo torcendo para dar certo.
- **Tudo é consistente.** O Leobaldo do episódio 1 é o mesmo objeto 3D no episódio 2.
- **Tudo é determinístico.** Renderizar duas vezes dá exatamente o mesmo vídeo, quadro por quadro.

O preço é a estética: são cenas low-poly, mais perto de um jogo do que de um filme. Para o que eu quero contar, isso é uma vantagem.

## A estrutura de cada vídeo

Cada vídeo é uma pasta com poucos arquivos:

| Arquivo | O que faz |
|---|---|
| `narracao.json` | O roteiro: cada fala com texto, legenda, pausa e qual voz fala |
| `cena.js` | A cena 3D em [three.js](https://threejs.org/), com cenários, personagens e câmeras |
| `musica.mjs` | A trilha e os efeitos, sintetizados amostra por amostra |
| `capa.mjs` | Gera a capa 1080×1920 que vai para as redes |
| `post.json` | Título, legenda e hashtags da publicação |

E uns poucos scripts compartilhados: `voz.mjs` gera a narração, `render.mjs` grava os quadros e monta o MP4.

Para dar uma ideia de tamanho: o `cena.js` do episódio 2 de *Lendas* tem 1.657 linhas e a trilha, 272. Eu não escrevi nenhuma delas.

## 1. O roteiro manda em tudo

Tudo começa no `narracao.json`. Um trecho real do episódio 2:

```json
"voz": {
  "motor": "omnivoice",
  "design": "male, middle-aged, low pitch",
  "speed": 1.05
},
"vozes": {
  "bruxa": { "design": "female, elderly, low pitch", "speed": 0.95 }
},
"falas": [
  { "id": "s1", "texto": "Divinolândia. Uma pequena cidade no alto da serra, no interior de São Paulo.", "pausa": 0.3 },
  ...
]
```

A ordem do pipeline é importante: **primeiro a voz, depois a imagem**. A duração real de cada fala gravada define a linha do tempo do vídeo. A cena e a música são desenhadas em cima dessa linha do tempo, e não o contrário. Assim a câmera chega na igreja exatamente quando o narrador diz "igreja".

## 2. A voz: desenhada, clonada e conferida por outra IA

A narração roda **local**, na minha placa de vídeo (uma RTX 3060 de 6 GB), com o [OmniVoice](https://huggingface.co/k2-fsa/OmniVoice), um modelo de voz aberto.

O processo tem três etapas:

1. **Desenhar a voz.** Em vez de clonar a voz de alguém, eu descrevo uma: `"male, middle-aged, low pitch"`. O modelo cria uma voz a partir da descrição, e ela vira a referência do vídeo.
2. **Clonar essa voz em cada fala.** Assim o narrador soa igual do começo ao fim, e de um episódio para o outro (o episódio 2 reaproveita a referência do 1).
3. **Gravar até três tomadas e escolher a melhor.** Um reconhecedor de fala transcreve cada tomada, e o script fica com a que foi entendida com mais fidelidade ao texto. É um controle de qualidade automático: se o modelo engoliu uma palavra, a tomada perde.

Tem também os truques de dublagem. O padre do episódio 2 anda de "Uno Mille Fire", e o modelo lia isso de um jeito estranho. A solução foi escrever a fala foneticamente ("Uno Míle Fáier") e deixar a grafia certa num campo `legenda` separado.

## 3. A imagem: renderização offline, quadro a quadro

Esta é a parte que deixa tudo determinístico. A cena **não roda em tempo real** enquanto alguém grava a tela. Ela expõe uma única função:

```js
window.__frame = function (t) {
  // posiciona tudo exatamente como deve estar no segundo t
};
```

O `render.mjs` abre a página num Chromium sem janela (via [Playwright](https://playwright.dev/), com a GPU ligada) e faz um laço simples:

```js
for (let i = 0; i < TOTAL * FPS; i++) {
  await page.evaluate(t => window.__frame(t), i / FPS);
  await page.screenshot({ path: `quadros/${i}.jpg`, quality: 93 });
}
```

Um vídeo de 2:59 a 30 fps tem 5.370 quadros. Se a cena for pesada e o computador só conseguir desenhar 5 quadros por segundo, não tem problema: cada quadro leva o tempo que precisar, e o vídeo final sai liso. É o mesmo princípio de qualquer renderizador de animação, do Blender à Pixar. Na web, a referência clássica dessa ideia é o [CCapture.js](https://github.com/spite/ccapture.js), que congela o relógio do navegador para capturar canvas quadro a quadro.

No fim, o ffmpeg junta os quadros com o áudio (H.264, CRF 19).

### Como a IA "vê" o que fez

O agente não assiste ao vídeo, mas lê imagens. Então o fluxo de revisão é:

- renderizar só alguns instantes (`--t=3,9,21`);
- montar uma **folha de contato**, uma grade com um quadro de cada take;
- olhar a folha e corrigir o que está errado.

Foi assim que apareceram e foram corrigidos problemas como:

- a câmera dentro de uma parede;
- a mão do personagem tampando o rosto ao fumar um palheiro;
- dinossauros pequenos demais no horizonte;
- uma bruxa escondida dentro do rancho.

Alguns problemas pediram matemática de verdade. A câmera suavizada com curvas de Hermite passava do ponto em saltos grandes; trocar para a interpolação monotônica de Fritsch–Butland resolveu.

## 4. A música: nenhum áudio gravado

Não há nenhum sample, nenhuma música de banco de áudio. A trilha é **sintetizada amostra por amostra**, 48 mil números por segundo, em JavaScript puro:

- um piano elétrico por síntese FM;
- cordas para as fases da Lua, num clima "à Kubrick";
- uma valsa de caixinha de música com pizzicato para o cavaleiro;
- para a maldição da bruxa no episódio 2, uma percussão industrial de canos e chapas enferrujadas, zumbido saturado e sirene, no espírito da trilha de *Silent Hill*.

Como a música também lê a linha do tempo, os acentos caem nos momentos certos. O sino toca quando a narração fala do sino, e a música corta um quarto de segundo antes do jumpscare para o susto bater mais forte. O gerador de números aleatórios tem semente fixa, então a trilha também é determinística.

## 5. Lendas de Divinolândia: filmando dentro de um jogo

Os dois episódios de *Lendas* têm um ingrediente a mais. Eu tenho um jogo, o **Divino City**, uma versão jogável da minha cidade, Divinolândia, reconstruída a partir do OpenStreetMap e de imagens de satélite. Em vez de criar a cidade de novo, os episódios são **filmados dentro do jogo**.

O jogo tem ganchos de desenvolvimento que deixam um script externo controlar o relógio e desenhar um quadro de cada vez. O `cena.js` é injetado na página do jogo e acrescenta tudo o que a cidade não tem:

- o Leobaldo e os gnomos;
- o padre e o Uno;
- a multidão na frente da Matriz;
- a capivara gigante.

O que não cabe na cidade (o vale de 1850 com o rancho de tropeiros, o espaço sideral, o interior da torre do sino) vai para um **palco**: um segundo renderizador 3D, num canvas por cima do jogo, que entra e sai por corte de câmera.

A Lagoa das Popular, que no jogo não existia, foi reconstruída com o contorno real do OpenStreetMap e as árvores do bosque ao lado, posicionadas a partir da imagem de satélite.

Isso tem nome antigo: **machinima**, usar o motor de um jogo como estúdio de filmagem. É o que *Red vs. Blue* fazia dentro de Halo em 2003 ([Wikipedia](https://en.wikipedia.org/wiki/Machinima)). A diferença é que aqui o jogo, as câmeras e os atores também foram escritos por IA.

### O problema da memória

O episódio 2 quase não foi gravado. Gravar milhares de quadros a partir do servidor de desenvolvimento do jogo acumulava memória até o sistema matar o processo.

A solução teve três partes:

- filmar a partir do **build de produção** do jogo, servido por um servidor estático mínimo;
- gravar em **lotes de 900 quadros**, com um navegador novo a cada lote;
- esperar a memória baixar entre os lotes, e retomar de onde parou se algo falhar.

Além de não cair mais, ficou cerca de quatro vezes mais rápido: um episódio inteiro passou a ser gravado em menos de meia hora.

## 6. Formato, capa e publicação

Algumas regras viraram **skills** do agente, arquivos de instrução que ele carrega sempre que o assunto aparece, para eu não precisar repetir:

- **Formato:** todo vídeo sai vertical, 9:16, 1080×1920, para TikTok, Reels e Shorts. O texto fica fora das zonas cobertas pela interface dos apps (topo, rodapé e a coluna de botões da direita).
- **Duração:** no máximo 2:59. É um teto, não uma meta.
- **Capa:** todo vídeo tem uma capa própria, gerada por código (um HTML com o melhor quadro do vídeo e o título, fotografado pelo navegador).

A publicação também é feita pelo agente, no meu próprio Chrome, pela extensão do Claude. Como ela só envia arquivos de até 10 MB, e um vídeo desses tem 300 a 700 MB:

1. o vídeo é cortado em pedaços de 9,4 MB;
2. cada pedaço sobe para um campo de arquivo escondido na página;
3. o vídeo é remontado dentro do navegador, conferido byte a byte, e entregue ao YouTube, ao TikTok e ao Instagram como se eu tivesse arrastado o arquivo.

Uma lição aprendida hoje: no TikTok, a capa precisa ser enviada antes de publicar, porque depois ele só deixa escolher um quadro do vídeo. Os dois episódios saíram sem capa e tiveram que ser apagados e postados de novo. Isso também virou regra na skill.

Os episódios estão no ar:

- *Lendas de Divinolândia*, ep. 1: [YouTube](https://youtube.com/shorts/ai12HZOxuDg) · [TikTok](https://www.tiktok.com/@andre_do_vr/video/7702137575204539700)
- *Lendas de Divinolândia*, ep. 2: [YouTube](https://youtube.com/shorts/cnv0NXUmYWc) · [TikTok](https://www.tiktok.com/@andre_do_vr/video/7702139052476222740) · [Instagram](https://www.instagram.com/andre.darcie/reel/DfDndPsOmKe/)
- *A Janta*: [YouTube](https://youtube.com/shorts/H9zl7C5r9XQ)

## Isso tem nome?

Fui pesquisar quem mais faz isso e como estão chamando. Ainda não há um nome único, mas três termos estão aparecendo:

- **Vídeo programático** (*programmatic video*): o termo mais comum. Vem do [Remotion](https://www.remotion.dev/), um framework que faz vídeos com React. Ele virou o caminho mais popular para agentes fazerem vídeo, e o próprio Remotion publica [skills para o Claude Code](https://remotion.dev/docs/ai/claude-code).
- **Vídeo via código** (*code-to-video*): o nome que aparece na pesquisa acadêmica. O [Code2Video](https://arxiv.org/abs/2510.01174), do Show Lab da Universidade Nacional de Singapura, usa três agentes: um planeja a aula, outro escreve o código da animação e um terceiro olha os quadros renderizados e corrige o layout. É quase exatamente o meu ciclo de folha de contato. Na mesma linha estão o [Manimator](https://arxiv.org/html/2507.14306v1), que transforma artigos científicos em animações, e um [pipeline pedagógico](https://arxiv.org/pdf/2604.05266) com narração e revisão humana. Esses projetos usam o [Manim](https://www.manim.community/), a biblioteca criada pelo 3Blue1Brown.
- ***Vibe motion*** ou ***vibe animation***: o apelido do momento, derivado de *vibe coding*. Você descreve, a IA escreve o código da animação.

O projeto mais parecido com o meu pipeline é o [HyperFrames](https://github.com/heygen-com/hyperframes), que a HeyGen abriu este ano. É um framework que transforma uma página HTML em MP4 de forma determinística, com Chrome e ffmpeg, feito para ser usado por agentes de IA, e tem até um adaptador para cenas em three.js. É, em essência, o `render.mjs` que eu e o agente escrevemos, só que embalado como produto.

O que eu ainda não encontrei com frequência é o pacote completo: mundos 3D inteiros com personagens, voz própria, trilha sintetizada e roteiro, tudo escrito por IA. A maioria dos exemplos é *motion graphics* (texto, gráficos e logos animados) ou aulas em 2D. Se fosse para dar um nome ao que eu faço, eu diria **vídeo 3D programático feito por IA**. E os episódios de *Lendas* continuam sendo machinima.

## O que eu levo disso

O que mais me impressiona não é a qualidade de nenhum vídeo isolado, e sim o ciclo. Uma ideia que eu tenho de manhã vira um vídeo de três minutos, com cenário, voz e música, no mesmo dia. Quando algo fica feio, eu digo o que está feio, e a correção é uma mudança em código, não uma nova aposta.

Eu escrevi aqui antes que, pela primeira vez, consigo [criar na velocidade das ideias](/blog/posts/criar-na-velocidade-das-ideias/). Esses vídeos são o exemplo mais claro disso que já fiz. Uma semana atrás eu não sabia fazer nenhum deles.
