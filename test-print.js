// Use native fetch (Node 18+) or custom mock if needed
const fetchApi = globalThis.fetch || require('node-fetch');

const API_ROOT = "http://localhost:4000/api"; // Main server port

const testOrder = {
    table: { number: "5" },
    items: [
        { name: "Coffee", category: "Drinks", price: 15, quantity: 2 },
        { name: "Baklava", category: "Desserts", price: 45, quantity: 1 }
    ],
    totalAmount: 75,
    notes: "No sugar in coffee",
    createdAt: new Date().toISOString()
};

async function triggerTestPrint() {
    console.log("🚀 Sending test print job to:", API_ROOT);
    try {
        const res = await fetchApi(`${API_ROOT}/print`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testOrder)
        });
        const data = await res.json();
        console.log("✅ Server response:", data);
        
        if (data.status === "queued") {
            console.log("Job queued! Now check your local-printer agent console.");
        }
    } catch (err) {
        console.error("❌ Error triggering print:", err.message);
        console.log("Make sure kale-cafe-server is running on port 4000.");
    }
}

triggerTestPrint();
