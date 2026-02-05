'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h1 className="text-xl font-bold">API Documentation</h1>
        <a 
          href="/api/doc" 
          target="_blank" 
          download="openapi.json"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          导出 JSON (OpenAPI Spec)
        </a>
      </div>
      <div className="flex-1">
        <SwaggerUI url="/api/doc" />
      </div>
    </div>
  );
}
