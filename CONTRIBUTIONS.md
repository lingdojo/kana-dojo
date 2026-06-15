# Contribuições — Branch `entrega-projeto`

> Autor: Jota (alexandrejotaxd@gmail.com)  
> Repositório upstream: [lingdojo/kana-dojo](https://github.com/lingdojo/kana-dojo)  
> Fork: [Jota-github/kana-dojoBJ](https://github.com/Jota-github/kana-dojoBJ)  
> Branch de entrega: `entrega-projeto`

---

## Resumo

| Categoria         | Quantidade |
|-------------------|-----------|
| Correções de bugs | 6         |
| Conteúdo novo     | 14        |
| **Total de commits** | **20** |

---

## Commits de Correção (bug fixes)

Esses commits corrigem problemas de schema, duplicatas e formato nos arquivos de conteúdo da comunidade.

| Hash | Descrição |
|------|-----------|
| `c43c19ec7` | Corrige ID duplicado na nota da comunidade (id 4 → id 6) em `community-notes-backlog.json` |
| `eda93ba9c` | Corrige schema da quote do Sheik (#109) em `japanese-videogame-quotes.json` |
| `60e115790` | Converte entrada id:52 de objeto para string em `japanese-grammar.json` |
| `73abfa2f5` | Converte tema "Sumo Strength" de hex para oklch em `community-themes.json` |
| `2d81cf3b2` | Corrige schema de 2 perguntas (#63 e #22) em `japan-trivia-easy.json` |
| `195a4f4cf` | Substitui haiku duplicado por novo haiku de Bashō em `japanese-haiku.json` |

---

## Commits de Conteúdo (features / issues)

Esses commits adicionam conteúdo novo resolvendo issues abertas no repositório upstream.

### Sessão 1 — Issues iniciais

| Hash | Issue | Arquivo | Conteúdo adicionado |
|------|-------|---------|---------------------|
| `e325db82e` | — | `community-themes.json` | Tema "Sumo Strength" |
| `92555217e` | — | `japanese-grammar.json` | Ponto gramatical 〜てください |
| `04279d63c` | — | `japanese-videogame-quotes.json` | Quote do Zelda (Link) |
| `2bfbc3486` | — | `community-notes-backlog.json` | Community note linha 4 |

### Sessão 2 — Issues #207xx

| Hash | Issue | Arquivo | Conteúdo adicionado |
|------|-------|---------|---------------------|
| `4cb09bff8` | [#20754](https://github.com/lingdojo/kana-dojo/issues/20754) | `japanese-grammar.json` | Ponto gramatical 〜ことがある |
| `2e609da28` | [#20768](https://github.com/lingdojo/kana-dojo/issues/20768) | `community-themes.json` | Tema "Driftwood Brown" |
| `865aece84` | [#20763](https://github.com/lingdojo/kana-dojo/issues/20763) | `japanese-cultural-etiquette.json` | Etiqueta sobre filas |
| `be9aefc5d` | [#20771](https://github.com/lingdojo/kana-dojo/issues/20771) | `japan-trivia-medium.json` | Trivia sobre a NHK |
| `c45fbe4c9` | [#20752](https://github.com/lingdojo/kana-dojo/issues/20752) | `japan-trivia-medium.json` | Trivia sobre veados de Nara |

### Sessão 3 — Issues #208xx

| Hash | Issue | Arquivo | Conteúdo adicionado |
|------|-------|---------|---------------------|
| `f84849495` | [#20816](https://github.com/lingdojo/kana-dojo/issues/20816) | `community-themes.json` | Tema "Umbrella Rain" |
| `b8dc9b0a9` | [#20815](https://github.com/lingdojo/kana-dojo/issues/20815) | `japanese-cultural-etiquette.json` | Etiqueta sobre tirar sapatos |
| `a86227ea3` | [#20813](https://github.com/lingdojo/kana-dojo/issues/20813) | `japanese-grammar.json` | Ponto gramatical 〜のに |
| `6f91faee0` | [#20810](https://github.com/lingdojo/kana-dojo/issues/20810) | `japan-facts.json` | Fato sobre kotodama (言霊) |
| `e4f811eee` | [#20808](https://github.com/lingdojo/kana-dojo/issues/20808) | `japanese-cultural-etiquette.json` | Etiqueta em escadas rolantes |

---

## Arquivos Modificados

| Arquivo | Tipo de mudança |
|---------|----------------|
| `community/content/community-notes-backlog.json` | Correção de schema |
| `community/content/japanese-videogame-quotes.json` | Correção + nova entrada |
| `community/content/japanese-grammar.json` | Correção + 2 novas entradas |
| `community/content/community-themes.json` | Correção + 3 novos temas |
| `community/content/japan-trivia-easy.json` | Correção de schema |
| `community/content/japanese-haiku.json` | Substituição de duplicata |
| `community/content/japanese-cultural-etiquette.json` | 3 novas entradas |
| `community/content/japan-trivia-medium.json` | 2 novas entradas |
| `community/content/japan-facts.json` | 1 nova entrada |

---

## Como aplicar

```bash
git push origin entrega-projeto
```

Para abrir Pull Requests individuais para cada issue, referenciar o hash do commit correspondente e usar `Closes #<número>` na descrição do PR.
