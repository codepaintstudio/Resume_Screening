declare module 'swagger-ui-react' {
  import * as React from 'react';

  export interface SwaggerUIProps {
    url?: string;
    spec?: any;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelsExpandDepth?: number;
    deepLinking?: boolean;
    presets?: any[];
    plugins?: any[];
    tryItOutEnabled?: boolean;
    supportedSubmitMethods?: string[];
    requestInterceptor?: (req: any) => any;
    responseInterceptor?: (res: any) => any;
    onComplete?: () => void;
  }

  const SwaggerUI: React.ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}
