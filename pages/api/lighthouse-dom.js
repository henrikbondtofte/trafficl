// 🔥 VERCEL-FIXED Lighthouse CLI API Route
// File: /pages/api/lighthouse-dom.js

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log('🔍 Running Lighthouse CLI for DOM analysis:', url);
    
    // Generate unique filename for this run - USE /tmp for Vercel
    const timestamp = Date.now();
    const outputPath = path.join('/tmp', `lighthouse-${timestamp}.json`);
    
    // NO mkdir needed - /tmp exists on Vercel
    console.log('📁 Output path:', outputPath);
    
    // Run Lighthouse CLI with JSON output for DOM data - Vercel compatible
    const lighthouseCommand = `npx lighthouse "${url}" --output json --output-path "${outputPath}" --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage --disable-gpu --disable-dev-tools --no-first-run --no-zygote --single-process" --preset=desktop --quiet --no-enable-error-reporting`;
    
    console.log('🚀 Executing Lighthouse CLI with Vercel-compatible flags...');
    
    // Execute Lighthouse CLI with increased timeout and memory
    await execAsync(lighthouseCommand, { 
      timeout: 120000, // 2 minutes
      maxBuffer: 1024 * 1024 * 50, // 50MB buffer
      env: {
        ...process.env,
        // Force Lighthouse to use system Chrome if available
        LIGHTHOUSE_CHROMIUM_PATH: '/usr/bin/google-chrome-stable',
        // Disable Lighthouse Chrome download
        LIGHTHOUSE_DISABLE_CHROMIUM_DOWNLOAD: 'true'
      }
    });
    
    console.log('📖 Reading Lighthouse report...');
    
    // Read the generated JSON report
    const reportData = await fs.readFile(outputPath, 'utf8');
    const lighthouseResults = JSON.parse(reportData);
    
    // Extract DOM data from full Lighthouse report
    const domData = extractDOMDataFromCLI(lighthouseResults);
    
    // Cleanup temp file
    try {
      await fs.unlink(outputPath);
      console.log('🗑️ Cleaned up temp file');
    } catch (cleanupError) {
      console.log('⚠️ Cleanup warning:', cleanupError.message);
    }
    
    console.log('✅ Lighthouse CLI DOM analysis complete:', domData);
    
    res.status(200).json({
      success: true,
      url: url,
      domData: domData,
      timestamp: new Date().toISOString(),
      vercelCompatible: true
    });
    
  } catch (error) {
    console.error('❌ Lighthouse CLI error:', error);
    
    // Enhanced error reporting for debugging
    const errorResponse = {
      success: false,
      error: error.message,
      url: url,
      details: 'Lighthouse CLI execution failed on Vercel',
      errorCode: error.code,
      errorType: error.constructor.name,
      suggestion: 'Check Vercel function logs for details'
    };

    // Add specific error handling
    if (error.message.includes('ENOENT')) {
      errorResponse.details = 'File/directory not found - Chrome browser missing';
      errorResponse.suggestion = 'Lighthouse requires Chrome browser which may not be available on Vercel';
    } else if (error.message.includes('timeout')) {
      errorResponse.details = 'Lighthouse execution timed out';
      errorResponse.suggestion = 'Try a simpler website or increase timeout';
    } else if (error.message.includes('spawn')) {
      errorResponse.details = 'Cannot spawn Chrome process';
      errorResponse.suggestion = 'Chrome/Chromium not available in Vercel environment';
    }
    
    res.status(500).json(errorResponse);
  }
}

// Extract REAL DOM data from Lighthouse CLI results
function extractDOMDataFromCLI(lighthouseResults) {
  console.log('🔍 Extracting DOM data from Lighthouse results...');
  
  const audits = lighthouseResults.audits;
  
  // Extract DOM size data - THIS IS THE REAL DATA!
  let domNodes = 0;
  let domDepth = 0;
  let maxChildren = 0;
  
  if (audits['dom-size'] && audits['dom-size'].details && audits['dom-size'].details.items) {
    const domItems = audits['dom-size'].details.items;
    console.log('📊 Found dom-size audit items:', domItems.length);
    
    // CLI gives us REAL structure:
    // items[0] = Total DOM elements  
    // items[1] = Maximum DOM depth
    // items[2] = Maximum child elements
    
    if (domItems[0] && domItems[0].value !== undefined) {
      domNodes = domItems[0].value;
      console.log('🏗️ DOM Nodes:', domNodes);
    }
    
    if (domItems[1] && domItems[1].value !== undefined) {
      domDepth = domItems[1].value;
      console.log('📏 DOM Depth:', domDepth);
    }
    
    if (domItems[2] && domItems[2].value !== undefined) {
      maxChildren = domItems[2].value;
      console.log('👶 Max Children:', maxChildren);
    }
  } else {
    console.log('⚠️ No dom-size audit data found');
  }
  
  // Fallback: try numericValue from dom-size
  if (domNodes === 0 && audits['dom-size'] && audits['dom-size'].numericValue) {
    domNodes = audits['dom-size'].numericValue;
    console.log('🏗️ DOM Nodes from numericValue:', domNodes);
  }
  
  // Extract additional DOM insights
  const mainDocumentDOMNodes = audits['dom-size']?.numericValue || domNodes;
  const domScore = audits['dom-size']?.score !== null ? audits['dom-size'].score : 1;
  
  // Extract performance timing
  const performanceMetrics = {
    fcp: audits['first-contentful-paint']?.numericValue || 0,
    lcp: audits['largest-contentful-paint']?.numericValue || 0,
    cls: audits['cumulative-layout-shift']?.numericValue || 0,
    tbt: audits['total-blocking-time']?.numericValue || 0,
    tti: audits['interactive']?.numericValue || 0,
    speed_index: audits['speed-index']?.numericValue || 0
  };
  
  // Extract critical DOM-related issues
  const domRelatedIssues = [];
  
  Object.keys(audits).forEach(auditKey => {
    const audit = audits[auditKey];
    if (audit.score !== null && audit.score < 0.9) {
      if (auditKey.includes('dom') || 
          auditKey.includes('render') || 
          auditKey.includes('layout') ||
          auditKey.includes('paint') ||
          auditKey.includes('blocking')) {
        domRelatedIssues.push({
          audit: auditKey,
          title: audit.title,
          score: audit.score,
          description: audit.description || 'No description available'
        });
      }
    }
  });
  
  console.log('🚨 Found DOM-related issues:', domRelatedIssues.length);
  
  // Calculate crawlability impact based on REAL data
  let crawlabilityScore = 100;
  
  // Penalize based on Google's thresholds
  if (domNodes > 1500) {
    const penalty = Math.min(30, (domNodes - 1500) / 100);
    crawlabilityScore -= penalty;
    console.log('📉 DOM nodes penalty:', penalty, '(total nodes:', domNodes + ')');
  }
  
  if (domDepth > 32) {
    const penalty = Math.min(20, (domDepth - 32) * 2);
    crawlabilityScore -= penalty;
    console.log('📉 DOM depth penalty:', penalty, '(depth:', domDepth + ')');
  }
  
  if (maxChildren > 60) {
    const penalty = Math.min(25, (maxChildren - 60));
    crawlabilityScore -= penalty;
    console.log('📉 Max children penalty:', penalty, '(max children:', maxChildren + ')');
  }
  
  if (domRelatedIssues.length > 5) {
    const penalty = domRelatedIssues.length * 2;
    crawlabilityScore -= penalty;
    console.log('📉 DOM issues penalty:', penalty);
  }
  
  crawlabilityScore = Math.max(0, Math.round(crawlabilityScore));
  
  const crawlabilityRisk = crawlabilityScore >= 80 ? 'LOW' : 
                          crawlabilityScore >= 60 ? 'MEDIUM' : 'HIGH';
  
  console.log('🎯 Final crawlability score:', crawlabilityScore, '- Risk:', crawlabilityRisk);
  
  return {
    // REAL DOM STRUCTURE DATA
    dom_nodes: domNodes,
    dom_depth: domDepth,
    max_children: maxChildren,
    main_document_nodes: mainDocumentDOMNodes,
    
    // DOM QUALITY METRICS
    dom_size_score: domScore,
    crawlability_score: crawlabilityScore,
    crawlability_risk: crawlabilityRisk,
    
    // PERFORMANCE IMPACT
    performance_metrics: performanceMetrics,
    
    // CRITICAL ISSUES
    dom_related_issues: domRelatedIssues,
    dom_issues_count: domRelatedIssues.length,
    
    // ADDITIONAL INSIGHTS
    google_lighthouse_version: lighthouseResults.lighthouseVersion,
    analysis_timestamp: new Date().toISOString(),
    
    // RENDER BLOCKING ANALYSIS
    render_blocking_resources: audits['render-blocking-resources']?.details?.items?.length || 0,
    unused_css: audits['unused-css-rules']?.details?.items?.length || 0,
    unused_js: audits['unused-javascript']?.details?.items?.length || 0,
    
    // VERCEL EXECUTION INFO
    vercel_execution: true,
    temp_file_path: '/tmp'
  };
}
