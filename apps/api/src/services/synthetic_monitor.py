"""
Synthetic Monitoring Service
External monitoring and synthetic transaction testing
"""
import asyncio
import logging
import time
import uuid
import requests
import aiohttp
import ssl
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass
from urllib.parse import urlparse
import json

from src.models.monitoring_models import SyntheticCheck, SyntheticResult

logger = logging.getLogger(__name__)

@dataclass
class SyntheticResultData:
    """Synthetic monitoring result data"""
    status: str
    response_time: float
    status_code: Optional[int] = None
    error_message: Optional[str] = None
    content_checks: Optional[Dict[str, Any]] = None
    performance_metrics: Optional[Dict[str, Any]] = None
    ssl_info: Optional[Dict[str, Any]] = None
    dns_info: Optional[Dict[str, Any]] = None
    screenshot_path: Optional[str] = None

class SyntheticMonitor:
    """Synthetic monitoring and external transaction testing service"""
    
    def __init__(self):
        self.monitoring_enabled = True
        self.active_sessions = {}  # Track active monitoring sessions
        self.default_headers = {
            'User-Agent': 'Synthetic-Monitor/1.0 (System Monitoring Bot)'
        }
        
    def initialize(self):
        """Initialize synthetic monitoring"""
        # Schedule periodic check execution
        logger.info("Synthetic monitor initialized")
    
    def create_check(self, name: str, url: str, check_type: str = 'http',
                    frequency: int = 300, timeout: int = 30, expected_status: int = 200,
                    expected_content: str = None, headers: Dict = None,
                    authentication: Dict = None, method: str = 'GET',
                    payload: Dict = None, follow_redirects: bool = True) -> str:
        """Create a new synthetic monitoring check"""
        try:
            check_id = str(uuid.uuid4())
            
            check = SyntheticCheck(
                id=check_id,
                name=name,
                url=url,
                check_type=check_type,
                frequency=frequency,
                timeout=timeout,
                expected_status=expected_status,
                expected_content=expected_content,
                headers=headers or self.default_headers,
                authentication=authentication,
                status='active'
            )
            
            check.save()
            
            logger.info(f"Synthetic check created: {name} (ID: {check_id})")
            return check_id
            
        except Exception as e:
            logger.error(f"Failed to create synthetic check: {str(e)}")
            return None
    
    async def run_check_async(self, check_id: str) -> SyntheticResultData:
        """Run a synthetic check asynchronously"""
        try:
            check = SyntheticCheck.query.filter_by(id=check_id).first()
            if not check:
                return SyntheticResultData('error', 0, error_message='Check not found')
            
            start_time = time.time()
            
            if check.check_type in ['http', 'https']:
                result = await self._run_http_check(check)
            elif check.check_type == 'ping':
                result = await self._run_ping_check(check)
            elif check.check_type == 'tcp':
                result = await self._run_tcp_check(check)
            else:
                result = SyntheticResultData('error', 0, error_message=f'Unsupported check type: {check.check_type}')
            
            # Calculate response time
            result.response_time = (time.time() - start_time) * 1000  # Convert to milliseconds
            
            # Update check statistics
            await self._update_check_statistics(check_id, result)
            
            # Store result
            await self._store_result(check_id, result)
            
            logger.debug(f"Synthetic check completed: {check.name} - {result.status}")
            return result
            
        except Exception as e:
            logger.error(f"Failed to run synthetic check {check_id}: {str(e)}")
            return SyntheticResultData('error', 0, error_message=str(e))
    
    async def _run_http_check(self, check: SyntheticCheck) -> SyntheticResultData:
        """Run HTTP/HTTPS synthetic check"""
        try:
            # Prepare request parameters
            session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=check.timeout),
                headers=check.headers or self.default_headers
            )
            
            # Handle authentication
            auth = None
            if check.authentication:
                username = check.authentication.get('username')
                password = check.authentication.get('password')
                if username and password:
                    auth = aiohttp.BasicAuth(username, password)
            
            # Make request
            async with session.request(
                'GET',  # Default to GET, can be made configurable
                check.url,
                auth=auth,
                ssl=False  # Allow self-signed certificates for testing
            ) as response:
                content = await response.text()
                
                # Perform content checks
                content_checks = {}
                if check.expected_content:
                    content_checks['contains_expected'] = check.expected_content in content
                if check.expected_status:
                    content_checks['status_matches'] = response.status == check.expected_status
                
                # Get SSL information if HTTPS
                ssl_info = None
                if check.url.startswith('https://'):
                    ssl_info = await self._get_ssl_info(check.url)
                
                # Get performance metrics
                performance_metrics = {
                    'content_length': len(content),
                    'response_headers': dict(response.headers),
                    'final_url': str(response.url)
                }
                
                # Determine overall status
                status = 'success'
                if not content_checks.get('status_matches', True):
                    status = 'failure'
                elif check.expected_content and not content_checks.get('contains_expected', False):
                    status = 'failure'
                
                return SyntheticResultData(
                    status=status,
                    response_time=0,  # Will be set by caller
                    status_code=response.status,
                    content_checks=content_checks,
                    performance_metrics=performance_metrics,
                    ssl_info=ssl_info
                )
                
        except asyncio.TimeoutError:
            return SyntheticResultData('timeout', 0, error_message='Request timeout')
        except Exception as e:
            return SyntheticResultData('error', 0, error_message=str(e))
        finally:
            if 'session' in locals():
                await session.close()
    
    async def _run_ping_check(self, check: SyntheticCheck) -> SyntheticResultData:
        """Run ping synthetic check"""
        try:
            # Extract hostname from URL
            parsed_url = urlparse(check.url)
            hostname = parsed_url.hostname or check.url
            
            # Use subprocess to ping (Unix systems)
            import subprocess
            
            try:
                # Try different ping commands based on OS
                if hasattr(subprocess, 'run'):
                    # Modern Python (3.5+)
                    result = subprocess.run(
                        ['ping', '-c', '1', '-W', str(check.timeout), hostname],
                        capture_output=True,
                        text=True,
                        timeout=check.timeout + 5
                    )
                    success = result.returncode == 0
                else:
                    # Fallback for older Python
                    result = subprocess.check_output(
                        ['ping', '-c', '1', hostname],
                        timeout=check.timeout
                    )
                    success = True
                
                if success:
                    return SyntheticResultData('success', 0, status_code=200)
                else:
                    return SyntheticResultData('failure', 0, error_message='Ping failed')
                    
            except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError) as e:
                return SyntheticResultData('error', 0, error_message=f'Ping command failed: {str(e)}')
                
        except Exception as e:
            return SyntheticResultData('error', 0, error_message=str(e))
    
    async def _run_tcp_check(self, check: SyntheticCheck) -> SyntheticResultData:
        """Run TCP port check"""
        try:
            parsed_url = urlparse(check.url)
            hostname = parsed_url.hostname
            port = parsed_url.port or (443 if parsed_url.scheme == 'https' else 80)
            
            # Use asyncio to check TCP connection
            try:
                reader, writer = await asyncio.wait_for(
                    asyncio.open_connection(hostname, port),
                    timeout=check.timeout
                )
                
                # Close connection
                writer.close()
                await writer.wait_closed()
                
                return SyntheticResultData('success', 0, status_code=200)
                
            except asyncio.TimeoutError:
                return SyntheticResultData('timeout', 0, error_message='TCP connection timeout')
            except ConnectionRefusedError:
                return SyntheticResultData('failure', 0, error_message='Connection refused')
            except Exception as e:
                return SyntheticResultData('error', 0, error_message=str(e))
                
        except Exception as e:
            return SyntheticResultData('error', 0, error_message=str(e))
    
    async def _get_ssl_info(self, url: str) -> Dict[str, Any]:
        """Get SSL certificate information"""
        try:
            import ssl
            import socket
            from urllib.parse import urlparse
            
            parsed = urlparse(url)
            hostname = parsed.hostname
            port = parsed.port or 443
            
            # Create SSL context
            context = ssl.create_default_context()
            
            # Get certificate
            with socket.create_connection((hostname, port), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    
                    return {
                        'subject': dict(x[0] for x in cert['subject']),
                        'issuer': dict(x[0] for x in cert['issuer']),
                        'version': cert['version'],
                        'serial_number': cert['serialNumber'],
                        'not_before': cert['notBefore'],
                        'not_after': cert['notAfter'],
                        'san': cert.get('subjectAltName', [])
                    }
                    
        except Exception as e:
            return {'error': str(e)}
    
    async def _update_check_statistics(self, check_id: str, result: SyntheticResultData):
        """Update check statistics"""
        try:
            check = SyntheticCheck.query.filter_by(id=check_id).first()
            if not check:
                return
            
            # Update timing
            check.last_run = datetime.utcnow()
            check.next_run = datetime.utcnow() + timedelta(seconds=check.frequency)
            
            # Get recent results for statistics
            recent_results = SyntheticResult.query.filter_by(check_id=check_id)\
                .order_by(SyntheticResult.timestamp.desc()).limit(100).all()
            
            # Update success rate
            if recent_results:
                success_count = sum(1 for r in recent_results if r.status == 'success')
                check.success_rate = (success_count / len(recent_results)) * 100
                
                # Update average response time
                valid_times = [r.response_time for r in recent_results if r.response_time]
                if valid_times:
                    check.avg_response_time = sum(valid_times) / len(valid_times)
            else:
                # First result
                check.success_rate = 100.0 if result.status == 'success' else 0.0
                check.avg_response_time = result.response_time
            
            check.save()
            
        except Exception as e:
            logger.error(f"Failed to update check statistics: {str(e)}")
    
    async def _store_result(self, check_id: str, result: SyntheticResultData):
        """Store synthetic monitoring result"""
        try:
            result_record = SyntheticResult(
                check_id=check_id,
                status=result.status,
                response_time=result.response_time,
                status_code=result.status_code,
                error_message=result.error_message,
                content_checks=result.content_checks,
                performance_metrics=result.performance_metrics,
                screenshot_path=result.screenshot_path
            )
            
            result_record.save()
            
        except Exception as e:
            logger.error(f"Failed to store synthetic result: {str(e)}")
    
    async def run_due_checks(self):
        """Run all due synthetic checks"""
        try:
            due_checks = SyntheticCheck.query.filter(
                SyntheticCheck.status == 'active',
                SyntheticCheck.next_run <= datetime.utcnow()
            ).all()
            
            # Run checks concurrently with a semaphore to limit concurrency
            semaphore = asyncio.Semaphore(10)  # Max 10 concurrent checks
            
            async def run_check_with_semaphore(check):
                async with semaphore:
                    return await self.run_check_async(check.id)
            
            tasks = [run_check_with_semaphore(check) for check in due_checks]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            successful_runs = sum(1 for r in results if not isinstance(r, Exception))
            logger.info(f"Completed {successful_runs}/{len(due_checks)} synthetic checks")
            
        except Exception as e:
            logger.error(f"Failed to run due checks: {str(e)}")
    
    def get_check_status(self, check_id: str) -> Dict[str, Any]:
        """Get status of a specific check"""
        try:
            check = SyntheticCheck.query.filter_by(id=check_id).first()
            if not check:
                return {'error': 'Check not found'}
            
            # Get recent results
            recent_results = SyntheticResult.query.filter_by(check_id=check_id)\
                .order_by(SyntheticResult.timestamp.desc()).limit(10).all()
            
            return {
                'check': check.to_dict(),
                'recent_results': [r.to_dict() for r in recent_results],
                'statistics': {
                    'success_rate': check.success_rate,
                    'avg_response_time': check.avg_response_time,
                    'total_runs': SyntheticResult.query.filter_by(check_id=check_id).count(),
                    'last_run': check.last_run.isoformat() if check.last_run else None,
                    'next_run': check.next_run.isoformat() if check.next_run else None
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get check status: {str(e)}")
            return {'error': str(e)}
    
    def get_all_checks_status(self) -> List[Dict[str, Any]]:
        """Get status of all synthetic checks"""
        try:
            checks = SyntheticCheck.query.all()
            status_list = []
            
            for check in checks:
                status = self.get_check_status(check.id)
                if 'error' not in status:
                    status_list.append(status)
            
            return status_list
            
        except Exception as e:
            logger.error(f"Failed to get all checks status: {str(e)}")
            return []
    
    def get_global_synthetic_metrics(self) -> Dict[str, Any]:
        """Get global synthetic monitoring metrics"""
        try:
            # Get all checks
            all_checks = SyntheticCheck.query.all()
            
            # Calculate metrics
            total_checks = len(all_checks)
            active_checks = len([c for c in all_checks if c.status == 'active'])
            
            if total_checks > 0:
                avg_success_rate = sum(c.success_rate or 0 for c in all_checks) / total_checks
                avg_response_time = sum(c.avg_response_time or 0 for c in all_checks if c.avg_response_time) / max(1, len([c for c in all_checks if c.avg_response_time]))
            else:
                avg_success_rate = 0
                avg_response_time = 0
            
            # Get recent results
            recent_results = SyntheticResult.query.filter(
                SyntheticResult.timestamp >= datetime.utcnow() - timedelta(hours=1)
            ).all()
            
            results_by_status = {}
            for result in recent_results:
                status = result.status
                results_by_status[status] = results_by_status.get(status, 0) + 1
            
            return {
                'total_checks': total_checks,
                'active_checks': active_checks,
                'avg_success_rate': round(avg_success_rate, 2),
                'avg_response_time': round(avg_response_time, 2),
                'recent_results_count': len(recent_results),
                'results_by_status': results_by_status,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get global synthetic metrics: {str(e)}")
            return {
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def create_user_journey_check(self, name: str, steps: List[Dict[str, Any]], 
                                frequency: int = 900, timeout: int = 60) -> str:
        """Create a multi-step user journey synthetic check"""
        try:
            # Store journey steps as metadata
            journey_data = {
                'type': 'user_journey',
                'steps': steps,
                'timeout': timeout
            }
            
            # For simplicity, create as HTTP check with journey URL
            journey_url = f"journey://{name}"
            
            check_id = self.create_check(
                name=name,
                url=journey_url,
                check_type='user_journey',
                frequency=frequency,
                timeout=timeout,
                headers={'X-Journey-Simulation': 'true'},
                authentication={'journey_data': json.dumps(journey_data)}
            )
            
            logger.info(f"User journey check created: {name} (ID: {check_id})")
            return check_id
            
        except Exception as e:
            logger.error(f"Failed to create user journey check: {str(e)}")
            return None
    
    async def run_user_journey(self, check_id: str) -> SyntheticResultData:
        """Run a user journey synthetic check"""
        try:
            check = SyntheticCheck.query.filter_by(id=check_id).first()
            if not check or not check.authentication or 'journey_data' not in check.authentication:
                return SyntheticResultData('error', 0, error_message='Invalid user journey check')
            
            journey_data = json.loads(check.authentication['journey_data'])
            steps = journey_data.get('steps', [])
            
            start_time = time.time()
            step_results = []
            total_response_time = 0
            
            for i, step in enumerate(steps):
                step_start = time.time()
                step_result = await self._run_journey_step(step, i + 1)
                step_time = (time.time() - step_start) * 1000
                
                step_results.append({
                    'step': i + 1,
                    'action': step.get('action', 'unknown'),
                    'url': step.get('url', ''),
                    'status': step_result.status,
                    'response_time': step_time,
                    'error': step_result.error_message
                })
                
                total_response_time += step_time
                
                # If any step fails, the journey fails
                if step_result.status != 'success':
                    break
            
            # Determine overall status
            overall_status = 'success'
            failed_steps = [s for s in step_results if s['status'] != 'success']
            if failed_steps:
                overall_status = 'failure'
            
            performance_metrics = {
                'total_steps': len(steps),
                'successful_steps': len(steps) - len(failed_steps),
                'step_results': step_results,
                'total_journey_time': total_response_time
            }
            
            return SyntheticResultData(
                status=overall_status,
                response_time=total_response_time,
                performance_metrics=performance_metrics
            )
            
        except Exception as e:
            logger.error(f"Failed to run user journey: {str(e)}")
            return SyntheticResultData('error', 0, error_message=str(e))
    
    async def _run_journey_step(self, step: Dict[str, Any], step_number: int) -> SyntheticResultData:
        """Run a single step in a user journey"""
        try:
            action = step.get('action', 'navigate')
            url = step.get('url', '')
            wait_time = step.get('wait', 1000) / 1000  # Convert to seconds
            
            if action == 'navigate':
                # Simple navigation check
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, timeout=30) as response:
                        await asyncio.sleep(wait_time)  # Wait for page to load
                        return SyntheticResultData('success', 0, status_code=response.status)
            
            elif action == 'click':
                # For clicks, we just validate the target URL exists
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, timeout=30) as response:
                        return SyntheticResultData('success', 0, status_code=response.status)
            
            elif action == 'wait':
                # Just wait
                await asyncio.sleep(wait_time)
                return SyntheticResultData('success', 0, status_code=200)
            
            else:
                return SyntheticResultData('error', 0, error_message=f'Unknown action: {action}')
                
        except Exception as e:
            return SyntheticResultData('error', 0, error_message=str(e))

# Global synthetic monitor instance
synthetic_monitor = SyntheticMonitor()

def get_synthetic_monitor() -> SyntheticMonitor:
    """Get the global synthetic monitor instance"""
    return synthetic_monitor