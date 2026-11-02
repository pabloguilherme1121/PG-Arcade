import {defineConfig,devices} from '@playwright/test';
const port=5791;
const base=process.env.GITHUB_ACTIONS?'/PG-Arcade/':'/';
export default defineConfig({
 testDir:'./audit',
 fullyParallel:true,
 workers:process.env.CI?2:3,
 retries:0,
 reporter:[['line'],['json',{outputFile:'artifacts/individual-150.json'}]],
 use:{baseURL:`http://127.0.0.1:${port}${base}`,trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[
  {name:'chromium',use:{...devices['Desktop Chrome']}},
  {name:'webkit',use:{...devices['Desktop Safari']}}
 ],
 webServer:{command:`npm run preview -- --port ${port} --strictPort`,url:`http://127.0.0.1:${port}${base}`,reuseExistingServer:false,timeout:30000}
});