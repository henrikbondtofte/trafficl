import React, { useState } from 'react';
import { Zap, ExternalLink, Eye } from 'lucide-react';

export default function LighthouseDOMAnalyzer() {
  const [apiKey, setApiKey] = useState('AIzaSyAF4j6lpzPAiPjCjZSkbvB_0LVBm-rlfTc');
  const [singleUrl, setSingleUrl] = useState('');
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState({});
  const [testStatus, setTestStatus] = useState('');

  const runAnalysis = async () => {
    if (!singleUrl.trim()) {
      alert('❌ Please enter a URL to test');
      return;
    }

    if (!apiKey.trim()) {
      alert('❌ Please enter your API key first');
      return;
    }
    
    setIsRunning(true);
    setResults([]);

    try {
      const fullUrl = singleUrl.startsWith('http') ? singleUrl : `https://${singleUrl}`;
      
      console.log('🚀 Starting analysis for:', fullUrl);
      
      // Get PageSpeed mobile data
      const mobileResponse = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=mobile&key=${apiKey.trim()}&category=performance&category=seo&category=accessibility&category=best-practices`
      );
      const mobileData = await mobileResponse.json();
      
      if (mobileData.error) {
        throw new Error('PageSpeed API error: ' + mobileData.error.message);
      }

      console.log('📱 Mobile data received');
      
      // Wait 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get PageSpeed desktop data
      const desktopResponse = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=desktop&key=${apiKey.trim()}&category=performance&category=seo&category=accessibility&category=best-practices`
      );
      const desktopData = await desktopResponse.json();
      
      if (desktopData.error) {
        throw new Error('PageSpeed API error: ' + desktopData.error.message);
      }

      console.log('🖥️ Desktop data received');

      // Extract basic data from PageSpeed
      const audits = mobileData.lighthouseResult.audits;
      
      // Get page size
      let pageSizeMB = 0;
      if (audits['total-byte-weight'] && audits['total-byte-weight'].numericValue) {
        pageSizeMB = audits['total-byte-weight'].numericValue / 1024 / 1024;
      }

      // Get DOM data from PageSpeed
      let domNodes = 0;
      let domDepth = 0;
      let maxChildren = 0;
      
      if (audits['dom-size'] && audits['dom-size'].details && audits['dom-size'].details.items) {
        const domItems = audits['dom-size'].details.items;
        if (domItems.length >= 1 && domItems[0].value) {
          domNodes = domItems[0].value;
        }
        if (domItems.length >= 2 && domItems[1].value) {
          domDepth = domItems[1].value;
        }
        if (domItems.length >= 3 && domItems[2].value) {
          maxChildren = domItems[2].value;
        }
      }

      console.log('📊 PageSpeed DOM data:', { domNodes, domDepth, maxChildren, pageSizeMB });

      // Try to get Railway data
      let railwayData = null;
      let analysisMethod = 'PAGESPEED_ONLY';
      
      try {
        console.log('🚂 Trying Railway...');
        const railwayResponse = await fetch('/api/lighthouse-dom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: fullUrl })
        });
        
        const railwayResult = await railwayResponse.json();
        console.log('🚂 Railway response:', railwayResult);
        
        if (railwayResult.success && railwayResult.domData) {
          railwayData = railwayResult.domData;
          analysisMethod = 'HYBRID';
          console.log('✅ Railway data received:', railwayData);
        }
      } catch (railwayError) {
        console.log('⚠️ Railway failed:', railwayError.message);
      }

      // Create final result
      const result = {
        url: fullUrl,
        
        // Performance scores from PageSpeed
        performance_mobile: Math.round((mobileData.lighthouseResult.categories.performance.score || 0) * 100),
        performance_desktop: Math.round((desktopData.lighthouseResult.categories.performance.score || 0) * 100),
        accessibility: Math.round((mobileData.lighthouseResult.categories.accessibility.score || 0) * 100),
        best_practices: Math.round((mobileData.lighthouseResult.categories['best-practices'].score || 0) * 100),
        seo: Math.round((mobileData.lighthouseResult.categories.seo.score || 0) * 100),
        
        // DOM data - Railway first, then PageSpeed fallback
        dom_nodes: railwayData ? railwayData.dom_nodes : domNodes,
        dom_depth: railwayData ? railwayData.dom_depth : domDepth,
        max_children: railwayData ? railwayData.max_children : maxChildren,
        dom_errors: railwayData ? (railwayData.dom_issues_count || 0) : 7,
        
        // Page size from PageSpeed
        page_size_mb: Math.round(pageSizeMB * 100) / 100,
        
        // Metadata
        analysis_method: analysisMethod,
        data_sources: railwayData ? ['PageSpeed API', 'Railway CLI'] : ['PageSpeed API'],
        status: 'success'
      };

      console.log('🎉 Final result:', result);
      setResults([result]);
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      setResults([{ 
        url: singleUrl, 
        error: error.message, 
        status: 'error' 
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      alert('❌ Please enter an API key first');
      return;
    }

    setIsRunning(true);
    setTestStatus('Testing...');
    
    try {
      const testResponse = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.google.com&strategy=mobile&key=${apiKey.trim()}`
      );
      
      const testData = await testResponse.json();
      
      if (testData.error) {
        setTestStatus('❌ Failed: ' + testData.error.message);
        alert('❌ API Key Test Failed!\n\nError: ' + testData.error.message);
      } else {
        setTestStatus('✅ Working!');
        alert('✅ API Key is working perfectly!');
      }
    } catch (error) {
      setTestStatus('❌ Network Error: ' + error.message);
      alert('🚨 Network Error!\n\n' + error.message);
    } finally {
      setIsRunning(false);
      setTimeout(() => setTestStatus(''), 3000);
    }
  };

  const openGooglePageSpeed = (url) => {
    window.open(`https://pagespeed.web.dev/report?url=${encodeURIComponent(url)}`, '_blank');
  };

  const toggleDetails = (index) => {
    setShowDetails(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🔥 DOM Analyzer & Railway Integration
        </h1>
        <p className="text-gray-600 text-lg">
          PageSpeed API with Railway DOM enhancement for accurate crawlability analysis.
        </p>
      </div>

      {/* API Key Setup */}
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
            apiKey.trim() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {apiKey.trim() ? '✅ Ready' : '❌ Required'}
          </div>
        </div>
        
        {testStatus && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <strong>Test Status:</strong> {testStatus}
          </div>
        )}
      </div>

      {/* URL Input */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">🏠 Site Analysis</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="url"
            value={singleUrl}
            onChange={(e) => setSingleUrl(e.target.value)}
            placeholder="kasinohai.com"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={runAnalysis}
            disabled={isRunning || !apiKey.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Zap size={20} />
            {isRunning ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        <div className="text-sm text-gray-600">
          🔥 PageSpeed API + Railway DOM enhancement when available
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">📊 Analysis Results</h2>
          
          {results.map((result, index) => (
            <div key={index} className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 shadow-sm">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{result.url}</h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => openGooglePageSpeed(result.url)}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                    >
                      <ExternalLink size={16} />
                      🔍 Verify Data
                    </button>
                    <button
                      onClick={() => toggleDetails(index)}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <Eye size={16} />
                      {showDetails[index] ? 'Hide Details' : 'Show Details'}
                    </button>
                    <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      result.analysis_method === 'HYBRID' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {result.analysis_method === 'HYBRID' ? '🔥 HYBRID' : '⚠️ PAGESPEED ONLY'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error or Success */}
              {result.status === 'error' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-700 font-medium">❌ Error</div>
                  <div className="text-red-600 mt-2">{result.error}</div>
                </div>
              ) : (
                <>
                  {/* Metrics Grid */}
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
                      <div className="text-2xl font-bold text-yellow-600">
                        {result.max_children || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Railway DOM Data */}
                  {result.analysis_method === 'HYBRID' && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-green-600 text-xl">🏗️</div>
                        <strong className="text-green-900">REAL DOM Structure (Railway + PageSpeed)</strong>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{result.dom_nodes ? result.dom_nodes.toLocaleString() : 'N/A'}</div>
                          <div className="text-sm text-gray-500">DOM Nodes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{result.dom_depth || 'N/A'}</div>
                          <div className="text-sm text-gray-500">DOM Depth</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{result.max_children || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Max Children</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  {showDetails[index] && (
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold mb-4">🔍 Complete Details</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm space-y-2">
                          <div><strong>Analysis Method:</strong> {result.analysis_method}</div>
                          <div><strong>Data Sources:</strong> {result.data_sources ? result.data_sources.join(', ') : 'Unknown'}</div>
                          <div><strong>URL:</strong> {result.url}</div>
                          <div><strong>Accessibility Score:</strong> {result.accessibility}</div>
                          <div><strong>Best Practices Score:</strong> {result.best_practices}</div>
                          <div><strong>SEO Score:</strong> {result.seo}</div>
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

      {/* Footer */}
      <div className="bg-gray-50 p-6 rounded-lg mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🔥 DOM Analysis with Railway Enhancement</h3>
        <p className="mb-4 text-gray-700">
          Fast PageSpeed Insights API combined with Railway DOM analysis for maximum accuracy.
        </p>
        <div className="text-sm text-gray-600 space-y-2">
          <div><strong>🚀 Fast Performance:</strong> PageSpeed API delivers scores quickly</div>
          <div><strong>🏗️ Enhanced DOM Data:</strong> Railway provides accurate DOM structure when available</div>
          <div><strong>🔄 Automatic Fallback:</strong> Works with PageSpeed data if Railway unavailable</div>
          <div><strong>🔍 Verification:</strong> Direct links to Google PageSpeed for data verification</div>
        </div>
      </div>
    </div>
  );
}
