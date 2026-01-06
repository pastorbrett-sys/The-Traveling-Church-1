export function isVagabondBibleDomain(): boolean {
  const hostname = window.location.hostname.toLowerCase();
  return hostname === 'vagabondbible.com' || 
         hostname === 'www.vagabondbible.com' ||
         hostname.endsWith('.vagabondbible.com');
}

export function isTravelingChurchDomain(): boolean {
  return !isVagabondBibleDomain();
}

export function getCurrentBrand(): 'vagabond' | 'church' {
  return isVagabondBibleDomain() ? 'vagabond' : 'church';
}
