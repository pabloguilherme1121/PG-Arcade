/** User-triggered local export. Intentionally excludes URL, storage, identity and error text. */
export function localDiagnostics() {
 const navigation=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;
 return {
  schema:'pg-arcade-diagnostics-v1',createdAt:new Date().toISOString(),
  viewport:{width:innerWidth,height:innerHeight,pixelRatio:devicePixelRatio},
  preferences:{reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches},
  networkHint:navigator.onLine?'online':'offline',
  longTasks:longTaskSummary(),
  build:import.meta.env.PG_BUILD || 'development',
  collection:collectionSummary(),
  timing:navigation?{domReadyMs:Math.round(navigation.domContentLoadedEventEnd),loadMs:Math.round(navigation.loadEventEnd)}:null,
  note:'Diagnóstico deste navegador; não mede Android físico, FPS sustentado ou disponibilidade do servidor.',
 };
}

let observer:PerformanceObserver|undefined;
let count=0,totalMs=0;
let interval:{startedAt:string;endedAt:string|null;start:number;end:number|null;visibleMs:number;last:number;visible:boolean}|undefined;
function settleVisibility() {
 if(!interval || interval.end!==null)return;
 const now=performance.now();
 if(interval.visible)interval.visibleMs+=Math.max(0,now-interval.last);
 interval.last=now;interval.visible=document.visibilityState==='visible';
}
function collectionSummary() {
 if(!interval)return null;
 settleVisibility();
 return {startedAt:interval.startedAt,endedAt:interval.endedAt,durationMs:Math.round((interval.end??performance.now())-interval.start),visibleMs:Math.round(interval.visibleMs)};
}
const recent:number[]=[];
function record(entries:PerformanceEntry[]) {
 for(const entry of entries){count++;totalMs+=entry.duration;recent.push(entry.duration);if(recent.length>128)recent.shift();}
}
export function diagnosticsStatus() {
 return {collecting:!!observer,supported:typeof PerformanceObserver!=='undefined'&&!!PerformanceObserver.supportedEntryTypes?.includes('longtask')};
}
export function startDiagnostics() {
 if(observer)return true;
 if(!diagnosticsStatus().supported)return false;
 try{
  count=0;totalMs=0;recent.length=0;
  observer=new PerformanceObserver(list=>record(list.getEntries()));
  observer.observe({type:'longtask'});
  const now=performance.now();
  interval={startedAt:new Date().toISOString(),endedAt:null,start:now,end:null,visibleMs:0,last:now,visible:document.visibilityState==='visible'};
  document.addEventListener('visibilitychange',settleVisibility);
  return true;
 }catch{observer?.disconnect();observer=undefined;return false;}
}
export function stopDiagnostics() {
 if(observer){
  record(observer.takeRecords());observer.disconnect();observer=undefined;
  settleVisibility();
  if(interval){interval.end=performance.now();interval.endedAt=new Date().toISOString();}
  document.removeEventListener('visibilitychange',settleVisibility);
 }
}
export function longTaskSummary() {
 if(observer)record(observer.takeRecords());
 const sorted=[...recent].sort((a,b)=>a-b);
 return {...diagnosticsStatus(),count,totalMs:Math.round(totalMs),recentSampleSize:sorted.length,recentP95Ms:sorted.length?Math.round(sorted[Math.ceil(sorted.length*.95)-1]):null};
}
