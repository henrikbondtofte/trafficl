import { useState, useRef } from 'react';

export default function CompetitorAnalysis() {
  const [analysisMode, setAnalysisMode] = useState('standard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  // URL States
  const [yourSite, setYourSite] = useState('');
  const [competitors, setCompetitors] = useState(['', '', '']);
  const [winners, setWinners] = useState(['', '', '']);
  const [losers, setLosers] = useState(['', '', '']);

  const modes = {
    standard: {
      title: '🎯 Standard Comparison',
      description: 'Compare your site against 3 competitors',
      fields: 'yourSite + 3 competitors'
    },
    winnersLosers: {
      title: '⚔️ Winners vs Losers',
      description: 'Analyze 3 winners + 3 losers + your site (perfect for Core Updates)',
      fields: '3 winners + 3 losers + your site'
    },
    coreUpdate: {
      title: '📈 Core Update Impact',
      description: 'Track performance before/after Google Core Updates',
      fields: 'Historical comparison analysis'
    }
  };

  // Mock analysis function - would integrate real APIs
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setCurrentStep(1);
    
    try {
      // Step 1: Validate URLs
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Core Web Vitals Analysis
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: DOM Structure Analysis
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 4: Generate Insights
      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock results
      const mockResults = generateMockResults();
      setResults(mockResults);
      
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
      setCurrentStep(1);
    }
  };

  const generateMockResults = () => {
    const sites = analysisMode === 'standard' 
      ? [yourSite, ...competitors.filter(c => c)]
      : [yourSite, ...winners.filter(w => w), ...losers.filter(l => l)];
    
    return {
      sites: sites.map((url, index) => ({
        url,
        name: index === 0 ? 'Your Site' : `Competitor ${index}`,
        coreWebVitals: {
          lcp: Math.random() * 3 + 1,
          fid: Math.random() * 200,
          cls: Math.random() * 0.3,
          score: Math.floor(Math.random() * 40) + 60
        },
        technical: {
          h1Count: Math.floor(Math.random() * 3) + 1,
          metaDescription: Math.random() > 0.3,
          imageOptimization: Math.floor(Math.random() * 30) + 70,
          internalLinks: Math.floor(Math.random() * 50) + 20
        }
      })),
      insights: generateInsights()
    };
  };

  const generateInsights = () => [
    {
      type: 'critical',
      title: '🚨 Core Web Vitals Gap',
      description: 'Competitor A has 23% better LCP than your site',
      recommendation: 'Optimize images and reduce server response time',
      impact: 'High'
    },
    {
      type: 'warning',
      title: '⚠️ Technical SEO Issue',
      description: 'Missing meta descriptions on 40% of analyzed pages',
      recommendation: 'Add unique meta descriptions to improve CTR',
      impact: 'Medium'
    },
    {
      type: 'opportunity',
      title: '💡 Content Opportunity', 
      description: 'Competitors have better heading structure',
      recommendation: 'Improve H1-H6 hierarchy for better content organization',
      impact: 'Medium'
    }
  ];

  const updateCompetitor = (index, value) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  const updateWinner = (index, value) => {
    const newWinners = [...winners];
    newWinners[index] = value;
    setWinners(newWinners);
  };

  const updateLoser = (index, value) => {
    const newLosers = [...losers];
    newLosers[index] = value;
    setLosers(newLosers);
  };

  const isFormValid = () => {
    if (analysisMode === 'standard') {
      return yourSite && competitors.filter(c => c).length >= 1;
    }
    if (analysisMode === 'winnersLosers') {
      return yourSite && winners.filter(w => w).length >= 1 && losers.filter(l => l).length >= 1;
    }
    return yourSite;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Mode Selection */}
      <div className="bg-gray-800 rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">📋 Choose Analysis Mode</h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {Object.entries(modes).map(([key, mode]) => (
            <button
              key={key}
              onClick={() => setAnalysisMode(key)}
              className={`p-4 rounded-xl border-2 transition-all ${
                analysisMode === key
                  ? 'border-blue-400 bg-blue-500/20 text-blue-300'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-lg font-semibold mb-2">{mode.title}</div>
              <div className="text-sm opacity-90">{mode.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* URL Inputs */}
      <div className="bg-gray-800 rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">🌐 Enter URLs for Analysis</h2>
        
        {/* Your Site */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            🏠 Your Website
          </label>
          <input
            type="url"
            value={yourSite}
            onChange={(e) => setYourSite(e.target.value)}
            placeholder="https://yoursite.com"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
          />
        </div>

        {/* Standard Mode Inputs */}
        {analysisMode === 'standard' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-4">🎯 Competitors</h3>
            {competitors.map((competitor, index) => (
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Competitor {index + 1}
                </label>
                <input
                  type="url"
                  value={competitor}
                  onChange={(e) => updateCompetitor(index, e.target.value)}
                  placeholder={`https://competitor${index + 1}.com`}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* Winners vs Losers Mode */}
        {analysisMode === 'winnersLosers' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Winners */}
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-4">🏆 Winners (Sites that improved)</h3>
              {winners.map((winner, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Winner {index + 1}
                  </label>
                  <input
                    type="url"
                    value={winner}
                    onChange={(e) => updateWinner(index, e.target.value)}
                    placeholder={`https://winner${index + 1}.com`}
                    className="w-full px-4 py-3 bg-gray-700 border border-green-600 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Losers */}
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-4">📉 Losers (Sites that declined)</h3>
              {losers.map((loser, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Loser {index + 1}
                  </label>
                  <input
                    type="url"
                    value={loser}
                    onChange={(e) => updateLoser(index, e.target.value)}
                    placeholder={`https://loser${index + 1}.com`}
                    className="w-full px-4 py-3 bg-gray-700 border border-red-600 rounded-lg text-white placeholder-gray-400 focus:border-red-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Update Mode */}
        {analysisMode === 'coreUpdate' && (
          <div className="bg-blue-900/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-4">📈 Core Update Analysis</h3>
            <p className="text-gray-300 mb-4">
              This mode will analyze your site's performance trends around Google Core Updates.
              Historical data analysis coming soon!
            </p>
            <div className="text-sm text-gray-400">
              💡 Tip: Use Winners vs Losers mode for manual Core Update impact analysis
            </div>
          </div>
        )}
      </div>

      {/* Analysis Button */}
      <div className="text-center mb-8">
        <button
          onClick={runAnalysis}
          disabled={!isFormValid() || isAnalyzing}
          className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
            isFormValid() && !isAnalyzing
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? '🔄 Analyzing...' : '🚀 Start Competitor Analysis'}
        </button>
      </div>

      {/* Loading Progress */}
      {isAnalyzing && (
        <div className="bg-gray-800 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">🔍 Analysis in Progress</h3>
          
          <div className="space-y-4">
            {[
              { step: 1, title: 'Validating URLs', emoji: '🔗' },
              { step: 2, title: 'Analyzing Core Web Vitals', emoji: '⚡' },
              { step: 3, title: 'Scanning DOM Structure', emoji: '🏗️' },
              { step: 4, title: 'Generating Insights', emoji: '💡' }
            ].map(({ step, title, emoji }) => (
              <div key={step} className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep > step ? 'bg-green-500' : 
                  currentStep === step ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'
                }`}>
                  {currentStep > step ? '✅' : emoji}
                </div>
                <span className={`${currentStep >= step ? 'text-white' : 'text-gray-400'}`}>
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-8">
          {/* Performance Comparison */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">📊 Performance Comparison</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 text-gray-300">Site</th>
                    <th className="text-center py-3 px-4 text-gray-300">Score</th>
                    <th className="text-center py-3 px-4 text-gray-300">LCP</th>
                    <th className="text-center py-3 px-4 text-gray-300">FID</th>
                    <th className="text-center py-3 px-4 text-gray-300">CLS</th>
                    <th className="text-center py-3 px-4 text-gray-300">H1s</th>
                    <th className="text-center py-3 px-4 text-gray-300">Meta Desc</th>
                  </tr>
                </thead>
                <tbody>
                  {results.sites.map((site, index) => (
                    <tr key={index} className={`border-b border-gray-700 ${index === 0 ? 'bg-blue-900/20' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{site.name}</div>
                        <div className="text-gray-400 text-xs">{site.url}</div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`font-bold ${
                          site.coreWebVitals.score >= 90 ? 'text-green-400' :
                          site.coreWebVitals.score >= 70 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {site.coreWebVitals.score}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 text-gray-300">
                        {site.coreWebVitals.lcp.toFixed(1)}s
                      </td>
                      <td className="text-center py-3 px-4 text-gray-300">
                        {site.coreWebVitals.fid.toFixed(0)}ms
                      </td>
                      <td className="text-center py-3 px-4 text-gray-300">
                        {site.coreWebVitals.cls.toFixed(2)}
                      </td>
                      <td className="text-center py-3 px-4 text-gray-300">
                        {site.technical.h1Count}
                      </td>
                      <td className="text-center py-3 px-4">
                        {site.technical.metaDescription ? '✅' : '❌'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">💡 Key Insights & Recommendations</h3>
            
            <div className="space-y-4">
              {results.insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'critical' ? 'bg-red-900/20 border-red-400' :
                  insight.type === 'warning' ? 'bg-yellow-900/20 border-yellow-400' :
                  'bg-blue-900/20 border-blue-400'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white">{insight.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      insight.impact === 'High' ? 'bg-red-600 text-white' :
                      insight.impact === 'Medium' ? 'bg-yellow-600 text-white' :
                      'bg-green-600 text-white'
                    }`}>
                      {insight.impact} Impact
                    </span>
                  </div>
                  <p className="text-gray-300 mb-2">{insight.description}</p>
                  <p className="text-gray-400 text-sm">💡 {insight.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">🎯 Priority Action Items</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-green-400 mb-4">🚀 Quick Wins</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Add missing meta descriptions</li>
                  <li>• Optimize image compression</li>
                  <li>• Fix heading hierarchy</li>
                </ul>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-400 mb-4">🔧 Technical Improvements</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Improve server response time</li>
                  <li>• Reduce Cumulative Layout Shift</li>
                  <li>• Optimize Core Web Vitals</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}