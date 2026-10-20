/** Optional short feedback, created only by an explicit player action. No asset/network. */
export async function playFeedback(success:boolean) {
 let context:AudioContext|undefined;
 const close=()=>{if(context && context.state!=='closed')void context.close().catch(()=>undefined);};
 try {
  if(document.hidden || typeof AudioContext==='undefined')return;
  context=new AudioContext();
  await context.resume();
  if(document.hidden || context.state==='closed'){close();return;}
  const oscillator=context.createOscillator(),gain=context.createGain();
  oscillator.type='sine';oscillator.frequency.value=success?660:330;
  gain.gain.setValueAtTime(0.04,context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001,context.currentTime+0.12);
  oscillator.connect(gain);gain.connect(context.destination);
  const cleanup=()=>{window.removeEventListener('pagehide',cleanup);window.removeEventListener('blur',cleanup);window.removeEventListener('pg-arcade-pause',cleanup);document.removeEventListener('visibilitychange',cleanup);close();};
  oscillator.onended=cleanup;
  window.addEventListener('pagehide',cleanup,{once:true});window.addEventListener('blur',cleanup,{once:true});window.addEventListener('pg-arcade-pause',cleanup,{once:true});document.addEventListener('visibilitychange',cleanup,{once:true});
  oscillator.start();oscillator.stop(context.currentTime+0.13);
 }catch{close();}
}
