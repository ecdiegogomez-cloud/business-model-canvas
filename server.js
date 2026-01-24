const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(__dirname, 'data.json');

const app = express();
app.use(cors());

// Redirect root to the main file
app.get('/', (req, res) => {
    res.redirect('/infographic_left_handed_mice.html');
});

// Serve static files from the current directory
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Default Data (Same as frontend default)
const defaultData = {
    kp: [
        "Gaming Influencers (Left-handed)",
        "Ergonomic Health Experts",
        "OEM Manufacturers (Shenzhen/Taiwan)",
        "Logistics Partners (DHL/FedEx)",
        "Tech YouTubers (Reviewers)"
    ],
    ka: [
        "Product Design & R&D",
        "Quality Control Processes",
        "E-commerce Management",
        "Community Building (Discord/Reddit)",
        "Strategic Marketing Campaigns"
    ],
    kr: [
        "Proprietary Product Molds",
        "Brand Trademarks & Patents",
        "Shopify E-commerce Platform",
        "Verified Customer Database",
        "Community Engagement Systems"
    ],
    vp: [
        "Designed for the 10%: True Ergonomics",
        "Precision Sensors for Pro Gaming",
        "Inclusive Brand Identity",
        "Premium Unboxing Experience",
        "Custom Software for Button-Mapping"
    ],
    cr: [
        "Community Forums & Discord Support",
        "Direct Feedback Loops for Design",
        "Transparent Warranty Program",
        "Niche Interest Group Engagement"
    ],
    ch: [
        "Direct-to-Consumer Website",
        "Amazon Marketplace Presence",
        "Niche Tech & Gaming Blogs",
        "Social Media Ads (Targeted)",
        "Twitch Sponsorships"
    ],
    cs: [
        "Left-handed Pro Gamers",
        "Office Workers with RSI Concerns",
        "Creative Professionals (Designers)",
        "Niche Tech Enthusiasts"
    ],
    cst: [
        "Manufacturing (MOQ & Custom Molds)",
        "Global Shipping & Warehousing",
        "Customer Acquisition Cost (CAC)",
        "Continuous R&D Expenditures"
    ],
    rs: [
        "Premium Hardware Sales",
        "Specialized Accessories (Mousepads)",
        "Replacement Parts & Maintenance",
        "Subscription-based Replacement Model"
    ]
};

// In-memory state with persistence
let currentData = JSON.parse(JSON.stringify(defaultData));

function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            currentData = JSON.parse(data);
            console.log('Data loaded from disk');
        }
    } catch (err) {
        console.error('Error loading data:', err);
    }
}

function saveData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2));
    } catch (err) {
        console.error('Error saving data:', err);
    }
}

loadData();

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send current state to the new user
    socket.emit('init_data', currentData);

    // Handle updates
    socket.on('update_canvas', (newData) => {
        currentData = newData;
        saveData();
        // Broadcast to everyone else
        socket.broadcast.emit('canvas_updated', currentData);
    });

    // Handle reset
    socket.on('reset_canvas', () => {
        currentData = JSON.parse(JSON.stringify(defaultData));
        saveData();
        io.emit('canvas_updated', currentData); // Update everyone including sender
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Access the canvas at http://localhost:${PORT}/infographic_left_handed_mice.html`);
});
