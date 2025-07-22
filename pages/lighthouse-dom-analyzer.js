// 🔥 LIGHTHOUSE DOM ANALYZER - FRONTEND COMPONENT WITH API KEY
// Find og erstatt din eksisterende lighthouse-dom-analyzer komponent

import React, { useState } from 'react';

const LighthouseDomAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState(null);

  // Test API Key function
  const testApiKey = async () => {
    if (!apiKey.trim()) {
      setKeyTestResult({ success: false, message: 'Please enter an API key' });
      return;
    }

    setIsTestingKey(true);
    setKeyTestResult(null);

    try {
      // Test API key with a simple PageSpeed call
      const testUrl = 'https://example.com';
      const response = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(testUrl)}&key=${apiKey}&strategy=mobile&category=performance`
      );
      
      const data = await response.json();
      
      if (response.ok && !data.error) {
        setKeyTestResult({ success: true, message: 'API key is valid!' });
      } else {
        setKeyTestResult({ 
          success: false, 
          message: data.error?.message || 'Invalid API key' 
        });
      }
    } catch (error) {
      setKeyTestResult({ 
        success: false, 
        message: 'Failed to test API key: ' + error.message 
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  // Main analysis function - SENDS API KEY TO BACKEND
  const analyzeWebsite = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysisResult(null);

    try {
      console.log('🔄 Starting analysis with API key:', apiKey.substring(0, 10) + '...');
      
      // CRITICAL: Send API key to backend
      const response = await fetch('/api/lighthouse-dom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: url.trim(),
          apiKey: apiKey.trim() // SEND USER'S API KEY
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.domData);
        console.log('✅ Analysis complete:', data.domData);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('❌ Analysis error:', error);
      setError('Network error: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* API KEY SECTION */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          🔑 API Key Setup
        </h3>
        
        <div className="flex gap-2 mb-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Google PageSpeed API key..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={testApiKey}
            disabled={isTestingKey}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isTestingKey ? 'Testing...' : 'Test Key'}
          </button>
        </div>
        
        {keyTestResult && (
          <div className={`text-sm mt-2 ${keyTestResult.success ? 'text-green-600' : 'text-red-600'}`}>
            {keyTestResult.success ? '✅' : '❌'} {keyTestResult.message}
          </div>
        )}
      </div>

      {/* MAIN ANALYSIS SECTION */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          🏠 Your Main Site Analysis
        </h3>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="kasinohai.com"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={analyzeWebsite}
            disabled={isAnalyzing || !apiKey.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing...' : '⚡ Hybrid Analysis'}
          </button>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          🔥 <strong>Hybrid analysis:</strong> Fast API performance + Accurate CLI DOM data (15-30 seconds total)
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="text-red-700">❌ {error}</div>
          </div>
        )}

        {isAnalyzing && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <div className="text-blue-700">
              🔄 Running hybrid analysis...
              <br />
              • Step 1: PageSpeed API for performance scores...
              <br />
              • Step 2: Lighthouse CLI for REAL DOM data...
            </div>
          </div>
        )}
      </div>

      {/* RESULTS SECTION */}
      {analysisResult && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            📊 Detailed Analysis Results
          </h3>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div className="text-sm text-blue-700">
              <strong>{analysisResult.url}</strong>
              <br />
              📡 <span className="text-blue-600">Verify Real Data</span> • 👁️ Show Details • 
              {analysisResult.analysis_method === 'RAILWAY_LIGHTHOUSE_CLI' ? (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs ml-2">
                  🔥 RAILWAY_LIGHTHOUSE_CLI
                </span>
              ) : (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs ml-2">
                  ⚠️ API ONLY
                </span>
              )}
            </div>
          </div>

          {/* METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Mobile Performance</div>
              <div className="text-2xl font-bold text-blue-600">{analysisResult.performance_mobile}</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Desktop Performance</div>
              <div className="text-2xl font-bold text-green-600">{analysisResult.performance_desktop}</div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">DOM Errors</div>
              <div className="text-2xl font-bold text-red-600">{analysisResult.dom_errors}</div>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Page Size</div>
              <div className="text-2xl font-bold text-purple-600">{analysisResult.page_size_mb}MB</div>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Max Children</div>
              <div className="text-2xl font-bold text-orange-600">
                {analysisResult.max_children || 'N/A'}
              </div>
            </div>
          </div>

          {/* DOM ANALYSIS DETAILS */}
          {analysisResult.dom_analysis && analysisResult.dom_analysis.total_nodes > 0 && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🏗️ DOM Analysis (Railway Lighthouse CLI)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Nodes:</span>
                  <span className="font-semibold ml-2">{analysisResult.dom_analysis.total_nodes}</span>
                </div>
                <div>
                  <span className="text-gray-600">Node Depth:</span>
                  <span className="font-semibold ml-2">{analysisResult.dom_analysis.node_depth}</span>
                </div>
                <div>
                  <span className="text-gray-600">Max Children:</span>
                  <span className="font-semibold ml-2">{analysisResult.dom_analysis.max_children}</span>
                </div>
                <div>
                  <span className="text-gray-600">Crawlability Score:</span>
                  <span className="font-semibold ml-2">{analysisResult.dom_analysis.crawlability_score || 'N/A'}</span>
                </div>
              </div>
              
              {analysisResult.dom_analysis.crawlability_penalties && analysisResult.dom_analysis.crawlability_penalties.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Crawlability Penalties:</span>
                  <ul className="text-sm text-red-600 mt-1">
                    {analysisResult.dom_analysis.crawlability_penalties.map((penalty, index) => (
                      <li key={index}>• {penalty}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* DATA SOURCES */}
          <div className="mt-4 text-xs text-gray-500">
            📡 Data sources: {analysisResult.data_sources?.join(', ')}
            <br />
            🕒 Analysis completed: {new Date().toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default LighthouseDomAnalyzer;
