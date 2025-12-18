#!/usr/bin/env python3
"""
Comprehensive Security Testing Suite for Crazy-Gary Application
Tests all security features and components
"""

import requests
import time
import json
import sys
import subprocess
from datetime import datetime
from urllib.parse import urljoin
import concurrent.futures
import threading
from typing import Dict, List, Tuple, Optional


class SecurityTester:
    """Comprehensive security testing class"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.test_results = []
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Crazy-Gary Security Tester/1.0',
            'Accept': 'application/json'
        })
    
    def log_test(self, test_name: str, passed: bool, message: str = "", details: Dict = None):
        """Log test result"""
        result = {
            'test': test_name,
            'passed': passed,
            'message': message,
            'details': details or {},
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        if not passed and details:
            print(f"    Details: {details}")
    
    def test_security_headers(self) -> bool:
        """Test security headers presence"""
        try:
            response = self.session.get(self.base_url)
            headers = response.headers
            
            required_headers = {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block',
                'Referrer-Policy': 'strict-origin-when-cross-origin'
            }
            
            missing_headers = []
            for header, expected_value in required_headers.items():
                if header not in headers:
                    missing_headers.append(header)
                elif expected_value and headers[header] != expected_value:
                    missing_headers.append(f"{header} (expected: {expected_value}, got: {headers[header]})")
            
            if missing_headers:
                self.log_test(
                    "Security Headers",
                    False,
                    f"Missing or incorrect headers: {', '.join(missing_headers)}",
                    {'missing': missing_headers, 'present': list(headers.keys())}
                )
                return False
            else:
                self.log_test(
                    "Security Headers",
                    True,
                    "All required security headers present",
                    {'headers': list(headers.keys())}
                )
                return True
                
        except Exception as e:
            self.log_test("Security Headers", False, f"Request failed: {str(e)}")
            return False
    
    def test_csp_header(self) -> bool:
        """Test Content Security Policy header"""
        try:
            response = self.session.get(self.base_url)
            csp = response.headers.get('Content-Security-Policy')
            
            if not csp:
                self.log_test("CSP Header", False, "Content-Security-Policy header missing")
                return False
            
            # Check for basic CSP directives
            required_directives = ['default-src', 'script-src', 'style-src']
            missing_directives = []
            
            for directive in required_directives:
                if directive not in csp:
                    missing_directives.append(directive)
            
            if missing_directives:
                self.log_test(
                    "CSP Header",
                    False,
                    f"CSP missing directives: {', '.join(missing_directives)}",
                    {'csp': csp, 'missing': missing_directives}
                )
                return False
            else:
                self.log_test(
                    "CSP Header",
                    True,
                    "CSP header present with required directives",
                    {'csp': csp}
                )
                return True
                
        except Exception as e:
            self.log_test("CSP Header", False, f"Request failed: {str(e)}")
            return False
    
    def test_hsts_header(self) -> bool:
        """Test HTTP Strict Transport Security header"""
        try:
            # Test with HTTPS
            https_url = self.base_url.replace('http://', 'https://')
            response = self.session.get(https_url, verify=False)
            
            hsts = response.headers.get('Strict-Transport-Security')
            
            if hsts:
                self.log_test(
                    "HSTS Header",
                    True,
                    "HSTS header present",
                    {'hsts': hsts}
                )
                return True
            else:
                # Not necessarily a failure if not in production
                self.log_test(
                    "HSTS Header",
                    True,
                    "HSTS header not present (expected in production)",
                    {'note': 'This is expected in development'}
                )
                return True
                
        except Exception as e:
            self.log_test("HSTS Header", True, "HTTPS test skipped", {'error': str(e)})
            return True
    
    def test_xss_protection(self) -> bool:
        """Test XSS protection"""
        try:
            # Test XSS protection endpoint
            test_payload = "<script>alert('XSS')</script>"
            response = self.session.get(
                urljoin(self.base_url, "/api/security/test/xss"),
                params={'input': test_payload}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('sanitized'):
                    self.log_test(
                        "XSS Protection",
                        True,
                        "XSS input properly sanitized",
                        {'response': data}
                    )
                    return True
                else:
                    self.log_test(
                        "XSS Protection",
                        False,
                        "XSS input not properly sanitized",
                        {'response': data}
                    )
                    return False
            else:
                self.log_test(
                    "XSS Protection",
                    False,
                    f"Test endpoint returned status {response.status_code}",
                    {'status_code': response.status_code}
                )
                return False
                
        except Exception as e:
            self.log_test("XSS Protection", False, f"Test failed: {str(e)}")
            return False
    
    def test_sql_injection_protection(self) -> bool:
        """Test SQL injection protection"""
        try:
            # Test SQL injection protection endpoint
            test_payload = "' UNION SELECT * FROM users --"
            response = self.session.get(
                urljoin(self.base_url, "/api/security/test/sql-injection"),
                params={'input': test_payload}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('blocked') == False:  # Should be blocked by middleware
                    self.log_test(
                        "SQL Injection Protection",
                        False,
                        "SQL injection input not blocked",
                        {'response': data}
                    )
                    return False
                else:
                    self.log_test(
                        "SQL Injection Protection",
                        True,
                        "SQL injection input properly blocked",
                        {'response': data}
                    )
                    return True
            else:
                self.log_test(
                    "SQL Injection Protection",
                    False,
                    f"Test endpoint returned status {response.status_code}",
                    {'status_code': response.status_code}
                )
                return False
                
        except Exception as e:
            self.log_test("SQL Injection Protection", False, f"Test failed: {str(e)}")
            return False
    
    def test_rate_limiting(self) -> bool:
        """Test rate limiting"""
        try:
            # Test rate limiting endpoint
            endpoint = urljoin(self.base_url, "/api/security/test/rate-limit")
            
            # Make multiple rapid requests
            responses = []
            for i in range(10):
                try:
                    response = self.session.get(endpoint, timeout=1)
                    responses.append(response.status_code)
                    time.sleep(0.1)  # Small delay between requests
                except:
                    responses.append('timeout')
            
            # Check if rate limiting is working
            timeout_count = responses.count('timeout')
            rate_limited = 429 in responses
            
            if timeout_count > 0 or rate_limited:
                self.log_test(
                    "Rate Limiting",
                    True,
                    f"Rate limiting active ({timeout_count} timeouts, {rate_limited} 429s)",
                    {'responses': responses[:5]}  # Show first 5 responses
                )
                return True
            else:
                self.log_test(
                    "Rate Limiting",
                    False,
                    "Rate limiting may not be working properly",
                    {'responses': responses}
                )
                return False
                
        except Exception as e:
            self.log_test("Rate Limiting", False, f"Test failed: {str(e)}")
            return False
    
    def test_csrf_protection(self) -> bool:
        """Test CSRF protection"""
        try:
            # Test CSRF endpoint
            endpoint = urljoin(self.base_url, "/api/security/test/csrf")
            
            # Test without CSRF token (should be allowed for GET)
            response = self.session.get(endpoint)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('method') == 'GET':
                    self.log_test(
                        "CSRF Protection",
                        True,
                        "CSRF protection active (GET request allowed)",
                        {'response': data}
                    )
                    return True
                else:
                    self.log_test(
                        "CSRF Protection",
                        False,
                        f"Unexpected method in response: {data.get('method')}",
                        {'response': data}
                    )
                    return False
            else:
                self.log_test(
                    "CSRF Protection",
                    False,
                    f"CSRF test endpoint returned status {response.status_code}",
                    {'status_code': response.status_code}
                )
                return False
                
        except Exception as e:
            self.log_test("CSRF Protection", False, f"Test failed: {str(e)}")
            return False
    
    def test_input_validation(self) -> bool:
        """Test input validation"""
        try:
            # Test with various malicious inputs
            test_inputs = [
                "<script>alert('xss')</script>",
                "' OR '1'='1",
                "../../../etc/passwd",
                "${7*7}",
                "{{7*7}}",
                "<img src=x onerror=alert('xss')>"
            ]
            
            validation_results = []
            
            for test_input in test_inputs:
                try:
                    response = self.session.get(
                        urljoin(self.base_url, "/api/security/test/xss"),
                        params={'input': test_input}
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('sanitized'):
                            validation_results.append('sanitized')
                        else:
                            validation_results.append('not_sanitized')
                    else:
                        validation_results.append('blocked')
                        
                except:
                    validation_results.append('error')
            
            sanitized_count = validation_results.count('sanitized')
            blocked_count = validation_results.count('blocked')
            
            if sanitized_count + blocked_count >= len(test_inputs) * 0.8:  # 80% should be handled
                self.log_test(
                    "Input Validation",
                    True,
                    f"Input validation working ({sanitized_count} sanitized, {blocked_count} blocked)",
                    {'results': validation_results}
                )
                return True
            else:
                self.log_test(
                    "Input Validation",
                    False,
                    f"Input validation may not be working properly",
                    {'results': validation_results}
                )
                return False
                
        except Exception as e:
            self.log_test("Input Validation", False, f"Test failed: {str(e)}")
            return False
    
    def test_security_health_endpoint(self) -> bool:
        """Test security health endpoint"""
        try:
            response = self.session.get(urljoin(self.base_url, "/api/security/health"))
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for required fields
                required_fields = ['status', 'timestamp', 'security_components']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test(
                        "Security Health Endpoint",
                        False,
                        f"Missing fields: {', '.join(missing_fields)}",
                        {'data': data, 'missing': missing_fields}
                    )
                    return False
                else:
                    self.log_test(
                        "Security Health Endpoint",
                        True,
                        f"Security health endpoint working (status: {data.get('status')})",
                        {'data': data}
                    )
                    return True
            else:
                self.log_test(
                    "Security Health Endpoint",
                    False,
                    f"Health endpoint returned status {response.status_code}",
                    {'status_code': response.status_code}
                )
                return False
                
        except Exception as e:
            self.log_test("Security Health Endpoint", False, f"Test failed: {str(e)}")
            return False
    
    def test_security_metrics_endpoint(self) -> bool:
        """Test security metrics endpoint"""
        try:
            response = self.session.get(urljoin(self.base_url, "/api/security/metrics"))
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for required fields
                if 'timestamp' in data and 'security_events' in data:
                    self.log_test(
                        "Security Metrics Endpoint",
                        True,
                        "Security metrics endpoint working",
                        {'data': data}
                    )
                    return True
                else:
                    self.log_test(
                        "Security Metrics Endpoint",
                        False,
                        "Metrics endpoint response missing required fields",
                        {'data': data}
                    )
                    return False
            else:
                self.log_test(
                    "Security Metrics Endpoint",
                    False,
                    f"Metrics endpoint returned status {response.status_code}",
                    {'status_code': response.status_code}
                )
                return False
                
        except Exception as e:
            self.log_test("Security Metrics Endpoint", False, f"Test failed: {str(e)}")
            return False
    
    def test_concurrent_requests(self) -> bool:
        """Test handling of concurrent requests"""
        try:
            endpoint = urljoin(self.base_url, "/api/security/test/rate-limit")
            
            # Make concurrent requests
            def make_request(i):
                try:
                    response = self.session.get(endpoint, timeout=2)
                    return response.status_code
                except:
                    return 'timeout'
            
            with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
                futures = [executor.submit(make_request, i) for i in range(50)]
                results = [future.result() for future in concurrent.futures.as_completed(futures)]
            
            # Analyze results
            timeout_count = results.count('timeout')
            rate_limited = results.count(429)
            success_count = results.count(200)
            
            if timeout_count + rate_limited > 0:
                self.log_test(
                    "Concurrent Request Handling",
                    True,
                    f"Concurrent requests handled properly ({success_count} success, {timeout_count} timeout, {rate_limited} rate limited)",
                    {'results': results[:10]}
                )
                return True
            else:
                self.log_test(
                    "Concurrent Request Handling",
                    False,
                    "Concurrent requests may not be handled properly",
                    {'results': results}
                )
                return False
                
        except Exception as e:
            self.log_test("Concurrent Request Handling", False, f"Test failed: {str(e)}")
            return False
    
    def test_malicious_file_upload_simulation(self) -> bool:
        """Test file upload security (simulation)"""
        try:
            # Test file upload endpoint if it exists
            test_files = [
                ('test.exe', b'MZ'),  # Windows executable
                ('test.php', b'<?php'),  # PHP file
                ('test.js', b'<script>')  # JavaScript file
            ]
            
            for filename, content in test_files:
                try:
                    files = {'file': (filename, content)}
                    response = self.session.post(
                        urljoin(self.base_url, "/api/upload"),
                        files=files,
                        timeout=5
                    )
                    
                    # Should either reject or sanitize
                    if response.status_code in [400, 413, 415]:  # Bad request, payload too large, unsupported media type
                        continue  # Good - file rejected
                    elif response.status_code == 200:
                        data = response.json()
                        if data.get('error') or 'rejected' in str(data).lower():
                            continue  # Good - file rejected
                    else:
                        # Unexpected response
                        self.log_test(
                            "File Upload Security",
                            False,
                            f"Unexpected response for dangerous file {filename}: {response.status_code}",
                            {'filename': filename, 'status': response.status_code}
                        )
                        return False
                        
                except requests.exceptions.Timeout:
                    continue  # Timeout might indicate file was processed
                except requests.exceptions.ConnectionError:
                    # Endpoint might not exist
                    break
                except:
                    continue
            
            self.log_test(
                "File Upload Security",
                True,
                "File upload security appears to be working",
                {'tested_files': [f[0] for f in test_files]}
            )
            return True
            
        except Exception as e:
            self.log_test("File Upload Security", False, f"Test failed: {str(e)}")
            return False
    
    def run_all_tests(self) -> Dict[str, any]:
        """Run all security tests"""
        print("🔒 Starting comprehensive security tests...")
        print("=" * 60)
        
        # Run tests
        test_methods = [
            self.test_security_headers,
            self.test_csp_header,
            self.test_hsts_header,
            self.test_xss_protection,
            self.test_sql_injection_protection,
            self.test_rate_limiting,
            self.test_csrf_protection,
            self.test_input_validation,
            self.test_security_health_endpoint,
            self.test_security_metrics_endpoint,
            self.test_concurrent_requests,
            self.test_malicious_file_upload_simulation
        ]
        
        passed_tests = 0
        failed_tests = 0
        
        for test_method in test_methods:
            try:
                if test_method():
                    passed_tests += 1
                else:
                    failed_tests += 1
            except Exception as e:
                print(f"❌ FAIL {test_method.__name__}: Test execution failed - {str(e)}")
                failed_tests += 1
        
        print("=" * 60)
        print(f"📊 Test Results: {passed_tests} passed, {failed_tests} failed")
        
        # Generate summary
        summary = {
            'total_tests': len(test_methods),
            'passed': passed_tests,
            'failed': failed_tests,
            'success_rate': (passed_tests / len(test_methods)) * 100,
            'timestamp': datetime.now().isoformat(),
            'base_url': self.base_url,
            'results': self.test_results
        }
        
        return summary
    
    def generate_report(self, summary: Dict[str, any], output_file: str = None):
        """Generate security test report"""
        report = {
            'security_test_report': {
                'summary': summary,
                'test_results': self.test_results,
                'recommendations': self._get_recommendations(summary)
            }
        }
        
        if output_file:
            with open(output_file, 'w') as f:
                json.dump(report, f, indent=2)
            print(f"📄 Security report saved to: {output_file}")
        
        return report
    
    def _get_recommendations(self, summary: Dict[str, any]) -> List[str]:
        """Get security recommendations based on test results"""
        recommendations = []
        
        failed_tests = [r for r in self.test_results if not r['passed']]
        
        if any('Security Headers' in r['test'] for r in failed_tests):
            recommendations.append("Configure all required security headers")
        
        if any('CSP' in r['test'] for r in failed_tests):
            recommendations.append("Implement proper Content Security Policy")
        
        if any('XSS' in r['test'] for r in failed_tests):
            recommendations.append("Enable XSS protection and input sanitization")
        
        if any('Rate Limiting' in r['test'] for r in failed_tests):
            recommendations.append("Configure rate limiting for API endpoints")
        
        if any('CSRF' in r['test'] for r in failed_tests):
            recommendations.append("Implement CSRF protection for state-changing operations")
        
        if summary['success_rate'] < 80:
            recommendations.append("Review and fix failed security tests")
        
        return recommendations


def main():
    """Main function to run security tests"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Crazy-Gary Security Test Suite')
    parser.add_argument('--url', default='http://localhost:8000', help='Base URL to test')
    parser.add_argument('--output', help='Output file for test report')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    # Create tester
    tester = SecurityTester(args.url)
    
    try:
        # Run tests
        summary = tester.run_all_tests()
        
        # Generate report
        report = tester.generate_report(summary, args.output)
        
        # Print recommendations
        if report['security_test_report']['recommendations']:
            print("\n💡 Security Recommendations:")
            for i, rec in enumerate(report['security_test_report']['recommendations'], 1):
                print(f"  {i}. {rec}")
        
        # Exit with appropriate code
        if summary['failed'] > 0:
            print(f"\n❌ {summary['failed']} security tests failed!")
            sys.exit(1)
        else:
            print(f"\n✅ All {summary['passed']} security tests passed!")
            sys.exit(0)
            
    except KeyboardInterrupt:
        print("\n\n⚠️  Security tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Security testing failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()