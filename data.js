const cats={all:'สินค้าทั้งหมด',printer:'เครื่องพิมพ์ 3D',scanner:'สแกนเนอร์ 3D',laser:'เครื่องเลเซอร์',dryer:'เครื่องอบเส้น'};
const items=[];
function product(id,name,cat,series,img,specs,note){items.push({id,name,cat,series,img,specs,note})}
function printer(id,name,series,size,speed,screen,mass,note,materials){product(id,name,'printer',series,id,{'พื้นที่พิมพ์':size+' มม.','ความเร็วสูงสุด':speed+' มม./วินาที','จอสัมผัสสี':screen+' นิ้ว','น้ำหนัก':mass,'วัสดุที่รองรับ':materials},note)}
printer('k3','K3','K SERIES','260 × 260 × 260',500,3.97,'22 กก.','ระบบเปลี่ยนหัวอัตโนมัติ 4 หัวฉีด รองรับวัสดุเพิ่มเติมเมื่อใช้ Top Cover','PLA, PETG, PET, PCTG, TPU 95A, PLA-CF/GF, PETG-CF/GF');
printer('i8','SPARKX i8 COMBO','SPARK SERIES','260 × 260 × 255',500,2.85,'13 กก. (รวมบรรจุภัณฑ์)','ระบบเปลี่ยนสี QuarTeks™ รองรับ CFS Lite','PLA, PLA-Silk, PLA-CF, PETG, PETG-CF');
printer('plus','K2 Plus Combo','K SERIES','350 × 350 × 350',600,4.3,'35 กก. (เฉพาะตัวเครื่อง)','พิมพ์ได้สูงสุด 16 สีเมื่อใช้ชุด CFS ตามจำนวนที่ต้องการ หัวฉีดร้อนสูงสุด 350°C','PLA, PETG, PET, ABS, ASA, PLA-CF, PA-CF, PPA-CF');
printer('nano','SPARKX i7 NANO','SPARK SERIES','260 × 260 × 255',500,2.85,'9.12 กก.','รองรับเส้นพิมพ์ขนาด 1.75 มม.','PLA, PLA-Silk, PETG, TPU, PLA-CF');
printer('i7','SPARKX i7 COMBO','SPARK SERIES','260 × 260 × 255',500,2.85,'12.54 กก. (รวม CFS Lite)','พิมพ์งาน 4 สีด้วยชุด CFS Lite','PLA, PLA-Silk, PETG, TPU, PLA-CF');
printer('k2','K2 Combo','K SERIES','260 × 260 × 260',600,4,'18.3 กก. (เฉพาะตัวเครื่อง)','พิมพ์สูงสุด 16 สีเมื่อต่อพ่วง CFS','PLA, PETG, PET, ABS, PLA-CF');
printer('pro','K2 Pro Combo','K SERIES','300 × 300 × 300',600,4,'23.7 กก. (เฉพาะตัวเครื่อง)','ระบบควบคุมอุณหภูมิห้องพิมพ์ พิมพ์สูงสุด 16 สีเมื่อต่อพ่วง CFS','PLA, PETG, PET, ABS, ASA, PLA-CF, PA-CF, PPA-CF');
function scanner(id,name,range,precision,speed,weight,note){product(id,name,'scanner','SCANNER SERIES',id,{'ขนาดชิ้นงาน':range+' มม.','ความแม่นยำสูงสุด':precision+' มม.','ความเร็วสแกน':speed,'น้ำหนัก':weight+' กรัม'},note)}
scanner('otter','CR-Scan Otter','10 – 2,000','0.02','สูงสุด 20 fps',390,'ระบบแสงอินฟราเรด 4 เลนส์ สแกนสี 24-bit');
scanner('raptor','CR-Scan Raptor','5 – 2,000','0.02','สูงสุด 60 fps',372,'เลเซอร์สีน้ำเงิน 7 เส้น และ NIR สแกนสี 24-bit');
scanner('pika','Pika','5 – 2,000','0.03','สอบถามเพิ่มเติม',260,'เลเซอร์สีน้ำเงินและ NIR จอสัมผัส 3 นิ้ว เชื่อมต่อมือถือแบบไร้สาย');
scanner('s1','Sermoon S1','5 – 4,000','0.02','สูงสุด 90 fps',508,'เลเซอร์สีน้ำเงิน 34+7+1 เส้น และ NIR 4 เลนส์');
scanner('p1','Sermoon P1','5 – 4,000','0.02','สูงสุด 100 fps (PC) / 60 fps (Standalone)',690,'จอสัมผัส 6 นิ้ว ประมวลผลในตัว');
function laser(id,name,img,type,area,speed,note){product(id,name,'laser','FALCON SERIES',img,{'ชนิดเลเซอร์':type,'พื้นที่ทำงาน':area+' มม.','ความเร็วสูงสุด':speed},note)}
laser('a5','Falcon A1C 5W','a1c','Blue Diode 5W (445 nm)','150 × 150','250 มม./วินาที','สำหรับแกะสลักไม้ หนัง กระดาษ และอะคริลิกทึบ');
laser('a10','Falcon A1C 10W','a1c','Blue Diode 10W (445 nm)','150 × 150','250 มม./วินาที','รองรับงานตัดไม้และอะคริลิกทึบ');
laser('t5','Falcon T1 UV 5W','t1','UV 5W (355 nm)','175 × 175','10,000 มม./วินาที','รองรับงานแกะสลักแก้วและคริสตัล พื้นที่แกะสลักในคริสตัล 70 × 70 มม.');
laser('t20','Falcon T1 Fiber 20W','t1','Fiber 20W (1064 nm)','175 × 175','10,000 มม./วินาที','สำหรับแกะสลักโลหะ เช่น สเตนเลส ทองเหลือง และอะลูมิเนียม');
function dryer(id,name,capacity,temp,power,note){product(id,name,'dryer','SPACEPI SERIES',id,{'ความจุ':capacity,'อุณหภูมิ':temp+'°C','กำลังไฟ':power+'W','ตั้งเวลาอบ':'1 – 48 ชั่วโมง'},note)}
dryer('v2','Space Pi V2','1 ม้วน (สูงสุด 1 กก.)','45 – 75',145,'ลมร้อนหมุนเวียน 360° ตั้งค่าสำเร็จรูปสำหรับเส้นพิมพ์ 12 ชนิด');
dryer('pv2','Space Pi Plus V2','2 ม้วน (สูงสุด 1 กก. × 2)','45 – 75',160,'อบได้พร้อมกัน 2 ม้วน พร้อมจอสัมผัส LCD');
dryer('x4','SpacePi X4','4 ม้วน (1 กก. × 4 หรือ 2 กก. × 2)','45 – 85',360,'แยกห้องอบอิสระ 2 ฝั่ง พร้อมระบบคายความชื้นอัตโนมัติ');
