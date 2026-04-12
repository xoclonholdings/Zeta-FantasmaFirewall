import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle, Search } from "lucide-react";
import { Link } from "wouter";

import { fetchJson } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FaqResponse = {
  categories: Array<{ id: number; name: string; isActive: boolean }>;
  items: Array<{ id: number; categoryId: number; question: string; answer: string; isActive: boolean }>;
};

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [openItemId, setOpenItemId] = useState<number | null>(null);

  const faqQuery = useQuery({
    queryKey: ["/api/faq"],
    queryFn: () => fetchJson<FaqResponse>("/api/faq"),
  });

  const categories = faqQuery.data?.categories.filter((category) => category.isActive) ?? [];
  const items =
    faqQuery.data?.items.filter((item) => {
      if (!item.isActive) {
        return false;
      }

      if (selectedCategory !== null && item.categoryId !== selectedCategory) {
        return false;
      }

      if (!searchQuery) {
        return true;
      }

      const needle = searchQuery.toLowerCase();
      return item.question.toLowerCase().includes(needle) || item.answer.toLowerCase().includes(needle);
    }) ?? [];

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 p-4">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6 text-slate-300 hover:bg-navy-800 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <Card className="mb-6 bg-navy-800 border-navy-600">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <HelpCircle className="mr-2 h-5 w-5 text-cyber-blue" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="bg-navy-700 border-navy-600 pl-10 text-white"
                placeholder="Search FAQ"
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
                  key={category.id}
                  size="sm"
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={selectedCategory === category.id ? "bg-cyber-blue hover:bg-cyber-blue/80" : "border-navy-500 bg-navy-700 text-slate-100 hover:bg-navy-600"}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {items.map((item) => {
            const categoryName = categories.find((category) => category.id === item.categoryId)?.name;
            const isOpen = openItemId === item.id;

            return (
              <Card key={item.id} className="bg-navy-800 border-navy-600">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setOpenItemId((current) => (current === item.id ? null : item.id))}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg text-white">{item.question}</CardTitle>
                      {categoryName && (
                        <Badge variant="outline" className="mt-2 border-navy-500 text-slate-200">
                          {categoryName}
                        </Badge>
                      )}
                    </div>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                  </div>
                </CardHeader>
                {isOpen && (
                  <CardContent>
                    <p className="leading-7 text-slate-300">{item.answer}</p>
                  </CardContent>
                )}
              </Card>
            );
          })}

          {!faqQuery.isLoading && items.length === 0 && (
            <Card className="bg-navy-800 border-navy-600">
              <CardContent className="py-10 text-center text-slate-400">No FAQ entries matched the current filter.</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
