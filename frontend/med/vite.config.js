import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600, // target 600KB warning
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Material UI and Emotion
            if (id.includes('@mui') || id.includes('emotion')) {
              return 'vendor_mui';
            }
            // Leaflet
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor_leaflet';
            }
            // React core
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler')) {
              return 'vendor_react';
            }
            // Router
            if (id.includes('react-router') || id.includes('react-router-dom') || id.includes('@remix-run')) {
              return 'vendor_router';
            }
            // Split PDF and Canvas (individually they are large)
            if (id.includes('jspdf')) {
              return 'vendor_jspdf';
            }
            if (id.includes('html2canvas')) {
              return 'vendor_html2canvas';
            }
            // Axios
            if (id.includes('axios')) {
              return 'vendor_axios';
            }
            // Others
            return 'vendor_others';
          }
        },
      },
    },
  },
});



