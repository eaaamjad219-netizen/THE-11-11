(() => {
"use strict";
const $ = (id) => document.getElementById(id);
const SAVE_KEY = "the1111-save-v2";
const initialState = () => ({scene:"lobby",minutes:19*60,clues:[],roomUnlocked:false,keyFound:false,loop:1,finished:false,strangerMet:false,strangerAsked:false});
let state = initialState();
let language = "ar";
let soundEnabled = false;
let audioContext = null;
let ambienceMaster = null;
let ambienceLayers = {};
let ambienceTimer = null;
let ambienceStep = 0;
let ambienceVolume = 0.35;
try{
 soundEnabled=localStorage.getItem("the1111-sound")==="on";
 const savedVolume=Number(localStorage.getItem("the1111-volume"));
 if(Number.isFinite(savedVolume)&&savedVolume>=0&&savedVolume<=1)ambienceVolume=savedVolume;
}catch(e){}
const clues = {
 clock:{ar:"الساعة متوقفة عند 11:11 تماماً. لكن صوت الدقات يأتي من داخل الجدار، لا من الساعة نفسها.",en:"The clock is frozen at exactly 11:11. But the ticking comes from inside the wall, not from the clock.",nameAr:"دقات خلف الجدار",nameEn:"Ticking behind the wall",scene:"lobby"},
 ledger:{ar:"دفتر النزلاء يحمل اسمك في سجل قديم… والتاريخ المكتوب بجانبه هو تاريخ هذه الليلة.",en:"The guest ledger carries your name in an old entry… dated tonight.",nameAr:"تسجيل باسمك في الدفتر",nameEn:"Your name in the ledger",scene:"lobby"},
 keys:{ar:"المفتاح رقم 11 مفقود. وجدت بطاقة صغيرة تحت لوحة المفاتيح مكتوباً عليها: «لا تثق بالساعة».",en:"Key 11 is missing. A small card beneath the key board reads: “Do not trust the clock.”",nameAr:"بطاقة: لا تثق بالساعة",nameEn:"A note: Do not trust the clock",scene:"lobby"},
 portrait:{ar:"الصورة قديمة، لكن وجه الشخص الواقف عند باب الغرفة يشبه وجهك بشكل مخيف.",en:"The photograph is old, but the person standing by the room door looks unsettlingly like you.",nameAr:"صورة تشبهك",nameEn:"A photograph that looks like you",scene:"corridor"},
 scratch:{ar:"على الحائط خدوش متكررة: 11:11، 11:11، 11:11. وتحتها كلمة واحدة: «تذكّر».",en:"Repeated marks cover the wall: 11:11, 11:11, 11:11. Beneath them is one word: “Remember.”",nameAr:"رسالة تذكّر",nameEn:"A message: Remember",scene:"corridor"},
 box:{ar:"الصندوق مفتوح وفارغ، لكن داخله صورة لك وأنت تقف في الردهة… من زاوية لا يمكن أن تراها.",en:"The box is open and empty, but inside is a photo of you in the lobby… taken from an impossible angle.",nameAr:"صورة من زاوية مستحيلة",nameEn:"A photograph from an impossible angle",scene:"room"}
};
const sceneInfo = {
 lobby:{title:{ar:"ردهة الفندق",en:"Hotel Lobby"},label:{ar:"الفندق — الطابق الأرضي",en:"HOTEL — GROUND FLOOR"},art:"lobby-art",hotspots:["clock","ledger","keys"]},
 corridor:{title:{ar:"الممر الشرقي",en:"East Corridor"},label:{ar:"الفندق — الطابق الأول",en:"HOTEL — FIRST FLOOR"},art:"corridor-art",hotspots:["portrait","scratch"]},
 room:{title:{ar:"الغرفة 11",en:"ROOM 11"},label:{ar:"الغرفة التي لا تظهر في المخطط",en:"THE ROOM MISSING FROM THE FLOOR PLAN"},art:"room-art",hotspots:["box"]}
};
function t(ar,en){return language==="ar"?ar:en}
function updateSoundButton(){
 const b=$("soundBtn");if(!b)return;
 b.textContent=soundEnabled?t("الصوت: يعمل","Sound: On"):t("تشغيل الصوت","Sound: Off");
 b.setAttribute("aria-pressed",String(soundEnabled));
}
function getAudioContext(){
 const AudioCtor=window.AudioContext||window.webkitAudioContext;
 if(!AudioCtor)return null;
 if(!audioContext)audioContext=new AudioCtor();
 if(audioContext.state==="suspended")audioContext.resume().catch(()=>{});
 return audioContext;
}
function tone(ctx,frequency,start,duration,volume,type="sine",endFrequency=frequency){
 const osc=ctx.createOscillator(),gain=ctx.createGain();
 osc.type=type;osc.frequency.setValueAtTime(frequency,start);
 if(endFrequency!==frequency)osc.frequency.exponentialRampToValueAtTime(Math.max(1,endFrequency),start+duration);
 gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),start+.025);
 gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
 osc.connect(gain);gain.connect(ctx.destination);osc.start(start);osc.stop(start+duration+.03);
}
function setupAmbience(){
 const ctx=getAudioContext();if(!ctx||ambienceMaster)return;
 ambienceMaster=ctx.createGain();ambienceMaster.gain.value=0.0001;ambienceMaster.connect(ctx.destination);
 updateAmbienceVolume();
 if(!ambienceTimer)ambienceTimer=window.setInterval(playAmbientNote,1150);
}
function playAmbientNote(){
 if(!soundEnabled||!audioContext||!ambienceMaster)return;
 const patterns={
  lobby:[392,0,349.23,293.66,0,329.63,261.63,0,329.63,392,0,440,392,0,329.63,293.66],
  corridor:[329.63,0,293.66,246.94,0,261.63,220,0,246.94,293.66,0,329.63,293.66,0,261.63,246.94],
  room:[293.66,0,261.63,220,0,246.94,196,0,220,246.94,0,293.66,261.63,0,246.94,220]
 };
 const notes=patterns[state.scene]||patterns.lobby;
 const frequency=notes[ambienceStep%notes.length];ambienceStep++;
 if(!frequency)return;
 const now=audioContext.currentTime;
 const osc=audioContext.createOscillator(),gain=audioContext.createGain();
 osc.type="triangle";osc.frequency.setValueAtTime(frequency,now);
 gain.gain.setValueAtTime(0.0001,now);
 gain.gain.exponentialRampToValueAtTime(0.018,now+.025);
 gain.gain.exponentialRampToValueAtTime(0.0001,now+.62);
 osc.connect(gain);gain.connect(ambienceMaster);
 osc.start(now);osc.stop(now+.66);
}
function updateAmbienceScene(){ambienceStep=0;}
function updateAmbienceVolume(){
 if(!ambienceMaster||!audioContext)return;
 const now=audioContext.currentTime;
 ambienceMaster.gain.cancelScheduledValues(now);
 ambienceMaster.gain.setTargetAtTime(soundEnabled?Math.max(.0001,ambienceVolume):.0001,now,.18);
}
function playSound(kind){
 if(!soundEnabled)return;
 const ctx=getAudioContext();if(!ctx)return;
 const now=ctx.currentTime;
 if(kind==="clue"){tone(ctx,660,now,.22,.045,"sine");tone(ctx,880,now+.12,.32,.035,"sine");}
 else if(kind==="move"){tone(ctx,220,now,.22,.025,"triangle",145);}
 else if(kind==="door"){tone(ctx,110,now,.55,.035,"sine",62);tone(ctx,440,now+.42,.5,.025,"sine",660);}
 else if(kind==="photo"){tone(ctx,520,now,.28,.025,"sine");tone(ctx,780,now+.16,.42,.022,"sine");}
}

function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));$("saveStatus").textContent=t("● محفوظ","● Saved");}catch(e){$("saveStatus").textContent=t("● لم يُحفظ","● Not saved");}}
function load(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return false;const data=JSON.parse(raw);if(!data||!Array.isArray(data.clues)||!sceneInfo[data.scene])return false;state={...initialState(),...data,keyFound:Boolean(data.keyFound)};state.roomUnlocked=state.clues.length>=4&&state.keyFound;if(!state.roomUnlocked&&state.scene==="room")state.scene="corridor";return true;}catch(e){return false;}}
function formatClock(){const h=Math.floor(state.minutes/60)%24,m=state.minutes%60;const suffix=h>=12?"PM":"AM";return String(h%12||12).padStart(2,"0")+":"+String(m).padStart(2,"0")+" "+suffix;}
function buildSceneDetails(){
 const art=$("sceneArt");
 art.querySelectorAll(".scene-detail").forEach(el=>el.remove());
 const details={
  lobby:["pillar left","pillar right","rug","lamp"],
  corridor:["far-door","sconce left","sconce right","runner"],
  room:["window","bed","bedside","mirror","rug"]
 };
 (details[state.scene]||[]).forEach(name=>{
  const el=document.createElement("div");
  el.className="scene-detail "+state.scene+"-detail "+name;
  el.setAttribute("aria-hidden","true");
  art.appendChild(el);
 });
}
function render(){
 const info=sceneInfo[state.scene];$("sceneTitle").textContent=info.title[language];$("sceneLabel").textContent=info.label[language];const clock=$("clock");clock.classList.remove("clock-tick");clock.textContent=formatClock();void clock.offsetWidth;clock.classList.add("clock-tick");
 $("sceneArt").className="scene-art "+info.art;updateAmbienceScene();buildSceneDetails();
 $("sceneArt").querySelectorAll(".hotspot").forEach(el=>el.remove());
 const oldDoor=$("sceneArt").querySelector(".room-door");if(oldDoor)oldDoor.remove();
 if(state.scene==="room"){const door=document.createElement("div");door.className="room-door";door.setAttribute("aria-hidden","true");const panel=document.createElement("div");panel.className="door-panel";const handle=document.createElement("span");handle.className="door-handle";door.append(panel,handle);$("sceneArt").appendChild(door);window.setTimeout(()=>door.classList.add("door-opening"),180);}
 info.hotspots.forEach((id,index)=>{const b=document.createElement("button");b.className="hotspot "+({clock:"hs-clock",ledger:"hs-book",keys:"hs-keys",portrait:"hs-clock",scratch:"hs-book",box:"hs-keys"}[id]);b.style.animationDelay=`${index*110}ms, ${index*110+600}ms`;b.type="button";b.dataset.clue=id;b.setAttribute("aria-label",clues[id][language==="ar"?"nameAr":"nameEn"]);b.textContent=({clock:"⌚",ledger:"▤",keys:"⚿",portrait:"▧",scratch:"✎",box:"▣"}[id]);b.addEventListener("click",()=>inspect(id));$("sceneArt").appendChild(b);});
 if(state.scene==="corridor"&&state.clues.length>=2&&!state.strangerMet){const stranger=document.createElement("button");stranger.type="button";stranger.className="stranger-figure";stranger.setAttribute("aria-label",t("تحدث مع النزيل المجهول","Talk to the unknown guest"));stranger.title=t("نزيل مجهول","Unknown guest");stranger.addEventListener("click",talkToStranger);$("sceneArt").appendChild(stranger);}if(state.scene==="corridor"&&state.strangerMet&&!state.keyFound){const key=document.createElement("button");key.type="button";key.className="hotspot hs-key11";key.textContent="⚿";key.setAttribute("aria-label",t("افحص المفتاح رقم 11","Inspect key number 11"));key.title=t("المفتاح رقم 11","Key number 11");key.addEventListener("click",inspectKey11);$("sceneArt").appendChild(key);}
 document.querySelectorAll(".location-btn").forEach(b=>{b.classList.toggle("active",b.dataset.scene===state.scene);b.disabled=b.dataset.scene==="room"&&!state.roomUnlocked;b.classList.toggle("unlocked",b.dataset.scene==="room"&&state.roomUnlocked);});
 $("clueCount").textContent=state.clues.length+" / 6";
 $("clueList").replaceChildren();
 if(!state.clues.length){const li=document.createElement("li");li.className="empty";li.textContent=t("لم تجمع أي دليل بعد.","No clues collected yet.");$("clueList").appendChild(li);}
 state.clues.forEach((id,index)=>{const li=document.createElement("li");li.style.animationDelay=`${index*65}ms`;li.textContent=clues[id][language==="ar"?"nameAr":"nameEn"];$("clueList").appendChild(li);});
 $("progressText").textContent=Math.round(state.clues.length/6*100)+"% · "+t("التحقيق","INVESTIGATION");
 $("continueBtn").classList.toggle("hidden",!localStorage.getItem(SAVE_KEY));
}
function say(text){const panel=document.querySelector(".dialogue-panel");panel.classList.remove("dialogue-updated");void panel.offsetWidth;panel.classList.add("dialogue-updated");$("speaker").textContent=t("ملاحظات المحقق","INVESTIGATOR'S NOTES");$("dialogue").textContent=text;$("choiceArea").replaceChildren();}
function advanceTime(){const target=23*60+11;const next=state.minutes+17;if(state.minutes<target&&next>=target){state.minutes=target;say(t("توقفت الساعة عند 11:11. الهواء صار أثقل… كأن الفندق ينتظر منك قراراً.","The clock stops at 11:11. The air grows heavy… as if the hotel is waiting for your decision."));}else if(state.minutes>=target){state.minutes=19*60;state.loop++;state.scene="lobby";say(t("11:11… عاد كل شيء إلى البداية. لكن هذه المرة، ذاكرتك لم تُمحَ. الأدلة التي جمعتها ما زالت معك.","11:11… everything returned to the beginning. But this time, your memory survived. Your collected clues remain."));}else{state.minutes=next;}save();render();}
function inspect(id){if(!clues[id])return;playSound("clue");const c=clues[id];say(c[language]);if(!state.clues.includes(id)){state.clues.push(id);state.roomUnlocked=state.clues.length>=4&&state.keyFound;save();render();}
 if(id==="keys"||id==="scratch"){addChoice(t("اذهب إلى الممر","Go to the corridor"),()=>go("corridor"));}if(id==="box"){addChoice(t("افحص الصورة عن قرب","Examine the photograph closely"),showPhotoReveal);addChoice(t("حاول فهم الصورة","Try to understand the photograph"),()=>{if(state.clues.length===6){say(t("تتطابق الصور الستّ في دفتر الأدلة. لم تكن تائهًا في الفندق؛ كنت تحاول تذكّر ما حدث في الليلة الأولى. تظهر على ظهر الصورة الأخيرة عبارة: «اخرج قبل أن تدق الساعة مرة أخرى». انتهى الفصل الأول.","The six photographs align in your case notes. You were never lost in the hotel; you were trying to remember the first night. On the back of the final photo: “Leave before the clock strikes again.” CHAPTER ONE COMPLETE."));state.finished=true;}else{say(t("هناك تفاصيل ناقصة. لا تزال بعض الأدلة خارج الصورة.","Something is missing. Some clues are still out of view."));}save();});}
 advanceTime();}
function inspectKey11(){if(state.keyFound)return;state.keyFound=true;state.roomUnlocked=state.clues.length>=4;playSound("clue");say(t("وجدت المفتاح رقم 11 تحت طرف السجادة قرب الباب البعيد. عليه نقش صغير: «لا تفتح الغرفة قبل أن تتذكر».","You found key 11 beneath the edge of the runner near the far door. A small engraving reads: “Do not open the room until you remember.”"));save();render();if(state.roomUnlocked)addChoice(t("افتح الغرفة 11","Unlock Room 11"),()=>go("room"));else addChoice(t("واصل جمع الأدلة","Keep collecting clues"),()=>say(t("المفتاح صار معك، لكنك تحتاج إلى أربعة أدلة على الأقل قبل دخول الغرفة.","You have the key now, but you still need at least four clues before entering the room.")));advanceTime();}
function strangerLine(text){say(text);$("speaker").textContent=t("النزيل المجهول","THE UNKNOWN GUEST");}
function talkToStranger(){
 playSound("clue");
 const firstVisit=!state.strangerMet;
 state.strangerMet=true;save();render();
 strangerLine(firstVisit?t("أخيراً وصلت. كنت أعرف أنك ستجد الطريق إلى هنا.","At last. I knew you would find your way here."):t("رجعت؟ تذكّر… الساعة لا تعيد الوقت، بل تعيدك أنت.","You came back? Remember… the clock does not repeat time. It repeats you."));
 addChoice(t("من أنت؟","Who are you?"),()=>{
  state.strangerAsked=true;save();
  strangerLine(t("مجرد نزيل لم يغادر هذا الفندق… مثلك تماماً.","Just a guest who never checked out of this hotel… just like you."));
  addChoice(t("كيف تعرف اسمي؟","How do you know my name?"),()=>{
   strangerLine(t("اسمك موجود في الدفتر منذ سنوات. الغريب أنك لا تتذكر أنك كتبتَه.","Your name has been in the ledger for years. The strange part is that you do not remember writing it."));
   addChoice(t("شنو تبي مني؟","What do you want from me?"),()=>{
    strangerLine(t("ابحث عن المفتاح رقم 11. وبعدها ستفهم لماذا لا يفتح هذا الباب إلا لك.","Find key number 11. Then you will understand why this door opens only for you."));
   });
  });
 });
 addChoice(t("لماذا تنتظرني؟","Why are you waiting for me?"),()=>{
  state.strangerAsked=true;save();
  strangerLine(t("لأنك في كل مرة تصل إلى 11:11 تنسى ما عرفته. هذه المرة، حاول أن تتذكر.","Because every time you reach 11:11, you forget what you learned. This time, try to remember."));
  addChoice(t("هل أستطيع الوثوق بك؟","Can I trust you?"),()=>{
   strangerLine(t("لا تثق بي… ولا بالساعة. ثق بالأدلة التي جمعتها بنفسك.","Do not trust me… and do not trust the clock. Trust the clues you found yourself."));
  });
 });
}
function showPhotoReveal(){
 playSound("photo");
 const art=$("sceneArt");const old=art.querySelector(".photo-reveal");if(old)old.remove();
 const veil=document.createElement("div");veil.className="photo-reveal";veil.setAttribute("role","dialog");veil.setAttribute("aria-modal","true");veil.setAttribute("aria-label",t("الصورة القديمة","The old photograph"));
 const close=document.createElement("button");close.className="photo-close";close.type="button";close.textContent=t("إغلاق ×","Close ×");close.addEventListener("click",()=>veil.remove());
 const card=document.createElement("div");card.className="photo-card";
 const image=document.createElement("div");image.className="photo-image";image.setAttribute("aria-hidden","true");
 const caption=document.createElement("div");caption.className="photo-caption";caption.textContent=t("لم تكن وحدك في الردهة.","You were not alone in the lobby.");
 const date=document.createElement("small");date.className="photo-date";date.textContent="11:11 PM  ·  HOTEL ARCHIVE";
 card.append(image,caption,date);veil.append(close,card);art.appendChild(veil);close.focus();
}
function addChoice(label,fn){const b=document.createElement("button");b.className="choice-btn";b.type="button";b.textContent=label;b.addEventListener("click",fn);$("choiceArea").appendChild(b);}
function go(scene){if(!sceneInfo[scene]||(scene==="room"&&!state.roomUnlocked)||scene===state.scene||document.body.classList.contains("scene-transitioning"))return;playSound("move");if(scene==="room")playSound("door");const art=$("sceneArt");document.body.classList.add("scene-transitioning");art.classList.remove("scene-entering");art.classList.add("scene-leaving");window.setTimeout(()=>{state.scene=scene;advanceTime();say(sceneInfo[state.scene].title[language]);art.classList.remove("scene-leaving");art.classList.add("scene-entering");window.setTimeout(()=>{art.classList.remove("scene-entering");document.body.classList.remove("scene-transitioning");},680);},240);}
function start(){if(!load())state=initialState();$("startScreen").classList.add("hidden");$("gameScreen").classList.remove("hidden");render();say(t("وصلت إلى الفندق قبل الغروب بقليل. المكان هادئ أكثر من اللازم… وهناك شيء غير طبيعي في هذه الليلة.","I arrived just before sunset. The place is too quiet… something feels wrong tonight."));}
$("startBtn").addEventListener("click",()=>{state=initialState();start();save();});
$("continueBtn").addEventListener("click",()=>start());
document.querySelectorAll(".location-btn").forEach(b=>b.addEventListener("click",()=>go(b.dataset.scene)));
$("resetBtn").addEventListener("click",()=>{if(!confirm(t("هل تريد إعادة التحقيق من البداية؟ ستُحذف الأدلة المحفوظة.","Restart the investigation? Saved clues will be erased.")))return;state=initialState();save();render();say(t("بدأت ليلة جديدة… أو ربما ليست جديدة فعلاً.","A new night begins… or perhaps it isn't new at all."));});
$("soundBtn").addEventListener("click",()=>{soundEnabled=!soundEnabled;try{localStorage.setItem("the1111-sound",soundEnabled?"on":"off");}catch(e){}if(soundEnabled){getAudioContext();setupAmbience();}updateSoundButton();updateAmbienceVolume();updateAmbienceScene();if(soundEnabled)playSound("clue");});
$("ambienceVolume").value=String(Math.round(ambienceVolume*100));
$("ambienceVolume").addEventListener("input",event=>{ambienceVolume=Number(event.target.value)/100;try{localStorage.setItem("the1111-volume",String(ambienceVolume));}catch(e){}updateAmbienceVolume();});
if(soundEnabled){
 document.addEventListener("pointerdown",()=>{if(soundEnabled){getAudioContext();setupAmbience();updateAmbienceVolume();}},{once:true});
}
$("langBtn").addEventListener("click",()=>{language=language==="ar"?"en":"ar";document.documentElement.lang=language;document.documentElement.dir=language==="ar"?"rtl":"ltr";document.body.dir=document.documentElement.dir;$("langBtn").textContent=language==="ar"?"EN":"عربي";updateSoundButton();document.querySelectorAll("[data-ar][data-en]").forEach(el=>el.textContent=el.dataset[language]);render();});
updateSoundButton();
if(load())$("continueBtn").classList.remove("hidden");
})();