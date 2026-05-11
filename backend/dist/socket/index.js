"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        // Page Events
        socket.on('join-page', (pageId) => {
            socket.join(pageId);
            console.log(`Socket ${socket.id} joined page ${pageId}`);
        });
        socket.on('leave-page', (pageId) => {
            socket.leave(pageId);
            console.log(`Socket ${socket.id} left page ${pageId}`);
            socket.to(pageId).emit('user-left', socket.id);
        });
        socket.on('cursor-move', (data) => {
            socket.to(data.pageId).emit('cursor-updated', {
                userId: socket.id,
                userName: data.userName,
                x: data.x,
                y: data.y
            });
        });
        socket.on('update-page', (data) => {
            socket.to(data.pageId).emit('page-updated', data.content);
        });
        // Drawing Events
        socket.on('join-drawing', (roomName) => __awaiter(void 0, void 0, void 0, function* () {
            const existingUsers = yield io.in(roomName).fetchSockets();
            socket.join(roomName);
            console.log(`Socket ${socket.id} joined drawing room ${roomName}`);
            // If there are other users, request state from one of them
            if (existingUsers.length > 0) {
                const firstUser = existingUsers[0].id;
                io.to(firstUser).emit('request-canvas-state', socket.id);
            }
        }));
        socket.on('leave-drawing', (roomName) => {
            socket.leave(roomName);
            console.log(`Socket ${socket.id} left drawing room ${roomName}`);
        });
        socket.on('canvas-state-sent', (data) => {
            io.to(data.targetId).emit('canvas-state-received', data.state);
        });
        socket.on('draw-stroke', (data) => {
            socket.to(data.roomName).emit('stroke-received', data);
        });
        socket.on('clear-drawing', (roomName) => {
            socket.to(roomName).emit('drawing-cleared');
        });
        // Chat Events
        socket.on('join-chat', (roomId) => {
            socket.join(`chat-room-${roomId}`);
            console.log(`Socket ${socket.id} joined chat room ${roomId}`);
        });
        socket.on('leave-chat', (roomId) => {
            socket.leave(`chat-room-${roomId}`);
            console.log(`Socket ${socket.id} left chat room ${roomId}`);
        });
        // Kanban Events
        socket.on('join-kanban', (boardId) => {
            socket.join(`kanban-${boardId}`);
            console.log(`Socket ${socket.id} joined kanban board ${boardId}`);
        });
        socket.on('leave-kanban', (boardId) => {
            socket.leave(`kanban-${boardId}`);
            console.log(`Socket ${socket.id} left kanban board ${boardId}`);
        });
        socket.on('update-kanban', (boardId) => {
            socket.to(`kanban-${boardId}`).emit('kanban-updated');
        });
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
exports.setupSocket = setupSocket;
