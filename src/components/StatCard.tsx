import { motion } from "framer-motion";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

export default function StatCard({ label, value, icon, color }: StatCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 shadow-sm"
        >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
            </div>
        </motion.div>
    );
}
