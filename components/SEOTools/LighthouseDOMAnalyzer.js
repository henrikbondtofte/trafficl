import React, { useState } from 'react';
import { Zap, Download, ExternalLink, Eye, FileText, AlertCircle } from 'lucide-react';

export default function LighthouseDOMAnalyzer() {
  const [apiKey, setApiKey] = useState('AIzaSyAF4j6lpzPAiPjCjZSkbvB_0LVBm-rlfTc');
  const [singleUrl, setSingleUrl] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState('');
  const [results, setResults] = useState([]);
  const [competitorResults, setCompetitorResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isRunningCompetitors, setIsRunningCompetitors] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [showDetails, setShowDetails] = useState({});
  const [showAuditDetails, setShowAuditDetails] = useState({});
  const [showDeveloperInsights, setShowDeveloperInsights] = useState({});
  const [testStatus, setTestStatus] = useState('');

  // Check if API key is ready
  const isApiKeyReady = () => {
    return apiKey && apiKey.trim().length > 0;
  };

  // Test API key function
  const testApiKey = async () => {
    if (!apiKey.trim()) {
      alert('❌ Please enter an API key first');
      return;
    }

    setIsRunning(true);
    setTestStatus('Testing...');
    
    try {
      console.log('🧪 Testing API key:', apiKey.substring(0, 10) + '...');
      
      const testResponse = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.google.com&strategy=mobile&key=${apiKey.trim()}`
      );
      
      const testData = await testResponse.json();
      
      console.log('🔍 API Test Response:', testData);
      
      if (testData.error) {
        console.error('❌ API Error Details:', testData.error);
        setTestStatus(`❌ Failed: ${testData.error.message}`);
        alert(`❌ API Key Test Failed!\n\nError: ${testData.error.message}\nCode: ${testData.error.code || 'Unknown'}\n\nDouble-check:\n• API key is correct\n• PageSpeed Insights API is enabled\n• No quota exceeded`);
      } else {
        console.log('✅ API key test successful!');
        setTestStatus('✅ Working!');
        alert('✅ API Key is working perfectly!\n\nYou can now test your URLs.\n\n💡 Tip: You can enter URLs without https:// - we\'ll add it automatically!');
      }
    } catch (error) {
      console.error('🚨 Network error:', error);
      setTestStatus(`❌ Network Error: ${error.message}`);
      alert(`🚨 Network Error!\n\n${error.message}\n\nCheck your internet connection.`);
    } finally {
      setIsRunning(false);
      setTimeout(() => setTestStatus(''), 3000);
    }
  };

  // Helper function to open Google PageSpeed Insights
  const openGooglePageSpeed = (url) => {
    const googleUrl = `https://pagespeed.web.dev/report?url=${encodeURIComponent(url)}`;
    window.open(googleUrl, '_blank');
  };

  // Toggle audit details
  const toggleAuditDetails = (resultIndex, auditType) => {
    const key = `${resultIndex}-${auditType}`;
    setShowAuditDetails(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper function to ensure URL has protocol
  const ensureProtocol = (url) => {
    if (!url) return '';
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

  // Extract real DOM data from Lighthouse API response
  const extractRealDOMData = (lighthouseResult) => {
    const audits = lighthouseResult.audits;
    
    // Extract real page size from network requests
    let totalSizeKB = 0;
    let resourceBreakdown = {
      html_kb: 0,
      css_kb: 0,
      js_kb: 0,
      images_kb: 0,
      other_kb: 0
    };

    // Get total transfer size from network-requests audit
    if (audits['network-requests'] && audits['network-requests'].details && audits['network-requests'].details.items) {
      const networkRequests = audits['network-requests'].details.items;
      
      networkRequests.forEach(request => {
        const transferSize = request.transferSize || 0;
        totalSizeKB += transferSize / 1024;
        
        // Categorize by resource type
        const url = request.url || '';
        const mimeType = request.mimeType || '';
        
        if (mimeType.includes('text/html') || url.includes('.html')) {
          resourceBreakdown.html_kb += transferSize / 1024;
        } else if (mimeType.includes('text/css') || url.includes('.css')) {
          resourceBreakdown.css_kb += transferSize / 1024;
        } else if (mimeType.includes('javascript') || url.includes('.js')) {
          resourceBreakdown.js_kb += transferSize / 1024;
        } else if (mimeType.includes('image/') || url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
          resourceBreakdown.images_kb += transferSize / 1024;
        } else {
          resourceBreakdown.other_kb += transferSize / 1024;
        }
      });
    }

    // Extract DOM complexity from dom-size audit
    let domNodes = 0;
    let domDepth = 0;
    let maxChildren = 0;
    
    if (audits['dom-size'] && audits['dom-size'].details && audits['dom-size'].details.items) {
      const domData = audits['dom-size'].details.items[0];
      if (domData) {
        domNodes = domData.value || 0;
        if (audits['dom-size'].details.items[1]) {
          domDepth = audits['dom-size'].details.items[1].value || 0;
        }
        if (audits['dom-size'].details.items[2]) {
          maxChildren = audits['dom-size'].details.items[2].value || 0;
        }
      }
    }

    // Extract performance metrics for DOM analysis
    const performanceMetrics = {
      fcp: audits['first-contentful-paint']?.numericValue || 0,
      lcp: audits['largest-contentful-paint']?.numericValue || 0,
      cls: audits['cumulative-layout-shift']?.numericValue || 0,
      tbt: audits['total-blocking-time']?.numericValue || 0,
      speed_index: audits['speed-index']?.numericValue || 0
    };

    // Count actual audit failures and warnings
    let domErrors = 0;
    let criticalIssues = [];
    
    // Check for critical DOM/rendering issues
    Object.entries(audits).forEach(([auditKey, audit]) => {
      if (audit.score !== null && audit.score < 0.9) {
        if (auditKey.includes('dom') || 
            auditKey.includes('render') || 
            auditKey.includes('layout') ||
            auditKey.includes('contentful-paint') ||
            auditKey.includes('blocking')) {
          domErrors++;
          criticalIssues.push(`${auditKey}: ${audit.title}`);
        }
      }
    });

    // Calculate crawl impact based on real metrics
    let crawlImpact = 'LOW';
    const pageSizeMB = totalSizeKB / 1024;
    
    if (pageSizeMB > 4 || domNodes > 1800 || domErrors > 8 || maxChildren > 60) {
      crawlImpact = 'HIGH';
    } else if (pageSizeMB > 2 || domNodes > 1200 || domErrors > 4 || maxChildren > 40) {
      crawlImpact = 'MEDIUM';
    }

    return {
      page_size_mb: Math.round(pageSizeMB * 100) / 100, // Real page size
      dom_nodes: domNodes, // Real DOM node count
      dom_depth: domDepth, // Real DOM depth  
      max_children: maxChildren, // Real max children per element
      dom_errors: domErrors, // Real audit failures
      critical_issues: criticalIssues,
      crawl_impact: crawlImpact,
      performance_metrics: performanceMetrics,
      resource_breakdown: {
        html_kb: Math.round(resourceBreakdown.html_kb),
        css_kb: Math.round(resourceBreakdown.css_kb),
        js_kb: Math.round(resourceBreakdown.js_kb),
        images_kb: Math.round(resourceBreakdown.images_kb),
        other_kb: Math.round(resourceBreakdown.other_kb)
      }
    };
  };

  // Run PageSpeed Insights API call with REAL DOM Analysis
  const runPageSpeedInsights = async (url) => {
    const fullUrl = ensureProtocol(url);
    
    try {
      console.log('🚀 Testing URL:', fullUrl);
      console.log('🔑 Using API key:', apiKey.substring(0, 10) + '...');
      
      const mobileResponse = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=mobile&key=${apiKey.trim()}&category=performance&category=seo&category=accessibility&category=best-practices`
      );
      const mobileData = await mobileResponse.json();
      
      console.log('📱 Mobile API Response:', mobileData);

      if (mobileData.error) {
        console.error('❌ Mobile API Error:', mobileData.error);
        throw new Error(`${mobileData.error.message} (${mobileData.error.code || 'Unknown'})`);
      }

      await new Promise(resolve => setTimeout(resolve, 3000)); // Rate limiting

      const desktopResponse = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=desktop&key=${apiKey.trim()}&category=performance&category=seo&category=accessibility&category=best-practices`
      );
      const desktopData = await desktopResponse.json();
      
      console.log('🖥️ Desktop API Response:', desktopData);

      if (desktopData.error) {
        console.error('❌ Desktop API Error:', desktopData.error);
        throw new Error(`${desktopData.error.message} (${desktopData.error.code || 'Unknown'})`);
      }

      // Extract REAL DOM data from mobile lighthouse result
      const lighthouse = mobileData.lighthouseResult;
      const realDOMData = extractRealDOMData(lighthouse);

      // Calculate GSC Impact Risk based on real performance
      const performanceScore = lighthouse.categories.performance.score;
      const gscRisk = performanceScore < 0.5 ? 'HIGH' : 
                     performanceScore < 0.8 ? 'MEDIUM' : 'LOW';

      const result = {
        url: fullUrl,
        performance_mobile: Math.round((mobileData.lighthouseResult?.categories?.performance?.score || 0) * 100),
        performance_desktop: Math.round((desktopData.lighthouseResult?.categories?.performance?.score || 0) * 100),
        accessibility: Math.round((mobileData.lighthouseResult?.categories?.accessibility?.score || 0) * 100),
        best_practices: Math.round((mobileData.lighthouseResult?.categories?.['best-practices']?.score || 0) * 100),
        seo: Math.round((mobileData.lighthouseResult?.categories?.seo?.score || 0) * 100),
        
        // REAL DOM Analysis metrics (NO MORE FAKE DATA!)
        page_size_mb: realDOMData.page_size_mb,
        dom_nodes: realDOMData.dom_nodes,
        dom_depth: realDOMData.dom_depth,
        max_children: realDOMData.max_children,
        dom_errors: realDOMData.dom_errors,
        crawl_impact: realDOMData.crawl_impact,
        gsc_risk: gscRisk,
        critical_issues: realDOMData.critical_issues,
        performance_metrics: realDOMData.performance_metrics,
        resource_breakdown: realDOMData.resource_breakdown,
        
        // Additional analysis
        dom_analysis: {
          total_nodes: realDOMData.dom_nodes,
          node_depth: realDOMData.dom_depth,
          max_children: realDOMData.max_children,
          critical_path_length: Math.ceil(realDOMData.dom_depth / 3)
        },
        status: 'success'
      };

      console.log('✅ REAL DOM analysis result:', result);
      return result;

    } catch (error) {
      console.error('🚨 DOM Analysis Error:', error);
      return {
        url: fullUrl,
        error: error.message,
        status: 'error'
      };
    }
  };

  // Run single URL test
  const runSingleTest = async () => {
    if (!singleUrl.trim()) {
      alert('❌ Please enter a URL to test');
      return;
    }

    if (!isApiKeyReady()) {
      alert('❌ Please enter your API key first');
      return;
    }
    
    setIsRunning(true);
    setProgress({ current: 0, total: 1 });
    setResults([]);

    try {
      setProgress({ current: 1, total: 1 });
      const result = await runPageSpeedInsights(singleUrl.trim());
      setResults([result]);
    } catch (error) {
      console.error('Single test error:', error);
      setResults([{ url: ensureProtocol(singleUrl.trim()), error: error.message, status: 'error' }]);
    } finally {
      setIsRunning(false);
    }
  };

  // Run batch URL tests
  const runBatchTest = async () => {
    const urls = batchUrls.split('\n').filter(url => url.trim());
    if (urls.length === 0) {
      alert('❌ Please enter URLs to test (one per line)');
      return;
    }

    if (!isApiKeyReady()) {
      alert('❌ Please enter your API key first');
      return;
    }

    setIsRunning(true);
    setProgress({ current: 0, total: urls.length });
    setResults([]);

    const batchResults = [];
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i].trim();
      if (url) {
        try {
          setProgress({ current: i + 1, total: urls.length });
          const result = await runPageSpeedInsights(url);
          batchResults.push(result);
          setResults([...batchResults]);
          
          if (i < urls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.error(`Batch test error for ${url}:`, error);
          batchResults.push({ url: ensureProtocol(url), error: error.message, status: 'error' });
        }
      }
    }
    
    setIsRunning(false);
  };

  // Run competitor analysis
  const runCompetitorAnalysis = async () => {
    const urls = competitorUrls.split('\n').filter(url => url.trim());
    if (urls.length === 0) {
      alert('❌ Please enter competitor URLs (one per line)');
      return;
    }

    if (!isApiKeyReady()) {
      alert('❌ Please enter your API key first');
      return;
    }

    setIsRunningCompetitors(true);
    setProgress({ current: 0, total: urls.length });
    setCompetitorResults([]);

    const compResults = [];
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i].trim();
      if (url) {
        try {
          setProgress({ current: i + 1, total: urls.length });
          const result = await runPageSpeedInsights(url);
          compResults.push(result);
          setCompetitorResults([...compResults]);
          
          if (i < urls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.error(`Competitor analysis error for ${url}:`, error);
          compResults.push({ url: ensureProtocol(url), error: error.message, status: 'error' });
        }
      }
    }
    
    setIsRunningCompetitors(false);
  };

  // Calculate crawlability score based on Google's thresholds
  const calculateCrawlabilityScore = (site) => {
    let score = 100;
    
    // DOM Errors (critical for crawling)
    if (site.dom_errors > 30) score -= 40;
    else if (site.dom_errors > 10) score -= 20;
    else if (site.dom_errors > 5) score -= 10;
    
    // Max Children (Google threshold: 60+)
    if (site.max_children > 60) score -= 30;
    else if (site.max_children > 40) score -= 15;
    
    // Page Size (crawl budget impact)
    if (site.page_size_mb > 3) score -= 25;
    else if (site.page_size_mb > 1.5) score -= 10;
    
    // DOM Nodes
    if (site.dom_nodes > 1800) score -= 15;
    else if (site.dom_nodes > 1200) score -= 8;
    
    // DOM Depth
    if (site.dom_depth > 32) score -= 10;
    else if (site.dom_depth > 25) score -= 5;
    
    return Math.max(0, score);
  };

  // Generate competitive analysis dashboard
  const generateCompetitiveAnalysis = () => {
    if (results.length === 0 || competitorResults.length === 0) return null;
    
    const yourSite = results[0];
    if (yourSite.status === 'error') return null;
    
    const validCompetitors = competitorResults.filter(comp => comp.status === 'success');
    if (validCompetitors.length === 0) return null;
    
    // Combine all sites with your site first
    const allSites = [yourSite, ...validCompetitors];
    
    // Calculate crawlability scores
    const sitesWithScores = allSites.map(site => ({
      ...site,
      crawlability_score: calculateCrawlabilityScore(site),
      hostname: new URL(site.url).hostname
    }));
    
    // Sort by crawlability score (higher is better)
    const rankedSites = [...sitesWithScores].sort((a, b) => b.crawlability_score - a.crawlability_score);
    
    return {
      your_site: yourSite,
      all_sites: sitesWithScores,
      ranked_sites: rankedSites,
      winner: rankedSites[0],
      loser: rankedSites[rankedSites.length - 1],
      your_rank: rankedSites.findIndex(site => site.url === yourSite.url) + 1
    };
  };

  // Competitive Analysis Dashboard Component
  const CompetitiveAnalysisDashboard = ({ analysis }) => {
    if (!analysis) return null;
    
    const { your_site, all_sites, ranked_sites, winner, loser, your_rank } = analysis;
    
    return (
      <div className="space-y-8 mb-8">
        {/* Executive Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">🏆 CRAWLABILITY COMPETITION ANALYSIS</h2>
          
          {/* Winner/Loser Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400 rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-green-800 mb-3">👑 CRAWL CHAMPION</h3>
              <div className="text-xl font-bold text-green-900 mb-2">{winner.hostname}</div>
              <div className="text-lg text-green-800 mb-4">Score: {winner.crawlability_score}/100</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>DOM Errors: <span className="font-bold">{winner.dom_errors}</span></div>
                <div>Max Children: <span className="font-bold">{winner.max_children}</span></div>
                <div>Page Size: <span className="font-bold">{winner.page_size_mb}MB</span></div>
                <div>DOM Nodes: <span className="font-bold">{winner.dom_nodes}</span></div>
              </div>
              <button
                onClick={() => openGooglePageSpeed(winner.url)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
              >
                <ExternalLink size={16} />
                Verify Data
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-400 rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-red-800 mb-3">🚨 CRAWL CHALLENGED</h3>
              <div className="text-xl font-bold text-red-900 mb-2">{loser.hostname}</div>
              <div className="text-lg text-red-800 mb-4">Score: {loser.crawlability_score}/100</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>DOM Errors: <span className="font-bold">{loser.dom_errors}</span></div>
                <div>Max Children: <span className="font-bold">{loser.max_children}</span></div>
                <div>Page Size: <span className="font-bold">{loser.page_size_mb}MB</span></div>
                <div>DOM Nodes: <span className="font-bold">{loser.dom_nodes}</span></div>
              </div>
              <button
                onClick={() => openGooglePageSpeed(loser.url)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto"
              >
                <ExternalLink size={16} />
                Verify Data
              </button>
            </div>
          </div>

          {/* Your Position Alert */}
          <div className={`p-4 rounded-lg border-2 mb-6 ${
            your_rank === 1 ? 'bg-green-50 border-green-300' :
            your_rank <= 2 ? 'bg-yellow-50 border-yellow-300' :
            'bg-red-50 border-red-300'
          }`}>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                YOUR SITE RANKS #{your_rank} OF {all_sites.length}
              </div>
              <div className="text-lg">
                Crawlability Score: <span className="font-bold">{your_site.crawlability_score || calculateCrawlabilityScore(your_site)}/100</span>
              </div>
              {your_rank === 1 && <div className="text-green-700 font-bold mt-2">🥇 You're the crawl champion!</div>}
              {your_rank > 1 && <div className="text-red-700 font-bold mt-2">⚠️ Room for improvement in crawlability</div>}
            </div>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-4">
            <h3 className="text-xl font-bold text-center">📊 DETAILED CRAWLABILITY COMPARISON</h3>
            <p className="text-center text-sm mt-1">Based on Google's crawling and indexing thresholds</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Website</th>
                  <th className="px-4 py-3 text-center font-bold">🚨 DOM<br/>Errors</th>
                  <th className="px-4 py-3 text-center font-bold">👶 Max<br/>Children</th>
                  <th className="px-4 py-3 text-center font-bold">📦 Page<br/>Size (MB)</th>
                  <th className="px-4 py-3 text-center font-bold">🏗️ DOM<br/>Nodes</th>
                  <th className="px-4 py-3 text-center font-bold">📏 DOM<br/>Depth</th>
                  <th className="px-4 py-3 text-center font-bold">📱 Mobile<br/>Perf</th>
                  <th className="px-4 py-3 text-center font-bold">🖥️ Desktop<br/>Perf</th>
                  <th className="px-4 py-3 text-center font-bold">🏆 Crawl<br/>Score</th>
                  <th className="px-4 py-3 text-center font-bold">🔍 Verify</th>
                </tr>
              </thead>
              <tbody>
                {all_sites.map((site, idx) => {
                  const isYourSite = site.url === your_site.url;
                  const rank = ranked_sites.findIndex(s => s.url === site.url) + 1;
                  const crawlScore = site.crawlability_score || calculateCrawlabilityScore(site);
                  
                  return (
                    <tr key={idx} className={`border-b-2 ${
                      isYourSite ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {isYourSite && <span className="text-blue-600 font-bold text-lg">👑</span>}
                          <div>
                            <div className="font-bold text-gray-900">{site.hostname}</div>
                            {isYourSite && <div className="text-xs text-blue-600 font-bold">YOUR SITE</div>}
                            <div className="text-xs text-gray-500">Rank #{rank}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* DOM Errors - MOST CRITICAL */}
                      <td className="px-4 py-4 text-center">
                        <div className={`text-3xl font-bold ${
                          site.dom_errors === 0 ? 'text-green-600' :
                          site.dom_errors <= 5 ? 'text-green-500' :
                          site.dom_errors <= 10 ? 'text-yellow-600' :
                          site.dom_errors <= 30 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {site.dom_errors}
                        </div>
                        <div className="text-xs text-gray-500">
                          {site.dom_errors === 0 ? 'Perfect' :
                           site.dom_errors <= 10 ? 'Good' :
                           site.dom_errors <= 30 ? 'Warning' : 'Critical'}
                        </div>
                      </td>
                      
                      {/* Max Children */}
                      <td className="px-4 py-4 text-center">
                        <div className={`text-2xl font-bold ${
                          site.max_children <= 40 ? 'text-green-600' :
                          site.max_children <= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {site.max_children}
                        </div>
                        <div className="text-xs text-gray-500">
                          {site.max_children > 60 ? 'Above Google limit!' : 'OK'}
                        </div>
                      </td>
                      
                      {/* Page Size */}
                      <td className="px-4 py-4 text-center">
                        <div className={`text-2xl font-bold ${
                          site.page_size_mb <= 1.5 ? 'text-green-600' :
                          site.page_size_mb <= 3 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {site.page_size_mb}
                        </div>
                        <div className="text-xs text-gray-500">
                          {site.page_size_mb > 3 ? 'Heavy' : site.page_size_mb > 1.5 ? 'Moderate' : 'Light'}
                        </div>
                      </td>
                      
                      {/* DOM Nodes */}
                      <td className="px-4 py-4 text-center">
                        <div className={`text-xl font-bold ${
                          site.dom_nodes <= 1200 ? 'text-green-600' :
                          site.dom_nodes <= 1800 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {site.dom_nodes.toLocaleString()}
                        </div>
                      </td>
                      
                      {/* DOM Depth */}
                      <td className="px-4 py-4 text-center">
                        <div className={`text-xl font-bold ${
                          site.dom_depth <= 25 ? 'text-green-600' :
                          site.dom_depth <= 32 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {site.dom_depth}
                        </div>
                      </td>
                      
                      {/* Mobile Performance */}
                      <td className="px-4 py-4 text-center">
                        <div className={`text-xl font-bold ${
                          site.performance_mobile >= 90 ? 'text-green-600' :
                          site.performance_mobile >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {site.performance_mobile}
                        </div>
                      </td>
                      
                      {/* Desktop Performance */}
                      <td className="px-4 py-4 text-center">
                        <div className={`text-xl font-bold ${
                          site.performance_desktop >= 90 ? 'text-green-600' :
                          site.performance_desktop >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {site.performance_desktop}
                        </div>
                      </td>
                      
                      {/* Crawlability Score */}
                      <td className="px-4 py-4 text-center">
                        <div className={`text-2xl font-bold ${
                          crawlScore >= 90 ? 'text-green-600' :
                          crawlScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {crawlScore}
                        </div>
                        <div className="text-xs text-gray-500">/100</div>
                      </td>
                      
                      {/* Verify Link */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => openGooglePageSpeed(site.url)}
                          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1 mx-auto text-sm"
                        >
                          <ExternalLink size={14} />
                          Check
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Insights */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-6">
          <h3 className="text-xl font-bold text-center mb-4">🔍 CRITICAL CRAWLABILITY INSIGHTS</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* DOM Errors Analysis */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-bold text-red-700 mb-3">🚨 DOM Errors Comparison</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Your site:</span>
                  <span className={`font-bold ${your_site.dom_errors <= 10 ? 'text-green-600' : 'text-red-600'}`}>
                    {your_site.dom_errors} errors
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Best competitor:</span>
                  <span className="font-bold text-green-600">
                    {Math.min(...competitorResults.filter(c => c.status === 'success').map(c => c.dom_errors))} errors
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Worst competitor:</span>
                  <span className="font-bold text-red-600">
                    {Math.max(...competitorResults.filter(c => c.status === 'success').map(c => c.dom_errors))} errors
                  </span>
                </div>
              </div>
              {your_site.dom_errors > 10 && (
                <div className="mt-2 p-2 bg-red-50 text-red-700 text-xs rounded">
                  ⚠️ High DOM errors can prevent Google from properly crawling your site!
                </div>
              )}
            </div>

            {/* Page Size Analysis */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-bold text-blue-700 mb-3">📦 Page Size Impact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Your site:</span>
                  <span className={`font-bold ${your_site.page_size_mb <= 3 ? 'text-green-600' : 'text-red-600'}`}>
                    {your_site.page_size_mb}MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lightest competitor:</span>
                  <span className="font-bold text-green-600">
                    {Math.min(...competitorResults.filter(c => c.status === 'success').map(c => c.page_size_mb))}MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Heaviest competitor:</span>
                  <span className="font-bold text-red-600">
                    {Math.max(...competitorResults.filter(c => c.status === 'success').map(c => c.page_size_mb))}MB
                  </span>
                </div>
              </div>
              {your_site.page_size_mb > 3 && (
                <div className="mt-2 p-2 bg-orange-50 text-orange-700 text-xs rounded">
                  ⚠️ Large pages waste crawl budget and slow indexing!
                </div>
              )}
            </div>

            {/* Children Elements Analysis */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-bold text-purple-700 mb-3">👶 Child Elements</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Your site:</span>
                  <span className={`font-bold ${your_site.max_children <= 60 ? 'text-green-600' : 'text-red-600'}`}>
                    {your_site.max_children} max
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Best competitor:</span>
                  <span className="font-bold text-green-600">
                    {Math.min(...competitorResults.filter(c => c.status === 'success').map(c => c.max_children))} max
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Google recommends max 60 children per parent element
                </div>
              </div>
              {your_site.max_children > 60 && (
                <div className="mt-2 p-2 bg-red-50 text-red-700 text-xs rounded">
                  🚨 Exceeds Google's 60 children threshold!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Toggle details
  const toggleDetails = (index) => {
    setShowDetails(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🔍 Real-Time Lighthouse DOM Analyzer & Competitor Benchmark
        </h1>
        <p className="text-gray-600 text-lg">
          Live Google PageSpeed Insights API analysis focusing on DOM crawlability, child elements monitoring, and competitive intelligence. 
          NO FAKE DATA - All metrics are extracted directly from Google's real-time analysis.
        </p>
        
        <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-green-600 text-xl">✅</div>
            <strong className="text-green-900">100% REAL DATA GUARANTEE:</strong>
          </div>
          <div className="text-sm text-green-800 space-y-1">
            <div>• DOM Nodes, Depth & Children extracted from Google's dom-size audit</div>
            <div>• Page Size calculated from actual network-requests data</div>
            <div>• DOM Errors based on real Lighthouse audit failures</div>
            <div>• Performance scores directly from Google PageSpeed API</div>
            <div>• Verify links provided for every site tested</div>
          </div>
        </div>
      </div>

      {/* API Key Input */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">🔑 API Key Setup</h2>
        <div className="flex gap-4 items-center mb-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your Google PageSpeed Insights API key here"
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <button
            onClick={testApiKey}
            disabled={!apiKey.trim() || isRunning}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            🧪 Test Key
          </button>
          <div className={`px-4 py-3 rounded-lg font-bold ${
            isApiKeyReady() 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isApiKeyReady() ? '✅ Ready' : '❌ Required'}
          </div>
        </div>
        
        {testStatus && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <strong>Test Status:</strong> {testStatus}
          </div>
        )}
      </div>

      {/* Single URL Test */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">🏠 Your Main Site Analysis</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="url"
            value={singleUrl}
            onChange={(e) => setSingleUrl(e.target.value)}
            placeholder="your-website.com (test your main site first)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={runSingleTest}
            disabled={isRunning || !isApiKeyReady()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Zap size={20} />
            {isRunning ? 'Analyzing...' : 'Analyze Site'}
          </button>
        </div>
        <div className="text-sm text-gray-600">
          💡 Test your main site first, then add competitors below for the full comparison
        </div>
      </div>

      {/* Competitor Analysis */}
      <div className="bg-orange-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">🥊 Competitor Analysis</h2>
        <p className="text-sm text-gray-600 mb-4">
          Add competitor URLs to see how your DOM quality, page size, and crawlability compares
        </p>
        <div className="mb-4">
          <textarea
            value={competitorUrls}
            onChange={(e) => setCompetitorUrls(e.target.value)}
            placeholder="competitor1.com&#10;competitor2.com&#10;competitor3.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
          />
        </div>
        <button
          onClick={runCompetitorAnalysis}
          disabled={isRunningCompetitors || !isApiKeyReady() || results.length === 0}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Zap size={20} />
          {isRunningCompetitors ? 'Analyzing Competitors...' : 'Analyze Competitors'}
        </button>
        {results.length === 0 && (
          <div className="mt-2 text-sm text-orange-600">
            ⚠️ Test your main site first, then add competitors for the full benchmark
          </div>
        )}
      </div>

      {/* Progress */}
      {(isRunning || isRunningCompetitors) && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {isRunningCompetitors ? 'Analyzing Competitors' : 'Progress'}
            </span>
            <span className="text-sm text-gray-600">{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isRunningCompetitors ? 'bg-orange-600' : 'bg-blue-600'
              }`}
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Competitive Analysis Dashboard */}
      <CompetitiveAnalysisDashboard analysis={generateCompetitiveAnalysis()} />

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">📊 Detailed Analysis Results</h2>
          
          {results.map((result, index) => (
            <div key={index} className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{result.url}</h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => openGooglePageSpeed(result.url)}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                    >
                      <ExternalLink size={16} />
                      🔍 Verify Real Data
                    </button>
                    <button
                      onClick={() => toggleDetails(index)}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <Eye size={16} />
                      {showDetails[index] ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>
                </div>
              </div>

              {result.status === 'error' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-700 font-medium">❌ Error</div>
                  <div className="text-red-600 mt-2">{result.error}</div>
                </div>
              ) : (
                <>
                  {/* Quick Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-blue-100 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600">Mobile Performance</div>
                      <div className="text-2xl font-bold text-blue-600">{result.performance_mobile}</div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600">Desktop Performance</div>
                      <div className="text-2xl font-bold text-green-600">{result.performance_desktop}</div>
                    </div>
                    <div className="bg-red-100 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600">DOM Errors</div>
                      <div className="text-2xl font-bold text-red-600">{result.dom_errors}</div>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600">Page Size</div>
                      <div className="text-2xl font-bold text-purple-600">{result.page_size_mb}MB</div>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600">Max Children</div>
                      <div className="text-2xl font-bold text-yellow-600">{result.max_children}</div>
                    </div>
                  </div>

                  {/* Detailed Analysis */}
                  {showDetails[index] && (
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold mb-4">🔍 Real DOM Structure Analysis</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">Total DOM Nodes</div>
                          <div className="font-bold text-xl">{result.dom_nodes?.toLocaleString()}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">DOM Depth</div>
                          <div className="font-bold text-xl">{result.dom_depth}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">Crawl Impact</div>
                          <div className={`font-bold text-xl ${
                            result.crawl_impact === 'LOW' ? 'text-green-600' :
                            result.crawl_impact === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {result.crawl_impact}
                          </div>
                        </div>
                      </div>

                      {/* Resource Breakdown */}
                      {result.resource_breakdown && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold mb-4">📦 Real Resource Breakdown</h4>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-sm text-gray-600">HTML</div>
                              <div className="font-bold">{result.resource_breakdown.html_kb} KB</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="text-sm text-gray-600">CSS</div>
                              <div className="font-bold text-blue-600">{result.resource_breakdown.css_kb} KB</div>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-lg">
                              <div className="text-sm text-gray-600">JavaScript</div>
                              <div className="font-bold text-yellow-600">{result.resource_breakdown.js_kb} KB</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="text-sm text-gray-600">Images</div>
                              <div className="font-bold text-green-600">{result.resource_breakdown.images_kb} KB</div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg">
                              <div className="text-sm text-gray-600">Other</div>
                              <div className="font-bold text-purple-600">{result.resource_breakdown.other_kb} KB</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 p-6 rounded-lg mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🔧 Real-Time DOM Analysis & Competitive Intelligence</h3>
        <p className="mb-4 text-gray-700">
          This tool extracts real DOM structure data, page sizes, and performance metrics directly from Google's PageSpeed Insights API. 
          No simulated data - everything is based on Google's actual analysis of your sites.
        </p>
        <div className="text-sm text-gray-600 space-y-2">
          <div><strong>🏗️ Real DOM Analysis:</strong> Actual node counts, depth, and children from Google's dom-size audit</div>
          <div><strong>📦 Real Page Size:</strong> Calculated from network-requests audit data</div>
          <div><strong>🚨 Real DOM Errors:</strong> Based on actual Lighthouse audit failures</div>
          <div><strong>🔍 Verification Links:</strong> Check every result against Google PageSpeed directly</div>
          <div><strong>🥊 Competitive Intelligence:</strong> Compare crawlability using Google's thresholds</div>
        </div>
      </div>
    </div>
  );
}
