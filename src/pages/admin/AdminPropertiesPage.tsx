import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
} from 'lucide-react';
import type { Property } from '../../types/property';
import { repository } from '../../lib/storage';
import { formatINR, formatPlotArea } from '../../lib/formatters';

const ITEMS_PER_PAGE = 15;

export const AdminPropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProperties = async () => {
    const list = await repository.getProperties();
    setProperties(list);
    setLoading(false);
  };

  useEffect(() => {
    loadProperties();
    const unsub = repository.subscribe('properties', (updated: Property[]) => {
      setProperties(updated);
    });
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesId = p.property_id.toLowerCase().includes(q);
        const matchesName = p.property_name.toLowerCase().includes(q);
        const matchesLocation = p.location.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesLocation) return false;
      }
      if (typeFilter !== 'ALL' && p.data_type !== typeFilter) return false;
      if (statusFilter !== 'ALL' && !p.availability_status.toLowerCase().includes(statusFilter.toLowerCase())) return false;
      return true;
    });
  }, [properties, search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setErrorMessage(null);
    const result = await repository.deleteProperty(deleteTarget.property_id);
    setIsDeleting(false);
    if (result.success) {
      setActionMessage(`Property ${deleteTarget.property_id} was deleted successfully.`);
      setDeleteTarget(null);
      setTimeout(() => setActionMessage(null), 3500);
    } else {
      setErrorMessage(`Failed to delete property: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#087F5B] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#00E6A0]" />
            <span>Inventory Management</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#142B25]">
            Property Inventory
          </h1>
          <p className="text-xs text-[#71817A] mt-1">
            Manage public advertised listings and synthetic demo benchmark plots in Supabase.
          </p>
        </div>

        <Link
          to="/admin/properties/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#087F5B] hover:bg-[#066346] rounded-xl transition-all shadow-xs hover:shadow-[0_0_12px_rgba(0,230,160,0.3)]"
        >
          <PlusCircle className="w-4 h-4 text-[#00E6A0]" />
          <span>Add New Plot</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-[#B8FFE5]/40 border border-[#00E6A0] rounded-xl text-xs font-bold text-[#087F5B] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#DCEBE4] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#71817A] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by ID, plot title, or location..."
            className="w-full pl-9.5 pr-4 py-2 text-xs bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Classification Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs font-bold bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
          >
            <option value="ALL">All Classifications ({properties.length})</option>
            <option value="REAL_ADVERTISED">Advertised Only (10)</option>
            <option value="DEMO_SYNTHETIC">Demo Only (290)</option>
          </select>

          {/* Availability Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs font-bold bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Advertised">Advertised</option>
            <option value="Demo">Demo</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#DCEBE4] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7FAF8] border-b border-[#DCEBE4] text-[#71817A] font-bold">
                <th className="p-3.5 pl-5">Property ID</th>
                <th className="p-3.5">Plot Name</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Area (sq.ft)</th>
                <th className="p-3.5">Price (INR)</th>
                <th className="p-3.5">Classification</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCEBE4]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#71817A]">
                    Loading properties inventory...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#71817A]">
                    No properties matched search criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr key={p.property_id} className="hover:bg-[#F7FAF8] transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-bold text-[#087F5B]">
                      {p.property_id}
                    </td>
                    <td className="p-3.5 font-bold text-[#142B25] max-w-[200px] truncate">
                      {p.property_name}
                    </td>
                    <td className="p-3.5 text-[#71817A] max-w-[180px] truncate">
                      {p.location}
                    </td>
                    <td className="p-3.5 font-bold text-[#142B25] tabular-nums">
                      {p.plot_area_sqft.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 font-extrabold text-[#087F5B] tabular-nums">
                      {formatINR(p.price_inr)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          p.data_type === 'REAL_ADVERTISED'
                            ? 'bg-[#B8FFE5] text-[#087F5B] border border-[#00E6A0]/40'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {p.data_type === 'REAL_ADVERTISED' ? 'Advertised' : 'Demo'}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-[#142B25]">
                      {p.availability_status}
                    </td>
                    <td className="p-3.5 pr-5 text-right space-x-1.5 whitespace-nowrap">
                      <Link
                        to={`/property/${p.property_id}`}
                        target="_blank"
                        className="inline-flex p-1.5 rounded-lg text-[#71817A] hover:text-[#087F5B] hover:bg-[#F7FAF8]"
                        title="View Public Dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/admin/properties/${p.property_id}/edit`}
                        className="inline-flex p-1.5 rounded-lg text-[#087F5B] hover:bg-[#B8FFE5]/40"
                        title="Edit Plot"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="inline-flex p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                        title="Delete Plot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#DCEBE4] flex items-center justify-between text-xs text-[#71817A]">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="flex items-center gap-1 px-3 py-1.5 border border-[#DCEBE4] rounded-xl disabled:opacity-40 hover:bg-[#F7FAF8] bg-white font-bold text-[#142B25]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="tabular-nums">
              Page <strong className="text-[#142B25]">{currentPage}</strong> of {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="flex items-center gap-1 px-3 py-1.5 border border-[#DCEBE4] rounded-xl disabled:opacity-40 hover:bg-[#F7FAF8] bg-white font-bold text-[#142B25]"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#DCEBE4]">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#142B25]">
                Confirm Plot Deletion
              </h3>
              <p className="text-xs text-[#71817A] leading-relaxed">
                Are you sure you want to delete property <strong>{deleteTarget.property_id}</strong> ({deleteTarget.property_name})? This will remove the record permanently from the database.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-[#71817A] bg-white border border-[#DCEBE4] rounded-xl hover:bg-[#F7FAF8]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
              >
                {isDeleting ? 'Deleting...' : 'Delete Plot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
