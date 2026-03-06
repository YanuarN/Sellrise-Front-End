import { Badge } from '../Badge';

const LeadCard = ({ lead }) => {
    return (
        <div className="bg-[#f8f9fa] p-4 rounded-xl border border-gray-100/50 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{lead.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{lead.company}</p>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${lead.status === 'urgent' ? 'bg-red-500' : lead.status === 'warn' ? 'bg-amber-400' : 'bg-green-500'}`} />
            </div>

            <div className="flex justify-between items-center mt-2">
                <Badge className="bg-[#e2e8f0] text-gray-600 font-medium px-2 py-1 rounded-md">{lead.tag}</Badge>
                <span className="text-xs text-gray-400 font-medium">{lead.time}</span>
            </div>
        </div>
    );
};

export default LeadCard;
