import Space from "../models/space.model.js";

// --- Throttled Save Logic (This part is correct) ---
const saveQueue = new Map();
const SAVE_INTERVAL_MS = 3000; // Save every 3 seconds

async function throttledSpaceSave(spaceId, snapshot) {
    // If a save is already scheduled, just update the snapshot
    if (saveQueue.has(spaceId)) {
        saveQueue.set(spaceId, snapshot);
        return;
    }

    // Set the snapshot and schedule the save
    saveQueue.set(spaceId, snapshot);

    setTimeout(async () => {
        const latestSnapshot = saveQueue.get(spaceId);
        saveQueue.delete(spaceId); // Clear the queue

        try {
            // Find by our custom 'spaceId' and update the 'boardState' field
            await Space.findOneAndUpdate(
                { spaceId: spaceId },
                { boardState: latestSnapshot }
            );
            console.log(`[Socket] Saved board ${spaceId}`);
        } catch (err) {
            console.error(`[Socket] Failed to save board ${spaceId}:`, err);
        }
    }, SAVE_INTERVAL_MS);
}

export const setupSocketIO = (io) => {
    io.on("connection", (socket) => {
        console.log(`[Socket] User connected: ${socket.id}`);

        socket.on("join-room", (spaceId) => {
            socket.join(spaceId);
            console.log(`[Socket] User ${socket.id} joined room ${spaceId}`);
        });

        // --- FIX 1: Correctly handle 'shape-changes' for real-time sync ---
        socket.on("shape-changes", (data) => {
            // Client sends { boardId, changes }
            const { boardId, changes } = data; // <-- Changed from 'snapshot' to 'changes'

            if (boardId && changes) {
                // Broadcast the 'changes' object, not a snapshot object
                // The client listener 'handleShapeBroadcast' expects this diff object
                socket.to(boardId).emit("shape-broadcast", changes);
            }

            // --- REMOVED saving logic from here ---
        });

        // --- FIX 2: Add the missing listener for 'save-snapshot' ---
        socket.on("save-snapshot", (data) => {
            // Client sends { boardId, snapshot }
            const { boardId, snapshot } = data;

            if (boardId && snapshot) {
                // Now we call the throttled save function
                throttledSpaceSave(boardId, snapshot);
            }
        });


        // --- This presence handler was already correct ---
        socket.on("presence-update", (data) => {
            const { boardId, presence } = data;
            if (boardId) {
                socket.to(boardId).emit("presence-broadcast", { presence });
            }
        });

        socket.on("leave-room", (spaceId) => {
            socket.leave(spaceId);
            console.log(`[Socket] User ${socket.id} left room ${spaceId}`);
        });

        socket.on("disconnect", () => {
            console.log(`[Socket] User disconnected: ${socket.id}`);
        });
    });
};