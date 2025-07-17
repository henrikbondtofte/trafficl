import React from 'react';
import Link from 'next/link';
import { BarChart3, Target, Zap, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🔬 Trafficlab
            </h1>
            <p className="text-xl text-gray-600">
              Professional SEO Analysis Tools Suite
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Advanced SEO Analysis Tools
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Deep insights into Core Updates impact and DOM rendering issues that Google Search Console doesn't show you. 
            Built for SEO professionals who need technical precision.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Core Update Analyzer */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center mb-4">
                <Target className="w-8 h-8 text-white mr-3" />
                <h3 className="text-2xl font-bold text-white">Core Update Impact Analyzer</h3>
              </div>
              <p className="text-blue-100">
                Analyze correlation between engagement drops and ranking problems after Google Core Updates
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>GA4 + Search Console correlation analysis</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Identify engagement vs ranking issues</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Export detailed problem pages</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Danish CSV format support</span>
                </div>
              </div>
              
              <Link href="/core-update-analyzer">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  Launch Core Update Analyzer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </Link>
            </div>
          </div>

          {/* Lighthouse DOM Analyzer */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
              <div className="flex items-center mb-4">
                <Zap className="w-8 h-8 text-white mr-3" />
                <h3 className="text-2xl font-bold text-white">Lighthouse DOM Analyzer</h3>
              </div>
              <p className="text-purple-100">
                Technical DOM rendering analysis for JavaScript-heavy sites and Googlebot compatibility
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>DOM.pushNodeByPathToFrontend error detection</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Hidden artifact timeouts analysis</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>ImageElements budget monitoring</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>GSC invisible data insights</span>
                </div>
              </div>
              
              <Link href="/lighthouse-dom-analyzer">
                <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
                  Launch DOM Analyzer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </Link>
            </div>
          </div>

          {/* Competitor Analysis */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-8 h-8 text-white mr-3" />
                <h3 className="text-2xl font-bold text-white">Competitor Analysis</h3>
              </div>
              <p className="text-green-100">
                Compare your site against competitors. Identify technical gaps and opportunities
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Site-to-site performance comparison</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Technical SEO gap analysis</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Identify ranking opportunities</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Competitive intelligence insights</span>
                </div>
              </div>
              
              <Link href="/competitor-analysis">
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                  Launch Competitor Analysis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Trafficlab?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-3">Deep Analysis</h4>
              <p className="text-gray-600">
                Go beyond surface metrics with technical insights that Search Console can't provide
              </p>
            </div>
            
            <div className="text-center">
              <Target className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-3">Actionable Insights</h4>
              <p className="text-gray-600">
                Get specific recommendations and exportable data for immediate SEO improvements
              </p>
            </div>
            
            <div className="text-center">
              <Zap className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-3">Professional Grade</h4>
              <p className="text-gray-600">
                Built for SEO professionals who need technical precision and detailed analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Trafficlab. Professional SEO Analysis Tools.</p>
        </div>
      </footer>
    </div>
  );
}
