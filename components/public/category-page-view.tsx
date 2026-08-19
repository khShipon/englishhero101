import type { ContentNode, Breadcrumb } from "@/types/content";
import { getChildren } from "@/lib/queries/content";
import { getPublishedLessonsByNode } from "@/lib/queries/lessons";
import { getPublishedQuestionSetsByNode } from "@/lib/queries/question-banks";
import { BreadcrumbTrail } from "@/components/public/breadcrumb-trail";
import { CategoryCard } from "@/components/public/category-card";
import { LessonCard } from "@/components/public/lesson-card";
import { QuestionSetCard } from "@/components/public/question-set-card";

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
  const [children, lessons, questionSets] = await Promise.all([
    getChildren(node.id),
    getPublishedLessonsByNode(node.id),
    getPublishedQuestionSetsByNode(node.id),
  ]);

  const publishedChildren = children.filter((child) => child.isPublished);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <BreadcrumbTrail breadcrumbs={breadcrumbs.slice(0, -1)} currentTitle={node.title} />
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{node.title}</h1>
      {node.description && (
        <p className="mt-2 max-w-2xl text-muted-foreground">{node.description}</p>
      )}

      {publishedChildren.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Browse</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {publishedChildren.map((child) => (
              <CategoryCard key={child.id} node={child} href={`${basePath}/${child.slug}`} />
            ))}
          </div>
        </section>
      )}

      {lessons.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Lessons</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </section>
      )}

      {questionSets.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Question Banks</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {questionSets.map((set) => (
              <QuestionSetCard key={set.id} questionSet={set} />
            ))}
          </div>
        </section>
      )}

      {publishedChildren.length === 0 && lessons.length === 0 && questionSets.length === 0 && (
        <p className="mt-10 text-sm text-muted-foreground">
          Nothing published here yet — check back soon.
        </p>
      )}
    </div>
  );
}
