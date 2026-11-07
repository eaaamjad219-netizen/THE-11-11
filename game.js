(() => {
"use strict";
const $ = (id) => document.getElementById(id);
const SAVE_KEY = "the1111-save-v2";
const initialState = () => ({scene:"lobby",minutes:19*60,clues:[],roomUnlocked:false,loop:1,finished:false});
let state = initialState();
let language = "ar";
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
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));$("saveStatus").textContent=t("● محفوظ","● Saved");}catch(e){$("saveStatus").textContent=t("● لم يُحفظ","● Not saved");}}
function load(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return false;const data=JSON.parse(raw);if(!data||!Array.isArray(data.clues)||!sceneInfo[data.scene])return false;state={...initialState(),...data};return true;}catch(e){return false;}}
function formatClock(){const h=Math.floor(state.minutes/60)%24,m=state.minutes%60;const suffix=h>=12?"PM":"AM";return String(h%12||12).padStart(2,"0")+":"+String(m).padStart(2,"0")+" "+suffix;}
function render(){
 const info=sceneInfo[state.scene];$("sceneTitle").textContent=info.title[language];$("sceneLabel").textContent=info.label[language];const clock=$("clock");clock.classList.remove("clock-tick");clock.textContent=formatClock();void clock.offsetWidth;clock.classList.add("clock-tick");
 $("sceneArt").className="scene-art "+info.art;
 $("sceneArt").querySelectorAll(".hotspot").forEach(el=>el.remove());
 info.hotspots.forEach((id,index)=>{const b=document.createElement("button");b.className="hotspot "+({clock:"hs-clock",ledger:"hs-book",keys:"hs-keys",portrait:"hs-clock",scratch:"hs-book",box:"hs-keys"}[id]);b.style.animationDelay=`${index*110}ms, ${index*110+600}ms`;b.type="button";b.dataset.clue=id;b.setAttribute("aria-label",clues[id][language==="ar"?"nameAr":"nameEn"]);b.textContent=({clock:"⌚",ledger:"▤",keys:"⚿",portrait:"▧",scratch:"✎",box:"▣"}[id]);b.addEventListener("click",()=>inspect(id));$("sceneArt").appendChild(b);});
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
function inspect(id){if(!clues[id])return;const c=clues[id];say(c[language]);if(!state.clues.includes(id)){state.clues.push(id);state.roomUnlocked=state.clues.length>=4;save();render();}
 if(id==="keys"||id==="scratch"){addChoice(t("اذهب إلى الممر","Go to the corridor"),()=>go("corridor"));}if(id==="box"){addChoice(t("حاول فهم الصورة","Try to understand the photograph"),()=>{if(state.clues.length===6){say(t("تتطابق الصور الستّ في دفتر الأدلة. لم تكن تائهًا في الفندق؛ كنت تحاول تذكّر ما حدث في الليلة الأولى. تظهر على ظهر الصورة الأخيرة عبارة: «اخرج قبل أن تدق الساعة مرة أخرى». انتهى الفصل الأول.","The six photographs align in your case notes. You were never lost in the hotel; you were trying to remember the first night. On the back of the final photo: “Leave before the clock strikes again.” CHAPTER ONE COMPLETE."));state.finished=true;}else{say(t("هناك تفاصيل ناقصة. لا تزال بعض الأدلة خارج الصورة.","Something is missing. Some clues are still out of view."));}save();});}
 advanceTime();}
function addChoice(label,fn){const b=document.createElement("button");b.className="choice-btn";b.type="button";b.textContent=label;b.addEventListener("click",fn);$("choiceArea").appendChild(b);}
function go(scene){if(!sceneInfo[scene]||(scene==="room"&&!state.roomUnlocked)||scene===state.scene||document.body.classList.contains("scene-transitioning"))return;const art=$("sceneArt");document.body.classList.add("scene-transitioning");art.classList.remove("scene-entering");art.classList.add("scene-leaving");window.setTimeout(()=>{state.scene=scene;advanceTime();say(sceneInfo[state.scene].title[language]);art.classList.remove("scene-leaving");art.classList.add("scene-entering");window.setTimeout(()=>{art.classList.remove("scene-entering");document.body.classList.remove("scene-transitioning");},680);},240);}
function start(){if(!load())state=initialState();$("startScreen").classList.add("hidden");$("gameScreen").classList.remove("hidden");render();say(t("وصلت إلى الفندق قبل الغروب بقليل. المكان هادئ أكثر من اللازم… وهناك شيء غير طبيعي في هذه الليلة.","I arrived just before sunset. The place is too quiet… something feels wrong tonight."));}
$("startBtn").addEventListener("click",()=>{state=initialState();start();save();});
$("continueBtn").addEventListener("click",()=>start());
document.querySelectorAll(".location-btn").forEach(b=>b.addEventListener("click",()=>go(b.dataset.scene)));
$("resetBtn").addEventListener("click",()=>{if(!confirm(t("هل تريد إعادة التحقيق من البداية؟ ستُحذف الأدلة المحفوظة.","Restart the investigation? Saved clues will be erased.")))return;state=initialState();save();render();say(t("بدأت ليلة جديدة… أو ربما ليست جديدة فعلاً.","A new night begins… or perhaps it isn't new at all."));});
$("langBtn").addEventListener("click",()=>{language=language==="ar"?"en":"ar";document.documentElement.lang=language;document.documentElement.dir=language==="ar"?"rtl":"ltr";document.body.dir=document.documentElement.dir;$("langBtn").textContent=language==="ar"?"EN":"عربي";document.querySelectorAll("[data-ar][data-en]").forEach(el=>el.textContent=el.dataset[language]);render();});
if(load())$("continueBtn").classList.remove("hidden");
})();