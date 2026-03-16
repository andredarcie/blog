---
title: TDD Is No Longer Optional in the World of AI Agents
date: 2026-03-12
tags:
  - posts-en
  - technology
  - thoughts
translationKey: tdd-agents
---

> **Test-Driven Development (TDD)** is a development practice where you write tests *before* writing the code. The cycle is simple: write a failing test, implement the minimum code to make it pass, refactor. Repeated in a loop, this ensures the code does exactly what was specified.

A lot of people use AI like this: send the finished class and ask it to generate tests.

The problem is that the model is just completing a token puzzle. It generates tests that match the existing code, not necessarily the correct behavior.

For the model, it's not really understanding the system. It's just trying to predict the next likely token. So the test ends up being just a logical continuation of the code.

## Inverting the process

What worked for me was inverting this using TDD.

1. The agent reads the **functional requirements**.
2. **The agent generates tests based on those requirements.**
3. I **clear the context** (new agent, blank context).
4. I ask it to **implement the code that makes the tests pass**.

At this point the agent has only one clear goal: **make the tests pass**.

It tries, fails, tries again, in a loop, until it succeeds.

## Why this works

This works because **tests are deterministic**. For the same code, the result will always be the same.

**Agents are not deterministic**. There is randomness, there is hallucination, and we don't have full control over what the model will generate.

So everything we can build to **contain that behavior** helps.

Tests end up being exactly that: **a kind of cage to control the chaotic behavior of agents.**

## Bugs too

I've used this approach in critical projects where bugs simply weren't an option. The flow was: first have the agent create a test that actually breaks and reproduces the problem. Only then ask it to fix it.

Because if you just ask the AI to "fix the bug," it might simply invent a solution and claim it worked.

But tests don't lie.

Tests create a **forced feedback loop**.

## A good practice that became mandatory

In the world of AI agents, TDD has gone from being an optional good practice to being practically mandatory.

With AI-generated code, we saw a boom in automated tests. That made a big difference: code without tests lost value, because generating tests no longer costs anything. But we can go a level higher. Instead of generating tests for code, we generate tests for requirements. That's TDD, and it's the next step.

---

Also posted this text on [TabNews](https://www.tabnews.com.br/andredarcie/usar-tdd-deixou-de-ser-opcional-no-mundo-dos-agentes-de-ia) and [Dev.to](https://dev.to/andredarcie/tdd-is-no-longer-optional-in-the-world-of-ai-agents-5b1e).
