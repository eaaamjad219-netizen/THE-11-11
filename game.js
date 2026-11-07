const startScreen=document.getElementById("startScreen");
const gameScreen=document.getElementById("gameScreen");
const startBtn=document.getElementById("startBtn");
const langBtn=document.getElementById("langBtn");
const dialogue=document.getElementById("dialogue");
const clueList=document.getElementById("clueList");
const clueCount=document.getElementById("clueCount");
let language="ar";
const clues={
  clock:{ar:"الساعة متوقفة عند 11:11 تماماً. عقاربها لا تتحرك، رغم أن صوت دقاتها ما زال يُسمع.",en:"The clock is frozen at exactly 11:11. Its hands do not move, yet ticking can still be heard.",nameAr:"ساعة متوقفة عند 11:11",nameEn:"Clock frozen at 11:11"},
  book:{ar:"دفتر النزلاء مفتوح على صفحة ممزقة. الاسم الأخير كُتب قبل سنوات… والتاريخ هو تاريخ اليوم.",en:"The guest ledger is open to a torn page. The last name was written years ago… but the date is today.",nameAr:"صفحة غريبة في دفتر النزلاء",nameEn:"A strange guest ledger entry"},
  keys:{ar:"مفاتيح الغرف مرتبة بعناية، لكن المفتاح رقم 11 مفقود. مكانه فارغ ومغطى بالغبار.",en:"The room keys are neatly arranged, but key number 11 is missing. Its empty hook is covered in dust.",nameAr:"مفتاح الغرفة 11 مفقود",nameEn:"Room 11 key is missing"}
};
const found=new Set();
startBtn.addEventListener("click",()=>{startScreen.classList.add("hidden");gameScreen.classList.remove("hidden");});
document.querySelectorAll("[data-clue]").forEach(button=>button.addEventListener("click",()=>{
 const id=button.dataset.clue;const clue=clues[id];dialogue.textContent=clue[language];
 if(!found.has(id)){found.add(id);const empty=clueList.querySelector(".empty");if(empty)empty.remove();const li=document.createElement("li");li.textContent=language==="ar"?clue.nameAr:clue.nameEn;li.dataset.id=id;clueList.appendChild(li);clueCount.textContent=found.size+" / 3";}
}));
langBtn.addEventListener("click",()=>{
 language=language==="ar"?"en":"ar";document.documentElement.lang=language;document.documentElement.dir=language==="ar"?"rtl":"ltr";document.body.dir=document.documentElement.dir;langBtn.textContent=language==="ar"?"EN":"عربي";
 document.querySelectorAll("[data-ar][data-en]").forEach(el=>el.textContent=el.dataset[language]);
 document.querySelectorAll("#clueList li[data-id]").forEach(li=>{const c=clues[li.dataset.id];li.textContent=language==="ar"?c.nameAr:c.nameEn;});
});
