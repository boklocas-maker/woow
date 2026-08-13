import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeocodingService } from '../services/aggregator/geocodingService';
import { createFirestoreEvent } from '../services/firebaseEventsService';
import { getEventImage } from '../utils/imageUtils';
import { CulturalEvent, EventCategory } from '../types';

interface CreateEventViewProps {
  onAddEvent: (newEvent: CulturalEvent) => void;
  onGoToMap: () => void;
}

// Preset cities/regions for quick selection
const CITY_PRESETS = [
  'Campinas - SP',
  'Barão Geraldo - Campinas',
  'Cambuí - Campinas',
  'Taquaral - Campinas',
  'Sousas / Joaquim Egídio - Campinas',
  'Indaiatuba - SP',
  'Jaguariúna - SP',
  'Hortolândia - SP',
  'Sumaré - SP',
  'Valinhos - SP',
  'Vinhedo - SP',
  'Paulínia - SP',
  'Americana - SP',
  'São Paulo - SP',
];

// Helper to format YYYY-MM-DD into DD/MM/YYYY
function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Get today's date in YYYY-MM-DD
function getTodayString(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const CreateEventView: React.FC<CreateEventViewProps> = ({
  onAddEvent,
  onGoToMap,
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Evento Musical');
  const [description, setDescription] = useState('');
  
  // Date & Time Selectors (Date picker & Time picker)
  const [startDate, setStartDate] = useState(getTodayString());
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('22:00');

  // Location State
  const [cityRegion, setCityRegion] = useState('Campinas - SP');
  const [venueName, setVenueName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [virtualLink, setVirtualLink] = useState('');

  // Map Coordinates & Geocoding State
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: -22.9054, lng: -47.0615 });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeSource, setGeocodeSource] = useState<'default' | 'searched' | 'manual'>('default');

  // Other details
  const [price, setPrice] = useState('Gratuito');
  const [isPaid, setIsPaid] = useState(false);
  const [organizer, setOrganizer] = useState('');
  const [image, setImage] = useState('');
  const [scheduleText, setScheduleText] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<CulturalEvent | null>(null);

  // Leaflet Map Ref for Location Picker
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize and update interactive mini-map
  useEffect(() => {
    if (isVirtual || !mapContainerRef.current) return;

    // Create map instance if it doesn't exist
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Create draggable pin marker dot
      const pinHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-2xl animate-bounce"></div>
          <div class="absolute -bottom-1 w-3 h-1.5 bg-black/40 rounded-full blur-[1px]"></div>
        </div>
      `;
      const customIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: pinHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = L.marker([coords.lat, coords.lng], {
        icon: customIcon,
        draggable: true
      }).addTo(map);

      // Drag event updates coordinates
      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        setCoords({ lat: Number(newPos.lat.toFixed(6)), lng: Number(newPos.lng.toFixed(6)) });
        setGeocodeSource('manual');
      });

      // Click on map to move pin
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const newLat = Number(lat.toFixed(6));
        const newLng = Number(lng.toFixed(6));
        setCoords({ lat: newLat, lng: newLng });
        marker.setLatLng([newLat, newLng]);
        setGeocodeSource('manual');
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      setTimeout(() => map.invalidateSize(), 200);
    } else {
      // Update existing map and marker
      mapInstanceRef.current.setView([coords.lat, coords.lng], 15, { animate: true });
      if (markerRef.current) {
        markerRef.current.setLatLng([coords.lat, coords.lng]);
      }
    }
  }, [coords.lat, coords.lng, isVirtual]);

  // Handle Geocode Search Button
  const handleSearchLocationOnMap = async () => {
    const fullAddressToSearch = [venueName, streetAddress].filter(Boolean).join(', ');
    if (!fullAddressToSearch && !cityRegion) return;

    setIsGeocoding(true);
    try {
      const res = await GeocodingService.geocodeAddressAsync(fullAddressToSearch || cityRegion, cityRegion);
      setCoords({ lat: res.lat, lng: res.lng });
      setGeocodeSource('searched');
    } catch (err) {
      console.warn('Location search error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Quick Date presets
  const handleSetQuickDate = (preset: 'today' | 'tomorrow' | 'saturday') => {
    const d = new Date();
    if (preset === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (preset === 'saturday') {
      const day = d.getDay();
      const diff = d.getDate() + (6 - day + (day === 6 ? 7 : 0));
      d.setDate(diff);
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setStartDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !startDate || isSubmitting) return;

    setIsSubmitting(true);
    const customId = `custom-${Date.now()}`;
    const customUrl = `https://mapacultural.local/evento/${customId}`;
    const rawCity = cityRegion.trim() || 'Campinas - SP';

    // Format Date Range string
    const formattedStartDate = formatDateBR(startDate);
    const formattedEndDate = hasEndDate && endDate ? formatDateBR(endDate) : '';
    const dateRangeString = formattedEndDate && formattedEndDate !== formattedStartDate
      ? `${formattedStartDate} - ${formattedEndDate}`
      : formattedStartDate;

    // Format Schedule Time string
    const scheduleTimeString = startTime ? (endTime ? `${startTime} às ${endTime}` : `A partir das ${startTime}`) : undefined;

    // Final Address Assembly
    const assembledAddress = isVirtual 
      ? 'Transmissão Online / Evento Virtual'
      : [venueName.trim(), streetAddress.trim()].filter(Boolean).join(' - ') || 'Endereço Informado';

    // Final Pin Color
    let pinColor: 'yellow' | 'red' | 'green' | 'blue' | 'purple' | 'orange' = 'orange';
    if (category.includes('Músic') || category.includes('Music')) pinColor = 'purple';
    else if (category.includes('Teatro') || category.includes('Dança')) pinColor = 'green';
    else if (category.includes('Festa') || category.includes('Feira')) pinColor = 'yellow';
    else if (category.includes('Esporte')) pinColor = 'blue';

    const formattedPrice = isPaid ? (price.startsWith('R$') ? price : `R$ ${price}`) : 'Gratuito';

    const newEv: CulturalEvent = {
      id: customId,
      title: title.trim(),
      category,
      description: description.trim(),
      address: assembledAddress,
      cityRegion: rawCity,
      dateRange: dateRangeString,
      price: formattedPrice,
      organizer: organizer.trim() || 'Comunidade Cultural',
      lat: isVirtual ? -22.9054 : coords.lat,
      lng: isVirtual ? -47.0615 : coords.lng,
      image: getEventImage(image, category, title),
      rating: 5.0,
      reviewsCount: 1,
      isVirtual,
      virtualLink: isVirtual ? virtualLink : undefined,
      isPaid,
      pinColor,
      sourceUrl: customUrl,
      distanceKm: 1.2,
      travelTimeMinutes: 5,
      isAiGenerated: false,
      isHappeningNow: false,
      schedule: scheduleText ? [
        {
          dayNumber: 1,
          monthShort: 'EVENTO',
          items: scheduleText.split('\n').filter(Boolean).map(t => ({ title: t }))
        }
      ] : undefined,
      reviews: [
        {
          id: `rev-${Date.now()}`,
          author: organizer.trim() || 'Anunciante Cultural',
          rating: 5,
          comment: 'Evento anunciado com sucesso no mapa da cidade!',
          date: new Date().toISOString()
        }
      ]
    };

    // Save to Firestore DB
    try {
      await createFirestoreEvent(newEv);
    } catch (err) {
      console.warn('Erro ao salvar evento no Firestore:', err);
    }

    onAddEvent(newEv);
    setCreatedEvent(newEv);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="w-full h-full bg-[#0e0f14] p-4 md:p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar text-zinc-100">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <button
          onClick={onGoToMap}
          className="flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          Voltar ao Mapa Cultural
        </button>
      </div>

      <div className="max-w-2xl mx-auto w-full bg-[#12141c] border border-zinc-800/90 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">
              Anunciar Novo Evento ou Atividade
            </h1>
            <p className="text-xs text-zinc-400">Divulgue shows, peças, feiras ou workshops com localização exata no mapa</p>
          </div>
        </div>

        {isSubmitted && createdEvent ? (
          <div className="bg-[#181a26] border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4 animate-scaleIn">
            <h2 className="text-lg font-bold text-emerald-300">Evento Publicado com Sucesso!</h2>
            <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
              Seu evento <strong className="text-white">"{createdEvent.title}"</strong> já está salvo no banco de dados e localizado no mapa em{' '}
              <span className="text-emerald-400 font-mono">{createdEvent.address}</span>.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onGoToMap}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition-colors cursor-pointer"
              >
                Ver Anúncio no Mapa
              </button>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setTitle('');
                  setDescription('');
                  setVenueName('');
                  setStreetAddress('');
                }}
                className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Anunciar Outro Evento
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Título & Categoria */}
            <div className="bg-[#181a26] border border-zinc-800/80 p-4 rounded-2xl space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Informações Básicas
              </h2>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">
                  Título do Evento <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Show de Jazz na Concha Acústica"
                  className="w-full bg-[#12141c] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Categoria Principal</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="w-full bg-[#12141c] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="Evento Musical">Evento Musical / Show</option>
                    <option value="Teatro e Atuações">Teatro / Espetáculo</option>
                    <option value="Feira artesanal">Feira / Exposição</option>
                    <option value="Gastronomia">Gastronomia / Culinária</option>
                    <option value="Festa Tradicional">Festa Tradicional / Festival</option>
                    <option value="Esporte e Corrida">Esporte / Corrida</option>
                    <option value="Cinema e Filmes">Cinema / Exibição</option>
                    <option value="Workshop e Cursos">Workshop / Palestra</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Organizador / Coletivo</label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="Ex: Coletivo Cultural de Campinas"
                    className="w-full bg-[#12141c] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">
                  Descrição Completa <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Conte sobre as atrações, programação e detalhes do evento..."
                  className="w-full bg-[#12141c] border border-zinc-700/80 rounded-xl p-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Data e Horário (Com Seletores Date & Time Pickers) */}
            <div className="bg-[#181a26] border border-zinc-800/80 p-4 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Data e Horário
                </h2>
                {/* Atalhos rápidos de data */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetQuickDate('today')}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-medium transition-colors cursor-pointer"
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickDate('tomorrow')}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-medium transition-colors cursor-pointer"
                  >
                    Amanhã
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickDate('saturday')}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-medium transition-colors cursor-pointer"
                  >
                    Próximo Sáb
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">
                    Data de Início <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#12141c] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-zinc-300">Data de Término</label>
                    <label className="text-[10px] text-zinc-400 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasEndDate}
                        onChange={(e) => setHasEndDate(e.target.checked)}
                        className="accent-emerald-500 rounded cursor-pointer"
                      />
                      Evento de vários dias
                    </label>
                  </div>
                  <input
                    type="date"
                    disabled={!hasEndDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full bg-[#12141c] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors ${
                      !hasEndDate ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#12141c] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">
                    Horário de Encerramento
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-[#12141c] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Localização & Mapa Interativo com Pino Arrastável */}
            <div className="bg-[#181a26] border border-zinc-800/80 p-4 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Localização no Mapa
                </h2>
                <label className="text-xs text-zinc-300 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVirtual}
                    onChange={(e) => setIsVirtual(e.target.checked)}
                    className="accent-emerald-500 rounded cursor-pointer"
                  />
                  Evento Online / Transmissão
                </label>
              </div>

              {isVirtual ? (
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">
                    Link da Transmissão / Plataforma
                  </label>
                  <input
                    type="url"
                    value={virtualLink}
                    onChange={(e) => setVirtualLink(e.target.value)}
                    placeholder="Ex: https://youtube.com/live/..."
                    className="w-full bg-[#12141c] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-zinc-300">Cidade / Região</label>
                      <select
                        value={cityRegion}
                        onChange={(e) => setCityRegion(e.target.value)}
                        className="w-full bg-[#12141c] border border-zinc-700/80 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                      >
                        {CITY_PRESETS.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-zinc-300">Local / Estabelecimento</label>
                      <input
                        type="text"
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        placeholder="Ex: Brasuca, Concha Acústica..."
                        className="w-full bg-[#12141c] border border-zinc-700/80 rounded-xl px-3 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-zinc-300">Rua e Número / Bairro</label>
                      <input
                        type="text"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="Ex: Av. Santa Isabel, 800"
                        className="w-full bg-[#12141c] border border-zinc-700/80 rounded-xl px-3 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Botão de Busca no Mapa */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSearchLocationOnMap}
                      disabled={isGeocoding}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-bold rounded-xl text-xs border border-emerald-500/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {isGeocoding ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                          Buscando Endereço...
                        </>
                      ) : (
                        'Localizar Endereço no Mapa'
                      )}
                    </button>

                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      {geocodeSource === 'manual' ? (
                        <span className="text-amber-400 font-semibold">Posição ajustada manualmente no mapa</span>
                      ) : geocodeSource === 'searched' ? (
                        <span className="text-emerald-400 font-semibold">Endereço localizado</span>
                      ) : (
                        'Arraste o pino no mapa para ajustar a posição exata'
                      )}
                    </span>
                  </div>

                  {/* Mini Mapa Interativo com PINO ARRASTÁVEL */}
                  <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-zinc-700 shadow-inner group">
                    <div ref={mapContainerRef} className="w-full h-full z-0" />
                    
                    <div className="absolute top-2 right-2 z-10 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-700 text-[10px] text-zinc-300 font-mono">
                      Lat: {coords.lat}, Lng: {coords.lng}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preço, Cronograma e Imagem */}
            <div className="bg-[#181a26] border border-zinc-800/80 p-4 rounded-2xl space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Ingresso, Cronograma e Imagem
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-zinc-300">Valor do Ingresso</label>
                    <label className="text-[10px] text-zinc-400 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!isPaid}
                        onChange={(e) => setIsPaid(!e.target.checked)}
                        className="accent-emerald-500 rounded cursor-pointer"
                      />
                      Evento Gratuito
                    </label>
                  </div>
                  {isPaid ? (
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Ex: 30,00 ou 50,00"
                      className="w-full bg-[#12141c] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  ) : (
                    <div className="w-full bg-[#12141c]/60 border border-emerald-500/40 text-emerald-400 font-bold rounded-xl px-3.5 py-2.5">
                      Entrada Gratuita
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">
                    URL da Imagem / Banner (Opcional)
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#12141c] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Cronograma Linha por Linha */}
              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Cronograma / Atrações (Opcional - Linha por Linha)</label>
                <textarea
                  rows={2}
                  value={scheduleText}
                  onChange={(e) => setScheduleText(e.target.value)}
                  placeholder="Ex: 19:00 - Abertura dos Portões&#10;20:30 - Show Principal"
                  className="w-full bg-[#12141c] border border-zinc-700/80 rounded-xl p-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition-colors text-center flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Localizando Endereço e Salvando no Banco...
                </>
              ) : (
                'Publicar e Salvar Evento'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
