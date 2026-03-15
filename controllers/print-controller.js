const escpos = require('escpos');
escpos.USB = require('escpos-usb');
const usb = require('usb');

// Patch for escpos-usb crashing due to missing on() method in newer usb library versions
if (usb.usb && !usb.on) {
    usb.on = usb.usb.on.bind(usb.usb);
    usb.removeListener = usb.usb.removeListener.bind(usb.usb);
}

exports.printReceipt = async (req, res) => {
    try {
        const orderData = req.body;
        
        // Find USB printer
        let device, printer;
        try {
            device = new escpos.USB();
            const options = { encoding: "GB18030" }; // Or another encoding depending on your printer/language
            printer = new escpos.Printer(device, options);
        } catch (err) {
            console.error('Printer connection error:', err);
            return res.status(500).json({ message: 'Could not connect to USB printer', error: err.message });
        }

        device.open(function (error) {
            if (error) {
                console.error("Failed to open device:", error);
                return res.status(500).json({ message: "Failed to open printer device", error: error.message });
            }

            try {
                // Formatting receipt
                printer
                    .font('a')
                    .align('ct')
                    .style('b')
                    .size(2, 2)
                    .text('Kale Cafe')
                    .text('----------------')
                    .size(1, 1)
                    .text(`Table ${orderData.table?.number || '?'}`)
                    .text('----------------')
                    .align('lt');

                // Date and Time
                const date = new Date(orderData.createdAt || Date.now());
                printer.text(`Date: ${date.toLocaleDateString('ar-SA')} ${date.toLocaleTimeString('ar-SA')}`);
                printer.text('--------------------------------');
                
                // Headers
                // Printer is typical 48 characters for 80mm
                // Qt   Item                 Price
                printer.text('Qty   Item                     Price');
                printer.text('--------------------------------');

                // Items
                if (orderData.items && orderData.items.length > 0) {
                    orderData.items.forEach(item => {
                        const qtyStr = String(item.quantity).padEnd(6);
                        
                        // basic truncation and padding for alignment
                        let nameStr = item.name.substring(0, 20); // truncate long names
                        nameStr = nameStr.padEnd(20);
                        
                        const price = (item.price * item.quantity).toLocaleString();
                        const priceStr = price.padStart(10); // push price to the right
                        
                        printer.text(`${qtyStr}${nameStr}${priceStr}`);
                    });
                }

                printer.text('--------------------------------');

                if (orderData.notes) {
                    printer.text(`Notes: ${orderData.notes}`);
                    printer.text('--------------------------------');
                }

                // Total
                printer
                    .align('rt')
                    .size(1, 2)
                    .text(`Total: ${(orderData.totalAmount || 0).toLocaleString()} TL`)
                    .text(' ')
                    .size(1, 1)
                    .align('ct')
                    .text('Thank you for visiting!')
                    .cut()
                    .close();

                res.status(200).json({ message: 'Printed successfully' });
            } catch (printErr) {
                console.error('Error during printing commands:', printErr);
                device.close();
                res.status(500).json({ message: 'Error formatting/printing receipt', error: printErr.message });
            }
        });

    } catch (error) {
        console.error('Print receipt catch block error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
