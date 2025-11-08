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
        console.log(latestSnapshot);

        try {
            // Find by our custom 'spaceId' and update the 'boardState' field
            await Space.findOneAndUpdate(
                { spaceId: spaceId },
                { boardState: latestSnapshot }
            );
            console.log(`[SOCKET] Saved board ${spaceId}`);
        } catch (err) {
            console.error(`[SOCKET] Failed to save board ${spaceId}:`, err);
        }
    }, SAVE_INTERVAL_MS);
}

export const setupSocketIO = (io) => {
    io.on("connection", (socket) => {
        console.log(`[SOCKET] User connected: ${socket.id}`);

        socket.on("join-room", (spaceId) => {
            socket.join(spaceId);
            console.log(`[SOCKET] User ${socket.id} joined room ${spaceId}`);
        });

        socket.on("shape-changes", (data) => {
            const { boardId, changes } = data;

            if (boardId && changes) {
                socket.to(boardId).emit("shape-broadcast", changes);
            }
        });

        socket.on("save-snapshot", (data) => {
            const { boardId, snapshot } = data;

            if (boardId && snapshot) {
                throttledSpaceSave(boardId, snapshot);
            }
        });


        /** THERE IS SOME BUG -will fix later */
        // socket.on("presence-update", (data) => {
        //     console.log("presence update");

        //     const { boardId, presence } = data;
        //     if (boardId) {
        //         console.log(data);
        //         socket.to(boardId).emit("presence-broadcast", { presence });
        //     }
        // });
        socket.on("send-message", async (data) => {
            const { boardId, message } = data;
            if (boardId && message) {
                try {
                    await Space.findOneAndUpdate(
                        { spaceId: boardId },
                        { $push: { messages: message } }
                    );
                    io.to(boardId).emit("receive-message", message);

                    console.log(`[Socket] Saved message for board ${boardId}`);
                } catch (err) {
                    console.error(`[Socket] Failed to save message for board ${boardId}:`, err);
                }
            }
        });
        socket.on("leave-room", (spaceId) => {
            socket.leave(spaceId);
            console.log(`[SOCKET] User ${socket.id} left room ${spaceId}`);
        });

        socket.on("disconnect", () => {
            console.log(`[SOCKET] User disconnected: ${socket.id}`);
        });
    });
};