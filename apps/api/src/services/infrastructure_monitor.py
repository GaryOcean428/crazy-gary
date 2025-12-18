"""
Infrastructure Monitoring Service
System-level monitoring for CPU, memory, disk, network, and processes
"""
import asyncio
import logging
import time
import psutil
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass
from flask import Flask

from src.models.monitoring_models import MonitoringMetric, HealthCheck

logger = logging.getLogger(__name__)

@dataclass
class SystemMetrics:
    """Container for system metrics"""
    cpu_percent: float
    memory_percent: float
    memory_available: float
    disk_percent: float
    disk_free: float
    network_bytes_sent: int
    network_bytes_recv: int
    process_count: int
    load_average: Optional[List[float]] = None
    boot_time: Optional[float] = None

@dataclass
class ProcessInfo:
    """Process information container"""
    pid: int
    name: str
    cpu_percent: float
    memory_percent: float
    memory_mb: float
    status: str
    create_time: float
    num_threads: int

class InfrastructureMonitor:
    """Infrastructure monitoring and alerting service"""
    
    def __init__(self, app: Flask = None):
        self.app = app
        self.monitoring_enabled = True
        self.baseline_metrics = {}
        self.alert_thresholds = {
            'cpu_percent': {'warning': 70, 'critical': 90},
            'memory_percent': {'warning': 80, 'critical': 95},
            'disk_percent': {'warning': 80, 'critical': 90},
            'process_count': {'warning': 1000, 'critical': 2000},
            'load_average': {'warning': 2.0, 'critical': 5.0}
        }
        self.performance_baselines = {}
        
    def initialize(self, app: Flask):
        """Initialize infrastructure monitoring"""
        self.app = app
        
        # Start background monitoring
        if self.app:
            self._start_background_monitoring()
        
        # Establish performance baselines
        asyncio.create_task(self._establish_baselines())
        
        logger.info("Infrastructure monitor initialized")
    
    def _start_background_monitoring(self):
        """Start background infrastructure monitoring"""
        if not self.app:
            return
        
        with self.app.app_context():
            # Collect metrics every 30 seconds
            self.app.scheduler.add_job(
                func=self.collect_all_metrics,
                trigger="interval",
                seconds=30,
                id="infrastructure_metrics"
            )
            
            # Check thresholds every 60 seconds
            self.app.scheduler.add_job(
                func=self.check_infrastructure_alerts,
                trigger="interval",
                seconds=60,
                id="infrastructure_alerts"
            )
            
            # Monitor top processes every 2 minutes
            self.app.scheduler.add_job(
                func=self.monitor_top_processes,
                trigger="interval",
                seconds=120,
                id="process_monitoring"
            )
            
            # Health check infrastructure services every 5 minutes
            self.app.scheduler.add_job(
                func=self.check_infrastructure_health,
                trigger="interval",
                seconds=300,
                id="infrastructure_health"
            )
    
    async def _establish_baselines(self):
        """Establish performance baselines"""
        try:
            logger.info("Establishing infrastructure performance baselines...")
            
            # Collect baseline metrics over 5 minutes
            baseline_data = []
            start_time = time.time()
            
            while time.time() - start_time < 300:  # 5 minutes
                metrics = self.get_current_metrics()
                baseline_data.append(metrics)
                await asyncio.sleep(30)  # Collect every 30 seconds
            
            # Calculate baselines
            if baseline_data:
                self.performance_baselines = {
                    'cpu_percent': self._calculate_percentile(baseline_data, 'cpu_percent', 95),
                    'memory_percent': self._calculate_percentile(baseline_data, 'memory_percent', 95),
                    'disk_percent': self._calculate_percentile(baseline_data, 'disk_percent', 95),
                    'load_average': self._calculate_percentile(baseline_data, 'load_average', 95),
                    'process_count': self._calculate_percentile(baseline_data, 'process_count', 95),
                    'established_at': datetime.utcnow().isoformat()
                }
                
                logger.info(f"Performance baselines established: {self.performance_baselines}")
            
        except Exception as e:
            logger.error(f"Failed to establish baselines: {str(e)}")
    
    def _calculate_percentile(self, data: List[SystemMetrics], field: str, percentile: int) -> float:
        """Calculate percentile for a metric"""
        values = [getattr(metric, field) for metric in data if getattr(metric, field) is not None]
        if not values:
            return 0.0
        
        values.sort()
        index = int(len(values) * percentile / 100)
        return values[min(index, len(values) - 1)]
    
    def collect_all_metrics(self):
        """Collect all infrastructure metrics"""
        try:
            metrics = self.get_current_metrics()
            
            # Store each metric
            self._store_metric('system.cpu.usage', 'gauge', metrics.cpu_percent, {'host': 'local'})
            self._store_metric('system.memory.usage', 'gauge', metrics.memory_percent, {'host': 'local'})
            self._store_metric('system.memory.available', 'gauge', metrics.memory_available, {'host': 'local'})
            self._store_metric('system.disk.usage', 'gauge', metrics.disk_percent, {'host': 'local', 'mount': '/'})
            self._store_metric('system.disk.free', 'gauge', metrics.disk_free, {'host': 'local', 'mount': '/'})
            self._store_metric('system.network.bytes_sent', 'counter', metrics.network_bytes_sent, {'host': 'local'})
            self._store_metric('system.network.bytes_recv', 'counter', metrics.network_bytes_recv, {'host': 'local'})
            self._store_metric('system.processes.count', 'gauge', metrics.process_count, {'host': 'local'})
            
            if metrics.load_average:
                self._store_metric('system.load.average', 'gauge', metrics.load_average[0], {'host': 'local', 'period': '1min'})
                if len(metrics.load_average) > 1:
                    self._store_metric('system.load.average', 'gauge', metrics.load_average[1], {'host': 'local', 'period': '5min'})
                if len(metrics.load_average) > 2:
                    self._store_metric('system.load.average', 'gauge', metrics.load_average[2], {'host': 'local', 'period': '15min'})
            
            # Store boot time if available
            if metrics.boot_time:
                self._store_metric('system.boot.time', 'gauge', metrics.boot_time, {'host': 'local'})
            
            logger.debug("Infrastructure metrics collected successfully")
            
        except Exception as e:
            logger.error(f"Failed to collect infrastructure metrics: {str(e)}")
    
    def get_current_metrics(self) -> SystemMetrics:
        """Get current system metrics"""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            
            # Memory metrics
            memory = psutil.virtual_memory()
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            
            # Network metrics
            network = psutil.net_io_counters()
            
            # Process count
            process_count = len(psutil.pids())
            
            # Load average (Unix systems only)
            load_average = None
            try:
                load_average = psutil.getloadavg()
            except AttributeError:
                # Windows systems don't have load average
                pass
            
            # Boot time
            boot_time = None
            try:
                boot_time = psutil.boot_time()
            except AttributeError:
                pass
            
            return SystemMetrics(
                cpu_percent=cpu_percent,
                memory_percent=memory.percent,
                memory_available=memory.available,
                disk_percent=(disk.used / disk.total) * 100,
                disk_free=disk.free,
                network_bytes_sent=network.bytes_sent,
                network_bytes_recv=network.bytes_recv,
                process_count=process_count,
                load_average=load_average,
                boot_time=boot_time
            )
            
        except Exception as e:
            logger.error(f"Failed to get current metrics: {str(e)}")
            return SystemMetrics(0, 0, 0, 0, 0, 0, 0, 0)
    
    def _store_metric(self, name: str, metric_type: str, value: float, tags: Dict = None):
        """Store a metric in the database"""
        try:
            metric = MonitoringMetric(
                metric_name=name,
                metric_type=metric_type,
                value=value,
                timestamp=datetime.utcnow(),
                tags=tags or {},
                source='infrastructure_monitor',
                metadata={'collection_method': 'psutil'}
            )
            
            metric.save()
            
        except Exception as e:
            logger.error(f"Failed to store metric {name}: {str(e)}")
    
    def check_infrastructure_alerts(self):
        """Check infrastructure metrics against thresholds"""
        try:
            metrics = self.get_current_metrics()
            
            # Check CPU usage
            if metrics.cpu_percent > self.alert_thresholds['cpu_percent']['critical']:
                self._create_alert(
                    'High CPU Usage (Critical)',
                    f'CPU usage is at {metrics.cpu_percent:.1f}%, exceeding critical threshold of {self.alert_thresholds["cpu_percent"]["critical"]}%',
                    'critical',
                    'system.cpu.usage',
                    self.alert_thresholds['cpu_percent']['critical'],
                    metrics.cpu_percent
                )
            elif metrics.cpu_percent > self.alert_thresholds['cpu_percent']['warning']:
                self._create_alert(
                    'High CPU Usage (Warning)',
                    f'CPU usage is at {metrics.cpu_percent:.1f}%, exceeding warning threshold of {self.alert_thresholds["cpu_percent"]["warning"]}%',
                    'high',
                    'system.cpu.usage',
                    self.alert_thresholds['cpu_percent']['warning'],
                    metrics.cpu_percent
                )
            
            # Check memory usage
            if metrics.memory_percent > self.alert_thresholds['memory_percent']['critical']:
                self._create_alert(
                    'High Memory Usage (Critical)',
                    f'Memory usage is at {metrics.memory_percent:.1f}%, exceeding critical threshold of {self.alert_thresholds["memory_percent"]["critical"]}%',
                    'critical',
                    'system.memory.usage',
                    self.alert_thresholds['memory_percent']['critical'],
                    metrics.memory_percent
                )
            elif metrics.memory_percent > self.alert_thresholds['memory_percent']['warning']:
                self._create_alert(
                    'High Memory Usage (Warning)',
                    f'Memory usage is at {metrics.memory_percent:.1f}%, exceeding warning threshold of {self.alert_thresholds["memory_percent"]["warning"]}%',
                    'high',
                    'system.memory.usage',
                    self.alert_thresholds['memory_percent']['warning'],
                    metrics.memory_percent
                )
            
            # Check disk usage
            if metrics.disk_percent > self.alert_thresholds['disk_percent']['critical']:
                self._create_alert(
                    'High Disk Usage (Critical)',
                    f'Disk usage is at {metrics.disk_percent:.1f}%, exceeding critical threshold of {self.alert_thresholds["disk_percent"]["critical"]}%',
                    'critical',
                    'system.disk.usage',
                    self.alert_thresholds['disk_percent']['critical'],
                    metrics.disk_percent
                )
            elif metrics.disk_percent > self.alert_thresholds['disk_percent']['warning']:
                self._create_alert(
                    'High Disk Usage (Warning)',
                    f'Disk usage is at {metrics.disk_percent:.1f}%, exceeding warning threshold of {self.alert_thresholds["disk_percent"]["warning"]}%',
                    'high',
                    'system.disk.usage',
                    self.alert_thresholds['disk_percent']['warning'],
                    metrics.disk_percent
                )
            
            # Check process count
            if metrics.process_count > self.alert_thresholds['process_count']['critical']:
                self._create_alert(
                    'High Process Count (Critical)',
                    f'Process count is {metrics.process_count}, exceeding critical threshold of {self.alert_thresholds["process_count"]["critical"]}',
                    'critical',
                    'system.processes.count',
                    self.alert_thresholds['process_count']['critical'],
                    metrics.process_count
                )
            elif metrics.process_count > self.alert_thresholds['process_count']['warning']:
                self._create_alert(
                    'High Process Count (Warning)',
                    f'Process count is {metrics.process_count}, exceeding warning threshold of {self.alert_thresholds["process_count"]["warning"]}',
                    'high',
                    'system.processes.count',
                    self.alert_thresholds['process_count']['warning'],
                    metrics.process_count
                )
            
            # Check load average if available
            if metrics.load_average and len(metrics.load_average) > 0:
                load_1min = metrics.load_average[0]
                if load_1min > self.alert_thresholds['load_average']['critical']:
                    self._create_alert(
                        'High Load Average (Critical)',
                        f'Load average (1min) is {load_1min:.2f}, exceeding critical threshold of {self.alert_thresholds["load_average"]["critical"]}',
                        'critical',
                        'system.load.average',
                        self.alert_thresholds['load_average']['critical'],
                        load_1min
                    )
                elif load_1min > self.alert_thresholds['load_average']['warning']:
                    self._create_alert(
                        'High Load Average (Warning)',
                        f'Load average (1min) is {load_1min:.2f}, exceeding warning threshold of {self.alert_thresholds["load_average"]["warning"]}',
                        'high',
                        'system.load.average',
                        self.alert_thresholds['load_average']['warning'],
                        load_1min
                    )
            
        except Exception as e:
            logger.error(f"Failed to check infrastructure alerts: {str(e)}")
    
    def _create_alert(self, title: str, description: str, severity: str, metric_name: str, threshold: float, current_value: float):
        """Create an infrastructure alert"""
        try:
            # Import here to avoid circular imports
            from src.services.monitoring_service import get_monitoring_service, AlertSeverity
            
            monitoring_service = get_monitoring_service()
            
            monitoring_service.create_alert(
                title=title,
                description=description,
                severity=AlertSeverity(severity),
                source='infrastructure_monitor',
                metric_name=metric_name,
                threshold=threshold,
                current_value=current_value,
                tags=['infrastructure', 'system'],
                metadata={'component': 'infrastructure'}
            )
            
        except Exception as e:
            logger.error(f"Failed to create infrastructure alert: {str(e)}")
    
    def monitor_top_processes(self):
        """Monitor top resource-consuming processes"""
        try:
            # Get top processes by CPU
            processes_cpu = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'memory_info', 'status', 'create_time', 'num_threads']):
                try:
                    pinfo = proc.info
                    if pinfo['cpu_percent'] > 0:  # Only include active processes
                        processes_cpu.append(ProcessInfo(
                            pid=pinfo['pid'],
                            name=pinfo['name'],
                            cpu_percent=pinfo['cpu_percent'],
                            memory_percent=pinfo['memory_percent'],
                            memory_mb=pinfo['memory_info'].rss / (1024 * 1024) if pinfo['memory_info'] else 0,
                            status=pinfo['status'],
                            create_time=pinfo['create_time'],
                            num_threads=pinfo['num_threads']
                        ))
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    pass
            
            # Sort by CPU usage
            processes_cpu.sort(key=lambda x: x.cpu_percent, reverse=True)
            top_cpu_processes = processes_cpu[:10]
            
            # Get top processes by memory
            processes_mem = sorted(processes_cpu, key=lambda x: x.memory_percent, reverse=True)
            top_mem_processes = processes_mem[:10]
            
            # Store process metrics
            for i, process in enumerate(top_cpu_processes):
                self._store_process_metric('process.cpu.top', process.cpu_percent, {
                    'host': 'local',
                    'rank': i + 1,
                    'pid': process.pid,
                    'name': process.name
                })
            
            for i, process in enumerate(top_mem_processes):
                self._store_process_metric('process.memory.top', process.memory_percent, {
                    'host': 'local',
                    'rank': i + 1,
                    'pid': process.pid,
                    'name': process.name
                })
                self._store_process_metric('process.memory.mb', process.memory_mb, {
                    'host': 'local',
                    'rank': i + 1,
                    'pid': process.pid,
                    'name': process.name
                })
            
            logger.debug("Top processes monitored successfully")
            
        except Exception as e:
            logger.error(f"Failed to monitor top processes: {str(e)}")
    
    def _store_process_metric(self, name: str, value: float, tags: Dict = None):
        """Store process-related metric"""
        try:
            metric = MonitoringMetric(
                metric_name=name,
                metric_type='gauge',
                value=value,
                timestamp=datetime.utcnow(),
                tags=tags or {},
                source='infrastructure_monitor',
                metadata={'collection_method': 'process_scan'}
            )
            
            metric.save()
            
        except Exception as e:
            logger.error(f"Failed to store process metric {name}: {str(e)}")
    
    def check_infrastructure_health(self):
        """Check infrastructure service health"""
        try:
            # Check disk space health
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            
            disk_status = 'healthy'
            if disk_percent > 90:
                disk_status = 'unhealthy'
            elif disk_percent > 80:
                disk_status = 'degraded'
            
            self._store_health_check('disk_space', 'disk_usage', disk_status, {
                'total_gb': disk.total / (1024**3),
                'used_gb': disk.used / (1024**3),
                'free_gb': disk.free / (1024**3),
                'percent': disk_percent
            })
            
            # Check memory health
            memory = psutil.virtual_memory()
            memory_status = 'healthy'
            if memory.percent > 95:
                memory_status = 'unhealthy'
            elif memory.percent > 85:
                memory_status = 'degraded'
            
            self._store_health_check('memory', 'memory_usage', memory_status, {
                'total_gb': memory.total / (1024**3),
                'available_gb': memory.available / (1024**3),
                'used_gb': memory.used / (1024**3),
                'percent': memory.percent
            })
            
            # Check CPU health
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_status = 'healthy'
            if cpu_percent > 95:
                cpu_status = 'unhealthy'
            elif cpu_percent > 80:
                cpu_status = 'degraded'
            
            self._store_health_check('cpu', 'cpu_usage', cpu_status, {
                'percent': cpu_percent,
                'count': psutil.cpu_count()
            })
            
            # Check network health
            try:
                # Simple network connectivity check
                requests.get('http://www.google.com', timeout=5)
                network_status = 'healthy'
            except:
                network_status = 'degraded'
            
            self._store_health_check('network', 'connectivity', network_status, {
                'test_url': 'http://www.google.com'
            })
            
            logger.debug("Infrastructure health checks completed")
            
        except Exception as e:
            logger.error(f"Failed to check infrastructure health: {str(e)}")
    
    def _store_health_check(self, service_name: str, check_type: str, status: str, metadata: Dict = None):
        """Store a health check result"""
        try:
            health_check = HealthCheck(
                service_name=service_name,
                check_type=check_type,
                status=status,
                timestamp=datetime.utcnow(),
                metadata=metadata or {}
            )
            
            health_check.save()
            
        except Exception as e:
            logger.error(f"Failed to store health check for {service_name}: {str(e)}")
    
    def get_infrastructure_summary(self) -> Dict[str, Any]:
        """Get infrastructure monitoring summary"""
        try:
            metrics = self.get_current_metrics()
            
            # Determine overall health
            health_issues = []
            if metrics.cpu_percent > 80:
                health_issues.append('high_cpu')
            if metrics.memory_percent > 85:
                health_issues.append('high_memory')
            if metrics.disk_percent > 85:
                health_issues.append('high_disk')
            
            overall_status = 'healthy'
            if len(health_issues) >= 2:
                overall_status = 'unhealthy'
            elif len(health_issues) == 1:
                overall_status = 'degraded'
            
            return {
                'status': overall_status,
                'timestamp': datetime.utcnow().isoformat(),
                'metrics': {
                    'cpu_percent': metrics.cpu_percent,
                    'memory_percent': metrics.memory_percent,
                    'disk_percent': metrics.disk_percent,
                    'process_count': metrics.process_count,
                    'load_average': metrics.load_average
                },
                'issues': health_issues,
                'baselines': self.performance_baselines
            }
            
        except Exception as e:
            logger.error(f"Failed to get infrastructure summary: {str(e)}")
            return {
                'status': 'unknown',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

# Global infrastructure monitor instance
infrastructure_monitor = InfrastructureMonitor()

def get_infrastructure_monitor() -> InfrastructureMonitor:
    """Get the global infrastructure monitor instance"""
    return infrastructure_monitor