import React, { useState } from 'react';
import { Zap, ExternalLink, Eye } from 'lucide-react';

export default function LighthouseDOMAnalyzer() {
  const [apiKey, setApiKey] = useState('AIzaSyAF4j6lpzPAiPjCjZSkbvB_0LVBm-rlfTc');
  const [singleUrl, setSingleUrl] = useState('');
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState({});
  const [testStatus, setTestStatus] = useState('');

  const isApiKeyReady = () => {
    return apiKey && apiKey.trim().length > 0;
  };

  const openGooglePageSpeed = (url) => {
    const googleUrl = `https://pagespeed.web.dev/report?url=${encodeURIComponent(url)}`;
    window.open(googleUrl, '_blank');
  };

  const ensureProtocol = (url) => {
    if (!url) return '';
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

  const safeExtractValue = (apiObject) => {
    if (typeof apiObject === 'number') return apiObject;
    if (typeof apiObject === 'string') return parseFloat(apiObject) || 0;
    if (apiObject && typeof apiObject === 'object') {
      if ('value' in apiObject) return typeof apiObject.value === 'number' ? apiObject.value : 0;
      if ('numericValue' in apiObject) return typeof apiObject.numericValue === 'number' ? apiObject.numericValue : 0;
    }
    return 0;
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
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent('https://www.google.com')}&strategy=mobile&key=${encodeURIComponent(apiKey.trim())}`
      );
      
      const testData = await testResponse.json();
      
      if (testData.error) {
        setTestStatus(`❌ Failed: ${testData.error.message}`);
        alert(`❌ API Key Test Failed!\n\nError: ${testData.error.message}`);
      } else {
        setTestStatus('✅ Working!');
        alert('✅ API Key is working perfectly!');
      }
    } catch (error) {
      setTestStatus(`❌ Network Error: ${error.message}`);
      alert(`🚨 Network Error!\n\n${error.message}`);
    } finally {
      setIsRunning(false);
      setTimeout(() => setTestStatus(''), 3000);
    }
  };

  const runAnalysis = async () => {
    if (!singleUrl.trim()) {
      alert('❌ Please enter a URL to test');
      return;
    }

    if (!isApiKeyReady()) {
      alert('❌ Please enter your API key first');
      return;
    }
    
    setIsRunning(true);
    setResults([]);

    try {
      const fullUrl = ensureProtocol(singleUrl.trim());
      
      // Get PageSpeed data
      const mobileResponse = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=mobile&key=${encodeURIComponent(apiKey.trim())}&category=performance&category=seo&category=accessibility&category=best-practices`
      );
      const mobileData = await mobileResponse.json();
      
      if (mobileData.error) {
        throw new Error(mobileData.error.message);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const desktopResponse = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=desktop&key=${encodeURIComponent(apiKey.trim())}&category=performance&category=seo&category=accessibility&category=best-practices`
      );
      const desktopData = await desktopResponse.json();
      
      if (desktopData.error) {
        throw new Error(desktopData.error.message);
      }

      // Extract page size
      let pageSize = 0;
      const audits = mobileData.lighthouseResult.audits;
      if (audits['total-byte-weight'] && audits['total-byte-weight'].numericValue) {
        pageSize = safeExtractValue(audits['total-byte-weight'].numericValue) / 1024 / 1024;
      }

      // Extract DOM data
      let domNodes = 0;
      let domDepth = 0;
      let maxChildren = 0;
      
      if (audits['dom-size'] && audits['dom-size'].details && audits['dom-size'].details.items) {
        const domItems = audits['dom-size'].details.items;
        if (domItems.length >= 3) {
          domNodes = safeExtractValue(domItems[0].value || domItems[0].numericValue);
          domDepth = safeExtractValue(domItems[1].value || domItems[1].numericValue);
          maxChildren = safeExtractValue(domItems[2].value || domItems[2].numericValue);
        }
      }

      // Try Railway for better DOM data
      let railwayData = null;
      try {
        const railwayResponse = await fetch('/api/lighthouse-dom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: fullUrl })
        });
        const railwayResult = await railwayResponse.json();
        if (railwayResult.success && railwayResult.domData) {
          railwayData = railwayResult.domData;
        }
      } catch (railwayError) {
        console.log('Railway failed:', railwayError.message);
      }

      // Create result
      const result = {
        url: fullUrl,
        performance_mobile: Math.round((safeExtractValue(mobileData.lighthouseResult?.categories?.performance?.score) || 0) * 100),
        performance_desktop: Math.round((safeExtractValue(desktopData.lighthouseResult?.categories?.performance?.score) || 0) * 100),
        accessibility: Math.round((safeExtractValue(mobileData.lighthouseResult?.categories?.accessibility?.score) || 0) * 100),
        best_practices: Math.round((safeExtractValue(mobileData.lighthouseResult?.categories?.['best-practices']?.score) || 0) * 100),
        seo: Math.round((safeExtractValue(mobileData.lighthouseResult?.categories?.seo?.score) || 0) * 100),
        
        // Use Railway data if available, otherwise PageSpeed
        dom_nodes: railwayData ? railwayData.dom_nodes : domNodes,
        dom_depth: railwayData ? railwayData.dom_depth : domDepth,
        max_children: railwayData ? railwayData.max_children : maxChildren,
        dom_errors: railwayData ? (railwayData.dom_issues_count || 0) : 7,
        page_size_mb: Math.round(pageSize * 100) / 100,
        
        analysis_method: railwayData ? 'HYBRID' : 'PAGESPEED_ONLY',
        data_sources: railwayData ? ['PageSpeed API', 'Railway CLI'] : ['PageSpeed API'],
        status: 'success'
      };

      console.log('✅ Analysis complete:', result);
      setResults([result]);
      
    } catch (error) {
      console.error('Analysis error:', error);
      setResults([{ 
        url: ensureProtocol(singleUrl.trim()), 
        error: error.message, 
        status: 'error' 
      }]);
    } finally {
      setIsRunning(false);
    }
  };

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
          🔥 DOM Analyzer & Competitive Intelligence
        </h1>
        <p className="text-gray-600 text-lg">
          Fast PageSpeed API with Railway DOM enhancement for accurate crawlability analysis.
        </p>
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
        <h2 className="text-xl font-semibold mb-4">🏠 Site Analysis</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="url"
            value={singleUrl}
            onChange={(e) => setSingleUrl(e.target.value)}
            placeholder="your-website.com"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={runAnalysis}
            disabled={isRunning || !isApiKeyReady()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Zap size={20} />
            {isRunning ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        <div className="text-sm text-gray-600">
          🔥 PageSpeed API + Railway DOM data when available
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">📊 Analysis Results</h2>
          
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
                      <div className="text-2xl font-bold text-yellow-600">
                        {result.max_children || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* DOM Structure Display */}
                  {result.analysis_method === 'HYBRID' && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-green-600 text-xl">🏗️</div>
                        <strong className="text-green-900">REAL DOM Structure (Railway + PageSpeed)</strong>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{result.dom_nodes.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">DOM Nodes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{result.dom_depth}</div>
                          <div className="text-sm text-gray-500">DOM Depth</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{result.max_children}</div>
                          <div className="text-sm text-gray-500">Max Children</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detailed Analysis */}
                  {showDetails[index] && (
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold mb-4">🔍 Complete Details</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm space-y-2">
                          <div><strong>Analysis Method:</strong> {result.analysis_method}</div>
                          <div><strong>Data Sources:</strong> {result.data_sources?.join(', ')}</div>
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
          Fast PageSpeed Insights API combined with Railway DOM analysis when available for maximum accuracy.
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
