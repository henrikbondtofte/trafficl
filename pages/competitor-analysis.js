import { useState } from 'react';
import Head from 'next/head';
import CompetitorAnalysis from '../components/SEOTools/CompetitorAnalysis';

export default function CompetitorAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Head>
        <title>Competitor Analysis - SEO Tools</title>
        <meta name="description" content="Advanced competitor analysis tool for SEO performance comparison" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            🚀 Competitor Analysis
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Compare your site against competitors. Identify technical gaps, performance issues, and opportunities to outrank your competition.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex justify-center space-x-4 mb-8">
            <a href="/" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              🏠 Home
            </a>
            <a href="/core-update-analyzer" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              📊 Core Update Analyzer
            </a>
            <a href="/lighthouse-dom-analyzer" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              🔍 DOM Analyzer
            </a>
          </nav>
        </div>

        {/* Main Component */}
        <CompetitorAnalysis />
      </div>
    </div>
  );
}