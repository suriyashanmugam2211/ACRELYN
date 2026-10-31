import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Inbox,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  PlusCircle,
  FileText,
  TrendingUp,
  Database,
  ExternalLink,
} from 'lucide-react';
import type { Property, Enquiry } from '../../types/property';
import { repository } from '../../lib/storage';
import { formatINR, formatDate } from '../../lib/formatters';

export const AdminDashboardPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([repository.getProperties(), repository.getEnquiries()]).then(
      ([props, enqs]) => {
        setProperties(props);
        setEnquiries(enqs);
        setLoading(false);
      }
    );
  }, []);

  // Compute live metrics from actual data
  const totalProperties = properties.length;
  const advertisedCount = properties.filter((p) => p.data_type === 'REAL_ADVERTISED').length;
  const demoCount = properties.filter((p) => p.data_type === 'DEMO_SYNTHETIC').length;
  const availableCount = properties.filter(
    (p) => p.availability_status.toLowerCase().includes('avail') || p.availability_status.toLowerCase().includes('advertised')
  ).length;
  const unverifiedCount = properties.filter(
    (p) => p.verification_status.toLowerCase().includes('not') || p.verification_status.toLowerCase().includes('demo')
  ).length;

  const totalEnquiries = enquiries.length;
  const newEnquiries = enquiries.filter((e) => e.status === 'New').length;
  const inProgressEnquiries = enquiries.filter((e) => e.status === 'In Progress' || e.status === 'Contacted').length;
  const resolvedEnquiries = enquiries.filter((e) => e.status === 'Resolved' || e.status === 'Closed').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-slate-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211D]">
            Marketplace Overview
          </h1>
          <p className="text-xs text-[#647067] mt-1">
            Real-time platform metrics computed from live database records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/properties/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0B3D2E] hover:bg-[#135541] rounded-lg transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add New Property</span>
          </Link>
          <Link
            to="/admin/enquiries"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B3D2E] bg-white border border-[#E3E9E4] hover:bg-[#F8FAF7] rounded-lg transition-colors"
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>View Enquiries</span>
          </Link>
        </div>
      </div>

      {/* METRICS GRID: Exact statistics requested in Section 11 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Properties */}
        <div className="bg-white p-5 rounded-xl border border-[#E3E9E4] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#647067]">
            <span className="font-medium">Total Properties</span>
            <Building2 className="w-4 h-4 text-[#0B3D2E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B3D2E] tabular-nums">
            {totalProperties}
          </div>
          <div className="text-[11px] text-[#647067]">Cataloged in database</div>
        </div>

        {/* Advertised Listings */}
        <div className="bg-white p-5 rounded-xl border border-[#E3E9E4] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#647067]">
            <span className="font-medium">Advertised Listings</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#17211D] tabular-nums">
            {advertisedCount}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">Public sourced plots</div>
        </div>

        {/* Demo Listings */}
        <div className="bg-white p-5 rounded-xl border border-[#E3E9E4] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#647067]">
            <span className="font-medium">Demo Listings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 tabular-nums">
            {demoCount}
          </div>
          <div className="text-[11px] text-amber-700">Synthetic testing dataset</div>
        </div>

        {/* Available Listings */}
        <div className="bg-white p-5 rounded-xl border border-[#E3E9E4] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#647067]">
            <span className="font-medium">Available Plots</span>
            <CheckCircle className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#17211D] tabular-nums">
            {availableCount}
          </div>
          <div className="text-[11px] text-[#647067]">Current market status</div>
        </div>

        {/* Unverified Listings */}
        <div className="bg-white p-5 rounded-xl border border-[#E3E9E4] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#647067]">
            <span className="font-medium">Pending Legal Verification</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-orange-900 tabular-nums">
            {unverifiedCount}
          </div>
          <div className="text-[11px] text-[#647067]">Subject to title due diligence</div>
        </div>

        {/* Total Enquiries */}
        <div className="bg-white p-5 rounded-xl border border-[#E3E9E4] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#647067]">
            <span className="font-medium">Total Enquiries</span>
            <Inbox className="w-4 h-4 text-[#0B3D2E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B3D2E] tabular-nums">
            {totalEnquiries}
          </div>
          <div className="text-[11px] text-[#647067]">Customer inquiries recorded</div>
        </div>

        {/* New Enquiries */}
        <div className="bg-white p-5 rounded-xl border border-[#E3E9E4] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#647067]">
            <span className="font-medium">New Enquiries</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-900 tabular-nums">
            {newEnquiries}
          </div>
          <div className="text-[11px] text-blue-700 font-medium">Awaiting response</div>
        </div>

        {/* Resolved Enquiries */}
        <div className="bg-white p-5 rounded-xl border border-[#E3E9E4] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#647067]">
            <span className="font-medium">Resolved Enquiries</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tabular-nums">
            {resolvedEnquiries}
          </div>
          <div className="text-[11px] text-emerald-700">Closed or completed</div>
        </div>
      </div>

      {/* RECENT ACTIVITY SECTION: Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enquiries */}
        <div className="bg-white rounded-xl border border-[#E3E9E4] p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#17211D]">
              Recent Customer Enquiries
            </h3>
            <Link to="/admin/enquiries" className="text-xs font-semibold text-[#0B3D2E] hover:underline">
              View All →
            </Link>
          </div>

          {enquiries.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#647067]">
              No customer enquiries recorded yet. Submissions from property pages will appear here.
            </div>
          ) : (
            <div className="divide-y divide-[#E3E9E4]">
              {enquiries.slice(0, 5).map((enq) => (
                <div key={enq.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-[#17211D]">
                      {enq.customer_name}
                    </div>
                    <div className="text-[#647067]">
                      Property: <strong className="font-mono text-[#0B3D2E]">{enq.property_id}</strong>
                    </div>
                    <div className="text-[11px] text-[#647067] line-clamp-1 mt-0.5">
                      "{enq.message}"
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        enq.status === 'New'
                          ? 'bg-blue-100 text-blue-800'
                          : enq.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {enq.status}
                    </span>
                    <div className="text-[10px] text-[#647067]">
                      {formatDate(enq.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Managed Properties */}
        <div className="bg-white rounded-xl border border-[#E3E9E4] p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#17211D]">
              Active Land Records
            </h3>
            <Link to="/admin/properties" className="text-xs font-semibold text-[#0B3D2E] hover:underline">
              Manage All →
            </Link>
          </div>

          <div className="divide-y divide-[#E3E9E4]">
            {properties.slice(0, 5).map((p) => (
              <div key={p.property_id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#0B3D2E] bg-[#F0F4F1] px-1.5 py-0.5 rounded">
                      {p.property_id}
                    </span>
                    <span className="font-semibold text-[#17211D] truncate">
                      {p.property_name}
                    </span>
                  </div>
                  <div className="text-[#647067] text-[11px] truncate mt-0.5">
                    {p.location} · {p.plot_area_sqft} sq.ft
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-[#0B3D2E]">
                    {formatINR(p.price_inr)}
                  </div>
                  <Link
                    to={`/admin/properties/${p.property_id}/edit`}
                    className="text-[11px] text-[#10B981] hover:underline font-semibold"
                  >
                    Edit Plot
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
