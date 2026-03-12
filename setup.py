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
from tkinter import messagebox
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

# ── Color Palette ──
BG           = "#0c0f1a"
SURFACE      = "#151929"
CARD         = "#1a1f35"
CARD_BORDER  = "#252b45"
ACCENT       = "#6366f1"
ACCENT_HOVER = "#818cf8"
ACCENT_DIM   = "#4f46e5"
TEXT         = "#e2e8f0"
TEXT_DIM     = "#94a3b8"
TEXT_MUTED   = "#64748b"
ENTRY_BG     = "#0f1225"
ENTRY_BORDER = "#2a3050"
SUCCESS      = "#22c55e"
ERROR        = "#ef4444"
WARNING      = "#f59e0b"
SEPARATOR    = "#1e2540"

FONT         = "Segoe UI"
FONT_MONO    = "Consolas"


def load_config() -> dict:
    defaults = {
        "unifi_host": "192.168.1.1",
        "unifi_username": "admin",
        "unifi_password": "",
        "unifi_site": "default",
        "db_host": "localhost",
        "db_port": "5432",
        "db_name": "tracking",
        "db_user": "postgres",
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


# ── Custom Widgets ──

class RoundedEntry(tk.Canvas):
    """A modern entry field with rounded corners drawn on canvas."""

    def __init__(self, parent, textvariable=None, show="", width=300, placeholder="", **kw):
        super().__init__(parent, width=width, height=38, bg=CARD, highlightthickness=0, **kw)
        self.var = textvariable or tk.StringVar()
        self.placeholder = placeholder
        self.show_char = show
        self._focused = False

        # Draw rounded rect
        self._border_id = self._round_rect(1, 1, width - 1, 37, 8, fill=ENTRY_BG, outline=ENTRY_BORDER, width=1)

        # Embedded entry
        self.entry = tk.Entry(
            self, textvariable=self.var, font=(FONT_MONO, 10),
            bg=ENTRY_BG, fg=TEXT, insertbackground=ACCENT,
            relief="flat", bd=0, highlightthickness=0,
        )
        if show:
            self.entry.configure(show=show)

        self.create_window(16, 19, window=self.entry, anchor="w", width=width - 32)

        # Placeholder
        if placeholder and not self.var.get():
            self.entry.insert(0, placeholder)
            self.entry.configure(fg=TEXT_MUTED)
            self._showing_placeholder = True
        else:
            self._showing_placeholder = False

        self.entry.bind("<FocusIn>", self._on_focus_in)
        self.entry.bind("<FocusOut>", self._on_focus_out)

    def _round_rect(self, x1, y1, x2, y2, r, **kw):
        points = [
            x1 + r, y1, x2 - r, y1, x2, y1, x2, y1 + r,
            x2, y2 - r, x2, y2, x2 - r, y2, x1 + r, y2,
            x1, y2, x1, y2 - r, x1, y1 + r, x1, y1,
        ]
        return self.create_polygon(points, smooth=True, **kw)

    def _on_focus_in(self, e):
        self._focused = True
        self.itemconfig(self._border_id, outline=ACCENT)
        if self._showing_placeholder:
            self.entry.delete(0, tk.END)
            self.entry.configure(fg=TEXT)
            if self.show_char:
                self.entry.configure(show=self.show_char)
            self._showing_placeholder = False

    def _on_focus_out(self, e):
        self._focused = False
        self.itemconfig(self._border_id, outline=ENTRY_BORDER)
        if not self.var.get() and self.placeholder:
            self.entry.configure(show="", fg=TEXT_MUTED)
            self.entry.insert(0, self.placeholder)
            self._showing_placeholder = True

    def get(self):
        if self._showing_placeholder:
            return ""
        return self.var.get()


class GradientButton(tk.Canvas):
    """A modern button with gradient-like appearance."""

    def __init__(self, parent, text="", command=None, width=160, height=40,
                 bg_color=ACCENT, hover_color=ACCENT_HOVER, style="primary", **kw):
        super().__init__(parent, width=width, height=height,
                         bg=self._parent_bg(parent), highlightthickness=0, **kw)
        self.command = command
        self.bg_color = bg_color
        self.hover_color = hover_color
        self._enabled = True

        if style == "secondary":
            self.bg_color = CARD
            self.hover_color = CARD_BORDER
            fg = TEXT_DIM
            border = CARD_BORDER
        else:
            fg = "#ffffff"
            border = bg_color

        self._rect = self._round_rect(0, 0, width, height, 10,
                                        fill=self.bg_color, outline=border, width=1)
        self._text = self.create_text(width // 2, height // 2, text=text,
                                       fill=fg, font=(FONT, 10, "bold"))

        self.bind("<Enter>", self._on_enter)
        self.bind("<Leave>", self._on_leave)
        self.bind("<Button-1>", self._on_click)

    def _parent_bg(self, parent):
        try:
            return parent.cget("bg")
        except Exception:
            return BG

    def _round_rect(self, x1, y1, x2, y2, r, **kw):
        points = [
            x1 + r, y1, x2 - r, y1, x2, y1, x2, y1 + r,
            x2, y2 - r, x2, y2, x2 - r, y2, x1 + r, y2,
            x1, y2, x1, y2 - r, x1, y1 + r, x1, y1,
        ]
        return self.create_polygon(points, smooth=True, **kw)

    def _on_enter(self, e):
        if self._enabled:
            self.itemconfig(self._rect, fill=self.hover_color)
            self.configure(cursor="hand2")

    def _on_leave(self, e):
        if self._enabled:
            self.itemconfig(self._rect, fill=self.bg_color)

    def _on_click(self, e):
        if self._enabled and self.command:
            self.command()

    def set_enabled(self, enabled):
        self._enabled = enabled
        if not enabled:
            self.itemconfig(self._rect, fill=TEXT_MUTED)
            self.itemconfig(self._text, fill="#666")
        else:
            self.itemconfig(self._rect, fill=self.bg_color)
            self.itemconfig(self._text, fill="#ffffff")


# ── Main Application ──

class SetupApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("NetMonitor — Setup Wizard")
        self.root.geometry("780x820")
        self.root.minsize(700, 600)
        self.root.configure(bg=BG)

        self.cfg = load_config()
        self.backend_proc = None
        self.frontend_proc = None
        self.fields = {}

        self._build_ui()

    def _build_ui(self):
        # ── Header ──
        header = tk.Frame(self.root, bg=BG)
        header.pack(fill=tk.X, padx=32, pady=(28, 0))

        # Logo row
        logo_frame = tk.Frame(header, bg=BG)
        logo_frame.pack(anchor="w")

        # Logo icon (drawn circle with wifi symbol)
        logo_canvas = tk.Canvas(logo_frame, width=42, height=42, bg=BG, highlightthickness=0)
        logo_canvas.pack(side="left", padx=(0, 14))
        # Gradient-like circle
        logo_canvas.create_oval(0, 0, 42, 42, fill=ACCENT, outline="")
        logo_canvas.create_text(21, 21, text="\u2022", fill="#fff", font=(FONT, 8))
        # Wifi arcs
        for i, r in enumerate([8, 14, 20]):
            logo_canvas.create_arc(21 - r, 21 - r, 21 + r, 21 + r,
                                    start=45, extent=90, style="arc",
                                    outline="#fff", width=2)

        title_frame = tk.Frame(logo_frame, bg=BG)
        title_frame.pack(side="left")
        tk.Label(title_frame, text="NetMonitor", font=(FONT, 20, "bold"),
                 fg=TEXT, bg=BG).pack(anchor="w")
        tk.Label(title_frame, text="SETUP WIZARD", font=(FONT, 9),
                 fg=TEXT_MUTED, bg=BG, anchor="w").pack(anchor="w")

        # Divider
        tk.Frame(self.root, bg=SEPARATOR, height=1).pack(fill=tk.X, padx=32, pady=(20, 0))

        # ── Scrollable Content ──
        container = tk.Frame(self.root, bg=BG)
        container.pack(fill=tk.BOTH, expand=True, padx=32, pady=(0, 0))

        canvas = tk.Canvas(container, bg=BG, highlightthickness=0, bd=0)
        scrollbar = tk.Scrollbar(container, orient="vertical", command=canvas.yview,
                                  bg=SURFACE, troughcolor=BG, width=6)
        self.scroll_frame = tk.Frame(canvas, bg=BG)

        self.scroll_frame.bind("<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=self.scroll_frame, anchor="nw", tags="frame")
        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.bind("<Configure>", lambda e: canvas.itemconfig("frame", width=e.width))

        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        canvas.bind_all("<MouseWheel>", _on_mousewheel)

        canvas.pack(side="left", fill=tk.BOTH, expand=True)
        scrollbar.pack(side="right", fill=tk.Y)

        content = self.scroll_frame

        # ── Sections ──
        # UniFi Controller
        self._section_header(content, "UNIFI CONTROLLER", "Connection to your UniFi gateway")
        card1 = self._card(content)
        r1 = tk.Frame(card1, bg=CARD)
        r1.pack(fill=tk.X, pady=(0, 4))
        self._field(r1, "unifi_host", "Controller IP / Hostname", self.cfg["unifi_host"],
                    placeholder="e.g. 192.168.1.1", side=True, weight=3)
        self._field(r1, "unifi_site", "Site", self.cfg["unifi_site"],
                    placeholder="default", side=True, weight=1)
        self._field(card1, "unifi_username", "Username", self.cfg["unifi_username"],
                    placeholder="admin")
        self._field(card1, "unifi_password", "Password", self.cfg["unifi_password"],
                    show="*", placeholder="UniFi password")

        # Database
        self._section_header(content, "POSTGRESQL DATABASE", "Where tracking data is stored")
        card2 = self._card(content)
        r2 = tk.Frame(card2, bg=CARD)
        r2.pack(fill=tk.X, pady=(0, 4))
        self._field(r2, "db_host", "Host", self.cfg["db_host"],
                    placeholder="localhost", side=True, weight=3)
        self._field(r2, "db_port", "Port", self.cfg["db_port"],
                    placeholder="5432", side=True, weight=1)
        r3 = tk.Frame(card2, bg=CARD)
        r3.pack(fill=tk.X, pady=(0, 4))
        self._field(r3, "db_name", "Database Name", self.cfg["db_name"],
                    placeholder="tracking", side=True, weight=1)
        self._field(r3, "db_user", "Username", self.cfg["db_user"],
                    placeholder="postgres", side=True, weight=1)
        self._field(card2, "db_password", "Password", self.cfg["db_password"],
                    show="*", placeholder="PostgreSQL password")

        # Admin Account
        self._section_header(content, "ADMIN ACCOUNT", "Credentials for the web dashboard")
        card3 = self._card(content)
        r4 = tk.Frame(card3, bg=CARD)
        r4.pack(fill=tk.X, pady=(0, 4))
        self._field(r4, "admin_username", "Username", self.cfg["admin_username"],
                    placeholder="admin", side=True, weight=1)
        self._field(r4, "admin_email", "Email", self.cfg["admin_email"],
                    placeholder="admin@local.net", side=True, weight=2)
        self._field(card3, "admin_password", "Password", self.cfg["admin_password"],
                    show="*", placeholder="Dashboard login password")

        # Server Ports
        self._section_header(content, "SERVER PORTS", "Network ports for backend and frontend")
        card4 = self._card(content)
        r5 = tk.Frame(card4, bg=CARD)
        r5.pack(fill=tk.X)
        self._field(r5, "backend_port", "Backend API", self.cfg["backend_port"],
                    placeholder="8000", side=True, weight=1)
        self._field(r5, "frontend_port", "Frontend UI", self.cfg["frontend_port"],
                    placeholder="3000", side=True, weight=1)

        # ── Action Buttons ──
        btn_area = tk.Frame(content, bg=BG)
        btn_area.pack(fill=tk.X, pady=(24, 8))

        btn_row = tk.Frame(btn_area, bg=BG)
        btn_row.pack(fill=tk.X)

        self.test_btn = GradientButton(btn_row, text="Test Connection", width=155, height=38,
                                        command=self._test_connection, style="secondary")
        self.test_btn.pack(side="left", padx=(0, 8))

        self.save_btn = GradientButton(btn_row, text="Save Config", width=130, height=38,
                                        command=self._save_config, style="secondary")
        self.save_btn.pack(side="left", padx=(0, 8))

        self.launch_btn = GradientButton(btn_row, text="Launch Tracker", width=180, height=42,
                                          command=self._launch, style="primary")
        self.launch_btn.pack(side="right")

        # ── Log Output ──
        log_label = tk.Frame(content, bg=BG)
        log_label.pack(fill=tk.X, pady=(20, 6))
        tk.Label(log_label, text="OUTPUT", font=(FONT, 9, "bold"),
                 fg=TEXT_MUTED, bg=BG).pack(anchor="w")

        log_card = tk.Frame(content, bg=CARD, bd=0, highlightbackground=CARD_BORDER,
                            highlightthickness=1)
        log_card.pack(fill=tk.BOTH, expand=True, pady=(0, 12))

        self.log_text = tk.Text(
            log_card, height=7, bg=CARD, fg=TEXT_DIM,
            insertbackground=TEXT, font=(FONT_MONO, 9),
            wrap=tk.WORD, bd=0, highlightthickness=0,
            padx=14, pady=10, spacing1=2,
        )
        self.log_text.pack(fill=tk.BOTH, expand=True)
        self.log_text.configure(state="disabled")

        # ── Status Bar ──
        status_frame = tk.Frame(self.root, bg=SURFACE, height=36)
        status_frame.pack(fill=tk.X, side="bottom")
        status_frame.pack_propagate(False)

        self.status_dot = tk.Canvas(status_frame, width=8, height=8, bg=SURFACE, highlightthickness=0)
        self.status_dot.pack(side="left", padx=(16, 6), pady=14)
        self.status_dot.create_oval(0, 0, 8, 8, fill=TEXT_MUTED, outline="")

        self.status_var = tk.StringVar(value="Ready")
        tk.Label(status_frame, textvariable=self.status_var, font=(FONT, 9),
                 fg=TEXT_MUTED, bg=SURFACE).pack(side="left")

        tk.Label(status_frame, text="v1.0.0", font=(FONT, 9),
                 fg=TEXT_MUTED, bg=SURFACE).pack(side="right", padx=16)

    def _section_header(self, parent, title, subtitle=""):
        frame = tk.Frame(parent, bg=BG)
        frame.pack(fill=tk.X, pady=(20, 8))
        tk.Label(frame, text=title, font=(FONT, 10, "bold"),
                 fg=ACCENT, bg=BG).pack(anchor="w")
        if subtitle:
            tk.Label(frame, text=subtitle, font=(FONT, 9),
                     fg=TEXT_MUTED, bg=BG).pack(anchor="w", pady=(1, 0))

    def _card(self, parent):
        outer = tk.Frame(parent, bg=CARD_BORDER)
        outer.pack(fill=tk.X, pady=(0, 4))
        card = tk.Frame(outer, bg=CARD, padx=20, pady=16)
        card.pack(fill=tk.X, padx=1, pady=1)
        return card

    def _field(self, parent, key, label, default="", show="", placeholder="",
               side=False, weight=1):
        if side:
            frame = tk.Frame(parent, bg=CARD)
            frame.pack(side="left", fill=tk.X, expand=True, padx=(0, 12))
        else:
            frame = tk.Frame(parent, bg=CARD)
            frame.pack(fill=tk.X, pady=(0, 8))

        tk.Label(frame, text=label, font=(FONT, 9), fg=TEXT_DIM, bg=CARD).pack(anchor="w")

        var = tk.StringVar(value=default)
        entry = tk.Entry(
            frame, textvariable=var, font=(FONT_MONO, 10),
            bg=ENTRY_BG, fg=TEXT, insertbackground=ACCENT,
            relief="flat", bd=0, highlightthickness=1,
            highlightbackground=ENTRY_BORDER, highlightcolor=ACCENT,
        )
        if show:
            entry.configure(show=show)

        entry.pack(fill=tk.X, pady=(4, 0), ipady=6)
        self.fields[key] = var

    def _get_config(self) -> dict:
        return {k: v.get() for k, v in self.fields.items()}

    def _log(self, msg: str, tag=None):
        self.log_text.configure(state="normal")
        if tag == "success":
            self.log_text.insert(tk.END, msg + "\n", "success")
        elif tag == "error":
            self.log_text.insert(tk.END, msg + "\n", "error")
        else:
            self.log_text.insert(tk.END, msg + "\n")
        self.log_text.see(tk.END)
        self.log_text.configure(state="disabled")
        self.root.update_idletasks()

    def _set_status(self, msg, color=TEXT_MUTED):
        self.status_var.set(msg)
        self.status_dot.delete("all")
        self.status_dot.create_oval(0, 0, 8, 8, fill=color, outline="")

    def _test_connection(self):
        cfg = self._get_config()
        self._log("Testing connections...")
        self._set_status("Testing...", WARNING)

        def do_test():
            unifi_ok = False
            db_ok = False

            # Test UniFi
            try:
                import httpx
                with httpx.Client(verify=False, timeout=10) as client:
                    url = f"https://{cfg['unifi_host']}/api/auth/login"
                    r = client.post(url, json={
                        "username": cfg["unifi_username"],
                        "password": cfg["unifi_password"],
                    })
                    if r.status_code == 200:
                        self._log("  UniFi: Connected successfully", "success")
                        unifi_ok = True
                    else:
                        self._log(f"  UniFi: Auth failed (HTTP {r.status_code})", "error")
            except Exception as e:
                self._log(f"  UniFi: {e}", "error")

            # Test DB
            try:
                import psycopg2
                try:
                    conn = psycopg2.connect(
                        host=cfg["db_host"], port=int(cfg["db_port"]),
                        dbname=cfg["db_name"], user=cfg["db_user"],
                        password=cfg["db_password"], connect_timeout=5,
                    )
                    conn.close()
                    self._log(f"  Database: Connected to '{cfg['db_name']}'", "success")
                    db_ok = True
                except psycopg2.OperationalError as db_err:
                    if "does not exist" in str(db_err):
                        self._log(f"  Database '{cfg['db_name']}' not found — creating...")
                        conn = psycopg2.connect(
                            host=cfg["db_host"], port=int(cfg["db_port"]),
                            dbname="postgres", user=cfg["db_user"],
                            password=cfg["db_password"], connect_timeout=5,
                        )
                        conn.autocommit = True
                        cur = conn.cursor()
                        cur.execute(f'CREATE DATABASE "{cfg["db_name"]}"')
                        cur.close()
                        conn.close()
                        self._log(f"  Database '{cfg['db_name']}' created", "success")
                        db_ok = True
                    else:
                        raise db_err
            except Exception as e:
                self._log(f"  Database: {e}", "error")

            if unifi_ok and db_ok:
                self._set_status("All connections OK", SUCCESS)
            elif unifi_ok or db_ok:
                self._set_status("Partial connection", WARNING)
            else:
                self._set_status("Connection failed", ERROR)

        threading.Thread(target=do_test, daemon=True).start()

    def _save_config(self):
        cfg = self._get_config()

        if not cfg["unifi_host"] or not cfg["unifi_username"]:
            messagebox.showwarning("Missing Fields", "Please fill in the UniFi Controller fields.")
            return
        if not cfg["db_password"]:
            messagebox.showwarning("Missing Fields", "Please enter a database password.")
            return
        if not cfg["admin_password"]:
            messagebox.showwarning("Missing Fields", "Please set an admin password for the web UI.")
            return

        save_config(cfg)

        env_content = generate_env(cfg)
        ENV_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(ENV_FILE, "w") as f:
            f.write(env_content)

        frontend_env = f"NEXT_PUBLIC_API_URL=http://localhost:{cfg['backend_port']}\n"
        FRONTEND_ENV.parent.mkdir(parents=True, exist_ok=True)
        with open(FRONTEND_ENV, "w") as f:
            f.write(frontend_env)

        self._log("Configuration saved", "success")
        self._set_status("Configuration saved", SUCCESS)

    def _launch(self):
        cfg = self._get_config()
        self._save_config()

        self._log("\nLaunching Network Tracker...")
        self._set_status("Starting...", WARNING)
        self.launch_btn.set_enabled(False)

        def do_launch():
            backend_port = cfg.get("backend_port", "8000")

            self._log("  Starting backend server...")
            try:
                env = os.environ.copy()
                self.backend_proc = subprocess.Popen(
                    [sys.executable, "-m", "uvicorn", "app.main:app",
                     "--host", "0.0.0.0", "--port", backend_port],
                    cwd=str(BACKEND_DIR), env=env,
                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                    creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
                )
                self._log(f"  Backend started on port {backend_port}", "success")
            except Exception as e:
                self._log(f"  Backend error: {e}", "error")
                self.root.after(0, lambda: self.launch_btn.set_enabled(True))
                return

            import time
            for i in range(30):
                time.sleep(1)
                try:
                    import httpx
                    r = httpx.get(f"http://localhost:{backend_port}/api/health", timeout=2)
                    if r.status_code == 200:
                        self._log("  Backend is ready", "success")
                        break
                except Exception:
                    pass
            else:
                self._log("  Backend may not be fully ready", "error")

            self._create_admin_user(cfg)

            frontend_port = cfg.get("frontend_port", "3000")
            self._log("  Starting frontend...")
            try:
                npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
                self.frontend_proc = subprocess.Popen(
                    [npm_cmd, "run", "dev", "--", "-p", frontend_port],
                    cwd=str(FRONTEND_DIR),
                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                    creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
                )
                self._log(f"  Frontend started on port {frontend_port}", "success")
            except Exception as e:
                self._log(f"  Frontend error: {e}", "error")

            self._log(f"\nNetwork Tracker is running!", "success")
            self._log(f"  Dashboard: http://localhost:{frontend_port}")
            self._log(f"  API:       http://localhost:{backend_port}/api/health")
            self._log(f"  Login:     {cfg['admin_username']}")
            self._set_status(f"Running — http://localhost:{frontend_port}", SUCCESS)

            import webbrowser
            time.sleep(3)
            webbrowser.open(f"http://localhost:{frontend_port}")

        threading.Thread(target=do_launch, daemon=True).start()

    def _create_admin_user(self, cfg: dict):
        try:
            import httpx
            port = cfg.get("backend_port", "8000")
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
                self._log(f"  Admin user '{cfg['admin_username']}' created", "success")
            elif r.status_code == 409:
                self._log(f"  Admin user already exists")
            else:
                self._log(f"  Admin setup: HTTP {r.status_code}")
        except Exception as e:
            self._log(f"  Admin setup: {e}")

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

    try:
        root.iconbitmap(default="")
    except Exception:
        pass

    # Configure text tags for colored log output
    app = SetupApp(root)
    app.log_text.configure(state="normal")
    app.log_text.tag_configure("success", foreground=SUCCESS)
    app.log_text.tag_configure("error", foreground=ERROR)
    app.log_text.configure(state="disabled")

    root.protocol("WM_DELETE_WINDOW", app.on_close)
    root.mainloop()


if __name__ == "__main__":
    main()
