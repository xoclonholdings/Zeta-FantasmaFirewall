import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Edit, HelpCircle, Plus, Save, Settings, Trash2 } from "lucide-react";
import { Link } from "wouter";

import { fetchJson } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type FaqResponse = {
  categories: Array<{ id: number; name: string }>;
  items: Array<{ id: number; categoryId: number; question: string; answer: string }>;
};

type Guide = {
  id: number;
  title: string;
  description: string | null;
  content: string;
  category: string | null;
  difficulty: string | null;
  estimatedTime: string | null;
};

type EditorState =
  | {
      kind: "faq";
      id?: number;
      question: string;
      answer: string;
      categoryId: string;
    }
  | {
      kind: "guide";
      id?: number;
      title: string;
      description: string;
      content: string;
      category: string;
      difficulty: string;
      estimatedTime: string;
    };

const emptyFaqEditor: EditorState = {
  kind: "faq",
  question: "",
  answer: "",
  categoryId: "",
};

const emptyGuideEditor: EditorState = {
  kind: "guide",
  title: "",
  description: "",
  content: "",
  category: "",
  difficulty: "beginner",
  estimatedTime: "",
};

export default function AdminPanel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editor, setEditor] = useState<EditorState | null>(null);

  const faqQuery = useQuery({
    queryKey: ["/api/admin/faq"],
    queryFn: () => fetchJson<FaqResponse>("/api/admin/faq"),
  });

  const guidesQuery = useQuery({
    queryKey: ["/api/admin/how-to-guides"],
    queryFn: () => fetchJson<Guide[]>("/api/admin/how-to-guides"),
  });

  const faqMutation = useMutation({
    mutationFn: (payload: EditorState & { kind: "faq" }) =>
      payload.id
        ? fetchJson(`/api/admin/faq/items/${payload.id}`, {
            method: "PUT",
            body: JSON.stringify({
              categoryId: Number(payload.categoryId),
              question: payload.question,
              answer: payload.answer,
            }),
          })
        : fetchJson("/api/admin/faq/items", {
            method: "POST",
            body: JSON.stringify({
              categoryId: Number(payload.categoryId),
              question: payload.question,
              answer: payload.answer,
            }),
          }),
    onSuccess: () => {
      toast({ title: "FAQ saved", description: "The FAQ item has been updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq"] });
      setEditor(null);
    },
  });

  const guideMutation = useMutation({
    mutationFn: (payload: EditorState & { kind: "guide" }) =>
      payload.id
        ? fetchJson(`/api/admin/how-to-guides/${payload.id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : fetchJson("/api/admin/how-to-guides", {
            method: "POST",
            body: JSON.stringify(payload),
          }),
    onSuccess: () => {
      toast({ title: "Guide saved", description: "The guide has been updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/how-to-guides"] });
      setEditor(null);
    },
  });

  const deleteFaq = useMutation({
    mutationFn: (id: number) => fetchJson(`/api/admin/faq/items/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq"] });
      toast({ title: "FAQ archived", description: "The FAQ item is no longer active." });
    },
  });

  const deleteGuide = useMutation({
    mutationFn: (id: number) => fetchJson(`/api/admin/how-to-guides/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/how-to-guides"] });
      toast({ title: "Guide archived", description: "The guide is no longer active." });
    },
  });

  const faqCategories = faqQuery.data?.categories ?? [];
  const faqItems = faqQuery.data?.items ?? [];
  const guides = guidesQuery.data ?? [];

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
              <Settings className="mr-2 h-5 w-5 text-cyber-blue" />
              Content Admin
            </CardTitle>
          </CardHeader>
        </Card>

        <Tabs defaultValue="faq">
          <TabsList className="bg-navy-800 border border-navy-600">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="guides">How-To Guides</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-4">
            <Button className="bg-cyber-blue hover:bg-cyber-blue/80" onClick={() => setEditor(emptyFaqEditor)}>
              <Plus className="mr-2 h-4 w-4" />
              New FAQ item
            </Button>
            {faqItems.map((item) => (
              <Card key={item.id} className="bg-navy-800 border-navy-600">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg text-white">{item.question}</CardTitle>
                      <Badge variant="outline" className="mt-2 border-navy-500 text-slate-200">
                        {faqCategories.find((category) => category.id === item.categoryId)?.name ?? "Uncategorized"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="border-navy-500 bg-navy-700 text-slate-100 hover:bg-navy-600"
                        onClick={() =>
                          setEditor({
                            kind: "faq",
                            id: item.id,
                            question: item.question,
                            answer: item.answer,
                            categoryId: String(item.categoryId ?? ""),
                          })
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20" onClick={() => deleteFaq.mutate(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-slate-300">{item.answer}</CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="guides" className="space-y-4">
            <Button className="bg-cyber-blue hover:bg-cyber-blue/80" onClick={() => setEditor(emptyGuideEditor)}>
              <Plus className="mr-2 h-4 w-4" />
              New guide
            </Button>
            {guides.map((guide) => (
              <Card key={guide.id} className="bg-navy-800 border-navy-600">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg text-white">{guide.title}</CardTitle>
                      <div className="mt-2 flex gap-2">
                        {guide.category && <Badge variant="outline" className="border-navy-500 text-slate-200">{guide.category}</Badge>}
                        {guide.difficulty && <Badge className="bg-cyber-green/20 text-cyber-green">{guide.difficulty}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="border-navy-500 bg-navy-700 text-slate-100 hover:bg-navy-600"
                        onClick={() =>
                          setEditor({
                            kind: "guide",
                            id: guide.id,
                            title: guide.title,
                            description: guide.description ?? "",
                            content: guide.content,
                            category: guide.category ?? "",
                            difficulty: guide.difficulty ?? "beginner",
                            estimatedTime: guide.estimatedTime ?? "",
                          })
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20" onClick={() => deleteGuide.mutate(guide.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-300">
                  <p>{guide.description ?? "No description provided."}</p>
                  {guide.estimatedTime && (
                    <p className="text-xs text-slate-400">{guide.estimatedTime}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <EditorDialog
          categories={faqCategories}
          editor={editor}
          onClose={() => setEditor(null)}
          onSave={() => {
            if (!editor) {
              return;
            }

            if (editor.kind === "faq") {
              faqMutation.mutate(editor);
              return;
            }

            guideMutation.mutate(editor);
          }}
          onChange={setEditor}
        />
      </div>
    </div>
  );
}

function EditorDialog({
  categories,
  editor,
  onClose,
  onSave,
  onChange,
}: {
  categories: Array<{ id: number; name: string }>;
  editor: EditorState | null;
  onClose: () => void;
  onSave: () => void;
  onChange: (state: EditorState | null) => void;
}) {
  useEffect(() => {
    if (editor?.kind === "faq" && !editor.categoryId && categories[0]) {
      onChange({ ...editor, categoryId: String(categories[0].id) });
    }
  }, [categories, editor, onChange]);

  return (
    <Dialog open={Boolean(editor)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-navy-800 border-navy-600 text-white">
        <DialogHeader>
          <DialogTitle>
            {editor?.kind === "faq" ? (
              <span className="flex items-center"><HelpCircle className="mr-2 h-4 w-4" />FAQ Editor</span>
            ) : (
              <span className="flex items-center"><BookOpen className="mr-2 h-4 w-4" />Guide Editor</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {editor?.kind === "faq" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="faq-question">Question</Label>
              <Input id="faq-question" className="bg-navy-700 border-navy-600 text-white" value={editor.question} onChange={(event) => onChange({ ...editor, question: event.target.value })} />
            </div>
            <div>
              <Label htmlFor="faq-answer">Answer</Label>
              <Textarea id="faq-answer" className="bg-navy-700 border-navy-600 text-white" rows={5} value={editor.answer} onChange={(event) => onChange({ ...editor, answer: event.target.value })} />
            </div>
            <div>
              <Label htmlFor="faq-category">Category</Label>
              <Input id="faq-category" className="bg-navy-700 border-navy-600 text-white" value={editor.categoryId} onChange={(event) => onChange({ ...editor, categoryId: event.target.value })} placeholder={categories.map((category) => `${category.id}: ${category.name}`).join(", ")} />
            </div>
          </div>
        )}

        {editor?.kind === "guide" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="guide-title">Title</Label>
              <Input id="guide-title" className="bg-navy-700 border-navy-600 text-white" value={editor.title} onChange={(event) => onChange({ ...editor, title: event.target.value })} />
            </div>
            <div>
              <Label htmlFor="guide-description">Description</Label>
              <Textarea id="guide-description" className="bg-navy-700 border-navy-600 text-white" rows={3} value={editor.description} onChange={(event) => onChange({ ...editor, description: event.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="guide-category">Category</Label>
                <Input id="guide-category" className="bg-navy-700 border-navy-600 text-white" value={editor.category} onChange={(event) => onChange({ ...editor, category: event.target.value })} />
              </div>
              <div>
                <Label htmlFor="guide-difficulty">Difficulty</Label>
                <Input id="guide-difficulty" className="bg-navy-700 border-navy-600 text-white" value={editor.difficulty} onChange={(event) => onChange({ ...editor, difficulty: event.target.value })} />
              </div>
              <div>
                <Label htmlFor="guide-time">Estimated Time</Label>
                <Input id="guide-time" className="bg-navy-700 border-navy-600 text-white" value={editor.estimatedTime} onChange={(event) => onChange({ ...editor, estimatedTime: event.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="guide-content">Markdown Content</Label>
              <Textarea id="guide-content" className="bg-navy-700 border-navy-600 text-white font-mono" rows={10} value={editor.content} onChange={(event) => onChange({ ...editor, content: event.target.value })} />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" className="border-navy-500 bg-navy-700 text-slate-100 hover:bg-navy-600" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-cyber-blue hover:bg-cyber-blue/80" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
