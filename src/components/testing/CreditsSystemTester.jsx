'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, TestTube, CheckCircle, XCircle } from 'lucide-react';
import generationApi from '../../lib/api/generation';
import creditsService from '../../lib/services/creditsService';
import CreditsDisplay from '../ui/CreditsDisplay';
import CreditValidation from '../ui/CreditValidation';

export default function CreditsSystemTester() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('img2img-v1');

  const runTest = async (testName, testFn) => {
    setTestResults(prev => ({ ...prev, [testName]: { status: 'running' } }));
    
    try {
      const result = await testFn();
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { status: 'success', result } 
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { status: 'error', error: error.message } 
      }));
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    
    // Test 1: Get Firebase ID
    await runTest('getFirebaseId', async () => {
      const firebaseId = await generationApi.getFirebaseId();
      return { firebaseId };
    });

    // Test 2: Get User Credits
    await runTest('getUserCredits', async () => {
      const credits = await creditsService.getUserCredits();
      return credits;
    });

    // Test 3: Get Models
    await runTest('getModels', async () => {
      const models = await creditsService.getModels();
      return models;
    });

    // Test 4: Check Credit Validation
    await runTest('creditValidation', async () => {
      const validation = await creditsService.hasEnoughCredits(selectedModel);
      return validation;
    });

    // Test 5: Test Generation API (without actually generating)
    await runTest('generationApiStructure', async () => {
      // Just test the API structure without making the request
      return {
        endpoint: 'http://localhost:8082/generate/async',
        // endpoint: 'https://api.tarum.ai/generation-service/generate/async',
        expectedResponse: {
          jobId: 'job_12345',
          status: 'queued',
          threadId: 'thread-id',
          creditsRemaining: 48,
          creditsDeducted: 2,
          message: 'Job submitted successfully'
        }
      };
    });

    setLoading(false);
  };

  const TestResult = ({ testName, result }) => {
    if (!result) return null;

    const { status, result: data, error } = result;

    return (
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          {status === 'running' && <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />}
          {status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
          {status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
          <h3 className="font-medium">{testName}</h3>
        </div>
        
        {status === 'success' && (
          <pre className="text-xs bg-green-50 p-2 rounded overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
        
        {status === 'error' && (
          <div className="text-xs bg-red-50 p-2 rounded text-red-700">
            Error: {error}
          </div>
        )}
        
        {status === 'running' && (
          <div className="text-xs text-blue-600">Running...</div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Credits System Tester</h1>
        <p className="text-gray-600">Test the new credits system integration</p>
      </div>

      {/* Live Components Demo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Live Credits Display</h2>
          <CreditsDisplay size="default" showRefreshButton={true} />
          <CreditsDisplay size="small" />
          <CreditsDisplay size="large" />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Credit Validation</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Test Model:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="img2img-v1">img2img-v1</option>
              <option value="stable-diffusion-v1">stable-diffusion-v1</option>
            </select>
          </div>
          <CreditValidation modelName={selectedModel} />
        </div>
      </div>

      {/* Test Controls */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">API Tests</h2>
          <button
            onClick={runAllTests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <TestTube className="w-4 h-4" />
            {loading ? 'Running Tests...' : 'Run All Tests'}
          </button>
        </div>

        {/* Test Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TestResult testName="Get Firebase ID" result={testResults.getFirebaseId} />
          <TestResult testName="Get User Credits" result={testResults.getUserCredits} />
          <TestResult testName="Get Models" result={testResults.getModels} />
          <TestResult testName="Credit Validation" result={testResults.creditValidation} />
          <TestResult testName="Generation API Structure" result={testResults.generationApiStructure} />
        </div>
      </div>

      {/* Contract Information */}
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">New API Contract Endpoints</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-mono">GET</span>
            <code>/credits?firebaseId={'{firebaseId}'}</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-mono">GET</span>
            <code>/models</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">POST</span>
            <code>/generate/async</code>
            <span className="text-gray-500">- now returns creditsRemaining & creditsDeducted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-mono">WS</span>
            <code>/ws?firebaseId={'{firebaseId}'}</code>
          </div>
        </div>
      </div>
    </div>
  );
}


