import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const QUERIES = [
  "proximos grandes festivais e shows de musica no Brasil de setembro a dezembro 2026",
  "agenda cultural oficial de teatro e espetaculos em Sao Paulo e Rio de Janeiro 2026 2027",
  "festivais de gastronomia literatura e arte no Nordeste Salvador Recife Olinda Fortaleza 2026 2027",
  "eventos culturais e festivais no Sul Curitiba Florianopolis Porto Alegre Gramado Canela 2026 2027",
  "agenda de eventos e festivais de arte no Centro-Oeste e Norte Brasilia Goiania Manaus Belem Parintins 2026 2027",
  "exposicoes de arte bienais feiras literarias e festivais de cinema no Brasil 2026 2027",
];

async function run() {
  console.log('--- Step 1: Running GPT Web Search Crawls ---');
  for (const query of QUERIES) {
    console.log(`\nCrawling query via GPT: "${query}"...`);
    try {
      const res = await fetch('http://localhost:3000/api/ai/crawl-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      console.log(`Result: ${data.message || (data.crawledEvents ? data.crawledEvents.length + ' events' : 'ok')}`);
    } catch (err) {
      console.error(`Error crawling "${query}":`, err.message);
    }
  }

  console.log('\n--- Step 2: Fetching All Saved Events from Local Database ---');
  const savedRes = await fetch('http://localhost:3000/api/events/saved');
  const savedData = await savedRes.json();
  const eventsList = Array.isArray(savedData) ? savedData : (savedData.events || []);

  console.log(`Total saved events in database: ${eventsList.length}`);

  console.log('\n--- Step 3: Syncing All Events directly to Firebase Firestore ---');
  let syncedCount = 0;
  for (let i = 0; i < eventsList.length; i++) {
    const ev = eventsList[i];
    const docId = ev.id || `saved-event-${String(ev.sourceUrl || ev.title || i).replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${i}`;
    
    const firestorePayload = {
      id: docId,
      title: ev.title || 'Evento Cultural',
      dateRange: ev.dateRange || '2026',
      category: ev.category || 'Música',
      description: ev.description || '',
      address: ev.address || '',
      cityRegion: ev.cityRegion || 'Brasil',
      lat: typeof ev.lat === 'number' && !isNaN(ev.lat) ? ev.lat : -22.9068,
      lng: typeof ev.lng === 'number' && !isNaN(ev.lng) ? ev.lng : -47.0614,
      image: ev.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      rating: ev.rating || 0,
      reviewsCount: ev.reviewsCount || 0,
      isVirtual: Boolean(ev.isVirtual),
      isPaid: Boolean(ev.isPaid),
      price: ev.price || 'Gratuito',
      organizer: ev.organizer || 'Organização Cultural',
      sourceUrl: ev.sourceUrl || '',
      pinColor: ['purple', 'orange', 'green', 'red', 'blue', 'yellow'][i % 6],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const docRef = doc(db, 'events', docId);
      await setDoc(docRef, firestorePayload, { merge: true });
      syncedCount++;
    } catch (e) {
      console.error(`Error saving event "${ev.title}" to Firestore:`, e.message);
    }
  }

  console.log(`\n✅ Finished syncing! ${syncedCount} / ${eventsList.length} events successfully saved to Firebase Firestore.`);

  // Verify total count in Firestore
  const colRef = collection(db, 'events');
  const snap = await getDocs(colRef);
  console.log(`🔥 Total Firestore documents in collection 'events': ${snap.size}`);
}

run().catch(console.error);
