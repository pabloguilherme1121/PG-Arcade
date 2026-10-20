import {expect,test} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test('local diagnostic export excludes URL and personal progress',async({page})=>{
 await page.goto('./?token=never-export-this#/progresso');
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:'Salvar diagnóstico local',exact:true}).click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toBe('pg-arcade-diagnostico.json');
 const raw=await readFile((await download.path())!,'utf8'),report=JSON.parse(raw);
 expect(report.schema).toBe('pg-arcade-diagnostics-v1');
 expect(report.viewport.width).toBeGreaterThan(0);
 expect(raw).not.toContain('never-export-this');
 for(const key of ['url','records','favorites','storage','userAgent'])expect(report).not.toHaveProperty(key);
 await expect(page.getByRole('status').filter({hasText:'Diagnóstico local preparado'})).toBeVisible();
});

test('performance collection starts only on request and can be stopped',async({page,browserName})=>{
 await page.goto('./#/progresso');
 await page.getByRole('button',{name:'Iniciar coleta local',exact:true}).click();
 const supported=await page.evaluate(()=>typeof PerformanceObserver!=='undefined'&&PerformanceObserver.supportedEntryTypes.includes('longtask'));
 if(!supported){await expect(page.getByRole('status').filter({hasText:'não oferece medição'})).toBeVisible();return;}
 await expect(page.getByRole('button',{name:'Parar coleta local',exact:true})).toHaveAttribute('aria-pressed','true');
 // A synthetic task exercises collection; this is not a product performance baseline.
 await page.evaluate(()=>{
  Object.assign(window,{syntheticLongTaskSeen:false});
  const observer=new PerformanceObserver(list=>{
   if(list.getEntries().some(entry=>entry.duration>=50)){
    (window as unknown as {syntheticLongTaskSeen:boolean}).syntheticLongTaskSeen=true;observer.disconnect();
   }
  });observer.observe({type:'longtask'});
  const button=document.createElement('button');button.textContent='Executar tarefa sintética';
  button.onclick=()=>{const end=performance.now()+80;while(performance.now()<end){/* synthetic browser task */}button.remove();};
  document.body.append(button);
 });
 await page.getByRole('button',{name:'Executar tarefa sintética',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>(window as unknown as {syntheticLongTaskSeen:boolean}).syntheticLongTaskSeen)).toBe(true);
 await page.getByRole('button',{name:'Parar coleta local',exact:true}).click();
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:'Salvar diagnóstico local',exact:true}).click();
 const download=await downloadPromise;
 const report=JSON.parse(await readFile((await download.path())!,'utf8'));
 expect(report.longTasks.collecting).toBe(false);
 expect(report.longTasks.count).toBeGreaterThan(0);
 expect(report.longTasks.recentSampleSize).toBeLessThanOrEqual(128);
});
