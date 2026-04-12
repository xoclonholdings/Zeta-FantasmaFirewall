import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Clock, Search } from "lucide-react";
import { Link } from "wouter";

import { fetchJson } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Guide = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  estimatedTime: string | null;
  isActive: boolean | null;
};

export default function HowTo() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const guidesQuery = useQuery({
    queryKey: ["/api/how-to-guides"],
    queryFn: () => fetchJson<Guide[]>("/api/how-to-guides"),
  });

  const guides = (guidesQuery.data ?? []).filter((guide) => guide.isActive !== false);
  const categories = Array.from(new Set(guides.map((guide) => guide.category).filter(Boolean))) as string[];
  const filteredGuides = guides.filter((guide) => {
    if (selectedCategory && guide.category !== selectedCategory) {
      return false;
    }

    if (!searchQuery) {
      return true;
    }

    const needle = searchQuery.toLowerCase();
    return (
      guide.title.toLowerCase().includes(needle) ||
      (guide.description ?? "").toLowerCase().includes(needle)
    );
  });

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 p-4">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6 text-slate-300 hover:bg-navy-800 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <Card className="mb-6 bg-navy-800 border-navy-600">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <BookOpen className="mr-2 h-5 w-5 text-cyber-blue" />
              How-To Guides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="bg-navy-700 border-navy-600 pl-10 text-white"
                placeholder="Search guides"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategory === null ? "default" : "outline"}
                className={selectedCategory === null ? "bg-cyber-blue hover:bg-cyber-blue/80" : "border-navy-500 bg-navy-700 text-slate-100 hover:bg-navy-600"}
                onClick={() => setSelectedCategory(null)}
              >
                All categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={selectedCategory === category ? "bg-cyber-blue hover:bg-cyber-blue/80" : "border-navy-500 bg-navy-700 text-slate-100 hover:bg-navy-600"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredGuides.map((guide) => (
            <Link key={guide.id} href={`/how-to/${guide.id}`}>
              <Card className="h-full cursor-pointer bg-navy-800 border-navy-600 transition hover:bg-navy-700">
                <CardHeader>
                  <div className="mb-2 flex gap-2">
                    {guide.category && (
                      <Badge variant="outline" className="border-navy-500 text-slate-200">
                        {guide.category}
                      </Badge>
                    )}
                    {guide.difficulty && <Badge className="bg-cyber-green/20 text-cyber-green">{guide.difficulty}</Badge>}
                  </div>
                  <CardTitle className="text-lg text-white">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-300">{guide.description ?? "No description provided."}</p>
                  {guide.estimatedTime && (
                    <div className="flex items-center text-xs text-slate-400">
                      <Clock className="mr-2 h-3 w-3" />
                      {guide.estimatedTime}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
