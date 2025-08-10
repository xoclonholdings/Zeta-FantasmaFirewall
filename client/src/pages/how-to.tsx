import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, ArrowLeft, Search, Clock, User } from "lucide-react";
import { Link } from "wouter";

export default function HowTo() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const { data: howToGuides, isLoading } = useQuery({
    queryKey: ['/api/how-to-guides'],
    queryFn: async () => {
      const response = await fetch('/api/how-to-guides', {
        credentials: 'include'
      });
      if (!response.ok) {
        // Return mock data for demo
        return [
          {
            id: 1,
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
            displayOrder: 1,
            isActive: true
          },
          {
            id: 2,
            title: "Configuring Quantum Encryption Layers",
            description: "Advanced setup for multi-layer quantum encryption protocols",
            content: `# Configuring Quantum Encryption Layers

## Overview
Configure advanced quantum encryption for maximum security protection.

## Prerequisites
- Admin access to Fantasma Firewall
- Understanding of encryption concepts
- Minimum 1GB available bandwidth

## Step 1: Access Quantum Controls
1. Navigate to Security Controls → Quantum Encryption
2. Verify current encryption status
3. Check system compatibility

## Step 2: Layer Configuration
1. **Physical Layer**: Configure hardware-level encryption
2. **Network Layer**: Set up transport encryption
3. **Application Layer**: Enable API encryption
4. **Quantum Layer**: Activate quantum protocols

## Step 3: Advanced Settings
1. Set key rotation frequency (recommended: 24 hours)
2. Configure encryption strength (256-bit minimum)
3. Enable automatic threat response

## Step 4: Testing and Validation
1. Run encryption integrity tests
2. Verify all layers are active
3. Monitor performance impact

## Security Notes
- Never disable all layers simultaneously
- Backup configuration before changes
- Test in development environment first`,
            category: "Security",
            difficulty: "advanced",
            estimatedTime: "45 minutes",
            displayOrder: 2,
            isActive: true
          },
          {
            id: 3,
            title: "Emergency Response Procedures",
            description: "Critical steps to take during security incidents",
            content: `# Emergency Response Procedures

## Overview
Quick reference for handling security emergencies and threats.

## Immediate Actions (First 60 seconds)
1. **Assess the Threat**
   - Check threat severity in dashboard
   - Identify affected systems
   - Determine scope of impact

2. **Initiate Emergency Protocols**
   - Navigate to Emergency Protocols page
   - Click "Emergency Lockdown" if needed
   - Deploy appropriate countermeasures

3. **Communication**
   - Alert relevant team members
   - Document incident details
   - Prepare status updates

## Response Procedures by Threat Type

### Corporate Sabotage
1. Enable isolation protocols
2. Deploy honeypot countermeasures
3. Escalate to law enforcement if needed

### AI Injection Attacks
1. Activate quantum defense mode
2. Isolate affected systems
3. Run deep vulnerability scans

### Market Manipulation
1. Freeze ZWAP transactions temporarily
2. Analyze trading patterns
3. Report to regulatory authorities

## Recovery Steps
1. Verify threat elimination
2. Restore normal operations gradually
3. Conduct post-incident review
4. Update security protocols

## Prevention
- Regular security drills
- Keep systems updated
- Monitor threat intelligence feeds`,
            category: "Emergency",
            difficulty: "intermediate",
            estimatedTime: "15 minutes",
            displayOrder: 3,
            isActive: true
          },
          {
            id: 4,
            title: "Integrating with ZWAP Exchange",
            description: "Connect Fantasma Firewall with ZWAP exchange for enhanced protection",
            content: `# Integrating with ZWAP Exchange

## Overview
Secure your ZWAP exchange operations with Fantasma Firewall integration.

## Setup Requirements
- ZWAP exchange account
- API access credentials
- Admin privileges on both platforms

## Step 1: API Configuration
1. Generate API keys in ZWAP dashboard
2. Add keys to Fantasma Firewall integrations
3. Test connection with ping request

## Step 2: Security Policies
1. Configure transaction monitoring
2. Set up suspicious activity alerts
3. Enable automatic trade halting

## Step 3: Real-time Monitoring
1. Monitor trading patterns
2. Track unusual volume spikes
3. Detect potential manipulation

## Best Practices
- Regularly rotate API keys
- Monitor integration logs
- Test emergency procedures
- Keep backup access methods`,
            category: "Integration",
            difficulty: "intermediate",
            estimatedTime: "30 minutes",
            displayOrder: 4,
            isActive: true
          }
        ];
      }
      return response.json();
    },
  });

  const categories = Array.from(new Set(howToGuides?.map((guide: any) => guide.category) || []));
  const difficulties = ["beginner", "intermediate", "advanced"];

  const filteredGuides = howToGuides?.filter((guide: any) => {
    const matchesSearch = !searchQuery || 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || guide.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || guide.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty && guide.isActive;
  }) || [];

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

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
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
                <BookOpen className="w-6 h-6 mr-2 text-cyber-blue" />
                How-To Guides
              </h1>
              <p className="text-slate-400">Step-by-step instructions for Fantasma Firewall features</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-navy-800 border-navy-600 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-navy-700 border-navy-600 text-white"
                />
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex gap-2 flex-wrap">
                  <span className="text-sm text-slate-400 flex items-center">Category:</span>
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs"
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-xs"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <span className="text-sm text-slate-400 flex items-center">Difficulty:</span>
                  <Button
                    variant={selectedDifficulty === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDifficulty(null)}
                    className="text-xs"
                  >
                    All
                  </Button>
                  {difficulties.map((difficulty) => (
                    <Button
                      key={difficulty}
                      variant={selectedDifficulty === difficulty ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className="text-xs capitalize"
                    >
                      {difficulty}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading guides...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGuides.length === 0 ? (
              <div className="col-span-full">
                <Card className="bg-navy-800 border-navy-600">
                  <CardContent className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-300">No guides found</p>
                    <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredGuides.map((guide: any) => (
                <Link key={guide.id} href={`/how-to/${guide.id}`}>
                  <Card className="bg-navy-800 border-navy-600 hover:border-navy-500 transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={getCategoryColor(guide.category)}>
                          {guide.category}
                        </Badge>
                        <Badge className={getDifficultyColor(guide.difficulty)}>
                          {guide.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-white text-lg line-clamp-2">
                        {guide.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                        {guide.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {guide.estimatedTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {guide.difficulty}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Need Help Section */}
        <Card className="bg-navy-800 border-navy-600 mt-8">
          <CardContent className="text-center py-6">
            <h3 className="text-white font-medium mb-2">Need more help?</h3>
            <p className="text-slate-400 text-sm mb-4">
              Check our FAQ section or contact support for personalized assistance.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/faq">
                <Button variant="outline" size="sm">
                  View FAQ
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