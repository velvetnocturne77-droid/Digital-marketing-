// Vercel Speed Insights Integration
// This script initializes Vercel Speed Insights for the static site
// Documentation: https://vercel.com/docs/speed-insights

(function() {
  'use strict';
  
  // Initialize the Speed Insights queue
  window.si = window.si || function() {
    (window.siq = window.siq || []).push(arguments);
  };
  
  // Load the Speed Insights script from Vercel CDN
  // This script will automatically track Core Web Vitals (LCP, FID, CLS, FCP, TTFB, INP)
  var script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  
  // Fallback error handling
  script.onerror = function() {
    console.warn('Vercel Speed Insights: Script failed to load. Ensure Speed Insights is enabled in your Vercel dashboard.');
  };
  
  // Append script to document head
  document.head.appendChild(script);
  
  // Optional: Log when Speed Insights is initialized (only in development)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Vercel Speed Insights initialized (development mode - no data will be sent)');
  }
})();
