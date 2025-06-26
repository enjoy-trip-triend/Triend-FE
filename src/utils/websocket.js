// utils/websocket.js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;

export function connectWebSocket(onScheduleUpdate, onEditorUpdate) {
  stompClient = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/triend-websocket'),
    debug: (str) => console.log('[WebSocket] ', str),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('[WebSocket] Connected');

      const plannerId = sessionStorage.getItem('plannerId');

      // 구독
      stompClient.subscribe(`/topic/planner/${plannerId}/schedule`, (msg) => {
        onScheduleUpdate(JSON.parse(msg.body));
      });

      stompClient.subscribe(`/topic/planner/${plannerId}/editors`, (msg) => {
        onEditorUpdate(JSON.parse(msg.body));
      });

      // 참여 요청
      stompClient.publish({
        destination: '/app/planner/join',
        body: JSON.stringify({ plannerId: Number(plannerId)}),
      });
    },
  });

  stompClient.activate();
}

export function sendScheduleUpdate(scheduleMessage) {
  stompClient.publish({
    destination: '/app/planner/schedule',
    body: JSON.stringify({
      ...scheduleMessage,
      action: 'UPDATE'
    }),
  });
}

export function sendScheduleDelete(scheduleId, plannerId) {
  stompClient.publish({
    destination: '/app/planner/schedule',
    body: JSON.stringify({
      plannerId: plannerId,
      scheduleId: scheduleId,
      action: 'DELETE'
    }),
  });
}

export function disconnectWebSocket() {
  if (stompClient) stompClient.deactivate();
}
