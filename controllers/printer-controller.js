const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

// ===== IN-MEMORY PRINT JOB QUEUE =====
const printQueue = [];
let jobIdCounter = 1;

exports.queuePrint = async (req, res) => {
  const order = req.body;
  const tempFiles = [];

  try {
    // We use a dummy interface since we only need the buffer, not actual printing
    let printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: "/dev/null",
      characterSet: "PC437_USA",
      removeSpecialCharacters: false,
      lineCharacter: "-"
    });

    // Helper to print a single line of Arabic text as an image
    async function printArabicText(text, options = {}) {
      const { align = "center", isBold = false, height = 40, size = 26 } = options;
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
    async function printArabicTableRow(price, item, qty, isBold = false) {
      const canvas = createCanvas(500, 40);
      const ctx = canvas.getContext("2d");
      
      ctx.fillStyle = "white"; 
      ctx.fillRect(0, 0, 500, 40);
      
      ctx.fillStyle = "black"; 
      ctx.font = `${isBold ? 'bold ' : ''}22px Arial`;
      ctx.textBaseline = "middle";
      
      // RTL Layout: Price (Left), Item (Right, bounded), Qty (Right edge)
      ctx.textAlign = "left";
      ctx.fillText(price, 0, 20);
      
      ctx.textAlign = "right";
      ctx.fillText(item, 400, 20);
      
      ctx.textAlign = "right";
      ctx.fillText(qty, 500, 20);
      
      const imagePath = path.resolve(`./temp_img_${Date.now()}_${Math.floor(Math.random()*10000)}.png`);
      fs.writeFileSync(imagePath, canvas.toBuffer("image/png"));
      tempFiles.push(imagePath);
      
      printer.alignLeft();
      await printer.printImage(imagePath);
    }

    // ===== START BUILDING RECEIPT =====

    // Logo
    try {
      const baseDir = path.resolve(__dirname, '..'); // Logo goes in root of server
      const img = await loadImage(path.resolve(baseDir, 'Logo.png'));
      const maxWidth = 500; 
      const scale = Math.min(maxWidth / img.width, 1); 
      const newWidth = img.width * scale;
      const newHeight = img.height * scale;

      const logoCanvas = createCanvas(500, newHeight); 
      const logoCtx = logoCanvas.getContext('2d');
      logoCtx.fillStyle = "white"; 
      logoCtx.fillRect(0, 0, 500, newHeight);
      const xOffset = (500 - newWidth) / 2;
      logoCtx.drawImage(img, xOffset, 0, newWidth, newHeight);

      const logoPath = path.resolve(`./temp_logo_${Date.now()}.png`);
      fs.writeFileSync(logoPath, logoCanvas.toBuffer("image/png"));
      tempFiles.push(logoPath);

      printer.alignCenter();
      await printer.printImage(logoPath);
    } catch(err) {
      console.log("Could not load logo:", err.message);
      await printArabicText("كالي كافيه", { size: 40, isBold: true, height: 60 });
    }
    
    printer.drawLine();

    const tableTxt = `الطاولة: ${order.table?.number || order.table || "?"}`;
    await printArabicText(tableTxt, { align: "right" });
    printer.drawLine();

    const date = new Date(order.createdAt || Date.now());
    const dateTxt = `التاريخ: ${date.toLocaleDateString("ar-SA")} ${date.toLocaleTimeString("ar-SA")}`;
    await printArabicText(dateTxt, { align: "right" });
    printer.drawLine();

    // Table Header
    await printArabicTableRow("السعر", "الصنف", "الكمية", true);
    printer.drawLine();

    // Items
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const priceStr = (item.price * item.quantity).toLocaleString();
        const nameStr = item.name.substring(0, 25);
        const qtyStr = String(item.quantity);
        await printArabicTableRow(priceStr, nameStr, qtyStr);
      }
    }
    printer.drawLine();

    // Notes
    if (order.notes) {
      await printArabicText(`ملاحظات: ${order.notes}`, { align: "right" });
      printer.drawLine();
    }

    // Total
    const totalTxt = `الإجمالي: ${(order.totalAmount || 0).toLocaleString()} TL`;
    await printArabicText(totalTxt, { align: "left", size: 30, isBold: true, height: 50 });
    
    printer.newLine();
    await printArabicText("شكراً لزيارتكم!");
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
