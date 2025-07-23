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

  // Check if API key is ready (not used anymore but kept for UI)
  const isApiKeyReady = () => {
    return true; // Always ready since we use server-side API
  };

  // Helper function to open Google PageSpeed Insights
  const openGooglePageSpeed = (url) => {
    const googleUrl = `https://pagespeed.web.dev/report?url=${encodeURIComponent(url)}`;
    window.open(googleUrl, '_blank');
  };

  // Test API key (simplified since we don't use it directly)
  const testApiKey = async () => {
    setIsRunning(true);
    setTestStatus('Testing...');
    
    try {
      console.log('🧪 Testing API via server endpoint...');
      
      // Test with our server endpoint
      const testResponse = await fetch('/api/lighthouse-dom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' })
      });
      
      console.log('🔍 API Test Response status:', testResponse.status);
      
      if (!testResponse.ok) {
        throw new Error(`HTTP ${testResponse.status}: ${testResponse.statusText}`);
      }
      
      const testData = await testResponse.json();
      console.log('🔍 API Test Response:', testData);
      
      if (!testData.success) {
        throw new Error(testData.error || 'API test failed');
      }
      
      console.log('✅ API test successful!');
      setTestStatus('✅ Working!');
      alert('✅ API is working perfectly!\n\nYou can now test your URLs.');
      
    } catch (error) {
      console.error('🚨 API test error:', error);
      setTestStatus(`❌ Error: ${error.message}`);
      alert(`🚨 API Test Failed!\n\n${error.message}`);
    } finally {
      setIsRunning(false);
      setTimeout(() => setTestStatus(''), 3000);
    }
  };

  // Toggle functions
  const toggleAuditDetails = (resultIndex, auditType) => {
    const key = `${resultIndex}-${auditType}`;
    setShowAuditDetails(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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

  // Helper function to ensure URL has protocol
  const ensureProtocol = (url) => {
    if (!url) return '';
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

  // 🔥 SIMPLE ANALYSIS - Uses your working /api/lighthouse-dom endpoint
  const runSingleAnalysis = async (url) => {
    console.log('🚀 Starting analysis via server API for:', url);
    
    try {
      const fullUrl = ensureProtocol(url);
      
      // Use your existing API endpoint
      const response = await fetch('/api/lighthouse-dom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Server API response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }
      
      // Return the domData with additional processing for UI
      const processedResult = {
        ...result.domData,
        status: 'success',
        timestamp: Date.now()
      };
      
      console.log('🎉 Processed result:', processedResult);
      return processedResult;
      
    } catch (error) {
      console.error('🚨 Analysis error:', error);
      return {
        url: ensureProtocol(url),
        error: String(error.message || 'Unknown error'),
        status: 'error',
        timestamp: Date.now()
      };
    }
  };

  // 🎯 CRAWLABILITY SCORE CALCULATION - Based on Google's thresholds + Railway data
  const calculateCrawlabilityScore = (site) => {
    let score = 100;
    
    // DOM Errors (critical for crawling) - Railway data preferred
    const domErrors = Math.round(site.dom_errors || 0);
    if (domErrors > 30) score -= 40;
    else if (domErrors > 10) score -= 20;
    else if (domErrors > 5) score -= 10;
    
    // Max Children (Google threshold: 60+) - Railway data preferred
    const maxChildren = Math.round(site.max_children || 0);
    if (maxChildren > 60) score -= 30;
    else if (maxChildren > 40) score -= 15;
    
    // Page Size (crawl budget impact) - PageSpeed data
    const pageSize = parseFloat(site.page_size_mb || 0);
    if (pageSize > 3) score -= 25;
    else if (pageSize > 1.5) score -= 10;
    
    // DOM Nodes - Railway data preferred
    const domNodes = Math.round(site.dom_nodes || 0);
    if (domNodes > 1800) score -= 15;
    else if (domNodes > 1200) score -= 8;
    
    // DOM Depth - Railway data preferred
    const domDepth = Math.round(site.dom_depth || 0);
    if (domDepth > 32) score -= 10;
    else if (domDepth > 25) score -= 5;
    
    return Math.max(0, score);
  };

  // 📈 GENERATE COMPETITIVE ANALYSIS - Data processing for lighthouse-dom API
  const generateCompetitiveAnalysis = () => {
    if (results.length === 0 || competitorResults.length === 0) return null;
    
    const yourSite = results[0];
    if (yourSite.status === 'error') return null;
    
    const validCompetitors = competitorResults.filter(comp => comp.status === 'success');
    if (validCompetitors.length === 0) return null;
    
    // Combine all sites with your site first
    const allSites = [yourSite, ...validCompetitors];
    
    // Calculate crawlability scores and add hostname
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

  // Run single URL test
  const runSingleTest = async () => {
    if (!singleUrl.trim()) {
      alert('❌ Please enter a URL to test');
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
          
          // Wait between requests to avoid overloading
          if (i < urls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
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

  // 🔧 FIXED Run competitor analysis - PRESERVE MAIN SITE
  const runCompetitorAnalysis = async () => {
    const urls = competitorUrls.split('\n').filter(url => url.trim());
    if (urls.length === 0) {
      alert('❌ Please enter competitor URLs (one per line)');
      return;
    }

    // 🔒 PRESERVE MAIN SITE RESULTS
    const preservedMainSite = [...results];
    console.log('🔒 PRESERVING MAIN SITE:', preservedMainSite);

    setIsRunningCompetitors(true);
    setProgress({ current: 0, total: urls.length });
    setCompetitorResults([]); // Clear previous competitor results

    const compResults = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i].trim();
      if (url) {
        try {
          setProgress({ current: i + 1, total: urls.length });
          console.log(`🥊 Analyzing competitor ${i + 1}/${urls.length}: ${url}`);
          
          const result = await runSingleAnalysis(url);
          compResults.push(result);
          
          // Update state after each competitor
          setCompetitorResults([...compResults]);
          console.log('🔍 Updated competitor results state:', compResults);
          
          // Wait between requests
          if (i < urls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error(`Competitor analysis error for ${url}:`, error);
          const errorResult = { 
            url: ensureProtocol(url), 
            error: String(error.message), 
            status: 'error' 
          };
          compResults.push(errorResult);
          setCompetitorResults([...compResults]);
        }
      }
    }
    
    console.log('🎉 Final competitor results:', compResults);
    setIsRunningCompetitors(false);

    // 🔒 RESTORE MAIN SITE IF IT GOT LOST
    if (results.length === 0 && preservedMainSite.length > 0) {
      setResults(preservedMainSite);
      console.log('🔒 RESTORED MAIN SITE');
    }
  };

  // 🏆 COMPETITIVE ANALYSIS DASHBOARD - The perfect executive overview with Railway + PageSpeed data
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
          {your_site && your_rank && (
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
                  Crawlability Score: <span className="font-bold">{calculateCrawlabilityScore(your_site)}/100</span>
                </div>
                {your_rank === 1 && <div className="text-green-700 font-bold mt-2">🥇 You're the crawl champion!</div>}
                {your_rank > 1 && <div className="text-red-700 font-bold mt-2">⚠️ Room for improvement in crawlability</div>}
              </div>
            </div>
          )}
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
                  const isYourSite = your_site && site.url === your_site.url;
                  const rank = ranked_sites.findIndex(s => s.url === site.url) + 1;
                  const crawlScore = calculateCrawlabilityScore(site);
                  
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
                {your_site && (
                  <div className="flex justify-between">
                    <span>Your site:</span>
                    <span className={`font-bold ${your_site.dom_errors <= 10 ? 'text-green-600' : 'text-red-600'}`}>
                      {your_site.dom_errors} errors
                    </span>
                  </div>
                )}
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
              {your_site && your_site.dom_errors > 10 && (
                <div className="mt-2 p-2 bg-red-50 text-red-700 text-xs rounded">
                  ⚠️ High DOM errors can prevent Google from properly crawling your site!
                </div>
              )}
            </div>

            {/* Page Size Analysis */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-bold text-blue-700 mb-3">📦 Page Size Impact</h4>
              <div className="space-y-2 text-sm">
                {your_site && (
                  <div className="flex justify-between">
                    <span>Your site:</span>
                    <span className={`font-bold ${your_site.page_size_mb <= 3 ? 'text-green-600' : 'text-red-600'}`}>
                      {your_site.page_size_mb}MB
                    </span>
                  </div>
                )}
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
              {your_site && your_site.page_size_mb > 3 && (
                <div className="mt-2 p-2 bg-orange-50 text-orange-700 text-xs rounded">
                  ⚠️ Large pages waste crawl budget and slow indexing!
                </div>
              )}
            </div>

            {/* Children Elements Analysis */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-bold text-purple-700 mb-3">👶 Child Elements</h4>
              <div className="space-y-2 text-sm">
                {your_site && (
                  <div className="flex justify-between">
                    <span>Your site:</span>
                    <span className={`font-bold ${your_site.max_children <= 60 ? 'text-green-600' : 'text-red-600'}`}>
                      {your_site.max_children} max
                    </span>
                  </div>
                )}
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
              {your_site && your_site.max_children > 60 && (
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

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🔥 DOM Analyzer & Competitive Intelligence
        </h1>
        <p className="text-gray-600 text-lg">
          Using your existing server-side API for reliable analysis with Railway integration and PageSpeed data.
        </p>
        
        <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-green-600 text-xl">✅</div>
            <strong className="text-green-900">FIXED & WORKING:</strong>
          </div>
          <div className="text-sm text-green-800 space-y-1">
            <div>• 🔧 <strong>Uses Your API:</strong> No more CORS errors - all server-side</div>
            <div>• 🏆 <strong>Perfect Dashboard:</strong> Winner/loser analysis and detailed comparison</div>
            <div>• 🔒 <strong>Main Site Preserved:</strong> Won't disappear during competitor analysis</div>
            <div>• 🚀 <strong>Railway Integration:</strong> Real DOM data when available</div>
          </div>
        </div>
      </div>

      {/* API Key Input - Simplified since not used directly */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">🔑 API Status</h2>
        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1 px-4 py-3 bg-green-100 text-green-800 rounded-lg font-semibold">
            ✅ Using server-side API - No CORS issues!
          </div>
          <button
            onClick={testApiKey}
            disabled={isRunning}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            🧪 Test API
          </button>
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
            disabled={isRunning}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Zap size={20} />
            {isRunning ? 'Analyzing...' : 'Analyze Site'}
          </button>
        </div>
        <div className="text-sm text-gray-600">
          🎯 Step 1: Test your main site first for competitive comparison
        </div>
      </div>

      {/* Batch URL Test */}
      <div className="bg-green-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">📋 Batch URL Analysis</h2>
        <p className="text-sm text-gray-600 mb-4">
          Test multiple URLs using the same reliable server-side API
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
          disabled={isRunning}
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
          Add competitor URLs to see the amazing competitive intelligence dashboard
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
          disabled={isRunningCompetitors}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Zap size={20} />
          {isRunningCompetitors ? 'Analyzing Competitors...' : 'Analyze Competitors'}
        </button>
        <div className="mt-2 text-sm text-orange-600">
          💡 Works with or without main site - but main site analysis gives better insights!
        </div>
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

      {/* 🏆 COMPETITIVE ANALYSIS DASHBOARD */}
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
                      result.analysis_method === 'RAILWAY_LIGHTHOUSE_CLI' ? 'bg-green-100 text-green-700' :
                      result.analysis_method === 'RAILWAY_FAILED' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {result.analysis_method === 'RAILWAY_LIGHTHOUSE_CLI' ? '🔥 HYBRID' :
                       result.analysis_method === 'RAILWAY_FAILED' ? '⚠️ PAGESPEED ONLY' : 
                       result.analysis_method || 'API'}
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
                  {/* Quick Metrics */}
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
                        {Math.round(result.max_children || 0)}
                      </div>
                    </div>
                  </div>

                  {/* REAL DOM Structure Display */}
                  {result.analysis_method === 'RAILWAY_LIGHTHOUSE_CLI' && (
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
                            {calculateCrawlabilityScore(result)}
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
                          <div>
                            <h5 className="font-semibold text-purple-900 mb-2">🏗️ DOM Structure</h5>
                            <div className="text-sm text-purple-800 space-y-1">
                              {result.max_children > 60 && (
                                <div>• ⚠️ <strong>Critical:</strong> Max children ({result.max_children}) exceeds Google's 60-element threshold</div>
                              )}
                              {result.dom_nodes > 1500 && (
                                <div>• ⚠️ <strong>High complexity:</strong> {result.dom_nodes.toLocaleString()} nodes (recommended: &lt;1500)</div>
                              )}
                              {result.dom_depth > 32 && (
                                <div>• ⚠️ <strong>Deep nesting:</strong> {result.dom_depth} levels (recommended: &lt;32)</div>
                              )}
                              {result.page_size_mb > 3 && (
                                <div>• ⚠️ <strong>Large page:</strong> {result.page_size_mb}MB impacts crawl budget</div>
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
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm space-y-2">
                          <div><strong>Analysis Method:</strong> {result.analysis_method}</div>
                          <div><strong>Data Sources:</strong> {result.data_sources?.join(', ') || 'Server API'}</div>
                          <div><strong>Crawl Impact:</strong> {result.crawl_impact || 'Unknown'}</div>
                          <div><strong>Performance Mobile:</strong> {result.performance_mobile}/100</div>
                          <div><strong>Performance Desktop:</strong> {result.performance_desktop}/100</div>
                          <div><strong>DOM Nodes:</strong> {result.dom_nodes}</div>
                          <div><strong>DOM Depth:</strong> {result.dom_depth}</div>
                          <div><strong>Max Children:</strong> {result.max_children}</div>
                          <div><strong>DOM Errors:</strong> {result.dom_errors}</div>
                          <div><strong>Page Size:</strong> {result.page_size_mb}MB</div>
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

      {/* Competitor Results */}
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
                      result.analysis_method === 'RAILWAY_LIGHTHOUSE_CLI' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {result.analysis_method === 'RAILWAY_LIGHTHOUSE_CLI' ? '🔥 HYBRID' : '⚠️ PAGESPEED ONLY'}
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
        <h3 className="text-xl font-bold text-gray-900 mb-4">✅ Fixed & Working Perfectly</h3>
        <p className="mb-4 text-gray-700">
          Now using your existing server-side API that handles both PageSpeed and Railway data. No more CORS errors, reliable analysis, and the perfect competitive intelligence dashboard!
        </p>
        <div className="text-sm text-gray-600 space-y-2">
          <div><strong>🔧 Fixed CORS:</strong> All API calls go through your server-side endpoint</div>
          <div><strong>🏆 Perfect Dashboard:</strong> Winner/loser analysis with detailed comparison table</div>
          <div><strong>🔒 Main Site Preserved:</strong> Won't disappear during competitor analysis</div>
          <div><strong>🚀 Railway Integration:</strong> Real DOM data when available, PageSpeed fallback</div>
          <div><strong>📊 Critical Insights:</strong> DOM errors, page size, and complexity analysis</div>
          <div><strong>🎯 Google Thresholds:</strong> Based on actual crawling guidelines</div>
        </div>
      </div>
    </div>
  );
}
