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

  // 🔧 FIXED Test API key function
  const testApiKey = async () => {
    if (!apiKey.trim()) {
      alert('❌ Please enter an API key first');
      return;
    }

    setIsRunning(true);
    setTestStatus('Testing...');
    
    try {
      console.log('🧪 Testing API key...');
      
      // 🔥 SIMPLE API TEST - NO ENCODING ISSUES
      const testUrl = 'https://example.com'; // Simple URL instead of google.com
      const testResponse = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${testUrl}&strategy=mobile&key=${apiKey.trim()}`
      );
      
      console.log('🔍 API Test Response status:', testResponse.status);
      
      if (!testResponse.ok) {
        throw new Error(`HTTP ${testResponse.status}: ${testResponse.statusText}`);
      }
      
      const testData = await testResponse.json();
      console.log('🔍 API Test Response:', testData);
      
      if (testData.error) {
        console.error('❌ API Error Details:', testData.error);
        setTestStatus(`❌ Failed: ${testData.error.message}`);
        alert(`❌ API Key Test Failed!\n\nError: ${testData.error.message}\nCode: ${testData.error.code || 'Unknown'}`);
      } else {
        console.log('✅ API key test successful!');
        setTestStatus('✅ Working!');
        alert('✅ API Key is working perfectly!\n\nYou can now test your URLs.');
      }
    } catch (error) {
      console.error('🚨 Network error:', error);
      setTestStatus(`❌ Network Error: ${error.message}`);
      alert(`🚨 Network Error!\n\n${error.message}`);
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

  // 🔥 STEP 1: Get PageSpeed Data Separately
  const getPageSpeedData = async (url) => {
    const fullUrl = ensureProtocol(url);
    
    console.log('📱 STEP 1: Getting PageSpeed data for:', fullUrl);
    
    // Get mobile data
    const mobileResponse = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=mobile&key=${apiKey.trim()}&category=performance&category=seo&category=accessibility&category=best-practices`
    );
    const mobileData = await mobileResponse.json();
    
    if (mobileData.error) {
      throw new Error(`PageSpeed Mobile API error: ${mobileData.error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 3000)); // Rate limiting

    // Get desktop data
    const desktopResponse = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=desktop&key=${apiKey.trim()}&category=performance&category=seo&category=accessibility&category=best-practices`
    );
    const desktopData = await desktopResponse.json();
    
    if (desktopData.error) {
      throw new Error(`PageSpeed Desktop API error: ${desktopData.error.message}`);
    }

    // Extract basic data from PageSpeed API
    const lighthouse = mobileData.lighthouseResult;
    const audits = lighthouse.audits;
    
    // Extract page size
    let totalSizeKB = 0;
    if (audits['total-byte-weight'] && audits['total-byte-weight'].numericValue) {
      totalSizeKB = audits['total-byte-weight'].numericValue / 1024;
    }

    // Extract DOM data from PageSpeed (limited but available)
    let domNodes = 0;
    let domDepth = 0;
    let maxChildren = 0;
    
    if (audits['dom-size'] && audits['dom-size'].details && audits['dom-size'].details.items) {
      const domItems = audits['dom-size'].details.items;
      
      if (Array.isArray(domItems) && domItems.length >= 3) {
        if (domItems[0] && typeof domItems[0].value !== 'undefined') {
          domNodes = domItems[0].value;
        }
        if (domItems[1] && typeof domItems[1].value !== 'undefined') {
          domDepth = domItems[1].value;
        }
        if (domItems[2] && typeof domItems[2].value !== 'undefined') {
          maxChildren = domItems[2].value;
        }
      }
    }

    // Count DOM errors
    let domErrors = 0;
    Object.entries(audits).forEach(([auditKey, audit]) => {
      if (audit.score !== null && audit.score < 0.9) {
        if (auditKey.includes('dom') || auditKey.includes('render') || auditKey.includes('layout')) {
          domErrors++;
        }
      }
    });

    const pagespeedResult = {
      url: fullUrl,
      performance_mobile: Math.round((mobileData.lighthouseResult?.categories?.performance?.score || 0) * 100),
      performance_desktop: Math.round((desktopData.lighthouseResult?.categories?.performance?.score || 0) * 100),
      accessibility: Math.round((mobileData.lighthouseResult?.categories?.accessibility?.score || 0) * 100),
      best_practices: Math.round((mobileData.lighthouseResult?.categories?.['best-practices']?.score || 0) * 100),
      seo: Math.round((mobileData.lighthouseResult?.categories?.seo?.score || 0) * 100),
      
      // PageSpeed DOM data (limited)
      pagespeed_dom_nodes: domNodes,
      pagespeed_dom_depth: domDepth,
      pagespeed_max_children: maxChildren,
      pagespeed_dom_errors: domErrors,
      
      // Page size
      page_size_mb: Math.round((totalSizeKB / 1024) * 100) / 100,
      
      data_source: 'PageSpeed API'
    };

    console.log('✅ PageSpeed data extracted:', pagespeedResult);
    return pagespeedResult;
  };

  // 🔥 STEP 2: Get Railway Data Separately  
  const getRailwayData = async (url) => {
    const fullUrl = ensureProtocol(url);
    
    console.log('🚂 STEP 2: Getting Railway data for:', fullUrl);
    
    try {
      const railwayResponse = await fetch('/api/lighthouse-dom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl })
      });
      
      const railwayResult = await railwayResponse.json();
      console.log('📦 Railway raw response:', railwayResult);
      
      if (railwayResult.success && railwayResult.domData) {
        console.log('✅ Railway data extracted:', railwayResult.domData);
        return {
          railway_dom_nodes: railwayResult.domData.dom_nodes,
          railway_dom_depth: railwayResult.domData.dom_depth,
          railway_max_children: railwayResult.domData.max_children,
          railway_dom_errors: railwayResult.domData.dom_issues_count || 0,
          railway_crawlability_score: railwayResult.domData.crawlability_score,
          railway_crawlability_risk: railwayResult.domData.crawlability_risk,
          data_source: 'Railway CLI'
        };
      } else {
        console.log('⚠️ Railway analysis failed:', railwayResult.error);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Railway error:', error);
      return null;
    }
  };

  // 🔥 STEP 3: Combine Data Simply
  const combineData = (pagespeedData, railwayData) => {
    console.log('🎯 STEP 3: Combining data...');
    console.log('- PageSpeed data:', pagespeedData);
    console.log('- Railway data:', railwayData);
    
    // Use Railway data if available, otherwise PageSpeed fallback
    const finalResult = {
      url: pagespeedData.url,
      
      // Performance scores (always from PageSpeed)
      performance_mobile: pagespeedData.performance_mobile,
      performance_desktop: pagespeedData.performance_desktop,
      accessibility: pagespeedData.accessibility,
      best_practices: pagespeedData.best_practices,
      seo: pagespeedData.seo,
      
      // DOM data (Railway first, PageSpeed fallback)
      dom_nodes: railwayData ? railwayData.railway_dom_nodes : pagespeedData.pagespeed_dom_nodes,
      dom_depth: railwayData ? railwayData.railway_dom_depth : pagespeedData.pagespeed_dom_depth,
      max_children: railwayData ? railwayData.railway_max_children : pagespeedData.pagespeed_max_children,
      dom_errors: railwayData ? railwayData.railway_dom_errors : pagespeedData.pagespeed_dom_errors,
      
      // Page size (always from PageSpeed)
      page_size_mb: pagespeedData.page_size_mb,
      
      // Analysis metadata
      analysis_method: railwayData ? 'HYBRID' : 'PAGESPEED_ONLY',
      data_sources: railwayData ? ['PageSpeed API', 'Railway CLI'] : ['PageSpeed API'],
      lighthouse_version: railwayData ? 'Railway CLI' : 'PageSpeed API only',
      
      // Additional Railway data if available
      crawlability_score: railwayData ? railwayData.railway_crawlability_score : null,
      crawl_impact: railwayData ? railwayData.railway_crawlability_risk : calculateCrawlImpact(pagespeedData.pagespeed_dom_nodes, pagespeedData.pagespeed_max_children, pagespeedData.page_size_mb * 1024 * 1024, pagespeedData.pagespeed_dom_errors),
      
      status: 'success'
    };

    console.log('🎉 Final combined result:', finalResult);
    return finalResult;
  };

  // Main analysis function - SIMPLE SEQUENTIAL APPROACH
  const runSingleAnalysis = async (url) => {
    console.log('🚀 Starting SIMPLE SEQUENTIAL analysis for:', url);
    
    try {
      // STEP 1: Get PageSpeed data (required)
      const pagespeedData = await getPageSpeedData(url);
      
      // STEP 2: Get Railway data (optional)
      const railwayData = await getRailwayData(url);
      
      // STEP 3: Combine them
      const finalResult = combineData(pagespeedData, railwayData);
      
      return finalResult;
      
    } catch (error) {
      console.error('🚨 Analysis error:', error);
      return {
        url: ensureProtocol(url),
        error: String(error.message || 'Unknown error'),
        status: 'error'
      };
    }
  };

  // Calculate crawl impact based on various factors
  const calculateCrawlImpact = (domNodes, maxChildren, pageSizeBytes, domErrors) => {
    const pageSizeMB = pageSizeBytes / 1024 / 1024;
    
    if (pageSizeMB > 4 || domNodes > 1800 || domErrors > 8 || maxChildren > 60) {
      return 'HIGH';
    } else if (pageSizeMB > 2 || domNodes > 1200 || domErrors > 4 || maxChildren > 40) {
      return 'MEDIUM';
    }
    return 'LOW';
  };

  // Calculate crawlability score based on Google's thresholds
  const calculateCrawlabilityScore = (site) => {
    let score = 100;
    
    // DOM Errors (critical for crawling)
    const domErrors = Math.round(site.dom_errors || 0);
    if (domErrors > 30) score -= 40;
    else if (domErrors > 10) score -= 20;
    else if (domErrors > 5) score -= 10;
    
    // Max Children (Google threshold: 60+)
    const maxChildren = Math.round(site.max_children || 0);
    if (maxChildren > 60) score -= 30;
    else if (maxChildren > 40) score -= 15;
    
    // Page Size (crawl budget impact)
    const pageSize = parseFloat(site.page_size_mb || 0);
    if (pageSize > 3) score -= 25;
    else if (pageSize > 1.5) score -= 10;
    
    // DOM Nodes
    const domNodes = Math.round(site.dom_nodes || 0);
    if (domNodes > 1800) score -= 15;
    else if (domNodes > 1200) score -= 8;
    
    // DOM Depth
    const domDepth = Math.round(site.dom_depth || 0);
    if (domDepth > 32) score -= 10;
    else if (domDepth > 25) score -= 5;
    
    return Math.max(0, score);
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
      const result = await runSingleAnalysis(singleUrl.trim());
      setResults([result]);
    } catch (error) {
      console.error('Single test error:', error);
      setResults([{ url: ensureProtocol(singleUrl.trim()), error: String(error.message), status: 'error' }]);
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
          const result = await runSingleAnalysis(url);
          batchResults.push(result);
          setResults([...batchResults]);
          
          if (i < urls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.error(`Batch test error for ${url}:`, error);
          const errorResult = { url: ensureProtocol(url), error: String(error.message), status: 'error' };
          batchResults.push(errorResult);
          setResults([...batchResults]);
        }
      }
    }
    
    setIsRunning(false);
  };

  // 🔧 FIXED Run competitor analysis
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
    setCompetitorResults([]); // 🔥 CLEAR PREVIOUS RESULTS

    const compResults = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i].trim();
      if (url) {
        try {
          setProgress({ current: i + 1, total: urls.length });
          console.log(`🥊 Analyzing competitor ${i + 1}/${urls.length}: ${url}`);
          
          const result = await runSingleAnalysis(url); // 🔥 USE SAME FUNCTION AS SINGLE TEST
          compResults.push(result);
          
          // 🔥 UPDATE STATE AFTER EACH COMPETITOR
          setCompetitorResults([...compResults]);
          console.log('🔍 Updated competitor results state:', compResults);
          
          if (i < urls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.error(`Competitor analysis error for ${url}:`, error);
          const errorResult = { 
            url: ensureProtocol(url), 
            error: String(error.message), 
            status: 'error' 
          };
          compResults.push(errorResult);
          setCompetitorResults([...compResults]); // 🔥 UPDATE STATE EVEN FOR ERRORS
        }
      }
    }
    
    console.log('🎉 Final competitor results:', compResults);
    setIsRunningCompetitors(false);
  };

  // Generate competitive analysis dashboard
  const generateCompetitiveAnalysis = () => {
    if (results.length === 0 || competitorResults.length === 0) return null;

    const myResult = results[0];
    if (myResult.status === 'error') return null;

    const validCompetitors = competitorResults.filter(comp => comp.status === 'success');
    if (validCompetitors.length === 0) return null;

    // Calculate averages and rankings
    const allSites = [myResult, ...validCompetitors];
    
    const avgPerformanceMobile = validCompetitors.reduce((sum, comp) => sum + comp.performance_mobile, 0) / validCompetitors.length;
    const avgPerformanceDesktop = validCompetitors.reduce((sum, comp) => sum + comp.performance_desktop, 0) / validCompetitors.length;
    const avgPageSize = validCompetitors.reduce((sum, comp) => sum + comp.page_size_mb, 0) / validCompetitors.length;
    const avgDomNodes = validCompetitors.reduce((sum, comp) => sum + comp.dom_nodes, 0) / validCompetitors.length;
    const avgMaxChildren = validCompetitors.reduce((sum, comp) => sum + comp.max_children, 0) / validCompetitors.length;

    // Rankings
    const performanceRanking = allSites.sort((a, b) => b.performance_mobile - a.performance_mobile);
    const pageSizeRanking = allSites.sort((a, b) => a.page_size_mb - b.page_size_mb);
    const domNodesRanking = allSites.sort((a, b) => a.dom_nodes - b.dom_nodes);
    const crawlabilityRanking = allSites.map(site => ({
      ...site,
      crawlability_score: calculateCrawlabilityScore(site)
    })).sort((a, b) => b.crawlability_score - a.crawlability_score);

    const myPerformanceRank = performanceRanking.findIndex(site => site.url === myResult.url) + 1;
    const myPageSizeRank = pageSizeRanking.findIndex(site => site.url === myResult.url) + 1;
    const myDomNodesRank = domNodesRanking.findIndex(site => site.url === myResult.url) + 1;
    const myCrawlabilityRank = crawlabilityRanking.findIndex(site => site.url === myResult.url) + 1;

    return {
      myResult,
      validCompetitors,
      averages: {
        performance_mobile: Math.round(avgPerformanceMobile),
        performance_desktop: Math.round(avgPerformanceDesktop),
        page_size_mb: Math.round(avgPageSize * 100) / 100,
        dom_nodes: Math.round(avgDomNodes),
        max_children: Math.round(avgMaxChildren)
      },
      rankings: {
        performance: { rank: myPerformanceRank, total: allSites.length },
        page_size: { rank: myPageSizeRank, total: allSites.length },
        dom_nodes: { rank: myDomNodesRank, total: allSites.length },
        crawlability: { rank: myCrawlabilityRank, total: allSites.length }
      },
      crawlabilityRanking
    };
  };

  // Toggle details
  const toggleDetails = (index) => {
    setShowDetails(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleDeveloperInsights = (index) => {
    setShowDeveloperInsights(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Competitive Analysis Dashboard Component
  const CompetitiveAnalysisDashboard = ({ analysis }) => {
    if (!analysis) return null;

    const { myResult, validCompetitors, averages, rankings, crawlabilityRanking } = analysis;

    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-purple-900 mb-6">🏆 Competitive Intelligence Dashboard</h2>
        
        {/* Key Metrics Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Mobile Performance</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{myResult.performance_mobile}</div>
                <div className="text-sm text-gray-500">You</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-400">{averages.performance_mobile}</div>
                <div className="text-sm text-gray-500">Competitors</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Rank: #{rankings.performance.rank}/{rankings.performance.total}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Page Size</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{myResult.page_size_mb}MB</div>
                <div className="text-sm text-gray-500">You</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-400">{averages.page_size_mb}MB</div>
                <div className="text-sm text-gray-500">Competitors</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Rank: #{rankings.page_size.rank}/{rankings.page_size.total} {rankings.page_size.rank <= 2 ? '(Lighter is better)' : ''}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">DOM Complexity</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{myResult.dom_nodes.toLocaleString()}</div>
                <div className="text-sm text-gray-500">You</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-400">{averages.dom_nodes.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Competitors</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Rank: #{rankings.dom_nodes.rank}/{rankings.dom_nodes.total} {rankings.dom_nodes.rank <= 2 ? '(Simpler is better)' : ''}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Crawlability Score</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{calculateCrawlabilityScore(myResult)}</div>
                <div className="text-sm text-gray-500">You</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-400">
                  {Math.round(validCompetitors.reduce((sum, comp) => sum + calculateCrawlabilityScore(comp), 0) / validCompetitors.length)}
                </div>
                <div className="text-sm text-gray-500">Competitors</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Rank: #{rankings.crawlability.rank}/{rankings.crawlability.total}
            </div>
          </div>
        </div>

        {/* Crawlability Leaderboard */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Crawlability Leaderboard</h3>
          <div className="space-y-2">
            {crawlabilityRanking.map((site, index) => (
              <div 
                key={site.url} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  site.url === myResult.url ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-300 text-orange-900' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {site.url === myResult.url ? '🏠 Your Site' : new URL(site.url).hostname}
                    </div>
                    <div className="text-sm text-gray-500">
                      {site.dom_nodes.toLocaleString()} nodes • {site.max_children} max children • {site.page_size_mb}MB
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">{site.crawlability_score}</div>
                  <div className="text-sm text-gray-500">Score</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🔥 DOM Analyzer & Competitive Intelligence
        </h1>
        <p className="text-gray-600 text-lg">
          Simple sequential approach: Get PageSpeed data, get Railway data, combine them. No complex parallel processing - just works!
        </p>
        
        <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-green-600 text-xl">🔢</div>
            <strong className="text-green-900">SIMPLE SEQUENTIAL APPROACH:</strong>
          </div>
          <div className="text-sm text-green-800 space-y-1">
            <div>• 📱 <strong>Step 1:</strong> Get PageSpeed data (performance + basic DOM)</div>
            <div>• 🚂 <strong>Step 2:</strong> Get Railway data (enhanced DOM structure)</div>
            <div>• 🎯 <strong>Step 3:</strong> Combine them (Railway preferred, PageSpeed fallback)</div>
            <div>• ✅ <strong>Result:</strong> Best of both worlds with simple logic</div>
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
            {isRunning ? 'Analyzing...' : 'Sequential Analysis'}
          </button>
        </div>
        <div className="text-sm text-gray-600">
          🔢 Simple sequential: PageSpeed → Railway → Combine (no parallel processing complexity)
        </div>
      </div>

      {/* Batch URL Test */}
      <div className="bg-green-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">📋 Batch URL Analysis</h2>
        <p className="text-sm text-gray-600 mb-4">
          Test multiple URLs with the same simple sequential approach
        </p>
        <div className="mb-4">
          <textarea
            value={batchUrls}
            onChange={(e) => setBatchUrls(e.target.value)}
            placeholder="url1.com&#10;url2.com&#10;url3.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
          />
        </div>
        <button
          onClick={runBatchTest}
          disabled={isRunning || !isApiKeyReady()}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Zap size={20} />
          {isRunning ? 'Processing Batch...' : 'Batch Analysis'}
        </button>
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
                    <button
                      onClick={() => toggleDeveloperInsights(index)}
                      className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm"
                    >
                      <FileText size={16} />
                      {showDeveloperInsights[index] ? 'Hide Dev Insights' : 'Dev Insights'}
                    </button>
                    {/* Data Source Indicator */}
                    <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      result.analysis_method === 'HYBRID' ? 'bg-green-100 text-green-700' :
                      result.analysis_method === 'PAGESPEED_ONLY' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {result.analysis_method === 'HYBRID' ? '🔥 HYBRID' :
                       result.analysis_method === 'PAGESPEED_ONLY' ? '⚠️ PAGESPEED ONLY' : 'UNKNOWN'}
                    </div>
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
                  {/* Quick Metrics - SAFELY RENDERED */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-blue-100 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600">Mobile Performance</div>
                      <div className="text-2xl font-bold text-blue-600">{Math.round(result.performance_mobile || 0)}</div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600">Desktop Performance</div>
                      <div className="text-2xl font-bold text-green-600">{Math.round(result.performance_desktop || 0)}</div>
                    </div>
                    <div className="bg-red-100 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600">DOM Errors</div>
                      <div className="text-2xl font-bold text-red-600">{Math.round(result.dom_errors || 0)}</div>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600">Page Size</div>
                      <div className="text-2xl font-bold text-purple-600">{parseFloat(result.page_size_mb || 0).toFixed(1)}MB</div>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600">Max Children</div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {Math.round(result.max_children || 0) === 0 ? 'N/A' : Math.round(result.max_children || 0)}
                      </div>
                    </div>
                  </div>

                  {/* REAL DOM Structure Display */}
                  {result.analysis_method === 'HYBRID' && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-green-600 text-xl">🏗️</div>
                        <strong className="text-green-900">REAL DOM Structure (Railway CLI + PageSpeed API)</strong>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{Math.round(result.dom_nodes || 0).toLocaleString()}</div>
                          <div className="text-sm text-gray-500">DOM Nodes</div>
                          <div className="text-xs text-gray-400">
                            {Math.round(result.dom_nodes || 0) > 1500 ? '⚠️ High' : '✅ Good'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{Math.round(result.dom_depth || 0)}</div>
                          <div className="text-sm text-gray-500">DOM Depth</div>
                          <div className="text-xs text-gray-400">
                            {Math.round(result.dom_depth || 0) > 32 ? '⚠️ Deep' : '✅ Good'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{Math.round(result.max_children || 0)}</div>
                          <div className="text-sm text-gray-500">Max Children</div>
                          <div className="text-xs text-gray-400">
                            {Math.round(result.max_children || 0) > 60 ? '🚨 Google Limit!' : '✅ OK'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {result.crawlability_score || calculateCrawlabilityScore(result)}
                          </div>
                          <div className="text-sm text-gray-500">Crawl Score</div>
                          <div className="text-xs text-gray-400">/100</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Developer Insights */}
                  {showDeveloperInsights[index] && (
                    <div className="border-t pt-6 mb-6">
                      <h4 className="text-lg font-semibold mb-4">🔧 Developer Insights & Recommendations</h4>
                      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                        <div className="space-y-4">
                          {/* DOM Optimization */}
                          <div>
                            <h5 className="font-semibold text-purple-900 mb-2">🏗️ DOM Structure Optimization</h5>
                            <div className="text-sm text-purple-800 space-y-1">
                              {result.max_children > 60 && (
                                <div>• ⚠️ <strong>Critical:</strong> Max children ({result.max_children}) exceeds Google's 60-element threshold</div>
                              )}
                              {result.dom_nodes > 1500 && (
                                <div>• ⚠️ <strong>High DOM complexity:</strong> {result.dom_nodes.toLocaleString()} nodes (recommended: &lt;1500)</div>
                              )}
                              {result.dom_depth > 32 && (
                                <div>• ⚠️ <strong>Deep nesting:</strong> {result.dom_depth} levels (recommended: &lt;32)</div>
                              )}
                              {result.max_children <= 60 && result.dom_nodes <= 1500 && result.dom_depth <= 32 && (
                                <div>• ✅ DOM structure is well-optimized for crawling</div>
                              )}
                            </div>
                          </div>

                          {/* Performance Impact */}
                          <div>
                            <h5 className="font-semibold text-purple-900 mb-2">⚡ Performance Impact</h5>
                            <div className="text-sm text-purple-800 space-y-1">
                              {result.page_size_mb > 3 && (
                                <div>• ⚠️ <strong>Large page size:</strong> {result.page_size_mb}MB impacts crawl budget</div>
                              )}
                              {result.dom_errors > 5 && (
                                <div>• ⚠️ <strong>DOM errors:</strong> {result.dom_errors} audit failures detected</div>
                              )}
                              <div>• 📊 <strong>Crawl impact:</strong> {result.crawl_impact} risk level</div>
                            </div>
                          </div>

                          {/* Data Quality */}
                          <div>
                            <h5 className="font-semibold text-purple-900 mb-2">📊 Data Quality</h5>
                            <div className="text-sm text-purple-800 space-y-1">
                              <div>• 🔄 <strong>Analysis method:</strong> {result.analysis_method}</div>
                              <div>• 📡 <strong>Data sources:</strong> {result.data_sources?.join(', ')}</div>
                              {result.analysis_method === 'HYBRID' && (
                                <div>• ✅ <strong>Enhanced accuracy:</strong> Railway CLI provides precise DOM measurements</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detailed Analysis */}
                  {showDetails[index] && (
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold mb-4">🔍 Complete Analysis Details</h4>
                      
                      {/* Analysis Method Info */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold mb-2">📊 Analysis Method & Data Sources</h4>
                        <div className="text-sm space-y-2">
                          <div><strong>Method:</strong> {result.analysis_method}</div>
                          <div><strong>Data Sources:</strong> {result.data_sources?.join(', ') || 'PageSpeed API'}</div>
                          <div><strong>Lighthouse Version:</strong> {result.lighthouse_version || 'N/A'}</div>
                          <div><strong>Crawl Impact:</strong> {result.crawl_impact || 'Unknown'}</div>
                          {result.analysis_method === 'HYBRID' && (
                            <div className="text-green-700 font-semibold">✅ Full hybrid analysis with Railway DOM + PageSpeed performance</div>
                          )}
                          {result.analysis_method === 'PAGESPEED_ONLY' && (
                            <div className="text-orange-700 font-semibold">⚠️ Railway unavailable - using PageSpeed API only</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 🔥 COMPETITOR RESULTS SECTION - FIXED */}
      {competitorResults.length > 0 && (
        <div className="space-y-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900">🥊 Competitor Analysis Results</h2>
          
          {competitorResults.map((result, index) => (
            <div key={index} className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🏢 {result.url ? new URL(result.url).hostname : 'Unknown'}
                  </h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => openGooglePageSpeed(result.url)}
                      className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm"
                    >
                      <ExternalLink size={16} />
                      🔍 Verify Data
                    </button>
                    <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      result.analysis_method === 'HYBRID' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {result.analysis_method === 'HYBRID' ? '🔥 HYBRID' : '⚠️ PAGESPEED ONLY'}
                    </div>
                  </div>
                </div>
              </div>

              {result.status === 'error' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-700 font-medium">❌ Error</div>
                  <div className="text-red-600 mt-2">{result.error}</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-sm text-gray-600">Mobile Performance</div>
                    <div className="text-2xl font-bold text-blue-600">{result.performance_mobile}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-sm text-gray-600">Desktop Performance</div>
                    <div className="text-2xl font-bold text-green-600">{result.performance_desktop}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-sm text-gray-600">DOM Errors</div>
                    <div className="text-2xl font-bold text-red-600">{result.dom_errors}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-sm text-gray-600">Page Size</div>
                    <div className="text-2xl font-bold text-purple-600">{result.page_size_mb}MB</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-sm text-gray-600">Max Children</div>
                    <div className="text-2xl font-bold text-yellow-600">{result.max_children}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 p-6 rounded-lg mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🔢 Simple Sequential Data Architecture</h3>
        <p className="mb-4 text-gray-700">
          Simple approach: Get PageSpeed data first, then Railway data, then combine them. No complex parallel processing - just straightforward sequential execution that works reliably.
        </p>
        <div className="text-sm text-gray-600 space-y-2">
          <div><strong>🔢 Sequential Processing:</strong> One step at a time, easy to debug and understand</div>
          <div><strong>📱 PageSpeed First:</strong> Always get performance scores and basic DOM data</div>
          <div><strong>🚂 Railway Enhancement:</strong> Add detailed DOM structure when available</div>
          <div><strong>🎯 Smart Combination:</strong> Railway data preferred, PageSpeed fallback guaranteed</div>
          <div><strong>✅ Reliable Results:</strong> Works even if Railway fails completely</div>
          <div><strong>🔄 Future-Proof:</strong> Easy to extend with additional data sources</div>
        </div>
      </div>
    </div>
  );
}
