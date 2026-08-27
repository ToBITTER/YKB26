import { FaceOffGame } from "@/components/game/face-off-game";

export default async function FaceOffRoom({ params }: { params: Promise<{ code: string }> }) {
  return <FaceOffGame code={(await params).code.toUpperCase()} />;
}
