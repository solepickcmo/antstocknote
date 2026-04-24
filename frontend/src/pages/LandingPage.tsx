import React from 'react';

export const LandingPage: React.FC = () => {
  return (
    <div style={{ width: '100dvw', height: '100dvh', overflow: 'hidden', margin: 0, padding: 0 }}>
      <iframe 
        src="/landing.html" 
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none',
          display: 'block'
        }}
        title="AntStockNote Landing Page"
      />
    </div>
  );
};
