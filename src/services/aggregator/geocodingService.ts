export class GeocodingService {
  private static knownCities: Record<string, { lat: number; lng: number }> = {
    // Capitais
    'teresina': { lat: -5.0920, lng: -42.8038 },
    'são luís': { lat: -2.5307, lng: -44.3068 },
    'sao luis': { lat: -2.5307, lng: -44.3068 },
    'fortaleza': { lat: -3.7172, lng: -38.5433 },
    'natal': { lat: -5.7945, lng: -35.2110 },
    'joão pessoa': { lat: -7.1195, lng: -34.8450 },
    'joao pessoa': { lat: -7.1195, lng: -34.8450 },
    'recife': { lat: -8.0476, lng: -34.8770 },
    'maceió': { lat: -9.6658, lng: -35.7350 },
    'maceio': { lat: -9.6658, lng: -35.7350 },
    'aracaju': { lat: -10.9472, lng: -37.0731 },
    'salvador': { lat: -12.9777, lng: -38.5016 },
    'manaus': { lat: -3.1190, lng: -60.0217 },
    'belém': { lat: -1.4558, lng: -48.4902 },
    'belem': { lat: -1.4558, lng: -48.4902 },
    'brasília': { lat: -15.7975, lng: -47.8919 },
    'brasilia': { lat: -15.7975, lng: -47.8919 },
    'goiânia': { lat: -16.6809, lng: -49.2565 },
    'goiania': { lat: -16.6809, lng: -49.2565 },
    'cuiabá': { lat: -15.6010, lng: -56.0979 },
    'cuiaba': { lat: -15.6010, lng: -56.0979 },
    'campo grande': { lat: -20.4697, lng: -54.6201 },
    'belo horizonte': { lat: -19.9167, lng: -43.9345 },
    'vitória': { lat: -20.3155, lng: -40.3128 },
    'vitoria': { lat: -20.3155, lng: -40.3128 },
    'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
    'são paulo': { lat: -23.5505, lng: -46.6333 },
    'sao paulo': { lat: -23.5505, lng: -46.6333 },
    'curitiba': { lat: -25.4284, lng: -49.2733 },
    'florianópolis': { lat: -27.5949, lng: -48.5480 },
    'florianopolis': { lat: -27.5949, lng: -48.5480 },
    'porto alegre': { lat: -30.0346, lng: -51.2177 },

    // RMC e Interior de SP
    'campinas': { lat: -22.9068, lng: -47.0614 },
    'hortolândia': { lat: -22.8604, lng: -47.1655 },
    'hortolandia': { lat: -22.8604, lng: -47.1655 },
    'sumaré': { lat: -22.8219, lng: -47.2667 },
    'sumare': { lat: -22.8219, lng: -47.2667 },
    'americana': { lat: -22.7394, lng: -47.3314 },
    'indaiatuba': { lat: -23.0903, lng: -47.2181 },
    'valinhos': { lat: -22.9708, lng: -46.9961 },
    'vinhedo': { lat: -23.0296, lng: -46.9744 },
    'jundiaí': { lat: -23.1857, lng: -46.8892 },
    'jundiai': { lat: -23.1857, lng: -46.8892 },
    'itatiba': { lat: -23.0058, lng: -46.8388 },
    'limeira': { lat: -22.5647, lng: -47.4017 },
    'piracicaba': { lat: -22.7253, lng: -47.6492 },
    'rio claro': { lat: -22.4103, lng: -47.5606 },
    'sorocaba': { lat: -23.5015, lng: -47.4526 },
    'santos': { lat: -23.9608, lng: -46.3339 },
    'são josé dos campos': { lat: -23.1896, lng: -45.8841 },
    'sao jose dos campos': { lat: -23.1896, lng: -45.8841 },
    'ribeirão preto': { lat: -21.1704, lng: -47.8103 },
    'ribeirao preto': { lat: -21.1704, lng: -47.8103 },
    'bauru': { lat: -22.3147, lng: -49.0606 },
    'araraquara': { lat: -21.7946, lng: -48.1756 },
    'são carlos': { lat: -22.0175, lng: -47.8908 },
    'sao carlos': { lat: -22.0175, lng: -47.8908 },
    'franca': { lat: -20.5386, lng: -47.4008 },
    'são josé do rio preto': { lat: -20.8113, lng: -49.3758 },
    'sao jose do rio preto': { lat: -20.8113, lng: -49.3758 },
    'taubaté': { lat: -23.0264, lng: -45.5552 },
    'taubate': { lat: -23.0264, lng: -45.5552 },
    'guarulhos': { lat: -23.4542, lng: -46.5337 },
    'santo andré': { lat: -23.6639, lng: -46.5383 },
    'santo andre': { lat: -23.6639, lng: -46.5383 },
    'são bernardo': { lat: -23.6944, lng: -46.5654 },
    'sao bernardo': { lat: -23.6944, lng: -46.5654 },
    'osasco': { lat: -23.5325, lng: -46.7917 },
    'barueri': { lat: -23.5112, lng: -46.8761 },
    'niteroi': { lat: -22.8833, lng: -43.1036 },
    'niterói': { lat: -22.8833, lng: -43.1036 },
    'petrópolis': { lat: -22.5049, lng: -43.1788 },
    'petropolis': { lat: -22.5049, lng: -43.1788 },
    'uberlândia': { lat: -18.9186, lng: -48.2772 },
    'uberlandia': { lat: -18.9186, lng: -48.2772 },
    'juiz de fora': { lat: -21.7587, lng: -43.3496 },
    'contagem': { lat: -19.9317, lng: -44.0536 },
    'ouro preto': { lat: -20.3856, lng: -43.5035 },
    'tiradentes': { lat: -21.1106, lng: -44.1783 },
    'londrina': { lat: -23.3103, lng: -51.1628 },
    'maringá': { lat: -23.4210, lng: -51.9331 },
    'maringa': { lat: -23.4210, lng: -51.9331 },
    'foz do iguaçu': { lat: -25.5469, lng: -54.5882 },
    'foz do iguacu': { lat: -25.5469, lng: -54.5882 },
    'joinville': { lat: -26.3045, lng: -48.8487 },
    'blumenau': { lat: -26.9194, lng: -49.0661 },
    'balneário camboriú': { lat: -26.9926, lng: -48.6352 },
    'balneario camboriu': { lat: -26.9926, lng: -48.6352 },
    'caxias do sul': { lat: -29.1681, lng: -51.1794 },
    'pelotas': { lat: -31.7654, lng: -52.3376 },
    'olinda': { lat: -8.0089, lng: -34.8553 },
    'caruaru': { lat: -8.2825, lng: -35.9761 },
    'petrolina': { lat: -9.3886, lng: -40.5032 },
    'feira de santana': { lat: -12.2667, lng: -38.9667 },
    'vitória da conquista': { lat: -14.8661, lng: -40.8394 },
    'vitoria da conquista': { lat: -14.8661, lng: -40.8394 },
    'ilhéus': { lat: -14.7936, lng: -39.0461 },
    'ilheus': { lat: -14.7936, lng: -39.0461 },
    'porto seguro': { lat: -16.4497, lng: -39.0647 },
    'palmas': { lat: -10.2491, lng: -48.3243 },
    'macapá': { lat: 0.0355, lng: -51.0705 },
    'macapa': { lat: 0.0355, lng: -51.0705 },
    'boa vista': { lat: 2.8235, lng: -60.6758 },
    'rio branco': { lat: -9.9754, lng: -67.8249 },
    'porto velho': { lat: -8.7619, lng: -63.9039 },
    // Cidades Turísticas / Culturais Adicionais
    'campos do jordão': { lat: -22.7394, lng: -45.5913 },
    'campos do jordao': { lat: -22.7394, lng: -45.5913 },
    'gramado': { lat: -29.3788, lng: -50.8739 },
    'canela': { lat: -29.3650, lng: -50.8108 },
    'garanhuns': { lat: -8.8903, lng: -36.4925 },
    'parintins': { lat: -2.6289, lng: -56.7358 },
    'jaguaripe': { lat: -13.1114, lng: -38.8961 },
    'ouro branco': { lat: -20.5222, lng: -43.6917 },
    'angra dos reis': { lat: -23.0067, lng: -44.3181 },
    'búzios': { lat: -22.7469, lng: -41.8817 },
    'buzios': { lat: -22.7469, lng: -41.8817 },
    'cabo frio': { lat: -22.8890, lng: -42.0268 },
    'paraty': { lat: -23.2178, lng: -44.7131 },
    'sobral': { lat: -3.6860, lng: -40.3497 },
    'juazeiro do norte': { lat: -7.2131, lng: -39.3151 },
    'mossoró': { lat: -5.1878, lng: -37.3442 },
    'mossoro': { lat: -5.1878, lng: -37.3442 },
    'campina grande': { lat: -7.2219, lng: -35.8811 },
    'criciúma': { lat: -28.6775, lng: -49.3703 },
    'criciuma': { lat: -28.6775, lng: -49.3703 },
    'itajaí': { lat: -26.9078, lng: -48.6619 },
    'itajai': { lat: -26.9078, lng: -48.6619 },
    'ubatuba': { lat: -23.4339, lng: -45.0711 },
    'caraguatatuba': { lat: -23.6226, lng: -45.4128 },
    'ilhabela': { lat: -23.7781, lng: -45.3581 },
    'guarujá': { lat: -23.9931, lng: -46.2564 },
    'guaruja': { lat: -23.9931, lng: -46.2564 },
    'paulínia': { lat: -22.7611, lng: -47.1542 },
    'paulinia': { lat: -22.7611, lng: -47.1542 },
    'atibaia': { lat: -23.1169, lng: -46.5503 },
    'santa bárbara d\'oeste': { lat: -22.7561, lng: -47.4158 },
    'santa barbara d\'oeste': { lat: -22.7561, lng: -47.4158 },
  };

  private static landmarkOverrides: Array<{ keywords: string[]; lat: number; lng: number }> = [
    // Parintins
    { keywords: ['bumbódromo', 'bumbodromo', 'parintins'], lat: -2.6289, lng: -56.7358 },

    // Campinas - Equipamentos e Locais de Eventos Principais
    { keywords: ['concha acústica', 'concha acustica', 'auditório beethoven', 'auditorio beethoven', 'taquaral', 'parque taquaral', 'lagoa do taquaral', 'parque portugal'], lat: -22.8728, lng: -47.0492 },
    { keywords: ['brasuca', 'brasuca multiculturas'], lat: -22.8216, lng: -47.0877 },
    { keywords: ['nashville', 'nashville music bar', 'nashville rock'], lat: -22.8180, lng: -47.0850 },
    { keywords: ['santo rock bar', 'santo rock'], lat: -22.8216, lng: -47.0877 },
    { keywords: ['expo dom pedro', 'expo d. pedro', 'expo d pedro'], lat: -22.8525, lng: -47.0628 },
    { keywords: ['galleria shopping', 'galleria'], lat: -22.8625, lng: -47.0258 },
    { keywords: ['iguatemi campinas', 'teatro iguatemi'], lat: -22.8928, lng: -47.0255 },
    { keywords: ['parque dom pedro', 'parque d. pedro shopping'], lat: -22.8485, lng: -47.0625 },
    { keywords: ['hotel premium', 'hotel premium campinas', 'san martim'], lat: -22.8752, lng: -47.1432 },
    { keywords: ['nazareno central', 'igreja do nazareno central', 'senador saraiva'], lat: -22.9015, lng: -47.0620 },
    { keywords: ['sesc campinas', 'sesc bonfim', 'rua dom josé i', 'dom jose i'], lat: -22.9038, lng: -47.0781 },
    { keywords: ['estação cultura', 'estacao cultura', 'praça marechal floriano'], lat: -22.9080, lng: -47.0670 },
    { keywords: ['teatro castro mendes', 'teatro municipal castro mendes', 'praça corrêa de lemos', 'praca correa de lemos', 'vila industrial'], lat: -22.9133, lng: -47.0723 },
    { keywords: ['bosque dos jequitibás', 'bosque dos jequitibas'], lat: -22.9090, lng: -47.0520 },
    { keywords: ['centro de convivência', 'centro de convivencia', 'praça imprensa fluminense', 'cambuí', 'cambui'], lat: -22.8985, lng: -47.0570 },
    { keywords: ['macc', 'museu de arte contemporânea', 'palácio dos azulejos', 'praça bento quirino', 'praca bento quirino'], lat: -22.9054, lng: -47.0615 },
    { keywords: ['unicamp', 'casa do lago', 'ginásio multidisciplinar', 'ginasio multidisciplinar', 'instituto de artes', 'barão geraldo', 'barao geraldo', 'cidade universitária'], lat: -22.8185, lng: -47.0690 },
    { keywords: ['largo do rosário', 'largo do rosario', 'praça do congresso', 'praca do congresso'], lat: -22.9050, lng: -47.0600 },
    { keywords: ['catedral metropolitana', 'catedral de campinas'], lat: -22.9058, lng: -47.0588 },
    { keywords: ['vila itapura', 'itapura', 'galeria estação', 'galeria estacao'], lat: -22.8935, lng: -47.0580 },
    { keywords: ['sousas', 'praça beira rio', 'praca beira rio'], lat: -22.8890, lng: -46.9770 },
    { keywords: ['joaquim egídio', 'joaquim egidio'], lat: -22.9020, lng: -46.9230 },
    { keywords: ['prime hall'], lat: -22.8258, lng: -47.0495 },
    { keywords: ['campinas hall'], lat: -22.8360, lng: -47.0510 },

    // Região Metropolitana de Campinas (RMC)
    { keywords: ['jaguariúna', 'jaguariuna', 'reduto do rodeo', 'reduto do rodeio', 'redu jaguariúna'], lat: -22.7056, lng: -47.0008 },
    { keywords: ['faici', 'recinto faici'], lat: -23.0850, lng: -47.2181 },
    { keywords: ['praça dom pedro ii', 'praca dom pedro ii', 'indaiatuba'], lat: -23.0900, lng: -47.2180 },
    { keywords: ['parque ecológico de hortolândia', 'remanso das águas', 'hortolândia', 'hortolandia'], lat: -22.8610, lng: -47.1720 },
    { keywords: ['centro de eventos de americana', 'parque ecológico de americana', 'americana'], lat: -22.7390, lng: -47.3310 },
    { keywords: ['praça das bandeiras', 'sumaré', 'sumare'], lat: -22.8219, lng: -47.2667 },
    { keywords: ['valinhos', 'parque do figueira'], lat: -22.9708, lng: -46.9961 },
    { keywords: ['vinhedo', 'jayme ferragut', 'hopi hari', 'wet\'n wild'], lat: -23.0296, lng: -46.9744 },
    { keywords: ['paulínia', 'paulinia', 'sambódromo de paulínia'], lat: -22.7611, lng: -47.1542 },
    { keywords: ['holambra', 'expoflora'], lat: -22.6335, lng: -47.0560 },
    { keywords: ['paraty', 'centro histórico paraty'], lat: -23.2180, lng: -44.7135 },

    // São Paulo
    { keywords: ['autódromo de interlagos', 'autodromo de interlagos', 'interlagos'], lat: -23.7010, lng: -46.6970 },
    { keywords: ['sala são paulo', 'sala sao paulo'], lat: -23.5350, lng: -46.6389 },
    { keywords: ['sesc avenida paulista', 'sesc paulista', 'avenida paulista'], lat: -23.5707, lng: -46.6475 },
    { keywords: ['parque ibirapuera', 'auditório ibirapuera', 'auditorio ibirapuera'], lat: -23.5874, lng: -46.6576 },
    { keywords: ['theatro municipal de são paulo', 'theatro municipal de sao paulo', 'teatro municipal de são paulo'], lat: -23.5453, lng: -46.6386 },
    { keywords: ['anhembi', 'pavorama', 'pavilhão de exposições'], lat: -23.5152, lng: -46.6433 },
    { keywords: ['centro cultural são paulo', 'ccsp', 'vergueiro'], lat: -23.5707, lng: -46.6397 },
    { keywords: ['teatro sérgio cardoso', 'teatro sergio cardoso'], lat: -23.5594, lng: -46.6453 },
    { keywords: ['aliança francesa', 'alianca francesa'], lat: -23.5461, lng: -46.6450 },
    { keywords: ['teatro do sesi', 'sesi paulista'], lat: -23.5627, lng: -46.6548 },
    { keywords: ['praça da sé', 'praca da se'], lat: -23.5505, lng: -46.6333 },

    // Salvador
    { keywords: ['circuito dodô', 'circuito dodo', 'barra-ondina', 'barra ondina'], lat: -13.0089, lng: -38.5233 },

    // Rio de Janeiro
    { keywords: ['parque das ruínas', 'parque das ruinas', 'santa teresa'], lat: -22.9168, lng: -43.1818 },
    { keywords: ['sesc copacabana'], lat: -22.9733, lng: -43.1880 },
    { keywords: ['largo da carioca'], lat: -22.9062, lng: -43.1786 },
    { keywords: ['maracanã', 'maracana'], lat: -22.9121, lng: -43.2302 },
    { keywords: ['maracanãzinho', 'maracanazinho'], lat: -22.9118, lng: -43.2285 },

    // Belo Horizonte
    { keywords: ['praça da liberdade', 'praca da liberdade'], lat: -19.9323, lng: -43.9378 },
    { keywords: ['minascentro'], lat: -19.9213, lng: -43.9423 },

    // Teresina
    { keywords: ['theatro 4 de setembro', 'praça pedro ii', 'praca pedro ii'], lat: -5.0911, lng: -42.8122 },
    { keywords: ['mercado cultural euclides da cunha'], lat: -5.0880, lng: -42.8090 },
  ];

  public static geocodeAddress(address: string, cityRegion: string): { lat: number; lng: number; isValid: boolean } {
    const combined = `${address || ''} ${cityRegion || ''}`.toLowerCase().trim();

    // 1. Check precise landmark overrides first for exact venue pin positioning
    for (const landmark of this.landmarkOverrides) {
      if (landmark.keywords.some((kw) => combined.includes(kw))) {
        return { lat: landmark.lat, lng: landmark.lng, isValid: true };
      }
    }

    // 2. Match explicit city names (sorted longest first)
    const sortedCities = Object.entries(this.knownCities).sort((a, b) => b[0].length - a[0].length);

    for (const [cityName, coords] of sortedCities) {
      if (combined.includes(cityName)) {
        return { lat: coords.lat, lng: coords.lng, isValid: true };
      }
    }

    // 2. Check state acronyms if no city name matched directly
    const stateMap: Record<string, { lat: number; lng: number }> = {
      'pi': { lat: -5.0920, lng: -42.8038 }, // Teresina
      'rj': { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
      'mg': { lat: -19.9167, lng: -43.9345 }, // Belo Horizonte
      'ba': { lat: -12.9777, lng: -38.5016 }, // Salvador
      'pe': { lat: -8.0476, lng: -34.8770 }, // Recife
      'ce': { lat: -3.7172, lng: -38.5433 }, // Fortaleza
      'df': { lat: -15.7975, lng: -47.8919 }, // Brasília
      'pr': { lat: -25.4284, lng: -49.2733 }, // Curitiba
      'rs': { lat: -30.0346, lng: -51.2177 }, // Porto Alegre
      'sc': { lat: -27.5949, lng: -48.5480 }, // Florianópolis
      'go': { lat: -16.6809, lng: -49.2565 }, // Goiânia
      'es': { lat: -20.3155, lng: -40.3128 }, // Vitória
      'am': { lat: -3.1190, lng: -60.0217 }, // Manaus
      'pa': { lat: -1.4558, lng: -48.4902 }, // Belém
      'ms': { lat: -20.4697, lng: -54.6201 }, // Campo Grande
      'mt': { lat: -15.6010, lng: -56.0979 }, // Cuiabá
      'al': { lat: -9.6658, lng: -35.7350 }, // Maceió
      'rn': { lat: -5.7945, lng: -35.2110 }, // Natal
      'pb': { lat: -7.1195, lng: -34.8450 }, // João Pessoa
      'se': { lat: -10.9472, lng: -37.0731 }, // Aracaju
      'ma': { lat: -2.5307, lng: -44.3068 }, // São Luís
    };

    const stateMatch = combined.match(/(?:-\s*|\s+)([a-z]{2})(?:\s+|$)/i);
    if (stateMatch) {
      const st = stateMatch[1].toLowerCase();
      if (stateMap[st]) {
        return { lat: stateMap[st].lat, lng: stateMap[st].lng, isValid: true };
      }
    }

    // 3. Default fallback to Campinas base (-22.9068, -47.0614)
    return { lat: -22.9068, lng: -47.0614, isValid: true };
  }

  /**
   * Asynchronously geocodes a specific street address & city using OpenStreetMap Nominatim
   * with automatic fallback to local rule-based geocoding.
   */
  public static async geocodeAddressAsync(address: string, cityRegion: string): Promise<{ lat: number; lng: number; isValid: boolean }> {
    const syncFallback = this.geocodeAddress(address, cityRegion);

    if (!address || address.trim().length < 3) {
      return syncFallback;
    }

    // 1. Check if it hit an exact landmark override first
    const combinedLower = `${address} ${cityRegion}`.toLowerCase();
    for (const landmark of this.landmarkOverrides) {
      if (landmark.keywords.some((kw) => combinedLower.includes(kw))) {
        return { lat: landmark.lat, lng: landmark.lng, isValid: true };
      }
    }

    // 2. Query Nominatim API for exact street level accuracy
    try {
      const cleanAddress = address.replace(/[^\w\s,.-]/gi, ' ').trim();
      const cleanCity = cityRegion.replace(/[^\w\s,.-]/gi, ' ').trim();
      const searchTerms = encodeURIComponent(`${cleanAddress}, ${cleanCity}, Brasil`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchTerms}&limit=1`, {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'pt-BR,pt;q=0.9',
        }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results) && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            return { lat, lng, isValid: true };
          }
        }
      }
    } catch (e) {
      console.warn('Geocoding service: Nominatim fallback triggered:', e);
    }

    return syncFallback;
  }

  /**
   * Helper to detect known city name in any raw text string
   */
  public static findCityInText(text: string): string | null {
    if (!text) return null;
    const lower = text.toLowerCase().trim();
    const sortedCities = Object.entries(this.knownCities).sort((a, b) => b[0].length - a[0].length);
    for (const [cityName] of sortedCities) {
      if (lower.includes(cityName)) {
        const words = cityName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1));
        return words.join(' ');
      }
    }
    return null;
  }

  /**
   * Applies a tiny micro-dispersion (10m - 30m max) to coordinates based on string input
   * so events at identical venues don't completely overlap on Leaflet map markers.
   */
  public static jitterCoordinates(lat: number, lng: number, seedKey: string, _index: number = 0): { lat: number; lng: number } {
    let hash = 0;
    for (let i = 0; i < seedKey.length; i++) {
      hash = (hash << 5) - hash + seedKey.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    const angle = (absHash % 360) * (Math.PI / 180);
    // Micro radius: 0.00008 to 0.0002 degrees (~8m to 20m)
    const radius = 0.00008 + ((absHash % 15) / 100000);
    
    return {
      lat: Number((lat + Math.cos(angle) * radius).toFixed(6)),
      lng: Number((lng + Math.sin(angle) * radius).toFixed(6)),
    };
  }
}

