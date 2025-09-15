"""
Async utilities for Flask routes
Provides helpers for running async functions in Flask contexts
"""
import asyncio
import functools
from typing import Callable, Any
from flask import current_app


def async_route(f: Callable) -> Callable:
    """
    Decorator for Flask routes that need to run async functions.
    This creates a new event loop for each request if needed.
    """
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        # Try to get existing event loop
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # If loop is already running, we need a new one
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    return loop.run_until_complete(f(*args, **kwargs))
                finally:
                    loop.close()
            else:
                return loop.run_until_complete(f(*args, **kwargs))
        except RuntimeError:
            # No event loop exists, create one
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return loop.run_until_complete(f(*args, **kwargs))
            finally:
                loop.close()
    
    return wrapper


def run_async_in_flask(async_func: Callable, *args, **kwargs) -> Any:
    """
    Helper function to run async code in Flask context.
    Creates and manages event loop automatically.
    """
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Create new loop if one is already running
            new_loop = asyncio.new_event_loop()
            asyncio.set_event_loop(new_loop)
            try:
                return new_loop.run_until_complete(async_func(*args, **kwargs))
            finally:
                new_loop.close()
                asyncio.set_event_loop(loop)
        else:
            return loop.run_until_complete(async_func(*args, **kwargs))
    except RuntimeError:
        # No event loop, create one
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(async_func(*args, **kwargs))
        finally:
            loop.close()