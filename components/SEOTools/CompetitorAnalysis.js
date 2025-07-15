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
      
      // Step 4: Content & DOM Analysis
      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 5: Performance & Loading Analysis
      setCurrentStep(5);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 6: Generate Rankings & Insights
      setCurrentStep(6);
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
      sites: sites.map((url, index) => ({
        url,
        name: index === 0 ? 'Your Site' : `Competitor ${index}`,
        coreWebVitals: {
          lcp: Math.random() * 3 + 1,
          fid: Math.random() * 200,
          cls: Math.random() * 0.3,
          score: Math.floor(Math.random() * 40) + 60,
          mobileScore: Math.floor(Math.random() * 40) + 60
        },
        lighthouse: {
          performance: Math.floor(Math.random() * 40) + 60,
          accessibility: Math.floor(Math.random() * 30) + 70,
          bestPractices: Math.floor(Math.random() * 30) + 70,
          seo: Math.floor(Math.random() * 30) + 70,
          overallScore: Math.floor(Math.random() * 40) + 60
        },
        content: {
          wordCount: Math.floor(Math.random() * 2000) + 500,
          readabilityScore: Math.floor(Math.random() * 30) + 70,
          headingStructure: Math.floor(Math.random() * 20) + 80,
          paragraphs: Math.floor(Math.random() * 30) + 10
        },
        technical: {
          h1Count: Math.floor(Math.random() * 3) + 1,
          h2Count: Math.floor(Math.random() * 10) + 3,
          h3Count: Math.floor(Math.random() * 15) + 5,
          metaDescription: Math.random() > 0.3,
          imageOptimization: Math.floor(Math.random() * 30) + 70,
          internalLinks: Math.floor(Math.random() * 50) + 20,
          externalLinks: Math.floor(Math.random() * 20) + 5,
          schemaMarkup: Math.random() > 0.4,
          sitemap: Math.random() > 0.2,
          robotsTxt: Math.random() > 0.2
        },
        security: {
          httpsEnabled: Math.random() > 0.1,
          securityHeaders: Math.floor(Math.random() * 3) + 2,
          mixedContent: Math.random() > 0.7
        },
        loading: {
          totalRequests: Math.floor(Math.random() * 100) + 50,
          totalSize: Math.floor(Math.random() * 3000) + 1000, // KB
          jsSize: Math.floor(Math.random() * 800) + 200,
          cssSize: Math.floor(Math.random() * 200) + 50,
          imageSize: Math.floor(Math.random() * 2000) + 500
        }
      })),
      insights: generateInsights()
    };
  };

  const generateInsights = () => [
    {
      type: 'critical',
      title: '🚨 Core Web Vitals Gap',
      description: 'Competitor A has 23% better LCP than your site',
      recommendation: 'Optimize images and reduce server response time',
      impact: 'High',
      metric: 'LCP'
    },
    {
      type: 'warning',
      title: '⚠️ Content Length Disadvantage',
      description: 'Your content is 40% shorter than top competitors',
      recommendation: 'Expand content depth while maintaining quality',
      impact: 'High',
      metric: 'Content'
    },
    {
      type: 'critical',
      title: '🔍 Technical SEO Gap',
      description: 'Missing schema markup while 80% of competitors use it',
      recommendation: 'Implement structured data for better search visibility',
      impact: 'High',
      metric: 'Schema'
    },
    {
      type: 'opportunity',
      title: '💡 Lighthouse Performance Win',
      description: 'You outperform 60% of competitors in accessibility',
      recommendation: 'Leverage this strength in your SEO strategy',
      impact: 'Medium',
      metric: 'Accessibility'
    },
    {
      type: 'warning',
      title: '🖼️ Image Optimization Issue',
      description: 'Competitors have 35% smaller image sizes on average',
      recommendation: 'Implement WebP format and proper compression',
      impact: 'Medium',
      metric: 'Images'
    },
    {
      type: 'opportunity',
      title: '🔗 Internal Linking Opportunity', 
      description: 'You have fewer internal links than successful competitors',
      recommendation: 'Increase internal linking to boost page authority',
      impact: 'Medium',
      metric: 'Links'
    }
  ];

  const generateRankings = (resultsData) => {
    const metrics = [
      'overallScore', 'performance', 'contentLength', 'imageOptimization', 
      'internalLinks', 'accessibility', 'loadingSpeed', 'securityScore'
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
              { step: 1, title: 'Validating URLs', emoji: '🔗' },
              { step: 2, title: 'Analyzing Core Web Vitals', emoji: '⚡' },
              { step: 3, title: 'Running Lighthouse Analysis', emoji: '🔍' },
              { step: 4, title: 'Scanning Content & DOM Structure', emoji: '🏗️' },
              { step: 5, title: 'Measuring Performance & Loading', emoji: '🚀' },
              { step: 6, title: 'Generating Rankings & Insights', emoji: '💡' }
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
          {/* Executive Summary */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">📋 Executive Summary</h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              {results.sites.map((site, index) => {
                const overallRank = results.rankings?.overallScore?.find(r => r.originalIndex === index)?.rank || index + 1;
                const isYourSite = index === 0;
                
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
                    <div className="text-xs text-gray-400 truncate">{site.url}</div>
                  </div>
                );
              })}
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

          {/* Lighthouse Scores Comparison */}
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
            
            <div className="grid md:grid-cols-3 gap-6">
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
          </div>
        </div>
      )}
    </div>
  );
}
