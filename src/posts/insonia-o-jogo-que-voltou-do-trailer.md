---
title: "Eu só tinha o trailer: como a IA trouxe de volta um jogo meu perdido há 12 anos"
date: 2026-11-04
tags:
  - posts
  - jogos
  - tecnologia
  - ia
translationKey: insonia-remake
---

![Três momentos do trailer de 2014 ao lado do remake rodando no navegador: a cela, o flashback no hospital e o quarto do urso](/blog/img/insonia/trailer-x-remake.jpg)

Em 2014 eu fiz um jogo de terror no RPG Maker VX Ace chamado **Insônia**. Um homem acorda numa cela sem lembrar de nada, encontra uma carta que diz *"Nascido do fogo. Bem vindo ao seu novo lar"* e precisa sair de um lugar que parece um pesadelo.

O projeto se perdeu. Não sobrou o arquivo do jogo, nem os mapas, nem os scripts. Sobrou um **trailer de gameplay de 17 minutos** no YouTube, sem áudio, em 474×360 pixels a 15 quadros por segundo. E sobraram 19 capturas de tela que eu tinha posto no meu site na época.

Pedi a um agente de IA (o Claude Code) que recriasse o jogo a partir desse vídeo, "o mais idêntico possível". Hoje o Insônia roda de novo, no navegador e no celular, do começo ao fim. O link para jogar está no fim deste post.

Este post conta como isso foi feito: as técnicas, os erros e as partes que mais me surpreenderam.

## O ponto de partida

O material era pouco:

- **O trailer:** 17:22 de alguém (eu, em 2014) jogando o jogo do começo ao fim, com a tela em baixa resolução, cenas muito escuras e nenhum som.
- **As capturas de 2014:** 19 imagens em 800×600, com mais detalhe que o vídeo.
- **A minha memória:** eu lembrava que tinha baixado um pacote de gráficos chamado **Mack**, e que os personagens dele eram altos, ocupando dois tiles.

E só. Nenhuma linha do código original.

## 1. Achar os gráficos originais

O primeiro passo foi encontrar os mesmos gráficos que eu usei. O agente achou o pacote do Mack: tiles e personagens de um autor japonês, distribuídos no blog REFMAP para quem usa RPG Maker. O protagonista do trailer é a ficha キャラ03, personagem 2.

O resto vinha de dois lugares:

- **O RTP do RPG Maker VX Ace**, o pacote padrão de gráficos do programa. O agente extraiu as imagens direto do arquivo do instalador, em Python.
- **Um jogo meu de 2011**, o *Brian's Mansion*, que está no mesmo repositório. As capturas de 2014 mostraram um lampião, um ursinho e uma porta que não existiam nem no Mack nem no RTP. Estavam nas folhas de gráficos do Brian's Mansion. Eu tinha reaproveitado sem lembrar.

Tudo foi convertido para tons de cinza, como no jogo original.

## 2. Um motor de RPG Maker dentro do navegador

O RPG Maker não roda no navegador, então o motor foi reescrito em JavaScript, imitando o comportamento do VX Ace:

- tela de 544×416 com tiles de 32 pixels;
- *autotiles*, o sistema do RPG Maker que monta pisos e paredes com cantos certos;
- luz: cada sala tem um tom, uma luz ambiente, lâmpadas com halo e uma lanterna em volta do herói;
- janela de mensagem com texto aparecendo letra por letra, escolhas, entrada de números e o teclado de nome do RPG Maker;
- inventário com "Usar", "Analizar" e "Descartar" (com Z, como estava no jogo);
- salvamento automático e controles de toque para o celular.

São 20 mapas e um roteiro com 175 falas.

## 3. Medir as salas a partir do vídeo

O vídeo do trailer é a tela do jogo reduzida de 544×416 para 474×360. Sabendo disso, cada quadro pode ser levado de volta à grade de tiles: cada parede, cada cama e cada mancha no chão cai num quadrado de 32×32.

As salas pequenas cabem numa tela. As grandes (o corredor principal, o salão, o corredor dos pilares e o corredor final) rolam enquanto o herói anda. Para essas, o agente montou **panoramas**: juntou quadros seguidos do vídeo, encaixando cada um no anterior pelo deslocamento da imagem, até ter a sala inteira. Como o herói aparece em todos os quadros, ele fica repetido ao longo do caminho.

![Panorama do salão montado a partir de quadros do trailer, com a grade de tiles por cima; o herói aparece várias vezes ao longo do caminho que fez](/blog/img/insonia/panorama-salao.jpg)

O corredor final deu mais trabalho. No trailer a luz apaga a cada poucos passos e a tela fica preta, então ele parecia vários mapas diferentes. O panorama mostrou que é um corredor só, com 56 tiles de altura. As luzes apagando viraram uma mecânica do jogo.

## 4. As falas, lidas do vídeo

O texto de todas as falas foi tirado do trailer por OCR: um reconhecimento de texto a cada meio segundo de vídeo, 2.085 leituras ao todo. As leituras iguais seguidas foram agrupadas em 214 blocos de texto e conferidas.

A grafia original ficou como estava, com "Mais" no lugar de "mas" e "Oque" junto. É o jogo que eu fiz aos 20 anos, e o remake não corrige o autor.

## 5. As capturas de 2014 como gabarito

As capturas de tela do meu site têm bem mais resolução que o vídeo (800×600 contra 474×360). Com elas, o agente comparou sala por sala, na mesma grade de tiles, e corrigiu o que o vídeo não deixava ver:

- as divisórias do banheiro, que eram paredes de tijolo e não traços;
- o lampião animado e a porta arredondada, vindos do Brian's Mansion;
- o formato do quarto do urso;
- duas peças do tabuleiro de formas, que eram heptágonos e não pentágonos.

![À esquerda, o remake; à direita, as capturas de 2014, alinhadas na mesma grade de tiles](/blog/img/insonia/remake-x-capturas-2014.jpg)

Uma das capturas mostra o tabuleiro de formas **já resolvido**, e confirmou a solução que tinha sido deduzida antes.

## 6. O que o trailer não mostra

Um vídeo mostra o que aconteceu, não as regras. Algumas coisas foram deduzidas:

- **O código da escada (1264):** vem dos números riscados nas quatro cabines do banheiro, que aparecem no trailer.
- **A caixa com senha:** o trailer mostra a palavra "Perdido" e o código 0011 sendo digitados, mas não de onde o jogador tirou isso. O remake ganhou duas pistas no quarto: papéis rasgados com a palavra e um jarro com o número.
- **A sala que gira:** o trailer mostra a escolha "Esquerda / Direita" três vezes antes de a saída de baixo abrir.

E algumas coisas só apareceram quando eu joguei. Na primeira vez que joguei o remake, fiquei preso no duto de ventilação. A saída era uma grade no chão que não aparecia. Ela agora está desenhada, e o herói dá a dica quando chega às pontas do túnel.

## 7. Testar jogando, de verdade

Para saber se o jogo dava para terminar, o agente escreveu um **jogador automático**. Ele abre o jogo num Chromium sem janela e joga só com o teclado: setas, Enter e "I", como uma pessoa. Para andar, ele calcula o caminho até o próximo objetivo; para o resto, aperta as teclas.

Esse jogador terminou o jogo do título até a última cena, com as 175 falas e nenhum erro. No caminho apareceram defeitos que eu não teria visto tão cedo:

- encostar numa porta segurando a seta não abria a porta;
- fechar o jogo no meio do flashback deixava o "Continuar" preso num quarto sem saída;
- nenhuma das saídas de nenhum mapa podia levar a um lugar sem volta, e isso foi testado saída por saída, nos dois sentidos.

## 8. O som de um jogo que não tinha som no vídeo

O trailer é mudo, então o som foi criado do zero, em duas camadas.

O **ambiente** é sintetizado por código, no espírito de *Amnesia: The Dark Descent*:

- **Camadas contínuas:** ar de porão, um zumbido grave de pavor, vento nos corredores, chuva no flashback.
- **Eventos distantes:** de vez em quando, uma gota, uma viga rangendo, um baque, uma corrente.
- **O coração:** começa a bater quando o monstro está perto.
- **O espaço:** cada sala tem a reverberação do seu tamanho.

Os **efeitos** começaram sintetizados também, por modelos físicos (atrito para a dobradiça, modos de vibração para o metal). Ouvi e achei falsos: pareciam "cilindros metálicos". Troquei por **gravações reais em domínio público (CC0)**, de pacotes como os do Kenney e do OpenGameArt: passos em madeira, pedra e carpete, a maçaneta de uma porta trancada, uma fechadura abrindo, metal caindo, gritos.

O agente não ouve. Então o áudio foi conferido **medindo**: o jogo renderiza o som fora do tempo real, e um script mede volume, espectro, picos e estalos. Isso achou problemas que ouvido nenhum acharia de primeira:

- o ambiente estava 12 dB acima do ideal e cobria os passos;
- até 85% da energia ficava abaixo de 120 Hz, onde alto-falante de celular não toca nada;
- a reverberação acumulava grave e transformava uma porta num estrondo;
- o trinco das portas gravadas era tão seco que a ferramenta de revisão o marcava como estalo digital. Cada gravação passou por um limitador ajustado até o pico ficar abaixo do limite.

## 9. O vídeo que imita o trailer, cena a cena

Com o jogo pronto, pedi um vídeo de gameplay **igual ao trailer**: mesmas cenas, mesmo ritmo, só que com o jogo novo rodando. Esta foi a parte mais impressionante.

Primeiro, o agente **rastreou o trailer inteiro**. Para cada meio segundo de vídeo, ele descobriu:

- **em que sala o herói está:** comparando o quadro com a imagem completa de cada mapa, exportada do próprio jogo, com a luz normalizada para a escuridão não atrapalhar;
- **em que tile o herói está:** procurando os 12 desenhos do protagonista (4 direções, 3 passos) dentro do quadro.

O resultado é o caminho do herói no trailer, tile por tile, durante os 17 minutos. Teve armadilhas:

- **Cenas escuras demais:** algumas eram descartadas como tela preta. A solução foi esticar o brilho de cada quadro antes de comparar.
- **Corredores com pilares e canos iguais:** o algoritmo confundia um pilar com outro e via o herói "teletransportar". Só valeu o movimento fisicamente possível, a 3,75 tiles por segundo.
- **Um corte de verdade:** aos 2:46 o herói salta de uma ponta do corredor para a outra. Quem editou o trailer cortou uma caminhada. O vídeo novo também corta ali.

Depois, as falas do jogo (187 textos, contando escolhas e avisos) foram alinhadas com os 214 blocos de texto do trailer. É o mesmo tipo de alinhamento de sequências usado para comparar DNA.

Por último, o jogo ganhou um **modo de gravação**: o relógio para e só anda quando o gravador manda, um quadro de cada vez. Um "diretor" automático joga a partida:

- segue o caminho do trailer;
- aperta Enter no segundo exato em que cada caixa de texto some no vídeo original;
- abre o inventário, usa a chave, gira a sala, sempre no mesmo segundo do trailer.

O som é anotado com o quadro em que acontece e renderizado depois.

O resultado: **178 das 187 falas caem no tempo do trailer, com diferença média de meio segundo**. A versão acelerada, com os 17 minutos em 2:

<video controls playsinline preload="none" poster="/blog/img/insonia/gameplay-capa.jpg" style="display:block; width:100%; max-width:360px; margin:1.5em auto;">
  <source src="/blog/img/insonia/gameplay-acelerado.mp4" type="video/mp4">
</video>

## 10. O trailer corrigiu o jogo

O rastreio serviu para mais que o vídeo. Ele mostrou coisas que eu tinha reconstruído errado:

- **A posição inicial:** o herói acorda em (9,7), não em (9,6).
- **A chave final:** fica logo antes da última porta, porque é ali que o herói a pega no trailer.
- **O ritmo das cenas:** os passos e as pausas da cela e do flashback passaram a seguir o original. A escuridão em que o monstro procura o herói dura 44 segundos, como no trailer, e não 13.

E a **sala das armadilhas**. As armadilhas são invisíveis, e eu tinha deduzido onde ficavam. O rastreio mostrou que o herói do trailer pisa em vários tiles que eram armadilha na minha versão e nunca cai. Ele anda em zigue-zague, como quem conhece o caminho.

![A sala das armadilhas: em verde, o caminho que o jogador do trailer fez; os X vermelhos são os tiles que ele evitou, que viraram as armadilhas](/blog/img/insonia/sala-das-armadilhas.jpg)

Agora as armadilhas são os tiles que ele evitou. E apareceu algo que eu não lembrava: **todos os rabiscos no chão ficam em cima de armadilhas**. Pelo jeito, eles marcavam o caminho desde 2014.

## As dificuldades

Nem tudo foi direto. Alguns tropeços do caminho:

- **Vídeo ruim de propósito:** é um jogo de terror, então metade das cenas é quase preta, em baixa resolução e com compressão.
- **Deduzir sem inventar:** cada coisa que o trailer não mostra virou uma decisão. O README do projeto separa o que foi reconstruído, o que foi deduzido e o que foi acrescentado para dar para jogar.
- **O jogador automático:** errou de formas engraçadas. Segurava a seta um quadro a mais e abria uma porta sem querer. Passava do ponto nas curvas e voltava. Uma tecla ficava presa e a mesma porta trancada aparecia a cada 4,5 segundos, para sempre. Cada erro desses virou uma regra: soltar a seta antes da curva, saber em que sala cada ação acontece, nunca pisar numa saída antes da hora.
- **A máquina:** um navegador sem janela gravando milhares de quadros consome memória, e mais de uma vez o sistema matou o processo no meio.

## Por que isso me impressiona

O Insônia não existia mais. Eu tinha um vídeo, algumas imagens e a lembrança de um nome. O que voltou não é um vídeo gerado por IA nem uma imitação parecida. É **o jogo**: dá para jogar, errar, cair em armadilha, desistir e continuar depois.

O trabalho do agente parece mais arqueologia do que programação. Ele leu cada sala na grade de tiles, achou os gráficos originais, transcreveu as falas e mediu o tempo de cada cena. No fim, usou o próprio trailer para descobrir onde eu tinha escondido as armadilhas há 12 anos.

O meu papel foi o de sempre nesses projetos: lembrar, olhar, jogar e dizer o que estava errado. Eu escrevi antes sobre [criar na velocidade das ideias](/blog/posts/criar-na-velocidade-das-ideias/) e sobre [fazer vídeos só com código](/blog/posts/making-of-dos-meus-videos/). Isto foi outra coisa: recuperar algo que eu achava perdido.

## Jogue

O Insônia está no ar e pode ser jogado no navegador, no computador ou no celular:

**[Jogar o Insônia](https://andredarcie.github.io/insonia/)**

No computador:

- setas (ou WASD) para andar;
- Enter, Espaço ou Z para agir;
- Esc ou X para cancelar;
- I para o inventário.

No celular aparecem controles na tela. O jogo salva sozinho a cada sala. Uma dica sem estragar nada: quando o jogo parecer não ter saída, olhe com atenção para o chão.
