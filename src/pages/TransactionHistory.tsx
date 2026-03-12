import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Receipt, Download, Eye, CheckCircle, Clock, XCircle } from "lucide-react";

const transactions = [
  { id: 'TXN-2569-A1B2C3', course: 'Data Science with Python', amount: 1990, date: '2569-03-05', status: 'completed' as const },
  { id: 'TXN-2569-D4E5F6', course: 'UI/UX Design Masterclass', amount: 2490, date: '2569-02-20', status: 'completed' as const },
  { id: 'TXN-2569-G7H8I9', course: 'Cybersecurity Fundamentals', amount: 2990, date: '2569-01-15', status: 'refunded' as const },
];

const statusConfig = {
  completed: { label: 'สำเร็จ', icon: CheckCircle, class: 'bg-success/10 text-success' },
  pending: { label: 'รอดำเนินการ', icon: Clock, class: 'bg-warning/10 text-warning' },
  refunded: { label: 'คืนเงิน', icon: XCircle, class: 'bg-destructive/10 text-destructive' },
};

const TransactionHistory = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto container-padding py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">ประวัติการชำระเงิน</h1>
          <p className="text-muted-foreground mt-1">รายการธุรกรรมและใบเสร็จทั้งหมด</p>
        </div>
      </div>

      <div className="card-elevated overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="text-left p-4">Transaction ID</th>
              <th className="text-left p-4 hidden md:table-cell">คอร์ส</th>
              <th className="text-center p-4">จำนวนเงิน</th>
              <th className="text-center p-4 hidden sm:table-cell">สถานะ</th>
              <th className="text-right p-4">ใบเสร็จ</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => {
              const status = statusConfig[txn.status];
              return (
                <tr key={txn.id} className="table-row">
                  <td className="p-4">
                    <p className="text-sm font-mono text-foreground">{txn.id}</p>
                    <p className="text-xs text-muted-foreground">{txn.date}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <p className="text-sm text-foreground">{txn.course}</p>
                  </td>
                  <td className="p-4 text-center text-sm font-medium text-foreground">฿{txn.amount.toLocaleString()}</td>
                  <td className="p-4 text-center hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
                      <status.icon className="w-3 h-3" /> {status.label}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    <Footer />
  </div>
);

export default TransactionHistory;
