import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, ArrowLeft, Plus, Edit, Trash2, Save, BookOpen, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("faq");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // FAQ Data
  const { data: faqData } = useQuery({
    queryKey: ['/api/admin/faq'],
    queryFn: async () => {
      // Mock data for demo
      return {
        categories: [
          { id: 1, name: "Getting Started", description: "Basic setup and configuration", displayOrder: 1, isActive: true },
          { id: 2, name: "Security Features", description: "Understanding security tools", displayOrder: 2, isActive: true },
          { id: 3, name: "Troubleshooting", description: "Common issues and solutions", displayOrder: 3, isActive: true }
        ],
        items: [
          { id: 1, categoryId: 1, question: "What is Fantasma Firewall?", answer: "AI-driven security platform...", displayOrder: 1, isActive: true },
          { id: 2, categoryId: 1, question: "How do I connect my wallet?", answer: "Click the wallet connection button...", displayOrder: 2, isActive: true }
        ]
      };
    },
  });

  // How-To Data
  const { data: howToGuides } = useQuery({
    queryKey: ['/api/admin/how-to-guides'],
    queryFn: async () => {
      // Mock data for demo
      return [
        { id: 1, title: "Setting Up Security Scan", description: "Configure your first scan", category: "Security", difficulty: "beginner", estimatedTime: "10 minutes", isActive: true },
        { id: 2, title: "Quantum Encryption Setup", description: "Advanced encryption configuration", category: "Security", difficulty: "advanced", estimatedTime: "45 minutes", isActive: true }
      ];
    },
  });

  // FAQ Mutations
  const createFaqItem = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/faq/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create FAQ item');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "FAQ item created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/faq'] });
      setIsDialogOpen(false);
      setEditingItem(null);
    }
  });

  const updateFaqItem = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/admin/faq/items/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update FAQ item');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "FAQ item updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/faq'] });
      setIsDialogOpen(false);
      setEditingItem(null);
    }
  });

  const deleteFaqItem = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/faq/items/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete FAQ item');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "FAQ item deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/faq'] });
    }
  });

  // How-To Mutations
  const createHowToGuide = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/how-to-guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create guide');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "How-to guide created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/how-to-guides'] });
      setIsDialogOpen(false);
      setEditingItem(null);
    }
  });

  const updateHowToGuide = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/admin/how-to-guides/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update guide');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "How-to guide updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/how-to-guides'] });
      setIsDialogOpen(false);
      setEditingItem(null);
    }
  });

  const deleteHowToGuide = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/how-to-guides/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete guide');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "How-to guide deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/how-to-guides'] });
    }
  });

  const handleEditItem = (item: any, type: string) => {
    setEditingItem({ ...item, type });
    setIsDialogOpen(true);
  };

  const handleSaveItem = (formData: FormData) => {
    const data = Object.fromEntries(formData.entries());
    
    if (editingItem?.type === 'faq') {
      if (editingItem.id) {
        updateFaqItem.mutate({ ...data, id: editingItem.id });
      } else {
        createFaqItem.mutate(data);
      }
    } else if (editingItem?.type === 'guide') {
      if (editingItem.id) {
        updateHowToGuide.mutate({ ...data, id: editingItem.id });
      } else {
        createHowToGuide.mutate(data);
      }
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Settings className="w-6 h-6 mr-2 text-cyber-blue" />
                Admin Panel
              </h1>
              <p className="text-slate-400">Manage FAQ and How-To content</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-navy-800 border-navy-600">
            <TabsTrigger value="faq" className="data-[state=active]:bg-cyber-blue">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ Management
            </TabsTrigger>
            <TabsTrigger value="guides" className="data-[state=active]:bg-cyber-blue">
              <BookOpen className="w-4 h-4 mr-2" />
              How-To Guides
            </TabsTrigger>
          </TabsList>

          {/* FAQ Management */}
          <TabsContent value="faq" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">FAQ Items</h2>
              <Button
                onClick={() => {
                  setEditingItem({ type: 'faq' });
                  setIsDialogOpen(true);
                }}
                className="bg-cyber-blue hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ Item
              </Button>
            </div>

            <div className="grid gap-4">
              {faqData?.items?.map((item: any) => (
                <Card key={item.id} className="bg-navy-800 border-navy-600">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-lg">{item.question}</CardTitle>
                        <Badge variant="outline" className="mt-2">
                          {faqData.categories.find((cat: any) => cat.id === item.categoryId)?.name || 'Uncategorized'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditItem(item, 'faq')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteFaqItem.mutate(item.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* How-To Guides Management */}
          <TabsContent value="guides" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">How-To Guides</h2>
              <Button
                onClick={() => {
                  setEditingItem({ type: 'guide' });
                  setIsDialogOpen(true);
                }}
                className="bg-cyber-blue hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Guide
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {howToGuides?.map((guide: any) => (
                <Card key={guide.id} className="bg-navy-800 border-navy-600">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-lg">{guide.title}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{guide.category}</Badge>
                          <Badge variant="outline">{guide.difficulty}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditItem(guide, 'guide')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteHowToGuide.mutate(guide.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm">{guide.description}</p>
                    <p className="text-slate-400 text-xs mt-2">Time: {guide.estimatedTime}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-navy-800 border-navy-600 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem?.id ? 'Edit' : 'Create'} {editingItem?.type === 'faq' ? 'FAQ Item' : 'How-To Guide'}
              </DialogTitle>
            </DialogHeader>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveItem(new FormData(e.target as HTMLFormElement));
              }}
              className="space-y-4"
            >
              {editingItem?.type === 'faq' ? (
                <>
                  <div>
                    <Label htmlFor="question">Question</Label>
                    <Input
                      id="question"
                      name="question"
                      defaultValue={editingItem?.question}
                      required
                      className="bg-navy-700 border-navy-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="answer">Answer</Label>
                    <Textarea
                      id="answer"
                      name="answer"
                      defaultValue={editingItem?.answer}
                      required
                      rows={4}
                      className="bg-navy-700 border-navy-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryId">Category</Label>
                    <Select name="categoryId" defaultValue={editingItem?.categoryId?.toString()}>
                      <SelectTrigger className="bg-navy-700 border-navy-600 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-navy-700 border-navy-600">
                        {faqData?.categories?.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={editingItem?.title}
                      required
                      className="bg-navy-700 border-navy-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingItem?.description}
                      required
                      rows={2}
                      className="bg-navy-700 border-navy-600 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        name="category"
                        defaultValue={editingItem?.category}
                        required
                        className="bg-navy-700 border-navy-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select name="difficulty" defaultValue={editingItem?.difficulty}>
                        <SelectTrigger className="bg-navy-700 border-navy-600 text-white">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent className="bg-navy-700 border-navy-600">
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="estimatedTime">Estimated Time</Label>
                    <Input
                      id="estimatedTime"
                      name="estimatedTime"
                      defaultValue={editingItem?.estimatedTime}
                      placeholder="e.g., 10 minutes"
                      className="bg-navy-700 border-navy-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content (Markdown)</Label>
                    <Textarea
                      id="content"
                      name="content"
                      defaultValue={editingItem?.content}
                      required
                      rows={8}
                      className="bg-navy-700 border-navy-600 text-white font-mono text-sm"
                    />
                  </div>
                </>
              )}
              
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-cyber-blue hover:bg-blue-600">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}