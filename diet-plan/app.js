/* Shared state for the Level 1 site: theme, session, diary storage. */
(function(){
  const THEME_KEY="level1-theme";
  const SESSION_KEY="level1-session";

  /* ---- theme, applied before paint by the inline snippet in each page ---- */
  const Theme={
    get(){ try{ return localStorage.getItem(THEME_KEY)||""; }catch(e){ return ""; } },
    set(name){
      try{ name?localStorage.setItem(THEME_KEY,name):localStorage.removeItem(THEME_KEY); }catch(e){}
      name?document.documentElement.setAttribute("data-theme",name)
          :document.documentElement.removeAttribute("data-theme");
    }
  };

  /* ---- session: a client code plus a PIN they set the first time ---- */
  const Session={
    get(){ try{ return JSON.parse(localStorage.getItem(SESSION_KEY)||"null"); }catch(e){ return null; } },
    set(s){ try{ localStorage.setItem(SESSION_KEY,JSON.stringify(s)); }catch(e){} },
    clear(){ try{ localStorage.removeItem(SESSION_KEY); }catch(e){} },
    require(){
      const s=Session.get();
      if(!s||!s.code){ location.replace("index.html"); return null; }
      return s;
    }
  };

  const slugify=v=>String(v||"").toLowerCase().trim().replace(/[^a-z0-9-]/g,"").slice(0,40);

  /* ---- Supabase, when config.js is filled in ---- */
  const cfg=window.LEVEL1_CONFIG||{};
  const sb=(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&window.supabase)
    ? window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY) : null;

  const DAY_COUNT=7;
  const blank=()=>Array.from({length:DAY_COUNT},()=>({meals:[],steps:""}));
  const clean=raw=>{
    if(!Array.isArray(raw)) return blank();
    const out=blank();
    raw.slice(0,DAY_COUNT).forEach((d,i)=>{
      out[i]={ meals:Array.isArray(d&&d.meals)?d.meals.filter(m=>m&&m.text):[],
               steps:(d&&d.steps&&d.steps!==true)?String(d.steps):"" };
    });
    return out;
  };

  /* ---- the diary for one client ---- */
  function Diary(code){
    const localKey="level1-diary-"+code;
    let log=blank(), name="", remind={times:["09:00","14:00","21:00"]};
    let timer=null, applying=false, listeners=[];
    try{
      const raw=JSON.parse(localStorage.getItem(localKey)||"null");
      if(raw){ log=clean(raw.log); name=raw.name||""; if(raw.remind&&Array.isArray(raw.remind.times)) remind=raw.remind; }
    }catch(e){}

    const emit=status=>listeners.forEach(fn=>{ try{ fn(status); }catch(e){} });
    const saveLocal=()=>{ try{ localStorage.setItem(localKey,JSON.stringify({log,name,remind})); }catch(e){} };

    function push(){
      saveLocal();
      if(!sb||applying) { emit("local"); return; }
      clearTimeout(timer);
      timer=setTimeout(async()=>{
        const {error}=await sb.from("diaries").upsert({
          slug:code,name,week:1,data:{log,remind},updated_at:new Date().toISOString()
        },{onConflict:"slug"});
        emit(error?"offline":"saved");
      },600);
    }

    function apply(row){
      if(!row||!row.data)return;
      applying=true;
      log=clean(row.data.log);
      if(row.data.remind&&Array.isArray(row.data.remind.times)) remind=row.data.remind;
      if(row.name) name=row.name;
      saveLocal(); applying=false;
      emit("saved");
    }

    async function connect(){
      if(!sb){ emit("local"); return; }
      emit("syncing");
      const {data,error}=await sb.from("diaries").select("*").eq("slug",code).maybeSingle();
      if(error){ emit("offline"); return; }
      if(data) apply(data); else push();
      sb.channel("diary-"+code)
        .on("postgres_changes",{event:"*",schema:"public",table:"diaries",filter:"slug=eq."+code},
            p=>{ if(!applying) apply(p.new); })
        .subscribe();
    }

    return {
      code,
      onChange(fn){ listeners.push(fn); },
      connect,
      get log(){ return log; },
      get name(){ return name; },
      set name(v){ name=v; push(); },
      get remind(){ return remind; },
      setRemind(r){ remind=r; push(); },
      addMeal(i,text){
        const now=new Date();
        const at=String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
        log[i].meals.push({text,at}); push();
      },
      removeMeal(i,j){ log[i].meals.splice(j,1); push(); },
      setSteps(i,v){ log[i].steps=String(v).trim(); push(); },
      reset(){ log=blank(); push(); },
      /* the bar only ever goes up: yesterday's count plus one */
      stepsOf(i){ const n=parseInt(log[i].steps,10); return isNaN(n)?null:n; },
      targetFor(i){ for(let j=i-1;j>=0;j--){ const n=this.stepsOf(j); if(n!==null) return n+1; } return null; },
      loggedCount(){ return log.filter(d=>d.meals.length).length; },
      asText(){
        const nf=new Intl.NumberFormat("en-GB");
        return "LEVEL 1 — WEEK ONE — "+(name||code)+"\n\n"+log.map((d,i)=>{
          const t=this.targetFor(i), n=this.stepsOf(i);
          const meals=d.meals.length?d.meals.map(m=>"  "+(m.at?m.at+"  ":"")+m.text).join("\n"):"  (nothing logged)";
          return "DAY "+(i+1)+"\n"+meals+"\nSteps: "+(n===null?"—":nf.format(n))+
            (t===null?"":"  (target "+nf.format(t)+")");
        }).join("\n\n");
      }
    };
  }

  /* ---- one field: a client types their name and gets their own plan ---- */
  async function openPlan(nameRaw){
    const name=String(nameRaw||"").trim().replace(/\s+/g," ").slice(0,60);
    const code=slugify(name.replace(/\s+/g,"-"));
    if(!code) return {ok:false,msg:"Type your name to open your plan."};
    if(sb){
      const {data,error}=await sb.from("diaries").select("slug").eq("slug",code).maybeSingle();
      if(error) return {ok:false,msg:"Can't reach the server — try again in a moment."};
      if(!data){
        const {error:e2}=await sb.from("diaries").insert({slug:code,name,week:1,data:{}});
        if(e2) return {ok:false,msg:"Could not start that plan. Try again."};
      }
    }
    Session.set({code,name,at:Date.now()});
    return {ok:true,code,name};
  }

  /* ---- add to home screen: a real prompt where the browser offers one,
         plain instructions where it doesn't (iPhone never offers one) ---- */
  let deferredPrompt=null;
  window.addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); deferredPrompt=e; });

  const standalone=()=>window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true;
  const platform=()=>{
    const ua=navigator.userAgent;
    if(/iPad|iPhone|iPod/.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1)) return "ios";
    if(/Android/.test(ua)) return "android";
    return "desktop";
  };

  const STEPS={
    ios:{title:"On iPhone or iPad",
      note:"It has to be Safari — Chrome on iPhone can't add to the home screen.",
      steps:["Tap the <b>Share</b> button at the bottom of Safari — the square with an arrow going up.",
             "Scroll the list and tap <b>Add to Home Screen</b>.",
             "Tap <b>Add</b> in the top right. The icon lands on your home screen."]},
    android:{title:"On Android",
      note:"Chrome, Samsung Internet and Edge all do this.",
      steps:["Tap the <b>⋮</b> menu at the top right.",
             "Tap <b>Add to Home screen</b> (or <b>Install app</b>).",
             "Tap <b>Install</b>. The icon lands with your other apps."]},
    desktop:{title:"On a computer",
      note:"Chrome or Edge. Handy for the coach dashboard.",
      steps:["Look at the right-hand end of the address bar for the <b>install</b> icon — a screen with an arrow.",
             "Click it, then click <b>Install</b>.",
             "It opens in its own window from then on."]}
  };

  function installSheet(){
    const order=[platform(),...["ios","android","desktop"].filter(p=>p!==platform())];
    const back=document.createElement("div");
    back.className="sheet";
    back.innerHTML='<div class="sheet-box install-box">'+
      '<div class="eyebrow">ADD TO HOME SCREEN</div>'+
      '<h2 class="install-h">Keep it a tap away.</h2>'+
      '<p class="note">Once it is on your home screen it opens like any other app — full screen, '+
      'no address bar, and it still works with no signal. Nothing to download from a store.</p>'+
      order.map((p,i)=>{
        const s=STEPS[p];
        return '<div class="install-plat'+(i===0?" first":"")+'">'+
          '<h3>'+s.title+(i===0?' <span class="you">you\u2019re on this one</span>':'')+'</h3>'+
          '<ol>'+s.steps.map(x=>"<li>"+x+"</li>").join("")+'</ol>'+
          '<p class="note">'+s.note+'</p></div>';
      }).join("")+
      '<div class="install-foot"><button class="btn" type="button" data-close>GOT IT</button></div></div>';
    back.addEventListener("click",e=>{ if(e.target===back||e.target.hasAttribute("data-close")) back.remove(); });
    document.body.appendChild(back);
    back.querySelector("[data-close]").focus();
  }

  const Install={
    available(){ return !standalone(); },
    async run(){
      if(deferredPrompt){
        deferredPrompt.prompt();
        const {outcome}=await deferredPrompt.userChoice;
        deferredPrompt=null;
        if(outcome==="accepted") return;
      }
      installSheet();
    },
    /* wire a button: hides itself once the app is installed */
    attach(el){
      if(!el)return;
      if(standalone()){ el.style.display="none"; return; }
      el.addEventListener("click",e=>{ e.preventDefault(); Install.run(); });
    }
  };

  window.Level1={Theme,Session,Diary,openPlan,slugify,hasCloud:!!sb,DAY_COUNT,Install};
})();
