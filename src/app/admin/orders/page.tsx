"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  ChevronRight,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Loader2,
} from "lucide-react";
import { AdminOrder, getAdminOrders, updateOrderStatus } from "@/lib/services/cms";
import { products } from "@/data/products";

interface OrderDetailItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected order for detailed slide-over
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getAdminOrders();
        setOrders(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    newStatus: AdminOrder["order_status"]
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, order_status: newStatus });
    }
    await updateOrderStatus(orderId, newStatus);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || o.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: AdminOrder["order_status"]) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "processing":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "confirmed":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTimelineSteps = (currentStatus: AdminOrder["order_status"]) => {
    const steps = [
      { id: "pending", label: "Order Received" },
      { id: "confirmed", label: "Confirmed" },
      { id: "processing", label: "Atelier Assembly" },
      { id: "shipped", label: "Dispatched" },
      { id: "delivered", label: "Delivered" },
    ];
    const statusOrder = ["pending", "confirmed", "processing", "shipped", "delivered"];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((s, idx) => ({
      ...s,
      isCompleted: currentStatus !== "cancelled" && idx <= currentIndex,
      isCurrent: currentStatus !== "cancelled" && idx === currentIndex,
    }));
  };

  // Mock items for order detail
  const getOrderItems = (order: AdminOrder): OrderDetailItem[] => {
    const p1 = products[0];
    const p2 = products[1];

    if (order.items_count > 1) {
      return [
        {
          id: p1.id,
          name: p1.name,
          image: p1.image,
          price: p1.price,
          quantity: 1,
          color: (p1.colors || [])[0]?.name || "Noir Luxe",
        },
        {
          id: p2.id,
          name: p2.name,
          image: p2.image,
          price: p2.price,
          quantity: 1,
          color: (p2.colors || [])[0]?.name || "Heritage Gold",
        },
      ];
    }

    return [
      {
        id: p1.id,
        name: p1.name,
        image: p1.image,
        price: order.total,
        quantity: 1,
        color: (p1.colors || [])[0]?.name || "Artisanal Calfskin",
      },
    ];
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 text-luxury-gold animate-spin mx-auto mb-3" />
        <p className="font-serif text-sm text-luxury-muted">Reading Atelier Orders Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-luxury-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-amber-100 text-amber-900">
              Fulfillment
            </span>
            <span className="text-xs text-luxury-muted">&bull;</span>
            <span className="text-xs text-luxury-muted">Client Ledger</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-luxury-charcoal">
            Orders &amp; Acquisitions
          </h1>
          <p className="font-sans text-xs text-luxury-muted">
            Track client acquisitions, dispatch milestones, shipping consignments, and order statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-luxury-soft border border-luxury-border text-xs text-luxury-muted">
            Total Orders: <strong className="text-luxury-charcoal font-semibold">{orders.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-luxury-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Client name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-luxury-border text-xs text-luxury-charcoal focus:outline-hidden focus:border-luxury-gold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-luxury-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-luxury-border text-xs text-luxury-charcoal bg-white focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Fulfillment Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <span className="text-xs text-luxury-muted pl-2">
            Showing {filteredOrders.length} orders
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-luxury-border bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-luxury-border bg-luxury-soft/50 text-[10px] uppercase font-semibold text-luxury-muted tracking-wider">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Fulfillment Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-luxury-border text-xs">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-luxury-soft/30 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-luxury-charcoal">
                  {order.id}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-luxury-charcoal">
                    {order.customer_name}
                  </div>
                  <div className="text-[11px] text-luxury-muted">
                    {order.customer_email}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-luxury-muted">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-black/5 font-mono text-[11px]">
                    {order.items_count} item{order.items_count > 1 ? "s" : ""}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-luxury-charcoal">
                  ₹{order.total.toLocaleString("en-IN")}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      order.payment_status === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <select
                    value={order.order_status}
                    onChange={(e) =>
                      handleStatusChange(
                        order.id,
                        e.target.value as AdminOrder["order_status"]
                      )
                    }
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer capitalize focus:outline-hidden ${getStatusBadge(
                      order.order_status
                    )}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-luxury-border text-xs text-luxury-charcoal font-medium hover:bg-black/5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>Inspect</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-over Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl border-l border-luxury-border flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-luxury-border flex items-center justify-between bg-luxury-soft/30">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl font-bold text-luxury-charcoal">
                    {selectedOrder.id}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${getStatusBadge(
                      selectedOrder.order_status
                    )}`}
                  >
                    {selectedOrder.order_status}
                  </span>
                </div>
                <p className="text-xs text-luxury-muted mt-0.5">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg text-luxury-muted hover:text-luxury-charcoal hover:bg-black/5"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Timeline */}
              <div className="space-y-2">
                <span className="font-semibold text-luxury-charcoal uppercase tracking-wider text-[11px]">
                  Fulfillment Progression
                </span>
                <div className="flex items-center justify-between pt-2">
                  {getTimelineSteps(selectedOrder.order_status).map((step, idx) => (
                    <div key={step.id} className="flex flex-col items-center text-center flex-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          step.isCompleted
                            ? "bg-luxury-gold text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-[10px] font-medium text-luxury-charcoal mt-1 line-clamp-1">
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Information */}
              <div className="p-4 rounded-xl bg-luxury-soft/60 border border-luxury-border space-y-2">
                <span className="font-semibold text-luxury-charcoal uppercase tracking-wider text-[11px] block">
                  Client &amp; Consignment Destination
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs text-luxury-charcoal pt-1">
                  <div>
                    <span className="text-luxury-muted block text-[10px] uppercase">Client Name</span>
                    <strong>{selectedOrder.customer_name}</strong>
                  </div>
                  <div>
                    <span className="text-luxury-muted block text-[10px] uppercase">Contact</span>
                    <span>{selectedOrder.customer_email}</span>
                  </div>
                  <div>
                    <span className="text-luxury-muted block text-[10px] uppercase">Phone</span>
                    <span>{selectedOrder.customer_phone || "+91 98200 12345"}</span>
                  </div>
                  <div>
                    <span className="text-luxury-muted block text-[10px] uppercase">Shipping Address</span>
                    <span>74 Taj Mansions, Colaba, Mumbai 400005, India</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <span className="font-semibold text-luxury-charcoal uppercase tracking-wider text-[11px] block">
                  Acquired Creations
                </span>
                <div className="divide-y divide-luxury-border border border-luxury-border rounded-xl overflow-hidden bg-white">
                  {getOrderItems(selectedOrder).map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg bg-luxury-soft overflow-hidden shrink-0 border border-black/5">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-serif font-bold text-luxury-charcoal">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-luxury-muted">
                            Color: {item.color} &bull; Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-luxury-charcoal">
                        ₹{item.price.toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="p-4 rounded-xl bg-gray-50 border border-luxury-border space-y-2">
                <div className="flex justify-between text-luxury-muted">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{selectedOrder.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-luxury-muted">
                  <span>Insured Express Atelier Courier</span>
                  <span className="text-emerald-700 font-semibold">Complimentary</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-luxury-border text-sm font-bold text-luxury-charcoal">
                  <span>Total Settled</span>
                  <span className="font-mono text-base">₹{selectedOrder.total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 border-t border-luxury-border flex items-center justify-between">
              <div className="text-xs text-luxury-muted">
                Payment: <strong className="text-emerald-700 uppercase">Paid</strong> via Atelier Secure Checkout
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-full bg-luxury-charcoal text-white hover:bg-luxury-dark text-xs uppercase tracking-wider font-semibold"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
