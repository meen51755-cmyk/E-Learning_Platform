import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const TermsOfService = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto container-padding py-12 max-w-3xl">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">ข้อกำหนดและเงื่อนไขการใช้งาน</h1>
      <div className="prose prose-sm max-w-none space-y-6">
        {[
          { title: '1. การยอมรับเงื่อนไข', content: 'การใช้งานแพลตฟอร์ม LearnHub ถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขทั้งหมด หากไม่เห็นด้วยกรุณาหยุดใช้งาน' },
          { title: '2. การสมัครสมาชิก', content: 'คุณต้องให้ข้อมูลที่ถูกต้องในการสมัครสมาชิก และรับผิดชอบในการรักษาความลับของบัญชี ห้ามแชร์บัญชีกับผู้อื่น' },
          { title: '3. เนื้อหาและลิขสิทธิ์', content: 'เนื้อหาคอร์สทั้งหมดเป็นลิขสิทธิ์ของผู้สร้างและ LearnHub ห้ามคัดลอก, แจกจ่าย, หรือขายต่อเนื้อหาโดยไม่ได้รับอนุญาต' },
          { title: '4. การชำระเงินและการคืนเงิน', content: 'คอร์สที่ชำระเงินแล้วสามารถขอคืนเงินได้ภายใน 7 วัน หากยังไม่ได้เรียนเกิน 30% ของเนื้อหา การคืนเงินจะดำเนินการภายใน 14 วันทำการ' },
          { title: '5. กฎการสอบ', content: 'ห้ามทุจริตในการสอบ ระบบมีการป้องกันการโกง (Anti-Cheat) หากตรวจพบการทุจริต อาจถูกระงับบัญชีและยกเลิก Certificate' },
          { title: '6. Certificate', content: 'Certificate จะออกให้เมื่อผู้เรียนผ่านคอร์สและข้อสอบตามเกณฑ์ที่กำหนด Certificate เป็นใบรับรองจาก LearnHub ไม่ใช่ใบรับรองจากสถาบันการศึกษา' },
          { title: '7. ข้อจำกัดความรับผิดชอบ', content: 'LearnHub ให้บริการ "ตามสภาพ" เราไม่รับประกันว่าเนื้อหาจะถูกต้อง 100% หรือแพลตฟอร์มจะทำงานได้ตลอดเวลา' },
          { title: '8. การแก้ไขเงื่อนไข', content: 'เราสงวนสิทธิ์ในการแก้ไขเงื่อนไขเหล่านี้ได้ตลอดเวลา การเปลี่ยนแปลงจะแจ้งให้ทราบผ่านอีเมลหรือประกาศบนแพลตฟอร์ม' },
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

export default TermsOfService;
