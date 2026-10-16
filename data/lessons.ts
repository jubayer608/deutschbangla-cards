// Entry point for lesson data — lessons live in ./lessons-part1 (1–6) and
// ./lessons-part2 (7–12) so each file stays small. Imports of "@/data/lessons"
// keep working unchanged.
import { lessonsPart1, type Lesson } from "./lessons-part1";
import { lessonsPart2 } from "./lessons-part2";

export type { Exercise, ExerciseType, GrammarBlock, Lesson } from "./lessons-part1";

export const lessons: Lesson[] = [...lessonsPart1, ...lessonsPart2];

export function getLesson(id: number): Lesson | undefined {
  return lessons.find(l => l.id === id);
}
