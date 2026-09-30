"use client";

import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, CloudSun, RefreshCw } from 'lucide-react';
import {
  NZ_LOCAL_SOURCES, NZ_WEATHER_PLACES, findNzWeatherPlace, isSnapshotStale,
  updatesSnapshotSchema, weatherSnapshotSchema, type UpdatesSnapshot, type WeatherSnapshot,
} from '@/apps/do/personal/local-updates';
import styles from './LifeAdminLocalUpdates.module.css';

type Snapshot = WeatherSnapshot | UpdatesSnapshot;
const parseWeather = (body: unknown) => weatherSnapshotSchema.parse(body);
const parseUpdates = (body: unknown) => updatesSnapshotSchema.parse(body);

/** User-triggered only; dismissal/city changes invalidate any late response. */
function usePublicSnapshot<T extends Snapshot>(parse: (body: unknown) => T) {
  const [snapshot, setSnapshot] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => { controller.current?.abort(); controller.current = null; }, []);
  function cancel(message = '') {
    controller.current?.abort(); controller.current = null;
    setBusy(false); setSnapshot(null); setNotice(message);
  }
  async function load(url: string) {
    if (controller.current) return;
    const request = new AbortController(); controller.current = request;
    setBusy(true); setSnapshot(null); setNotice('');
    try {
      const response = await fetch(url, { cache: 'no-store', credentials: 'omit', signal: request.signal });
      const body: unknown = await response.json();
      if (request.signal.aborted || controller.current !== request) return;
      if (response.status === 429) { setNotice('Please wait a minute before checking again.'); return; }
      const result = parse(body);
      if (!response.ok && result.status !== 'unavailable') throw new Error('source_unavailable');
      setSnapshot(result);
      if (result.status === 'unavailable') setNotice(result.message);
    } catch {
      if (!request.signal.aborted && controller.current === request) setNotice('This source could not be checked. Try again or open the official source below.');
    } finally {
      if (controller.current === request) { controller.current = null; setBusy(false); }
    }
  }
  return { snapshot, busy, notice, load, cancel };
}

function nzTime(value: string, dateOnly = false) {
  return new Date(value).toLocaleString('en-NZ', {
    timeZone: 'Pacific/Auckland', day: 'numeric', month: 'short', year: 'numeric',
    ...(dateOnly ? {} : { hour: 'numeric', minute: '2-digit' }),
  });
}

function SourceStatus({ snapshot, now }: { snapshot: Snapshot; now: number }) {
  const stale = isSnapshotStale(snapshot, now);
  return <p className={styles.evidence}>
    {stale ? 'Older snapshot · check again before relying on it' : snapshot.freshness === 'cached' ? 'Cached source snapshot' : snapshot.freshness === 'revalidated' ? 'Rechecked with source · unchanged' : 'Retrieved from source'}
    <br />Last checked {nzTime(snapshot.checkedAt)} NZ time
  </p>;
}

export function LifeAdminLocalUpdates() {
  const cityId = useId();
  const weatherHelpId = useId();
  const [place, setPlace] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const weather = usePublicSnapshot(parseWeather);
  const updates = usePublicSnapshot(parseUpdates);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 15_000); return () => clearInterval(timer); }, []);
  const selected = findNzWeatherPlace(place);
  const forecast = weather.snapshot?.status === 'available' && weather.snapshot.placeId === place ? weather.snapshot : null;
  const news = updates.snapshot?.status === 'available' ? updates.snapshot : null;

  return <section className={styles.root} aria-label="Weather and official updates">
    <details className={styles.panel} onToggle={event => { if (!event.currentTarget.open) weather.cancel(); }}>
      <summary><CloudSun size={19} aria-hidden="true" /><span>Weather for your day</span></summary>
      <div className={styles.body}>
        <p>A useful forecast for a nearby city. No extra account needed.</p>
        <label className={styles.label} htmlFor={cityId}>Choose a city or town</label>
        <select id={cityId} value={place} aria-describedby={weatherHelpId} onChange={event => { weather.cancel(); setPlace(event.target.value); }}>
          <option value="">Choose a place</option>
          {NZ_WEATHER_PLACES.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
        </select>
        <p id={weatherHelpId} className={styles.hint}>When you check, DO asks MET Norway for that city centre’s forecast. Your exact location, notes and account details are not sent. The city choice is not saved.</p>
        <div className={styles.actions}>
          <button type="button" disabled={!selected || weather.busy} onClick={() => { setNow(Date.now()); void weather.load(`/api/do/nz-local-updates?source=weather&place=${place}`); }}>
            <RefreshCw size={16} aria-hidden="true" />{weather.busy ? 'Checking forecast…' : forecast ? 'Check forecast again' : 'Check city forecast'}
          </button>
          {weather.busy && <button type="button" className={styles.secondary} onClick={() => weather.cancel('Stopped showing this check. You can try again whenever you like.')}>Stop</button>}
        </div>
        {weather.notice && <p className={styles.notice} role="status">{weather.notice}</p>}
        {forecast && <div className={styles.result}>
          <h4>{selected?.name} city-centre forecast</h4>
          <SourceStatus snapshot={forecast} now={now} />
          <p className={styles.hint}>{forecast.message}</p>
          <ul className={styles.forecast}>
            {forecast.forecast.map(point => <li key={point.time}>
              <time dateTime={point.time}>{new Date(point.time).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland', weekday: 'short', hour: 'numeric', minute: '2-digit' })}</time>
              <strong>{Math.round(point.temperatureC)}°C</strong>
              <span>Wind {Math.round(point.windKmh)} km/h</span>
              <span>{point.precipitationMm === null ? 'Rain amount unavailable' : `${point.precipitationMm} mm over next ${point.precipitationHours} ${point.precipitationHours === 1 ? 'hour' : 'hours'}`}</span>
            </li>)}
          </ul>
          <p className={styles.evidence}>Forecast times are NZ time. Model updated {forecast.modelUpdatedAt ? nzTime(forecast.modelUpdatedAt) : 'time unavailable'}.</p>
          <p className={styles.hint}>{NZ_LOCAL_SOURCES.weather.attribution} <a href={NZ_LOCAL_SOURCES.weather.url} target="_blank" rel="noopener noreferrer">Source</a> · <a href={NZ_LOCAL_SOURCES.weather.licenseUrl} target="_blank" rel="noopener noreferrer">CC BY 4.0</a></p>
        </div>}
        <a className={styles.sourceLink} href={NZ_LOCAL_SOURCES.warnings} target="_blank" rel="noopener noreferrer">Check NZ weather warnings with MetService <ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
    </details>

    <details className={styles.panel} onToggle={event => { if (!event.currentTarget.open) updates.cancel(); }}>
      <summary>Official hazard updates</summary>
      <div className={styles.body}>
        <p>Read dated national updates from GeoNet about earthquakes, volcanoes and natural hazards. These are published stories, not a complete news feed or a check that your area is safe.</p>
        <p className={styles.hint}>DO reads the public national feed only when you ask. No location or personal details are sent.</p>
        <div className={styles.actions}>
          <button type="button" disabled={updates.busy} onClick={() => { setNow(Date.now()); void updates.load('/api/do/nz-local-updates?source=geonet-news'); }}><RefreshCw size={16} aria-hidden="true" />{updates.busy ? 'Checking GeoNet…' : 'Check GeoNet updates'}</button>
          {updates.busy && <button type="button" className={styles.secondary} onClick={() => updates.cancel('Stopped showing this check.')}>Stop</button>}
        </div>
        {updates.notice && <p className={styles.notice} role="status">{updates.notice}</p>}
        {news && <div className={styles.result}>
          <SourceStatus snapshot={news} now={now} />
          <p className={styles.hint}>{news.message}</p>
          {news.articles.length ? <ul className={styles.news}>{news.articles.slice(0, 5).map(article => <li key={article.link}>
            <p className={styles.evidence}>Published <time dateTime={article.published}>{nzTime(article.published, true)}</time>{article.tag ? ` · ${article.tag}` : ''}</p>
            <a href={article.link} target="_blank" rel="noopener noreferrer">{article.title} <ArrowUpRight size={15} aria-hidden="true" /></a>
          </li>)}</ul> : <p>No stories were returned. This does not mean there are no hazards.</p>}
          <p className={styles.hint}>{NZ_LOCAL_SOURCES.updates.attribution} <a href={NZ_LOCAL_SOURCES.updates.licenseUrl} target="_blank" rel="noopener noreferrer">CC BY 3.0 NZ</a></p>
        </div>}
        <a className={styles.sourceLink} href={NZ_LOCAL_SOURCES.updates.url} target="_blank" rel="noopener noreferrer">Read all GeoNet updates <ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
    </details>

    <div className={styles.safety}>
      <p>For an emergency response in New Zealand, <a href="tel:111">call 111</a>. DO does not monitor emergencies or contact emergency services.</p>
      <div className={styles.officialLinks}>
        <a href={NZ_LOCAL_SOURCES.emergency} target="_blank" rel="noopener noreferrer">Civil Defence updates <ArrowUpRight size={14} aria-hidden="true" /></a>
        <a href={NZ_LOCAL_SOURCES.prepare} target="_blank" rel="noopener noreferrer">Get Ready advice <ArrowUpRight size={14} aria-hidden="true" /></a>
        <a href={NZ_LOCAL_SOURCES.emergencyPhone} target="_blank" rel="noopener noreferrer">About calling 111 <ArrowUpRight size={14} aria-hidden="true" /></a>
      </div>
    </div>
  </section>;
}
