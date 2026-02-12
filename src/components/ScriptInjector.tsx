import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useRouteScripts } from '@/hooks/useCustomScripts';

// Global registry to track injected scripts across component re-renders
const injectedScriptsRegistry = new Map<string, Set<string>>();

const ScriptInjector = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const hasInjectedRef = useRef(false);
  
  // Normalize path (remove trailing slash except for root)
  const normalizedPath = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');
  
  // Get base route (first segment) for matching
  const baseRoute = '/' + (normalizedPath.split('/')[1] || '');
  
  const { scripts, isLoading } = useRouteScripts(baseRoute);

  useEffect(() => {
    console.log('[ScriptInjector] Current path:', currentPath);
    console.log('[ScriptInjector] Base route:', baseRoute);
    console.log('[ScriptInjector] Scripts loaded:', scripts.length, scripts);
    console.log('[ScriptInjector] Is loading:', isLoading);

    if (isLoading) {
      console.log('[ScriptInjector] Still loading scripts...');
      return;
    }
    
    if (scripts.length === 0) {
      console.log('[ScriptInjector] No scripts to inject for route:', baseRoute);
      return;
    }

    // Check if we already injected for this route in this render cycle
    if (hasInjectedRef.current) {
      console.log('[ScriptInjector] Already processed injection for this render');
      return;
    }

    // Get or create the registry entry for this route
    if (!injectedScriptsRegistry.has(baseRoute)) {
      injectedScriptsRegistry.set(baseRoute, new Set());
    }
    const routeRegistry = injectedScriptsRegistry.get(baseRoute)!;

    scripts.forEach((script) => {
      try {
        // Skip if this script was already injected for this route
        if (routeRegistry.has(script.id)) {
          console.log(`[ScriptInjector] Script "${script.name}" already injected for route ${baseRoute}, skipping`);
          return;
        }

        // Also check if elements already exist in DOM
        const existingElements = document.querySelectorAll(`[data-custom-script-id="${script.id}"]`);
        if (existingElements.length > 0) {
          console.log(`[ScriptInjector] Script "${script.name}" elements already in DOM, marking as injected`);
          routeRegistry.add(script.id);
          return;
        }

        console.log('[ScriptInjector] Processing script:', script.name);
        
        // Parse the script code to extract elements
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = script.script_code;

        // Process script tags - must be created fresh to execute
        const scriptTags = tempDiv.querySelectorAll('script');
        console.log('[ScriptInjector] Found', scriptTags.length, 'script tags');
        
        scriptTags.forEach((originalScript, index) => {
          const newScript = document.createElement('script');
          
          // Copy all attributes
          Array.from(originalScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          
          // Copy inline script content
          if (originalScript.textContent) {
            newScript.textContent = originalScript.textContent;
          }
          
          // If it has a src, it will load asynchronously
          if (originalScript.src) {
            newScript.async = true;
          }
          
          newScript.setAttribute('data-custom-script-id', script.id);
          newScript.setAttribute('data-custom-script-route', baseRoute);
          
          // Append to head to execute
          document.head.appendChild(newScript);
          console.log('[ScriptInjector] Injected script tag', index + 1, 'to head');
        });

        // Process noscript tags
        const noscriptTags = tempDiv.querySelectorAll('noscript');
        noscriptTags.forEach((noscript) => {
          const newNoscript = document.createElement('noscript');
          newNoscript.innerHTML = noscript.innerHTML;
          newNoscript.setAttribute('data-custom-script-id', script.id);
          newNoscript.setAttribute('data-custom-script-route', baseRoute);
          document.head.appendChild(newNoscript);
          console.log('[ScriptInjector] Injected noscript tag to head');
        });

        // Process other elements (img for tracking pixels, iframes, etc.)
        const otherElements = tempDiv.querySelectorAll('img, iframe, link');
        otherElements.forEach((element) => {
          const clonedElement = element.cloneNode(true) as HTMLElement;
          clonedElement.setAttribute('data-custom-script-id', script.id);
          clonedElement.setAttribute('data-custom-script-route', baseRoute);
          document.head.appendChild(clonedElement);
          console.log('[ScriptInjector] Injected element:', element.tagName);
        });

        // Mark as injected in the registry
        routeRegistry.add(script.id);
        console.log(`[ScriptInjector] Successfully injected script "${script.name}" for route ${baseRoute}`);

      } catch (error) {
        console.error(`[ScriptInjector] Error injecting script "${script.name}":`, error);
      }
    });

    hasInjectedRef.current = true;

    // Cleanup function - only runs when navigating away
    return () => {
      hasInjectedRef.current = false;
    };
  }, [scripts, isLoading, baseRoute, currentPath]);

  // Cleanup old route scripts when navigating to a different route
  useEffect(() => {
    return () => {
      // When unmounting or route changes, clean up scripts from other routes
      injectedScriptsRegistry.forEach((scriptIds, route) => {
        if (route !== baseRoute) {
          console.log('[ScriptInjector] Cleanup: Removing scripts for old route:', route);
          scriptIds.forEach((scriptId) => {
            const elements = document.querySelectorAll(`[data-custom-script-id="${scriptId}"][data-custom-script-route="${route}"]`);
            elements.forEach(el => el.remove());
          });
          injectedScriptsRegistry.delete(route);
        }
      });
    };
  }, [baseRoute]);

  return null; // This component doesn't render anything
};

export default ScriptInjector;
