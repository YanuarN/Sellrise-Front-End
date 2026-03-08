import { MessageSquare, Search, Filter } from 'lucide-react';
import { Button, Input, PageHeader } from '../../components';

export default function Inbox() {
    return (
        <div className="flex flex-col h-full bg-slate-50 rounded-2xl overflow-hidden p-6">
            <PageHeader
                title="Inbox"
                description="Manage all your incoming conversations and tasks."
                className="mb-6"
                actions={
                    <>
                        <Input icon={Search} placeholder="Search messages..." className="w-64" />
                        <Button variant="secondary" className="gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Filters</span>
                        </Button>
                    </>
                }
            />

            <div className="flex-1 grid grid-cols-3 gap-6">
                <div className="col-span-1 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-700">Recent Messages</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-3 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-100 flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shrink-0 flex items-center justify-center text-white font-bold">
                                    {(i * 7).toString(36).charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between">
                                        <h4 className="font-medium text-slate-800 truncate">Customer {i}</h4>
                                        <span className="text-xs text-slate-400">{i}h ago</span>
                                    </div>
                                    <p className="text-sm text-slate-500 truncate mt-0.5">I have a question about my recent order...</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-10 h-10 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">Select a conversation</h2>
                        <p className="text-slate-500 max-w-sm">Choose an active chat from the left panel to view the details and reply to the customer.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
