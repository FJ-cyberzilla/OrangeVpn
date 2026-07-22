# 🛸 ORANGE™ Alien Tier Stealth Network Client v4.0 (2026 SOTA)

ORANGE™ is a state-of-the-art, military-grade cryptographic proxy and stealth network suite engineered specifically for extreme censorship-evasion, deep-packet-inspection (DPI) resilience, and zero-log privacy. 

This client integrates a React 19 / Vite frontend with a high-performance Express & SQLite server to emulate, encapsulate, and secure internet traffic under adverse conditions.

---

## 👽 "Alien Tier" Professional Status Overview

*   **Header Box**: Enclosed inside a distinctive, heavy-contrast orange margin box styled with high visual density.
*   **Alien Tier branding**: Set in high-visibility retro **vintage green** display typography.
*   **DNS Status Indicator**: Fully dynamic color-coded security monitoring:
    *   **Vintage Green** (`Secured & Private`): When the active tunnel is connected and loopback-bound isolation shield is verified.
    *   **Amber Yellow** (`Secured (Waiting Connection)`): When configured but tunnel synchronization is in progress.
    *   **Alert Red** (`Unsecured (Leak Risk!)`): When cleartext UDP/53 leakage risk is present.

---

## 🛸 Core System Architecture & Features

### 1. 2026 State-of-the-Art (SOTA) Protocol Suite
Our adaptive protocol manager bridges between advanced modern transport envelopes dynamically matching network constraints:
*   **VLESS-XTLS-Reality**: Bypasses active probing by spoofing handshakes as standard TLS 1.3 web sessions.
*   **Hysteria 2**: Highly optimized UDP congestion control designed to drill through heavy ISP throttling.
*   **TUIC v5**: QUIC-based multiplexed transport with low-overhead connection establishment.
*   **WireGuard-Obfs**: WireGuard layer obfuscated via dynamic XOR-payload scrambling.

### 2. SOTA Stealth Engine v4.0
Allows deep, packet-level morphing to mimic benign global traffic:
*   **Packet Morphing**: Dynamically alters MTU and length headers to mimic standard video streams (HTTPS/Netflix).
*   **Timing Jitter**: Randomizes inter-packet arrival times to defeat timing-analysis algorithms.
*   **ALPN Spoofing**: Forces HTTP/3 and HTTP/2 Negotiation protocols.
*   **Chaff Traffic**: Injects random decoy bytes inside active sockets to confuse byte-pattern detectors.

### 3. DPI Bypass Suite
An active defence mechanism to split and mangle handshakes:
*   **TLS Fragmentation**: Splits ClientHello handshakes across multi-TCP segment boundaries, causing DPI middleboxes to fail to reassemble SNI fields.
*   **Length Manipulation**: Inserts dynamic padding into payload structures.
*   **SNI Padding**: Emulates legitimate white-listed domains.

### 4. Advanced ISP-Specific Connection Logic
Built-in heuristic triggers detect the active carrier on-mount and apply automated SOTA overrides:
*   **MCI NET (Mobile Communications Iran)**: (Blue indicator) Forces strict TCP mode, binds to secure Port 443, enforces `google.com` SNI mask, and sets VLESS-XTLS-Reality.
*   **MTN IRANCELL**: (Amber Yellow indicator) Enforces TLS Fragmentation, enables UDP Obfuscation, applies `bing.com` SNI mask, and sets Hysteria 2.
*   **WIFI ISP**: (Light Blue indicator) Activates WireGuard-Obfs.
*   **CLEAN - MASKED**: (Green indicator) Restores default high-performance tunnel routines.

### 5. Multi-Hop Cryptographic Routing Tunnels
Enables double-hop transit cascades (Transit Node -> Exit Node) to fully decouple connection source from destination.

### 6. DNS Leak Prevention Shield
Queries are bound strictly to isolated local loopback adapters (`10.255.0.1`), routing upstreams through encrypted DoH/DoQ tunnels. An interactive **Live DNS Leak Diagnostic Check** sweeps five global recursive resolver nodes in real-time to confirm encapsulation integrity.

---

## 🔒 Security & Data Integrity Ledger

### 1. Zero-Log Integrity
Schedules volatile session garbage collection loops. All active encryption keys and ephemeral handshakes exist in RAM-only caches and are instantly purged on disconnections.

### 2. Parametrization & Whitelist Protection
All backend operations are strictly validated against a hard-coded whitelisted registry:
*   **SQL Injection Prevention**: Prepared statements block SQL Injection vectors.
*   **Input Validation**: API payload keys are scrubbed and verified before processing.

---

## 🛠 Execution & Getting Started

1.  **Deploy Dependencies**:
    ```bash
    npm install
    ```
2.  **Launch Dev Server**:
    ```bash
    npm run dev
    ```
3.  **Produce Production Bundle**:
    ```bash
    npm run build
    ```
4.  **Launch stand-alone node**:
    ```bash
    npm run start
    ```

---
*FJ™- Cybertronic Systems (2026 Core Release)*
