import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, Clock, User } from "lucide-react";
import { Link, useRoute } from "wouter";
import ReactMarkdown from "react-markdown";

export default function HowToDetail() {
  const [match, params] = useRoute("/how-to/:id");
  const guideId = params?.id;

  const { data: guide, isLoading } = useQuery({
    queryKey: ['/api/how-to-guides', guideId],
    queryFn: async () => {
      const response = await fetch(`/api/how-to-guides/${guideId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        // Return mock data for demo
        return {
          id: parseInt(guideId || "1"),
          title: "Setting Up Your First Security Scan",
          description: "Learn how to configure and run your first comprehensive security scan",
          content: `# Setting Up Your First Security Scan

## Overview
This guide will walk you through setting up and running your first security scan with Fantasma Firewall.

## Prerequisites
- Connected Web3 wallet
- Active Fantasma Firewall dashboard access

## Step 1: Access the Dashboard
1. Navigate to the main dashboard
2. Ensure your wallet is connected (green indicator in top right)
3. Verify all systems show "ONLINE" status

## Step 2: Configure Scan Parameters
1. Click on "Security Controls" in the header
2. Select "Threat Reports"
3. Choose your scan scope:
   - **Quick Scan**: Basic vulnerability check (5 minutes)
   - **Deep Scan**: Comprehensive analysis (30 minutes)
   - **Custom Scan**: Tailored to specific threats

## Step 3: Run the Scan
1. Click "Start Security Scan"
2. Monitor progress in real-time
3. Review threat detection alerts as they appear

## Step 4: Review Results
1. Access detailed threat reports
2. Prioritize high-severity findings
3. Apply recommended countermeasures

## Troubleshooting
- If scan fails to start, refresh the page and reconnect wallet
- For timeout errors, try a quick scan first
- Contact support for persistent issues`,
          category: "Security",
          difficulty: "beginner",
          estimatedTime: "10 minutes",
          isActive: true
        };
      }
      return response.json();
    },
    enabled: !!guideId,
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-600';
      case 'intermediate': return 'bg-yellow-600';
      case 'advanced': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Security': return 'bg-cyber-blue';
      case 'Emergency': return 'bg-red-600';
      case 'Integration': return 'bg-purple-600';
      case 'Setup': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-900 text-slate-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading guide...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-navy-900 text-slate-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-300">Guide not found</p>
            <Link href="/how-to">
              <Button className="mt-4">Back to Guides</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link href="/how-to">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Guides
              </Button>
            </Link>
          </div>
        </div>

        {/* Guide Header */}
        <Card className="bg-navy-800 border-navy-600 mb-6">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <Badge className={getCategoryColor(guide.category)}>
                {guide.category}
              </Badge>
              <Badge className={getDifficultyColor(guide.difficulty)}>
                {guide.difficulty}
              </Badge>
            </div>
            <CardTitle className="text-2xl text-white mb-2">
              {guide.title}
            </CardTitle>
            <p className="text-slate-300 text-lg">
              {guide.description}
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-400 mt-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Estimated time: {guide.estimatedTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Difficulty: {guide.difficulty}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Guide Content */}
        <Card className="bg-navy-800 border-navy-600">
          <CardContent className="p-8">
            <div className="prose prose-slate prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-3xl font-bold text-white mb-6">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-semibold text-white mb-4 mt-8">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-medium text-white mb-3 mt-6">{children}</h3>,
                  p: ({ children }) => <p className="text-slate-300 mb-4 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="text-slate-300 mb-4 space-y-2">{children}</ul>,
                  ol: ({ children }) => <ol className="text-slate-300 mb-4 space-y-2 list-decimal list-inside">{children}</ol>,
                  li: ({ children }) => <li className="text-slate-300">{children}</li>,
                  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                  code: ({ children }) => <code className="bg-navy-700 text-cyber-blue px-2 py-1 rounded text-sm">{children}</code>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-cyber-blue bg-navy-700 p-4 my-4 rounded">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {guide.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Link href="/how-to">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Guides
            </Button>
          </Link>
          <div className="flex gap-3">
            <Link href="/faq">
              <Button variant="outline">
                View FAQ
              </Button>
            </Link>
            <Button className="bg-cyber-blue hover:bg-blue-600">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}