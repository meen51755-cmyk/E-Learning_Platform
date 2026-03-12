import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto container-padding py-12 max-w-3xl">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">นโยบายความเป็นส่วนตัว</h1>
      <div className="prose prose-sm max-w-none space-y-6">
        {[
          { title: '1. ข้อมูลที่เราเก็บรวบรวม', content: 'เราเก็บรวบรวมข้อมูลส่วนบุคคลที่คุณให้เมื่อสมัครสมาชิก เช่น ชื่อ, อีเมล, เบอร์โทรศัพท์ รวมถึงข้อมูลการใช้งาน เช่น คอร์สที่ลงทะเบียน, ความก้าวหน้าการเรียน, คะแนนสอบ' },
          { title: '2. วัตถุประสงค์ในการใช้ข้อมูล', content: 'เราใช้ข้อมูลเพื่อให้บริการแพลตฟอร์มการเรียนรู้, ปรับปรุงประสบการณ์ผู้ใช้, วิเคราะห์การเรียนรู้ (Learning Analytics), ออกใบรับรอง (Certificate) และการสื่อสารเกี่ยวกับบริการ' },
          { title: '3. การแบ่งปันข้อมูล', content: 'เราไม่ขายข้อมูลส่วนบุคคลของคุณให้บุคคลที่สาม เราอาจแบ่งปันข้อมูลกับผู้ให้บริการที่ช่วยดำเนินการระบบ เช่น ระบบชำระเงิน, การจัดเก็บข้อมูล ภายใต้ข้อตกลงการรักษาความลับ' },
          { title: '4. ความปลอดภัยของข้อมูล', content: 'เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสม เช่น การเข้ารหัส SSL, Two-Factor Authentication, การสำรองข้อมูลอัตโนมัติ เพื่อปกป้องข้อมูลของคุณ' },
          { title: '5. สิทธิของผู้ใช้', content: 'คุณมีสิทธิเข้าถึง, แก้ไข, ลบข้อมูลส่วนบุคคลของคุณ รวมถึงปฏิเสธการรับข่าวสารการตลาด โดยสามารถดำเนินการผ่านหน้าตั้งค่าบัญชี' },
          { title: '6. Cookies', content: 'เราใช้ Cookies เพื่อปรับปรุงประสบการณ์การใช้งาน, จดจำการตั้งค่า, วิเคราะห์การใช้งานแพลตฟอร์ม คุณสามารถปิดการใช้งาน Cookies ได้ผ่านการตั้งค่าเบราว์เซอร์' },
          { title: '7. การติดต่อ', content: 'หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว กรุณาติดต่อ privacy@learnhub.com' },
        ].map((section, i) => (
          <div key={i}>
            <h2 className="text-lg font-display font-bold text-foreground mb-2">{section.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{section.content}</p>
          </div>
        ))}
        <p className="text-xs text-muted-foreground border-t border-border pt-4">อัปเดตล่าสุด: 9 มีนาคม 2569</p>
      </div>
    </div>
    <Footer />
  </div>
);

export default PrivacyPolicy;
