import {defineConfig} from '@playwright/test';

export default defineConfig({
 testDir:'./tests/e2e',fullyParallel:false,workers:1,timeout:30000,
 use:{baseURL:'http://localhost:3000',trace:'retain-on-failure',screenshot:'only-on-failure',
  ...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{}),},
 projects:[
  {name:'desktop',use:{viewport:{width:1280,height:720}}},
  {name:'touch-landscape',use:{viewport:{width:667,height:375},isMobile:true,hasTouch:true}},
  {name:'touch-portrait',use:{viewport:{width:375,height:667},isMobile:true,hasTouch:true}},
 ],
 webServer:{command:'npm run dev',url:'http://localhost:3000',reuseExistingServer:!process.env.CI,timeout:30000},
});
