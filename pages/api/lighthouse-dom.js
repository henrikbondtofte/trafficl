// 🔥 VERCEL API - RAILWAY DOM INTEGRATION - WITH USER API KEY
// File: /pages/api/lighthouse-dom.js
// Combines PageSpeed API (with user's API key) + Railway Lighthouse (DOM data)

export const config = {
  maxDuration: 300 // 5 minutes for Pro plan
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, apiKey } = req.body; // RECEIVE USER'S API KEY
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  try {
    console.log('🔄 Starting HYBRID analysis for:', url);
    console.log('🔑 Using user API key:', apiKey.substring(0, 10) + '...');
    
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // STEP 1: Get DOM data from Railway Lighthouse service
    console.log('🏗️ Step 1: Getting REAL DOM data from Railway...');
    
    let railwayDOMData = null;
    let domDataSource = 'FAILED';
    
    try {
      console.log('🚀 Calling Railway with URL:', fullUrl);
      const railwayStartTime = Date.now();
      
      const railwayResponse = await fetch('https://lighthouse-dom-service-production.up.railway.app/dom-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Vercel-Function/1.0',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ url: fullUrl }),
        signal: AbortSignal.timeout(180000) // 3 minutes
      });
      
      const railwayResponseTime = Date.now() - railwayStartTime;
      console.log('🎯 Railway response time:', railwayResponseTime + 'ms');
      console.log('🎯 Railway response status:', railwayResponse.status);
      
      if (!railwayResponse.ok) {
        console.error('❌ Railway HTTP error:', railwayResponse.status, railwayResponse.statusText);
        throw new Error(`Railway HTTP ${railwayResponse.status}: ${railwayResponse.statusText}`);
      }
      
      const railwayResult = await railwayResponse.json();
      console.log('📦 Railway result success:', railwayResult.success);
      
      if (railwayResult.success) {
        railwayDOMData = railwayResult.domData;
        domDataSource = 'RAILWAY_LIGHTHOUSE_CLI';
        console.log('✅ Railway DOM data received:', {
          nodes: railwayDOMData.dom_nodes,
          depth: railwayDOMData.dom_depth,
          children: railwayDOMData.max_children,
          score: railwayDOMData.crawlability_score,
          risk: railwayDOMData.crawlability_risk
        });
      } else {
        console.log('⚠️ Railway DOM analysis failed:', railwayResult.error);
        domDataSource = 'RAILWAY_FAILED';
      }
    } catch (railwayError) {
      console.error('❌ Railway error:', railwayError.name, railwayError.message);
      
      if (railwayError.name === 'AbortError') {
        domDataSource = 'RAILWAY_TIMEOUT';
      } else if (railwayError.message.includes('fetch')) {
        domDataSource = 'RAILWAY_NETWORK_ERROR';
      } else {
        domDataSource = 'RAILWAY_UNAVAILABLE';
      }
    }
    
    // STEP 2: Get performance data from PageSpeed API with USER'S API KEY
    console.log('📱 Step 2: Getting performance scores from PageSpeed API with user key...');
    
    // BUILD PageSpeed URLs with user's API key
    const pagespeedBaseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
    const pagespeedParams = new URLSearchParams({
      url: fullUrl,
      key: apiKey, // USE USER'S API KEY
      category: 'performance',
      category: 'seo',
      category: 'accessibility',
      category: 'best-practices'
    });
    
    const mobileUrl = `${pagespeedBaseUrl}?${pagespeedParams}&strategy=mobile`;
    const desktopUrl = `${pagespeedBaseUrl}?${pagespeedParams}&strategy=desktop`;
    
    console.log('🔑 PageSpeed mobile URL:', mobileUrl.replace(apiKey, 'API_KEY_HIDDEN'));
    
    const [mobileResponse, desktopResponse] = await Promise.all([
      fetch(mobileUrl),
      new Promise(resolve => 
        setTimeout(() => 
          fetch(desktopUrl).then(resolve), 
          3000
        )
      )
    ]);
    
    console.log('📊 PageSpeed mobile status:', mobileResponse.status);
    console.log('📊 PageSpeed desktop status:', desktopResponse.status);
    
    const [mobileData, desktopData] = await Promise.all([
      mobileResponse.json(),
      desktopResponse.json()
    ]);
    
    if (mobileData.error) {
      console.error('❌ PageSpeed mobile error:', mobileData.error);
      throw new Error(`PageSpeed mobile API error: ${mobileData.error.message}`);
    }
    
    if (desktopData.error) {
      console.error('❌ PageSpeed desktop error:', desktopData.error);
      throw new Error(`PageSpeed desktop API error: ${desktopData.error.message}`);
    }
    
    // Extract PageSpeed data
    const lighthouse = mobileData.lighthouseResult;
    const pagespeedData = extractPageSpeedData(lighthouse);
    
    console.log('📦 PageSpeed data extracted:', {
      pageSize: pagespeedData.page_size_mb + 'MB',
      performanceMobile: Math.round((mobileData.lighthouseResult?.categories?.performance?.score || 0) * 100),
      performanceDesktop: Math.round((desktopData.lighthouseResult?.categories?.performance?.score || 0) * 100)
    });
    
    // STEP 3: Merge Railway DOM data + PageSpeed performance data
    const hybridResult = {
      url: fullUrl,
      
      // PERFORMANCE SCORES from PageSpeed API (with user's key)
      performance_mobile: Math.round((mobileData.lighthouseResult?.categories?.performance?.score || 0) * 100),
      performance_desktop: Math.round((desktopData.lighthouseResult?.categories?.performance?.score || 0) * 100),
      accessibility: Math.round((mobileData.lighthouseResult?.categories?.accessibility?.score || 0) * 100),
      best_practices: Math.round((mobileData.lighthouseResult?.categories?.['best-practices']?.score || 0) * 100),
      seo: Math.round((mobileData.lighthouseResult?.categories?.seo?.score || 0) * 100),
      
      // REAL DOM DATA from Railway (if available)
      dom_nodes: railwayDOMData ? railwayDOMData.dom_nodes : 0,
      dom_depth: railwayDOMData ? railwayDOMData.dom_depth : 0,
      max_children: railwayDOMData ? railwayDOMData.max_children : 0,
      dom_errors: railwayDOMData ? railwayDOMData.dom_issues_count || 0 : pagespeedData.dom_errors,
      
      // PAGE SIZE from PageSpeed API
      page_size_mb: pagespeedData.page_size_mb,
      
      // CRAWLABILITY from Railway (if available) or calculated
      crawl_impact: railwayDOMData ? 
        railwayDOMData.crawlability_risk : 
        calculateCrawlImpact(pagespeedData.page_size_mb, 0, 0),
      
      // GSC RISK
      gsc_risk: calculateGSCRisk(
        Math.round((mobileData.lighthouseResult?.categories?.performance?.score || 0) * 100)
      ),
      
      // CRITICAL ISSUES
      critical_issues: pagespeedData.critical_issues,
      
      // PERFORMANCE METRICS
      performance_metrics: pagespeedData.performance_metrics,
      resource_breakdown: pagespeedData.resource_breakdown,
      
      // DOM ANALYSIS (enhanced if Railway data available)
      dom_analysis: railwayDOMData ? {
        total_nodes: railwayDOMData.dom_nodes,
        node_depth: railwayDOMData.dom_depth,
        max_children: railwayDOMData.max_children,
        crawlability_score: railwayDOMData.crawlability_score,
        crawlability_penalties: railwayDOMData.crawlability_penalties || [],
        critical_path_length: Math.ceil(railwayDOMData.dom_depth / 3)
      } : {
        total_nodes: 0,
        node_depth: 0,
        max_children: 0,
        crawlability_score: null,
        critical_path_length: 0
      },
      
      // METADATA
      analysis_method: domDataSource,
      lighthouse_version: railwayDOMData ? 
        railwayDOMData.google_lighthouse_version : 
        'PageSpeed API only',
      data_sources: railwayDOMData ? 
        ['PageSpeed Insights API (User Key)', 'Railway Lighthouse CLI'] : 
        ['PageSpeed Insights API (User Key)'],
      api_key_used: true,
      
      status: 'success'
    };
    
    console.log('✅ HYBRID analysis complete with data source:', domDataSource);
    
    res.status(200).json({
      success: true,
      url: fullUrl,
      domData: hybridResult,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Hybrid analysis error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      url: url,
      details: 'Hybrid analysis failed'
    });
  }
}

// Extract PageSpeed API data  
function extractPageSpeedData(lighthouseResult) {
  const audits = lighthouseResult.audits;
  
  // Extract real page size
  let totalSizeKB = 0;
  let resourceBreakdown = {
    html_kb: 0,
    css_kb: 0,
    js_kb: 0,
    images_kb: 0,
    other_kb: 0
  };

  // Method 1: total-byte-weight audit
  if (audits['total-byte-weight']?.numericValue) {
    totalSizeKB = audits['total-byte-weight'].numericValue / 1024;
  }

  // Method 2: network-requests breakdown
  if (audits['network-requests']?.details?.items) {
    const networkRequests = audits['network-requests'].details.items;
    let networkTotal = 0;
    
    networkRequests.forEach(request => {
      const transferSize = request.transferSize || 0;
      const resourceSize = request.resourceSize || 0;
      const sizeToUse = Math.max(transferSize, resourceSize);
      networkTotal += sizeToUse / 1024;
      
      const url = request.url || '';
      const mimeType = request.mimeType || '';
      
      if (mimeType.includes('text/html') || url.includes('.html')) {
        resourceBreakdown.html_kb += sizeToUse / 1024;
      } else if (mimeType.includes('text/css') || url.includes('.css')) {
        resourceBreakdown.css_kb += sizeToUse / 1024;
      } else if (mimeType.includes('javascript') || url.includes('.js')) {
        resourceBreakdown.js_kb += sizeToUse / 1024;
      } else if (mimeType.includes('image/')) {
        resourceBreakdown.images_kb += sizeToUse / 1024;
      } else {
        resourceBreakdown.other_kb += sizeToUse / 1024;
      }
    });
    
    if (networkTotal > totalSizeKB) {
      totalSizeKB = networkTotal;
    }
  }

  // Extract performance metrics
  const performanceMetrics = {
    fcp: audits['first-contentful-paint']?.numericValue || 0,
    lcp: audits['largest-contentful-paint']?.numericValue || 0,
    cls: audits['cumulative-layout-shift']?.numericValue || 0,
    tbt: audits['total-blocking-time']?.numericValue || 0,
    speed_index: audits['speed-index']?.numericValue || 0
  };

  // Count PageSpeed audit failures  
  let domErrors = 0;
  let criticalIssues = [];
  
  Object.entries(audits).forEach(([auditKey, audit]) => {
    if (audit.score !== null && audit.score < 0.9) {
      if (auditKey.includes('dom') || 
          auditKey.includes('render') || 
          auditKey.includes('layout') ||
          auditKey.includes('contentful-paint') ||
          auditKey.includes('blocking')) {
        domErrors++;
        const title = audit.title || auditKey;
        criticalIssues.push(`${auditKey}: ${title}`);
      }
    }
  });

  return {
    page_size_mb: Math.round(totalSizeKB / 1024 * 100) / 100,
    dom_errors: domErrors,
    critical_issues: criticalIssues,
    performance_metrics: performanceMetrics,
    resource_breakdown: {
      html_kb: Math.round(resourceBreakdown.html_kb),
      css_kb: Math.round(resourceBreakdown.css_kb),
      js_kb: Math.round(resourceBreakdown.js_kb),
      images_kb: Math.round(resourceBreakdown.images_kb),
      other_kb: Math.round(resourceBreakdown.other_kb)
    }
  };
}

// Calculate crawl impact fallback
function calculateCrawlImpact(pageSizeMB, domNodes, maxChildren) {
  if (pageSizeMB > 4 || domNodes > 1800 || maxChildren > 60) {
    return 'HIGH';
  } else if (pageSizeMB > 2 || domNodes > 1200 || maxChildren > 40) {
    return 'MEDIUM';
  }
  return 'LOW';
}

// Calculate GSC risk
function calculateGSCRisk(performanceScore) {
  return performanceScore < 50 ? 'HIGH' : 
         performanceScore < 80 ? 'MEDIUM' : 'LOW';
}
