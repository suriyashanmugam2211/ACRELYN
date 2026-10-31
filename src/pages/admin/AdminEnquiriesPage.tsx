import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Save,
  X,
  Phone,
  Mail,
  Building,
  Sparkles,
} from 'lucide-react';
import type { Enquiry, EnquiryStatus } from '../../types/property';
import { repository } from '../../lib/storage';
import { formatDate } from '../../lib/formatters';

export const AdminEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Active enquiry modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [editStatus, setEditStatus] = useState<EnquiryStatus>('New');
  const [editNotes, setEditNotes] = useState<string>('');
  const [savingStatus, setSavingStatus] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const loadEnquiries = async () => {
    const list = await repository.getEnquiries();
    setEnquiries(list);
    setLoading(false);
  };

  useEffect(() => {
    loadEnquiries();
    const unsub = repository.subscribe('enquiries', (updated: Enquiry[]) => {
      setEnquiries(updated);
    });
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    return enquiries.filter((e) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = e.customer_name.toLowerCase().includes(q);
        const matchesEmail = e.email.toLowerCase().includes(q);
        const matchesProp = e.property_id.toLowerCase().includes(q);
        const matchesPhone = e.phone.includes(q);
        if (!matchesName && !matchesEmail && !matchesProp && !matchesPhone) return false;
      }
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
      return true;
    });
  }, [enquiries, search, statusFilter]);

  const handleOpenEnquiry = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setEditStatus(enq.status);
    setEditNotes(enq.admin_notes || '');
    setStatusFeedback(null);
  };

  const handleSaveEnquiry = async () => {
    if (!selectedEnquiry) return;
    setSavingStatus(true);
    setStatusFeedback(null);

    const res = await repository.updateEnquiryStatus(
      selectedEnquiry.id,
      editStatus,
      editNotes.trim()
    );

    setSavingStatus(false);
    if (res.success) {
      setStatusFeedback('Enquiry status updated successfully.');
      setTimeout(() => {
        setSelectedEnquiry(null);
      }, 900);
    } else {
      setStatusFeedback(`Error updating: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#087F5B] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#00E6A0]" />
            <span>Lead & Request CRM</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#142B25]">
            Customer Enquiries
          </h1>
          <p className="text-xs text-[#71817A] mt-1">
            Manage inbound property queries, site inspection requests, and lead statuses in Supabase
          </p>
        </div>

        <div className="text-xs text-[#71817A] font-semibold tabular-nums bg-white px-3 py-1.5 rounded-xl border border-[#DCEBE4] shadow-2xs">
          Total: <strong className="text-[#142B25]">{enquiries.length}</strong> inquiries (
          <span className="text-blue-600 font-bold">{enquiries.filter((e) => e.status === 'New').length} new</span>)
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#DCEBE4] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#71817A] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, phone, or plot ID..."
            className="w-full pl-9.5 pr-4 py-2 text-xs bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
          >
            <option value="ALL">All Statuses ({enquiries.length})</option>
            <option value="New">New ({enquiries.filter((e) => e.status === 'New').length})</option>
            <option value="Contacted">Contacted ({enquiries.filter((e) => e.status === 'Contacted').length})</option>
            <option value="In Progress">In Progress ({enquiries.filter((e) => e.status === 'In Progress').length})</option>
            <option value="Resolved">Resolved ({enquiries.filter((e) => e.status === 'Resolved').length})</option>
            <option value="Closed">Closed ({enquiries.filter((e) => e.status === 'Closed').length})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#DCEBE4] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7FAF8] border-b border-[#DCEBE4] text-[#71817A] font-bold">
                <th className="p-3.5 pl-5">Date</th>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Property ID</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCEBE4]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#71817A]">
                    Loading enquiries...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#71817A]">
                    No enquiries found. Submissions from property pages will appear here.
                  </td>
                </tr>
              ) : (
                filtered.map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#F7FAF8] transition-colors">
                    <td className="p-3.5 pl-5 text-[#71817A] whitespace-nowrap">
                      {formatDate(enq.created_at)}
                    </td>
                    <td className="p-3.5 font-bold text-[#142B25]">
                      {enq.customer_name}
                    </td>
                    <td className="p-3.5 space-y-0.5">
                      <div className="text-[#142B25] font-medium">{enq.email}</div>
                      <div className="text-[#71817A]">{enq.phone}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-[#087F5B] bg-[#B8FFE5]/50 px-2 py-0.5 rounded-md border border-[#00E6A0]/40">
                        {enq.property_id}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          enq.status === 'New'
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : enq.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : enq.status === 'Contacted'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {enq.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => handleOpenEnquiry(enq)}
                        className="px-3 py-1.5 bg-[#087F5B] hover:bg-[#066346] text-white text-xs font-bold rounded-lg transition-all shadow-2xs hover:shadow-[0_0_8px_rgba(0,230,160,0.3)]"
                      >
                        Review & Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#DCEBE4]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCEBE4]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#142B25]">
                  Enquiry Dossier
                </h3>
                <div className="text-xs text-[#71817A] mt-0.5">
                  ID: <span className="font-mono text-[11px]">{selectedEnquiry.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1.5 rounded-lg text-[#71817A] hover:bg-[#F7FAF8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="bg-[#F7FAF8] p-4 rounded-xl border border-[#DCEBE4] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#71817A] font-semibold">Customer:</span>
                <span className="font-bold text-[#142B25]">{selectedEnquiry.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71817A] font-semibold">Email:</span>
                <span className="font-medium text-[#142B25]">{selectedEnquiry.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71817A] font-semibold">Phone:</span>
                <span className="font-medium text-[#142B25]">{selectedEnquiry.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71817A] font-semibold">Property ID:</span>
                <span className="font-mono font-bold text-[#087F5B]">{selectedEnquiry.property_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71817A] font-semibold">Received:</span>
                <span className="text-[#142B25]">{formatDate(selectedEnquiry.created_at)}</span>
              </div>
            </div>

            {/* Customer Message */}
            <div>
              <label className="block text-xs font-bold text-[#142B25] mb-1">
                Customer Message
              </label>
              <div className="p-3 bg-white border border-[#DCEBE4] rounded-xl text-xs text-[#142B25] leading-relaxed">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Status & Admin Notes */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#142B25] mb-1">
                  Update Lead Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as EnquiryStatus)}
                  className="w-full px-3 py-2 text-xs font-bold bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B]"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142B25] mb-1">
                  Admin Internal Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record follow-up calls, buyer budget confirmation, or site inspection notes..."
                  className="w-full px-3 py-2 text-xs bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
                />
              </div>
            </div>

            {statusFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800">
                {statusFeedback}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-[#71817A] bg-white border border-[#DCEBE4] rounded-xl hover:bg-[#F7FAF8]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingStatus}
                onClick={handleSaveEnquiry}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-[#087F5B] hover:bg-[#066346] rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 hover:shadow-[0_0_12px_rgba(0,230,160,0.3)]"
              >
                <Save className="w-3.5 h-3.5 text-[#00E6A0]" />
                <span>{savingStatus ? 'Saving to Database...' : 'Save Updates'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
