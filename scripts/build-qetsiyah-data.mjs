import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";

const TARGET = 2000;
const POP_CULTURE = new Set([10, 11, 12, 13, 14, 15, 16, 25, 26, 29, 31, 32]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const decode = (value) => Buffer.from(value, "base64").toString("utf8").trim();
const idFor = (prompt) => `qetsiyah-${createHash("sha256").update(prompt.toLowerCase()).digest("hex").slice(0, 16)}`;
const categoryFor = (id) => id === 23 ? "History" : POP_CULTURE.has(id) ? "Pop Culture" : "General Knowledge";
const categoryIds = {"Entertainment: Books":10,"Entertainment: Film":11,"Entertainment: Music":12,"Entertainment: Musicals & Theatres":13,"Entertainment: Television":14,"Entertainment: Video Games":15,"Entertainment: Board Games":16,"Science & Nature":17,"Science: Computers":18,"Science: Mathematics":19,"Mythology":20,"Geography":22,"History":23,"Politics":24,"Art":25,"Celebrities":26,"Animals":27,"Vehicles":28,"Entertainment: Comics":29,"Science: Gadgets":30,"Entertainment: Japanese Anime & Manga":31,"Entertainment: Cartoon & Animations":32};

const tokenResponse = await fetch("https://opentdb.com/api_token.php?command=request");
if (!tokenResponse.ok) throw new Error(`Token request failed: ${tokenResponse.status}`);
const token = (await tokenResponse.json()).token;
const questions = new Map();
let attempts = 0;

while (questions.size < TARGET && attempts < 140) {
  attempts++;
  const response = await fetch(`https://opentdb.com/api.php?amount=50&type=multiple&encode=base64&token=${token}`);
  if (!response.ok) throw new Error(`Question request failed: ${response.status}`);
  const payload = await response.json();
  if (payload.response_code === 5) { await sleep(5500); continue; }
  if (payload.response_code === 4) break;
  if (payload.response_code !== 0) throw new Error(`OpenTDB response code ${payload.response_code}`);
  for (const item of payload.results) {
    const sourceCategory = decode(item.category);
    if (sourceCategory === "Sports") continue;
    const prompt = decode(item.question);
    const answer = decode(item.correct_answer);
    const choices = [answer, ...item.incorrect_answers.map(decode)];
    if (!prompt || !answer || choices.length !== 4 || new Set(choices.map((choice) => choice.toLowerCase())).size !== 4) continue;
    const categoryId = categoryIds[sourceCategory] ?? 9;
    const id = idFor(prompt);
    questions.set(id, { id, category: categoryFor(categoryId), sourceCategory, difficulty: decode(item.difficulty), prompt, answer, choices });
    if (questions.size === TARGET) break;
  }
  console.log(`Collected ${questions.size}/${TARGET} questions.`);
  await sleep(5200);
}

if (questions.size < TARGET) throw new Error(`Only collected ${questions.size} unique questions.`);
await writeFile("data/qetsiyah-questions.generated.json", `${JSON.stringify([...questions.values()], null, 2)}\n`);
console.log(`Generated ${questions.size} Qetsiyah questions from Open Trivia DB.`);
