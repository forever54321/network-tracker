"""
Network Tracker Setup & Launcher
A GUI application to configure and launch the Network Device & Application Usage Monitor.
"""
import os
import sys
import json
import secrets
import subprocess
import threading
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
from pathlib import Path

# Determine base directory
if getattr(sys, 'frozen', False):
    BASE_DIR = Path(sys.executable).parent
else:
    BASE_DIR = Path(__file__).parent

BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"
ENV_FILE = BACKEND_DIR / ".env"
FRONTEND_ENV = FRONTEND_DIR / ".env.local"
CONFIG_FILE = BASE_DIR / "tracker_config.json"


def load_config() -> dict:
    defaults = {
        "unifi_host": "192.168.1.1",
        "unifi_username": "admin",
        "unifi_password": "",
        "unifi_site": "default",
        "db_host": "localhost",
        "db_port": "5432",
        "db_name": "tracking",
        "db_user": "tracking",
        "db_password": "",
        "backend_port": "8000",
        "frontend_port": "3000",
        "admin_username": "admin",
        "admin_email": "admin@local.net",
        "admin_password": "",
    }
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE) as f:
                saved = json.load(f)
            # Don't load passwords from config for security
            for k, v in saved.items():
                if "password" not in k:
                    defaults[k] = v
        except Exception:
            pass
    return defaults


def save_config(cfg: dict):
    safe = {k: v for k, v in cfg.items() if "password" not in k}
    with open(CONFIG_FILE, "w") as f:
        json.dump(safe, f, indent=2)


def generate_env(cfg: dict) -> str:
    jwt_secret = secrets.token_urlsafe(32)
    return (
        f"DATABASE_URL=postgresql+asyncpg://{cfg['db_user']}:{cfg['db_password']}@{cfg['db_host']}:{cfg['db_port']}/{cfg['db_name']}\n"
        f"DATABASE_URL_SYNC=postgresql://{cfg['db_user']}:{cfg['db_password']}@{cfg['db_host']}:{cfg['db_port']}/{cfg['db_name']}\n"
        f"UNIFI_HOST={cfg['unifi_host']}\n"
        f"UNIFI_USERNAME={cfg['unifi_username']}\n"
        f"UNIFI_PASSWORD={cfg['unifi_password']}\n"
        f"UNIFI_SITE={cfg['unifi_site']}\n"
        f"UNIFI_VERIFY_SSL=false\n"
        f"JWT_SECRET={jwt_secret}\n"
        f"JWT_ALGORITHM=HS256\n"
        f"ACCESS_TOKEN_EXPIRE_MINUTES=30\n"
        f"REFRESH_TOKEN_EXPIRE_DAYS=7\n"
        f"POLL_INTERVAL_SECONDS=30\n"
    )


class SetupApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Network Tracker - Setup")
        self.root.geometry("700x720")
        self.root.resizable(True, True)
        self.root.configure(bg="#0f172a")

        self.cfg = load_config()
        self.backend_proc = None
        self.frontend_proc = None

        style = ttk.Style()
        style.theme_use("clam")
        style.configure("Title.TLabel", font=("Segoe UI", 18, "bold"), foreground="#e2e8f0", background="#0f172a")
        style.configure("Subtitle.TLabel", font=("Segoe UI", 10), foreground="#94a3b8", background="#0f172a")
        style.configure("Section.TLabelframe", background="#1e293b", foreground="#e2e8f0", bordercolor="#334155")
        style.configure("Section.TLabelframe.Label", font=("Segoe UI", 11, "bold"), foreground="#38bdf8", background="#1e293b")
        style.configure("Dark.TFrame", background="#0f172a")
        style.configure("Card.TFrame", background="#1e293b")
        style.configure("TLabel", font=("Segoe UI", 10), foreground="#cbd5e1", background="#1e293b")
        style.configure("TEntry", fieldbackground="#0f172a", foreground="#e2e8f0", bordercolor="#475569", insertcolor="#e2e8f0")
        style.configure("Action.TButton", font=("Segoe UI", 11, "bold"), padding=(20, 10))
        style.configure("Small.TButton", font=("Segoe UI", 9), padding=(10, 5))
        style.configure("Status.TLabel", font=("Segoe UI", 9), foreground="#94a3b8", background="#0f172a")
        style.map("Action.TButton",
                  background=[("active", "#2563eb"), ("!active", "#1d4ed8")],
                  foreground=[("active", "#ffffff"), ("!active", "#ffffff")])

        self._build_ui()

    def _build_ui(self):
        main = ttk.Frame(self.root, style="Dark.TFrame")
        main.pack(fill=tk.BOTH, expand=True, padx=20, pady=15)

        # Header
        ttk.Label(main, text="Network Tracker", style="Title.TLabel").pack(anchor="w")
        ttk.Label(main, text="Device & Application Usage Monitor — Setup Wizard", style="Subtitle.TLabel").pack(anchor="w", pady=(0, 15))

        # Scrollable content
        canvas = tk.Canvas(main, bg="#0f172a", highlightthickness=0)
        scrollbar = ttk.Scrollbar(main, orient="vertical", command=canvas.yview)
        scroll_frame = ttk.Frame(canvas, style="Dark.TFrame")

        scroll_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=scroll_frame, anchor="nw", tags="frame")
        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.bind("<Configure>", lambda e: canvas.itemconfig("frame", width=e.width))

        # Mouse wheel scrolling
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        canvas.bind_all("<MouseWheel>", _on_mousewheel)

        canvas.pack(side="left", fill=tk.BOTH, expand=True)
        scrollbar.pack(side="right", fill=tk.Y)

        self.fields = {}

        # === UniFi Controller ===
        uf = ttk.LabelFrame(scroll_frame, text="  UniFi Controller  ", style="Section.TLabelframe", padding=15)
        uf.pack(fill=tk.X, pady=(0, 10))

        self._add_field(uf, "unifi_host", "Controller IP / Hostname", self.cfg["unifi_host"])
        self._add_field(uf, "unifi_username", "Username", self.cfg["unifi_username"])
        self._add_field(uf, "unifi_password", "Password", self.cfg["unifi_password"], show="*")
        self._add_field(uf, "unifi_site", "Site Name", self.cfg["unifi_site"])

        # === Database ===
        df = ttk.LabelFrame(scroll_frame, text="  PostgreSQL Database  ", style="Section.TLabelframe", padding=15)
        df.pack(fill=tk.X, pady=(0, 10))

        row_frame = ttk.Frame(df, style="Card.TFrame")
        row_frame.pack(fill=tk.X, pady=(0, 5))
        self._add_field(row_frame, "db_host", "Host", self.cfg["db_host"], side=True)
        self._add_field(row_frame, "db_port", "Port", self.cfg["db_port"], side=True, width=8)

        self._add_field(df, "db_name", "Database Name", self.cfg["db_name"])
        self._add_field(df, "db_user", "Username", self.cfg["db_user"])
        self._add_field(df, "db_password", "Password", self.cfg["db_password"], show="*")

        # === Admin Account ===
        af = ttk.LabelFrame(scroll_frame, text="  Admin Account (Web UI)  ", style="Section.TLabelframe", padding=15)
        af.pack(fill=tk.X, pady=(0, 10))

        self._add_field(af, "admin_username", "Username", self.cfg["admin_username"])
        self._add_field(af, "admin_email", "Email", self.cfg["admin_email"])
        self._add_field(af, "admin_password", "Password", self.cfg["admin_password"], show="*")

        # === Ports ===
        pf = ttk.LabelFrame(scroll_frame, text="  Server Ports  ", style="Section.TLabelframe", padding=15)
        pf.pack(fill=tk.X, pady=(0, 15))

        port_row = ttk.Frame(pf, style="Card.TFrame")
        port_row.pack(fill=tk.X)
        self._add_field(port_row, "backend_port", "Backend (API)", self.cfg["backend_port"], side=True, width=8)
        self._add_field(port_row, "frontend_port", "Frontend (UI)", self.cfg["frontend_port"], side=True, width=8)

        # === Buttons ===
        btn_frame = ttk.Frame(scroll_frame, style="Dark.TFrame")
        btn_frame.pack(fill=tk.X, pady=(5, 10))

        self.test_btn = ttk.Button(btn_frame, text="Test Connection", style="Small.TButton", command=self._test_connection)
        self.test_btn.pack(side="left", padx=(0, 10))

        self.save_btn = ttk.Button(btn_frame, text="Save & Generate Config", style="Small.TButton", command=self._save_config)
        self.save_btn.pack(side="left", padx=(0, 10))

        self.launch_btn = ttk.Button(btn_frame, text="Launch Tracker", style="Action.TButton", command=self._launch)
        self.launch_btn.pack(side="right")

        # === Log output ===
        log_frame = ttk.LabelFrame(scroll_frame, text="  Output  ", style="Section.TLabelframe", padding=10)
        log_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 5))

        self.log_text = scrolledtext.ScrolledText(
            log_frame, height=8, bg="#0f172a", fg="#94a3b8",
            insertbackground="#e2e8f0", font=("Consolas", 9),
            wrap=tk.WORD, borderwidth=0, highlightthickness=0,
        )
        self.log_text.pack(fill=tk.BOTH, expand=True)

        # Status bar
        self.status_var = tk.StringVar(value="Ready")
        ttk.Label(main, textvariable=self.status_var, style="Status.TLabel").pack(anchor="w", pady=(5, 0))

    def _add_field(self, parent, key, label, default="", show="", side=False, width=None):
        if side:
            frame = ttk.Frame(parent, style="Card.TFrame")
            frame.pack(side="left", fill=tk.X, expand=True, padx=(0, 10))
        else:
            frame = ttk.Frame(parent, style="Card.TFrame")
            frame.pack(fill=tk.X, pady=(0, 8))

        ttk.Label(frame, text=label).pack(anchor="w")
        var = tk.StringVar(value=default)
        entry_kwargs = {"textvariable": var, "font": ("Consolas", 10)}
        if show:
            entry_kwargs["show"] = show
        if width:
            entry_kwargs["width"] = width
        entry = ttk.Entry(frame, **entry_kwargs)
        entry.pack(fill=tk.X, pady=(2, 0))
        self.fields[key] = var

    def _get_config(self) -> dict:
        return {k: v.get() for k, v in self.fields.items()}

    def _log(self, msg: str):
        self.log_text.insert(tk.END, msg + "\n")
        self.log_text.see(tk.END)
        self.root.update_idletasks()

    def _test_connection(self):
        cfg = self._get_config()
        self._log("Testing UniFi connection...")
        self.status_var.set("Testing...")

        def do_test():
            try:
                import httpx
                with httpx.Client(verify=False, timeout=10) as client:
                    url = f"https://{cfg['unifi_host']}/api/auth/login"
                    r = client.post(url, json={
                        "username": cfg["unifi_username"],
                        "password": cfg["unifi_password"],
                    })
                    if r.status_code == 200:
                        self._log("UniFi: Connected successfully!")
                        self.status_var.set("UniFi connection OK")
                    else:
                        self._log(f"UniFi: Auth failed (HTTP {r.status_code})")
                        self.status_var.set("UniFi auth failed")
            except Exception as e:
                self._log(f"UniFi: Connection error - {e}")
                self.status_var.set("UniFi connection failed")

            # Test DB
            try:
                import psycopg2
                conn = psycopg2.connect(
                    host=cfg["db_host"], port=int(cfg["db_port"]),
                    dbname=cfg["db_name"], user=cfg["db_user"],
                    password=cfg["db_password"], connect_timeout=5,
                )
                conn.close()
                self._log("Database: Connected successfully!")
                self.status_var.set("All connections OK")
            except Exception as e:
                self._log(f"Database: Connection error - {e}")
                self.status_var.set("Database connection failed")

        threading.Thread(target=do_test, daemon=True).start()

    def _save_config(self):
        cfg = self._get_config()

        # Validate required fields
        if not cfg["unifi_host"] or not cfg["unifi_username"]:
            messagebox.showwarning("Missing Fields", "Please fill in the UniFi Controller fields.")
            return
        if not cfg["db_password"]:
            messagebox.showwarning("Missing Fields", "Please enter a database password.")
            return
        if not cfg["admin_password"]:
            messagebox.showwarning("Missing Fields", "Please set an admin password for the web UI.")
            return

        # Save non-sensitive config
        save_config(cfg)

        # Generate .env for backend
        env_content = generate_env(cfg)
        ENV_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(ENV_FILE, "w") as f:
            f.write(env_content)
        self._log(f"Backend .env written to {ENV_FILE}")

        # Generate frontend .env.local
        frontend_env = f"NEXT_PUBLIC_API_URL=http://localhost:{cfg['backend_port']}\n"
        FRONTEND_ENV.parent.mkdir(parents=True, exist_ok=True)
        with open(FRONTEND_ENV, "w") as f:
            f.write(frontend_env)
        self._log(f"Frontend .env.local written to {FRONTEND_ENV}")

        self.status_var.set("Configuration saved")
        self._log("Configuration saved successfully!")

    def _launch(self):
        cfg = self._get_config()

        # Save config first
        self._save_config()

        self._log("\n--- Launching Network Tracker ---")
        self.status_var.set("Starting...")
        self.launch_btn.configure(state="disabled")

        def do_launch():
            backend_port = cfg.get("backend_port", "8000")

            # Start backend
            self._log("Starting backend server...")
            try:
                env = os.environ.copy()
                self.backend_proc = subprocess.Popen(
                    [sys.executable, "-m", "uvicorn", "app.main:app",
                     "--host", "0.0.0.0", "--port", backend_port],
                    cwd=str(BACKEND_DIR), env=env,
                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                    creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
                )
                self._log(f"Backend started on port {backend_port} (PID: {self.backend_proc.pid})")
            except Exception as e:
                self._log(f"Backend error: {e}")
                self.root.after(0, lambda: self.launch_btn.configure(state="normal"))
                return

            # Wait for backend to be ready
            import time
            for i in range(30):
                time.sleep(1)
                try:
                    import httpx
                    r = httpx.get(f"http://localhost:{backend_port}/api/health", timeout=2)
                    if r.status_code == 200:
                        self._log("Backend is ready!")
                        break
                except Exception:
                    pass
            else:
                self._log("Warning: Backend may not be fully ready yet")

            # Create admin user if needed
            self._create_admin_user(cfg)

            # Start frontend
            frontend_port = cfg.get("frontend_port", "3000")
            self._log("Starting frontend...")
            try:
                npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
                self.frontend_proc = subprocess.Popen(
                    [npm_cmd, "run", "dev", "--", "-p", frontend_port],
                    cwd=str(FRONTEND_DIR),
                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                    creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
                )
                self._log(f"Frontend started on port {frontend_port} (PID: {self.frontend_proc.pid})")
            except Exception as e:
                self._log(f"Frontend error: {e}")

            self._log(f"\n--- Network Tracker is running! ---")
            self._log(f"Open http://localhost:{frontend_port} in your browser")
            self._log(f"API: http://localhost:{backend_port}/api/health")
            self._log(f"Login: {cfg['admin_username']} / (your password)")
            self.status_var.set(f"Running on http://localhost:{frontend_port}")

            # Open browser
            import webbrowser
            time.sleep(3)
            webbrowser.open(f"http://localhost:{frontend_port}")

        threading.Thread(target=do_launch, daemon=True).start()

    def _create_admin_user(self, cfg: dict):
        """Create admin user via the API's setup endpoint."""
        try:
            import httpx
            port = cfg.get("backend_port", "8000")
            # Try setup endpoint first (creates first user)
            r = httpx.post(
                f"http://localhost:{port}/api/auth/setup",
                json={
                    "username": cfg["admin_username"],
                    "email": cfg["admin_email"],
                    "password": cfg["admin_password"],
                },
                timeout=5,
            )
            if r.status_code == 200:
                self._log(f"Admin user '{cfg['admin_username']}' created")
            elif r.status_code == 409:
                self._log(f"Admin user '{cfg['admin_username']}' already exists")
            else:
                self._log(f"Admin setup: HTTP {r.status_code}")
        except Exception as e:
            self._log(f"Admin setup note: {e}")

    def on_close(self):
        if self.backend_proc or self.frontend_proc:
            if messagebox.askyesno("Quit", "Stop the running servers and exit?"):
                self._stop_servers()
                self.root.destroy()
        else:
            self.root.destroy()

    def _stop_servers(self):
        if self.backend_proc:
            try:
                self.backend_proc.terminate()
            except Exception:
                pass
        if self.frontend_proc:
            try:
                self.frontend_proc.terminate()
            except Exception:
                pass


def main():
    root = tk.Tk()

    # Set icon if available
    try:
        root.iconbitmap(default="")
    except Exception:
        pass

    app = SetupApp(root)
    root.protocol("WM_DELETE_WINDOW", app.on_close)
    root.mainloop()


if __name__ == "__main__":
    main()
