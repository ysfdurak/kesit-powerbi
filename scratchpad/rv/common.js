const { chromium } = require('playwright');
exports.SS='/tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/review_ux/';
exports.open=async(opts={})=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'});
 const ctx=await b.newContext({viewport:opts.vp||{width:1360,height:900},colorScheme:opts.dark?'dark':'light',acceptDownloads:true,...(opts.mobile?{isMobile:true,hasTouch:true,deviceScaleFactor:2}:{})});
 await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
 const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
 return {b,ctx,p,errs};
};
