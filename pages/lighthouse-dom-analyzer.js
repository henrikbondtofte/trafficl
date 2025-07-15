import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import LighthouseDOMAnalyzer from '../components/SEOTools/LighthouseDOMAnalyzer';

export default function LighthouseDOMAnalyzerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-purple-600 hover:text-purple-700">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <Home className="w-5 h-5 mr-2" />
              Back to Trafficlab
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Lighthouse DOM Analyzer</h1>
          </div>
        </div>
      </div>

      {/* Tool Component */}
      <LighthouseDOMAnalyzer />
    </div>
  );
}