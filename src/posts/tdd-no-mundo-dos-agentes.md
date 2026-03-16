---
title: Usar TDD deixou de ser opcional no mundo dos agentes de IA
date: 2026-03-12
tags:
  - posts
  - tecnologia
  - pensamentos
translationKey: tdd-agents
---

> **Test-Driven Development (TDD)** é uma prática de desenvolvimento em que você escreve os testes *antes* de escrever o código. O ciclo é simples: escreva um teste que falha, implemente o mínimo de código para ele passar, refatore. Repetido em loop, isso garante que o código faça exatamente o que foi especificado.

Muita gente usa IA assim: manda a classe pronta e pede para gerar testes.

O problema é que o modelo só está completando um quebra-cabeça de tokens. Ele gera testes que combinam com o código existente, não necessariamente com o comportamento correto.

Para o modelo, ele não está realmente entendendo o sistema. Ele só está tentando prever o próximo token provável. Então o teste acaba sendo apenas uma continuação lógica do código.

## Invertendo o processo

O que funcionou para mim foi inverter isso usando TDD.

1. O agente lê os **requisitos funcionais**.
2. **O agente gera testes baseados nesses requisitos.**
3. Eu **limpo o contexto** (novo agente, contexto zerado).
4. Peço para ele **implementar o código que faça os testes passarem**.

Nesse ponto o agente só tem um objetivo claro: **fazer os testes passarem**.

Ele tenta, falha, tenta de novo, em loop, até conseguir.

## Por que isso funciona

Isso funciona porque **testes são determinísticos**. Para o mesmo código, o resultado sempre será o mesmo.

Já **agentes não são determinísticos**. Existe aleatoriedade, existe alucinação, e nós não temos controle total sobre o que o modelo vai gerar.

Então tudo o que pudermos construir para **conter esse comportamento** ajuda.

Testes acabam virando exatamente isso: **uma espécie de gaiola para controlar o comportamento caótico dos agentes.**

## Bugs também

Já usei essa abordagem em projetos críticos onde bugs simplesmente não eram uma opção. O fluxo era: primeiro fazer o agente criar um teste que realmente quebra e reproduz o problema. Só depois pedir para corrigir.

Porque se você apenas pedir para a IA "arrumar o bug", ela pode simplesmente inventar uma solução e afirmar que resolveu.

Mas teste não mente.

Teste cria um **feedback loop forçado**.

## Uma boa prática que virou obrigação

No mundo dos agentes de IA, TDD deixou de ser uma boa prática opcional e passou a ser praticamente obrigatório.

Com código gerado por IA, vimos um boom de testes automatizados. Isso fez uma grande diferença: código sem teste perdeu valor, porque agora gerar testes não custa mais nada. Mas podemos ir a um nível acima. Em vez de gerar testes para o código, geramos testes para os requisitos. Isso é TDD, e é o próximo passo.

---

Também postei esse texto no [TabNews](https://www.tabnews.com.br/andredarcie/usar-tdd-deixou-de-ser-opcional-no-mundo-dos-agentes-de-ia).
