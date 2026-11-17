import {defineConfig} from '@playwright/test';

export default defineConfig({
 testDir:'./tests/e2e',fullyParallel:false,workers:1,timeout:30000,
 use:{baseURL:'http://localhost:3000',trace:'retain-on-failure',screenshot:'only-on-failure',
  ...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{}),},
 projects:[
  {name:'desktop',use:{viewport:{width:1280,height:800}}},
  {name:'mobile-360',use:{viewport:{width:360,height:800},isMobile:true,hasTouch:true}},
  {name:'mobile-390',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}},
 ],
 webServer:{command:'npm run dev',url:'http://localhost:3000',reuseExistingServer:!process.env.CI,timeout:30000},
});
