import { getCreators } from './actions';
import { CreatorList } from './CreatorList';
import { BadgeIndianRupee, Users, TrendingUp, Wallet } from 'lucide-react';

export default async function CreatorsPage() {
    const creators = await getCreators();

    // Calculate Stats
    const totalCreators = creators.length;
    const monetizedCreators = creators.filter((c: any) => c.isMonetizationEnabled).length;
    const totalEarnings = creators.reduce((sum: number, c: any) => sum + Number(c.totalEarnings), 0);
    const pendingRequests = creators.filter((c: any) => !c.isMonetizationEnabled).length; // Assuming disabled = pending for now

    return (
        <div className="space-y-8">
            {/* Analytics Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    label="Total Creators"
                    value={totalCreators.toString()}
                    icon={Users}
                    color="blue"
                />
                <StatsCard
                    label="Monetized"
                    value={monetizedCreators.toString()}
                    icon={TrendingUp}
                    color="emerald"
                />
                <StatsCard
                    label="Lifetime Payouts"
                    value={`₹${(totalEarnings / 100000).toFixed(1)}L`}
                    icon={BadgeIndianRupee}
                    color="purple"
                    subvalue="Total Earnings"
                />
                <StatsCard
                    label="Pending Actions"
                    value={pendingRequests.toString()}
                    icon={Wallet}
                    color="orange"
                />
            </div>

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Creator Management</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage creator accounts, payouts, and monetization status.</p>
            </div>

            <CreatorList creators={creators} />
        </div>
    );
}

function StatsCard({ label, value, icon: Icon, color, subvalue }: any) {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
    }[color as string] || 'bg-slate-50 text-slate-600';

    return (
        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorStyles}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
                {subvalue && <p className="text-xs text-slate-400 mt-1">{subvalue}</p>}
            </div>
        </div>
    );
}
