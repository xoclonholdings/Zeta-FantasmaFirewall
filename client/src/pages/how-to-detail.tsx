import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { Link, useRoute } from "wouter";

import { fetchJson } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Guide = {
  id: number;
  title: string;
  description: string | null;
  content: string;
  category: string | null;
  difficulty: string | null;
  estimatedTime: string | null;
};

export default function HowToDetail() {
  const [, params] = useRoute("/how-to/:id");
  const guideId = params?.id;

  const guideQuery = useQuery({
    queryKey: ["/api/how-to-guides", guideId],
    queryFn: () => fetchJson<Guide>(`/api/how-to-guides/${guideId}`),
    enabled: Boolean(guideId),
  });

  if (guideQuery.isLoading) {
    return <div className="min-h-screen bg-navy-900 p-8 text-slate-300">Loading guide...</div>;
  }

  if (!guideQuery.data) {
    return (
      <div className="min-h-screen bg-navy-900 p-8 text-slate-300">
        <Link href="/how-to">
          <Button variant="ghost">Back to guides</Button>
        </Link>
      </div>
    );
  }

  const guide = guideQuery.data;

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 p-4">
      <div className="mx-auto max-w-4xl">
        <Link href="/how-to">
          <Button variant="ghost" className="mb-6 text-slate-300 hover:bg-navy-800 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Guides
          </Button>
        </Link>

        <Card className="mb-6 bg-navy-800 border-navy-600">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {guide.category && <Badge variant="outline" className="border-navy-500 text-slate-200">{guide.category}</Badge>}
              {guide.difficulty && <Badge className="bg-cyber-green/20 text-cyber-green">{guide.difficulty}</Badge>}
            </div>
            <CardTitle className="flex items-center text-white">
              <BookOpen className="mr-2 h-5 w-5 text-cyber-blue" />
              {guide.title}
            </CardTitle>
            {guide.description && <p className="text-slate-300">{guide.description}</p>}
            {guide.estimatedTime && (
              <p className="flex items-center text-sm text-slate-400">
                <Clock className="mr-2 h-4 w-4" />
                {guide.estimatedTime}
              </p>
            )}
          </CardHeader>
        </Card>

        <Card className="bg-navy-800 border-navy-600">
          <CardContent className="prose prose-invert max-w-none p-8 prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white">
            <div className="whitespace-pre-wrap">{guide.content}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
