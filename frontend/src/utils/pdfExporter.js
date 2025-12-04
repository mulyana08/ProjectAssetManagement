/**
 * PDF Exporter Utility
 * Utility untuk export data ke PDF
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format tanggal ke format Indonesia
 */
const formatDate = (date) => {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return '-';
    }
};

/**
 * Format tipe transaksi ke label Indonesia
 */
const formatTransactionType = (type) => {
    const types = {
        'checkout': 'Peminjaman',
        'checkin': 'Pengembalian',
        'repair_start': 'Mulai Perbaikan',
        'repair_complete': 'Selesai Perbaikan',
        'dispose': 'Disposal',
        'report_missing': 'Lapor Hilang',
        'found': 'Ditemukan'
    };
    return types[type] || type;
};

/**
 * Format status aset ke label Indonesia
 */
const formatStatus = (status) => {
    const statuses = {
        'available': 'Tersedia',
        'assigned': 'Dipinjam',
        'repair': 'Perbaikan',
        'retired': 'Dinonaktifkan',
        'missing': 'Hilang'
    };
    return statuses[status] || status || '-';
};

/**
 * Export transaksi ke PDF
 * @param {Array} transactions - Data transaksi
 * @param {Object} options - Opsi export
 * @returns {Promise<{blob: Blob, url: string, filename: string}>}
 */
export const exportTransactionsToPDF = async (transactions, options = {}) => {
    const {
        title = 'Laporan Transaksi Aset',
        subtitle = '',
        orientation = 'landscape'
    } = options;

    // Create PDF document
    const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 15, { align: 'center' });

    // Subtitle dengan tanggal export
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const exportDate = new Date().toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.text(`Diekspor pada: ${exportDate}`, pageWidth / 2, 22, { align: 'center' });
    
    if (subtitle) {
        doc.text(subtitle, pageWidth / 2, 28, { align: 'center' });
    }

    // Table headers
    const headers = [
        'No',
        'Tanggal',
        'Kode Aset',
        'Nama Aset',
        'Kategori',
        'Tipe',
        'Status Sebelum',
        'Status Sesudah',
        'Dilakukan Oleh',
        'Catatan'
    ];

    // Table data
    const data = transactions.map((t, index) => [
        index + 1,
        formatDate(t.transaction_date),
        t.asset?.asset_code || '-',
        t.asset?.name || '-',
        t.asset?.category?.name || '-',
        formatTransactionType(t.type),
        formatStatus(t.previous_status),
        formatStatus(t.new_status),
        t.user?.name || '-',
        (t.notes || '-').substring(0, 50) + (t.notes?.length > 50 ? '...' : '')
    ]);

    // Generate table using autoTable
    autoTable(doc, {
        head: [headers],
        body: data,
        startY: subtitle ? 33 : 28,
        styles: {
            fontSize: 8,
            cellPadding: 2,
        },
        headStyles: {
            fillColor: [59, 130, 246], // Blue-500
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 }, // No
            1: { cellWidth: 28 }, // Tanggal
            2: { cellWidth: 25 }, // Kode Aset
            3: { cellWidth: 35 }, // Nama Aset
            4: { cellWidth: 22 }, // Kategori
            5: { cellWidth: 22 }, // Tipe
            6: { cellWidth: 22 }, // Status Sebelum
            7: { cellWidth: 22 }, // Status Sesudah
            8: { cellWidth: 25 }, // Dilakukan Oleh
            9: { cellWidth: 'auto' } // Catatan
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251] // Gray-50
        },
        didDrawPage: (data) => {
            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(128);
            doc.text(
                `Halaman ${data.pageNumber} dari ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
            doc.text(
                'IT Asset Management System',
                14,
                doc.internal.pageSize.getHeight() - 10
            );
        }
    });

    // Summary - get finalY from previous table
    const finalY = (doc.lastAutoTable?.finalY || 100) + 10;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Transaksi: ${transactions.length}`, 14, finalY);

    // Generate filename
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `laporan-transaksi-${dateStr}.pdf`;

    // Get blob
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);

    return { blob, url, filename, doc };
};

/**
 * Export aset ke PDF
 * @param {Array} assets - Data aset
 * @param {Object} options - Opsi export
 * @returns {Promise<{blob: Blob, url: string, filename: string}>}
 */
export const exportAssetsToPDF = async (assets, options = {}) => {
    const {
        title = 'Daftar Aset IT',
        orientation = 'landscape'
    } = options;

    const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const exportDate = new Date().toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.text(`Diekspor pada: ${exportDate}`, pageWidth / 2, 22, { align: 'center' });

    // Table headers
    const headers = [
        'No',
        'Kode Aset',
        'Nama Aset',
        'Kategori',
        'Merek',
        'Model',
        'Status',
        'Lokasi',
        'Tgl Pembelian',
        'Harga'
    ];

    // Format currency
    const formatCurrency = (value) => {
        if (!value) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Table data
    const data = assets.map((a, index) => [
        index + 1,
        a.asset_code || '-',
        a.name || '-',
        a.category?.name || '-',
        a.brand || '-',
        a.model || '-',
        formatStatus(a.status),
        a.location?.name || '-',
        a.purchase_date ? new Date(a.purchase_date).toLocaleDateString('id-ID') : '-',
        formatCurrency(a.purchase_price)
    ]);

    // Generate table using autoTable
    autoTable(doc, {
        head: [headers],
        body: data,
        startY: 28,
        styles: {
            fontSize: 8,
            cellPadding: 2,
        },
        headStyles: {
            fillColor: [16, 185, 129], // Emerald-500
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            9: { halign: 'right' }
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251]
        },
        didDrawPage: (data) => {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(128);
            doc.text(
                `Halaman ${data.pageNumber} dari ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }
    });

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `daftar-aset-${dateStr}.pdf`;
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);

    return { blob, url, filename, doc };
};

/**
 * Download file dari blob
 */
export const downloadFile = (blob, filename) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};

/**
 * Buka file di tab baru
 */
export const openInNewTab = (url) => {
    window.open(url, '_blank');
};
