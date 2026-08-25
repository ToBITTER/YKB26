import type { GameResult } from "@/types";

const WIDTH = 1080;
const HEIGHT = 1350;

function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number, initialSize: number): number {
  let size = initialSize;
  while (size > 34) {
    context.font = `900 ${size}px Arial, sans-serif`;
    if (context.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

export async function createResultGraphic(result: GameResult, playUrl: string, username: string): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable in this browser.");

  const gradient = context.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, "#080b09");
  gradient.addColorStop(.55, "#111a10");
  gradient.addColorStop(1, "#1d3212");
  context.fillStyle = gradient;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.strokeStyle = "rgba(183,242,56,.10)";
  context.lineWidth = 2;
  for (let x = -HEIGHT; x < WIDTH + HEIGHT; x += 90) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + HEIGHT, HEIGHT);
    context.stroke();
  }

  context.fillStyle = "#b7f238";
  context.fillRect(70, 72, 18, 96);
  context.font = "900 76px Arial, sans-serif";
  context.fillText("BALLER", 120, 145);
  context.font = "700 25px Arial, sans-serif";
  context.fillStyle = "#b7f238";
  context.fillText("FOOTBALL KNOWLEDGE. PROVEN.", 120, 190);

  context.fillStyle = "#929a94";
  context.font = "800 25px Arial, sans-serif";
  context.fillText("FULL-TIME RESULT", 74, 300);
  context.fillStyle = "#f5f6f1";
  const mode = result.mode.replaceAll("-", " ").toUpperCase();
  context.font = `900 ${fitText(context, mode, 920, 68)}px Arial, sans-serif`;
  context.fillText(mode, 72, 380);

  context.fillStyle = "#b7f238";
  context.font = "900 270px Arial, sans-serif";
  context.fillText(`${result.correct}`, 62, 690);
  const scoreWidth = context.measureText(`${result.correct}`).width;
  context.fillStyle = "#f5f6f1";
  context.font = "900 105px Arial, sans-serif";
  context.fillText(`/${result.total}`, 75 + scoreWidth, 690);
  context.fillStyle = "#929a94";
  context.font = "800 28px Arial, sans-serif";
  context.fillText("CORRECT ANSWERS", 75, 744);

  const accuracy = Math.round((result.correct / Math.max(1, result.total)) * 100);
  const stats = [[`${accuracy}%`, "ACCURACY"], [`${result.bestStreak}`, "BEST STREAK"], [`+${result.xp}`, "XP EARNED"]];
  stats.forEach(([value, label], index) => {
    const x = 75 + index * 315;
    context.fillStyle = "rgba(255,255,255,.055)";
    context.fillRect(x, 815, 285, 170);
    context.fillStyle = "#f5f6f1";
    context.font = "900 58px Arial, sans-serif";
    context.fillText(value, x + 24, 895);
    context.fillStyle = "#929a94";
    context.font = "800 20px Arial, sans-serif";
    context.fillText(label, x + 24, 943);
  });

  context.fillStyle = "#f5f6f1";
  context.font = "800 28px Arial, sans-serif";
  context.fillText(username.toUpperCase(), 75, 1075);
  context.fillStyle = "#b7f238";
  context.font = "900 34px Arial, sans-serif";
  context.fillText("THINK YOU KNOW BALL? BEAT MY SCORE.", 75, 1140);
  context.fillStyle = "#f5f6f1";
  context.font = "700 24px Arial, sans-serif";
  const displayUrl = new URL(playUrl).host + new URL(playUrl).pathname;
  context.fillText(`PLAY NOW  •  ${displayUrl}`, 75, 1195);
  context.fillStyle = "#b7f238";
  context.fillRect(75, 1250, 930, 8);

  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not create result graphic.")), "image/png"));
  return new File([blob], "baller-result.png", { type: "image/png" });
}
