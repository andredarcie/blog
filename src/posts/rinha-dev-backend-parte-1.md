---
title: Meus primeiros dias na Rinha dev backend 2026
date: 2026-05-20
tags:
  - posts
  - tecnologia
  - pensamentos
translationKey: rinha-dev-backend-part-1
---

A [Rinha de Backend](https://github.com/zanfranceschi/rinha-de-backend-2026) é uma competição amistosa em que você constrói um backend sob restrições severas de CPU, memória e arquitetura. Esta é a quarta edição. As anteriores tiveram temas como CRUD de pessoas, controle de concorrência e processamento de pagamentos.

A restrição de infraestrutura é clara: 1 CPU e 350 MB de memória para todos os serviços combinados, com no mínimo um load balancer e duas instâncias da API. Tudo rodando em Docker Compose, imagens públicas compatíveis com linux-amd64, aplicação respondendo na porta 9999.

O score vai de -6000 a +3000, combinando dois componentes independentes: latência e precisão na detecção. Cada melhoria de 10x na latência vale +1000 pontos. Na detecção, falsos negativos pesam mais que falsos positivos, e erros HTTP são os mais penalizados. Se a taxa de falhas ultrapassar 15%, o score de detecção trava em -3000.

O prazo para submissão é 5 de junho de 2026.

Essa é a primeira vez que eu participo de verdade. E já aprendi mais em alguns dias do que em semanas de trabalho normal.

## O desafio

O tema desta edição é detecção de fraude por busca vetorial. A API recebe dados de uma transação, converte o payload em um vetor de 14 dimensões usando fórmulas de normalização fornecidas pelos organizadores, busca os 5 vetores mais próximos num dataset de referência com 3 milhões de transações rotuladas e decide: `fraud_score = fraudes_encontradas / 5`. Se o score for menor que 0.6, aprova. Caso contrário, nega.

O dataset de referência não muda durante os testes e pode ser pré-processado no tempo de build ou startup da aplicação.

## A primeira tentativa

Comecei com a abordagem mais simples possível: carregar o arquivo inteiro em memória e fazer busca por proximidade euclidiana. Força bruta mesmo.

A distância euclidiana entre dois vetores de N dimensões é a raiz quadrada da soma dos quadrados das diferenças entre cada dimensão. Para vetores de 14 dimensões, são 14 subtrações, 14 elevações ao quadrado, uma soma e uma raiz quadrada, repetido para cada um dos 3 milhões de registros a cada requisição. Complexidade O(n) por requisição, sem nenhum índice ou estrutura de dados auxiliar.

Não funcionou. Cada vetor tem 14 floats de 4 bytes cada, o que dá 56 bytes por registro. São 3 milhões de registros, então só os vetores já ocupam cerca de 168 MB. Com o overhead do JSON original, metadados e estruturas do runtime, a memória estourava antes mesmo de começar a responder requisições. E a busca linear, mesmo que a memória aguentasse, seria inviável em latência.

## Banco de dados vetorial

Descartei a abordagem em memória e fui pesquisar bancos de dados vetoriais. Encontrei o mais popular, que era comercial, e depois um open source igualmente bem-posicionado. Nunca tinha mexido com banco vetorial antes.

Fui integrando com a API em .NET. Até aí nenhuma surpresa. Mas logo percebi dois problemas distintos.

O primeiro era o overhead do runtime do .NET. Ele funciona com Just-in-Time compilation: você escreve C# que vira CIL (Common Intermediate Language), uma linguagem intermediária bytecode, que é executada pelo CLR (Common Language Runtime) e compilada para código de máquina pelo JIT conforme os métodos são chamados pela primeira vez. Isso é ótimo para portabilidade entre plataformas, mas o runtime do .NET sozinho consome uma quantidade significativa de memória antes de rodar qualquer linha do seu código. Num ambiente com 350 MB totais divididos entre load balancer, duas instâncias da API e banco de dados, esse custo fixo pesa muito.

A solução foi publicar a aplicação em AOT, o Ahead-of-Time compilation do .NET. O suporte a Native AOT chegou no .NET 7 de forma experimental e ficou estável no .NET 8. Em vez de compilar em tempo de execução, você compila antecipadamente para um binário nativo específico do hardware alvo. O resultado é um executável que não depende de runtime instalado, inicia em milissegundos e tem um footprint de memória muito menor. Você perde reflexão dinâmica, alguns pacotes NuGet que dependem de Reflection.Emit não funcionam, mas para uma API de alta performance as trocas valem.

O salto foi perceptível de imediato.

O segundo problema era o próprio banco vetorial especializado. Ele usava gRPC com um protocolo proprietário e exigia subir os dados em batch via API própria, com controle de coleções, índices e configurações específicas. Excelente para casos de uso que precisam de escala e features avançadas de busca vetorial, mas complexo demais para o que eu estava tentando fazer.

## PostgreSQL e pgVector

Descartei o banco vetorial especializado e fui para o Postgres com a extensão pgVector.

O pgVector adiciona um tipo nativo `vector(n)` ao Postgres e operadores de distância: `<->` para distância euclidiana (L2), `<=>` para similaridade de cosseno e `<#>` para produto interno. Além disso, suporta dois tipos de índice para busca aproximada: IVFFlat, que divide o espaço vetorial em listas e busca apenas nas mais próximas, e HNSW (Hierarchical Navigable Small World), um grafo hierárquico que oferece melhor recall e latência na maioria dos casos, ao custo de mais memória durante a construção.

A vantagem prática de usar Postgres foi imediata: para importar 3 milhões de registros, basta ter um CSV e rodar:

```sql
COPY transactions(vector, is_fraud) FROM '/data/references.csv' WITH (FORMAT csv);
```

Simples, rápido, sem cerimônia. Converti o JSON para CSV e ele já ficou no repositório pronto para ser carregado no momento que o banco sobe, sem nenhuma etapa extra de build.

## O score negativo

Com toda essa estrutura montada, o score era péssimo. Menos 6 mil. O pior resultado possível. As requisições sobrecarregavam as APIs, o serviço caiu, não conseguia responder nada.

Aí fiz uma versão que puxava apenas uma parte dos dados para memória e usava um algoritmo de proximidade. Funcionou. Score próximo de 600. Longe do ideal, mas o suficiente para ter a primeira métrica real do problema.

## A descoberta mais importante: medir antes de otimizar

Esse resultado me fez perceber que eu tinha feito tudo na ordem errada.

Antes de qualquer otimização, eu deveria ter respondido uma pergunta simples: qual é o máximo teórico que eu consigo atingir nessa infraestrutura?

Se eu criar uma API de uma linha que só retorna sucesso sempre, quantas requisições por segundo ela aguenta nessa configuração específica de Docker Compose, Nginx e containers? Esse número é o teto. Tudo que eu adicionar depois, banco de dados, lógica, busca vetorial, só pode piorar. Mas eu preciso saber esse teto para entender onde estou na escala.

Sem essa referência eu estava trabalhando no escuro. Tentando otimizar sem saber o que era possível. Estava vivendo na prática o que Donald Knuth escreveu em 1974 no seu discurso do Prêmio Turing, publicado na Communications of the ACM:

> "We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil. Yet we should not pass up our opportunities in that critical 3%."
>
> — Donald Knuth, *Computer Programming as an Art*, Communications of the ACM, Vol. 17, No. 12 (dezembro de 1974), p. 671

Quebrando a cabeça para atingir um número que talvez nem existisse naquela configuração.

Com o teto definido eu comecei a adicionar camadas: sem banco, com banco, com um `SELECT 1`, com a busca vetorial. Cada etapa com uma métrica. O score do script foi fundamental, mas eu precisava de mais granularidade para entender onde estavam os gargalos.

Apareceram problemas de threadpool: o .NET por padrão cria threads sob demanda com um intervalo mínimo entre cada nova thread criada (thread injection delay). Com carga alta isso significa que a fila de trabalho cresce antes de novas threads serem adicionadas, causando latência de fila mesmo com CPU ociosa. A configuração de `ThreadPool.SetMinThreads` para um valor mais alto resolve isso, forçando o pool a manter um mínimo de threads prontas.

Apareceu também uma inconsistência no Nginx: o `worker_connections` estava configurado para um valor muito acima do que a API e o banco conseguiam absorver. O Nginx aceitava as conexões, mas elas ficavam esperando por uma conexão disponível no pool da API ou do banco, acumulando na fila e estourando timeout. Alinhar os limites de `worker_connections` do Nginx com o `MaxPoolSize` do connection pool da API e com o `max_connections` do Postgres foi essencial.

As métricas foram me guiando em decisões de configuração que eu nunca teria feito no escuro.

## Docker Desktop no Windows não é o mesmo que Linux

Outra descoberta que mudou tudo: peguei um projeto de um participante com score alto e tentei rodar na minha máquina. Não chegava nem perto do resultado dele. Na verdade, nem terminava de rodar.

Comecei a investigar e entendi o problema. O Docker Desktop no Windows não roda containers diretamente no kernel do Windows. Ele sobe uma VM Linux gerenciada via Hyper-V ou WSL2, e os containers rodam dentro dessa VM. Cada chamada de sistema, cada operação de rede e cada acesso a disco passa por essa camada extra de virtualização. O overhead é real e significativo.

O ambiente de teste oficial da Rinha é um Mac Mini Late 2014 rodando Ubuntu 24.04 diretamente no hardware, sem virtualização adicional. O que eu estava medindo no Docker Desktop não tinha nenhuma relação com o que o avaliador mediria.

Abri o WSL2, instalei o Docker Engine diretamente dentro do Ubuntu (sem Docker Desktop, sem a camada de integração do Windows) e rodei o mesmo projeto. O salto foi absurdo.

Eu estava lutando para melhorar um score num ambiente que tornava o problema muito mais difícil do que ele realmente era. E não estava nem cogitando isso.

O sinal é claro: para desenvolvimento de aplicações backend, especialmente quando performance importa, o ambiente de desenvolvimento precisa ser o mais próximo possível do ambiente de produção. WSL2 ou Linux diretamente.

## Para onde vai

Pesquisando como empresas reais resolvem detecção de fraude, a resposta é consistente: modelo de machine learning treinado. Os algoritmos mais usados para esse tipo de problema são Random Forest e XGBoost, que lidam bem com dados tabulares, são robustos a outliers e geram modelos compactos. Redes neurais também são usadas, especialmente quando os dados têm padrões mais complexos.

O fluxo é: você treina o modelo com os 3 milhões de registros rotulados, serializa o modelo treinado (que é basicamente uma árvore de decisão ou um conjunto de pesos em alguns kilobytes ou poucos megabytes) e descarta o dataset original. Na inferência, uma requisição passa pelo modelo e recebe uma resposta em microssegundos, sem nenhuma consulta a banco de dados, sem busca vetorial, sem round-trip de rede.

No ecossistema .NET, isso pode ser feito com ML.NET para treinar e serializar o modelo, ou carregando um modelo treinado externamente (scikit-learn, XGBoost) via ONNX Runtime, que tem suporte nativo no .NET e roda inferência em CPU com latência muito baixa.

A superioridade em relação à busca em banco de dados é incomparável em tempo de resposta e consumo de recursos.

Mas eu não pulei direto para isso. Quero ver o salto. Quero construir a solução com banco de dados até onde ela conseguir ir, medir bem, e depois migrar para o modelo treinado e ver o que acontece com o score. A satisfação de ver a métrica saltar depois de uma mudança arquitetural grande é parte do processo.

Por enquanto é isso. Parte dois em breve.
