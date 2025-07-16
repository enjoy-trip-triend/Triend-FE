// utils/websocket.js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;

// websocket.js에 연결 후, 연결 상태를 리턴하게 수정
export function connectWebSocket(onScheduleUpdate, onEditorUpdate, onConnected) {
  stompClient = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/triend-websocket"),
    debug: (str) => console.log('[WebSocket] ', str),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('[WebSocket] Connected ✅');
      const plannerId = sessionStorage.getItem('plannerId');

      stompClient.subscribe('/user/queue/my-session-id', (msg) => {
        console.log('[WebSocket] My Session ID:', msg.body);
        const sessionId = msg.body;
        sessionStorage.setItem('mySessionId', sessionId);
        if (onConnected) onConnected(sessionId);
      });

      stompClient.subscribe(`/topic/planner/${plannerId}/schedule`, (msg) => {
        onScheduleUpdate(JSON.parse(msg.body));
      });

      stompClient.subscribe(`/topic/planner/${plannerId}/editors`, (msg) => {
        onEditorUpdate(JSON.parse(msg.body));
      });

      stompClient.publish({
        destination: '/app/planner/join',
        body: JSON.stringify({ plannerId: Number(plannerId) }),
      });
    },
    onWebSocketClose: (evt) => {
      console.warn('[❌ WebSocket Closed]', evt);
    },
    onStompError: (frame) => {
      console.error('[❌ STOMP ERROR]', frame);
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
