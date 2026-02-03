package com.v1.backend.utils;

import com.v1.backend.model.Order;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
public class InvoicePdfGenerator {

    public byte[] generateInvoicePdf(Order order) throws DocumentException {
        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);
        document.open();

        // Header
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD, BaseColor.CYAN);
        Paragraph title = new Paragraph("TechHub", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Font headerFont = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL, BaseColor.DARK_GRAY);
        Paragraph headerInfo = new Paragraph(
                "TechHub E-Commerce\ninfo@techhub.com | 0212 XXX XX XX",
                headerFont
        );
        headerInfo.setAlignment(Element.ALIGN_CENTER);
        document.add(headerInfo);

        document.add(new Paragraph(" ")); // Space

        // Invoice Title
        Font invoiceTitleFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
        Paragraph invoiceTitle = new Paragraph("FATURA", invoiceTitleFont);
        invoiceTitle.setAlignment(Element.ALIGN_CENTER);
        document.add(invoiceTitle);

        document.add(new Paragraph(" ")); // Space

        // Invoice Details Table
        PdfPTable detailsTable = new PdfPTable(2);
        detailsTable.setWidthPercentage(100);
        detailsTable.setSpacingBefore(10f);

        // Fatura No
        PdfPCell cellLabel = new PdfPCell(new Phrase("Fatura No:", new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD)));
        cellLabel.setBorder(Rectangle.NO_BORDER);
        cellLabel.setPaddingBottom(5);
        detailsTable.addCell(cellLabel);

        PdfPCell cellValue = new PdfPCell(new Phrase(order.getOrderNumber(), new Font(Font.FontFamily.HELVETICA, 11)));
        cellValue.setBorder(Rectangle.NO_BORDER);
        cellValue.setPaddingBottom(5);
        detailsTable.addCell(cellValue);

        // Fatura Tarihi
        cellLabel = new PdfPCell(new Phrase("Fatura Tarihi:", new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD)));
        cellLabel.setBorder(Rectangle.NO_BORDER);
        cellLabel.setPaddingBottom(5);
        detailsTable.addCell(cellLabel);

        String dateStr = order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd.MM.yyyy"));
        cellValue = new PdfPCell(new Phrase(dateStr, new Font(Font.FontFamily.HELVETICA, 11)));
        cellValue.setBorder(Rectangle.NO_BORDER);
        cellValue.setPaddingBottom(5);
        detailsTable.addCell(cellValue);

        // Ödeme Durumu
        cellLabel = new PdfPCell(new Phrase("Ödeme Durumu:", new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD)));
        cellLabel.setBorder(Rectangle.NO_BORDER);
        cellLabel.setPaddingBottom(5);
        detailsTable.addCell(cellLabel);

        String paymentStatus = order.getPaymentStatus().name().equals("PAID") ? "Ödendi" : "Bekleniyor";
        cellValue = new PdfPCell(new Phrase(paymentStatus, new Font(Font.FontFamily.HELVETICA, 11)));
        cellValue.setBorder(Rectangle.NO_BORDER);
        cellValue.setPaddingBottom(5);
        detailsTable.addCell(cellValue);

        document.add(detailsTable);
        document.add(new Paragraph(" "));

        // Customer Info Section
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.DARK_GRAY);
        document.add(new Paragraph("MÜŞTERİ BİLGİLERİ", sectionFont));

        PdfPTable customerTable = new PdfPTable(1);
        customerTable.setWidthPercentage(100);
        customerTable.setSpacingBefore(5f);

        String customerName = order.getUser().getEmail();
        String customerInfo = String.format(
                "Email: %s\nTelefon: %s\nAdres: %s",
                customerName,
                order.getPhoneNumber(),
                order.getShippingAddress()
        );

        PdfPCell customerCell = new PdfPCell(new Phrase(customerInfo, new Font(Font.FontFamily.HELVETICA, 10)));
        customerCell.setBorder(Rectangle.BOX);
        customerCell.setPadding(10);
        customerTable.addCell(customerCell);

        document.add(customerTable);
        document.add(new Paragraph(" "));

        // Items Table
        document.add(new Paragraph("ÜRÜNLER", sectionFont));

        PdfPTable itemsTable = new PdfPTable(4);
        itemsTable.setWidthPercentage(100);
        itemsTable.setSpacingBefore(5f);
        itemsTable.setWidths(new float[]{40, 15, 15, 15});

        // Header Row
        String[] headers = {"Ürün", "Adet", "Birim Fiyatı", "Toplam"};
        for (String header : headers) {
            PdfPCell headerCell = new PdfPCell(new Phrase(header, new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.WHITE)));
            headerCell.setBackgroundColor(BaseColor.CYAN);
            headerCell.setPadding(8);
            headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            itemsTable.addCell(headerCell);
        }

        // Items
        order.getItems().forEach(item -> {
            PdfPCell cell;

            cell = new PdfPCell(new Phrase(item.getProduct().getName(), new Font(Font.FontFamily.HELVETICA, 10)));
            cell.setPadding(5);
            itemsTable.addCell(cell);

            cell = new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), new Font(Font.FontFamily.HELVETICA, 10)));
            cell.setPadding(5);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            itemsTable.addCell(cell);

            cell = new PdfPCell(new Phrase("₺" + item.getUnitPrice().toPlainString(), new Font(Font.FontFamily.HELVETICA, 10)));
            cell.setPadding(5);
            cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemsTable.addCell(cell);

            double total = item.getUnitPrice().doubleValue() * item.getQuantity();
            cell = new PdfPCell(new Phrase("₺" + String.format("%.2f", total), new Font(Font.FontFamily.HELVETICA, 10)));
            cell.setPadding(5);
            cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemsTable.addCell(cell);
        });

        document.add(itemsTable);
        document.add(new Paragraph(" "));

        // Summary Table
        PdfPTable summaryTable = new PdfPTable(2);
        summaryTable.setWidthPercentage(50);
        summaryTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

        // Subtotal
        cellLabel = new PdfPCell(new Phrase("Ara Toplam:", new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD)));
        cellLabel.setBorder(Rectangle.NO_BORDER);
        cellLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        summaryTable.addCell(cellLabel);

        cellValue = new PdfPCell(new Phrase("₺" + order.getSubtotal().toPlainString(), new Font(Font.FontFamily.HELVETICA, 11)));
        cellValue.setBorder(Rectangle.NO_BORDER);
        cellValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        summaryTable.addCell(cellValue);

        // Shipping
        cellLabel = new PdfPCell(new Phrase("Kargo:", new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD)));
        cellLabel.setBorder(Rectangle.NO_BORDER);
        cellLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        summaryTable.addCell(cellLabel);

        String shippingText = order.getShippingCost().compareTo(java.math.BigDecimal.ZERO) == 0 ? "Ücretsiz" : "₺" + order.getShippingCost().toPlainString();
        cellValue = new PdfPCell(new Phrase(shippingText, new Font(Font.FontFamily.HELVETICA, 11)));
        cellValue.setBorder(Rectangle.NO_BORDER);
        cellValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        summaryTable.addCell(cellValue);

        // Tax
        if (order.getTaxAmount() != null && order.getTaxAmount().compareTo(java.math.BigDecimal.ZERO) > 0) {
            cellLabel = new PdfPCell(new Phrase("Vergi:", new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD)));
            cellLabel.setBorder(Rectangle.NO_BORDER);
            cellLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summaryTable.addCell(cellLabel);

            cellValue = new PdfPCell(new Phrase("₺" + order.getTaxAmount().toPlainString(), new Font(Font.FontFamily.HELVETICA, 11)));
            cellValue.setBorder(Rectangle.NO_BORDER);
            cellValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summaryTable.addCell(cellValue);
        }

        // Total
        cellLabel = new PdfPCell(new Phrase("TOPLAM:", new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD, BaseColor.CYAN)));
        cellLabel.setBorder(Rectangle.NO_BORDER);
        cellLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellLabel.setPaddingTop(10);
        summaryTable.addCell(cellLabel);

        cellValue = new PdfPCell(new Phrase("₺" + order.getTotalPrice().toPlainString(), new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD, BaseColor.CYAN)));
        cellValue.setBorder(Rectangle.NO_BORDER);
        cellValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellValue.setPaddingTop(10);
        summaryTable.addCell(cellValue);

        document.add(summaryTable);
        document.add(new Paragraph(" "));

        // Footer
        Font footerFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.LIGHT_GRAY);
        Paragraph footer = new Paragraph(
                "Bu belge otomatik olarak oluşturulmuştur. İmza gerekmemektedir.\nTeşekkür ederiz!",
                footerFont
        );
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }
}