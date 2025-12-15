#!/usr/bin/env python3
"""
🚀 NASA Air Quality Scheduler Runner
Run the automated data collection scheduler
"""

import sys
import os
import signal
import time
from scheduler import DataScheduler

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print('\n🛑 Received interrupt signal. Stopping scheduler...')
    sys.exit(0)

def main():
    """Main function to run the scheduler"""
    print("🚀 NASA Air Quality Data Scheduler")
    print("=" * 50)
    print("Press Ctrl+C to stop the scheduler")
    print()
    
    # Set up signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Initialize and start scheduler
        scheduler = DataScheduler()
        scheduler.start_scheduler()
        
    except KeyboardInterrupt:
        print("\n🛑 Scheduler stopped by user")
    except Exception as e:
        print(f"❌ Scheduler error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
