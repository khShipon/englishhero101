import type { ContentNode, Breadcrumb } from "@/types/content";
import { getChildren } from "@/lib/queries/content";
import { getPublishedLessonsByNode } from "@/lib/queries/lessons";
import { getPublishedQuestionSetsByNode } from "@/lib/queries/question-banks";
import { getVocabularyByNode } from "@/lib/queries/vocabulary";
import { BreadcrumbTrail } from "@/components/public/breadcrumb-trail";
import { CategoryCard } from "@/components/public/category-card";
import { LessonCard } from "@/components/public/lesson-card";
import { QuestionSetCard } from "@/components/public/question-set-card";
import { VocabularyCard } from "@/components/public/vocabulary-card";
import { SubjectExplorer } from "@/components/public/subject-explorer";
import { BookOpen, ClipboardList, LayoutGrid, Languages, type LucideIcon } from "lucide-react";

// SSC English / HSC English are wide enough (6 sections, ~20-30 topics
// under 1st/2nd Paper) to warrant a paper -> topic quick-jump navigator
// above the generic Browse grid — every other category just gets the
// grid, so this is a small opt-in list rather than a new node_type.
const SUBJECT_EXPLORER_SLUGS: Record<string, "SSC" | "HSC"> = {
  "ssc-english": "SSC",
  "hsc-english": "HSC",
};

function SectionHeading({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      {children}
    </h2>
  );
}

// One reusable template for every category/section/topic page — IELTS,
// Grammar, SSC, HSC, Spoken English, and any future category an admin
// creates all render through this same component.
export async function CategoryPageView({
  node,
  breadcrumbs,
  basePath,
}: {
  node: ContentNode;
  breadcrumbs: Breadcrumb[];
  basePath: string;
}) {
  const [children, lessons, questionSets, vocabulary] = await Promise.all([
    getChildren(node.id),
    getPublishedLessonsByNode(node.id),
    getPublishedQuestionSetsByNode(node.id),
    getVocabularyByNode(node.id),
  ]);

  const publishedChildren = children.filter((child) => child.isPublished);
  const examType = SUBJECT_EXPLORER_SLUGS[node.slug];
  const sectionChildren = examType
    ? Object.fromEntries(
        await Promise.all(
          publishedChildren.map(async (section) => [
            section.id,
            (await getChildren(section.id)).filter((child) => child.isPublished),
          ]),
        ),
      )
    : {};

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <BreadcrumbTrail breadcrumbs={breadcrumbs.slice(0, -1)} currentTitle={node.title} />
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{node.title}</h1>
      {node.description && (
        <p className="mt-2 max-w-2xl text-muted-foreground">{node.description}</p>
      )}

      {examType && (
        <SubjectExplorer
          basePath={basePath}
          sections={publishedChildren}
          sectionChildren={sectionChildren}
          examType={examType}
        />
      )}

      {publishedChildren.length > 0 && (
        <section className="mt-10">
          <SectionHeading icon={LayoutGrid}>Browse</SectionHeading>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {publishedChildren.map((child) => (
              <CategoryCard key={child.id} node={child} href={`${basePath}/${child.slug}`} />
            ))}
          </div>
        </section>
      )}

      {lessons.length > 0 && (
        <section className="mt-10">
          <SectionHeading icon={BookOpen}>Lessons</SectionHeading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </section>
      )}

      {questionSets.length > 0 && (
        <section className="mt-10">
          <SectionHeading icon={ClipboardList}>Question Banks</SectionHeading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {questionSets.map((set) => (
              <QuestionSetCard key={set.id} questionSet={set} />
            ))}
          </div>
        </section>
      )}

      {vocabulary.length > 0 && (
        <section className="mt-10">
          <SectionHeading icon={Languages}>Vocabulary</SectionHeading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vocabulary.map((entry) => (
              <VocabularyCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      )}

      {publishedChildren.length === 0 &&
        lessons.length === 0 &&
        questionSets.length === 0 &&
        vocabulary.length === 0 && (
        <p className="mt-10 text-sm text-muted-foreground">
          Nothing published here yet — check back soon.
        </p>
      )}
    </div>
  );
}
