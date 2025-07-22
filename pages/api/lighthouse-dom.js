// 🔥 VERCEL API - RAILWAY PROXY ONLY
// File: /pages/api/lighthouse-dom.js  
// ONLY calls Railway for DOM data - PageSpeed handled by frontend

export const config = {
  maxDuration: 300 // 5 minutes for Pro plan
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, apiKey } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log('🚀 Railway proxy for URL:', url);
    
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // ONLY CALL RAILWAY - NO PAGESPEED HERE!
    console.log('🏗️ Calling Railway Lighthouse service...');
    
    let railwayDOMData = null;
    let domDataSource = 'RAILWAY_FAILED';
    
    try {
      console.log('🚀 Railway endpoint:', 'https://lighthouse-dom-service-production.up.railway.app/dom-analysis');
      console.log('🚀 Railway request payload:', { url: fullUrl });
      
      const railwayStartTime = Date.now();
      
      const railwayResponse = await fetch('https://lighthouse-dom-service-production.up.railway.app/dom-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Vercel-Function/1.0',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ url: fullUrl }),
        // Explicit timeout
        signal: AbortSignal.timeout(180000) // 3 minutes
      });
      
      const railwayResponseTime = Date.now() - railwayStartTime;
      console.log('🎯 Railway response time:', railwayResponseTime + 'ms');
      console.log('🎯 Railway response status:', railwayResponse.status);
      console.log('🎯 Railway response ok:', railwayResponse.ok);
      
      if (!railwayResponse.ok) {
        console.error('❌ Railway HTTP error:', railwayResponse.status, railwayResponse.statusText);
        const errorText = await railwayResponse.text();
        console.error('❌ Railway error body:', errorText);
        throw new Error(`Railway HTTP ${railwayResponse.status}: ${railwayResponse.statusText}`);
      }
      
      const railwayResult = await railwayResponse.json();
      console.log('📦 Railway raw result:', railwayResult);
      
      if (railwayResult.success && railwayResult.domData) {
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
        console.log('⚠️ Railway analysis failed:', railwayResult.error || 'No domData in response');
        domDataSource = 'RAILWAY_NO_DATA';
      }
    } catch (railwayError) {
      console.error('❌ Railway detailed error:');
      console.error('- Error name:', railwayError.name);
      console.error('- Error message:', railwayError.message);
      console.error('- Error stack:', railwayError.stack?.substring(0, 200));
      
      if (railwayError.name === 'AbortError') {
        console.error('🕐 Railway timeout - analysis took longer than 3 minutes');
        domDataSource = 'RAILWAY_TIMEOUT';
      } else if (railwayError.message.includes('fetch')) {
        console.error('🌐 Railway network error - connection failed');
        domDataSource = 'RAILWAY_NETWORK_ERROR';
      } else {
        console.error('💥 Railway unknown error');
        domDataSource = 'RAILWAY_UNAVAILABLE';
      }
    }
    
    // RETURN RAILWAY DATA ONLY
    if (railwayDOMData) {
      console.log('✅ Returning Railway DOM data to frontend');
      
      res.status(200).json({
        success: true,
        url: fullUrl,
        domData: railwayDOMData,
        timestamp: new Date().toISOString(),
        source: domDataSource
      });
    } else {
      console.log('❌ No Railway data available');
      
      res.status(200).json({
        success: false,
        error: 'Railway DOM analysis failed or returned no data',
        url: fullUrl,
        source: domDataSource,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      url: url,
      details: 'Railway proxy failed'
    });
  }
}
