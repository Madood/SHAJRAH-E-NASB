// ═══════════════════════════════════════════════
// SHAJRA APP — useTree Hook (central state)
// ═══════════════════════════════════════════════

import { useState, useCallback, useEffect } from 'react'
import {
  addChild, removeNode, updateNode,
  getAllIds, getIdsUpToNasl, generateId, searchNodes, findAncestors,
} from '../utils/treeOps'
import { useStorage } from './useStorage'

// ── Urdu name patch (fills missing nameAr on load) ──────────────────────────
const _W = {
  hazrat:'حضرت',hazart:'حضرت',sahibzada:'صاحبزادہ',sahizada:'صاحبزادہ',
  sahibzad:'صاحبزادہ',sahib:'صاحب',saheb:'صاحب',sahb:'صاحب',shaeb:'صاحب',
  sahab:'صاحب',mian:'میاں',miana:'میاں',mia:'میاں',khwaja:'خواجہ',
  haji:'حاجی',allama:'علامہ',peer:'پیر',hafiz:'حافظ',dr:'ڈاکٹر',
  ud:'الد',ul:'ال',bin:'بن',deen:'دین',din:'دین',
  muhammad:'محمد',muhammd:'محمد',muhmmad:'محمد',muhamad:'محمد',
  noor:'نور',nur:'نور',ahmad:'احمد',ahmed:'احمد',ahamd:'احمد',
  ali:'علی',hussain:'حسین',husain:'حسین',hassan:'حسن',hasan:'حسن',
  hussnain:'حسنین',husnain:'حسنین',ghulam:'غلام',baksh:'بخش',nabi:'نبی',
  rehman:'رحمٰن',rahman:'رحمٰن',rahim:'رحیم',kareem:'کریم',karim:'کریم',
  sattar:'ستار',jabbar:'جبار',qadir:'قادر',qadeer:'قدیر',samad:'صمد',
  razzaq:'رزاق',rasheed:'رشید',rashid:'رشید',waheed:'وحید',majeed:'مجید',
  hameed:'حمید',hamid:'حامد',saeed:'سعید',mehmood:'محمود',mahmood:'محمود',
  mahmud:'محمود',masood:'مسعود',dawood:'داؤد',daud:'داؤد',yousaf:'یوسف',
  yusuf:'یوسف',ibrahim:'ابراہیم',ibraheem:'ابراہیم',ismael:'اسماعیل',
  idrees:'ادریس',yahya:'یحیٰی',musa:'موسیٰ',moosa:'موسیٰ',haroon:'ہارون',
  suleman:'سلیمان',sulaiman:'سلیمان',saleh:'صالح',talha:'طلحہ',zubair:'زبیر',
  umar:'عمر',omar:'عمر',omer:'عمر',umer:'عمر',ammar:'عمار',amar:'عمار',
  anas:'انس',bilal:'بلال',khalid:'خالد',saad:'سعد',huzaifa:'حذیفہ',
  usama:'اسامہ',ameen:'امین',amin:'امین',nizam:'نظام',
  khizer:'خضر',khizar:'خضر',khizr:'خضر',fareed:'فرید',farid:'فرید',
  naeem:'نعیم',shareef:'شریف',sharif:'شریف',ashraf:'اشرف',mushtaq:'مشتاق',
  arif:'عارف',arham:'ارحم',aqil:'عقیل',aqeel:'عقیل',akil:'عاقل',
  akbar:'اکبر',akram:'اکرم',atta:'عطاء',faiz:'فیض',rasool:'رسول',
  sadeeq:'صدیق',siddiq:'صدیق',ghous:'غوث',kamal:'کمال',imam:'امام',
  fakhar:'فخر',fakhr:'فخر',siraj:'سراج',qutab:'قطب',qutub:'قطب',
  mueen:'معین',moin:'معین',moeen:'معین',badar:'بدر',baha:'بہاء',
  shahab:'شہاب',shams:'شمس',zia:'ضیاء',jallal:'جلال',jalal:'جلال',
  iqbal:'اقبال',mudassar:'مدثر',zain:'زین',zahid:'زاہد',zahoor:'ظہور',
  waqas:'وقاص',junaid:'جنید',javed:'جاوید',javaid:'جاوید',irshad:'ارشاد',
  ishfaq:'اشفاق',ittifaq:'اتفاق',ishtiaq:'اشتیاق',imran:'عمران',
  adil:'عادل',adeel:'عادل',aslam:'اسلم',asim:'عاصم',asad:'اسد',
  aoun:'عون',awais:'اویس',owaise:'اویس',owais:'اویس',irfan:'عرفان',
  mumtaz:'ممتاز',mumshad:'ممشاد',abid:'عابد',ibrar:'ابرار',
  dastageer:'دستگیر',dastagir:'دستگیر',ghani:'غنی',khair:'خیر',
  parvez:'پرویز',parvaiz:'پرویز',pervaiz:'پرویز',noman:'نعمان',nouman:'نعمان',
  armia:'ارمیاء',rafey:'رافع',raffey:'رافع',rafay:'رافع',moeed:'موید',
  babal:'بابل',babul:'بابل',burhan:'برہان',abu:'ابو',madood:'مودود',
  bakar:'بکر',bakr:'بکر',qayoom:'قیوم',qamar:'قمر',qaisar:'قیصر',
  qaiser:'قیصر',azmat:'عظمت',hassam:'حسام',shakoor:'شکور',shafae:'شفیع',
  sultan:'سلطان',naseer:'نصیر',nasir:'نصیر',hayyat:'حیات',akhtar:'اختر',
  ajmal:'اجمل',zafar:'ظفر',mughees:'مغیث',zulqarnen:'ذوالقرنین',
  konain:'کونین',najam:'نجم',nalain:'نعلین',mustafa:'مصطفیٰ',
  kaleem:'کلیم',kalim:'کلیم',saleem:'سلیم',salim:'سلیم',nadeem:'ندیم',
  qasim:'قاسم',zikiriya:'زکریاء',zakariya:'زکریاء',kibiriya:'کبریاء',
  harmain:'حرمین',haris:'حارث',zeeshan:'ذیشان',zeshan:'ذیشان',
  shehzad:'شہزاد',shahzad:'شہزاد',turab:'تراب',samand:'سمند',bedar:'بیدار',
  azeez:'عزیز',aziz:'عزیز',ghaffar:'غفار',ghafoor:'غفور',aleem:'علیم',
  wasay:'واسع',wasil:'واصل',khaliq:'خالق',muneer:'منیر',munir:'منیر',
  riaz:'ریاض',kabeer:'کبیر',hashim:'ہاشم',muhaimun:'مہیمن',adam:'آدم',
  nuh:'نوح',mansoor:'منصور',jamal:'جمال',usman:'عثمان',uthman:'عثمان',
  jaffar:'جعفر',faraz:'فراز',muneeb:'منیب',mamoon:'مامون',sarmad:'سرمد',
  fazal:'فضل',fazil:'فضل',fazel:'فضل',naveed:'نوید',shah:'شاہ',
  jehan:'جہاں',wajdan:'وجدان',manghervi:'منگھیروی',mangharvi:'منگھیروی',
  tariq:'طارق',ijaz:'اعجاز',aizaz:'اعزاز',bakhtiar:'بختیار',amjad:'امجد',
  saif:'سیف',shujah:'شجاع',shoeb:'شعیب',shoaib:'شعیب',rawal:'راول',
  danish:'دانش',daniyal:'دانیال',faisal:'فیصل',shehbaz:'شہباز',
  younus:'یونس',mehrouz:'مہروز',nofil:'نوفل',wajih:'وجیہ',wajeeh:'وجیہ',
  asif:'آصف',ahsan:'احسان',hamza:'حمزہ',adnan:'عدنان',farhan:'فرحان',
  kamil:'کامل',muzzamil:'مزمل',taj:'تاج',fateh:'فتح',tahir:'طاہر',
  khurram:'خرم',khuram:'خرم',farooq:'فاروق',yasir:'یاسر',waqar:'وقار',
  waseem:'وسیم',wasim:'وسیم',saqlain:'ثاقلین',altaf:'الطاف',akmal:'اکمل',
  hammad:'حماد',jawad:'جواد',amir:'امیر',aamir:'عامر',zaheer:'ظہیر',
  waris:'وارث',salman:'سلمان',haqdad:'حق داد',umair:'عمیر',nabeel:'نبیل',
  mazhar:'مظہر',sohail:'سہیل',tanveer:'تنویر',talib:'طالب',faseeh:'فصیح',
  azar:'آذر',shaan:'شان',aftab:'آفتاب',nawaz:'نواز',kharal:'کھرل',
  anees:'انیس',buland:'بلند',bakht:'بخت',yaar:'یار',uns:'انس',
  khuda:'خدا',mousa:'موسیٰ',doud:'داؤد',ilam:'علام',
}
const _P = [
  [/\bzain\s+ul\s+a[nb]ideen\b/gi,'زین العابدین'],
  [/\babdullah\b/gi,'عبداللہ'],
  [/\babdul\s+rehman\b/gi,'عبدالرحمٰن'],[/\babdul\s+rahman\b/gi,'عبدالرحمٰن'],
  [/\babdur\s+rehman\b/gi,'عبدالرحمٰن'],[/\babdur\s+rahman\b/gi,'عبدالرحمٰن'],
  [/\babdur\s+ehman\b/gi,'عبدالرحمٰن'],[/\babdul\s+sattar\b/gi,'عبدالستار'],
  [/\babdul\s+razzaq\b/gi,'عبدالرزاق'],[/\babdul\s+nabi\b/gi,'عبدالنبی'],
  [/\babdul\s+shakoor\b/gi,'عبدالشکور'],[/\babdul\s+qadir\b/gi,'عبدالقادر'],
  [/\babdul\s+kareem\b/gi,'عبدالکریم'],[/\babdul\s+ghaffar\b/gi,'عبدالغفار'],
  [/\babdul\s+aleem\b/gi,'عبدالعلیم'],[/\babdul\s+ghani\b/gi,'عبدالغنی'],
  [/\babdul\s+azeez\b/gi,'عبدالعزیز'],[/\babdul\s+haq\b/gi,'عبدالحق'],
  [/\babdul\s+khaliq\b/gi,'عبدالخالق'],[/\babdul\s+wasay\b/gi,'عبدالواسع'],
  [/\babdul\s+ahad\b/gi,'عبدالاحد'],[/\babdul\s+rehman\b/gi,'عبدالرحمٰن'],
  [/\ballah\s*-\s*dad\b/gi,'اللہ داد'],[/\ballah\s+daad?\b/gi,'اللہ داد'],
  [/\ballah\s+baksh\b/gi,'اللہ بخش'],
  [/\bud\s+deen\b/gi,'الدین'],[/\bud\s+din\b/gi,'الدین'],
  [/\bul\s+haq\b/gi,'الحق'],[/\bul\s+hassan\b/gi,'الحسن'],
  [/\bul\s+hasan\b/gi,'الحسن'],[/\bul\s+hasasn\b/gi,'الحسن'],
  [/\bghullam\s+jehania\b/gi,'غلام جہانیاء'],[/\bghulam\s+jehania\b/gi,'غلام جہانیاء'],
  [/\bghulam\s+noor\s+muhammad\b/gi,'غلام نور محمد'],
  [/\bghulam\s+fareed\b/gi,'غلام فرید'],[/\bghulam\s+sadeeq\b/gi,'غلام صدیق'],
  [/\bghulam\s+rasool\b/gi,'غلام رسول'],[/\bghulam\s+moyiuudin\b/gi,'غلام معین الدین'],
  [/\bghulam\s+moeen\s+ud\s+deen\b/gi,'غلام معین الدین'],
  [/\bghulam\s+noor\b/gi,'غلام نور'],[/\bghulam\s+qadir\b/gi,'غلام قادر'],
  [/\bghulam\s+ali\b/gi,'غلام علی'],[/\bghulam\s+hussain\b/gi,'غلام حسین'],
  [/\bghulam\s+fakhr?\s*ud\s*deen\b/gi,'غلام فخرالدین'],
  [/\bghulam\s+fakhar\b/gi,'غلام فخر'],
  [/\bghulam\s+naseer\s+ud\s+deen\b/gi,'غلام نصیرالدین'],
  [/\bghulam\s+naseer\b/gi,'غلام نصیر'],[/\bghulam\s+mehmood\b/gi,'غلام محمود'],
  [/\bghulam\s+ahmad\b/gi,'غلام احمد'],[/\bghulam\s+dastageer\b/gi,'غلام دستگیر'],
  [/\bghulam\s+zikiriya\b/gi,'غلام زکریاء'],[/\bghulam\s+kibiriya\b/gi,'غلام کبریاء'],
  [/\bghulam\s+harmain\b/gi,'غلام حرمین'],[/\bghulam\s+sulaiman\b/gi,'غلام سلیمان'],
  [/\bghulam\s+hassan\b/gi,'غلام حسن'],[/\bghulam\s+khizar\b/gi,'غلام خضر'],
  [/\bghulam\s+noor\s+jehanian\b/gi,'غلام نور جہانیاں'],
  [/\bnoor\s+samand\b/gi,'نور سمند'],[/\bnoor\s+jehania[hn]?\b/gi,'نور جہانیاء'],
  [/\bnoor\s+jehanian\b/gi,'نور جہانیاں'],[/\bnoor\s+baksh\b/gi,'نور بخش'],
  [/\bnoor\s+muhammad\b/gi,'نور محمد'],[/\bnoor\s+fareed\b/gi,'نور فرید'],
  [/\bnoor\s+ahmad\b/gi,'نور احمد'],[/\bnoor\s+hassan\b/gi,'نور حسن'],
  [/\bnoor\s+ul\s+talha\b/gi,'نورالطلحہ'],[/\bnoor\s+ul\s+haq\b/gi,'نورالحق'],
  [/\bahmad\s+baksh\b/gi,'احمد بخش'],[/\bahmad\s+yaar\b/gi,'احمد یار'],
  [/\bahmad\s+ali\b/gi,'احمد علی'],
  [/\bali\s+hussain\b/gi,'علی حسین'],[/\bali\s+azmat\b/gi,'علی عظمت'],
  [/\bali\s+noor\b/gi,'علی نور'],
  [/\bkareem\s+baksh\b/gi,'کریم بخش'],[/\bimam\s+baksh\b/gi,'امام بخش'],
  [/\bkhuda\s+baksh\b/gi,'خدا بخش'],[/\bmehmood\s+baksh\b/gi,'محمود بخش'],
  [/\bqamar\s+yaar\b/gi,'قمر یار'],
  [/\bbadar\s+ud\s+deen\b/gi,'بدرالدین'],[/\bbaha\s+ud\s+deen\b/gi,'بہاءالدین'],
  [/\bshams\s+ud\s+deen\b/gi,'شمسالدین'],[/\bmoeen\s+ud\s+deen\b/gi,'معین الدین'],
  [/\bfakhar\s+ud\s+d[ie][en]+\b/gi,'فخرالدین'],[/\bsiraj\s+ud\s+deen\b/gi,'سراجالدین'],
  [/\bqutab\s+ud\s+deen\b/gi,'قطبالدین'],[/\bnizam\s+ud\s+deen\b/gi,'نظامالدین'],
  [/\bnizam\s+deen\b/gi,'نظامالدین'],[/\bkamal\s+ud\s+deen\b/gi,'کمال الدین'],
  [/\bburhan\s+ud\s+deen\b/gi,'برہانالدین'],[/\bjamal\s+deen\b/gi,'جمالالدین'],
  [/\bnaseer\s+ud\s+deen\b/gi,'نصیرالدین'],[/\bnaeem\s+ud\s+deen\b/gi,'نعیم الدین'],
  [/\bkaleem\s+ud\s+deen\b/gi,'کلیم الدین'],[/\bmueen\s+ud\s+deen\b/gi,'معین الدین'],
  [/\bsharaf\s+deen\b/gi,'شرف الدین'],[/\bmohi[y]*\s+ud\s+deen\b/gi,'محی الدین'],
  [/\bmohiyyud\s+deen\b/gi,'محی الدین'],[/\bkhair\s+muhammad\b/gi,'خیر محمد'],
  [/\bfazal\s+ul\s+haq\b/gi,'فضل الحق'],[/\bfazal\s+ul\s+hassan\b/gi,'فضل الحسن'],
  [/\bshams\s+ul\s+haq\b/gi,'شمس الحق'],
  [/\bkhalid\s+ul\s+hassan\b/gi,'خالد الحسن'],
  [/\bmumtaz\s+ul\s+has[as]+n\b/gi,'ممتاز الحسن'],
  [/\bmehmood\s+ul\s+hassan\b/gi,'محمود الحسن'],
  [/\bsarmad\s+ul\s+hassan\b/gi,'سرمد الحسن'],
  [/\bsaif\s+ul\s+hassan\b/gi,'سیف الحسن'],
  [/\bfazal\s+ul\s+hassan\b/gi,'فضل الحسن'],
  [/\bkhizar\s+ul\s+hassan\b/gi,'خضر الحسن'],
  [/\bnoor\s+ul\s+hassan\b/gi,'نور الحسن'],
  [/\bnaveed\s+ul\s+hassan\b/gi,'نوید الحسن'],
  [/\bnadeem\s+ul\s+hassan\b/gi,'ندیم الحسن'],
  [/\bmamoon\s+ul\s+hassan\b/gi,'مامون الحسن'],
  [/\bwaseem\s+hassan\b/gi,'وسیم حسن'],[/\bmudassar\s+hassan\b/gi,'مدثر حسن'],
  [/\bhassan\s+raza\b/gi,'حسن رضا'],[/\bamir\s+hassan\s+raza\b/gi,'امیر حسن رضا'],
  [/\bamir\s+noor\b/gi,'امیر نور'],[/\basif\s+noor\b/gi,'آصف نور'],
  [/\bmehmood\s+hussain\b/gi,'محمود حسین'],[/\bijaz\s+mehmood\b/gi,'اعجاز محمود'],
  [/\bshehzad\s+mehmood\b/gi,'شہزاد محمود'],[/\barham\s+mehmood\b/gi,'ارحم محمود'],
  [/\bawais\s+mehmood\b/gi,'اویس محمود'],[/\bmoeen\s+mehmood\b/gi,'معین محمود'],
  [/\bwajih\s+ur\s+rehman\b/gi,'وجیہ الرحمن'],
  [/\bhandal\s+hussain\b/gi,'حنظل حسین'],[/\bkhalid\s+hussain\b/gi,'خالد حسین'],
  [/\bshujah\s+hussain\b/gi,'شجاع حسین'],[/\bhamid\s+hussain\b/gi,'حامد حسین'],
  [/\bnaseer\s+baksh\b/gi,'نصیر بخش'],[/\bnaseer\s+bakksh\b/gi,'نصیر بخش'],
  [/\bnizam\s+baksh\b/gi,'نظام بخش'],[/\bnoor\s+samad\b/gi,'نور صمد'],
  [/\babu\s+madood\b/gi,'ابو مودود'],[/\babu\s+bakar\b/gi,'ابو بکر'],
  [/\babu\s+al\s+hasnat\b/gi,'ابو الحسنات'],[/\babu\s+tura[ab]+\b/gi,'ابو تراب'],
  [/\bsultan\s+mehmood\b/gi,'سلطان محمود'],
  [/\bhaji\s+kareem\s+baksh\b/gi,'حاجی کریم بخش'],
  [/\bhaji\s+mian\s+noor\s+ahmad\b/gi,'حاجی میاں نور احمد'],
  [/\bhaji\s+mian\s+muhammad\s+mushtaq\b/gi,'حاجی میاں محمد مشتاق'],
  [/\bhafiz\s+ghulam\s+noor\s+muhammad\b/gi,'حافظ غلام نور محمد'],
  [/\bmuhammad\s+hafiz\s+khuda\s+baksh\b/gi,'محمد حافظ خدا بخش'],
  [/\bmuhammad\s+nabi\s+baksh\b/gi,'محمد نبی بخش'],
  [/\bmuhammad\s+ameen\b/gi,'محمد امین'],[/\bmuhammad\s+noor\b/gi,'محمد نور'],
  [/\byasir\s+noor\b/gi,'یاسر نور'],[/\bsohail\s+fareed\b/gi,'سہیل فرید'],
  [/\baltaf\s+fareed\b/gi,'الطاف فرید'],[/\bbilal\s+al\s+fareed\b/gi,'بلال الفرید'],
  [/\bwasil\s+fareed\b/gi,'واصل فرید'],[/\bfazal\s+ahmad\b/gi,'فضل احمد'],
  [/\bfazel\s+ahamd?\b/gi,'فضل احمد'],[/\bfasel\s+ahamd?\b/gi,'فضل احمد'],
  [/\bfazl\s+kareem\b/gi,'فضل کریم'],[/\bfazal\s+kareem\b/gi,'فضل کریم'],
  [/\bmuhammad\s+shareef\b/gi,'محمد شریف'],[/\bmuhammad\s+arif\b/gi,'محمد عارف'],
  [/\bmuhammad\s+saeed\b/gi,'محمد سعید'],[/\bmuhammad\s+ghous\b/gi,'محمد غوث'],
  [/\bmuhamm[da]+\b/gi,'محمد'],[/\buhammad\b/gi,'محمد'],
  [/\bmaharshareef\b/gi,'مہارشریف'],[/\bmaharvi\b/gi,'مہاروی'],[/\bmangh[ae]rvi\b/gi,'منگھیروی'],
  [/\banas\s+mehmood\b/gi,'انس محمود'],[/\bfazal\s+mehmood\b/gi,'فضل محمود'],
  [/\bfateh\s+muhammad\b/gi,'فتح محمد'],
  [/\bnasir\s+ud\s+deen\b/gi,'نصیرالدین'],
  [/\bqutab\s+fareed\b/gi,'قطب فرید'],[/\bfaisal\s+fareed\b/gi,'فیصل فرید'],
  [/\bghulam\s+fazal\s+ul\s+haq\b/gi,'غلام فضل الحق'],
  [/\bwasil\s+aleem\b/gi,'واصل علیم'],
  [/\bdr\s+mia?\s+ahmad\s+raza\s+khuram\b/gi,'ڈاکٹر میاں احمد رضا خرم'],
  [/\bjunaid\s+jallal\b/gi,'جنید جلال'],[/\bshehbaz\s+kaleem\b/gi,'شہباز کلیم'],
  [/\bimran\s+naseer\b/gi,'عمران نصیر'],[/\badnan\s+naseer\b/gi,'عدنان نصیر'],
  [/\bjunaid\s+naseer\b/gi,'جنید نصیر'],[/\bnouman\s+naseer\b/gi,'نعمان نصیر'],
  [/\bhandal\s+naseer\b/gi,'حنظل نصیر'],[/\birfan\s+naseer\b/gi,'عرفان نصیر'],
  [/\bsaleh\s+naseer\b/gi,'صالح نصیر'],
  [/\bzeeshan\s+asif\b/gi,'ذیشان آصف'],[/\bumar\s+asif\b/gi,'عمر آصف'],
  [/\bsalman\s+asif\b/gi,'سلمان آصف'],
  [/\bmuhammad\s+khaliq\b/gi,'محمد خالق'],[/\bmuhammad\s+muneer\b/gi,'محمد منیر'],
  [/\bmuhammad\s+nawaz\b/gi,'محمد نواز'],[/\bmuhammad\s+akram\b/gi,'محمد اکرم'],
  [/\bmuhammad\s+iqbal\b/gi,'محمد اقبال'],
  [/\bmuhammad\s+muneeb\b/gi,'محمد منیب'],[/\bmuhammad\s+mushtaq\b/gi,'محمد مشتاق'],
  [/\bmuhammad\s+husain\b/gi,'محمد حسین'],[/\bmuhammad\s+ajmal\b/gi,'محمد اجمل'],
  [/\bmuhammad\s+akmal\b/gi,'محمد اکمل'],[/\bmuhammad\s+kamil\b/gi,'محمد کامل'],
  [/\bmuhammad\s+muzzamil\b/gi,'محمد مزمل'],[/\bmuhammad\s+hamza\b/gi,'محمد حمزہ'],
  [/\bmuhammad\s+huzaifa\b/gi,'محمد حذیفہ'],[/\bmuhammad\s+awais\b/gi,'محمد اویس'],
  [/\bmuhammad\s+baksh\b/gi,'محمد بخش'],
]

function _translate(name) {
  if (!name) return ''
  let s = name.trim()
  for (const [p, r] of _P) s = s.replace(p, r)
  return s.split(/\s+/).map(w => {
    if (/[\u0600-\u06FF]/.test(w)) return w
    const k = w.toLowerCase().replace(/[^a-z']/g, '')
    if (!k) return ''
    if (k === 'ra' || k === '(ra)') return 'رحمۃ اللہ علیہ'
    return _W[k] || w.replace(/\*+/g, '؟')
  }).filter(Boolean).join(' ').trim()
}

function _patchNameAr(node) {
  if (!node) return node
  if (!node.nameAr || !node.nameAr.trim()) {
    node.nameAr = _translate(node.name)
  }
  // Fix wrongly stored مہارشریف (place name) → مہاروی (nisba title)
  if (node.nameAr) {
    node.nameAr = node.nameAr.replace(/مہارشریف/g, 'مہاروی')
  }
  if (node.children) node.children.forEach(_patchNameAr)
  return node
}
// ─────────────────────────────────────────────────────────────────────────────

export function useTree() {
  const { save, load, clear, saveMode } = useStorage()

  const [tree,        setTree]        = useState(null)
  const [expanded,    setExpanded]    = useState(new Set())
  const [editMode,    setEditMode]    = useState(false)
  const [search,      setSearch]      = useState('')
  const [searchIndex, setSearchIndex] = useState(0)
  const [ready,       setReady]       = useState(false)
  const [initialData, setInitialData] = useState(null)

  // ── Load ──
  useEffect(() => {
    fetch('/shajra-data.json?v=' + Date.now())
      .then(r => r.json())
      .then(fetched => {
        setInitialData(fetched)
        const saved = load()
        // If the fetched data has a newer version than what's cached, discard the cache
        const bundledVersion = fetched.dataVersion
        const cachedVersion  = saved?.dataVersion
        const fresh = (!saved || (bundledVersion && cachedVersion !== bundledVersion))
          ? fetched
          : saved
        const data = _patchNameAr(fresh)
        setTree(data)
        setExpanded(getIdsUpToNasl(data, 2))
        setReady(true)
      })
  }, [])

  // ── Auto-save on tree change ──
  useEffect(() => {
    if (ready && tree) save(tree)
  }, [tree, ready])

  // ── Expand / Collapse ──
  const toggleNode = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    if (tree) setExpanded(getAllIds(tree))
  }, [tree])

  const collapseAll = useCallback(() => {
    setExpanded(new Set(['root']))
  }, [])

  // ── Edit ops ──
  const addChildNode = useCallback((parentId, data) => {
    const child = { id: generateId(), ...data, children: [] }
    setTree((t) => addChild(t, parentId, child))
    setExpanded((prev) => {
      const next = new Set(prev)
      next.add(parentId)
      next.add(child.id)
      return next
    })
  }, [])

  const editNode = useCallback((id, data) => {
    setTree((t) => updateNode(t, id, data))
  }, [])

  const deleteNode = useCallback((id) => {
    setTree((t) => removeNode(t, id))
    setExpanded((prev) => { const n = new Set(prev); n.delete(id); return n })
  }, [])

  const resetTree = useCallback(() => {
    if (!initialData) return
    clear()
    setTree(initialData)
    setExpanded(getIdsUpToNasl(initialData, 2))
  }, [initialData])

  // ── Search ──
  const searchHits = search.trim() && tree
    ? searchNodes(tree, search)
    : new Set()

  const searchHitArray = [...searchHits]

  // Reset to first result on new search query
  useEffect(() => {
    if (!search.trim() || !tree || searchHits.size === 0) return
    setSearchIndex(0)
  }, [search])

  // Expand ancestors of the CURRENT match only (not all matches at once)
  useEffect(() => {
    if (!search.trim() || !tree || searchHitArray.length === 0) return
    const currentId  = searchHitArray[searchIndex] || searchHitArray[0]
    const currentSet = new Set([currentId])
    const ancestors  = findAncestors(tree, currentSet)
    setExpanded((prev) => new Set([...prev, ...ancestors]))
  }, [searchIndex, search])

  return {
    tree, expanded, editMode, search, ready, searchHits, saveMode,
    searchIndex, setSearchIndex, searchHitArray,
    toggleNode, expandAll, collapseAll,
    addChildNode, editNode, deleteNode, resetTree,
    setEditMode, setSearch,
  }
}
