# Documentação de Contribuições — KanaDojo

**Projeto:** KanaDojo — plataforma de aprendizado de japonês (Next.js 15, React 19, TypeScript)  
**Repositório upstream:** [lingdojo/kana-dojo](https://github.com/lingdojo/kana-dojo)  
**Fork:** [Jota-github/kana-dojoBJ](https://github.com/Jota-github/kana-dojoBJ)  
**Branch de entrega:** `entrega-projeto`  
**Total de commits:** 21  

---

## O que é o KanaDojo?

KanaDojo é uma plataforma open source de aprendizado de japonês. Ela funciona como um jogo — o usuário pratica hiragana, katakana, kanji, vocabulário e cultura japonesa. O projeto é construído com Next.js e aceita contribuições da comunidade principalmente via arquivos JSON na pasta `community/content/`, onde ficam os dados que alimentam os quizzes, temas visuais e curiosidades do app.

Todas as nossas contribuições foram feitas nessa pasta de conteúdo comunitário.

---

## Fase 1 — Adição de conteúdo inicial (8 commits)

Esses foram os primeiros commits feitos no fork. Adicionamos conteúdo novo ao projeto seguindo as instruções de cada issue.

---

### Commit 1 — Trivia fácil: Mount Fuji
**Hash:** `fbc8871a2`  
**Arquivo:** `community/content/japan-trivia-easy.json`

**O que era o problema?**  
O repositório tinha uma issue pedindo para adicionar uma pergunta de trivia (quiz) de nível fácil sobre o Monte Fuji ao banco de perguntas da plataforma.

**O que fizemos?**  
Adicionamos a seguinte pergunta ao arquivo de trivia fácil:

> "What is the name of Japan's highest mountain?"  
> Respostas: Mount Fuji, Mount Aso, Mount Koya, Mount Ibuki  
> Resposta correta: Mount Fuji (índice 0)

---

### Commit 2 — Haiku de Matsuo Bashō
**Hash:** `f63a7726c`  
**Arquivo:** `community/content/japanese-haiku.json`

**O que era o problema?**  
O arquivo de haikus estava vazio ou incompleto. A issue pedia para adicionar o famoso haiku de Matsuo Bashō sobre o sapo e o lago.

**O que fizemos?**  
Adicionamos o haiku mais famoso da literatura japonesa:

- **Japonês:** 古池や蛙飛び込む水の音  
- **Romaji:** Furuike ya kawazu tobikomu mizu no oto  
- **Tradução:** An old silent pond... A frog jumps into the pond. Splash! Silence again.  
- **Poeta:** Matsuo Bashō | **Estação:** Spring | **Kigo:** kawazu (frog)

---

### Commit 3 — Trivia fácil: nome antigo de Tokyo
**Hash:** `9d6386858`  
**Arquivo:** `community/content/japan-trivia-easy.json`

**O que era o problema?**  
Issue pedindo uma pergunta sobre a história de Tokyo.

**O que fizemos?**  
Adicionamos:

> "What was the old name of Tokyo before it became the capital?"  
> Respostas: Edo, Kyoto, Osaka, Nara  
> Resposta correta: Edo (índice 0)

---

### Commit 4 — Tema visual: Sumo Strength
**Hash:** `e325db82e`  
**Arquivo:** `community/content/community-themes.json`

**O que era o problema?**  
Issue pedindo a adição de um novo tema visual chamado "Sumo Strength" para personalização da interface do KanaDojo. O arquivo de temas controla as cores da plataforma.

**O que fizemos?**  
Adicionamos o tema com as cores em formato oklch (formato de cor moderno usado pelo Tailwind CSS v4):

```json
{
  "id": "sumo-strength",
  "backgroundColor": "oklch(20.0% 0.025 30.0 / 1)",
  "mainColor": "oklch(65.0% 0.180 25.0 / 1)",
  "secondaryColor": "oklch(55.0% 0.140 15.0 / 1)"
}
```

---

### Commit 5 — Ponto gramatical: 〜てください
**Hash:** `92555217e`  
**Arquivo:** `community/content/japanese-grammar.json`

**O que era o problema?**  
Issue pedindo adição de uma explicação sobre a forma 〜てください (te kudasai), que significa "por favor, faça X".

**O que fizemos?**  
Adicionamos a string explicativa:

> `"〜てください (te kudasai) is used to make polite requests, meaning 'please do ~'."`

---

### Commit 6 — Quote de video game: Zelda (Link)
**Hash:** `04279d63c`  
**Arquivo:** `community/content/japanese-videogame-quotes.json`

**O que era o problema?**  
Issue pedindo a adição de uma frase icônica de video game japonês para que os usuários aprendam japonês através da cultura gamer.

**O que fizemos?**  
Adicionamos a quote do Link em The Legend of Zelda:

```json
{
  "japanese": "それは危険だ。これを持っていけ",
  "romaji": "Sore wa kiken da. Kore wo motte ike",
  "english": "It's dangerous to go alone! Take this.",
  "game": "The Legend of Zelda",
  "character": "Old Man"
}
```

---

### Commit 7 — Community 