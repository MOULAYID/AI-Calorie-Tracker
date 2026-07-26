import os
import sys
import subprocess
import time
import socket

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def main():
    print("=" * 65)
    print("  🚀 Starting NutriScan AI Calorie Tracker (SDD-Pro Stack)")
    print("=" * 65)
    
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "workspace", "src", "frontend")
    src_dir = os.path.join(root_dir, "workspace", "src")
    
    local_ip = get_local_ip()

    if src_dir not in sys.path:
        sys.path.insert(0, src_dir)

    print("\n1. Starting FastAPI Backend on 0.0.0.0:8000 ...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=src_dir)

    print("2. Starting React Mobile Frontend on 0.0.0.0:5173 ...")
    frontend_cmd = ["npm.cmd" if os.name == "nt" else "npm", "run", "dev", "--", "--host", "0.0.0.0"]
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=frontend_dir)

    print("\n" + "=" * 65)
    print("  📱 PHONE TEST URL (Wi-Fi):  http://" + local_ip + ":5173")
    print("  💻 LOCAL COMPUTER URL:      http://127.0.0.1:5173")
    print("  ⚡ BACKEND API URL:         http://" + local_ip + ":8000")
    print("=" * 65)
    print("  💡 Developer USB Debugging Tip:")
    print("     If testing via USB cable, run:  adb reverse tcp:5173 tcp:5173")
    print("     and open http://localhost:5173 on your phone!")
    print("=" * 65 + "\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping processes...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    main()
