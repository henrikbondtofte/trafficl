import React, { useState } from 'react';
import { Upload, Download, CheckCircle, Target, BarChart3, HelpCircle } from 'lucide-react';

export default function CoreUpdateAnalyzer() {
  const [gaBefore, setGaBefore] = useState(null);
  const [gaAfter, setGaAfter] = useState(null);
  const [scBefore, setScBefore] = useState(null);
  const [scAfter, setScAfter] = useState(null);
  const [results, setResults] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const parseCSV = (text) => {
    const allLines = text.split('\n');
    a
    const lines = allLines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('#');
    });
    
    if (lines.length < 2) return [];
    
    const firstLine = lines[0];
    let separator = ',';
    let maxColumns = firstLine.split(',').length;
    
    const semicolonColumns = firstLine.split(';').length;
    if (semicolonColumns > maxColumns) {
      separator = ';';
      maxColumns = semicolonColumns;
    }
    
    const tabColumns = firstLine.split('\t').length;
    if (tabColumns > maxColumns) {
      separator = '\t';
      maxColumns = tabColumns;
    }
    
    const headers = firstLine.split(separator).map(h => h.replace(/"/g, '').trim().toLowerCase());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(separator).map(v => v.replace(/"/g, '').trim());
      if (values.length >= 2) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }
    
    return data;
  };

  const analyzeData = async () => {
    if (!gaBefore || !gaAfter) {
      alert('Please upload both GA Before and GA After files');
      return;
    }

    try {
      const gaBeforeText = await gaBefore.text();
      const gaAfterText = await gaAfter.text();
      
      const gaBeforeData = parseCSV(gaBeforeText);
      const gaAfterData = parseCSV(gaAfterText);
      
      if (gaBeforeData.length === 0 || gaAfterData.length === 0) {
        alert('Error: No data found in CSV files. Please check file format.');
        return;
      }

      let scBeforeData = [];
      let scAfterData = [];
      if (scBefore && scAfter) {
        const scBeforeText = await scBefore.text();
        const scAfterText = await scAfter.text();
        scBeforeData = parseCSV(scBeforeText);
        scAfterData = parseCSV(scAfterText);
      }

      const gaBeforeMap = {};
      const gaAfterMap = {};
      const scBeforeMap = {};
      const scAfterMap = {};

      gaBeforeData.forEach(row => {
        const pathKeys = [
          'landing page + query string', 'landing page', 'page path', 'page', 'url',
          'landingsside + forespørgselsstreng', 'landingsside', 'sidesti', 'side',
          'page path and screen class', 'page title and screen class'
        ];
        let path = '';
        
        for (let key of pathKeys) {
          if (row[key]) {
            path = row[key];
            break;
          }
        }
        
        if (path) {
          path = path.replace(/^https?:\/\/[^\/]+/, '');
          if (path === '') path = '/';
          
          const sessions = parseInt(row['sessions'] || row['sessioner'] || 0);
          const engagementRate = parseFloat(
            row['session key event rate'] || 
            row['engagement rate'] || 
            row['sessionsfrekvens for nøglehændelse'] ||
            row['engagement-rate'] || 0
          ) * 100;
          const bounceRate = parseFloat(
            row['bounce rate'] || 
            row['afvisningsfrekvens'] || 
            row['bounce-rate'] || 0
          ) * 100;
          
          gaBeforeMap[path] = {
            sessions: sessions,
            engagementRate: engagementRate,
            bounceRate: bounceRate
          };
        }
      });

      gaAfterData.forEach(row => {
        const pathKeys = ['landing page + query string', 'landing page', 'page path', 'page', 'url'];
        let path = '';
        
        for (let key of pathKeys) {
          if (row[key]) {
            path = row[key];
            break;
          }
        }
        
        if (path) {
          path = path.replace(/^https?:\/\/[^\/]+/, '');
          if (path === '') path = '/';
          
          gaAfterMap[path] = {
            sessions: parseInt(row['sessions'] || 0),
            engagementRate: parseFloat(row['session key event rate'] || row['engagement rate'] || 0) * 100,
            bounceRate: parseFloat(row['bounce rate'] || 0) * 100
          };
        }
      });

      if (scBeforeData.length > 0) {
        scBeforeData.forEach(row => {
          let path = row['top pages'] || row['page'] || row['url'] || row['landing page'] || '';
          if (path) {
            path = path.replace(/^https?:\/\/[^\/]+/, '');
            if (path === '') path = '/';
            scBeforeMap[path] = {
              position: parseFloat(row['position'] || 0)
            };
          }
        });
        
        scAfterData.forEach(row => {
          let path = row['top pages'] || row['page'] || row['url'] || row['landing page'] || '';
          if (path) {
            path = path.replace(/^https?:\/\/[^\/]+/, '');
            if (path === '') path = '/';
            scAfterMap[path] = {
              position: parseFloat(row['position'] || 0)
            };
          }
        });
      }

      const pages = [];
      let bothProblems = 0;
      let onlyEngagement = 0;
      let onlyRanking = 0;

      const allPaths = new Set([
        ...Object.keys(gaBeforeMap), 
        ...Object.keys(gaAfterMap),
        ...Object.keys(scBeforeMap),
        ...Object.keys(scAfterMap)
      ]);

      allPaths.forEach(path => {
        const before = gaBeforeMap[path] || { sessions: 0, engagementRate: 0, bounceRate: 0 };
        const after = gaAfterMap[path] || { sessions: 0, engagementRate: 0, bounceRate: 0 };
        const scBefore = scBeforeMap[path] || { position: 0 };
        const scAfter = scAfterMap[path] || { position: 0 };

        const sessionsChange = before.sessions > 0 ? ((after.sessions - before.sessions) / before.sessions) * 100 : 0;
        const engagementChange = before.engagementRate > 0 ? ((after.engagementRate - before.engagementRate) / before.engagementRate) * 100 : 0;
        const bounceChange = before.bounceRate > 0 ? ((after.bounceRate - before.bounceRate) / before.bounceRate) * 100 : 0;
        
        const positionChange = scBefore.position > 0 && scAfter.position > 0 ? scAfter.position - scBefore.position : 0;

        const hasEngagementProblem = engagementChange < -15 || bounceChange > 15 || sessionsChange < -20;
        const hasRankingProblem = positionChange > 5 || sessionsChange < -30;

        if (hasEngagementProblem && hasRankingProblem) bothProblems++;
        else if (hasEngagementProblem) onlyEngagement++;
        else if (hasRankingProblem) onlyRanking++;

        if (after.sessions > 0 || before.sessions > 0 || scAfter.position > 0) {
          pages.push({
            path: path,
            sessions: after.sessions,
            sessionsChange: sessionsChange,
            engagementChange: engagementChange,
            bounceChange: bounceChange,
            positionChange: positionChange,
            hasEngagementProblem: hasEngagementProblem,
            hasRankingProblem: hasRankingProblem,
            correlationType: hasEngagementProblem && hasRankingProblem ? 'BOTH' :
                           hasEngagementProblem ? 'ENGAGEMENT_ONLY' :
                           hasRankingProblem ? 'RANKING_ONLY' : 'NONE'
          });
        }
      });

      pages.sort((a, b) => b.sessions - a.sessions);

      const totalPages = pages.length;
      const correlationPercentage = totalPages > 0 ? Math.round((bothProblems / totalPages) * 100) : 0;
      const isEngagementCause = correlationPercentage >= 40;
      const hasScData = !!(scBefore && scAfter);

      setResults({
        totalPages: totalPages,
        bothProblems: bothProblems,
        onlyEngagement: onlyEngagement,
        onlyRanking: onlyRanking,
        correlationPercentage: correlationPercentage,
        isEngagementCause: isEngagementCause,
        hasScData: hasScData,
        pages: pages
      });

    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis error: ' + error.message);
    }
  };

  const exportResults = () => {
    if (!results) return;
    
    const problemPages = results.pages.filter(p => p.correlationType !== 'NONE');
    const csvData = problemPages.map(page => {
      const posChange = page.positionChange || 'N/A';
      return `"${page.path}","${page.sessions}","${page.sessionsChange.toFixed(1)}%","${page.engagementChange.toFixed(1)}%","${page.bounceChange.toFixed(1)}%","${posChange}","${page.correlationType}"`;
    });
    
    const csvString = 'Page,Sessions,Sessions Change,Engagement Change,Bounce Change,Position Change,Type\n' + csvData.join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `core-update-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Core Update Impact Analyzer</h1>
          <p className="text-lg text-gray-600">Analyze correlation between ranking drops and engagement problems</p>
          
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="mt-4 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-2 mx-auto"
          >
            <HelpCircle className="w-4 h-4" />
            {showInstructions ? 'Hide instructions' : 'Show export guide'}
          </button>
        </div>

        {showInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-blue-900 mb-6 text-center">📋 How to Export Data</h3>
            
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-3 text-lg">🔵 Google Analytics 4 (Required):</h4>
                <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside ml-4">
                  <li>Go to <strong>Reports → SEO → Landing page: Organic Search</strong></li>
                  <li>This report already shows organic search data with landing pages</li>
                  <li>Ensure you can see: <strong>Sessions, Bounce rate, Engagement rate</strong></li>
                  <li>Set date range to period <strong>BEFORE</strong> core update (e.g. 30 days)</li>
                  <li>Click <strong>Export</strong> → Download CSV → save as <strong>"GA Before"</strong></li>
                  <li>Change date range to period <strong>AFTER</strong> core update (same length)</li>
                  <li>Click <strong>Export</strong> → Download CSV → save as <strong>"GA After"</strong></li>
                </ol>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-green-200">
                <h4 className="font-bold text-green-800 mb-3 text-lg">🟢 Search Console (Optional):</h4>
                <ol className="text-sm text-green-700 space-y-2 list-decimal list-inside ml-4">
                  <li>Go to <strong>Performance → Search results</strong></li>
                  <li>Click on <strong>"Pages"</strong> tab</li>
                  <li>Set period <strong>BEFORE</strong> core update</li>
                  <li>Download CSV → save as <strong>"SC Before"</strong></li>
                  <li>Switch to period <strong>AFTER</strong> core update</li>
                  <li>Download CSV → save as <strong>"SC After"</strong></li>
                </ol>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
            <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-medium text-blue-800 mb-1 text-sm">📊 GA BEFORE</h3>
            <p className="text-xs text-blue-600 mb-3">Period before core update</p>
            <label className="block">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setGaBefore(e.target.files[0])}
                className="hidden"
              />
              <span className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 cursor-pointer text-xs">
                Choose CSV
              </span>
            </label>
            {gaBefore && <p className="text-green-600 text-xs mt-2">✓ {gaBefore.name}</p>}
          </div>

          <div className="border-2 border-dashed border-red-300 rounded-lg p-4 text-center">
            <Upload className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h3 className="font-medium text-red-800 mb-1 text-sm">📊 GA AFTER</h3>
            <p className="text-xs text-red-600 mb-3">Period after core update</p>
            <label className="block">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setGaAfter(e.target.files[0])}
                className="hidden"
              />
              <span className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 cursor-pointer text-xs">
                Choose CSV
              </span>
            </label>
            {gaAfter && <p className="text-green-600 text-xs mt-2">✓ {gaAfter.name}</p>}
          </div>

          <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center">
            <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h3 className="font-medium text-green-800 mb-1 text-sm">🔍 SC BEFORE</h3>
            <p className="text-xs text-green-600 mb-3">Optional ranking data</p>
            <label className="block">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setScBefore(e.target.files[0])}
                className="hidden"
              />
              <span className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 cursor-pointer text-xs">
                Choose SC Before
              </span>
            </label>
            {scBefore && <p className="text-green-600 text-xs mt-2">✓ {scBefore.name}</p>}
          </div>

          <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center">
            <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h3 className="font-medium text-purple-800 mb-1 text-sm">🔍 SC AFTER</h3>
            <p className="text-xs text-purple-600 mb-3">Optional ranking data</p>
            <label className="block">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setScAfter(e.target.files[0])}
                className="hidden"
              />
              <span className="bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 cursor-pointer text-xs">
                Choose SC After
              </span>
            </label>
            {scAfter && <p className="text-green-600 text-xs mt-2">✓ {scAfter.name}</p>}
          </div>
        </div>

        {gaBefore && gaAfter && (
          <div className="text-center mb-8">
            <button
              onClick={analyzeData}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium text-lg"
            >
              🚀 ANALYZE CORE UPDATE IMPACT
            </button>
          </div>
        )}

        {results && (
          <div>
            
            <div className={`p-6 rounded-lg mb-6 text-center ${
              results.isEngagementCause ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'
            }`}>
              <div className="flex justify-center mb-4">
                {results.isEngagementCause ? (
                  <Target className="w-16 h-16 text-red-500" />
                ) : (
                  <CheckCircle className="w-16 h-16 text-green-500" />
                )}
              </div>
              <h2 className={`text-2xl font-bold mb-3 ${
                results.isEngagementCause ? 'text-red-900' : 'text-green-900'
              }`}>
                {results.isEngagementCause ? '🔴 STRONG CORRELATION' : '🟢 LOW CORRELATION'}
              </h2>
              <p className={`text-lg ${
                results.isEngagementCause ? 'text-red-800' : 'text-green-800'
              }`}>
                {results.correlationPercentage}% of pages have both ranking and engagement problems
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{results.totalPages}</div>
                <div className="text-blue-700 text-sm">Total Pages</div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-900">{results.bothProblems}</div>
                <div className="text-red-700 text-sm">Both Problems</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-900">{results.onlyEngagement}</div>
                <div className="text-orange-700 text-sm">Engagement Only</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-900">{results.correlationPercentage}%</div>
                <div className="text-green-700 text-sm">Correlation</div>
              </div>
            </div>

            <div className="bg-white border rounded-lg">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold">🎯 Problem Pages</h3>
                <button
                  onClick={exportResults}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Page</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Sessions Δ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Engagement Δ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Bounce Δ</th>
                      {results.hasScData && <th className="px-4 py-3 text-left text-sm font-medium">Position Δ</th>}
                      <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.pages
                      .filter(page => page.correlationType !== 'NONE')
                      .slice(0, 15)
                      .map((page, index) => (
                      <tr key={index} className={`border-b ${
                        page.correlationType === 'BOTH' ? 'bg-red-50' : 
                        page.correlationType === 'ENGAGEMENT_ONLY' ? 'bg-orange-50' : 'bg-purple-50'
                      }`}>
                        <td className="px-4 py-3">
                          <div className="max-w-xs truncate text-sm" title={page.path}>
                            {page.path}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-medium text-sm ${page.sessionsChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {page.sessionsChange >= 0 ? '+' : ''}{page.sessionsChange.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-medium text-sm ${page.engagementChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {page.engagementChange >= 0 ? '+' : ''}{page.engagementChange.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-medium text-sm ${page.bounceChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {page.bounceChange >= 0 ? '+' : ''}{page.bounceChange.toFixed(1)}%
                          </span>
                        </td>
                        {results.hasScData && (
                          <td className="px-4 py-3">
                            <span className={`font-medium text-sm ${page.positionChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {page.positionChange > 0 ? '+' : ''}{page.positionChange.toFixed(1)}
                            </span>
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            page.correlationType === 'BOTH' ? 'bg-red-100 text-red-800' :
                            page.correlationType === 'ENGAGEMENT_ONLY' ? 'bg-orange-100 text-orange-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {page.correlationType === 'BOTH' ? 'BOTH' :
                             page.correlationType === 'ENGAGEMENT_ONLY' ? 'ENG' : 'RANK'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mt-6">
              <h3 className="font-bold text-blue-900 mb-3">💡 Conclusion:</h3>
              <div className="text-blue-800">
                {results.isEngagementCause ? (
                  <p>Strong correlation detected! Focus on improving engagement metrics on affected pages.</p>
                ) : (
                  <p>Low correlation - ranking drops are likely caused by other factors than engagement.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
