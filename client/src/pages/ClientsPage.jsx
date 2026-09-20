import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import ClientModal from '../components/clients/ClientModal';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';
import { getClients, createClient, updateClient, deleteClient } from '../services/clientService';
import {
  Users,
  Search,
  Plus,
  Building,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [deletingClient, setDeletingClient] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchClients = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await getClients(searchQuery);
      if (res.success) {
        setClients(res.data);
      }
    } catch (err) {
      console.error('[Clients Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (client) => {
    setEditingClient(client);
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingClient) {
        const res = await updateClient(editingClient._id, formData);
        if (res.success) {
          setModalOpen(false);
          fetchClients(search);
        }
      } else {
        const res = await createClient(formData);
        if (res.success) {
          setModalOpen(false);
          fetchClients(search);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save client details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (client) => {
    setDeletingClient(client);
    setDeleteError('');
  };

  const confirmDeleteClient = async () => {
    if (!deletingClient) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      const res = await deleteClient(deletingClient._id);
      if (res.success) {
        setDeletingClient(null);
        fetchClients(search);
      }
    } catch (err) {
      // Catch backend constraint error: "This client cannot be deleted because invoices exist for this client."
      setDeleteError(
        err.response?.data?.message ||
          'This client cannot be deleted because invoices exist for this client.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Client Directory</h1>
          <p className="text-sm text-slate-400 mt-1">Manage billing profiles & client contacts</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-xl shadow-md shadow-brand-600/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients by name, company, or email..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium self-end md:self-center">
          {clients.length} {clients.length === 1 ? 'Client' : 'Clients'} found
        </span>
      </div>

      {/* Clients Table / Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Clients Found"
            description={
              search
                ? `No clients match the query "${search}". Try clearing search.`
                : 'Add your first client to start creating and sending invoices.'
            }
            actionText={search ? 'Clear Search' : '+ Add Client'}
            onAction={search ? () => setSearch('') : handleOpenAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Company & Contact</th>
                  <th className="px-4 py-3">Email & Phone</th>
                  <th className="px-4 py-3">Billing Address</th>
                  <th className="px-4 py-3">GST / Tax ID</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {clients.map((client) => (
                  <tr key={client._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-brand-600/10 text-brand-400 rounded-xl border border-brand-500/20 shrink-0">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100">{client.companyName}</div>
                          <div className="text-xs text-slate-400 flex items-center mt-0.5">
                            <span>{client.name}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs text-slate-300 flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{client.email}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center space-x-1.5 mt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{client.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs text-slate-300 flex items-start space-x-1.5 max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{client.billingAddress}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-slate-400">
                      {client.gstNumber || <span className="text-slate-600 italic">None</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(client)}
                          className="p-2 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Client"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(client)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Client Modal */}
      <ClientModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingClient}
        isSubmitting={isSubmitting}
        error={formError}
      />

      {/* Delete Confirmation & Constraint Error Modal */}
      <Modal
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        title="Confirm Client Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {deleteError ? (
            <div className="p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl space-y-2 text-sm">
              <div className="flex items-center space-x-2 font-semibold text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Deletion Prevented</span>
              </div>
              <p>{deleteError}</p>
            </div>
          ) : (
            <div className="text-sm text-slate-300">
              Are you sure you want to delete client{' '}
              <strong className="text-white">{deletingClient?.companyName}</strong>?
              <p className="text-xs text-slate-400 mt-2">
                This action cannot be undone if no historical invoices exist.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setDeletingClient(null)}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              {deleteError ? 'Close' : 'Cancel'}
            </button>
            {!deleteError && (
              <button
                type="button"
                onClick={confirmDeleteClient}
                disabled={isDeleting}
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Delete Client</span>
              </button>
            )}
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default ClientsPage;
