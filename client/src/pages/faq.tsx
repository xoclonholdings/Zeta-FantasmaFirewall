import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HelpCircle, ArrowLeft, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Link } from "wouter";

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: faqData, isLoading } = useQuery({
    queryKey: ['/api/faq'],
    queryFn: async () => {
      const response = await fetch('/api/faq', {
        credentials: 'include'
      });
      if (!response.ok) {
        // Return mock data for demo
        return {
          categories: [
            {
              id: 1,
              name: "Getting Started",
              description: "Basic setup and initial configuration",
              displayOrder: 1,
              isActive: true
            },
            {
              id: 2,
              name: "Security Features",
              description: "Understanding Fantasma Firewall security tools",
              displayOrder: 2,
              isActive: true
            },
            {
              id: 3,
              name: "Troubleshooting",
              description: "Common issues and solutions",
              displayOrder: 3,
              isActive: true
            }
          ],
          items: [
            {
              id: 1,
              categoryId: 1,
              question: "What is Fantasma Firewall?",
              answer: "Fantasma Firewall is an AI-driven security platform designed to protect Web3 financial ecosystems. It features intelligent threat detection, quantum encryption, and comprehensive monitoring of blockchain vulnerabilities.",
              displayOrder: 1,
              isActive: true
            },
            {
              id: 2,
              categoryId: 1,
              question: "How do I connect my wallet?",
              answer: "Click the wallet connection button in the top right corner of the dashboard. Fantasma Firewall supports MetaMask, Coinbase Wallet, and other Web3-compatible wallets. Follow the prompts to securely connect your wallet.",
              displayOrder: 2,
              isActive: true
            },
            {
              id: 3,
              categoryId: 2,
              question: "What is Zeta Core AI?",
              answer: "Zeta Core AI is the intelligent threat detection engine that powers Fantasma Firewall. It continuously analyzes patterns, assigns confidence scores, and provides real-time threat assessment with neural processing capabilities.",
              displayOrder: 1,
              isActive: true
            },
            {
              id: 4,
              categoryId: 2,
              question: "How does Quantum Encryption work?",
              answer: "Our quantum encryption system provides multi-layer security protection using advanced quantum protocols. It includes multiple encryption layers, quantum isolation protocols, and real-time key rotation for maximum security.",
              displayOrder: 2,
              isActive: true
            },
            {
              id: 5,
              categoryId: 3,
              question: "Why am I getting authentication errors?",
              answer: "Authentication errors typically occur when your wallet connection expires or when switching between accounts. Try refreshing the page and reconnecting your wallet. Ensure your wallet extension is enabled and unlocked.",
              displayOrder: 1,
              isActive: true
            },
            {
              id: 6,
              categoryId: 3,
              question: "What should I do if I see suspicious activity?",
              answer: "Immediately use the Emergency Lockdown feature in the Quick Actions menu. Review the Threat Reports for detailed analysis, and contact support if the threat persists. Our AI continuously monitors and responds to threats automatically.",
              displayOrder: 2,
              isActive: true
            }
          ]
        };
      }
      return response.json();
    },
  });

  const filteredItems = faqData?.items?.filter((item: any) => {
    const matchesSearch = !searchQuery || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && item.isActive;
  }) || [];

  const activeCategories = faqData?.categories?.filter((cat: any) => cat.isActive) || [];

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
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
                <HelpCircle className="w-6 h-6 mr-2 text-cyber-blue" />
                Frequently Asked Questions
              </h1>
              <p className="text-slate-400">Find answers to common questions about Fantasma Firewall</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="bg-navy-800 border-navy-600 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-navy-700 border-navy-600 text-white"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs"
                >
                  All Categories
                </Button>
                {activeCategories.map((category: any) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-xs"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading FAQ...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <Card className="bg-navy-800 border-navy-600">
                <CardContent className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300">No FAQ items found</p>
                  <p className="text-slate-400 text-sm">Try adjusting your search or category filter</p>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map((item: any) => {
                const category = activeCategories.find((cat: any) => cat.id === item.categoryId);
                return (
                  <Collapsible key={item.id}>
                    <Card className="bg-navy-800 border-navy-600 hover:border-navy-500 transition-colors">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-navy-750">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start space-x-3">
                              <HelpCircle className="w-5 h-5 text-cyber-blue mt-1 flex-shrink-0" />
                              <div className="text-left">
                                <CardTitle className="text-white text-lg">{item.question}</CardTitle>
                                {category && (
                                  <Badge variant="outline" className="mt-2 text-xs">
                                    {category.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="ml-8 text-slate-300 leading-relaxed">
                            {item.answer}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })
            )}
          </div>
        )}

        {/* Contact Support */}
        <Card className="bg-navy-800 border-navy-600 mt-8">
          <CardContent className="text-center py-6">
            <h3 className="text-white font-medium mb-2">Can't find what you're looking for?</h3>
            <p className="text-slate-400 text-sm mb-4">
              Contact our support team or check our How-To guides for detailed instructions.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/how-to">
                <Button variant="outline" size="sm">
                  View How-To Guides
                </Button>
              </Link>
              <Button size="sm" className="bg-cyber-blue hover:bg-blue-600">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}