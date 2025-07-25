import React, { useState } from 'react';
import { Trophy, Target, Zap, AlertCircle, CheckCircle, XCircle, ExternalLink, BarChart3, TrendingUp } from 'lucide-react';

export default function CompetitiveBenchmarkDashboard() {
  const [apiKey, setApiKey] = useState('AIzaSyAF4j6lpzPAiPjCjZSkbvB_0LVBm-rlfTc');
  const [yourSite, setYourSite] = useState('');
  const [competitors, setCompetitors] = useState(['', '', '']);
  const [results, setResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [analysis, setAnalysis] = useState(null);

  // Helper function to ensure URL has protocol
  const ensureProtocol = (url) => {
    if (!url) return '';
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

  // Hybrid analysis function - combines PageSpeed API + Railway data
  const runHybridAnalysis = async (url) => {
    const fullUrl = ensureProtocol(url);
    
    try {
      console.log('🔄 Starting HYBRID analysis for:', fullUrl);
      
      // STEP 1: Get performance data from PageSpeed API
      const mobileResponse = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=mobile&key=${apiKey.trim()}&category=performance&category=seo&category=accessibility&category=best-practices`
      );
      const mobileData = await mobileResponse.json();
      
      if (mobileData.error) {
        throw new Error(`PageSpeed API error: ${mobileData.error.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, 3000)); // Rate limiting

      const desktopResponse = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=desktop&key=${apiKey.trim()}&category=performance&category=seo&category=accessibility&category=best-practices`
      );
      const desktopData = await desktopResponse.json();
      
      if (desktopData.error) {
        throw new Error(`PageSpeed API error: ${desktopData.error.message}`);
      }

      // STEP 2: Get DOM data from Railway Lighthouse service
      console.log('🏗️ Getting REAL DOM data from Railway...');
      
      let railwayDOMData = null;
      let analysisMethod = 'HYBRID';
      
      try {
        const domResponse = await fetch('/api/lighthouse-dom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: fullUrl })
        });
        
        const domResult = await domResponse.json();
        
        if (domResult.success) {
          railwayDOMData = domResult.domData;
          console.log('✅ Railway DOM data received:', railwayDOMData);
          console.log('🔥 Railway lighthouse_real_errors:', railwayDOMData.lighthouse_real_errors);
        } else {
          console.log('⚠️ Railway failed, using PageSpeed API only');
          analysisMethod = 'FALLBACK_PAGESPEED_ONLY';
        }
      } catch (error) {
        console.log('⚠️ Railway unavailable, using PageSpeed API only:', error.message);
        analysisMethod = 'FALLBACK_PAGESPEED_ONLY';
      }
      
      // Extract PageSpeed data for fallback
      const pagespeedData = extractPageSpeedData(mobileData.lighthouseResult);
      
      // STEP 3: Merge data from both sources
      const hybridResult = {
        url: fullUrl,
        hostname: new URL(fullUrl).hostname,
        
        // Performance scores from PageSpeed API
        performance_mobile: Math.round((mobileData.lighthouseResult?.categories?.performance?.score || 0) * 100),
        performance_desktop: Math.round((desktopData.lighthouseResult?.categories?.performance?.score || 0) * 100),
        accessibility: Math.round((mobileData.lighthouseResult?.categories?.accessibility?.score || 0) * 100),
        best_practices: Math.round((mobileData.lighthouseResult?.categories?.['best-practices']?.score || 0) * 100),
        seo: Math.round((mobileData.lighthouseResult?.categories?.seo?.score || 0) * 100),
        
        // DOM Data - prefer Railway, fallback to PageSpeed
        dom_nodes: railwayDOMData ? railwayDOMData.dom_nodes : 0,
        dom_depth: railwayDOMData ? railwayDOMData.dom_depth : 0,
        max_children: railwayDOMData ? railwayDOMData.max_children : 0,
        dom_errors: railwayDOMData ? railwayDOMData.dom_errors : pagespeedData.dom_errors,
        
        // NEW: Lighthouse Real Errors from Railway - FIXED PATH
        lighthouse_real_errors: railwayDOMData ? railwayDOMData.lighthouse_real_errors : null,
        
        // Page size from PageSpeed API
        page_size_mb: pagespeedData.page_size_mb,
        
        // Crawl impact - 🔧 FIX: Use mapped crawl_impact from Railway API
        crawl_impact: railwayDOMData ? railwayDOMData.crawl_impact : calculateCrawlImpact(pagespeedData.page_size_mb, 0, 0),
        
        // Metadata
        analysis_method: analysisMethod,
        data_sources: railwayDOMData ? ['PageSpeed API', 'Railway DOM'] : ['PageSpeed API'],
        
        status: 'success'
      };

      console.log('✅ HYBRID analysis complete:', hybridResult);
      return hybridResult;

    } catch (error) {
      console.error('🚨 Hybrid analysis error:', error);
      return {
        url: fullUrl,
        hostname: new URL(fullUrl).hostname,
        error: String(error.message || 'Unknown error'),
        status: 'error'
      };
    }
  };

  // Extract PageSpeed API data  
  const extractPageSpeedData = (lighthouseResult) => {
    const audits = lighthouseResult.audits;
    
    // Extract page size
    let totalSizeKB = 0;
    
    if (audits['total-byte-weight']?.numericValue) {
      totalSizeKB = audits['total-byte-weight'].numericValue / 1024;
    }

    if (audits['network-requests']?.details?.items) {
      const networkRequests = audits['network-requests'].details.items;
      let networkTotal = 0;
      
      networkRequests.forEach(request => {
        const transferSize = request.transferSize || 0;
        networkTotal += transferSize / 1024;
      });
      
      if (networkTotal > totalSizeKB) {
        totalSizeKB = networkTotal;
      }
    }

    // Count audit failures  
    let domErrors = 0;
    
    Object.entries(audits).forEach(([auditKey, audit]) => {
      if (audit.score !== null && audit.score < 0.9) {
        if (auditKey.includes('dom') || 
            auditKey.includes('render') || 
            auditKey.includes('layout') ||
            auditKey.includes('contentful-paint') ||
            auditKey.includes('blocking')) {
          domErrors++;
        }
      }
    });

    return {
      page_size_mb: Math.round(totalSizeKB / 1024 * 100) / 100,
      dom_errors: domErrors
    };
  };

  // Calculate crawl impact using your thresholds
  const calculateCrawlImpact = (pageSizeMB, domNodes, maxChildren) => {
    // HIGH: Page >4MB OR DOM >1,800 OR Children >60
    if (pageSizeMB > 4 || domNodes > 1800 || maxChildren > 60) {
      return 'HIGH';
    }
    // MEDIUM: Page >2MB OR DOM >1,200 OR Children >40  
    if (pageSizeMB > 2 || domNodes > 1200 || maxChildren > 40) {
      return 'MEDIUM';
    }
    return 'LOW';
  };

  // Calculate score based on your thresholds - ENHANCED with real errors
  const calculateBenchmarkScore = (site) => {
    let score = 100;
    
    // HIGHEST PRIORITY: Real Lighthouse errors (most critical for crawlability)
    const pushNodeFailures = site.lighthouse_real_errors?.dom_pushnode_failures || 0;
    if (pushNodeFailures > 0) {
      const penalty = Math.min(40, pushNodeFailures * 2); // 2 points per failure, max 40
      score -= penalty;
    }
    
    if (site.lighthouse_real_errors?.image_gathering_failures) {
      score -= 25; // Heavy penalty for image budget exceeded
    }
    
    const resourceTimeouts = site.lighthouse_real_errors?.resource_timeouts?.length || 0;
    if (resourceTimeouts > 0) {
      const penalty = Math.min(20, resourceTimeouts * 5); // 5 points per timeout, max 20
      score -= penalty;
    }
    
    if (site.lighthouse_real_errors?.rendering_budget_exceeded) {
      score -= 15; // Rendering budget penalty
    }
    
    // MEDIUM PRIORITY: DOM structure violations
    const domErrors = site.dom_errors || 0;
    if (domErrors >= 30) score -= 20;
    else if (domErrors >= 11) score -= 15;
    else if (domErrors >= 6) score -= 10;
    else if (domErrors >= 1) score -= 5;
    
    // Max Children scoring (Google threshold critical)
    const maxChildren = site.max_children || 0;
    if (maxChildren > 60) score -= 20; // Google limit exceeded
    else if (maxChildren > 40) score -= 10;
    
    // LOWER PRIORITY: Page performance
    const pageSize = site.page_size_mb || 0;
    if (pageSize > 3) score -= 10; // Heavy
    else if (pageSize > 1.5) score -= 5; // Moderate
    
    const domNodes = site.dom_nodes || 0;
    if (domNodes > 1800) score -= 10; // Critical
    else if (domNodes > 1200) score -= 5; // Warning
    
    const domDepth = site.dom_depth || 0;
    if (domDepth > 32) score -= 8; // Critical
    else if (domDepth > 25) score -= 3; // Warning
    
    return Math.max(0, Math.round(score));
  };

  // Get status color based on your thresholds
  const getStatusColor = (value, metric) => {
    switch (metric) {
      case 'dom_errors':
        if (value === 0) return 'text-green-600';
        if (value <= 5) return 'text-green-500';
        if (value <= 10) return 'text-yellow-600';
        if (value <= 30) return 'text-orange-600';
        return 'text-red-600';
      
      case 'max_children':
        if (value <= 40) return 'text-green-600';
        if (value <= 60) return 'text-yellow-600';
        return 'text-red-600';
      
      case 'page_size':
        if (value <= 1.5) return 'text-green-600';
        if (value <= 3) return 'text-yellow-600';
        return 'text-red-600';
      
      case 'dom_nodes':
        if (value <= 1200) return 'text-green-600';
        if (value <= 1800) return 'text-yellow-600';
        return 'text-red-600';
      
      case 'dom_depth':
        if (value <= 25) return 'text-green-600';
        if (value <= 32) return 'text-yellow-600';
        return 'text-red-600';
      
      case 'performance':
        if (value >= 90) return 'text-green-600';
        if (value >= 50) return 'text-yellow-600';
        return 'text-red-600';
      
      default:
        return 'text-gray-600';
    }
  };

  // Get status label
  const getStatusLabel = (value, metric) => {
    switch (metric) {
      case 'dom_errors':
        if (value === 0) return 'Perfect';
        if (value <= 5) return 'Good';
        if (value <= 10) return 'Warning';
        if (value <= 30) return 'Critical';
        return 'Severe';
      
      case 'max_children':
        if (value <= 40) return 'Good';
        if (value <= 60) return 'Warning';
        return 'Google Limit!';
      
      case 'page_size':
        if (value <= 1.5) return 'Light';
        if (value <= 3) return 'Moderate';
        return 'Heavy';
      
      case 'dom_nodes':
        if (value <= 1200) return 'Good';
        if (value <= 1800) return 'Warning';
        return 'Critical';
      
      case 'dom_depth':
        if (value <= 25) return 'Good';
        if (value <= 32) return 'Warning';
        return 'Critical';
      
      case 'performance':
        if (value >= 90) return 'Excellent';
        if (value >= 50) return 'Needs Work';
        return 'Poor';
      
      default:
        return 'Unknown';
    }
  };

  // Run competitive analysis
  const runCompetitiveAnalysis = async () => {
    const allUrls = [yourSite, ...competitors.filter(url => url.trim())];
    
    if (allUrls.length < 2) {
      alert('❌ Please enter your site and at least one competitor');
      return;
    }

    if (!apiKey.trim()) {
      alert('❌ Please enter your PageSpeed API key');
      return;
    }

    setIsAnalyzing(true);
    setProgress({ current: 0, total: allUrls.length });
    setResults([]);
    setAnalysis(null);

    const analysisResults = [];
    for (let i = 0; i < allUrls.length; i++) {
      const url = allUrls[i].trim();
      if (url) {
        try {
          setProgress({ current: i + 1, total: allUrls.length });
          const result = await runHybridAnalysis(url);
          result.isYourSite = i === 0; // Mark the first one as your site
          analysisResults.push(result);
          setResults([...analysisResults]);
          
          if (i < allUrls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.error(`Analysis error for ${url}:`, error);
          analysisResults.push({ 
            url: ensureProtocol(url), 
            hostname: new URL(ensureProtocol(url)).hostname,
            error: String(error.message), 
            status: 'error',
            isYourSite: i === 0
          });
        }
      }
    }
    
    // Generate competitive analysis
    const validResults = analysisResults.filter(r => r.status === 'success');
    if (validResults.length >= 2) {
      const yourSiteResult = validResults.find(r => r.isYourSite);
      const competitorResults = validResults.filter(r => !r.isYourSite);
      
      // Calculate benchmark scores
      const scoredResults = validResults.map(site => ({
        ...site,
        benchmark_score: calculateBenchmarkScore(site)
      }));
      
      // Sort by benchmark score
      const rankedResults = [...scoredResults].sort((a, b) => b.benchmark_score - a.benchmark_score);
      
      // Find your site in the scored results (with benchmark_score)
      const yourSiteWithScore = scoredResults.find(r => r.isYourSite);
      
      setAnalysis({
        yourSite: yourSiteWithScore,
        competitors: competitorResults.map(comp => scoredResults.find(scored => scored.url === comp.url) || comp),
        ranked: rankedResults,
        winner: rankedResults[0],
        loser: rankedResults[rankedResults.length - 1],
        yourRank: rankedResults.findIndex(r => r.isYourSite) + 1
      });
    }
    
    setIsAnalyzing(false);
  };

  // Add competitor input
  const addCompetitor = () => {
    if (competitors.length < 10) {
      setCompetitors([...competitors, '']);
    }
  };

  // Update competitor URL
  const updateCompetitor = (index, value) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  // Remove competitor
  const removeCompetitor = (index) => {
    const newCompetitors = competitors.filter((_, i) => i !== index);
    setCompetitors(newCompetitors);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Trophy className="text-yellow-500" size={40} />
          🏆 Competitive SEO Benchmark Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Compare your site against competitors using Google's crawlability thresholds. 
          Get real DOM data from Railway + performance scores from PageSpeed API.
        </p>
      </div>

      {/* Setup Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Target className="text-blue-500" />
          Setup Your Benchmark Analysis
        </h2>

        {/* API Key */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PageSpeed Insights API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Your Google PageSpeed Insights API key"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Your Site */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏠 Your Website
          </label>
          <input
            type="url"
            value={yourSite}
            onChange={(e) => setYourSite(e.target.value)}
            placeholder="your-website.com"
            className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
          />
        </div>

        {/* Competitors */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              🥊 Competitors
            </label>
            <button
              onClick={addCompetitor}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
            >
              + Add Competitor
            </button>
          </div>
          
          <div className="space-y-3">
            {competitors.map((competitor, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="url"
                  value={competitor}
                  onChange={(e) => updateCompetitor(index, e.target.value)}
                  placeholder={`competitor-${index + 1}.com`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeCompetitor(index)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Run Analysis Button */}
        <button
          onClick={runCompetitiveAnalysis}
          disabled={isAnalyzing || !yourSite.trim() || !apiKey.trim()}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold"
        >
          <Zap size={24} />
          {isAnalyzing ? 'Analyzing Competitors...' : 'Start Competitive Analysis'}
        </button>
      </div>

      {/* Progress */}
      {isAnalyzing && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Analyzing Sites</span>
            <span className="text-sm text-gray-600">{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Competitive Analysis Results */}
      {analysis && (
        <div className="space-y-8">
          {/* Winner/Loser Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400 rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-green-800 mb-3">👑 BENCHMARK CHAMPION</h3>
              <div className="text-xl font-bold text-green-900 mb-2">{analysis.winner.hostname}</div>
              <div className="text-lg text-green-800 mb-4">Score: {analysis.winner.benchmark_score}/100</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>PushNode: <span className="font-bold">{analysis.winner.lighthouse_real_errors?.dom_pushnode_failures || 0}</span></div>
                <div>Max Children: <span className="font-bold">{analysis.winner.max_children || 0}</span></div>
                <div>Page Size: <span className="font-bold">{(analysis.winner.page_size_mb || 0).toFixed(1)}MB</span></div>
                <div>DOM Nodes: <span className="font-bold">{(analysis.winner.dom_nodes || 0).toLocaleString()}</span></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-400 rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-red-800 mb-3">🚨 NEEDS IMPROVEMENT</h3>
              <div className="text-xl font-bold text-red-900 mb-2">{analysis.loser.hostname}</div>
              <div className="text-lg text-red-800 mb-4">Score: {analysis.loser.benchmark_score}/100</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>PushNode: <span className="font-bold">{analysis.loser.lighthouse_real_errors?.dom_pushnode_failures || 0}</span></div>
                <div>Max Children: <span className="font-bold">{analysis.loser.max_children || 0}</span></div>
                <div>Page Size: <span className="font-bold">{(analysis.loser.page_size_mb || 0).toFixed(1)}MB</span></div>
                <div>DOM Nodes: <span className="font-bold">{(analysis.loser.dom_nodes || 0).toLocaleString()}</span></div>
              </div>
            </div>
          </div>

          {/* Your Position - UPDATED with Traffic Light Colors */}
          <div className={`p-6 rounded-xl border-4 shadow-lg ${
            analysis.yourRank === 1 ? 'bg-green-50 border-green-500' :
            analysis.yourRank <= 2 ? 'bg-yellow-50 border-yellow-500' :
            'bg-red-50 border-red-500'
          }`}>
            <div className="text-center">
              <div className="text-3xl font-bold mb-3 flex items-center justify-center gap-3">
                {analysis.yourRank === 1 && <span className="text-4xl">🥇</span>}
                {analysis.yourRank === 2 && <span className="text-4xl">🥈</span>}
                {analysis.yourRank === 3 && <span className="text-4xl">🥉</span>}
                {analysis.yourRank > 3 && <span className="text-4xl">📍</span>}
                <span className={analysis.yourRank === 1 ? 'text-green-800' : analysis.yourRank <= 2 ? 'text-yellow-800' : 'text-red-800'}>
                  YOUR SITE RANKS #{analysis.yourRank} OF {analysis.ranked.length}
                </span>
              </div>
              <div className={`text-xl mb-4 inline-block px-6 py-3 rounded-full font-bold ${
                analysis.yourRank === 1 ? 'bg-green-200 text-green-800' :
                analysis.yourRank <= 2 ? 'bg-yellow-200 text-yellow-800' :
                'bg-red-200 text-red-800'
              }`}>
                Benchmark Score: <span className="text-2xl">{analysis.yourSite?.benchmark_score || 0}/100</span>
              </div>
              {analysis.yourRank === 1 && <div className="text-green-700 font-bold text-lg mt-2">🎉 You're the benchmark champion!</div>}
              {analysis.yourRank > 1 && (
                <div className={`font-bold text-lg mt-2 ${analysis.yourRank <= 2 ? 'text-yellow-700' : 'text-red-700'}`}>
                  ⚠️ {Math.max(0, (analysis.winner?.benchmark_score || 0) - (analysis.yourSite?.benchmark_score || 0))} points behind the leader
                </div>
              )}
            </div>
          </div>

          {/* DEVELOPER ERROR LOG - Enhanced with lighthouse_real_errors */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-4 border-blue-400 rounded-lg shadow-lg">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
              <h3 className="text-xl font-bold text-center flex items-center justify-center gap-2">
                🔧 DEVELOPER ERROR LOG - {analysis.yourSite.hostname}
              </h3>
              <p className="text-center text-sm mt-1">Real Lighthouse crawlability issues for your development team</p>
            </div>
            
            <div className="p-6">
              {/* Priority Issues from lighthouse_real_errors */}
              {analysis.yourSite.lighthouse_real_errors && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                    🚨 Critical Lighthouse Issues ({analysis.yourSite.lighthouse_real_errors.total_error_count || 0} found)
                  </h4>
                  <div className="space-y-3">
                    {/* PushNode Failures */}
                    {(analysis.yourSite.lighthouse_real_errors.dom_pushnode_failures || 0) > 0 && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="text-red-500 mt-0.5" size={20} />
                          <div>
                            <div className="font-bold text-red-800">
                              DOM PushNode Failures: {analysis.yourSite.lighthouse_real_errors.dom_pushnode_failures}
                            </div>
                            <div className="text-sm text-red-600 mt-1">
                              → Chrome DevTools cannot properly inspect DOM elements
                            </div>
                            <div className="text-sm text-red-600">
                              → Google crawler experiences similar navigation difficulties
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Image Budget Exceeded */}
                    {analysis.yourSite.lighthouse_real_errors.image_gathering_failures && (
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="text-orange-500 mt-0.5" size={20} />
                          <div>
                            <div className="font-bold text-orange-800">
                              Image Gathering Budget Exceeded
                            </div>
                            <div className="text-sm text-orange-600 mt-1">
                              → {analysis.yourSite.lighthouse_real_errors.image_gathering_failures}
                            </div>
                            <div className="text-sm text-orange-600">
                              → Implement lazy loading and optimize image delivery
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Resource Timeouts */}
                    {(analysis.yourSite.lighthouse_real_errors.resource_timeouts?.length || 0) > 0 && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="text-red-500 mt-0.5" size={20} />
                          <div>
                            <div className="font-bold text-red-800">
                              Resource Timeouts: {analysis.yourSite.lighthouse_real_errors.resource_timeouts.length}
                            </div>
                            <div className="text-sm text-red-600 mt-1">
                              → Critical resources failing to load within time limits
                            </div>
                            <div className="text-sm text-red-600">
                              → Optimize server response times and resource delivery
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Rendering Budget Exceeded */}
                    {analysis.yourSite.lighthouse_real_errors.rendering_budget_exceeded && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="text-yellow-500 mt-0.5" size={20} />
                          <div>
                            <div className="font-bold text-yellow-800">
                              Rendering Budget Exceeded
                            </div>
                            <div className="text-sm text-yellow-600 mt-1">
                              → Page rendering exceeds optimal performance budgets
                            </div>
                            <div className="text-sm text-yellow-600">
                              → Optimize CSS, JavaScript, and rendering-blocking resources
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Traditional Crawlability Penalties */}
              {analysis.yourSite.crawlability_penalties && analysis.yourSite.crawlability_penalties.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
                    ⚠️ Structure Issues ({analysis.yourSite.crawlability_penalties.length} found)
                  </h4>
                  <div className="space-y-3">
                    {analysis.yourSite.crawlability_penalties.map((penalty, idx) => (
                      <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="text-yellow-500 mt-0.5" size={20} />
                          <div>
                            <div className="font-bold text-yellow-800">{penalty}</div>
                            <div className="text-sm text-yellow-600 mt-1">
                              {penalty.includes('DOM nodes') && '→ Consider reducing total HTML elements on the page'}
                              {penalty.includes('Max children') && '→ Break down complex parent elements into smaller components'}
                              {penalty.includes('depth') && '→ Flatten DOM structure to reduce nesting levels'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Issues Found */}
              {(!analysis.yourSite.lighthouse_real_errors || (
                !analysis.yourSite.lighthouse_real_errors.dom_pushnode_failures &&
                !analysis.yourSite.lighthouse_real_errors.image_gathering_failures &&
                !analysis.yourSite.lighthouse_real_errors.rendering_budget_exceeded &&
                (!analysis.yourSite.lighthouse_real_errors.resource_timeouts || analysis.yourSite.lighthouse_real_errors.resource_timeouts.length === 0)
              )) && (!analysis.yourSite.crawlability_penalties || analysis.yourSite.crawlability_penalties.length === 0) && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
                    ✅ Excellent Lighthouse Performance
                  </h4>
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-500" size={20} />
                      <span className="text-green-800 font-medium">No critical crawlability issues detected!</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Critical Metrics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg border-2 ${(analysis.yourSite.lighthouse_real_errors?.dom_pushnode_failures || 0) > 0 ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400'}`}>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">PushNode Failures</div>
                    <div className={`text-2xl font-bold ${(analysis.yourSite.lighthouse_real_errors?.dom_pushnode_failures || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {analysis.yourSite.lighthouse_real_errors?.dom_pushnode_failures || 0}
                    </div>
                    <div className="text-xs mt-1">
                      {(analysis.yourSite.lighthouse_real_errors?.dom_pushnode_failures || 0) > 0 ? '🚨 DOM navigation issues' : '✅ Clean DOM access'}
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 ${analysis.yourSite.lighthouse_real_errors?.image_gathering_failures ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400'}`}>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Image Budget</div>
                    <div className={`text-lg font-bold ${analysis.yourSite.lighthouse_real_errors?.image_gathering_failures ? 'text-red-600' : 'text-green-600'}`}>
                      {analysis.yourSite.lighthouse_real_errors?.image_gathering_failures ? 'EXCEEDED' : 'OK'}
                    </div>
                    <div className="text-xs mt-1">
                      {analysis.yourSite.lighthouse_real_errors?.image_gathering_failures || '✅ Within budget limits'}
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 ${(analysis.yourSite.lighthouse_real_errors?.resource_timeouts?.length || 0) > 0 ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400'}`}>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Resource Timeouts</div>
                    <div className={`text-2xl font-bold ${(analysis.yourSite.lighthouse_real_errors?.resource_timeouts?.length || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {analysis.yourSite.lighthouse_real_errors?.resource_timeouts?.length || 0}
                    </div>
                    <div className="text-xs mt-1">
                      {(analysis.yourSite.lighthouse_real_errors?.resource_timeouts?.length || 0) > 0 ? '🚨 Loading timeouts' : '✅ Fast loading'}
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 ${analysis.yourSite.lighthouse_real_errors?.rendering_budget_exceeded ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400'}`}>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Rendering Budget</div>
                    <div className={`text-lg font-bold ${analysis.yourSite.lighthouse_real_errors?.rendering_budget_exceeded ? 'text-red-600' : 'text-green-600'}`}>
                      {analysis.yourSite.lighthouse_real_errors?.rendering_budget_exceeded ? 'EXCEEDED' : 'OK'}
                    </div>
                    <div className="text-xs mt-1">
                      {analysis.yourSite.lighthouse_real_errors?.rendering_budget_exceeded ? '🚨 Optimize rendering' : '✅ Efficient rendering'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer Actions - Updated with lighthouse_real_errors */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-3">💡 Priority Developer Actions:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {(analysis.yourSite.lighthouse_real_errors?.dom_pushnode_failures || 0) > 0 && (
                    <div className="flex items-start gap-2">
                      <div className="text-red-500 font-bold">🔧</div>
                      <div>Fix {analysis.yourSite.lighthouse_real_errors.dom_pushnode_failures} DOM navigation issues - improve element accessibility</div>
                    </div>
                  )}
                  {analysis.yourSite.lighthouse_real_errors?.image_gathering_failures && (
                    <div className="flex items-start gap-2">
                      <div className="text-red-500 font-bold">🔧</div>
                      <div>Optimize image delivery - {analysis.yourSite.lighthouse_real_errors.image_gathering_failures}</div>
                    </div>
                  )}
                  {(analysis.yourSite.lighthouse_real_errors?.resource_timeouts?.length || 0) > 0 && (
                    <div className="flex items-start gap-2">
                      <div className="text-red-500 font-bold">🔧</div>
                      <div>Fix {analysis.yourSite.lighthouse_real_errors.resource_timeouts.length} resource loading timeouts</div>
                    </div>
                  )}
                  {analysis.yourSite.lighthouse_real_errors?.rendering_budget_exceeded && (
                    <div className="flex items-start gap-2">
                      <div className="text-red-500 font-bold">🔧</div>
                      <div>Optimize rendering performance - reduce rendering budget usage</div>
                    </div>
                  )}
                  {(analysis.yourSite.max_children || 0) > 60 && (
                    <div className="flex items-start gap-2">
                      <div className="text-orange-500 font-bold">🔧</div>
                      <div>Reduce parent elements with 60+ children (current: {analysis.yourSite.max_children})</div>
                    </div>
                  )}
                  {(analysis.yourSite.dom_nodes || 0) > 1800 && (
                    <div className="flex items-start gap-2">
                      <div className="text-orange-500 font-bold">🔧</div>
                      <div>Optimize DOM structure - consider lazy loading for {(analysis.yourSite.dom_nodes || 0) - 1800}+ excess nodes</div>
                    </div>
                  )}
                  {(!analysis.yourSite.lighthouse_real_errors || (
                    !analysis.yourSite.lighthouse_real_errors.dom_pushnode_failures &&
                    !analysis.yourSite.lighthouse_real_errors.image_gathering_failures &&
                    !analysis.yourSite.lighthouse_real_errors.rendering_budget_exceeded &&
                    (!analysis.yourSite.lighthouse_real_errors.resource_timeouts || analysis.yourSite.lighthouse_real_errors.resource_timeouts.length === 0)
                  )) && (analysis.yourSite.max_children || 0) <= 60 && (analysis.yourSite.dom_nodes || 0) <= 1800 && (
                    <div className="flex items-start gap-2 col-span-2">
                      <div className="text-green-500 font-bold">✅</div>
                      <div>Excellent! No critical crawlability issues detected.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Comparison Table - WITH NEW COLUMNS */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <h3 className="text-xl font-bold text-center">📊 DETAILED BENCHMARK COMPARISON</h3>
              <p className="text-center text-sm mt-1">Based on Google's crawlability thresholds + Real Lighthouse errors</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">Website</th>
                    <th className="px-4 py-3 text-center font-bold">🚨 PushNode<br/>Failures</th>
                    <th className="px-4 py-3 text-center font-bold">🖼️ Image<br/>Budget</th>
                    <th className="px-4 py-3 text-center font-bold">⏱️ Resource<br/>Timeouts</th>
                    <th className="px-4 py-3 text-center font-bold">🚨 DOM<br/>Errors</th>
                    <th className="px-4 py-3 text-center font-bold">👶 Max<br/>Children</th>
                    <th className="px-4 py-3 text-center font-bold">📦 Page<br/>Size (MB)</th>
                    <th className="px-4 py-3 text-center font-bold">🏗️ DOM<br/>Nodes</th>
                    <th className="px-4 py-3 text-center font-bold">📏 DOM<br/>Depth</th>
                    <th className="px-4 py-3 text-center font-bold">📱 Mobile<br/>Perf</th>
                    <th className="px-4 py-3 text-center font-bold">🖥️ Desktop<br/>Perf</th>
                    <th className="px-4 py-3 text-center font-bold">🏆 Benchmark<br/>Score</th>
                    <th className="px-4 py-3 text-center font-bold">📊 Data<br/>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.ranked.map((site, idx) => {
                    const rank = idx + 1;
                    
                    return (
                      <tr key={idx} className={`border-b-2 ${
                        site.isYourSite ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                      }`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {site.isYourSite && <span className="text-blue-600 font-bold text-lg">👑</span>}
                            <div>
                              <div className="font-bold text-gray-900">{site.hostname}</div>
                              {site.isYourSite && <div className="text-xs text-blue-600 font-bold">YOUR SITE</div>}
                              <div className="text-xs text-gray-500">Rank #{rank}</div>
                            </div>
                          </div>
                        </td>
                        
                        {/* NEW: PushNode Failures */}
                        <td className="px-4 py-4 text-center">
                          <div className={`text-2xl font-bold ${
                            (site.lighthouse_real_errors?.dom_pushnode_failures || 0) === 0 ? 'text-green-600' :
                            (site.lighthouse_real_errors?.dom_pushnode_failures || 0) <= 10 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {site.lighthouse_real_errors?.dom_pushnode_failures || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(site.lighthouse_real_errors?.dom_pushnode_failures || 0) === 0 ? 'Perfect' :
                             (site.lighthouse_real_errors?.dom_pushnode_failures || 0) <= 10 ? 'Warning' : 'Critical'}
                          </div>
                        </td>
                        
                        {/* NEW: Image Budget */}
                        <td className="px-4 py-4 text-center">
                          <div className={`text-lg font-bold ${
                            !site.lighthouse_real_errors?.image_gathering_failures ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {site.lighthouse_real_errors?.image_gathering_failures ? 'EXCEEDED' : 'OK'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {site.lighthouse_real_errors?.image_gathering_failures ? 'Budget exceeded' : 'Within budget'}
                          </div>
                        </td>
                        
                        {/* NEW: Resource Timeouts */}
                        <td className="px-4 py-4 text-center">
                          <div className={`text-2xl font-bold ${
                            (site.lighthouse_real_errors?.resource_timeouts?.length || 0) === 0 ? 'text-green-600' :
                            (site.lighthouse_real_errors?.resource_timeouts?.length || 0) <= 3 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {site.lighthouse_real_errors?.resource_timeouts?.length || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(site.lighthouse_real_errors?.resource_timeouts?.length || 0) === 0 ? 'None' : 'Timeouts'}
                          </div>
                        </td>
                        
                        {/* EXISTING: DOM Errors */}
                        <td className="px-4 py-4 text-center">
                          <div className={`text-2xl font-bold ${getStatusColor(site.dom_errors || 0, 'dom_errors')}`}>
                            {site.dom_errors || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getStatusLabel(site.dom_errors || 0, 'dom_errors')}
                          </div>
                        </td>
                        
                        {/* EXISTING: Max Children */}
                        <td className="px-4 py-4 text-center">
                          <div className={`text-2xl font-bold ${getStatusColor(site.max_children || 0, 'max_children')}`}>
                            {site.max_children || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getStatusLabel(site.max_children || 0, 'max_children')}
                          </div>
                        </td>
                        
                        {/* EXISTING: Page Size */}
                        <td className="px-4 py-4 text-center">
                          <div className={`text-2xl font-bold ${getStatusColor(site.page_size_mb || 0, 'page_size')}`}>
                            {(site.page_size_mb || 0).toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getStatusLabel(site.page_size_mb || 0, 'page_size')}
                          </div>
                        </td>
                        
                        {/* EXISTING: DOM Nodes */}
                        <td className="px-4 py-4 text-center">
                          <div className={`text-xl font-bold ${getStatusColor(site.dom_nodes || 0, 'dom_nodes')}`}>
                            {site.dom_nodes === 0 ? 'N/A' : (site.dom_nodes || 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {site.dom_nodes === 0 ? 'Limited API' : getStatusLabel(site.dom_nodes || 0, 'dom_nodes')}
                          </div>
                        </td>
                        
                        {/* EXISTING: DOM Depth */}
                        <td className="px-4 py-4 text-center">
                          <div className={`text-xl font-bold ${getStatusColor(site.dom_depth || 0, 'dom_depth')}`}>
                            {site.dom_depth === 0 ? 'N/A' : site.dom_depth || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            {site.dom_depth === 0 ? 'Limited API' : getStatusLabel(site.dom_depth || 0, 'dom_depth')}
                          </div>
                        </td>
                        
                        {/* EXISTING: Mobile Performance */}
                        <td className="px-4 py-4 text-center">
                          <div className={`text-xl font-bold ${getStatusColor(site.performance_mobile || 0, 'performance')}`}>
                            {site.performance_mobile || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getStatusLabel(site.performance_mobile || 0, 'performance')}
                          </div>
                        </td>
                        
                        {/* EXISTING: Desktop Performance */}
                        <td className="px-4 py-4 text-center">
                          <div className={`text-xl font-bold ${getStatusColor(site.performance_desktop || 0, 'performance')}`}>
                            {site.performance_desktop || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getStatusLabel(site.performance_desktop || 0, 'performance')}
                          </div>
                        </td>
                        
                        {/* EXISTING: Benchmark Score */}
                        <td className="px-4 py-4 text-center">
                          <div className={`text-2xl font-bold ${
                            site.benchmark_score >= 90 ? 'text-green-600' :
                            site.benchmark_score >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {site.benchmark_score}
                          </div>
                          <div className="text-xs text-gray-500">/100</div>
                        </td>
                        
                        {/* EXISTING: Data Source */}
                        <td className="px-4 py-4 text-center">
                          <div className={`text-xs px-2 py-1 rounded font-bold ${
                            site.analysis_method === 'HYBRID' ? 'bg-green-100 text-green-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {site.analysis_method === 'HYBRID' ? '🔥 HYBRID' : '⚠️ API'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-center mb-4 flex items-center justify-center gap-2">
              <TrendingUp className="text-orange-600" />
              🔍 KEY INSIGHTS & RECOMMENDATIONS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Your Site Status */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h4 className="font-bold text-blue-700 mb-3">🏠 Your Site Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Current Rank:</span>
                    <span className="font-bold">#{analysis.yourRank} of {analysis.ranked.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Benchmark Score:</span>
                    <span className="font-bold">{analysis.yourSite.benchmark_score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Points to #1:</span>
                    <span className="font-bold text-red-600">
                      {Math.max(0, (analysis.winner?.benchmark_score || 0) - (analysis.yourSite?.benchmark_score || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Biggest Opportunity */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h4 className="font-bold text-green-700 mb-3">🎯 Biggest Opportunity</h4>
                <div className="space-y-2 text-sm">
                  {(analysis.yourSite.lighthouse_real_errors?.dom_pushnode_failures || 0) > 0 && (
                    <div className="p-2 bg-red-50 text-red-700 rounded">
                      🚨 Fix {analysis.yourSite.lighthouse_real_errors.dom_pushnode_failures} PushNode failures
                    </div>
                  )}
                  {analysis.yourSite.lighthouse_real_errors?.image_gathering_failures && (
                    <div className="p-2 bg-red-50 text-red-700 rounded">
                      🖼️ Fix image budget exceeded
                    </div>
                  )}
                  {(analysis.yourSite.lighthouse_real_errors?.resource_timeouts?.length || 0) > 0 && (
                    <div className="p-2 bg-red-50 text-red-700 rounded">
                      ⏱️ Fix {analysis.yourSite.lighthouse_real_errors.resource_timeouts.length} resource timeouts
                    </div>
                  )}
                  {(analysis.yourSite.max_children || 0) > 60 && (
                    <div className="p-2 bg-red-50 text-red-700 rounded">
                      👶 Reduce max children from {analysis.yourSite.max_children} to under 60
                    </div>
                  )}
                  {(analysis.yourSite.lighthouse_real_errors?.dom_pushnode_failures || 0) === 0 && 
                   !analysis.yourSite.lighthouse_real_errors?.image_gathering_failures && 
                   (analysis.yourSite.lighthouse_real_errors?.resource_timeouts?.length || 0) === 0 && 
                   (analysis.yourSite.max_children || 0) <= 60 && (
                    <div className="p-2 bg-green-50 text-green-700 rounded">
                      ✅ Your site meets Google's thresholds!
                    </div>
                  )}
                </div>
              </div>

              {/* Competitive Gap - FIXED NaN */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h4 className="font-bold text-purple-700 mb-3">🥊 Competitive Gap</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Best competitor:</span>
                    <span className="font-bold text-green-600">
                      {analysis.competitors.length > 0 ? Math.max(...analysis.competitors.map(c => c.benchmark_score || 0)) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Worst competitor:</span>
                    <span className="font-bold text-red-600">
                      {analysis.competitors.length > 0 ? Math.min(...analysis.competitors.map(c => c.benchmark_score || 0)) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your advantage:</span>
                    <span className="font-bold text-blue-600">
                      {analysis.competitors.length > 0 ? 
                        `+${Math.max(0, (analysis.yourSite?.benchmark_score || 0) - Math.min(...analysis.competitors.map(c => c.benchmark_score || 0)))} vs worst` : 
                        'No competitors'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Results */}
      {results.length > 0 && !analysis && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-bold mb-4">📋 Individual Results</h3>
          <div className="space-y-4">
            {results.map((result, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${
                result.isYourSite ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold">{result.hostname}</h4>
                    {result.isYourSite && <span className="text-xs text-blue-600 font-bold">YOUR SITE</span>}
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.status === 'success' ? '✅ Analyzed' : '❌ Error'}
                  </div>
                </div>
                
                {result.status === 'success' && (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3 text-sm">
                    <div>
                      <div className="text-gray-600">PushNode</div>
                      <div className="font-bold">{result.lighthouse_real_errors?.dom_pushnode_failures || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">DOM Errors</div>  
                      <div className="font-bold">{result.dom_errors || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Page Size</div>
                      <div className="font-bold">{(result.page_size_mb || 0).toFixed(1)}MB</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Max Children</div>
                      <div className="font-bold">{result.max_children || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Mobile Perf</div>
                      <div className="font-bold">{result.performance_mobile || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Desktop Perf</div>
                      <div className="font-bold">{result.performance_desktop || 0}</div>
                    </div>
                  </div>
                )}
                
                {result.status === 'error' && (
                  <div className="mt-2 p-2 bg-red-50 text-red-700 rounded text-sm">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Enhanced Google Threshold-Based Benchmarking</h3>
        <p className="mb-4 text-gray-700">
          This dashboard uses Google's official crawlability thresholds PLUS real Lighthouse errors to score and rank websites. 
          Combines real DOM data from Railway Lighthouse CLI with performance scores from PageSpeed API.
        </p>
        <div className="text-sm text-gray-600 space-y-2">
          <div><strong>🚨 PushNode Failures:</strong> 0=Perfect, 1-10=Warning, 10+=Critical (DOM navigation issues)</div>
          <div><strong>🖼️ Image Budget:</strong> OK=Within limits, EXCEEDED=Too many images processed</div>
          <div><strong>⏱️ Resource Timeouts:</strong> 0=Perfect, 1-3=Warning, 3+=Critical (Loading issues)</div>
          <div><strong>🚨 DOM Errors:</strong> 0=Perfect, 1-5=Good, 6-10=Warning, 11-30=Critical, 30+=Severe</div>
          <div><strong>👶 Max Children:</strong> ≤40=Good, 41-60=Warning, 60+=Google Limit Exceeded</div>
          <div><strong>📦 Page Size:</strong> ≤1.5MB=Light, 1.6-3MB=Moderate, 3MB+=Heavy</div>
          <div><strong>🏗️ DOM Nodes:</strong> ≤1,200=Good, 1,201-1,800=Warning, 1,800+=Critical</div>
          <div><strong>📏 DOM Depth:</strong> ≤25=Good, 26-32=Warning, 32+=Critical</div>
          <div><strong>📱 Performance:</strong> 90-100=Excellent, 50-89=Needs Work, 0-49=Poor</div>
        </div>
      </div>
    </div>
  );
}
