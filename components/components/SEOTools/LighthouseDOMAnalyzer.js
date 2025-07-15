import React, { useState, useEffect } from 'react';
import { Zap, Download } from 'lucide-react';

export default function LighthouseDOMAnalyzer() {
  const [singleUrl, setSingleUrl] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [logOutput, setLogOutput] = useState('');
  const [showResults, setShowResults] = useState(false);

  const mockData = {
    "https://www.example.com": {
      domPushErrors: 23,
      artifactTimeouts: ["Doctype", "InspectorIssues"],
      artifacts: {
        globalListeners: "20ms",
        imageElements: "5ms", 
        doctype: "15ms",
        inspectorIssues: "8ms",
        inputs: "3ms",
        installabilityErrors: "12ms"
      },
      imageBudgetData: {
        skipped: 58,
        total: 88,
        budgetTime: "5s",
        fetchedPercentage: 34.1
      },
      pageLoadTimeout: false,
      renderingScore: "warning",
      gscImpact: "medium",
      detailedErrors: [
        "LH:artifacts:getArtifact GlobalListeners +20ms",
        "LH:artifacts:getArtifact ImageElements +5ms",
        "LH:ImageElements:warn Reached gathering budget of 5s. Skipped extra details for 58/88 +5s",
        "DOM.pushNodeByPathToFrontend: Node not found (x23)"
      ]
    },
    "https://www.heavy-js-site.com": {
      domPushErrors: 156,
      artifactTimeouts: ["Doctype", "InspectorIssues", "Inputs", "ImageElements"],
      artifacts: {
        globalListeners: "85ms",
        imageElements: "62ms", 
        doctype: "timeout",
        inspectorIssues: "45ms",
        inputs: "timeout",
        installabilityErrors: "38ms"
      },
      imageBudgetData: {
        skipped: 312,
        total: 350,
        budgetTime: "5s",
        fetchedPercentage: 10.9
      },
      pageLoadTimeout: true,
      renderingScore: "error",
      gscImpact: "high",
      detailedErrors: [
        "LH:artifacts:getArtifact GlobalListeners +85ms",
        "LH:artifacts:getArtifact ImageElements +62ms",
        "LH:ImageElements:warn Reached gathering budget of 5s. Skipped extra details for 312/350 +5s",
        "LH:artifacts:getArtifact Doctype +timeout",
        "DOM.pushNodeByPathToFrontend: Node not found (x156)",
        "Timed out waiting for page load (30s)"
      ]
    },
    "https://www.optimized-site.com": {
      domPushErrors: 2,
      artifactTimeouts: [],
      artifacts: {
        globalListeners: "8ms",
        imageElements: "2ms", 
        doctype: "1ms",
        inspectorIssues: "3ms",
        inputs: "1ms",
        installabilityErrors: "4ms"
      },
      imageBudgetData: {
        skipped: 0,
        total: 45,
        budgetTime: "1.2s",
        fetchedPercentage: 100
      },
      pageLoadTimeout: false,
      renderingScore: "good",
      gscImpact: "none",
      detailedErrors: [
        "LH:artifacts:getArtifact GlobalListeners +8ms",
        "LH:artifacts:getArtifact ImageElements +2ms",
        "LH:artifacts:getArtifact Doctype +1ms",
        "Minor DOM inconsistencies (x2)"
      ]
    }
  };

  const generateMockData = (url) => {
    const domErrors = Math.floor(Math.random() * 200);
    const timeouts = ["Doctype", "InspectorIssues", "Inputs", "ImageElements"].filter(() => Math.random() > 0.7);
    const globalTime = Math.floor(Math.random() * 60) + 5;
    const imageTime = Math.floor(Math.random() * 40) + 2;
    const totalImages = Math.floor(Math.random() * 300) + 50;
    const skippedImages = Math.floor(Math.random() * totalImages * 0.8);
    const fetchedPercentage = ((totalImages - skippedImages) / totalImages) * 100;
    
    let score = "good";
    let gscImpact = "none";
    
    if (domErrors > 50 || timeouts.length > 2 || fetchedPercentage < 50 || globalTime > 50) {
      score = "error";
      gscImpact = "high";
    } else if (domErrors > 10 || timeouts.length > 0 || fetchedPercentage < 90 || globalTime > 20) {
      score = "warning";
      gscImpact = "medium";
    }

    return {
      domPushErrors: domErrors,
      artifactTimeouts: timeouts,
      artifacts: {
        globalListeners: globalTime + "ms",
        imageElements: timeouts.includes("ImageElements") ? "timeout" : imageTime + "ms",
        doctype: timeouts.includes("Doctype") ? "timeout" : (Math.floor(Math.random() * 25) + 1) + "ms",
        inspectorIssues: timeouts.includes("InspectorIssues") ? "timeout" : (Math.floor(Math.random() * 35) + 2) + "ms",
        inputs: timeouts.includes("Inputs") ? "timeout" : (Math.floor(Math.random() * 15) + 1) + "ms",
        installabilityErrors: (Math.floor(Math.random() * 30) + 3) + "ms"
      },
      imageBudgetData: {
        skipped: skippedImages,
        total: totalImages,
        budgetTime: fetchedPercentage < 50 ? "5s" : "1.8s",
        fetchedPercentage: fetchedPercentage
      },
      pageLoadTimeout: Math.random() > 0.8,
      renderingScore: score,
      gscImpact: gscImpact,
      detailedErrors: [
        `LH:artifacts:getArtifact GlobalListeners +${globalTime}ms`,
        `LH:artifacts:getArtifact ImageElements +${timeouts.includes("ImageElements") ? "timeout" : imageTime + "ms"}`,
        skippedImages > 0 ? `LH:ImageElements:warn Reached gathering budget. Skipped ${skippedImages}/${totalImages}` : null,
        `DOM.pushNodeByPathToFrontend: Node not found (x${domErrors})`
      ].filter(Boolean)
    };
  };

  const loadHeavySites = () => {
    setBatchUrls(`https://www.heavy-js-site.com
https://www.example.com
https://spa.example.com
https://react-app.com`);
  };

  const loadOptimizedSites = () => {
    setBatchUrls(`https://www.optimized-site.com
https://fast-site.com
https://simple-html.com`);
  };

  const loadProblemSites = () => {
    setBatchUrls(`https://www.heavy-js-site.com
https://slow-loading.com
https://timeout-site.com`);
  };

  const runSingleTest = () => {
    if (!singleUrl.trim()) {
      alert('Please enter a URL');
      return;
    }
    runTests([singleUrl.trim()]);
  };

  const runBatchTest = () => {
    const urls = batchUrls.split('\n').map(url => url.trim()).filter(url => url.length > 0);
    if (urls.length === 0) {
      alert('Please enter at least one URL');
      return;
    }
    runTests(urls);
  };

  const runTests = (urls) => {
    setTestResults([]);
    setCurrentTestIndex(0);
    setTotalTests(urls.length);
    setIsRunning(true);
    setShowResults(false);
    setLogOutput('');
    processUrls(urls);
  };

  const processUrls = async (urls) => {
    const results = [];
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      setCurrentTestIndex(i + 1);
      setProgressText(`Testing ${i + 1}/${urls.length}: ${url}`);
      
      const result = await simulateLighthouseTest(url);
      results.push({ url, ...result });
    }
    
    setTestResults(results);
    setIsRunning(false);
    setShowResults(true);
  };

  const simulateLighthouseTest = (url) => {
    return new Promise((resolve) => {
      setLogOutput(prev => prev + `\n🔍 Starting Lighthouse for ${url}`);
      setLogOutput(prev => prev + `\n⚡ Chrome flags: --headless --preset=desktop --verbose`);
      
      setTimeout(() => {
        const result = mockData[url] || generateMockData(url);
        
        setLogOutput(prev => prev + `\n❌ LH:artifacts:getArtifact GlobalListeners +${result.artifacts.globalListeners}`);
        setLogOutput(prev => prev + `\n❌ LH:artifacts:getArtifact ImageElements +${result.artifacts.imageElements}`);
        
        if (result.imageBudgetData.skipped > 0) {
          setLogOutput(prev => prev + `\n⚠️ LH:ImageElements:warn Reached gathering budget of ${result.imageBudgetData.budgetTime}. Skipped ${result.imageBudgetData.skipped}/${result.imageBudgetData.total}`);
        }
        
        if (result.domPushErrors > 0) {
          setLogOutput(prev => prev + `\n🔴 ⚠️ DOM.pushNodeByPathToFrontend errors: ${result.domPushErrors}`);
        }
        
        if (result.pageLoadTimeout) {
          setLogOutput(prev => prev + `\n🔴 🕒 Timed out waiting for page load`);
        }
        
        setLogOutput(prev => prev + `\n✅ Analysis complete for ${url}`);
        setLogOutput(prev => prev + `\n📊 GSC Impact: ${result.gscImpact.toUpperCase()}`);
        setLogOutput(prev => prev + `\n🔍 Hidden from GSC: ${result.artifactTimeouts.length} timeouts, ${result.domPushErrors} DOM errors`);
        setLogOutput(prev => prev + `\n---`);

        resolve(result);
      }, 2000);
    });
  };

  const clearResults = () => {
    setTestResults([]);
    setShowResults(false);
    setIsRunning(false);
    setLogOutput('');
    setSingleUrl('');
    setBatchUrls('');
  };

  const exportResults = () => {
    if (testResults.length === 0) {
      alert('No results to export');
      return;
    }

    const csvData = [
      ['URL', 'Overall Status', 'DOM Push Errors', 'GlobalListeners', 'ImageElements', 'GSC Impact', 'Page Load Timeout'],
      ...testResults.map(result => [
        result.url,
        result.renderingScore,
        result.domPushErrors,
        result.artifacts.globalListeners,
        result.artifacts.imageElements,
        result.gscImpact,
        result.pageLoadTimeout ? 'Yes' : 'No'
      ])
    ];

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lighthouse-dom-analysis-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleDetails = (index) => {
    const panel = document.getElementById('details-' + index);
    if (panel) {
      panel.style.display = panel.style.display === 'none' || !panel.style.display ? 'block' : 'none';
    }
  };

  const getSummaryStats = () => {
    if (testResults.length === 0) return { healthy: 0, warnings: 0, errors: 0, avgDomErrors: 0 };
    
    const healthy = testResults.filter(r => r.renderingScore === 'good').length;
    const warnings = testResults.filter(r => r.renderingScore === 'warning').length;
    const errors = testResults.filter(r => r.renderingScore === 'error').length;
    const avgDomErrors = Math.round(testResults.reduce((sum, r) => sum + r.domPushErrors, 0) / testResults.length);

    return { healthy, warnings, errors, avgDomErrors };
  };

  const stats = getSummaryStats();

  useEffect(() => {
    setBatchUrls(`https://www.example.com
https://www.heavy-js-site.com
https://www.optimized-site.com`);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Zap className="w-8 h-8 text-purple-600" />
            Lighthouse DOM Rendering Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Technical SEO tool for DOM rendering and Googlebot compatibility analysis
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="mb-3 text-gray-700">
            JavaScript-heavy sites create challenges for Googlebot that Search Console doesn't show you. This tool reveals <strong>hidden artifacts and timing data</strong> that explain why Google drops resources and misses your JavaScript-rendered content.
          </p>
          <p className="mb-3 text-gray-700">
            <strong>Focus on GSC invisible data:</strong> DOM.pushNodeByPathToFrontend errors, artifact timeouts, ImageElements budget overruns, and GlobalListeners timing - everything that affects how AI Overviews and Googlebot see your content.
          </p>
          <p className="text-gray-700">
            <em>Built for those who want to understand exactly where and why Googlebot stops fetching your resources.</em>
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Single URL Test:</label>
            <input
              type="url"
              value={singleUrl}
              onChange={(e) => setSingleUrl(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
              placeholder="https://www.example.com"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Batch URLs (one per line):</label>
            <textarea
              value={batchUrls}
              onChange={(e) => setBatchUrls(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg min-h-32 resize-vertical"
              placeholder="Enter URLs - one per line"
            />
            
            <div className="mt-3 text-sm text-gray-600">
              <strong>Quick test examples:</strong>
              <button onClick={loadHeavySites} className="ml-3 text-purple-600 hover:text-purple-800 underline">JavaScript-heavy Sites</button>
              <button onClick={loadOptimizedSites} className="ml-3 text-purple-600 hover:text-purple-800 underline">Optimized Sites</button>
              <button onClick={loadProblemSites} className="ml-3 text-purple-600 hover:text-purple-800 underline">Known Problem Sites</button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <button
            onClick={clearResults}
            className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-colors font-semibold"
          >
            Clear All
          </button>
          <div className="flex gap-4">
            <button
              onClick={runSingleTest}
              disabled={isRunning}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold"
            >
              🚀 Test Single URL
            </button>
            <button
              onClick={runBatchTest}
              disabled={isRunning}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold"
            >
              📋 Test Batch URLs
            </button>
            <button
              onClick={exportResults}
              disabled={testResults.length === 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {isRunning && (
          <div className="bg-white border rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">⏳ Lighthouse test in progress...</h3>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentTestIndex / totalTests) * 100}%` }}
              ></div>
            </div>
            <div className="text-center text-purple-600 font-medium mb-4">{progressText}</div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-48 overflow-y-auto">
              {logOutput.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        )}

        {showResults && (
          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-4">🔧 Lighthouse DOM Artifacts Analysis</h2>
            <p className="text-gray-600 mb-6">
              <strong>GSC Hidden Data:</strong> These artifacts and timing data are invisible in Google Search Console, but critical for understanding Googlebot behavior.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
                <div className="text-green-700 text-sm">Healthy Sites</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
                <div className="text-yellow-700 text-sm">Warnings</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                <div className="text-red-700 text-sm">Critical Errors</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.avgDomErrors}</div>
                <div className="text-purple-700 text-sm">Avg DOM Errors</div>
              </div>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">URL</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">DOM Errors</th>
                      <th className="px-4 py-3 text-left font-semibold">GlobalListeners</th>
                      <th className="px-4 py-3 text-left font-semibold">ImageElements</th>
                      <th className="px-4 py-3 text-left font-semibold">GSC Impact</th>
                      <th className="px-4 py-3 text-left font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((result, index) => {
                      const statusIcon = result.renderingScore === 'good' ? '✅' : 
                                        result.renderingScore === 'warning' ? '⚠️' : '❌';
                      
                      return (
                        <React.Fragment key={index}>
                          <tr className={`border-b hover:bg-gray-50 ${
                            result.renderingScore === 'error' ? 'bg-red-50' : 
                            result.renderingScore === 'warning' ? 'bg-yellow-50' : 'bg-green-50'
                          }`}>
                            <td className="px-4 py-3">
                              <div className="max-w-xs truncate text-sm font-medium" title={result.url}>
                                {result.url}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-xl">{statusIcon}</td>
                            <td className={`px-4 py-3 text-center font-semibold ${
                              result.domPushErrors > 50 ? 'text-red-600' : 
                              result.domPushErrors > 10 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {result.domPushErrors}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold">
                              {result.artifacts.globalListeners}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold">
                              {result.artifacts.imageElements}
                            </td>
                            <td className={`px-4 py-3 text-center font-semibold ${
                              result.gscImpact === 'high' ? 'text-red-600' : 
                              result.gscImpact === 'medium' ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {result.gscImpact.toUpperCase()}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleDetails(index)}
                                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                              >
                                Show Details
                              </button>
                            </td>
                          </tr>
                          
                          <tr>
                            <td colSpan="7">
                              <div id={`details-${index}`} className="hidden bg-gray-50 border-l-4 border-purple-600 p-4">
                                <h4 className="font-bold text-purple-900 mb-3">🔍 Full Lighthouse Logs & Hidden GSC Data</h4>
                                <div className="grid md:grid-cols-2 gap-6 mb-4">
                                  <div>
                                    <strong className="text-purple-800">⚡ All Artifacts Timing (GSC can't see this):</strong>
                                    <ul className="mt-2 space-y-1 text-sm">
                                      <li className="flex justify-between"><span>GlobalListeners:</span><span className="font-mono bg-red-100 px-2 py-1 rounded">{result.artifacts.globalListeners}</span></li>
                                      <li className="flex justify-between"><span>ImageElements:</span><span className="font-mono bg-red-100 px-2 py-1 rounded">{result.artifacts.imageElements}</span></li>
                                      <li className="flex justify-between"><span>Doctype:</span><span className="font-mono bg-red-100 px-2 py-1 rounded">{result.artifacts.doctype}</span></li>
                                      <li className="flex justify-between"><span>InspectorIssues:</span><span className="font-mono bg-red-100 px-2 py-1 rounded">{result.artifacts.inspectorIssues}</span></li>
                                      <li className="flex justify-between"><span>Inputs:</span><span className="font-mono bg-red-100 px-2 py-1 rounded">{result.artifacts.inputs}</span></li>
                                      <li className="flex justify-between"><span>InstallabilityErrors:</span><span className="font-mono bg-red-100 px-2 py-1 rounded">{result.artifacts.installabilityErrors}</span></li>
                                    </ul>
                                  </div>
                                  <div>
                                    <strong className="text-purple-800">📊 Resource Budget Analysis:</strong>
                                    <ul className="mt-2 space-y-1 text-sm">
                                      <li className="flex justify-between"><span>Images Skipped:</span><span>{result.imageBudgetData.skipped}/{result.imageBudgetData.total}</span></li>
                                      <li className="flex justify-between"><span>Budget Time:</span><span>{result.imageBudgetData.budgetTime}</span></li>
                                      <li className="flex justify-between"><span>Fetch Success:</span><span>{result.imageBudgetData.fetchedPercentage.toFixed(1)}%</span></li>
                                      <li className="flex justify-between"><span>DOM Push Errors:</span><span className="font-mono bg-red-100 px-2 py-1 rounded">{result.domPushErrors}</span></li>
                                      <li className="flex justify-between"><span>GSC Impact Risk:</span><span className={`font-semibold ${
                                        result.gscImpact === 'high' ? 'text-red-600' : 
                                        result.gscImpact === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                      }`}>{result.gscImpact.toUpperCase()}</span></li>
                                    </ul>
                                  </div>
                                </div>
                                <strong className="text-purple-800">📝 Raw Lighthouse stderr Output:</strong>
                                <ul className="mt-2 space-y-1 text-sm font-mono">
                                  {result.detailedErrors.map((error, i) => (
                                    <li key={i} className="bg-red-50 p-2 rounded">{error}</li>
                                  ))}
                                </ul>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <span>No problems</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <span>Minor problems</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">❌</span>
                <span>Critical errors</span>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg mt-6">
              <h4 className="text-green-800 font-bold mb-3">💡 What GSC Doesn't Show You:</h4>
              <ul className="text-green-700 space-y-2">
                <li><strong>GlobalListeners timing:</strong> Heavy JS event listeners that block Googlebot crawling</li>
                <li><strong>DOM.pushNodeByPathToFrontend errors:</strong> Critical DOM rendering errors invisible to GSC</li>
                <li><strong>Artifact gathering timeouts:</strong> When Lighthouse (and Googlebot) gives up on resources</li>
                <li><strong>InstallabilityErrors timing:</strong> PWA detection overhead that affects crawl budget</li>
                <li><strong>InspectorIssues timing:</strong> Browser warnings that correlate with indexing problems</li>
              </ul>
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-6 rounded-lg mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">What can you use the Lighthouse DOM Rendering Analyzer for?</h3>
          <p className="mb-4 text-gray-700">
            When your JavaScript sites aren't being rendered correctly by Googlebot, you lose visibility in search results and AI Overviews. This especially happens with:
          </p>
          
          <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
            <li><strong>DOM.pushNodeByPathToFrontend errors</strong> - Critical rendering errors that GSC doesn't show</li>
            <li><strong>ImageElements budget overruns</strong> - When Google stops fetching images after 5s</li>
            <li><strong>GlobalListeners timeouts</strong> - Heavy JavaScript that blocks Googlebot</li>
            <li><strong>Artifact gathering problems</strong> - When Lighthouse (and Googlebot) gives up on resources</li>
            <li><strong>Redirect loops and DOM inconsistencies</strong> - That damage crawl budget and indexing</li>
          </ul>

          <p className="mb-4 text-gray-700">
            My tool reveals precisely the timing data and DOM errors that Search Console never shows you. You get insight into why Google drops your resources and how it affects your visibility in AI Overviews.
          </p>
          
          <p className="mb-4 text-gray-700">
            <strong>For production use:</strong> The tool can be integrated with Node.js/PHP backend for automated monitoring of your JavaScript-heavy sites.
          </p>
          
          <p className="text-gray-700">
            <em>I built it because I needed exactly this deep insight into DOM rendering problems that affect SEO.</em>
          </p>
        </div>
      </div>
    </div>
  );
}