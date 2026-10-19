#!/usr/bin/env python3
"""
Hireko AI Product Advisor - Server Launcher
Usage:
    python run.py
"""

import sys
import uvicorn

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("   HIREKO AI PRODUCT ADVISOR (Python Engine)")
    print("   Recruitment & AI Interview Platform Intelligence")
    print("=" * 60)
    print(" • Local Web Interface: http://127.0.0.1:8000")
    print(" • API Documentation:   http://127.0.0.1:8000/docs")
    print(" • Health Check:        http://127.0.0.1:8000/api/health")
    print("=" * 60 + "\n")
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
