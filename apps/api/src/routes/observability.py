"""
Agent Observability API Routes
Real-time monitoring and observability endpoints for agent activities
"""
from flask import Blueprint, request, jsonify
from flask_socketio import emit
import asyncio
import logging
from datetime import datetime, UTC
from src.models.agent_observability import (
    get_agent_observer, 
    AgentEvent, 
    AgentEventType,
    log_agent_event
)

logger = logging.getLogger(__name__)

observability_bp = Blueprint('observability', __name__)

@observability_bp.route('/metrics', methods=['GET'])
def get_observability_metrics():
    """Get overall observability metrics"""
    try:
        observer = get_agent_observer()
        metrics = observer.get_metrics()
        
        return jsonify({
            'success': True,
            'metrics': metrics,
            'timestamp': datetime.now(UTC).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting observability metrics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@observability_bp.route('/traces/active', methods=['GET'])
def get_active_traces():
    """Get all currently active agent traces"""
    try:
        observer = get_agent_observer()
        traces = observer.get_active_traces()
        
        return jsonify({
            'success': True,
            'traces': traces,
            'count': len(traces),
            'timestamp': datetime.now(UTC).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting active traces: {str(e)}")
        return jsonify({'error': str(e)}), 500

@observability_bp.route('/traces/completed', methods=['GET'])
def get_completed_traces():
    """Get recently completed agent traces"""
    try:
        limit = request.args.get('limit', 50, type=int)
        observer = get_agent_observer()
        traces = observer.get_completed_traces(limit)
        
        return jsonify({
            'success': True,
            'traces': traces,
            'count': len(traces),
            'limit': limit,
            'timestamp': datetime.now(UTC).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting completed traces: {str(e)}")
        return jsonify({'error': str(e)}), 500

@observability_bp.route('/traces/<trace_id>', methods=['GET'])
def get_trace_details(trace_id):
    """Get detailed information about a specific trace"""
    try:
        observer = get_agent_observer()
        trace = observer.get_trace_by_id(trace_id)
        
        if not trace:
            return jsonify({'error': 'Trace not found'}), 404
        
        return jsonify({
            'success': True,
            'trace': trace,
            'timestamp': datetime.now(UTC).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting trace {trace_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@observability_bp.route('/events/agent/<agent_id>', methods=['GET'])
def get_agent_events(agent_id):
    """Get recent events for a specific agent"""
    try:
        limit = request.args.get('limit', 100, type=int)
        observer = get_agent_observer()
        events = observer.get_agent_events(agent_id, limit)
        
        return jsonify({
            'success': True,
            'events': events,
            'agent_id': agent_id,
            'count': len(events),
            'limit': limit,
            'timestamp': datetime.now(UTC).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting events for agent {agent_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@observability_bp.route('/events/task/<task_id>', methods=['GET'])
def get_task_events(task_id):
    """Get all events for a specific task"""
    try:
        observer = get_agent_observer()
        events = observer.get_task_events(task_id)
        
        return jsonify({
            'success': True,
            'events': events,
            'task_id': task_id,
            'count': len(events),
            'timestamp': datetime.now(UTC).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting events for task {task_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@observability_bp.route('/events/stream', methods=['GET'])
def get_event_stream():
    """Get real-time event stream (long polling)"""
    try:
        since = request.args.get('since', type=float)
        event_types = request.args.getlist('event_types')
        agent_id = request.args.get('agent_id')
        task_id = request.args.get('task_id')
        
        observer = get_agent_observer()
        
        # Get recent events
        all_events = []
        
        # Collect from active traces
        for trace in observer.active_traces.values():
            if agent_id and trace.agent_id != agent_id:
                continue
            if task_id and trace.task_id != task_id:
                continue
            all_events.extend(trace.events)
        
        # Collect from completed traces
        for trace in observer.completed_traces[-10:]:  # Last 10 completed traces
            if agent_id and trace.agent_id != agent_id:
                continue
            if task_id and trace.task_id != task_id:
                continue
            all_events.extend(trace.events)
        
        # Filter by timestamp and event types
        filtered_events = []
        for event in all_events:
            if since and event.timestamp <= since:
                continue
            if event_types and event.event_type.value not in event_types:
                continue
            filtered_events.append(event.to_dict())
        
        # Sort by timestamp
        filtered_events.sort(key=lambda e: e['timestamp'], reverse=True)
        
        return jsonify({
            'success': True,
            'events': filtered_events[:100],  # Limit to 100 events
            'count': len(filtered_events),
            'timestamp': datetime.now(UTC).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting event stream: {str(e)}")
        return jsonify({'error': str(e)}), 500

@observability_bp.route('/events/log', methods=['POST'])
def log_custom_event():
    """Log a custom agent event"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        # Validate required fields
        required_fields = ['event_type', 'message', 'agent_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Field {field} is required'}), 400
        
        # Validate event type
        try:
            event_type = AgentEventType(data['event_type'])
        except ValueError:
            valid_types = [e.value for e in AgentEventType]
            return jsonify({
                'error': f'Invalid event_type. Valid types: {valid_types}'
            }), 400
        
        # Run async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        async def _log_event():
            await log_agent_event(
                event_type=event_type,
                message=data['message'],
                agent_id=data['agent_id'],
                task_id=data.get('task_id', ''),
                step_id=data.get('step_id', ''),
                data=data.get('data', {}),
                duration_ms=data.get('duration_ms'),
                success=data.get('success', True)
            )
        
        loop.run_until_complete(_log_event())
        loop.close()
        
        return jsonify({
            'success': True,
            'message': 'Event logged successfully',
            'timestamp': datetime.now(UTC).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error logging custom event: {str(e)}")
        return jsonify({'error': str(e)}), 500

@observability_bp.route('/health', methods=['GET'])
def observability_health():
    """Health check for observability system"""
    try:
        observer = get_agent_observer()
        metrics = observer.get_metrics()
        
        return jsonify({
            'status': 'healthy',
            'active_traces': metrics['active_traces'],
            'completed_traces': metrics['completed_traces'],
            'total_events': metrics['total_events'],
            'timestamp': datetime.now(UTC).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error checking observability health: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now(UTC).isoformat()
        }), 500

# WebSocket event handlers for real-time updates
def setup_websocket_handlers(socketio):
    """Setup WebSocket handlers for real-time observability"""
    
    @socketio.on('subscribe_agent_events')
    def handle_subscribe_agent_events(data):
        """Subscribe to real-time agent events"""
        agent_id = data.get('agent_id')
        task_id = data.get('task_id')
        event_types = data.get('event_types', [])
        
        logger.info(f"Client subscribed to agent events: agent_id={agent_id}, task_id={task_id}")
        
        # Add client to appropriate rooms
        if agent_id:
            socketio.join_room(f'agent_{agent_id}')
        if task_id:
            socketio.join_room(f'task_{task_id}')
        if not agent_id and not task_id:
            socketio.join_room('all_events')
        
        emit('subscription_confirmed', {
            'agent_id': agent_id,
            'task_id': task_id,
            'event_types': event_types,
            'timestamp': datetime.now(UTC).isoformat()
        })
    
    @socketio.on('unsubscribe_agent_events')
    def handle_unsubscribe_agent_events(data):
        """Unsubscribe from real-time agent events"""
        agent_id = data.get('agent_id')
        task_id = data.get('task_id')
        
        logger.info(f"Client unsubscribed from agent events: agent_id={agent_id}, task_id={task_id}")
        
        # Remove client from rooms
        if agent_id:
            socketio.leave_room(f'agent_{agent_id}')
        if task_id:
            socketio.leave_room(f'task_{task_id}')
        socketio.leave_room('all_events')
        
        emit('unsubscription_confirmed', {
            'agent_id': agent_id,
            'task_id': task_id,
            'timestamp': datetime.now(UTC).isoformat()
        })
    
    def broadcast_agent_event(event: AgentEvent):
        """Broadcast agent event to subscribed clients"""
        event_data = event.to_dict()
        
        # Broadcast to all events room
        socketio.emit('agent_event', event_data, room='all_events')
        
        # Broadcast to agent-specific room
        if event.agent_id:
            socketio.emit('agent_event', event_data, room=f'agent_{event.agent_id}')
        
        # Broadcast to task-specific room
        if event.task_id:
            socketio.emit('agent_event', event_data, room=f'task_{event.task_id}')
    
    # Register event listener with observer
    observer = get_agent_observer()
    observer.add_event_listener(broadcast_agent_event)
    
    return socketio