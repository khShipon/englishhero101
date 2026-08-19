import type { Metadata } from "next";
import Link from "next/link";
import { getAdminStats, getRecentActivity } from "@/lib/queries/admin-stats";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin — EnglishHero101" };

export default async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([getAdminStats(), getRecentActivity()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">An overview of your content.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Categories" value={stats.totalCategories} />
        <StatCard label="Lessons" value={stats.totalLessons} />
        <StatCard label="Published lessons" value={stats.publishedLessons} />
        <StatCard label="Draft lessons" value={stats.draftLessons} />
        <StatCard label="Questions" value={stats.totalQuestions} />
        <StatCard label="Vocabulary" value={stats.totalVocabulary} />
        <StatCard label="Students" value={stats.totalStudents} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing has been changed yet.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {activity.map((item) => (
                <li
                  key={`${item.type}-${item.id}`}
                  className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-medium">{item.title}</span>
                    <Badge variant="outline" className="shrink-0">
                      {item.type === "lesson" ? "Lesson" : "Content"}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant={item.status === "published" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Link href="/admin/content" className="text-sm font-medium text-primary hover:underline">
        Manage content →
      </Link>
    </div>
  );
}
