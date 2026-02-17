import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import dayjs from 'dayjs';

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 10,
    color: '#666'
  },
  companyDetails: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  section: {
    width: '45%'
  },
  label: {
    fontSize: 8,
    color: '#888',
    marginBottom: 2,
    textTransform: 'uppercase'
  },
  text: {
    fontSize: 10,
    marginBottom: 2,
    lineHeight: 1.4
  },
  table: {
    marginTop: 20,
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    padding: 8,
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    padding: 8,
    paddingVertical: 12
  },
  colDesc: { width: '50%' },
  colQty: { width: '10%', textAlign: 'center' },
  colPrice: { width: '20%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  
  summary: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20
  },
  summaryBlock: {
    width: '40%',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#000'
  },
  totalText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#888',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 20
  }
});

const InvoicePDF = ({ order, settings }) => {
  // Use settings or fallback to defaults
  const company = {
    name: settings?.companyName || "Seasons by Ritu",
    address: settings?.addressLine1 || "123 Art Gallery Avenue, Creative District",
    city: settings?.cityStateZip || "New Delhi, India 110001",
    gst: settings?.gstin || "07AAAAA0000A1Z5",
    email: settings?.email || "support@seasonsbyritu.com",
    website: settings?.website || "www.seasonsbyritu.com"
  };

  const taxRate = 0.12; // 12% GST assumed
  const subtotal = order.totalUSD / (1 + taxRate);
  const taxAmount = order.totalUSD - subtotal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.subtitle}>#{order._id.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{company.name}</Text>
            <Text style={styles.text}>{company.website}</Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.row}>
          <View style={styles.section}>
            <Text style={styles.label}>Billed From:</Text>
            <Text style={[styles.text, { fontWeight: 'bold' }]}>{company.name}</Text>
            <Text style={styles.text}>{company.address}</Text>
            <Text style={styles.text}>{company.city}</Text>
            <Text style={styles.text}>GSTIN: {company.gst}</Text>
            <Text style={styles.text}>Email: {company.email}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Billed To:</Text>
            <Text style={[styles.text, { fontWeight: 'bold' }]}>Customer ID: {order.customerId}</Text>
            <Text style={styles.text}>{order.address?.line1}</Text>
            <Text style={styles.text}>{order.address?.city}, {order.address?.postalCode}</Text>
            <Text style={styles.text}>{order.address?.country}</Text>
            <Text style={styles.text}>Payment Method: {order.paymentMethod.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.section}>
             <Text style={styles.label}>Invoice Date:</Text>
             <Text style={styles.text}>{dayjs(order.createdAt).format('MMMM D, YYYY')}</Text>
          </View>
          <View style={styles.section}>
             <Text style={styles.label}>Status:</Text>
             <Text style={styles.text}>{order.status}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Item Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Price</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          
          {order.items.map((item, i) => {
            const paintingTitle = item.paintingId?.title || `Painting #${item.paintingId?._id || 'Unknown'}`;
            return (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.colDesc}>{paintingTitle} (Art)</Text>
                <Text style={styles.colQty}>1</Text>
                <Text style={styles.colPrice}>${item.priceUSD.toFixed(2)}</Text>
                <Text style={styles.colTotal}>${item.priceUSD.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryBlock}>
            <View style={styles.summaryRow}>
              <Text>Subtotal (Tax Excl.):</Text>
              <Text>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>GST (12%):</Text>
              <Text>${taxAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Grand Total:</Text>
              <Text style={styles.totalText}>${order.totalUSD.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text>For any queries, please contact {company.email}</Text>
          <Text style={{ marginTop: 10, color: '#AAA' }}>This is a computer-generated invoice.</Text>
        </View>

      </Page>
    </Document>
  );
};

export default InvoicePDF;
