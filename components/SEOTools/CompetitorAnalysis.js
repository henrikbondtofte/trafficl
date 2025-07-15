import { useState, useRef } from 'react';

export default function CompetitorAnalysis() {
  const [analysisMode, setAnalysisMode] = useState('standard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  // URL States
  const [yourSite, setYourSite] = useState('');
  const [competitors, setCompetitors] = useState(['', '', '']);
  const [winners, setWinners] = useState(['', '', '']);
  const [losers, setLosers] = useState(['', '', '']);

  const modes = {
    standard: {
      title: '🎯 Standard Comparison',
      description: 'Compare your site against 3 competitors',
      fields: 'yourSite + 3 competitors'
    },
    winnersLosers: {
      title: '⚔️ Winners vs Losers',
      description: 'Analyze 3 winners + 3 losers + your site (perfect for Core Updates)',
      fields: '3 winners + 3 losers + your site'
    },
    coreUpdate: {
      title: '📈 Core Update Impact',
      description: 'Track performance before/after Google Core Updates',
      fields: 'Historical comparison analysis'
    }
  };

  // Mock analysis function - would integrate real APIs
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setCurrentStep(1);
    
    try {
      // Step 1: Validate URLs
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Core Web Vitals Analysis
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Lighthouse Analysis
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Step 4: Crawlability & Renderability Analysis
      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Step 5: Content & DOM Analysis
      setCurrentStep(5);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 6: Performance & Loading Analysis
      setCurrentStep(6);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 7: Generate Rankings & Insights
      setCurrentStep(7);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock results
      const mockResults = generateMockResults();
      
      // Generate rankings after results are created
      mockResults.rankings = generateRankings(mockResults);
      
      setResults(mockResults);
      
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
      setCurrentStep(1);
    }
  };

  const generateMockResults = () => {
    const sites = analysisMode === 'standard' 
      ? [yourSite, ...competitors.filter(c => c)]
      : [yourSite, ...winners.filter(w => w), ...losers.filter(l => l)];
    
    return {
      sites: sites.map((url, index) => {
        // Create more realistic mock data with correlations
        const isWinner = analysisMode === 'winnersLosers' && index <= 3 && index > 0;
        const isLoser = analysisMode === 'winnersLosers' && index > 3;
        const isYourSite = index === 0;
        
        // Base performance affects other metrics
        const basePerformance = isWinner ? 
          Math.floor(Math.random() * 20) + 80 : 
          isLoser ? 
            Math.floor(Math.random() * 30) + 40 : 
            Math.floor(Math.random() * 40) + 60;
        
        // Crawlability - winners have better crawlability
        const canCrawl = isWinner ? 
          Math.random() > 0.05 : 
          isLoser ? 
            Math.random() > 0.4 : 
            Math.random() > 0.2;
        
        const crawlErrors = canCrawl ? 
          Math.floor(Math.random() * 3) : 
          Math.floor(Math.random() * 8) + 2;
        
        const crawlabilityScore = calculateCrawlabilityScore(canCrawl, crawlErrors, Math.floor(Math.random() * 40) + 60);
        
        // Renderability - correlated with crawlability
        const canRender = canCrawl ? 
          Math.random() > 0.1 : 
          Math.random() > 0.5;
        
        const jsErrors = canRender ? 
          Math.floor(Math.random() * 3) : 
          Math.floor(Math.random() * 10) + 3;
        
        const renderScore = canRender ? 
          Math.floor(Math.random() * 20) + 80 : 
          Math.floor(Math.random() * 30) + 40;
        
        const renderabilityScore = calculateRenderabilityScore(canRender, renderScore, jsErrors);
        
        // Technical SEO - larger sites more likely to have schema
        const hasSchema = basePerformance > 75 ? 
          Math.random() > 0.2 : 
          Math.random() > 0.6;
        
        const lighthouse = {
          performance: basePerformance,
          accessibility: Math.floor(Math.random() * 20) + (basePerformance - 10),
          bestPractices: Math.floor(Math.random() * 15) + (basePerformance - 5),
          seo: Math.floor(Math.random() * 20) + (basePerformance - 10),
        };
        
        // Calculate overall score using weighted formula
        const overallScore = calculateOverallScore(
          lighthouse,
          crawlabilityScore,
          renderabilityScore,
          hasSchema
        );
        
        return {
          url,
          name: index === 0 ? 'Your Site' : 
                isWinner ? `Winner ${index}` : 
                isLoser ? `Loser ${index - 3}` : 
                `Competitor ${index}`,
          coreWebVitals: {
            lcp: basePerformance > 80 ? Math.random() * 1.5 + 1 : Math.random() * 2 + 2,
            fid: basePerformance > 80 ? Math.random() * 100 : Math.random() * 200 + 100,
            cls: basePerformance > 80 ? Math.random() * 0.1 : Math.random() * 0.3 + 0.1,
            score: basePerformance,
            mobileScore: Math.floor(basePerformance * 0.9) + Math.floor(Math.random() * 10)
          },
          lighthouse: {
            ...lighthouse,
            overallScore: Math.round(overallScore)
          },
          // Crawlability Analysis
          crawlability: {
            canCrawl,
            crawlErrors,
            blockedResources: canCrawl ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 15) + 5,
            robotsTxtIssues: Math.random() > 0.8,
            crawlDepth: Math.floor(Math.random() * 5) + 3,
            indexablePages: canCrawl ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 50) + 20,
            score: crawlabilityScore
          },
          renderability: {
            canRender,
            jsErrors,
            domIssues: canRender ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 15) + 5,
            criticalResourceErrors: canRender ? Math.floor(Math.random() * 1) : Math.floor(Math.random() * 5) + 1,
            renderScore,
            hydrationIssues: Math.random() > 0.85,
            score: renderabilityScore
          },
          domAnalysis: {
            totalElements: Math.floor(Math.random() * 2000) + 500,
            domDepth: basePerformance > 80 ? Math.floor(Math.random() * 4) + 8 : Math.floor(Math.random() * 8) + 10,
            domSize: basePerformance > 80 ? Math.floor(Math.random() * 200) + 100 : Math.floor(Math.random() * 400) + 200,
            duplicateIds: basePerformance > 80 ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 5) + 1,
            invalidMarkup: basePerformance > 80 ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 10) + 3,
            semanticScore: basePerformance > 80 ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30) + 50
          },
          content: {
            wordCount: isWinner ? Math.floor(Math.random() * 1500) + 1500 : Math.floor(Math.random() * 1000) + 500,
            readabilityScore: Math.floor(Math.random() * 20) + (basePerformance - 10),
            headingStructure: Math.floor(Math.random() * 15) + (basePerformance - 5),
            paragraphs: Math.floor(Math.random() * 20) + 10
          },
          technical: {
            h1Count: Math.floor(Math.random() * 2) + 1,
            h2Count: Math.floor(Math.random() * 8) + 3,
            h3Count: Math.floor(Math.random() * 12) + 5,
            metaDescription: basePerformance > 70 ? Math.random() > 0.2 : Math.random() > 0.6,
            imageOptimization: basePerformance,
            internalLinks: Math.floor(Math.random() * 40) + 20,
            externalLinks: Math.floor(Math.random() * 15) + 5,
            schemaMarkup: hasSchema,
            sitemap: basePerformance > 70 ? Math.random() > 0.1 : Math.random() > 0.4,
            robotsTxt: basePerformance > 70 ? Math.random() > 0.1 : Math.random() > 0.3
          },
          security: {
            httpsEnabled: basePerformance > 60 ? Math.random() > 0.05 : Math.random() > 0.3,
            securityHeaders: basePerformance > 80 ? Math.floor(Math.random() * 2) + 3 : Math.floor(Math.random() * 3) + 1,
            mixedContent: Math.random() > 0.8
          },
          loading: {
            totalRequests: basePerformance > 80 ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 80) + 70,
            totalSize: basePerformance > 80 ? Math.floor(Math.random() * 1000) + 1000 : Math.floor(Math.random() * 2000) + 1500,
            jsSize: basePerformance > 80 ? Math.floor(Math.random() * 300) + 200 : Math.floor(Math.random() * 600) + 400,
            cssSize: Math.floor(Math.random() * 150) + 50,
            imageSize: basePerformance > 80 ? Math.floor(Math.random() * 800) + 500 : Math.floor(Math.random() * 1500) + 1000
          }
        };
      }),
      insights: generateInsights()
    };
  };

  // Calculate crawlability score (0-100)
  const calculateCrawlabilityScore = (canCrawl, crawlErrors, indexablePages) => {
    let score = 0;
    
    // Base score for being crawlable
    if (canCrawl) score += 50;
    
    // Subtract for errors
    score -= crawlErrors * 8;
    
    // Add percentage of indexable pages
    score += indexablePages * 0.5;
    
    return Math.max(0, Math.min(100, score));
  };

  // Calculate renderability score (0-100)
  const calculateRenderabilityScore = (canRender, renderScore, jsErrors) => {
    let score = 0;
    
    // Base score for being renderable
    if (canRender) score += 40;
    
    // Add render quality
    score += renderScore * 0.6;
    
    // Subtract for JS errors
    score -= jsErrors * 5;
    
    return Math.max(0, Math.min(100, score));
  };

  // Calculate overall score using weighted formula
  const calculateOverallScore = (lighthouse, crawlabilityScore, renderabilityScore, hasSchema) => {
    const weights = {
      crawlability: 0.35,      // 35% - MEGA important!
      renderability: 0.25,     // 25% - Very important!
      performance: 0.15,       // 15% - Core Web Vitals
      seo: 0.12,              // 12% - Lighthouse SEO
      accessibility: 0.08,     // 8% - Accessibility
      technical: 0.05          // 5% - Technical SEO (schema, etc.)
    };
    
    const technicalScore = (hasSchema ? 80 : 40) + (lighthouse.bestPractices * 0.2);
    
    const weightedScore = 
      (crawlabilityScore * weights.crawlability) +
      (renderabilityScore * weights.renderability) +
      (lighthouse.performance * weights.performance) +
      (lighthouse.seo * weights.seo) +
      (lighthouse.accessibility * weights.accessibility) +
      (technicalScore * weights.technical);
    
    return Math.max(0, Math.min(100, weightedScore));
  };

  const generateInsights = () => [
    {
      type: 'critical',
      title: '🕷️ MAJOR Crawlability Advantage Detected!',
      description: 'Competitor B has critical crawl errors (35% of total score impact!) - this is a huge opportunity',
      recommendation: 'Target keywords where they rank - your superior crawlability gives you 20-40% ranking advantage',
      impact: 'High',
      metric: 'Crawlability'
    },
    {
      type: 'critical',
      title: '🖥️ Competitor Render Failure = Your Opportunity',
      description: 'Competitor C has JavaScript rendering problems (25% of total score impact!) - Google may not see their content',
      recommendation: 'Create content targeting their keywords - their render issues make them vulnerable',
      impact: 'High',
      metric: 'Renderability'
    },
    {
      type: 'warning',
      title: '🚨 Your Crawlability Score Needs Attention',
      description: 'Your crawlability score is below competitor average - this affects 35% of your overall SEO score',
      recommendation: 'Fix crawl errors immediately - this is your biggest SEO lever for improvement',
      impact: 'High',
      metric: 'Crawlability'
    },
    {
      type: 'opportunity',
      title: '💡 Schema Markup Competitive Gap',
      description: 'You have schema markup while 60% of competitors don\'t - leverage this technical advantage',
      recommendation: 'Expand schema implementation to more page types for maximum competitive advantage',
      impact: 'Medium',
      metric: 'Schema'
    },
    {
      type: 'warning',
      title: '⚠️ Content Length Disadvantage',
      description: 'Your content is 40% shorter than top competitors - but they have technical issues',
      recommendation: 'Expand content depth while maintaining your technical SEO advantages',
      impact: 'Medium',
      metric: 'Content'
    },
    {
      type: 'opportunity',
      title: '🏆 DOM Structure Competitive Edge',
      description: 'Your DOM depth is optimal while competitors have bloated structures affecting Core Web Vitals',
      recommendation: 'Highlight your technical efficiency - target their slow-loading pages',
      impact: 'Medium',
      metric: 'DOM'
    },
    {
      type: 'warning',
      title: '🖼️ Image Optimization Opportunity',
      description: 'Competitors have 35% smaller image sizes - affecting your Core Web Vitals score (15% of total)',
      recommendation: 'Implement WebP format and aggressive compression to match competitor performance',
      impact: 'Medium',
      metric: 'Images'
    },
    {
      type: 'opportunity',
      title: '🎯 Technical SEO Dominance Strategy',
      description: 'You outperform in crawlability and renderability - the two most important factors (60% of score)',
      recommendation: 'Focus content strategy on competitor\'s technical weaknesses for maximum ROI',
      impact: 'High',
      metric: 'Strategy'
    }
  ];

  const generateRankings = (resultsData) => {
    const metrics = [
      'overallScore', 'performance', 'contentLength', 'imageOptimization', 
      'internalLinks', 'accessibility', 'loadingSpeed', 'securityScore',
      'crawlability', 'renderability', 'domQuality'
    ];
    
    return metrics.reduce((rankings, metric) => {
      rankings[metric] = resultsData?.sites
        .map((site, index) => ({ ...site, originalIndex: index }))
        .sort((a, b) => getMetricValue(b, metric) - getMetricValue(a, metric))
        .map((site, rank) => ({ ...site, rank: rank + 1 })) || [];
      return rankings;
    }, {});
  };

  const getMetricValue = (site, metric) => {
    switch(metric) {
      case 'overallScore': return site.lighthouse?.overallScore || 0;
      case 'performance': return site.lighthouse?.performance || 0;
      case 'contentLength': return site.content?.wordCount || 0;
      case 'imageOptimization': return site.technical?.imageOptimization || 0;
      case 'internalLinks': return site.technical?.internalLinks || 0;
      case 'accessibility': return site.lighthouse?.accessibility || 0;
      case 'loadingSpeed': return 100 - (site.loading?.totalSize || 1000) / 50; // Inverse for speed
      case 'securityScore': return (site.security?.httpsEnabled ? 50 : 0) + (site.security?.securityHeaders * 10);
      case 'crawlability': return site.crawlability?.score || 0;
      case 'renderability': return site.renderability?.score || 0;
      case 'domQuality': return (site.domAnalysis?.semanticScore || 0) + (20 - site.domAnalysis?.domDepth) + (10 - site.domAnalysis?.duplicateIds * 2);
      default: return 0;
    }
  };

  const getRankColor = (rank, total) => {
    if (rank === 1) return 'text-green-400'; // Winner
    if (rank <= Math.ceil(total / 3)) return 'text-yellow-400'; // Good
    return 'text-red-400'; // Needs improvement
  };

  const getRankBadge = (rank, total) => {
    if (rank === 1) return '🏆';
    if (rank === total) return '❌';
    if (rank <= Math.ceil(total / 3)) return '⚡';
    return '⚠️';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400 font-bold';
    if (score >= 70) return 'text-yellow-400 font-medium';
    return 'text-red-400 font-medium';
  };

  const updateCompetitor = (index, value) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  const updateWinner = (index, value) => {
    const newWinners = [...winners];
    newWinners[index] = value;
    setWinners(newWinners);
  };

  const updateLoser = (index, value) => {
    const newLosers = [...losers];
    newLosers[index] = value;
    setLosers(newLosers);
  };

  const isFormValid = () => {
    if (analysisMode === 'standard') {
      return yourSite && competitors.filter(c => c).length >= 1;
    }
    if (analysisMode === 'winnersLosers') {
      return yourSite && winners.filter(w => w).length >= 1 && losers.filter(l => l).length >= 1;
    }
    return yourSite;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Mode Selection */}
      <div className="bg-gray-800 rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">📋 Choose Analysis Mode</h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {Object.entries(modes).map(([key, mode]) => (
            <button
              key={key}
              onClick={() => setAnalysisMode(key)}
              className={`p-4 rounded-xl border-2 transition-all ${
                analysisMode === key
                  ? 'border-blue-400 bg-blue-500/20 text-blue-300'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-lg font-semibold mb-2">{mode.title}</div>
              <div className="text-sm opacity-90">{mode.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* URL Inputs */}
      <div className="bg-gray-800 rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">🌐 Enter URLs for Analysis</h2>
        
        {/* Your Site */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            🏠 Your Website
          </label>
          <input
            type="url"
            value={yourSite}
            onChange={(e) => setYourSite(e.target.value)}
            placeholder="https://yoursite.com"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
          />
        </div>

        {/* Standard Mode Inputs */}
        {analysisMode === 'standard' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-4">🎯 Competitors</h3>
            {competitors.map((competitor, index) => (
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Competitor {index + 1}
                </label>
                <input
                  type="url"
                  value={competitor}
                  onChange={(e) => updateCompetitor(index, e.target.value)}
                  placeholder={`https://competitor${index + 1}.com`}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* Winners vs Losers Mode */}
        {analysisMode === 'winnersLosers' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Winners */}
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-4">🏆 Winners (Sites that improved)</h3>
              {winners.map((winner, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Winner {index + 1}
                  </label>
                  <input
                    type="url"
                    value={winner}
                    onChange={(e) => updateWinner(index, e.target.value)}
                    placeholder={`https://winner${index + 1}.com`}
                    className="w-full px-4 py-3 bg-gray-700 border border-green-600 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Losers */}
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-4">📉 Losers (Sites that declined)</h3>
              {losers.map((loser, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Loser {index + 1}
                  </label>
                  <input
                    type="url"
                    value={loser}
                    onChange={(e) => updateLoser(index, e.target.value)}
                    placeholder={`https://loser${index + 1}.com`}
                    className="w-full px-4 py-3 bg-gray-700 border border-red-600 rounded-lg text-white placeholder-gray-400 focus:border-red-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Update Mode */}
        {analysisMode === 'coreUpdate' && (
          <div className="bg-blue-900/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-4">📈 Core Update Analysis</h3>
            <p className="text-gray-300 mb-4">
              This mode will analyze your site's performance trends around Google Core Updates.
              Historical data analysis coming soon!
            </p>
            <div className="text-sm text-gray-400">
              💡 Tip: Use Winners vs Losers mode for manual Core Update impact analysis
            </div>
          </div>
        )}
      </div>

      {/* Analysis Button */}
      <div className="text-center mb-8">
        <button
          onClick={runAnalysis}
          disabled={!isFormValid() || isAnalyzing}
          className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
            isFormValid() && !isAnalyzing
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? '🔄 Analyzing...' : '🚀 Start Competitor Analysis'}
        </button>
      </div>

      {/* Loading Progress */}
      {isAnalyzing && (
        <div className="bg-gray-800 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">🔍 Analysis in Progress</h3>
          
          <div className="space-y-4">
            {[
              { step: 1, title: 'Validating URLs & Initial Scan', emoji: '🔗' },
              { step: 2, title: 'Analyzing Core Web Vitals', emoji: '⚡' },
              { step: 3, title: 'Running Full Lighthouse Analysis', emoji: '🔍' },
              { step: 4, title: 'Testing Crawlability & Renderability', emoji: '🕷️' },
              { step: 5, title: 'Scanning Content & DOM Structure', emoji: '🏗️' },
              { step: 6, title: 'Measuring Performance & Loading', emoji: '🚀' },
              { step: 7, title: 'Generating Rankings & Competitive Insights', emoji: '💡' }
            ].map(({ step, title, emoji }) => (
              <div key={step} className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep > step ? 'bg-green-500' : 
                  currentStep === step ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'
                }`}>
                  {currentStep > step ? '✅' : emoji}
                </div>
                <span className={`${currentStep >= step ? 'text-white' : 'text-gray-400'}`}>
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-8">
          {/* Executive Summary with Scoring Explanation */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">📋 Executive Summary</h3>
              <div className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3">
                <strong>Scoring Formula:</strong> Crawlability (35%) + Renderability (25%) + Performance (15%) + SEO (12%) + Accessibility (8%) + Technical (5%)
              </div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              {results.sites.map((site, index) => {
                const overallRank = results.rankings?.overallScore?.find(r => r.originalIndex === index)?.rank || index + 1;
                const isYourSite = index === 0;
                const crawlScore = site.crawlability?.score || 0;
                const renderScore = site.renderability?.score || 0;
                
                return (
                  <div key={index} className={`p-4 rounded-lg border-2 ${
                    overallRank === 1 ? 'border-green-400 bg-green-900/20' :
                    overallRank === results.sites.length ? 'border-red-400 bg-red-900/20' :
                    'border-gray-600 bg-gray-800/50'
                  } ${isYourSite ? 'ring-2 ring-blue-400' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-bold ${isYourSite ? 'text-blue-400' : 'text-white'}`}>
                        {site.name}
                      </h4>
                      <span className="text-2xl">
                        {getRankBadge(overallRank, results.sites.length)}
                      </span>
                    </div>
                    <div className="text-2xl font-bold mb-2">
                      <span className={getRankColor(overallRank, results.sites.length)}>
                        #{overallRank}
                      </span>
                      <span className="text-gray-400 text-sm ml-2">
                        {site.lighthouse.overallScore}/100
                      </span>
                    </div>
                    
                    {/* Key Scores Breakdown */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-gray-400">Crawl:</span>
                        <span className={`ml-1 font-medium ${getScoreColor(crawlScore)}`}>
                          {Math.round(crawlScore)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Render:</span>
                        <span className={`ml-1 font-medium ${getScoreColor(renderScore)}`}>
                          {Math.round(renderScore)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 truncate">{site.url}</div>
                    
                    {/* Critical Issues Alert */}
                    {(!site.crawlability.canCrawl || !site.renderability.canRender) && (
                      <div className="mt-2 text-xs text-red-300 bg-red-900/30 p-2 rounded">
                        🚨 Critical SEO Issues Detected!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Scoring Methodology */}
            <div className="mt-6 bg-gray-800/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">📊 Why This Scoring System?</h4>
              <div className="grid md:grid-cols-2 gap-4 text-xs text-gray-400">
                <div>
                  <strong className="text-red-400">🕷️ Crawlability (35%)</strong> - If Google can't crawl your site, rankings drop 20-40%
                  <br />
                  <strong className="text-purple-400">🖥️ Renderability (25%)</strong> - JavaScript issues = invisible content to Google
                </div>
                <div>
                  <strong className="text-yellow-400">⚡ Performance (15%)</strong> - Core Web Vitals impact rankings
                  <br />
                  <strong className="text-blue-400">🔍 SEO + Accessibility + Technical (25%)</strong> - Traditional SEO factors
                </div>
              </div>
            </div>
          </div>

          {/* Core Web Vitals Comparison */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">⚡ Core Web Vitals Comparison</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 text-gray-300">Site</th>
                    <th className="text-center py-3 px-4 text-gray-300">Overall</th>
                    <th className="text-center py-3 px-4 text-gray-300">LCP</th>
                    <th className="text-center py-3 px-4 text-gray-300">FID</th>
                    <th className="text-center py-3 px-4 text-gray-300">CLS</th>
                    <th className="text-center py-3 px-4 text-gray-300">Mobile</th>
                    <th className="text-center py-3 px-4 text-gray-300">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {results.sites.map((site, index) => {
                    const perfRank = results.rankings?.performance?.find(r => r.originalIndex === index)?.rank || index + 1;
                    const isYourSite = index === 0;
                    
                    return (
                      <tr key={index} className={`border-b border-gray-700 ${
                        isYourSite ? 'bg-blue-900/20' : 
                        perfRank === 1 ? 'bg-green-900/20' : 
                        perfRank === results.sites.length ? 'bg-red-900/20' : ''
                      }`}>
                        <td className="py-3 px-4">
                          <div className={`font-medium ${isYourSite ? 'text-blue-400' : 'text-white'}`}>
                            {site.name}
                          </div>
                          <div className="text-gray-400 text-xs">{site.url}</div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={`font-bold ${
                            site.coreWebVitals.score >= 90 ? 'text-green-400' :
                            site.coreWebVitals.score >= 70 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {site.coreWebVitals.score}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4 text-gray-300">
                          {site.coreWebVitals.lcp.toFixed(1)}s
                        </td>
                        <td className="text-center py-3 px-4 text-gray-300">
                          {site.coreWebVitals.fid.toFixed(0)}ms
                        </td>
                        <td className="text-center py-3 px-4 text-gray-300">
                          {site.coreWebVitals.cls.toFixed(2)}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={`font-medium ${
                            site.coreWebVitals.mobileScore >= 90 ? 'text-green-400' :
                            site.coreWebVitals.mobileScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {site.coreWebVitals.mobileScore}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={`font-bold ${getRankColor(perfRank, results.sites.length)}`}>
                            {getRankBadge(perfRank, results.sites.length)} #{perfRank}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* NEW: Crawlability & Renderability Analysis */}
          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">🕷️ Crawlability & Renderability Analysis</h3>
            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-6">
              <p className="text-yellow-300 text-sm">
                🎯 <strong>Critical Competitive Advantage:</strong> Sites that can't be crawled or rendered properly by Google lose rankings dramatically!
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Crawlability Analysis */}
              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-4">🕷️ Google Crawlability</h4>
                <div className="space-y-4">
                  {results.sites.map((site, index) => {
                    const crawlRank = results.rankings?.crawlability?.find(r => r.originalIndex === index)?.rank || index + 1;
                    const isYourSite = index === 0;
                    const canCrawl = site.crawlability.canCrawl;
                    
                    return (
                      <div key={index} className={`p-4 rounded-lg border-2 ${
                        !canCrawl ? 'border-red-500 bg-red-900/30' :
                        crawlRank === 1 ? 'border-green-500 bg-green-900/20' :
                        isYourSite ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-700'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <span className={`font-medium ${isYourSite ? 'text-blue-400' : 'text-white'}`}>
                            {site.name}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${getRankColor(crawlRank, results.sites.length)}`}>
                              {getRankBadge(crawlRank, results.sites.length)} #{crawlRank}
                            </span>
                            <span className={`text-lg ${canCrawl ? 'text-green-400' : 'text-red-400'}`}>
                              {canCrawl ? '✅' : '❌'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400">Crawl Errors:</span>
                            <span className={`ml-1 font-medium ${site.crawlability.crawlErrors > 2 ? 'text-red-400' : 'text-green-400'}`}>
                              {site.crawlability.crawlErrors}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Blocked:</span>
                            <span className={`ml-1 font-medium ${site.crawlability.blockedResources > 5 ? 'text-red-400' : 'text-green-400'}`}>
                              {site.crawlability.blockedResources}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Indexable:</span>
                            <span className="text-white ml-1 font-medium">{site.crawlability.indexablePages}%</span>
                          </div>
                        </div>
                        
                        {!canCrawl && (
                          <div className="mt-2 text-xs text-red-300 bg-red-900/30 p-2 rounded">
                            ⚠️ <strong>CRITICAL:</strong> This site has major crawlability issues!
                          </div>
                        )}
                        {site.crawlability.robotsTxtIssues && (
                          <div className="mt-2 text-xs text-yellow-300 bg-yellow-900/30 p-2 rounded">
                            ⚠️ Robots.txt blocking important pages
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Renderability Analysis */}
              <div>
                <h4 className="text-lg font-semibold text-purple-400 mb-4">🖥️ Page Renderability</h4>
                <div className="space-y-4">
                  {results.sites.map((site, index) => {
                    const renderRank = results.rankings?.renderability?.find(r => r.originalIndex === index)?.rank || index + 1;
                    const isYourSite = index === 0;
                    const canRender = site.renderability.canRender;
                    
                    return (
                      <div key={index} className={`p-4 rounded-lg border-2 ${
                        !canRender ? 'border-red-500 bg-red-900/30' :
                        renderRank === 1 ? 'border-green-500 bg-green-900/20' :
                        isYourSite ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-700'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <span className={`font-medium ${isYourSite ? 'text-blue-400' : 'text-white'}`}>
                            {site.name}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${getRankColor(renderRank, results.sites.length)}`}>
                              {getRankBadge(renderRank, results.sites.length)} #{renderRank}
                            </span>
                            <span className={`text-lg ${canRender ? 'text-green-400' : 'text-red-400'}`}>
                              {canRender ? '✅' : '❌'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-xs mb-2">
                          <div>
                            <span className="text-gray-400">JS Errors:</span>
                            <span className={`ml-1 font-medium ${site.renderability.jsErrors > 3 ? 'text-red-400' : 'text-green-400'}`}>
                              {site.renderability.jsErrors}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">DOM Issues:</span>
                            <span className={`ml-1 font-medium ${site.renderability.domIssues > 5 ? 'text-red-400' : 'text-green-400'}`}>
                              {site.renderability.domIssues}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Score:</span>
                            <span className={`ml-1 font-medium ${getScoreColor(site.renderability.renderScore)}`}>
                              {site.renderability.renderScore}
                            </span>
                          </div>
                        </div>
                        
                        {!canRender && (
                          <div className="mt-2 text-xs text-red-300 bg-red-900/30 p-2 rounded">
                            ⚠️ <strong>CRITICAL:</strong> Google may not see this site's content!
                          </div>
                        )}
                        {site.renderability.hydrationIssues && (
                          <div className="mt-2 text-xs text-yellow-300 bg-yellow-900/30 p-2 rounded">
                            ⚠️ Hydration issues detected
                          </div>
                        )}
                        {site.renderability.criticalResourceErrors > 0 && (
                          <div className="mt-2 text-xs text-orange-300 bg-orange-900/30 p-2 rounded">
                            ⚠️ {site.renderability.criticalResourceErrors} critical resource errors
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* DOM Quality Analysis */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">🏗️ DOM Structure Quality Analysis</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 text-gray-300">Site</th>
                    <th className="text-center py-3 px-4 text-gray-300">DOM Size</th>
                    <th className="text-center py-3 px-4 text-gray-300">DOM Depth</th>
                    <th className="text-center py-3 px-4 text-gray-300">Elements</th>
                    <th className="text-center py-3 px-4 text-gray-300">Duplicate IDs</th>
                    <th className="text-center py-3 px-4 text-gray-300">Invalid Markup</th>
                    <th className="text-center py-3 px-4 text-gray-300">Semantic Score</th>
                    <th className="text-center py-3 px-4 text-gray-300">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {results.sites.map((site, index) => {
                    const domRank = results.rankings?.domQuality?.find(r => r.originalIndex === index)?.rank || index + 1;
                    const isYourSite = index === 0;
                    
                    return (
                      <tr key={index} className={`border-b border-gray-700 ${
                        isYourSite ? 'bg-blue-900/20' : 
                        domRank === 1 ? 'bg-green-900/20' : 
                        domRank === results.sites.length ? 'bg-red-900/20' : ''
                      }`}>
                        <td className="py-3 px-4">
                          <div className={`font-medium ${isYourSite ? 'text-blue-400' : 'text-white'}`}>
                            {site.name}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={site.domAnalysis.domSize > 300 ? 'text-red-400' : site.domAnalysis.domSize > 200 ? 'text-yellow-400' : 'text-green-400'}>
                            {site.domAnalysis.domSize}KB
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={site.domAnalysis.domDepth > 12 ? 'text-red-400' : site.domAnalysis.domDepth > 8 ? 'text-yellow-400' : 'text-green-400'}>
                            {site.domAnalysis.domDepth}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4 text-gray-300">
                          {site.domAnalysis.totalElements.toLocaleString()}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={site.domAnalysis.duplicateIds > 0 ? 'text-red-400' : 'text-green-400'}>
                            {site.domAnalysis.duplicateIds}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={site.domAnalysis.invalidMarkup > 3 ? 'text-red-400' : site.domAnalysis.invalidMarkup > 0 ? 'text-yellow-400' : 'text-green-400'}>
                            {site.domAnalysis.invalidMarkup}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={getScoreColor(site.domAnalysis.semanticScore)}>
                            {site.domAnalysis.semanticScore}%
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={`font-bold ${getRankColor(domRank, results.sites.length)}`}>
                            {getRankBadge(domRank, results.sites.length)} #{domRank}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">🔍 Lighthouse Analysis Comparison</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 text-gray-300">Site</th>
                    <th className="text-center py-3 px-4 text-gray-300">Performance</th>
                    <th className="text-center py-3 px-4 text-gray-300">Accessibility</th>
                    <th className="text-center py-3 px-4 text-gray-300">Best Practices</th>
                    <th className="text-center py-3 px-4 text-gray-300">SEO</th>
                    <th className="text-center py-3 px-4 text-gray-300">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {results.sites.map((site, index) => {
                    const isYourSite = index === 0;
                    
                    return (
                      <tr key={index} className={`border-b border-gray-700 ${isYourSite ? 'bg-blue-900/20' : ''}`}>
                        <td className="py-3 px-4">
                          <div className={`font-medium ${isYourSite ? 'text-blue-400' : 'text-white'}`}>
                            {site.name}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={getScoreColor(site.lighthouse.performance)}>
                            {site.lighthouse.performance}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={getScoreColor(site.lighthouse.accessibility)}>
                            {site.lighthouse.accessibility}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={getScoreColor(site.lighthouse.bestPractices)}>
                            {site.lighthouse.bestPractices}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={getScoreColor(site.lighthouse.seo)}>
                            {site.lighthouse.seo}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={`font-bold ${getScoreColor(site.lighthouse.overallScore)}`}>
                            {site.lighthouse.overallScore}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Content Analysis */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">📝 Content Analysis Comparison</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Content Metrics */}
              <div>
                <h4 className="text-lg font-semibold text-gray-300 mb-4">📊 Content Metrics</h4>
                <div className="space-y-4">
                  {results.sites.map((site, index) => {
                    const contentRank = results.rankings?.contentLength?.find(r => r.originalIndex === index)?.rank || index + 1;
                    const isYourSite = index === 0;
                    
                    return (
                      <div key={index} className={`p-4 rounded-lg ${
                        isYourSite ? 'bg-blue-900/20 border border-blue-600' : 'bg-gray-700'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-medium ${isYourSite ? 'text-blue-400' : 'text-white'}`}>
                            {site.name}
                          </span>
                          <span className={`text-sm ${getRankColor(contentRank, results.sites.length)}`}>
                            {getRankBadge(contentRank, results.sites.length)} #{contentRank}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Words:</span>
                            <span className="text-white ml-2 font-medium">{site.content.wordCount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Readability:</span>
                            <span className={`ml-2 font-medium ${getScoreColor(site.content.readabilityScore)}`}>
                              {site.content.readabilityScore}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Paragraphs:</span>
                            <span className="text-white ml-2 font-medium">{site.content.paragraphs}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Structure:</span>
                            <span className={`ml-2 font-medium ${getScoreColor(site.content.headingStructure)}`}>
                              {site.content.headingStructure}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Technical SEO */}
              <div>
                <h4 className="text-lg font-semibold text-gray-300 mb-4">🔧 Technical SEO</h4>
                <div className="space-y-4">
                  {results.sites.map((site, index) => {
                    const isYourSite = index === 0;
                    
                    return (
                      <div key={index} className={`p-4 rounded-lg ${
                        isYourSite ? 'bg-blue-900/20 border border-blue-600' : 'bg-gray-700'
                      }`}>
                        <div className={`font-medium mb-3 ${isYourSite ? 'text-blue-400' : 'text-white'}`}>
                          {site.name}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">H1:</span>
                            <span className="text-white">{site.technical.h1Count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">H2:</span>
                            <span className="text-white">{site.technical.h2Count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">H3:</span>
                            <span className="text-white">{site.technical.h3Count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Int. Links:</span>
                            <span className="text-white">{site.technical.internalLinks}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Meta Desc:</span>
                            <span>{site.technical.metaDescription ? '✅' : '❌'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Schema:</span>
                            <span>{site.technical.schemaMarkup ? '✅' : '❌'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Sitemap:</span>
                            <span>{site.technical.sitemap ? '✅' : '❌'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Robots:</span>
                            <span>{site.technical.robotsTxt ? '✅' : '❌'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Performance & Loading */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">🚀 Loading Performance Analysis</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 text-gray-300">Site</th>
                    <th className="text-center py-3 px-4 text-gray-300">Requests</th>
                    <th className="text-center py-3 px-4 text-gray-300">Total Size</th>
                    <th className="text-center py-3 px-4 text-gray-300">JS Size</th>
                    <th className="text-center py-3 px-4 text-gray-300">CSS Size</th>
                    <th className="text-center py-3 px-4 text-gray-300">Images</th>
                    <th className="text-center py-3 px-4 text-gray-300">Optimization</th>
                  </tr>
                </thead>
                <tbody>
                  {results.sites.map((site, index) => {
                    const loadingRank = results.rankings?.loadingSpeed?.find(r => r.originalIndex === index)?.rank || index + 1;
                    const isYourSite = index === 0;
                    
                    return (
                      <tr key={index} className={`border-b border-gray-700 ${
                        isYourSite ? 'bg-blue-900/20' : 
                        loadingRank === 1 ? 'bg-green-900/20' : 
                        loadingRank === results.sites.length ? 'bg-red-900/20' : ''
                      }`}>
                        <td className="py-3 px-4">
                          <div className={`font-medium ${isYourSite ? 'text-blue-400' : 'text-white'}`}>
                            {site.name}
                          </div>
                          <div className={`text-xs ${getRankColor(loadingRank, results.sites.length)}`}>
                            {getRankBadge(loadingRank, results.sites.length)} Rank #{loadingRank}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4 text-gray-300">
                          {site.loading.totalRequests}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={site.loading.totalSize > 2000 ? 'text-red-400' : site.loading.totalSize > 1500 ? 'text-yellow-400' : 'text-green-400'}>
                            {(site.loading.totalSize / 1000).toFixed(1)}MB
                          </span>
                        </td>
                        <td className="text-center py-3 px-4 text-gray-300">
                          {site.loading.jsSize}KB
                        </td>
                        <td className="text-center py-3 px-4 text-gray-300">
                          {site.loading.cssSize}KB
                        </td>
                        <td className="text-center py-3 px-4 text-gray-300">
                          {(site.loading.imageSize / 1000).toFixed(1)}MB
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={getScoreColor(site.technical.imageOptimization)}>
                            {site.technical.imageOptimization}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">💡 Key Insights & Recommendations</h3>
            
            <div className="space-y-4">
              {results.insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'critical' ? 'bg-red-900/20 border-red-400' :
                  insight.type === 'warning' ? 'bg-yellow-900/20 border-yellow-400' :
                  'bg-blue-900/20 border-blue-400'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white">{insight.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        insight.impact === 'High' ? 'bg-red-600 text-white' :
                        insight.impact === 'Medium' ? 'bg-yellow-600 text-white' :
                        'bg-green-600 text-white'
                      }`}>
                        {insight.impact} Impact
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-gray-600 text-gray-300">
                        {insight.metric}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-2">{insight.description}</p>
                  <p className="text-gray-400 text-sm">💡 {insight.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">🎯 Priority Action Items</h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-red-400 mb-4">🚨 Critical Fixes</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Fix crawlability issues</li>
                  <li>• Resolve JavaScript render errors</li>
                  <li>• Eliminate DOM structure problems</li>
                  <li>• Fix duplicate IDs and invalid markup</li>
                  <li>• Ensure robots.txt compliance</li>
                </ul>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-green-400 mb-4">🚀 Quick Wins</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Add missing meta descriptions</li>
                  <li>• Implement schema markup</li>
                  <li>• Optimize image compression</li>
                  <li>• Fix heading hierarchy</li>
                  <li>• Increase internal linking</li>
                </ul>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-400 mb-4">🔧 Technical Improvements</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Improve server response time</li>
                  <li>• Reduce Cumulative Layout Shift</li>
                  <li>• Optimize Core Web Vitals</li>
                  <li>• Minimize JavaScript bundle</li>
                  <li>• Enable HTTPS security headers</li>
                </ul>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-purple-400 mb-4">📝 Content Strategy</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Expand content depth (target 2000+ words)</li>
                  <li>• Improve readability score</li>
                  <li>• Add more subheadings (H2-H6)</li>
                  <li>• Increase paragraph count</li>
                  <li>• Analyze competitor content gaps</li>
                </ul>
              </div>
            </div>
            
            {/* Competitive Advantage Summary */}
            <div className="mt-8 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-6 border border-green-600">
              <h4 className="text-lg font-semibold text-green-400 mb-4">🏆 Competitive Advantage Opportunities</h4>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h5 className="text-white font-medium mb-2">📊 Technical Advantages to Exploit:</h5>
                  <ul className="space-y-1 text-gray-300">
                    <li>• Competitors with crawl errors lose 20-40% rankings</li>
                    <li>• Render issues mean Google can't see their content</li>
                    <li>• DOM bloat affects their Core Web Vitals</li>
                    <li>• JavaScript errors hurt user experience</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-white font-medium mb-2">🎯 Marketing Opportunities:</h5>
                  <ul className="space-y-1 text-gray-300">
                    <li>• Target keywords where competitors have tech issues</li>
                    <li>• Emphasize your superior page speed</li>
                    <li>• Leverage accessibility advantages</li>
                    <li>• Highlight content quality differences</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
