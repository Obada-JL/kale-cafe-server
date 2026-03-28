const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

// ===== IN-MEMORY PRINT JOB QUEUE =====
const printQueue = [];
let jobIdCounter = 1;

const Counter = require("../models/counter-model");

async function getNextSequence() {
  const today = new Date().toLocaleDateString("en-CA");
  let counter = await Counter.findOne({ name: "receipt_sequence" });

  if (!counter) {
    counter = new Counter({ name: "receipt_sequence", count: 1, date: today });
    await counter.save();
    return 1;
  }

  if (counter.date !== today) {
    counter.date = today;
    counter.count = 1;
  } else {
    counter.count++;
  }

  await counter.save();
  return counter.count;
}

const wrapText = (text, maxLength) => {
  if (!text) return [""];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word;
    } else if ((currentLine + " " + word).length <= maxLength) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  return lines.length > 0 ? lines : [""];
};

exports.queuePrint = async (req, res) => {
  const order = req.body;
  const lang = req.body.lang === 'tr' ? 'tr' : 'ar'; // Default to Arabic
  const isRTL = lang === 'ar';
  const tempFiles = [];

  const translations = {
    ar: {
      cafeName: "مطعم و كافيه القلعة",
      date: "التاريخ:",
      orderType: "نوع الطلب:",
      delivery: "سفري",
      table: "طاولة",
      payment: "الدفع:",
      cash: "نقدي",
      credit_card: "بطاقة بنك",
      pending: "قيد الانتظار",
      invoiceNo: "رقم الفاتورة:",
      tableLabel: "الطاولة:",
      total: "المجموع",
      qty: "الكمية",
      price: "السعر",
      item: "الصنف",
      totalLabel: "الإجمالي",
      notes: "ملاحظات:",
      cashier: "الكاشير:",
      footer: ["شكراً لزيارتكم", "غازي عنتاب الشارع الايراني", "للتواصل والشكاوي "]
    },
    tr: {
      cafeName: "KALE CAFE & RESTAURANT",
      date: "Tarih:",
      orderType: "Sipariş Tipi:",
      delivery: "Paket",
      table: "Masa",
      payment: "Ödeme:",
      cash: "Nakit",
      credit_card: "Kredi Kartı",
      pending: "Bekliyor",
      invoiceNo: "Fiş No:",
      tableLabel: "Masa:",
      total: "Toplam",
      qty: "Adet",
      price: "Fiyat",
      item: "Ürün",
      totalLabel: "Genel Toplam:",
      notes: "Notlar:",
      cashier: "Kasiyer:",
      footer: ["Ziyaretiniz İçin Teşekkürler", "Gaziantep İnönü Caddesi", "Şikayet ve Önerileriniz İçin"]
    }
  };

  const t = translations[lang];

  // Fetch cashier
  const User = require("../models/user-model");
  const cashier = await User.findOne({ isCashier: true });
  let cashierName = cashier ? cashier.username : (lang === 'ar' ? 'غير محدد' : 'Belirtilmedi');
  
  if (lang === 'tr' && cashier && cashier.nameTr) {
    cashierName = cashier.nameTr;
  }

  try {
    // We use a dummy interface since we only need the buffer, not actual printing
    let printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: "/dev/null",
      characterSet: "PC437_USA",
      removeSpecialCharacters: false,
      lineCharacter: "-"
    });

    // Helper to print a single line of text as an image (handling Arabic/Turkish)
    async function printText(text, options = {}) {
      const { align = (isRTL ? "right" : "left"), isBold = false, height = 60, size = 34 } = options;
      const canvas = createCanvas(500, height);
      const ctx = canvas.getContext("2d");
      
      ctx.fillStyle = "white"; 
      ctx.fillRect(0, 0, 500, height);
      
      ctx.fillStyle = "black"; 
      ctx.font = `${isBold ? 'bold ' : ''}${size}px Arial`;
      ctx.textBaseline = "middle";
      
      let x = 250;
      if (align === "right") {
        ctx.textAlign = "right"; x = 500;
      } else if (align === "left") {
        ctx.textAlign = "left"; x = 0;
      } else {
        ctx.textAlign = "center";
      }
      
      ctx.fillText(text, x, height / 2);
      
      const imagePath = path.resolve(`./temp_img_${Date.now()}_${Math.floor(Math.random()*10000)}.png`);
      fs.writeFileSync(imagePath, canvas.toBuffer("image/png"));
      tempFiles.push(imagePath);
      
      if (align === "center") printer.alignCenter();
      else if (align === "right") printer.alignRight();
      else printer.alignLeft();
      
      await printer.printImage(imagePath);
    }

    // Helper to print a table row as an image
    async function printTableRow(col1, col2, col3, col4, isBold = false) {
      const canvas = createCanvas(500, 60); 
      const ctx = canvas.getContext("2d");
      
      ctx.fillStyle = "white"; 
      ctx.fillRect(0, 0, 500, 60);
      
      ctx.fillStyle = "black"; 
      ctx.font = `${isBold ? 'bold ' : ''}28px Arial`;
      ctx.textBaseline = "middle";
      
      if (isRTL) {
        // Total (Left), Price, Qty, Item (Right)
        ctx.textAlign = "left"; ctx.fillText(col1, 0, 30); 
        ctx.textAlign = "center"; ctx.fillText(col2, 170, 30); 
        ctx.textAlign = "center"; ctx.fillText(col3, 280, 30); 
        ctx.textAlign = "right"; ctx.fillText(col4, 500, 30); 
      } else {
        // Item (Left), Qty, Price, Total (Right)
        ctx.textAlign = "left"; ctx.fillText(col1, 0, 30); 
        ctx.textAlign = "center"; ctx.fillText(col2, 170, 30); 
        ctx.textAlign = "right"; ctx.fillText(col3, 280, 30); 
        ctx.textAlign = "right"; ctx.fillText(col4, 500, 30); 
      }
      
      const imagePath = path.resolve(`./temp_img_${Date.now()}_${Math.floor(Math.random()*10000)}.png`);
      fs.writeFileSync(imagePath, canvas.toBuffer("image/png"));
      tempFiles.push(imagePath);
      
      printer.alignLeft();
      await printer.printImage(imagePath);
    }

    // ===== START BUILDING RECEIPT =====

    // Logo
    try {
      const baseDir = path.resolve(__dirname, '..'); 
      const img = await loadImage(path.resolve(baseDir, 'Logo.png'));
      const maxWidth = 200; 
      const scale = Math.min(maxWidth / img.width, 1); 
      const newWidth = img.width * scale;
      const newHeight = img.height * scale;

      const logoCanvas = createCanvas(500, newHeight + 60); 
      const logoCtx = logoCanvas.getContext('2d');
      logoCtx.fillStyle = "white"; 
      logoCtx.fillRect(0, 0, 500, newHeight + 60);
      
      const xOffset = (500 - newWidth) / 2;
      logoCtx.drawImage(img, xOffset, 0, newWidth, newHeight);

      logoCtx.fillStyle = "black";
      logoCtx.font = "bold 34px Arial"; 
      logoCtx.textAlign = "center";
      logoCtx.fillText(t.cafeName, 250, newHeight + 40);

      const logoPath = path.resolve(`./temp_logo_${Date.now()}.png`);
      fs.writeFileSync(logoPath, logoCanvas.toBuffer("image/png"));
      tempFiles.push(logoPath);

      printer.alignCenter();
      await printer.printImage(logoPath);
    } catch(err) {
      console.log("Could not load logo:", err.message);
      await printText(t.cafeName, { size: 44, isBold: true, height: 70 });
    }
    
    printer.drawLine();

    const date = new Date(order.createdAt || Date.now());
    const dateStr = lang === 'ar' 
      ? date.toLocaleDateString("ar-SA") + " " + date.toLocaleTimeString("ar-SA")
      : date.toLocaleDateString("tr-TR") + " " + date.toLocaleTimeString("tr-TR");
    
    await printText(`${t.date} ${dateStr}`, { size: 28 });
    await printText(`${t.cashier} ${cashierName}`, { size: 28 });
    
    // Order Type & Payment Method
    const typeTxt = order.orderType === 'delivery' ? t.delivery : t.table;
    const payMap = { cash: t.cash, credit_card: t.credit_card, pending: t.pending };
    const payTxt = payMap[order.paymentMethod] || t.pending;
    
    await printText(`${t.orderType} ${typeTxt} | ${t.payment} ${payTxt}`, { size: 28, height: 40 });
    printer.drawLine();

    // Table Line: Seq & Qty and Table Number
    const sequence = await getNextSequence();
    const tableNum = order.table?.number || order.table || "?";
    
    const headerCanvas = createCanvas(500, 60);
    const hCtx = headerCanvas.getContext("2d");
    hCtx.fillStyle = "white"; hCtx.fillRect(0, 0, 500, 60);
    hCtx.fillStyle = "black"; hCtx.textBaseline = "middle";
    hCtx.font = "bold 30px Arial";
    
    if (isRTL) {
      hCtx.textAlign = "left"; hCtx.fillText(`${t.invoiceNo} ${sequence}`, 0, 30);
      hCtx.textAlign = "right"; hCtx.fillText(order.orderType === 'delivery' ? t.delivery : `${t.tableLabel} ${tableNum}`, 500, 30);
    } else {
      hCtx.textAlign = "left"; hCtx.fillText(order.orderType === 'delivery' ? t.delivery : `${t.tableLabel} ${tableNum}`, 0, 30);
      hCtx.textAlign = "right"; hCtx.fillText(`${t.invoiceNo} ${sequence}`, 500, 30);
    }

    const headerPath = path.resolve(`./temp_head_${Date.now()}.png`);
    fs.writeFileSync(headerPath, headerCanvas.toBuffer("image/png"));
    tempFiles.push(headerPath);
    printer.alignLeft();
    await printer.printImage(headerPath);
    
    printer.drawLine();

    // Table Header
    if (isRTL) {
      await printTableRow(t.total, t.price, t.qty, t.item, true);
    } else {
      await printTableRow(t.item, t.qty, t.price, t.total, true);
    }
    printer.drawLine();

    // Items
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const totalStr = (item.price * item.quantity).toLocaleString();
        const qtyStr = String(item.quantity);
        const priceStr = item.price.toLocaleString();
        
        let fullProductName = "";
        if (lang === 'tr') {
          fullProductName = (item.nameTr || item.name || "");
        } else {
          fullProductName = (item.name || "");
        }

        const nameLines = wrapText(fullProductName, 10);
        
        for (let i = 0; i < nameLines.length; i++) {
          const currentNameLine = nameLines[i];
          const isFirstLine = i === 0;

          if (isRTL) {
            // RTL: Total, Price, Qty, Item
            await printTableRow(
              isFirstLine ? totalStr : "", 
              isFirstLine ? priceStr : "", 
              isFirstLine ? qtyStr : "", 
              currentNameLine
            );
          } else {
            // LTR: Item, Qty, Price, Total
            await printTableRow(
              currentNameLine, 
              isFirstLine ? qtyStr : "", 
              isFirstLine ? priceStr : "", 
              isFirstLine ? totalStr : ""
            );
          }
        }
      }
    }
    printer.drawLine();

    // Notes
    if (order.notes) {
      await printText(`${t.notes} ${order.notes}`);
      printer.drawLine();
    }

    // Total
    const totalTxt = isRTL 
      ? `  ${(order.totalAmount || 0).toLocaleString()}TL :${t.totalLabel}`
      : `${t.totalLabel} ${(order.totalAmount || 0).toLocaleString()} TL`;
    await printText(totalTxt, { align: isRTL ? "right" : "left", size: 36, isBold: true, height: 60 });
    
    printer.newLine();
    for (const msg of t.footer) {
      await printText(msg, { size: msg.includes("+90") ? 22 : 28, align: "center" });
    }
    await printText("+90 535 506 66 97", { size: 22, align: "center" });
    printer.newLine();
    
    printer.cut(); 

    // ===== GET THE BUFFER & QUEUE IT =====
    const buffer = printer.getBuffer();

    const jobId = jobIdCounter++;
    printQueue.push({
      id: jobId,
      buffer: buffer,
      createdAt: new Date().toISOString(),
      order: {
        table: order.table?.number || order.table,
        totalAmount: order.totalAmount,
        itemCount: order.items?.length || 0
      }
    });

    console.log(`✅ Print job #${jobId} queued (${buffer.length} bytes, ${printQueue.length} in queue)`);

    // Clean up all temp image files
    tempFiles.forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });

    return res.json({ status: "queued", jobId });

  } catch (e) {
    console.error("Receipt build error:", e);
    // Clean up temp files on error too
    tempFiles.forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
    if (!res.headersSent) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  }
};

// ===== GET /api/print/pending — Local agent fetches the next job =====
exports.getPendingJob = (req, res) => {
  if (printQueue.length === 0) {
    return res.json({ status: "empty" });
  }

  const job = printQueue[0]; // Peek at oldest job
  
  // Send the binary buffer as base64 so it survives JSON transport
  return res.json({
    status: "pending",
    job: {
      id: job.id,
      buffer: job.buffer.toString("base64"),
      createdAt: job.createdAt,
      order: job.order
    }
  });
};

// ===== POST /api/print/ack/:id — Local agent confirms it printed =====
exports.acknowledgeJob = (req, res) => {
  const jobId = parseInt(req.params.id);
  const index = printQueue.findIndex(j => j.id === jobId);

  if (index === -1) {
    return res.status(404).json({ status: "not_found" });
  }

  printQueue.splice(index, 1);
  console.log(`🖨️  Print job #${jobId} acknowledged & removed (${printQueue.length} remaining)`);

  return res.json({ status: "acknowledged" });
};

// ===== GET /api/print/status — Check queue status =====
exports.getQueueStatus = (req, res) => {
  return res.json({
    queueLength: printQueue.length,
    jobs: printQueue.map(j => ({ id: j.id, createdAt: j.createdAt, order: j.order }))
  });
};
