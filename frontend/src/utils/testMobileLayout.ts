// Test utility for mobile layout system
import { getResponsiveDimensions, getMobileBreakpoints, getResponsiveValue } from '../styles/mobileLayout';

export const testMobileLayout = () => {
  try {
    console.log('Testing Mobile Layout System...');
    
    // Test breakpoints
    const breakpoints = getMobileBreakpoints();
    console.log('Breakpoints:', breakpoints);
    
    // Test responsive dimensions
    const dims = getResponsiveDimensions();
    console.log('Responsive Dimensions:', {
      spacing: dims.spacing,
      typography: dims.typography,
      components: dims.components,
      layout: dims.layout,
    });
    
    // Test responsive value function
    const responsiveValue = getResponsiveValue('small', 'medium', 'large');
    console.log('Responsive Value:', responsiveValue);
    
    console.log('✅ Mobile Layout System Test Passed');
    return true;
  } catch (error) {
    console.error('❌ Mobile Layout System Test Failed:', error);
    return false;
  }
};

// Auto-run test in development
if (__DEV__) {
  testMobileLayout();
}






