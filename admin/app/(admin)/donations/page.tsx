'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  createCryptoAddress,
  createDonationAdmin,
  listCryptoAddresses,
  listDonations,
  updateCryptoAddress,
  updateDonationStatus,
} from '@/lib/api';
import { getToken } from '@/lib/auth';
import {
  type CryptoAddressAdmin,
} from '@/lib/crypto-types';
import {
  DONATION_STATUSES,
  PAYMENT_METHODS,
  type DonationRecord,
  type DonationStatus,
  type PaymentMethod,
} from '@/lib/donations-types';

type Tab = 'crypto' | 'records';

const RECORDS_PAGE_SIZE = 20;

export default function DonationsPage() {
  const [tab, setTab] = useState<Tab>('crypto');

  const [cryptoItems, setCryptoItems] = useState<CryptoAddressAdmin[]>([]);
  const [cryptoLoading, setCryptoLoading] = useState(true);
  const [currencyCode, setCurrencyCode] = useState('');
  const [currencyLabel, setCurrencyLabel] = useState('');
  const [address, setAddress] = useState('');
  const [setAsDisplayedOnCreate, setSetAsDisplayedOnCreate] = useState(false);
  const [cryptoSaving, setCryptoSaving] = useState(false);
  const [cryptoActionId, setCryptoActionId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editingAddressValue, setEditingAddressValue] = useState('');
  const [editingLabelValue, setEditingLabelValue] = useState('');

  const [records, setRecords] = useState<DonationRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsPage, setRecordsPage] = useState(1);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<DonationStatus | 'ALL'>('ALL');
  const [recordActionId, setRecordActionId] = useState<string | null>(null);

  const [recordAmount, setRecordAmount] = useState('');
  const [recordName, setRecordName] = useState('');
  const [recordEmail, setRecordEmail] = useState('');
  const [recordMethod, setRecordMethod] = useState<PaymentMethod>('BANK');
  const [recordConfirmed, setRecordConfirmed] = useState(false);
  const [recordSaving, setRecordSaving] = useState(false);

  const [cryptoError, setCryptoError] = useState<string | null>(null);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  const recordsTotalPages = Math.max(1, Math.ceil(recordsTotal / RECORDS_PAGE_SIZE));

  async function loadCrypto() {
    const token = getToken();
    if (!token) return;

    setCryptoLoading(true);
    setCryptoError(null);

    try {
      const data = await listCryptoAddresses(token);
      setCryptoItems(data.items);
    } catch (err) {
      setCryptoError(err instanceof Error ? err.message : 'Failed to load addresses');
    } finally {
      setCryptoLoading(false);
    }
  }

  async function loadRecords(filter: DonationStatus | 'ALL', page: number) {
    const token = getToken();
    if (!token) return;

    setRecordsLoading(true);
    setRecordsError(null);

    try {
      const data = await listDonations(token, {
        ...(filter === 'ALL' ? {} : { status: filter }),
        page,
        limit: RECORDS_PAGE_SIZE,
      });
      setRecords(data.items);
      setRecordsTotal(data.total);
      setRecordsPage(data.page);
    } catch (err) {
      setRecordsError(err instanceof Error ? err.message : 'Failed to load donations');
    } finally {
      setRecordsLoading(false);
    }
  }

  useEffect(() => {
    void loadCrypto();
  }, []);

  useEffect(() => {
    if (tab === 'records') {
      void loadRecords(statusFilter, recordsPage);
    }
  }, [tab, statusFilter, recordsPage]);

  useEffect(() => {
    setRecordsPage(1);
  }, [statusFilter]);

  async function handleCreateCrypto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token) return;

    const code = currencyCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{2,10}$/.test(code)) {
      setCryptoError('Currency code must be 2-10 letters or digits (e.g. BTC, SOL)');
      return;
    }

    setCryptoSaving(true);
    setCryptoError(null);

    try {
      await createCryptoAddress(token, {
        currencyCode: code,
        ...(currencyLabel.trim() ? { label: currencyLabel.trim() } : {}),
        address: address.trim(),
        ...(setAsDisplayedOnCreate ? { setAsDisplayed: true } : {}),
      });
      setCurrencyCode('');
      setCurrencyLabel('');
      setAddress('');
      setSetAsDisplayedOnCreate(false);
      await loadCrypto();
    } catch (err) {
      setCryptoError(err instanceof Error ? err.message : 'Failed to create address');
    } finally {
      setCryptoSaving(false);
    }
  }

  async function handleToggleActive(item: CryptoAddressAdmin) {
    const token = getToken();
    if (!token) return;

    setCryptoActionId(item.id);
    setCryptoError(null);

    try {
      await updateCryptoAddress(token, item.id, {
        isActive: !item.isActive,
      });
      await loadCrypto();
    } catch (err) {
      setCryptoError(err instanceof Error ? err.message : 'Failed to update address');
    } finally {
      setCryptoActionId(null);
    }
  }

  function startEditAddress(item: CryptoAddressAdmin) {
    setEditingAddressId(item.id);
    setEditingAddressValue(item.address);
    setEditingLabelValue(item.label ?? '');
  }

  function cancelEditAddress() {
    setEditingAddressId(null);
    setEditingAddressValue('');
    setEditingLabelValue('');
  }

  async function handleSaveAddress(id: string) {
    const token = getToken();
    if (!token) return;

    const nextAddress = editingAddressValue.trim();
    if (nextAddress.length < 10) {
      setCryptoError('Address must be at least 10 characters');
      return;
    }

    setCryptoActionId(id);
    setCryptoError(null);

    try {
      await updateCryptoAddress(token, id, {
        address: nextAddress,
        ...(editingLabelValue.trim()
          ? { label: editingLabelValue.trim() }
          : { label: '' }),
      });
      cancelEditAddress();
      await loadCrypto();
    } catch (err) {
      setCryptoError(err instanceof Error ? err.message : 'Failed to update address');
    } finally {
      setCryptoActionId(null);
    }
  }

  async function handleSetDisplayed(item: CryptoAddressAdmin) {
    const token = getToken();
    if (!token) return;

    setCryptoActionId(item.id);
    setCryptoError(null);

    try {
      await updateCryptoAddress(token, item.id, { isDisplayed: true });
      await loadCrypto();
    } catch (err) {
      setCryptoError(err instanceof Error ? err.message : 'Failed to update address');
    } finally {
      setCryptoActionId(null);
    }
  }

  async function handleCreateRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token) return;

    const amount = Number(recordAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setRecordsError('Amount must be a positive number');
      return;
    }

    setRecordSaving(true);
    setRecordsError(null);

    try {
      await createDonationAdmin(token, {
        amount,
        paymentMethod: recordMethod,
        status: recordConfirmed ? 'CONFIRMED' : 'PENDING',
        ...(recordName.trim() ? { donorName: recordName.trim() } : {}),
        ...(recordEmail.trim() ? { donorEmail: recordEmail.trim() } : {}),
      });
      setRecordAmount('');
      setRecordName('');
      setRecordEmail('');
      setRecordConfirmed(false);
      await loadRecords(statusFilter, recordsPage);
    } catch (err) {
      setRecordsError(err instanceof Error ? err.message : 'Failed to create donation');
    } finally {
      setRecordSaving(false);
    }
  }

  async function handleModerateRecord(
    id: string,
    status: 'CONFIRMED' | 'FAILED',
  ) {
    const token = getToken();
    if (!token) return;

    setRecordActionId(id);
    setRecordsError(null);

    try {
      await updateDonationStatus(token, id, { status });
      await loadRecords(statusFilter, recordsPage);
    } catch (err) {
      setRecordsError(err instanceof Error ? err.message : 'Moderation failed');
    } finally {
      setRecordActionId(null);
    }
  }

  return (
    <>
      <AdminHeader title="Donations" />
      <div className="flex-1 p-6">
        <p className="mb-4 text-sm text-zinc-600">
          Manage crypto addresses and donation records submitted by the public or
          added manually.
        </p>

        <div className="mb-6 flex gap-2 border-b border-zinc-200">
          <button
            type="button"
            onClick={() => setTab('crypto')}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === 'crypto'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Crypto addresses
          </button>
          <button
            type="button"
            onClick={() => setTab('records')}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === 'records'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Donation records
          </button>
        </div>

        {tab === 'crypto' ? (
          <>
            {cryptoError ? (
              <p className="mb-4 text-sm text-red-600">{cryptoError}</p>
            ) : null}

            <form
              onSubmit={(event) => void handleCreateCrypto(event)}
              className="mb-8 max-w-3xl space-y-3 rounded-lg border border-zinc-200 bg-white p-4"
            >
              <h2 className="text-sm font-medium text-zinc-900">Add crypto address</h2>
              <p className="text-xs text-zinc-500">
                First address for a currency is shown on the donate page. Additional
                addresses are saved as inactive backups unless you check &quot;Show on site&quot;.
              </p>
              <div className="flex flex-wrap gap-3">
                <input
                  value={currencyCode}
                  onChange={(event) => setCurrencyCode(event.target.value.toUpperCase())}
                  required
                  minLength={2}
                  maxLength={10}
                  placeholder="Code (BTC, SOL…)"
                  className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm uppercase"
                />
                <input
                  value={currencyLabel}
                  onChange={(event) => setCurrencyLabel(event.target.value)}
                  maxLength={64}
                  placeholder="Label (optional)"
                  className="min-w-[160px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  required
                  minLength={10}
                  placeholder="Wallet address"
                  className="min-w-[280px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={setAsDisplayedOnCreate}
                    onChange={(event) => setSetAsDisplayedOnCreate(event.target.checked)}
                  />
                  Show on site
                </label>
                <button
                  type="submit"
                  disabled={cryptoSaving}
                  className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900 disabled:opacity-50"
                >
                  {cryptoSaving ? 'Saving…' : 'Add'}
                </button>
              </div>
            </form>

            {cryptoLoading ? <p className="text-sm text-zinc-500">Loading…</p> : null}

            {!cryptoLoading ? (
              <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-zinc-50 text-left text-zinc-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Code</th>
                      <th className="px-4 py-3 font-medium">Label</th>
                      <th className="px-4 py-3 font-medium">Address</th>
                      <th className="px-4 py-3 font-medium">Active</th>
                      <th className="px-4 py-3 font-medium">On site</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cryptoItems.map((item) => (
                      <tr key={item.id} className="border-t border-zinc-100">
                        <td className="px-4 py-3 font-medium">{item.currencyCode}</td>
                        <td className="px-4 py-3">
                          {editingAddressId === item.id ? (
                            <input
                              value={editingLabelValue}
                              onChange={(event) =>
                                setEditingLabelValue(event.target.value)
                              }
                              maxLength={64}
                              className="w-full rounded-md border border-zinc-300 px-2 py-1 text-xs"
                            />
                          ) : (
                            item.label ?? '—'
                          )}
                        </td>
                        <td className="max-w-md px-4 py-3">
                          {editingAddressId === item.id ? (
                            <input
                              value={editingAddressValue}
                              onChange={(event) =>
                                setEditingAddressValue(event.target.value)
                              }
                              minLength={10}
                              className="w-full rounded-md border border-zinc-300 px-2 py-1 font-mono text-xs"
                            />
                          ) : (
                            <span className="break-all font-mono text-xs">
                              {item.address}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">{item.isActive ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3">
                          {item.isDisplayed ? 'Yes' : 'No'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-3">
                            {editingAddressId === item.id ? (
                              <>
                                <button
                                  type="button"
                                  disabled={cryptoActionId === item.id}
                                  onClick={() => void handleSaveAddress(item.id)}
                                  className="text-green-700 hover:underline disabled:opacity-50"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditAddress}
                                  className="text-zinc-600 hover:underline"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditAddress(item)}
                                  className="text-amber-800 hover:underline"
                                >
                                  Edit
                                </button>
                                {!item.isDisplayed ? (
                                  <button
                                    type="button"
                                    disabled={cryptoActionId === item.id}
                                    onClick={() => void handleSetDisplayed(item)}
                                    className="text-green-700 hover:underline disabled:opacity-50"
                                  >
                                    Show on site
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  disabled={cryptoActionId === item.id}
                                  onClick={() => void handleToggleActive(item)}
                                  className="text-amber-800 hover:underline disabled:opacity-50"
                                >
                                  {item.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {cryptoItems.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-zinc-500">
                    No crypto addresses yet.
                  </p>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <>
            {recordsError ? (
              <p className="mb-4 text-sm text-red-600">{recordsError}</p>
            ) : null}

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label className="text-sm text-zinc-600" htmlFor="donation-status-filter">
                Status
              </label>
              <select
                id="donation-status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as DonationStatus | 'ALL')
                }
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="ALL">All</option>
                {DONATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <span className="text-sm text-zinc-500">
                {recordsTotal} record{recordsTotal === 1 ? '' : 's'}
              </span>
            </div>

            <form
              onSubmit={(event) => void handleCreateRecord(event)}
              className="mb-8 max-w-3xl space-y-3 rounded-lg border border-zinc-200 bg-white p-4"
            >
              <h2 className="text-sm font-medium text-zinc-900">Add donation manually</h2>
              <div className="flex flex-wrap gap-3">
                <input
                  value={recordAmount}
                  onChange={(event) => setRecordAmount(event.target.value)}
                  required
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Amount (THB)"
                  className="w-36 rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
                <select
                  value={recordMethod}
                  onChange={(event) =>
                    setRecordMethod(event.target.value as PaymentMethod)
                  }
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
                <input
                  value={recordName}
                  onChange={(event) => setRecordName(event.target.value)}
                  placeholder="Donor name (optional)"
                  className="min-w-[180px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
                <input
                  value={recordEmail}
                  onChange={(event) => setRecordEmail(event.target.value)}
                  type="email"
                  placeholder="Donor email (optional)"
                  className="min-w-[200px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={recordConfirmed}
                    onChange={(event) => setRecordConfirmed(event.target.checked)}
                  />
                  Mark as confirmed
                </label>
                <button
                  type="submit"
                  disabled={recordSaving}
                  className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900 disabled:opacity-50"
                >
                  {recordSaving ? 'Saving…' : 'Add'}
                </button>
              </div>
            </form>

            {recordsLoading ? <p className="text-sm text-zinc-500">Loading…</p> : null}

            {!recordsLoading ? (
              <>
                <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
                  <table className="min-w-full text-sm">
                    <thead className="bg-zinc-50 text-left text-zinc-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Method</th>
                        <th className="px-4 py-3 font-medium">Donor</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((item) => (
                        <tr key={item.id} className="border-t border-zinc-100">
                          <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                            {new Date(item.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            {item.amount} {item.currency}
                          </td>
                          <td className="px-4 py-3">{item.paymentMethod ?? '—'}</td>
                          <td className="px-4 py-3">
                            <div>{item.donorName ?? '—'}</div>
                            <div className="text-xs text-zinc-500">
                              {item.donorEmail ?? ''}
                            </div>
                          </td>
                          <td className="px-4 py-3">{item.status}</td>
                          <td className="px-4 py-3">
                            {item.status === 'PENDING' ? (
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  disabled={recordActionId === item.id}
                                  onClick={() =>
                                    void handleModerateRecord(item.id, 'CONFIRMED')
                                  }
                                  className="text-green-700 hover:underline disabled:opacity-50"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  disabled={recordActionId === item.id}
                                  onClick={() =>
                                    void handleModerateRecord(item.id, 'FAILED')
                                  }
                                  className="text-red-700 hover:underline disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {records.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-zinc-500">
                      No donation records yet.
                    </p>
                  ) : null}
                </div>

                {recordsTotalPages > 1 ? (
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      disabled={recordsPage <= 1 || recordsLoading}
                      onClick={() => setRecordsPage((page) => Math.max(1, page - 1))}
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-zinc-600">
                      Page {recordsPage} of {recordsTotalPages}
                    </span>
                    <button
                      type="button"
                      disabled={recordsPage >= recordsTotalPages || recordsLoading}
                      onClick={() =>
                        setRecordsPage((page) => Math.min(recordsTotalPages, page + 1))
                      }
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
