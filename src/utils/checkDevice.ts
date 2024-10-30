export function isiOS(): boolean {
  const userAgent = window.navigator.userAgent;
  console.log(userAgent); // Log user agent for debugging

  return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
}

export function isMobile(): boolean {
  const userAgent = window.navigator.userAgent;
  // Check for mobile devices (including Android)
  return /Mobi|Android/i.test(userAgent);
}

export function isTablet(): boolean {
  const userAgent = window.navigator.userAgent;
  // Check for tablets (including iPad and Android tablets)
  return /iPad|Android(?!.*Mobile)/i.test(userAgent);
}

export function isDesktop(): boolean {
  // If it's not mobile or tablet, it's likely a desktop
  return !isMobile() && !isTablet();
}

// Example usage
export const deviceType = () => {
  if (isDesktop()) {
    return "This is a desktop device.";
  } else if (isTablet()) {
    return "This is a tablet device.";
  } else if (isMobile()) {
    return "This is a mobile device.";
  } else {
    return "Unknown device type.";
  }
};
