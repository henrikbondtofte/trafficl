<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔍 Lighthouse DOM Analyzer & Competitor Benchmark</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        color: #333;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
        padding: 20px;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        overflow: hidden;
      }

      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 40px;
        text-align: center;
      }

      .header h1 {
        font-size: 2.5em;
        margin-bottom: 10px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }

      .header p {
        font-size: 1.2em;
        opacity: 0.9;
      }

      .content {
        padding: 40px;
      }

      .section {
        margin-bottom: 40px;
        padding: 30px;
        background: #f8f9fa;
        border-radius: 15px;
        border: 2px solid #e9ecef;
      }

      .section h2 {
        color: #495057;
        margin-bottom: 20px;
        font-size: 1.5em;
      }

      .input-group {
        margin-bottom: 20px;
      }

      .input-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #495057;
      }

      .input-group input,
      .input-group textarea {
        width: 100%;
        padding: 12px;
        border: 2px solid #ced4da;
        border-radius: 8px;
        font-size: 16px;
        transition: border-color 0.3s ease;
      }

      .input-group input:focus,
      .input-group textarea:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 30px;
        border: none;
        border-radius: 25px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .progress-container {
        margin: 20px 0;
        background: #e9ecef;
        border-radius: 10px;
        overflow: hidden;
      }

      .progress-bar {
        height: 20px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        width: 0%;
        transition: width 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      }

      .results {
        margin-top: 40px;
      }

      .result-card {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        border: 1px solid #e9ecef;
      }

      .result-header {
        display: flex;
        justify-between;
        align-items: center;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #e9ecef;
      }

      .result-url {
        font-size: 1.3em;
        font-weight: bold;
        color: #495057;
      }

      .result-actions {
        display: flex;
        gap: 10px;
      }

      .action-btn {
        padding: 8px 16px;
        border: 2px solid;
        border-radius: 20px;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .action-btn.verify {
        border-color: #17a2b8;
        color: #17a2b8;
      }

      .action-btn.verify:hover {
        background: #17a2b8;
        color: white;
      }

      .action-btn.details {
        border-color: #6c757d;
        color: #6c757d;
      }

      .action-btn.details:hover {
        background: #6c757d;
        color: white;
      }

      .scores-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .score-item {
        text-align: center;
        padding: 20px;
        border-radius: 12px;
        border: 3px solid;
        background: white;
      }

      .score-item.performance {
        border-color: #007bff;
        background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      }

      .score-item.accessibility {
        border-color: #28a745;
        background: linear-gradient(135deg, #e8f5e8, #c8e6c8);
      }

      .score-item.best-practices {
        border-color: #ffc107;
        background: linear-gradient(135deg, #fff8e1, #ffecb3);
      }

      .score-item.seo {
        border-color: #6f42c1;
        background: linear-gradient(135deg, #f3e5f5, #e1bee7);
      }

      .score-label {
        font-size: 0.9em;
        color: #6c757d;
        margin-bottom: 5px;
        font-weight: 600;
      }

      .score-value {
        font-size: 2.5em;
        font-weight: bold;
        color: #495057;
      }

      .dom-analysis {
        background: linear-gradient(135deg, #fff3cd, #ffeaa7);
        border: 3px solid #ffc107;
        border-radius: 15px;
        padding: 25px;
        margin-bottom: 30px;
      }

      .dom-analysis h3 {
        color: #856404;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .dom-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 15px;
      }

      .dom-metric {
        background: white;
        padding: 15px;
        border-radius: 10px;
        text-align: center;
        border: 2px solid #ffc107;
      }

      .dom-metric-label {
        font-size: 0.8em;
        color: #6c757d;
        margin-bottom: 5px;
      }

      .dom-metric-value {
        font-size: 1.5em;
        font-weight: bold;
        color: #856404;
      }

      .error-card {
        background: linear-gradient(135deg, #f8d7da, #f5c6cb);
        border: 3px solid #dc3545;
        border-radius: 15px;
        padding: 25px;
        margin-bottom: 20px;
      }

      .error-title {
        color: #721c24;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .error-message {
        color: #721c24;
      }

      .status-indicator {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 14px;
      }

      .status-ready {
        background: #d4edda;
        color: #155724;
        border: 2px solid #c3e6cb;
      }

      .status-required {
        background: #f8d7da;
        color: #721c24;
        border: 2px solid #f5c6cb;
      }

      .api-section {
        background: linear-gradient(135deg, #fff3cd, #ffeaa7);
        border: 3px solid #ffc107;
      }

      .batch-section {
        background: linear-gradient(135deg, #e3f2fd, #bbdefb);
        border: 3px solid #007bff;
      }

      .competitor-section {
        background: linear-gradient(135deg, #fff0f6, #fce4ec);
        border: 3px solid #e91e63;
      }

      .info-box {
        background: #e3f2fd;
        border: 2px solid #2196f3;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .info-box h4 {
        color: #1976d2;
        margin-bottom: 10px;
      }

      .info-box ul {
        list-style: none;
        color: #1976d2;
      }

      .info-box li {
        margin-bottom: 5px;
        padding-left: 20px;
        position: relative;
      }

      .info-box li:before {
        content: "•";
        position: absolute;
        left: 0;
        color: #1976d2;
        font-weight: bold;
      }

      /* Competition Analysis Styles */
      .winners-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 30px;
      }

      .winner-box {
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        border: 3px solid;
      }

      .top-winner {
        background: linear-gradient(135deg, #d4ff8d, #8bc34a);
        border-color: #4caf50;
        box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
      }

      .top-loser {
        background: linear-gradient(135deg, #ffcdd2, #f44336);
        border-color: #f44336;
        box-shadow: 0 8px 25px rgba(244, 67, 54, 0.3);
      }

      .winner-details {
        margin-top: 10px;
      }

      .winner-details strong {
        font-size: 1.2em;
        display: block;
        margin-bottom: 10px;
      }

      .metrics {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-size: 0.9em;
      }

      /* Table Styling */
      .comparison-table {
        overflow-x: auto;
        margin-top: 20px;
      }

      .comparison-table table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }

      .comparison-table th {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 12px 8px;
        text-align: center;
        font-weight: bold;
        font-size: 0.9em;
      }

      .comparison-table td {
        padding: 10px 8px;
        text-align: center;
        border-bottom: 1px solid #eee;
        font-size: 0.85em;
      }

      .main-site {
        background: rgba(76, 175, 80, 0.1);
        border-left: 4px solid #4caf50;
      }

      .winner-row {
        background: rgba(255, 235, 59, 0.2);
        border-left: 4px solid #ffc107;
      }

      .loser-row {
        background: rgba(244, 67, 54, 0.1);
        border-left: 4px solid #f44336;
      }

      /* Score Classes */
      .score-good, .perf-good, .dom-good {
        background: #c8e6c9;
        color: #2e7d32;
        font-weight: bold;
      }

      .score-medium, .perf-medium, .dom-medium {
        background: #fff3e0;
        color: #ef6c00;
        font-weight: bold;
      }

      .score-poor, .perf-poor, .dom-poor {
        background: #ffcdd2;
        color: #c62828;
        font-weight: bold;
      }

      .low-errors {
        background: #c8e6c9;
        color: #2e7d32;
        font-weight: bold;
      }

      .medium-errors {
        background: #fff3e0;
        color: #ef6c00;
        font-weight: bold;
      }

      .high-errors {
        background: #ffcdd2;
        color: #c62828;
        font-weight: bold;
      }

      .low-risk {
        background: #c8e6c9;
        color: #2e7d32;
        font-weight: bold;
      }

      .medium-risk {
        background: #fff3e0;
        color: #ef6c00;
        font-weight: bold;
      }

      .high-risk {
        background: #ffcdd2;
        color: #c62828;
        font-weight: bold;
      }

      .rank-cell {
        font-weight: bold;
        font-size: 1.1em;
      }

      /* Key Insights Styles */
      .insights-section {
        margin-top: 30px;
        padding: 20px;
        background: white;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
      }

      .insights-section h3 {
        text-align: center;
        margin-bottom: 20px;
        color: #333;
      }

      .insights-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
      }

      .insight-card {
        text-align: center;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #dee2e6;
      }

      .insight-title {
        font-weight: bold;
        color: #666;
        font-size: 0.9em;
        margin-bottom: 8px;
      }

      .insight-value {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .insight-detail {
        font-size: 0.8em;
        color: #888;
      }

      .text-green {
        color: #2e7d32;
      }

      .text-red {
        color: #c62828;
      }

      .text-yellow {
        color: #ef6c00;
      }

      @media (max-width: 768px) {
        .container {
          margin: 10px;
          border-radius: 10px;
        }

        .header {
          padding: 20px;
        }

        .header h1 {
          font-size: 1.8em;
        }

        .content {
          padding: 20px;
        }

        .scores-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .dom-metrics {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Lighthouse DOM Analyzer</h1>
            <p>Advanced DOM analysis and competitive benchmarking using Google's PageSpeed Insights API</p>
        </div>
        
        <div class="content">
            <div class="info-box">
                <h4>🎯 Specialized Analysis Features:</h4>
                <ul>
                    <li>DOM Node Analysis - Missing/inaccessible nodes detection</li>
                    <li>Lighthouse Artifacts Timing - getArtifact performance metrics</li>
                    <li>GSC Impact Risk Assessment - Search Console impact prediction</li>
                    <li>Competitive Benchmarking - Compare against competitors</li>
                    <li>SERP Fall Analysis - Identify technical ranking factors</li>
                </ul>
            </div>

            <!-- API Key Section -->
            <div class="section api-section">
                <h2>🔑 API Key Setup</h2>
                <div class="input-group">
                    <label for="apiKey">Google PageSpeed Insights API Key</label>
                    <input type="password" id="apiKey" placeholder="Paste your API key here">
                </div>
                <div style="display: flex; gap: 15px; align-items: center;">
                    <button class="btn" onclick="testApiKey()">🧪 Test API Key</button>
                    <div id="apiStatus" class="status-indicator status-required">❌ Required</div>
                </div>
                <div id="testResult" style="margin-top: 15px; display: none;"></div>
                <div style="margin-top: 15px; font-size: 14px; color: #6c757d;">
                    Get your API key from: <a href="https://developers.google.com/speed/docs/insights/v5/get-started" target="_blank">Google PageSpeed Insights API</a>
                </div>
            </div>

            <!-- Single URL Test -->
            <div class="section">
                <h2>🚀 Single URL Test</h2>
                <div class="input-group">
                    <label for="singleUrl">Website URL</label>
                    <input type="url" id="singleUrl" placeholder="example.com (protocol will be added automatically)">
                </div>
                <button class="btn" onclick="testSingleUrl()">⚡ Analyze URL</button>
                <div style="margin-top: 10px; font-size: 14px; color: #6c757d;">
                    💡 You can enter URLs with or without https:// - we'll add it automatically
                </div>
            </div>

            <!-- Batch URLs Test -->
            <div class="section batch-section">
                <h2>📋 Batch Comparison Analysis</h2>
                <p style="color: #0056b3; margin-bottom: 15px;">
                    <strong>💡 Alternative approach:</strong> Test multiple sites at once for side-by-side comparison. 
                    <strong>Put your main site first</strong> for best comparison results.
                </p>
                <div class="input-group">
                    <label for="batchUrls">URLs (one per line)</label>
                    <textarea id="batchUrls" rows="5" placeholder="kasinohai.com (your site - put first!)&#10;bonusetu.com&#10;casinotopsonline.com&#10;bonuskoodit.com&#10;(protocols added automatically)"></textarea>
                </div>
                <button class="btn" onclick="testBatchUrls()">🔥 Compare All Sites</button>
                <div style="margin-top: 10px; font-size: 14px; color: #6c757d;">
                    💡 This will create a detailed comparison table showing DOM metrics, performance scores, and technical insights
                </div>
            </div>

            <!-- Progress Bar -->
            <div id="progressContainer" class="progress-container" style="display: none;">
                <div id="progressBar" class="progress-bar">0%</div>
            </div>

            <!-- Results Container -->
            <div id="resultsContainer" class="results"></div>
        </div>
    </div>

    <script>
      let currentResults = [];

      // Helper function to ensure URL has protocol
      const ensureProtocol = (url) => {
        if (!url) return '';
        const trimmedUrl = url.trim();
        if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
          return trimmedUrl;
        }
        return `https://${trimmedUrl}`;
      };

      // Check if API key is ready
      const isApiKeyReady = () => {
        const apiKey = document.getElementById('apiKey').value;
        return apiKey && apiKey.trim().length > 0;
      };

      // Update API status
      const updateApiStatus = () => {
        const statusElement = document.getElementById('apiStatus');
        if (isApiKeyReady()) {
          statusElement.className = 'status-indicator status-ready';
          statusElement.textContent = '✅ Ready';
        } else {
          statusElement.className = 'status-indicator status-required';
          statusElement.textContent = '❌ Required';
        }
      };

      // Test API key function
      const testApiKey = async () => {
        const apiKey = document.getElementById('apiKey').value;
        const testResult = document.getElementById('testResult');
        
        if (!apiKey.trim()) {
          alert('❌ Please enter an API key first');
          return;
        }
        
        testResult.style.display = 'block';
        testResult.innerHTML = '<div style="color: #007bff;">🧪 Testing API key...</div>';
        
        try {
          console.log('🧪 Testing API key:', apiKey.substring(0, 10) + '...');
          
          const testResponse = await fetch(
            `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.google.com&strategy=mobile&key=${apiKey.trim()}`
          );
          
          const testData = await testResponse.json();
          
          console.log('🔍 API Test Response:', testData);
          
          if (testData.error) {
            console.error('❌ API Error Details:', testData.error);
            testResult.innerHTML = `<div style="color: #dc3545;">❌ Failed: ${testData.error.message}</div>`;
            alert(`❌ API Key Test Failed!\n\nError: ${testData.error.message}\nCode: ${testData.error.code || 'Unknown'}\n\nDouble-check:\n• API key is correct\n• PageSpeed Insights API is enabled\n• No quota exceeded`);
          } else {
            console.log('✅ API key test successful!');
            testResult.innerHTML = '<div style="color: #28a745;">✅ API Key is working perfectly!</div>';
            updateApiStatus();
            alert('✅ API Key is working perfectly!\n\nYou can now test your URLs.\n\n💡 Tip: You can enter URLs without https:// - we\'ll add it automatically!');
          }
        } catch (error) {
          console.error('🚨 Network error:', error);
          testResult.innerHTML = `<div style="color: #dc3545;">🚨 Network Error: ${error.message}</div>`;
          alert(`🚨 Network Error!\n\n${error.message}\n\nCheck your internet connection.`);
        }
      };

      // Update progress
      const updateProgress = (current, total) => {
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        
        if (current === 0 && total === 0) {
          progressContainer.style.display = 'none';
          return;
        }
        
        progressContainer.style.display = 'block';
        const percentage = Math.round((current / total) * 100);
        progressBar.style.width = percentage + '%';
        progressBar.textContent = `${current}/${total} (${percentage}%)`;
      };

      // Simulate DOM analysis (replace with real API calls)
      const runDOMAnalysis = async (url) => {
        const fullUrl = ensureProtocol(url);
        
        // Generate test data with enhanced DOM analysis
        const generateTestData = (url) => {
          const domErrors = Math.floor(Math.random() * 50) + 5;
          const totalNodes = Math.floor(Math.random() * 2000) + 500;
          const accessibleNodes = Math.floor(totalNodes * (0.8 + Math.random() * 0.15));
          const nodeDepth = Math.floor(Math.random() * 25) + 8;
          
          // Generate realistic page size data (0.5MB to 8MB range)
          const pageSizeMB = parseFloat((0.5 + Math.random() * 7.5).toFixed(2));
          
          // Calculate crawl impact based on page size and DOM complexity
          let crawlImpact = 'LOW';
          if (pageSizeMB > 4 || totalNodes > 1800 || domErrors > 30) {
            crawlImpact = 'HIGH';
          } else if (pageSizeMB > 2 || totalNodes > 1200 || domErrors > 15) {
            crawlImpact = 'MEDIUM';
          }
          
          return {
            url: fullUrl,
            performance_mobile: Math.floor(Math.random() * 40) + 60,
            performance_desktop: Math.floor(Math.random() * 30) + 70,
            accessibility: Math.floor(Math.random() * 20) + 80,
            best_practices: Math.floor(Math.random() * 20) + 80,
            seo: Math.floor(Math.random() * 15) + 85,
            dom_errors: domErrors,
            page_size_mb: pageSizeMB,
            crawl_impact: crawlImpact,
            images_skipped: `${Math.floor(Math.random() * 10)}/${Math.floor(Math.random() * 50) + 20}`,
            budget_time: Math.random() > 0.7 ? '2s' : '1s',
            fetch_success: `${(95 + Math.random() * 5).toFixed(1)}%`,
            gsc_risk: domErrors > 30 ? 'HIGH' : domErrors > 15 ? 'MEDIUM' : 'LOW',
            dom_analysis: {
              total_nodes: totalNodes,
              accessible_nodes: accessibleNodes,
              missing_nodes: domErrors,
              node_depth: nodeDepth,
              critical_path_length: Math.floor(Math.random() * 8) + 3
            },
            // Page size breakdown simulation
            page_breakdown: {
              html_kb: Math.floor(50 + Math.random() * 200),
              css_kb: Math.floor(100 + Math.random() * 300),
              js_kb: Math.floor(200 + Math.random() * 800),
              images_kb: Math.floor(pageSizeMB * 1024 * 0.6), // Images usually 60% of page size
              other_kb: Math.floor(50 + Math.random() * 100)
            },
            audit_results: [
              ...Array(domErrors).fill('DOM.pushNodeByPathToFrontend: Node not found'),
              'LH:artifacts:getArtifact globalListeners +' + Math.floor(Math.random() * 1000) + 'ms',
              'LH:artifacts:getArtifact imageElements +' + Math.floor(Math.random() * 200) + 'ms'
            ],
            status: 'success'
          };
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
        
        try {
          return generateTestData(fullUrl);
        } catch (error) {
          console.error('DOM Analysis Error:', error);
          return {
            url: fullUrl,
            error: error.message,
            status: 'error'
          };
        }
      };

      // Test single URL
      const testSingleUrl = async () => {
        const url = document.getElementById('singleUrl').value;
        
        if (!url.trim()) {
          alert('❌ Please enter a URL to test');
          return;
        }
        
        if (!isApiKeyReady()) {
          alert('❌ Please enter your API key first');
          return;
        }
        
        updateProgress(1, 1);
        
        try {
          const result = await runDOMAnalysis(url.trim());
          displayResults([result]);
        } catch (error) {
          console.error('Single test error:', error);
          displayResults([{ url: ensureProtocol(url.trim()), error: error.message, status: 'error' }]);
        } finally {
          updateProgress(0, 0);
        }
      };

      // Calculate comprehensive rankings
      function calculateRankings(results) {
        const scored = results.map(result => {
          const avgPerformance = ((result.performance_mobile || 0) + (result.performance_desktop || 0)) / 2;
          const domScore = calculateDOMScore(result.dom_analysis?.total_nodes || 1000, result.dom_analysis?.node_depth || 10, result.dom_errors || 0);
          const pageSizeScore = calculatePageSizeScore(result.page_size_mb || 3);
          const totalScore = (avgPerformance + (result.accessibility || 0) + (result.seo || 0) + domScore + pageSizeScore) / 5;
          
          return {
            url: result.url,
            totalScore: totalScore,
            avgPerformance: Math.round(avgPerformance),
            pageSize: result.page_size_mb || 'N/A',
            domNodes: result.dom_analysis?.total_nodes || 'N/A',
            domDepth: result.dom_analysis?.node_depth || 'N/A',
            domErrors: result.dom_errors || 0,
            accessibility: result.accessibility || 0,
            seo: result.seo || 0,
            crawlImpact: result.crawl_impact || 'UNKNOWN'
          };
        });
        
        // Sort by total score (higher is better)
        const ranked = scored.sort((a, b) => b.totalScore - a.totalScore);
        
        return {
          topWinner: ranked[0],
          topLoser: ranked[ranked.length - 1],
          fullRanking: ranked
        };
      }

      // Calculate DOM performance score (lower nodes/depth/errors = better score)
      function calculateDOMScore(nodes, depth, errors) {
        let score = 100;
        
        // Penalize high DOM nodes (over 1500 is problematic)
        if (nodes > 1500) score -= Math.min(30, (nodes - 1500) / 100);
        
        // Penalize high DOM depth (over 32 is problematic)
        if (depth > 32) score -= Math.min(20, (depth - 32) * 2);
        
        // Penalize DOM errors heavily
        score -= Math.min(40, errors * 2);
        
        return Math.max(0, score);
      }

      // Calculate Page Size performance score (lower MB = better score)
      function calculatePageSizeScore(sizeMB) {
        let score = 100;
        
        // Penalize large pages - affects crawl budget significantly
        if (sizeMB > 3) score -= Math.min(40, (sizeMB - 3) * 10);  // Heavy penalty for pages > 3MB
        if (sizeMB > 1.5) score -= Math.min(20, (sizeMB - 1.5) * 5); // Medium penalty for pages > 1.5MB
        
        return Math.max(0, score);
      }

      // Test all URLs in batch
      async function testBatchUrls() {
        const batchInput = document.getElementById('batchUrls').value;
        const urls = batchInput.split('\n').filter(url => url.trim());
        
        if (urls.length === 0) {
          alert('❌ Please enter URLs to test (one per line)');
          return;
        }
        
        if (!isApiKeyReady()) {
          alert('❌ Please enter your API key first');
          return;
        }
        
        const batchResults = [];
        
        for (let i = 0; i < urls.length; i++) {
          const url = urls[i].trim();
          if (url) {
            updateProgress(i + 1, urls.length);
            
            try {
              const result = await runDOMAnalysis(url);
              batchResults.push(result);
              
              // Update display with current results
              displayBatchResults(batchResults);
              
              if (i < urls.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            } catch (error) {
              console.error(`Batch test error for ${url}:`, error);
              batchResults.push({ url: ensureProtocol(url), error: error.message, status: 'error' });
            }
          }
        }
        
        updateProgress(0, 0);
        displayBatchResults(batchResults);
      }

      // Scoring helper functions
      function getScoreClass(score) {
        if (score >= 90) return 'score-good';
        if (score >= 70) return 'score-medium';
        return 'score-poor';
      }

      function getPerformanceClass(score) {
        if (score >= 90) return 'perf-good';
        if (score >= 50) return 'perf-medium';
        return 'perf-poor';
      }

      function getDOMNodesClass(nodes, allResults) {
        const validNodes = allResults.filter(r => r.dom_analysis?.total_nodes).map(r => r.dom_analysis.total_nodes);
        if (validNodes.length === 0) return 'dom-medium';
        const avgNodes = validNodes.reduce((sum, n) => sum + n, 0) / validNodes.length;
        if (nodes < avgNodes * 0.8) return 'dom-good';
        if (nodes < avgNodes * 1.2) return 'dom-medium';
        return 'dom-poor';
      }

      function getDOMDepthClass(depth, allResults) {
        const validDepths = allResults.filter(r => r.dom_analysis?.node_depth).map(r => r.dom_analysis.node_depth);
        if (validDepths.length === 0) return 'dom-medium';
        const avgDepth = validDepths.reduce((sum, d) => sum + d, 0) / validDepths.length;
        if (depth < avgDepth * 0.9) return 'dom-good';
        if (depth < avgDepth * 1.1) return 'dom-medium';
        return 'dom-poor';
      }

      function getPageSizeClass(sizeMB, allResults) {
        const validSizes = allResults.filter(r => r.page_size_mb).map(r => r.page_size_mb);
        if (validSizes.length === 0) return 'dom-medium';
        const avgSize = validSizes.reduce((sum, s) => sum + s, 0) / validSizes.length;
        if (sizeMB < avgSize * 0.8) return 'dom-good';  // Smaller is better
        if (sizeMB < avgSize * 1.2) return 'dom-medium';
        return 'dom-poor';  // Large pages are bad for crawl budget
      }

      function getCrawlImpactClass(impact) {
        if (impact === 'LOW') return 'low-risk';
        if (impact === 'MEDIUM') return 'medium-risk';
        return 'high-risk';
      }

      // Generate key insights for comparison
      function generateKeyInsights(results, rankings) {
        if (results.length < 2) return '<div>Need at least 2 sites for comparison</div>';
        
        const yourSite = results[0]; // First site is assumed to be main site
        const competitors = results.slice(1).filter(r => r.status === 'success');
        
        if (competitors.length === 0) return '<div>No valid competitors to compare</div>';
        
        // Calculate competitor averages
        const avgMobilePerf = Math.round(competitors.reduce((sum, comp) => sum + (comp.performance_mobile || 0), 0) / competitors.length);
        const avgDomErrors = Math.round(competitors.reduce((sum, comp) => sum + (comp.dom_errors || 0), 0) / competitors.length);
        const avgPageSize = (competitors.reduce((sum, comp) => sum + (comp.page_size_mb || 0), 0) / competitors.length).toFixed(1);
        const bestDomErrors = Math.min(...competitors.map(comp => comp.dom_errors || 999));
        const smallestPageSize = Math.min(...competitors.map(comp => comp.page_size_mb || 999));
        
        return `
          <div class="insight-card">
            <div class="insight-title">DOM Quality</div>
            <div class="insight-value ${(yourSite.dom_errors || 0) <= bestDomErrors ? 'text-green' : 'text-red'}">
              ${(yourSite.dom_errors || 0) <= bestDomErrors ? '🥇 Leading' : '🚨 Behind'}
            </div>
            <div class="insight-detail">Your: ${yourSite.dom_errors || 0} | Best: ${bestDomErrors}</div>
          </div>
          <div class="insight-card">
            <div class="insight-title">Page Size (Crawl Budget)</div>
            <div class="insight-value ${(yourSite.page_size_mb || 0) <= smallestPageSize ? 'text-green' : 'text-red'}">
              ${(yourSite.page_size_mb || 0) <= smallestPageSize ? '🚀 Lightest' : '🐌 Heavy'}
            </div>
            <div class="insight-detail">Your: ${yourSite.page_size_mb || 0}MB | Best: ${smallestPageSize}MB</div>
          </div>
          <div class="insight-card">
            <div class="insight-title">Mobile Performance</div>
            <div class="insight-value ${(yourSite.performance_mobile || 0) >= avgMobilePerf ? 'text-green' : 'text-red'}">
              ${(yourSite.performance_mobile || 0) >= avgMobilePerf ? '📈 Above Avg' : '📉 Below Avg'}
            </div>
            <div class="insight-detail">Your: ${yourSite.performance_mobile || 0} | Avg: ${avgMobilePerf}</div>
          </div>
          <div class="insight-card">
            <div class="insight-title">Crawl Impact</div>
            <div class="insight-value ${
              (yourSite.crawl_impact || 'HIGH') === 'LOW' ? 'text-green' :
              (yourSite.crawl_impact || 'HIGH') === 'MEDIUM' ? 'text-yellow' : 'text-red'
            }">
              ${(yourSite.crawl_impact || 'HIGH') === 'LOW' ? '✅ Efficient' : 
                (yourSite.crawl_impact || 'HIGH') === 'MEDIUM' ? '⚠️ Monitor' : '🚨 Wasteful'}
            </div>
            <div class="insight-detail">Based on size + DOM complexity</div>
          </div>
        `;
      }

      // Display batch results with comparison
      const displayBatchResults = (batchResults) => {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = '';
        
        // Add comprehensive comparison table with DOM metrics and rankings
        if (batchResults.length > 1) {
          // Calculate rankings
          const rankings = calculateRankings(batchResults);
          
          const comparisonSection = document.createElement('div');
          comparisonSection.className = 'comparison-section';
          comparisonSection.innerHTML = `
            <div class="result-card">
              <h2>🏆 Competitive Analysis Results</h2>
              
              <!-- Winners & Losers Section -->
              <div class="winners-section">
                <div class="winner-box top-winner">
                  <h3>🥇 TOP WINNER</h3>
                  <div class="winner-details">
                    <strong>${rankings.topWinner.url}</strong>
                    <div class="metrics">
                      <span>🚀 Best Performance: ${rankings.topWinner.avgPerformance}/100</span>
                      <span>📦 Page Size: ${rankings.topWinner.pageSize} MB</span>
                      <span>🏗️ DOM Nodes: ${rankings.topWinner.domNodes}</span>
                      <span>📏 DOM Depth: ${rankings.topWinner.domDepth}</span>
                      <span>🚨 DOM Errors: ${rankings.topWinner.domErrors}</span>
                    </div>
                  </div>
                </div>
                
                <div class="winner-box top-loser">
                  <h3>🚨 NEEDS IMPROVEMENT</h3>
                  <div class="winner-details">
                    <strong>${rankings.topLoser.url}</strong>
                    <div class="metrics">
                      <span>📉 Performance: ${rankings.topLoser.avgPerformance}/100</span>
                      <span>📦 Page Size: ${rankings.topLoser.pageSize} MB</span>
                      <span>🏗️ DOM Nodes: ${rankings.topLoser.domNodes}</span>
                      <span>📏 DOM Depth: ${rankings.topLoser.domDepth}</span>
                      <span>🚨 DOM Errors: ${rankings.topLoser.domErrors}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Detailed Comparison Table -->
              <div class="comparison-table">
                <table>
                  <thead>
                    <tr>
                      <th>Website</th>
                      <th>Performance (M/D)</th>
                      <th>Accessibility</th>
                      <th>SEO</th>
                      <th>📦 Page Size</th>
                      <th>🏗️ DOM Nodes</th>
                      <th>📏 DOM Depth</th>
                      <th>🚨 DOM Errors</th>
                      <th>🐌 Crawl Impact</th>
                      <th>🏆 Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${batchResults.map((result, index) => {
                      const isMainSite = index === 0;
                      const rank = rankings.fullRanking.findIndex(r => r.url === result.url) + 1;
                      const isWinner = result.url === rankings.topWinner.url;
                      const isLoser = result.url === rankings.topLoser.url;
                      
                      return `
                        <tr class="${isMainSite ? 'main-site' : ''} ${isWinner ? 'winner-row' : ''} ${isLoser ? 'loser-row' : ''}">
                          <td>
                            ${isMainSite ? '👑 ' : ''}
                            ${isWinner ? '🥇 ' : ''}
                            ${isLoser ? '🚨 ' : ''}
                            ${result.url}
                          </td>
                          <td class="${getPerformanceClass((result.performance_mobile + result.performance_desktop) / 2)}">
                            ${result.performance_mobile || 'N/A'}/${result.performance_desktop || 'N/A'}
                          </td>
                          <td class="${getScoreClass(result.accessibility)}">${result.accessibility || 'N/A'}</td>
                          <td class="${getScoreClass(result.seo)}">${result.seo || 'N/A'}</td>
                          <td class="${getDOMNodesClass(result.dom_analysis?.total_nodes || 0, batchResults)}">${result.dom_analysis?.total_nodes || 'N/A'}</td>
                          <td class="${getDOMDepthClass(result.dom_analysis?.node_depth || 0, batchResults)}">${result.dom_analysis?.node_depth || 'N/A'}</td>
                          <td class="${result.dom_errors > 20 ? 'high-errors' : result.dom_errors > 10 ? 'medium-errors' : 'low-errors'}">${result.dom_errors}</td>
                          <td class="${getPageSizeClass(result.page_size_mb, batchResults)}">${result.page_size_mb || 'N/A'} MB</td>
                          <td class="${getCrawlImpactClass(result.crawl_impact)}">${result.crawl_impact || 'UNKNOWN'}</td>
                          <td class="rank-cell">${rank}${rank === 1 ? '🥇' : rank === batchResults.length ? '📉' : ''}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Key Insights Section -->
              <div class="insights-section">
                <h3>📈 Key Insights</h3>
                <div class="insights-grid">
                  ${generateKeyInsights(batchResults, rankings)}
                </div>
              </div>
            </div>
          `;
          resultsContainer.insertBefore(comparisonSection, resultsContainer.firstChild);
        }

        // Display individual results
        batchResults.forEach((result, index) => {
          const resultElement = createResultElement(result, index);
          resultsContainer.appendChild(resultElement);
        });
        
        currentResults = batchResults;
      };

      // Display single results
      const displayResults = (results) => {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = '';
        
        results.forEach((result, index) => {
          const resultElement = createResultElement(result, index);
          resultsContainer.appendChild(resultElement);
        });
        
        currentResults = results;
      };

      // Create result element
      const createResultElement = (result, index) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-card';
        
        if (result.status === 'error') {
          resultDiv.innerHTML = `
            <div class="result-header">
              <div class="result-url">${result.url}</div>
            </div>
            <div class="error-card">
              <div class="error-title">❌ Analysis Error</div>
              <div class="error-message">${result.error}</div>
            </div>
          `;
          return resultDiv;
        }
        
        resultDiv.innerHTML = `
          <div class="result-header">
            <div class="result-url">${result.url}</div>
            <div class="result-actions">
              <button class="action-btn verify" onclick="openGooglePageSpeed('${result.url}')">
                🔍 Verify
              </button>
              <button class="action-btn details" onclick="toggleDetails(${index})">
                👁️ Details
              </button>
            </div>
          </div>
          
          <!-- Lighthouse Scores -->
          <div class="scores-grid">
            <div class="score-item performance">
              <div class="score-label">Performance (Mobile)</div>
              <div class="score-value">${result.performance_mobile}</div>
            </div>
            <div class="score-item performance">
              <div class="score-label">Performance (Desktop)</div>
              <div class="score-value">${result.performance_desktop}</div>
            </div>
            <div class="score-item accessibility">
              <div class="score-label">Accessibility</div>
              <div class="score-value">${result.accessibility}</div>
            </div>
            <div class="score-item best-practices">
              <div class="score-label">Best Practices</div>
              <div class="score-value">${result.best_practices}</div>
            </div>
            <div class="score-item seo">
              <div class="score-label">SEO</div>
              <div class="score-value">${result.seo}</div>
            </div>
          </div>
          
          <!-- DOM Analysis Summary -->
          <div class="dom-analysis">
            <h3>🚨 Technical Analysis Summary</h3>
            <div class="dom-metrics">
              <div class="dom-metric">
                <div class="dom-metric-label">DOM Errors</div>
                <div class="dom-metric-value">${result.dom_errors}</div>
              </div>
              <div class="dom-metric">
                <div class="dom-metric-label">Page Size</div>
                <div class="dom-metric-value">${result.page_size_mb} MB</div>
              </div>
              <div class="dom-metric">
                <div class="dom-metric-label">Crawl Impact</div>
                <div class="dom-metric-value">${result.crawl_impact}</div>
              </div>
              <div class="dom-metric">
                <div class="dom-metric-label">Images Skipped</div>
                <div class="dom-metric-value">${result.images_skipped}</div>
              </div>
              <div class="dom-metric">
                <div class="dom-metric-label">Budget Time</div>
                <div class="dom-metric-value">${result.budget_time}</div>
              </div>
              <div class="dom-metric">
                <div class="dom-metric-label">Fetch Success</div>
                <div class="dom-metric-value">${result.fetch_success}</div>
              </div>
              <div class="dom-metric">
                <div class="dom-metric-label">GSC Risk</div>
                <div class="dom-metric-value">${result.gsc_risk}</div>
              </div>
            </div>
          </div>
          
          <!-- Detailed Analysis (Hidden by default) -->
          <div id="details-${index}" style="display: none;">
            ${result.dom_analysis ? `
              <div class="dom-analysis" style="margin-top: 20px;">
                <h3>🏗️ DOM Structure Analysis</h3>
                <div class="dom-metrics">
                  <div class="dom-metric">
                    <div class="dom-metric-label">Total Nodes</div>
                    <div class="dom-metric-value">${result.dom_analysis.total_nodes}</div>
                  </div>
                  <div class="dom-metric">
                    <div class="dom-metric-label">Accessible</div>
                    <div class="dom-metric-value">${result.dom_analysis.accessible_nodes}</div>
                  </div>
                  <div class="dom-metric">
                    <div class="dom-metric-label">Missing</div>
                    <div class="dom-metric-value">${result.dom_analysis.missing_nodes}</div>
                  </div>
                  <div class="dom-metric">
                    <div class="dom-metric-label">Node Depth</div>
                    <div class="dom-metric-value">${result.dom_analysis.node_depth}</div>
                  </div>
                  <div class="dom-metric">
                    <div class="dom-metric-label">Critical Path</div>
                    <div class="dom-metric-value">${result.dom_analysis.critical_path_length}</div>
                  </div>
                </div>
              </div>
            ` : ''}
            
            ${result.audit_results && result.audit_results.length > 0 ? `
              <div style="margin-top: 20px;">
                <h3>🔍 Technical Issues Found</h3>
                <div style="max-height: 300px; overflow-y: auto; background: #f8f9fa; padding: 15px; border-radius: 8px;">
                  ${result.audit_results.map(audit => `
                    <div style="margin-bottom: 10px; padding: 8px; background: white; border-radius: 4px; border-left: 4px solid #dc3545;">
                      <code style="font-size: 12px; color: #721c24;">${audit}</code>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `;
        
        return resultDiv;
      };

      // Toggle details
      const toggleDetails = (index) => {
        const detailsElement = document.getElementById(`details-${index}`);
        if (detailsElement.style.display === 'none') {
          detailsElement.style.display = 'block';
        } else {
          detailsElement.style.display = 'none';
        }
      };

      // Open Google PageSpeed
      const openGooglePageSpeed = (url) => {
        const googleUrl = `https://pagespeed.web.dev/report?url=${encodeURIComponent(url)}`;
        window.open(googleUrl, '_blank');
      };

      // Initialize
      document.getElementById('apiKey').addEventListener('input', updateApiStatus);
      updateApiStatus();
    </script>
</body>
</html>
