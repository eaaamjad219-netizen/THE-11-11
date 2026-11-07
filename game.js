(() => {
"use strict";
const $ = (id) => document.getElementById(id);
const SAVE_KEY = "the1111-save-v2";
const initialState = () => ({scene:"lobby",minutes:19*60,clues:[],roomUnlocked:false,keyFound:false,puzzleSolved:false,loop:1,finished:false,strangerMet:false,strangerAsked:false,chapter:1,chapter2Clues:[],chapter2Solved:false,chapter3Clues:[],chapter3Solved:false});
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
const chapterTwoSceneInfo = {
 lobby:{title:{ar:"الردهة — ذكرى قديمة",en:"Lobby — An Old Memory"},label:{ar:"الفصل الثاني · شريط التسجيل",en:"CHAPTER TWO · THE TAPE"},art:"lobby-art",hotspots:["tape"]},
 corridor:{title:{ar:"الممر — صفحة ممزقة",en:"Corridor — The Torn Page"},label:{ar:"الفصل الثاني · تقويم الفندق",en:"CHAPTER TWO · HOTEL CALENDAR"},art:"corridor-art",hotspots:["calendar"]},
 room:{title:{ar:"الغرفة 11 — المرآة",en:"Room 11 — The Mirror"},label:{ar:"الفصل الثاني · انعكاس لا يخصك",en:"CHAPTER TWO · A REFLECTION THAT ISN'T YOURS"},art:"room-art",hotspots:["mirror"]}
};
const chapterThreeSceneInfo = {
 lobby:{title:{ar:"الردهة — السجل الأخير",en:"Lobby — The Final Register"},label:{ar:"الفصل الثالث · سجل المناوبة",en:"CHAPTER THREE · THE NIGHT REGISTER"},art:"lobby-art",hotspots:["register"]},
 corridor:{title:{ar:"الممر — رسالة على الحائط",en:"Corridor — A Message on the Wall"},label:{ar:"الفصل الثالث · ما كتبته بنفسك",en:"CHAPTER THREE · YOUR OWN WORDS"},art:"corridor-art",hotspots:["message"]},
 room:{title:{ar:"الغرفة 11 — الظرف الأخير",en:"Room 11 — The Last Envelope"},label:{ar:"الفصل الثالث · الحقيقة الأخيرة",en:"CHAPTER THREE · THE FINAL TRUTH"},art:"room-art",hotspots:["envelope"]}
};
const chapterThreeClues = {
 register:{ar:"فتحت سجل المناوبة القديم. آخر اسم كتبه موظف الاستقبال هو اسمك، وتحت الاسم ملاحظة: «المناوبة الأخيرة — الغرفة 11». لم تكن نزيلاً عابراً؛ كنت تعمل هنا.",en:"You open the old night register. The last receptionist listed is you, followed by: “Final shift — Room 11.” You were not a passing guest; you worked here.",nameAr:"سجل المناوبة باسمك",nameEn:"Your name in the night register"},
 message:{ar:"تحت طبقة الطلاء وجدت كلمات بخط يدك: «الساعة 11:11، ثم تاريخ الليلة 03». وتحتها: «أنا تركت الأدلة لنفسي كي أعود وأتذكر».",en:"Beneath the paint are words in your handwriting: “11:11, then the date of this night: 03.” Below that: “I left these clues for myself, so I could return and remember.”",nameAr:"رسالة بخط يدك",nameEn:"A message in your handwriting"},
 envelope:{ar:"داخل الظرف صورة بطاقة موظفك القديمة وملاحظة أخيرة: «النزيل الذي تبحث عنه هو أنت. لم يكن الفندق يحبسك؛ أنت كنت تعود لأنك وعدت نفسك ألا تنسى ما حدث في مناوبتك الأخيرة: أنك اخترت إغلاق الفندق ومغادرته، لا البقاء فيه إلى الأبد».",en:"Inside is your old staff card and one final note: “The guest you are searching for is you. The hotel did not keep you here; you kept returning because you promised yourself not to forget your last shift: you chose to close the hotel and leave, not remain here forever.”",nameAr:"الظرف الأخير",nameEn:"The final envelope"}
};
const chapterTwoClues = {
 tape:{ar:"شغّلت الشريط. صوتك يهمس: «إذا سمعتني، لا تنظر إلى المرآة قبل أن تعرف الرقم الأول… الثالثة بعد منتصف الليل». ثم ينقطع التسجيل بصوت ثلاث دقات.",en:"You play the tape. Your own voice whispers: “If you can hear me, don't look into the mirror until you know the first number… three after midnight.” The recording ends with three knocks.",nameAr:"شريط بصوتك",nameEn:"A tape in your own voice"},
 calendar:{ar:"وجدت صفحة تقويم ممزقة. يوم 03 مشطوب، وتحته مكتوب: «الرقمان الأخيران على المرآة».",en:"A torn calendar page shows the 3rd crossed out. Beneath it: “The last two digits are on the mirror.”",nameAr:"صفحة التقويم الممزقة",nameEn:"The torn calendar page"},
 mirror:{ar:"المرآة لا تعكس الغرفة كما هي. على بخار الزجاج تظهر الأرقام 11، وخلف انعكاسك يقف النزيل… لكنه يختفي عندما تلتفت.",en:"The mirror does not reflect the room as it is. The digits 11 appear in the misted glass. The guest stands behind your reflection… and vanishes when you turn.",nameAr:"أرقام على المرآة",nameEn:"Digits on the mirror"}
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
function load(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return false;const data=JSON.parse(raw);if(!data||!Array.isArray(data.clues)||!sceneInfo[data.scene])return false;state={...initialState(),...data,keyFound:Boolean(data.keyFound),puzzleSolved:Boolean(data.puzzleSolved),chapter:data.chapter===2?2:1,chapter2Clues:Array.isArray(data.chapter2Clues)?data.chapter2Clues:[],chapter2Solved:Boolean(data.chapter2Solved),chapter3Clues:Array.isArray(data.chapter3Clues)?data.chapter3Clues:[],chapter3Solved:Boolean(data.chapter3Solved)};state.roomUnlocked=state.clues.length>=4&&state.keyFound;if(!state.roomUnlocked&&state.scene==="room")state.scene="corridor";return true;}catch(e){return false;}}
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
 const info=state.chapter===3?chapterThreeSceneInfo[state.scene]:(state.chapter===2?chapterTwoSceneInfo[state.scene]:sceneInfo[state.scene]);
 const heading=document.querySelector(".game-heading .eyebrow");heading.textContent=state.chapter===3?t("الفصل الثالث","CHAPTER THREE"):(state.chapter===2?t("الفصل الثاني","CHAPTER TWO"):t("الفصل الأول","CHAPTER ONE"));
 $("sceneTitle").textContent=info.title[language];$("sceneLabel").textContent=info.label[language];const clock=$("clock");clock.classList.remove("clock-tick");clock.textContent=formatClock();void clock.offsetWidth;clock.classList.add("clock-tick");
 $("sceneArt").className="scene-art "+info.art;updateAmbienceScene();buildSceneDetails();
 $("sceneArt").querySelectorAll(".hotspot").forEach(el=>el.remove());
 const oldDoor=$("sceneArt").querySelector(".room-door");if(oldDoor)oldDoor.remove();
 if(state.scene==="room"){const door=document.createElement("div");door.className="room-door";door.setAttribute("aria-hidden","true");const panel=document.createElement("div");panel.className="door-panel";const handle=document.createElement("span");handle.className="door-handle";door.append(panel,handle);$("sceneArt").appendChild(door);window.setTimeout(()=>door.classList.add("door-opening"),180);}
 info.hotspots.forEach((id,index)=>{const b=document.createElement("button");b.className="hotspot "+({clock:"hs-clock",ledger:"hs-book",keys:"hs-keys",portrait:"hs-clock",scratch:"hs-book",box:"hs-keys",tape:"hs-tape",calendar:"hs-calendar",mirror:"hs-mirror",register:"hs-book",message:"hs-calendar",envelope:"hs-keys"}[id]);b.style.animationDelay=`${index*110}ms, ${index*110+600}ms`;b.type="button";b.dataset.clue=id;b.setAttribute("aria-label",(state.chapter===3?chapterThreeClues[id]:(state.chapter===2?chapterTwoClues[id]:clues[id]))[language==="ar"?"nameAr":"nameEn"]);b.textContent=({clock:"⌚",ledger:"▤",keys:"⚿",portrait:"▧",scratch:"✎",box:"▣",register:"▤",message:"✎",envelope:"✉"}[id]);b.addEventListener("click",()=>inspect(id));$("sceneArt").appendChild(b);});
 if(state.chapter===1&&state.scene==="corridor"&&state.clues.length>=2&&!state.strangerMet){const stranger=document.createElement("button");stranger.type="button";stranger.className="stranger-figure";stranger.setAttribute("aria-label",t("تحدث مع النزيل المجهول","Talk to the unknown guest"));stranger.title=t("نزيل مجهول","Unknown guest");stranger.addEventListener("click",talkToStranger);$("sceneArt").appendChild(stranger);}if(state.chapter===1&&state.scene==="corridor"&&state.strangerMet&&!state.keyFound){const key=document.createElement("button");key.type="button";key.className="hotspot hs-key11";key.textContent="⚿";key.setAttribute("aria-label",t("افحص المفتاح رقم 11","Inspect key number 11"));key.title=t("المفتاح رقم 11","Key number 11");key.addEventListener("click",inspectKey11);$("sceneArt").appendChild(key);}
 document.querySelectorAll(".location-btn").forEach(b=>{b.classList.toggle("active",b.dataset.scene===state.scene);b.disabled=b.dataset.scene==="room"&&!state.roomUnlocked;b.classList.toggle("unlocked",b.dataset.scene==="room"&&state.roomUnlocked);});
 const activeClues=state.chapter===3?state.chapter3Clues:(state.chapter===2?state.chapter2Clues:state.clues);
 const totalClues=state.chapter===1?6:3;
 $("clueCount").textContent=activeClues.length+" / "+totalClues;
 $("clueList").replaceChildren();
 if(!activeClues.length){const li=document.createElement("li");li.className="empty";li.textContent=t("لم تجمع أي دليل بعد.","No clues collected yet.");$("clueList").appendChild(li);}
 activeClues.forEach((id,index)=>{const li=document.createElement("li");li.style.animationDelay=`${index*65}ms`;li.textContent=(state.chapter===3?chapterThreeClues[id]:(state.chapter===2?chapterTwoClues[id]:clues[id]))[language==="ar"?"nameAr":"nameEn"];$("clueList").appendChild(li);});
 $("progressText").textContent=Math.round(activeClues.length/totalClues*100)+"% · "+t("التحقيق","INVESTIGATION");
 $("continueBtn").classList.toggle("hidden",!localStorage.getItem(SAVE_KEY));
}
function say(text){const panel=document.querySelector(".dialogue-panel");panel.classList.remove("dialogue-updated");void panel.offsetWidth;panel.classList.add("dialogue-updated");$("speaker").textContent=t("ملاحظات المحقق","INVESTIGATOR'S NOTES");$("dialogue").textContent=text;$("choiceArea").replaceChildren();}
function advanceTime(){const target=23*60+11;const next=state.minutes+17;if(state.minutes<target&&next>=target){state.minutes=target;say(t("توقفت الساعة عند 11:11. الهواء صار أثقل… كأن الفندق ينتظر منك قراراً.","The clock stops at 11:11. The air grows heavy… as if the hotel is waiting for your decision."));}else if(state.minutes>=target){state.minutes=19*60;state.loop++;state.scene="lobby";say(t("11:11… عاد كل شيء إلى البداية. لكن هذه المرة، ذاكرتك لم تُمحَ. الأدلة التي جمعتها ما زالت معك.","11:11… everything returned to the beginning. But this time, your memory survived. Your collected clues remain."));}else{state.minutes=next;}save();render();}
function inspect(id){if(state.chapter===3){inspectChapterThree(id);return;}if(state.chapter===2){inspectChapterTwo(id);return;}if(!clues[id])return;playSound("clue");const c=clues[id];say(c[language]);if(!state.clues.includes(id)){state.clues.push(id);state.roomUnlocked=state.clues.length>=4&&state.keyFound;save();render();}
 if(id==="keys"||id==="scratch"){addChoice(t("اذهب إلى الممر","Go to the corridor"),()=>go("corridor"));}if(id==="box"){addChoice(t("افحص الصورة عن قرب","Examine the photograph closely"),showPhotoReveal);addChoice(t("حل لغز قفل الصندوق","Solve the box lock puzzle"),showRoomPuzzle);addChoice(t("حاول فهم الصورة","Try to understand the photograph"),()=>{if(state.clues.length===6&&state.puzzleSolved){showChapterOneEnding();}else if(state.clues.length===6&&!state.puzzleSolved){say(t("الأدلة الستة اكتملت، لكن الصندوق ما زال يخفي شيئاً. حل شفرة القفل أولاً.","All six clues are collected, but the box is still hiding something. Solve its lock first."));addChoice(t("حل لغز القفل","Solve the lock"),showRoomPuzzle);}else{say(t("هناك تفاصيل ناقصة. لا تزال بعض الأدلة خارج الصورة.","Something is missing. Some clues are still out of view."));}save();});}
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
function showRoomPuzzle(){
 if(state.puzzleSolved){say(t("القفل مفتوح بالفعل. الأرقام الأربعة كانت أمامك طوال الوقت.","The lock is already open. The four digits were in front of you all along."));return;}
 say(t("على قفل الصندوق أربعة خانات. تقول الملاحظة: «الساعة متوقفة عند وقت واحد، والخدوش تكرره. اكتب الوقت أربعة أرقام دون النقطتين».","The box has a four-digit lock. A note reads: “The clock stopped at one time, and the scratches repeat it. Enter that time as four digits, without the colon.”"));
 const form=document.createElement("form");form.className="puzzle-form";
 const label=document.createElement("label");label.className="puzzle-label";label.textContent=t("شفرة الصندوق","BOX CODE");label.htmlFor="roomCode";
 const input=document.createElement("input");input.id="roomCode";input.className="puzzle-input";input.type="text";input.inputMode="numeric";input.autocomplete="off";input.maxLength=4;input.pattern="[0-9]{4}";input.placeholder="••••";input.setAttribute("aria-label",t("أدخل أربعة أرقام","Enter four digits"));input.required=true;
 const submit=document.createElement("button");submit.className="choice-btn";submit.type="submit";submit.textContent=t("جرّب الشفرة","Try code");
 form.append(label,input,submit);
 form.addEventListener("submit",event=>{
  event.preventDefault();const code=input.value.trim();
  if(code==="1111"){
   state.puzzleSolved=true;save();playSound("clue");
   say(t("صدر صوت نقرة… وانفتح القفل. في داخل الصندوق شريط ورقي صغير: «لم تكن تبحث عن الغرفة 11… بل عن الليلة التي نسيتها».","A click… the lock opens. Inside is a narrow strip of paper: “You were not searching for Room 11… you were searching for the night you forgot.”"));
   addChoice(t("راجع الصورة الأخيرة","Review the final photograph"),()=>{if(state.clues.length===6){showChapterOneEnding();}else say(t("الشفرة صحيحة. ما زالت هناك أدلة أخرى تنتظرك.","The code is correct. More clues are still waiting for you."));});
  }else{
   playSound("move");say(t("الشفرة غير صحيحة. تذكّر: هناك دليل في الردهة ودليل على جدار الممر.","That code is incorrect. Remember: one clue is in the lobby and another is on the corridor wall."));
   addChoice(t("حاول مرة أخرى","Try again"),showRoomPuzzle);
  }
 });
 $("choiceArea").appendChild(form);input.focus();
}
function showChapterOneEnding(){
 state.finished=true;save();playSound("door");
 const art=$("sceneArt");const old=art.querySelector(".chapter-ending");if(old)old.remove();
 const overlay=document.createElement("div");overlay.className="chapter-ending";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-label",t("نهاية الفصل الأول","Chapter One ending"));
 const clock=document.createElement("div");clock.className="ending-clock";clock.textContent="11:11";
 const silhouette=document.createElement("div");silhouette.className="ending-silhouette";silhouette.setAttribute("aria-hidden","true");
 const content=document.createElement("div");content.className="ending-content";
 const eyebrow=document.createElement("div");eyebrow.className="ending-eyebrow";eyebrow.textContent=t("THE 11:11 · الفصل الأول","THE 11:11 · CHAPTER ONE");
 const title=document.createElement("h2");title.textContent=t("الليلة التي نسيتها","THE NIGHT YOU FORGOT");
 const message=document.createElement("p");message.textContent=t("انفتح باب الفندق أخيراً… لكن النزيل المجهول لم يكن ينتظرك في الخارج. كان ينتظرك داخل الصورة، واقفاً خلفك منذ بداية الليلة. قلبت الصورة، فوجدت جملة واحدة: «إذا أردت الحقيقة، ارجع إلى الليلة الأولى».","The hotel door finally opened… but the mysterious guest was not waiting outside. He was inside the photograph, standing behind you since the beginning of the night. On its back was one sentence: “If you want the truth, return to the first night.”");
 const note=document.createElement("p");note.className="ending-next";note.textContent=t("نهاية الفصل الأول — يتبع في الفصل الثاني: الليلة المنسية","CHAPTER ONE COMPLETE — CONTINUES IN CHAPTER TWO: THE FORGOTTEN NIGHT");
 const next=document.createElement("button");next.className="ending-close";next.type="button";next.textContent=t("ابدأ الفصل الثاني","Begin Chapter Two");next.addEventListener("click",startChapterTwo);
 const close=document.createElement("button");close.className="ending-close";close.type="button";close.textContent=t("العودة إلى دفتر الأدلة","Return to case notes");close.addEventListener("click",()=>overlay.remove());
 content.append(eyebrow,title,message,note,next,close);overlay.append(clock,silhouette,content);art.appendChild(overlay);close.focus();
}
function startChapterTwo(){
 const ending=$("sceneArt").querySelector(".chapter-ending");if(ending)ending.remove();
 state.chapter=2;state.chapter2Clues=[];state.chapter2Solved=false;state.finished=false;state.scene="lobby";state.minutes=20*60;save();render();
 say(t("تعود إلى الفندق… لكن هذه المرة لا توجد موسيقى ولا أضواء. جهاز تسجيل قديم يعمل وحده خلف مكتب الاستقبال. وعلى شاشته رقم واحد: 03.","You return to the hotel… but this time there is no music and no light. An old recorder is playing by itself behind reception. Its display shows one number: 03."));
}
function inspectChapterTwo(id){
 const clue=chapterTwoClues[id];if(!clue)return;
 playSound("photo");say(clue[language]);
 if(!state.chapter2Clues.includes(id)){state.chapter2Clues.push(id);save();render();}
 if(id==="tape")addChoice(t("اذهب إلى الممر وافحص التقويم","Go to the corridor and inspect the calendar"),()=>go("corridor"));
 if(id==="calendar")addChoice(t("ادخل الغرفة 11 وافحص المرآة","Enter Room 11 and inspect the mirror"),()=>go("room"));
 if(id==="mirror"){
  if(state.chapter2Clues.length===3)addChoice(t("جرّب شفرة المرآة","Try the mirror code"),showChapterTwoPuzzle);
  else addChoice(t("راجع الأدلة التي جمعتها","Review the clues"),()=>say(t("الصوت قال الثالثة بعد منتصف الليل، والتقويم أعطاك 03. المرآة تحمل الرقمين الأخيرين. بقي أن تجمعها في شفرة واحدة.","The voice said three after midnight, and the calendar gave you 03. The mirror holds the last two digits. Put them together into one code.")));
 }
}
function showChapterTwoPuzzle(){
 say(t("تظهر على المرآة أربعة مربعات مضيئة. تذكّر: الشريط أعطاك 03، والمرآة أعطتك 11. اكتب الأرقام بالترتيب.","Four squares glow on the mirror. Remember: the tape gave you 03, and the mirror gave you 11. Enter them in that order."));
 const form=document.createElement("form");form.className="puzzle-form";
 const label=document.createElement("label");label.className="puzzle-label";label.textContent=t("شفرة المرآة","MIRROR CODE");label.htmlFor="mirrorCode";
 const input=document.createElement("input");input.id="mirrorCode";input.className="puzzle-input";input.type="text";input.inputMode="numeric";input.maxLength=4;input.pattern="[0-9]{4}";input.placeholder="••••";input.required=true;
 const submit=document.createElement("button");submit.className="choice-btn";submit.type="submit";submit.textContent=t("افتح الذكرى","Unlock the memory");
 form.append(label,input,submit);
 form.addEventListener("submit",event=>{event.preventDefault();if(input.value.trim()==="0311"){state.chapter2Solved=true;state.finished=true;save();showChapterTwoEnding();}else{say(t("المرآة اهتزت… الشفرة غير صحيحة. راجع ترتيب الدليلين.","The mirror trembles… the code is wrong. Check the order of the two clues."));addChoice(t("حاول مرة أخرى","Try again"),showChapterTwoPuzzle);}});
 $("choiceArea").appendChild(form);input.focus();
}
function showChapterTwoEnding(){
 state.finished=true;save();playSound("door");
 const art=$("sceneArt");const overlay=document.createElement("div");overlay.className="chapter-ending chapter-two-ending";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");
 const clock=document.createElement("div");clock.className="ending-clock";clock.textContent="03:11";
 const silhouette=document.createElement("div");silhouette.className="ending-silhouette";
 const content=document.createElement("div");content.className="ending-content";
 const eyebrow=document.createElement("div");eyebrow.className="ending-eyebrow";eyebrow.textContent=t("THE 11:11 · الفصل الثاني","THE 11:11 · CHAPTER TWO");
 const title=document.createElement("h2");title.textContent=t("الوجه خلف المرآة","THE FACE BEHIND THE MIRROR");
 const message=document.createElement("p");message.textContent=t("انشقّ انعكاسك إلى صورتين. واحدة بقيت مكانك… والأخرى ابتسمت وكتبت على الزجاج: «أنا لست النزيل. أنا أنت… قبل أن تنسى». ثم انطفأت كل الأضواء.","Your reflection split in two. One stayed where you stood… the other smiled and wrote on the glass: “I am not the guest. I am you… before you forgot.” Then every light went out.");
 const note=document.createElement("p");note.className="ending-next";note.textContent=t("نهاية الفصل الثاني — الفصل الثالث: الحقيقة الأخيرة","CHAPTER TWO COMPLETE — CHAPTER THREE: THE FINAL TRUTH");
 const next=document.createElement("button");next.className="ending-close";next.type="button";next.textContent=t("ابدأ الفصل الثالث","Begin Chapter Three");next.addEventListener("click",startChapterThree);
 const close=document.createElement("button");close.className="ending-close";close.type="button";close.textContent=t("العودة إلى دفتر الأدلة","Return to case notes");close.addEventListener("click",()=>overlay.remove());
 content.append(eyebrow,title,message,note,next,close);overlay.append(clock,silhouette,content);art.appendChild(overlay);close.focus();
}
function startChapterThree(){
 const ending=$("sceneArt").querySelector(".chapter-ending");if(ending)ending.remove();
 state.chapter=3;state.chapter3Clues=[];state.chapter3Solved=false;state.finished=false;state.scene="lobby";state.minutes=20*60;save();render();
 say(t("تُفتح الردهة من جديد. هذه المرة تجد سجل المناوبة مفتوحاً على صفحة تحمل اسمك. لم يعد أمامك إلا أن تعرف لماذا كنت تعود كل ليلة.","The lobby opens again. This time, the night register is open to a page bearing your name. Now you only need to discover why you kept returning."));
}
function inspectChapterThree(id){
 const clue=chapterThreeClues[id];if(!clue)return;
 playSound("photo");say(clue[language]);
 if(!state.chapter3Clues.includes(id)){state.chapter3Clues.push(id);save();render();}
 if(id==="register")addChoice(t("اذهب إلى الممر وافحص الكتابة","Go to the corridor and inspect the writing"),()=>go("corridor"));
 if(id==="message")addChoice(t("ادخل الغرفة 11 وافحص الظرف","Enter Room 11 and inspect the envelope"),()=>go("room"));
 if(id==="envelope"){
  if(state.chapter3Clues.length===3)addChoice(t("افتح قفل الذاكرة","Open the memory lock"),showChapterThreePuzzle);
  else addChoice(t("راجع الأدلة الناقصة","Review the missing clues"),()=>say(t("السجل يثبت أنك كنت موظفاً، والرسالة تعطي ترتيب الأرقام. اجمع الأدلة الثلاثة أولاً.","The register proves you worked here, and the message gives the number order. Collect all three clues first.")));
 }
}
function showChapterThreePuzzle(){
 say(t("القفل الأخير يطلب أربعة أرقام. الرسالة قالت: الوقت أولاً، ثم تاريخ الليلة. اجمع 11:11 مع 03 بالترتيب، من دون نقطتين أو شرطة.","The final lock asks for four digits. The message says: time first, then the night’s date. Combine 11:11 and 03 in that order, without punctuation."));
 const form=document.createElement("form");form.className="puzzle-form";
 const label=document.createElement("label");label.className="puzzle-label";label.textContent=t("شفرة الحقيقة","TRUTH CODE");label.htmlFor="truthCode";
 const input=document.createElement("input");input.id="truthCode";input.className="puzzle-input";input.type="text";input.inputMode="numeric";input.maxLength=4;input.pattern="[0-9]{4}";input.placeholder="••••";input.required=true;
 const submit=document.createElement("button");submit.className="choice-btn";submit.type="submit";submit.textContent=t("اكشف الحقيقة","Reveal the truth");
 form.append(label,input,submit);
 form.addEventListener("submit",event=>{event.preventDefault();if(input.value.trim()==="1103"){state.chapter3Solved=true;state.finished=true;save();showChapterThreeEnding();}else{playSound("move");say(t("القفل لم يفتح. راجع الرسالة: الوقت أولاً، ثم تاريخ الليلة.","The lock stays shut. Recheck the message: time first, then the date of the night."));addChoice(t("حاول مرة أخرى","Try again"),showChapterThreePuzzle);}});
 $("choiceArea").appendChild(form);input.focus();
}
function showChapterThreeEnding(){
 state.chapter3Solved=true;state.finished=true;save();playSound("door");
 const art=$("sceneArt");const old=art.querySelector(".chapter-ending");if(old)old.remove();
 const overlay=document.createElement("div");overlay.className="chapter-ending chapter-three-ending";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-label",t("نهاية اللعبة","Game ending"));
 const clock=document.createElement("div");clock.className="ending-clock";clock.textContent="11:11";
 const silhouette=document.createElement("div");silhouette.className="ending-silhouette";silhouette.setAttribute("aria-hidden","true");
 const content=document.createElement("div");content.className="ending-content";
 const eyebrow=document.createElement("div");eyebrow.className="ending-eyebrow";eyebrow.textContent=t("THE 11:11 · النهاية","THE 11:11 · THE END");
 const title=document.createElement("h2");title.textContent=t("الحقيقة الأخيرة","THE FINAL TRUTH");
 const message=document.createElement("p");message.textContent=t("تذكّرت الآن: كنت موظف الاستقبال في الفندق، والنزيل الذي كان يظهر لك هو صورتك القديمة التي تركتها في تلك الليلة. أغلقت الفندق وغادرت، لكنك لم تستطع نسيان وعدك لنفسك. لم تكن الساعة تحبسك؛ كانت الأدلة تقودك إلى الحقيقة. عند 11:11، وضعت المفتاح على المكتب وخرجت أخيراً. هذه المرة لن تعود.","Now you remember: you were the hotel receptionist, and the guest who appeared was the memory of who you had been that night. You closed the hotel and left, but could not forget the promise you made to yourself. The clock never trapped you; the clues led you back to the truth. At 11:11, you place the key on the desk and finally walk out. This time, you will not return.");
 const note=document.createElement("p");note.className="ending-next";note.textContent=t("اكتملت القصة — THE 11:11","STORY COMPLETE — THE 11:11");
 const restart=document.createElement("button");restart.className="ending-close";restart.type="button";restart.textContent=t("ابدأ القصة من جديد","Play the story again");restart.addEventListener("click",()=>{state=initialState();save();render();overlay.remove();say(t("ليلة جديدة تبدأ… هذه المرة أنت تعرف الحقيقة.","A new night begins… this time, you know the truth."));});
 const close=document.createElement("button");close.className="ending-close";close.type="button";close.textContent=t("عرض النهاية","View ending");close.addEventListener("click",()=>overlay.remove());
 content.append(eyebrow,title,message,note,restart,close);overlay.append(clock,silhouette,content);art.appendChild(overlay);close.focus();
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
function go(scene){if(!sceneInfo[scene]||(scene==="room"&&!state.roomUnlocked)||scene===state.scene||document.body.classList.contains("scene-transitioning"))return;playSound("move");if(scene==="room")playSound("door");const art=$("sceneArt");document.body.classList.add("scene-transitioning");art.classList.remove("scene-entering");art.classList.add("scene-leaving");window.setTimeout(()=>{state.scene=scene;advanceTime();say((state.chapter===3?chapterThreeSceneInfo[state.scene]:(state.chapter===2?chapterTwoSceneInfo[state.scene]:sceneInfo[state.scene])).title[language]);art.classList.remove("scene-leaving");art.classList.add("scene-entering");window.setTimeout(()=>{art.classList.remove("scene-entering");document.body.classList.remove("scene-transitioning");},680);},240);}
function start(){if(!load())state=initialState();$("startScreen").classList.add("hidden");$("gameScreen").classList.remove("hidden");render();if(state.chapter===3&&state.chapter3Solved)showChapterThreeEnding();else if(state.chapter===2&&state.chapter2Solved)showChapterTwoEnding();else if(state.chapter===1&&state.finished)showChapterOneEnding();else say(state.chapter===3?t("هذه هي مناوبتك الأخيرة. اجمع الأدلة الثلاثة، ثم واجه الحقيقة في الغرفة 11.","This is your final shift. Collect the three clues, then face the truth in Room 11."):state.chapter===2?t("رجعت إلى الليلة المنسية. الشريط ما زال يعمل…","You have returned to the forgotten night. The tape is still playing…"):t("وصلت إلى الفندق قبل الغروب بقليل. المكان هادئ أكثر من اللازم… وهناك شيء غير طبيعي في هذه الليلة.","I arrived just before sunset. The place is too quiet… something feels wrong tonight."));}
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