h// Service Worker Registration - Only on admin routes
if('serviceWorker' in navigator) {
  // Check if we're on an admin route
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(registration => {
          console.log('Service Worker registered for admin route:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    });
  } else {
    console.log('Service Worker not registered - not on admin route');
  }
}
