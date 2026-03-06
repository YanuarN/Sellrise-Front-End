import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { BadgeContent, Button, Input, LeadCard } from '../../components';

const leadColumns = [
    {
        id: 'warm',
        title: 'Warm Lead',
        count: 2,
        leads: [
            { id: 1, name: 'Alex Thompson', company: 'TechCorp', status: 'good', tag: 'Greg', time: '2 days ago' },
            { id: 2, name: 'Sarah Chen', company: 'Company name not specified', status: 'warn', tag: 'Greg', time: '12 days ago' },
            { id: 3, name: 'David Smith', company: 'InnovateInc', status: 'good', tag: 'Greg', time: '1 month ago' },
        ]
    },
    {
        id: 'qual',
        title: 'Qualification',
        count: 1,
        leads: [
            { id: 4, name: 'Michael Brown', company: 'StartupXYZ', status: 'good', tag: 'Max', time: '2 days ago' },
        ]
    },
    {
        id: 'zoom',
        title: 'Zoom is Planned',
        count: 3,
        leads: [
            { id: 5, name: 'Alex Thompson', company: 'TechCorp', status: 'urgent', tag: 'Nick', time: '2 days ago' },
            { id: 6, name: 'Sarah Chen', company: 'Company name not specified', status: 'urgent', tag: 'Nick', time: '12 days ago' },
            { id: 7, name: 'Sarah Chen', company: 'Company name not specified', status: 'urgent', tag: 'Crac', time: '12 days ago' },
        ]
    },
    {
        id: 'write',
        title: 'Write Later',
        count: 1,
        leads: [
            { id: 8, name: 'Alex Thompson', company: 'TechCorp', status: 'urgent', tag: 'Nick', time: '2 days ago' },
        ]
    }
];

export default function LeadManagement() {
    return (
        <div className="flex flex-col h-full">
            <BadgeContent />

            <div className="flex justify-between items-end mb-6">
                <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Lead Management</h1>
                <div className="flex gap-3">
                    <Input
                        icon={Search}
                        placeholder="input-data"
                        className="w-64"
                    />
                    <Button variant="secondary" className="gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Filters</span>
                    </Button>
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start">
                {leadColumns.map(column => (
                    <div key={column.id} className="min-w-[320px] w-[320px] bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-800 text-sm">{column.title}</h3>
                            <span className="text-xs text-gray-400 font-medium">{column.count} leads</span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                            {column.leads.map(lead => (
                                <LeadCard key={lead.id} lead={lead} />
                            ))}
                        </div>

                        <div className="mt-auto">
                            <Button
                                variant="outline"
                                className={`w-full gap-2 text-sm justify-center border-gray-200 text-blue-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 ${column.id === 'qual' ? 'bg-blue-600 !text-white hover:!bg-blue-700 !border-blue-600' : ''}`}
                            >
                                <Plus className="w-4 h-4" />
                                Add a card
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Help chat button */}
            <div className="fixed bottom-6 right-6">
                <button className="w-12 h-12 bg-blue-600 rounded-full text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30493 11.1801 2.99656 12.5 3C14.7171 2.99981 16.8437 3.86591 18.4239 5.42084C20.0041 6.97576 20.9082 9.09101 21 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 16V16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 8C12.5523 8 13 8.44772 13 9C13 9.55228 12.5523 10 12 10V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
