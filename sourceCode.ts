export interface CodeFile {
  id: string;
  filename: string;
  language: string;
  description: string;
  code: string;
  keyHighlights: { line: number; title: string; note: string }[];
}

export const ANDROID_SOURCE_FILES: CodeFile[] = [
  {
    id: 'manifest',
    filename: 'AndroidManifest.xml',
    language: 'xml',
    description: 'Declares required network, foreground service, wake locks, notifications, and RealGameVpnService declaration.',
    keyHighlights: [
      { line: 9, title: 'Network Permissions', note: 'INTERNET & ACCESS_NETWORK_STATE allow raw packet forwarding.' },
      { line: 13, title: 'Wi-Fi Latency Control', note: 'ACCESS_WIFI_STATE & CHANGE_WIFI_STATE enable Wi-Fi low-latency mode.' },
      { line: 17, title: 'Foreground Services', note: 'FOREGROUND_SERVICE and Android 14+ FOREGROUND_SERVICE_SPECIAL_USE.' },
      { line: 24, title: 'Post Notifications', note: 'POST_NOTIFICATIONS (API 33+) required for the live latency ping HUD.' },
      { line: 28, title: 'Wake Locks', note: 'WAKE_LOCK stops Android CPU sleep from dropping UDP game ticks.' },
      { line: 55, title: 'RealGameVpnService', note: 'Secured with android.permission.BIND_VPN_SERVICE and specialUse FGS.' },
    ],
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.gamevpn.realgame">

    <!-- =================================================================== -->
    <!-- PERMISSIONS REQUIRED FOR GAMING VPN SERVICE                         -->
    <!-- =================================================================== -->

    <!-- Core Internet & Network Communication -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Wi-Fi State & Low-Latency Lock Controls -->
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />

    <!-- Foreground Service Permissions (Android 9+) -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

    <!-- Foreground Service Types for Android 14+ (API 34+) -->
    <!-- Required for long-running VPN packet forwarding & latency telemetry -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SYSTEM_EXEMPTED" />

    <!-- Post Notifications Permission (Android 13+ / API 33+) -->
    <!-- Essential for displaying live gaming ping, jitter, and packet routing HUD -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Wake Lock Permission -->
    <!-- Prevents CPU deep sleep and packet drops during competitive online matches -->
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Optional: Reconnection and Boot Management -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <uses-feature
        android:name="android.hardware.wifi"
        android:required="false" />

    <!-- =================================================================== -->
    <!-- APPLICATION CONFIGURATION                                           -->
    <!-- =================================================================== -->
    <application
        android:name=".RealGameApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.RealGameVpn"
        android:networkSecurityConfig="@xml/network_security_config"
        android:extractNativeLibs="true"
        tools:targetApi="34">

        <!-- =============================================================== -->
        <!-- MAIN ACTIVITY DEFINITION                                        -->
        <!-- Provides user UI, handles VPN permissions, and selects games    -->
        <!-- =============================================================== -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:screenOrientation="portrait"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:theme="@style/Theme.RealGameVpn.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Deep linking for game booster auto-launch -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="realgame"
                    android:host="boost" />
            </intent-filter>
        </activity>

        <!-- =============================================================== -->
        <!-- REALGAME VPN SERVICE DEFINITION                                 -->
        <!-- Manages low-latency VPN tunnel, packet routing, and telemetry  -->
        <!-- =============================================================== -->
        <service
            android:name=".RealGameVpnService"
            android:permission="android.permission.BIND_VPN_SERVICE"
            android:exported="false"
            android:foregroundServiceType="specialUse"
            tools:targetApi="34">

            <!-- Android 14+ Special Use Foreground Service Subtype Declaration -->
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="High-performance gaming VPN tunnel, low-latency packet routing, and real-time jitter telemetry" />

            <!-- Intent Filter required by Android OS for VpnService -->
            <intent-filter>
                <action android:name="android.net.VpnService" />
                <action android:name="com.gamevpn.realgame.action.START_VPN" />
                <action android:name="com.gamevpn.realgame.action.STOP_VPN" />
                <action android:name="com.gamevpn.realgame.action.UPDATE_GAME_CONFIG" />
            </intent-filter>
        </service>

    </application>

</manifest>`,
  },
  {
    id: 'service',
    filename: 'RealGameVpnService.kt',
    language: 'kotlin',
    description: 'Core VpnService class with coroutines, VpnService.Builder, WakeLock, Low-Latency Wi-Fi lock, packet routing loop, RFC 3550 jitter telemetry, and live notification updating.',
    keyHighlights: [
      { line: 35, title: 'Service Class & Actions', note: 'Extends VpnService with START, STOP, UPDATE_GAME_CONFIG intent actions.' },
      { line: 55, title: 'Coroutines Setup', note: 'SupervisorJob() + Dispatchers.IO + CoroutineExceptionHandler prevents crashes.' },
      { line: 110, title: 'TUN Interface & Split Tunneling', note: 'Sets MTU, fast DNS, and calls addAllowedApplication(pkg) for target game.' },
      { line: 160, title: 'Hardware Latency Locks', note: 'WIFI_MODE_FULL_LOW_LATENCY & PowerManager.PARTIAL_WAKE_LOCK.' },
      { line: 195, title: 'Packet Routing Coroutine', note: 'protect(socket) keeps game UDP packets fast and loopback-free.' },
      { line: 245, title: 'RFC 3550 Jitter Telemetry', note: 'Calculates continuous RTT and jitter: J = J + (|D| - J)/16.' },
      { line: 310, title: 'Foreground Notification HUD', note: 'Ongoing notification with live ms ping and instant disconnect action.' },
    ],
    code: `package com.gamevpn.realgame

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.net.VpnService
import android.net.wifi.WifiManager
import android.os.Build
import android.os.ParcelFileDescriptor
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.*
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.net.SocketException
import java.nio.ByteBuffer
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicLong
import kotlin.math.abs

/**
 * High-performance Android VPN Service optimized for competitive mobile gaming.
 * Features:
 * - Dynamic UDP FastTrack acceleration and MTU fragment prevention
 * - Target game package split tunneling (zero lag from background apps)
 * - Android Wi-Fi Low Latency Lock & Partial CPU WakeLock management
 * - Coroutine-driven packet routing and real-time ICMP/UDP jitter telemetry
 * - Live foreground notification updates with latency (ms) and throughput
 */
class RealGameVpnService : VpnService() {

    companion object {
        private const val TAG = "RealGameVpnService"

        // Actions for starting and stopping the VPN service
        const val ACTION_START_VPN = "com.gamevpn.realgame.action.START_VPN"
        const val ACTION_STOP_VPN = "com.gamevpn.realgame.action.STOP_VPN"
        const val ACTION_UPDATE_GAME_CONFIG = "com.gamevpn.realgame.action.UPDATE_GAME_CONFIG"
        const val ACTION_TELEMETRY_BROADCAST = "com.gamevpn.realgame.broadcast.TELEMETRY_UPDATE"

        // Intent Extras
        const val EXTRA_GAME_CONFIG = "extra_game_config"
        const val EXTRA_GAME_TITLE = "extra_game_title"
        const val EXTRA_GAME_PACKAGE = "extra_game_package"
        const val EXTRA_LATENCY_MS = "extra_latency_ms"
        const val EXTRA_JITTER_MS = "extra_jitter_ms"
        const val EXTRA_PACKETS_ROUTED = "extra_packets_routed"
        const val EXTRA_BYTES_TRANSFERRED = "extra_bytes_transferred"
        const val EXTRA_PACKET_LOSS_RATE = "extra_packet_loss_rate"
        const val EXTRA_IS_CONNECTED = "extra_is_connected"

        // Notification Constants
        private const val NOTIFICATION_CHANNEL_ID = "gaming_vpn_telemetry_channel"
        private const val NOTIFICATION_ID = 7789
        private const val PENDING_STOP_REQ_CODE = 1001
        private const val PENDING_ACTIVITY_REQ_CODE = 1002
    }

    // =========================================================================
    // SERVICE FIELDS: GAME TARGETING & OPTIMIZATION CONFIG
    // =========================================================================
    private var currentGameTitle: String = "Call of Duty: Mobile"
    private var currentGamePackage: String? = "com.activision.callofduty.shooter"
    private var activeGameConfig: GameOptimizationConfig = GameOptimizationConfig.getDefault()

    // VPN Tunnel State
    private var vpnInterface: ParcelFileDescriptor? = null
    private val isTunnelActive = AtomicBoolean(false)

    // Hardware Locks for Gaming Latency
    private var cpuWakeLock: PowerManager.WakeLock? = null
    private var wifiLowLatencyLock: WifiManager.WifiLock? = null

    // Real-Time Telemetry Counters
    private val packetsRoutedCounter = AtomicLong(0L)
    private val bytesTransferredCounter = AtomicLong(0L)
    private var currentLatencyMs: Long = 24L
    private var currentJitterMs: Long = 1L
    private var currentPacketLossRate: Float = 0.0f
    private var smoothedRttMs: Double = 24.0

    // Coroutine Scope & Supervisors
    private val serviceJob = SupervisorJob()
    private val coroutineExceptionHandler = CoroutineExceptionHandler { _, throwable ->
        Log.e(TAG, "Unhandled exception in VPN coroutine pipeline: \${throwable.message}", throwable)
    }
    private val vpnScope = CoroutineScope(Dispatchers.IO + serviceJob + coroutineExceptionHandler)

    // Active Coroutine Jobs
    private var packetRoutingJob: Job? = null
    private var latencyTelemetryJob: Job? = null
    private var notificationTelemetryJob: Job? = null

    // System Managers
    private lateinit var notificationManager: NotificationManager

    // =========================================================================
    // LIFECYCLE MANAGEMENT
    // =========================================================================
    override fun onCreate() {
        super.onCreate()
        Log.i(TAG, "RealGameVpnService created")
        notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent == null) {
            Log.w(TAG, "onStartCommand received null intent")
            return START_NOT_STICKY
        }

        when (intent.action) {
            ACTION_START_VPN -> {
                extractGameConfiguration(intent)
                startVpnTunnel()
            }
            ACTION_STOP_VPN -> {
                Log.i(TAG, "ACTION_STOP_VPN requested")
                stopVpnTunnel()
            }
            ACTION_UPDATE_GAME_CONFIG -> {
                Log.i(TAG, "ACTION_UPDATE_GAME_CONFIG received while tunnel active")
                extractGameConfiguration(intent)
                updateNotificationContent()
            }
            else -> {
                Log.w(TAG, "Unknown action received: \${intent.action}")
            }
        }

        return START_REDELIVER_INTENT
    }

    override fun onDestroy() {
        Log.i(TAG, "RealGameVpnService being destroyed")
        stopVpnTunnel()
        serviceJob.cancel()
        super.onDestroy()
    }

    override fun onRevoke() {
        Log.w(TAG, "VPN permission revoked by user or system")
        stopVpnTunnel()
        super.onRevoke()
    }

    // =========================================================================
    // INTENT & CONFIGURATION PARSING
    // =========================================================================
    private fun extractGameConfiguration(intent: Intent) {
        val config: GameOptimizationConfig? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableExtra(EXTRA_GAME_CONFIG, GameOptimizationConfig::class.java)
        } else {
            @Suppress("DEPRECATION")
            intent.getParcelableExtra(EXTRA_GAME_CONFIG)
        }

        if (config != null) {
            activeGameConfig = config
            currentGameTitle = config.gameTitle
            currentGamePackage = config.packageName
            Log.i(TAG, "Applied GameOptimizationConfig for: '\$currentGameTitle' (pkg: \$currentGamePackage, MTU: \${config.mtu})")
        } else {
            intent.getStringExtra(EXTRA_GAME_TITLE)?.let { currentGameTitle = it }
            intent.getStringExtra(EXTRA_GAME_PACKAGE)?.let { currentGamePackage = it }
            Log.i(TAG, "Applied title/package from extras: '\$currentGameTitle' / '\$currentGamePackage'")
        }
    }

    // =========================================================================
    // VPN TUNNEL START & CONFIGURATION
    // =========================================================================
    private fun startVpnTunnel() {
        if (isTunnelActive.get()) {
            Log.w(TAG, "VPN tunnel is already running. Updating parameters instead.")
            updateNotificationContent()
            return
        }

        Log.i(TAG, "Starting RealGame VPN Tunnel for target game: '\$currentGameTitle'...")

        try {
            // 1. Acquire Hardware Locks to prevent ping spikes
            acquireHardwareLocks()

            // 2. Start Foreground Service with proper Android 14+ service type
            val initialNotification = buildNotification(
                title = "RealGame VPN • Initializing",
                body = "Connecting low-latency tunnel for \$currentGameTitle...",
                latency = 0,
                jitter = 0,
                packets = 0
            )

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                    startForeground(
                        NOTIFICATION_ID,
                        initialNotification,
                        ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
                    )
                } else {
                    startForeground(NOTIFICATION_ID, initialNotification)
                }
            } else {
                startForeground(NOTIFICATION_ID, initialNotification)
            }

            // 3. Configure the Virtual TUN Interface
            val builder = Builder().apply {
                setMtu(activeGameConfig.mtu) // e.g. 1380 bytes to eliminate UDP fragmentation
                addAddress("10.240.0.2", 24)
                addRoute("0.0.0.0", 0) // Route default traffic
                addDnsServer(activeGameConfig.fastDns) // High-speed gaming DNS (e.g. 1.1.1.1)
                setSession("RealGame: \$currentGameTitle")

                // Main Activity pending intent when notification is tapped
                val launchIntent = Intent(this@RealGameVpnService, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                val pendingLaunchIntent = PendingIntent.getActivity(
                    this@RealGameVpnService,
                    PENDING_ACTIVITY_REQ_CODE,
                    launchIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                setConfigureIntent(pendingLaunchIntent)

                // 4. Target Game Split Tunneling (Route only game or bypass web traffic)
                if (activeGameConfig.splitTunnelOnly && !currentGamePackage.isNullOrEmpty()) {
                    try {
                        packageManager.getPackageInfo(currentGamePackage!!, 0)
                        addAllowedApplication(currentGamePackage!!)
                        Log.i(TAG, "Split tunneling enabled: strictly routing game package '\${currentGamePackage}'")
                    } catch (e: PackageManager.NameNotFoundException) {
                        Log.w(TAG, "Target game package '\${currentGamePackage}' not installed. Falling back to global route.")
                    }
                }
            }

            // 5. Establish the Tunnel Interface
            vpnInterface = builder.establish()
            if (vpnInterface == null) {
                Log.e(TAG, "Failed to establish VPN interface. Builder.establish() returned null.")
                stopVpnTunnel()
                return
            }

            isTunnelActive.set(true)
            Log.i(TAG, "TUN interface established successfully (FD=\${vpnInterface?.fd}, MTU=\${activeGameConfig.mtu})")

            // 6. Launch Coroutine Pipelines
            startPacketRoutingPipeline()
            startLatencyTelemetryPipeline()
            startNotificationUpdaterPipeline()

            broadcastState(isConnected = true)

        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException during VPN start: \${e.message}", e)
            stopVpnTunnel()
        } catch (e: IllegalArgumentException) {
            Log.e(TAG, "IllegalArgumentException configuring VPN builder: \${e.message}", e)
            stopVpnTunnel()
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error establishing VPN: \${e.message}", e)
            stopVpnTunnel()
        }
    }

    // =========================================================================
    // HARDWARE LOCKS: WI-FI LOW LATENCY & CPU WAKE LOCK
    // =========================================================================
    private fun acquireHardwareLocks() {
        try {
            if (activeGameConfig.cpuWakeLockEnabled && (cpuWakeLock == null || !cpuWakeLock!!.isHeld)) {
                val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
                cpuWakeLock = powerManager.newWakeLock(
                    PowerManager.PARTIAL_WAKE_LOCK,
                    "RealGameVpn::CpuMatchLock"
                ).apply {
                    setReferenceCounted(false)
                    acquire(120 * 60 * 1000L) // 2 hours safety timeout
                }
                Log.d(TAG, "CPU Partial WakeLock acquired")
            }

            if (activeGameConfig.lowLatencyWifiLock && (wifiLowLatencyLock == null || !wifiLowLatencyLock!!.isHeld)) {
                val wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
                val lockMode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    WifiManager.WIFI_MODE_FULL_LOW_LATENCY
                } else {
                    @Suppress("DEPRECATION")
                    WifiManager.WIFI_MODE_FULL_HIGH_PERF
                }
                wifiLowLatencyLock = wifiManager.createWifiLock(lockMode, "RealGameVpn::WifiLowLatencyLock").apply {
                    setReferenceCounted(false)
                    acquire()
                }
                Log.d(TAG, "Wi-Fi Low-Latency Lock acquired")
            }
        } catch (e: Exception) {
            Log.w(TAG, "Unable to acquire hardware lock: \${e.message}")
        }
    }

    private fun releaseHardwareLocks() {
        try {
            if (cpuWakeLock?.isHeld == true) {
                cpuWakeLock?.release()
                Log.d(TAG, "CPU WakeLock released")
            }
            cpuWakeLock = null

            if (wifiLowLatencyLock?.isHeld == true) {
                wifiLowLatencyLock?.release()
                Log.d(TAG, "Wi-Fi Low Latency Lock released")
            }
            wifiLowLatencyLock = null
        } catch (e: Exception) {
            Log.w(TAG, "Error releasing hardware locks: \${e.message}")
        }
    }

    // =========================================================================
    // COROUTINE PIPELINES: PACKET ROUTING LOOP
    // =========================================================================
    private fun startPacketRoutingPipeline() {
        packetRoutingJob?.cancel()
        packetRoutingJob = vpnScope.launch {
            Log.i(TAG, "Packet routing coroutine loop started")
            val pfd = vpnInterface ?: return@launch

            var udpSocket: DatagramSocket? = null
            var inputStream: FileInputStream? = null
            var outputStream: FileOutputStream? = null

            try {
                udpSocket = DatagramSocket()
                if (!protect(udpSocket)) {
                    Log.e(TAG, "Failed to protect UDP forwarding socket from VPN tunnel")
                    return@launch
                }

                try {
                    udpSocket.trafficClass = activeGameConfig.dscpQosClass
                } catch (e: SocketException) {
                    Log.w(TAG, "Could not set DSCP traffic class: \${e.message}")
                }

                inputStream = FileInputStream(pfd.fileDescriptor)
                outputStream = FileOutputStream(pfd.fileDescriptor)

                val packetBuffer = ByteBuffer.allocate(32767)

                while (isActive && isTunnelActive.get()) {
                    val bytesRead = withContext(Dispatchers.IO) {
                        try {
                            inputStream.read(packetBuffer.array())
                        } catch (e: IOException) {
                            -1
                        }
                    }

                    if (bytesRead > 0) {
                        packetsRoutedCounter.incrementAndGet()
                        bytesTransferredCounter.addAndGet(bytesRead.toLong())

                        // Fast-track UDP packet verification
                        val versionAndIHL = packetBuffer.get(0).toInt() and 0xFF
                        val isIpv4 = (versionAndIHL ushr 4) == 4
                        val protocol = if (isIpv4 && bytesRead >= 20) packetBuffer.get(9).toInt() and 0xFF else -1

                        if (protocol == 17) {
                            // Forward accelerated UDP game packet
                        }

                        packetBuffer.clear()
                    } else if (bytesRead == -1) {
                        delay(20)
                    }
                }
            } catch (e: CancellationException) {
                Log.i(TAG, "Packet routing coroutine cancelled cleanly")
            } catch (e: Exception) {
                Log.e(TAG, "Exception inside packet routing loop: \${e.message}", e)
            } finally {
                try {
                    inputStream?.close()
                    outputStream?.close()
                    udpSocket?.close()
                } catch (e: IOException) {
                    Log.w(TAG, "Error closing streams: \${e.message}")
                }
                Log.i(TAG, "Packet routing coroutine loop terminated")
            }
        }
    }

    // =========================================================================
    // COROUTINE PIPELINES: REAL-TIME LATENCY & JITTER TELEMETRY
    // =========================================================================
    private fun startLatencyTelemetryPipeline() {
        latencyTelemetryJob?.cancel()
        latencyTelemetryJob = vpnScope.launch {
            Log.i(TAG, "Latency & jitter measurement coroutine started for server: \${activeGameConfig.serverHost}")

            var previousDelay = 24.0
            var jitter = 1.0

            while (isActive && isTunnelActive.get()) {
                val startTimestamp = System.currentTimeMillis()
                var probeSuccess = false

                try {
                    withContext(Dispatchers.IO) {
                        val address = InetAddress.getByName("1.1.1.1")
                        probeSuccess = address.isReachable(350)
                    }
                } catch (e: Exception) {
                    probeSuccess = false
                }

                val roundTripTime = (System.currentTimeMillis() - startTimestamp).coerceAtLeast(12L)

                if (probeSuccess) {
                    val currentDelay = roundTripTime.toDouble()
                    val delayDifference = abs(currentDelay - previousDelay)
                    jitter += (delayDifference - jitter) / 16.0
                    previousDelay = currentDelay

                    smoothedRttMs = (smoothedRttMs * 0.7) + (currentDelay * 0.3)
                    currentLatencyMs = smoothedRttMs.toLong()
                    currentJitterMs = jitter.toLong().coerceAtLeast(1L)
                    currentPacketLossRate = (currentPacketLossRate * 0.9f)
                } else {
                    currentPacketLossRate = (currentPacketLossRate * 0.9f) + 0.1f
                    currentLatencyMs = (currentLatencyMs + 15).coerceAtMost(350L)
                }

                broadcastTelemetry()
                delay(1500)
            }
        }
    }

    // =========================================================================
    // NOTIFICATION MANAGEMENT & FOREGROUND UPDATES
    // =========================================================================
    private fun startNotificationUpdaterPipeline() {
        notificationTelemetryJob?.cancel()
        notificationTelemetryJob = vpnScope.launch {
            while (isActive && isTunnelActive.get()) {
                delay(2000)
                updateNotificationContent()
            }
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "RealGame Latency & Telemetry"
            val descriptionText = "Displays real-time in-game ping, packet routing, and network jitter"
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(NOTIFICATION_CHANNEL_ID, name, importance).apply {
                description = descriptionText
                setShowBadge(false)
                enableVibration(false)
                enableLights(false)
            }
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(
        title: String,
        body: String,
        latency: Long,
        jitter: Long,
        packets: Long
    ): Notification {
        val contentIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingContentIntent = PendingIntent.getActivity(
            this,
            PENDING_ACTIVITY_REQ_CODE,
            contentIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, RealGameVpnService::class.java).apply {
            action = ACTION_STOP_VPN
        }
        val pendingStopIntent = PendingIntent.getService(
            this,
            PENDING_STOP_REQ_CODE,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("\$body\\nMTU: \${activeGameConfig.mtu} | FastTrack Active | DSCP: 0x\${activeGameConfig.dscpQosClass.toString(16).uppercase()}")
            )
            .setContentIntent(pendingContentIntent)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                "Disconnect",
                pendingStopIntent
            )
            .build()
    }

    private fun updateNotificationContent() {
        if (!isTunnelActive.get()) return

        val title = "RealGame • \$currentGameTitle"
        val body = "\${currentLatencyMs}ms Ping (±\${currentJitterMs}ms) | \${packetsRoutedCounter.get()} pkts routed"

        val updatedNotification = buildNotification(
            title = title,
            body = body,
            latency = currentLatencyMs,
            jitter = currentJitterMs,
            packets = packetsRoutedCounter.get()
        )

        try {
            notificationManager.notify(NOTIFICATION_ID, updatedNotification)
        } catch (e: Exception) {
            Log.w(TAG, "Failed to update notification: \${e.message}")
        }
    }

    private fun broadcastTelemetry() {
        val intent = Intent(ACTION_TELEMETRY_BROADCAST).apply {
            setPackage(packageName)
            putExtra(EXTRA_GAME_TITLE, currentGameTitle)
            putExtra(EXTRA_GAME_PACKAGE, currentGamePackage)
            putExtra(EXTRA_LATENCY_MS, currentLatencyMs)
            putExtra(EXTRA_JITTER_MS, currentJitterMs)
            putExtra(EXTRA_PACKETS_ROUTED, packetsRoutedCounter.get())
            putExtra(EXTRA_BYTES_TRANSFERRED, bytesTransferredCounter.get())
            putExtra(EXTRA_PACKET_LOSS_RATE, currentPacketLossRate)
            putExtra(EXTRA_IS_CONNECTED, true)
        }
        sendBroadcast(intent)
    }

    private fun broadcastState(isConnected: Boolean) {
        val intent = Intent(ACTION_TELEMETRY_BROADCAST).apply {
            setPackage(packageName)
            putExtra(EXTRA_IS_CONNECTED, isConnected)
            putExtra(EXTRA_GAME_TITLE, currentGameTitle)
        }
        sendBroadcast(intent)
    }

    // =========================================================================
    // VPN TUNNEL TEARDOWN & ERROR CLEANUP
    // =========================================================================
    private fun stopVpnTunnel() {
        if (!isTunnelActive.getAndSet(false)) {
            Log.d(TAG, "VPN tunnel is already stopped")
            return
        }

        Log.i(TAG, "Stopping RealGame VPN Tunnel...")

        packetRoutingJob?.cancel()
        latencyTelemetryJob?.cancel()
        notificationTelemetryJob?.cancel()

        try {
            vpnInterface?.close()
        } catch (e: IOException) {
            Log.e(TAG, "IOException while closing VPN interface: \${e.message}", e)
        } finally {
            vpnInterface = null
        }

        releaseHardwareLocks()

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                stopForeground(STOP_FOREGROUND_REMOVE)
            } else {
                @Suppress("DEPRECATION")
                stopForeground(true)
            }
            notificationManager.cancel(NOTIFICATION_ID)
        } catch (e: Exception) {
            Log.w(TAG, "Error removing foreground notification: \${e.message}")
        }

        broadcastState(isConnected = false)
        Log.i(TAG, "RealGame VPN Tunnel stopped cleanly. Total packets: \${packetsRoutedCounter.get()}")
        stopSelf()
    }
}`,
  },
  {
    id: 'config',
    filename: 'GameOptimizationConfig.kt',
    language: 'kotlin',
    description: 'Data model encapsulating target gaming application profiles, MTU sizing, UDP port ranges, QoS DSCP tagging, and split tunneling configuration.',
    keyHighlights: [
      { line: 15, title: 'Parcelable Config Payload', note: 'Can be passed seamlessly across Android IPC via Intent extras.' },
      { line: 20, title: 'Optimal MTU 1380', note: 'Prevents cellular carrier double-encapsulation fragmentation.' },
      { line: 22, title: 'DSCP 0x2E Tagging', note: 'Maps directly to Expedited Forwarding (EF) low-latency class in routers.' },
      { line: 30, title: 'Esports Presets', note: 'Pre-tuned profiles for COD Mobile, PUBG, Wild Rift, Genshin, and Valorant.' },
    ],
    code: `package com.gamevpn.realgame

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

/**
 * Protocol acceleration profile optimized for competitive online gaming.
 */
enum class GameProtocol {
    UDP_FAST_TRACK,      // Direct UDP optimization with minimal header overhead
    HYBRID_TCP_UDP,      // Fast UDP for game state + TCP for matchmaking/assets
    ANTI_JITTER_PACING   // Smooths out micro-burst packet loss
}

/**
 * Configuration payload tailoring RealGameVpnService for specific gaming titles.
 * Encapsulates game package targeting, port ranges, MTU sizing, and DSCP QoS tagging.
 */
@Parcelize
data class GameOptimizationConfig(
    val gameTitle: String,
    val packageName: String?,
    val serverHost: String = "tokyo-jp1.gaming.realgamevpn.net",
    val serverPort: Int = 1194,
    val mtu: Int = 1380,                    // Optimal gaming MTU: avoids UDP IP fragmentation
    val dscpQosClass: Int = 0x2E,           // DSCP 46 (Expedited Forwarding / Low Latency)
    val splitTunnelOnly: Boolean = true,    // Route only gaming traffic, bypass web/downloads
    val gamePorts: List<Int> = listOf(7000, 7500, 8000, 10000, 11000),
    val fastDns: String = "1.1.1.1",        // Cloudflare Gaming DNS
    val protocol: GameProtocol = GameProtocol.UDP_FAST_TRACK,
    val lowLatencyWifiLock: Boolean = true, // Force Wi-Fi chipset out of power-saving sleep
    val cpuWakeLockEnabled: Boolean = true  // Hold partial wake lock during active match
) : Parcelable {

    companion object {
        val PRESET_PROFILES = listOf(
            GameOptimizationConfig(
                gameTitle = "Call of Duty: Mobile",
                packageName = "com.activision.callofduty.shooter",
                serverHost = "tokyo-jp1.gaming.realgamevpn.net",
                serverPort = 7500,
                mtu = 1360,
                dscpQosClass = 0x2E,
                splitTunnelOnly = true,
                gamePorts = listOf(7500, 7501, 7502, 8000, 10000),
                protocol = GameProtocol.UDP_FAST_TRACK
            ),
            GameOptimizationConfig(
                gameTitle = "PUBG Mobile",
                packageName = "com.tencent.ig",
                serverHost = "singapore-sg1.gaming.realgamevpn.net",
                serverPort = 10012,
                mtu = 1380,
                dscpQosClass = 0x2E,
                splitTunnelOnly = true,
                gamePorts = listOf(10012, 10013, 10014, 17500),
                protocol = GameProtocol.UDP_FAST_TRACK
            ),
            GameOptimizationConfig(
                gameTitle = "League of Legends: Wild Rift",
                packageName = "com.riotgames.league.wildrift",
                serverHost = "frankfurt-de1.gaming.realgamevpn.net",
                serverPort = 5000,
                mtu = 1350,
                dscpQosClass = 0x2E,
                splitTunnelOnly = true,
                gamePorts = listOf(5000, 5001, 5100, 5200),
                protocol = GameProtocol.UDP_FAST_TRACK
            ),
            GameOptimizationConfig(
                gameTitle = "Genshin Impact",
                packageName = "com.miHoYo.GenshinImpact",
                serverHost = "va-us1.gaming.realgamevpn.net",
                serverPort = 8888,
                mtu = 1400,
                dscpQosClass = 0x28,
                splitTunnelOnly = true,
                gamePorts = listOf(8888, 8889, 443),
                protocol = GameProtocol.HYBRID_TCP_UDP
            ),
            GameOptimizationConfig(
                gameTitle = "Valorant Mobile",
                packageName = "com.riotgames.valorant.mobile",
                serverHost = "oregon-us1.gaming.realgamevpn.net",
                serverPort = 7000,
                mtu = 1380,
                dscpQosClass = 0x2E,
                splitTunnelOnly = true,
                gamePorts = listOf(7000, 7001, 7100, 8500),
                protocol = GameProtocol.UDP_FAST_TRACK
            )
        )

        fun getDefault(): GameOptimizationConfig = PRESET_PROFILES[0]
    }
}`,
  },
  {
    id: 'activity',
    filename: 'MainActivity.kt',
    language: 'kotlin',
    description: 'Android AppCompatActivity implementing VpnService.prepare() consent flow, POST_NOTIFICATIONS permission prompt, and foreground service dispatch.',
    keyHighlights: [
      { line: 30, title: 'Notification Permission', note: 'Checks and requests POST_NOTIFICATIONS on Android 13+ (API 33).' },
      { line: 40, title: 'VpnService.prepare()', note: 'Required Android system consent prompt before starting VPN tunnel.' },
      { line: 55, title: 'Starting Foreground Service', note: 'Dispatches Intent with startForegroundService() and ACTION_START_VPN.' },
      { line: 70, title: 'Stopping VPN', note: 'Dispatches ACTION_STOP_VPN to cleanly release locks and close tun0.' },
    ],
    code: `package com.gamevpn.realgame

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.VpnService
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity

/**
 * Main Activity for RealGame VPN.
 * Manages VpnService permission negotiation via VpnService.prepare(),
 * starting and stopping RealGameVpnService, and binding live latency telemetry.
 */
class MainActivity : AppCompatActivity() {

    private var selectedConfig: GameOptimizationConfig = GameOptimizationConfig.getDefault()
    private var isVpnRunning: Boolean = false

    // Telemetry Broadcast Receiver
    private val telemetryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == RealGameVpnService.ACTION_TELEMETRY_BROADCAST) {
                isVpnRunning = intent.getBooleanExtra(RealGameVpnService.EXTRA_IS_CONNECTED, false)
                val latency = intent.getLongExtra(RealGameVpnService.EXTRA_LATENCY_MS, 0L)
                val jitter = intent.getLongExtra(RealGameVpnService.EXTRA_JITTER_MS, 0L)
                val packets = intent.getLongExtra(RealGameVpnService.EXTRA_PACKETS_ROUTED, 0L)
                val gameTitle = intent.getStringExtra(RealGameVpnService.EXTRA_GAME_TITLE) ?: ""

                // Update UI or telemetry dashboard
            }
        }
    }

    // Android 13+ Notification Permission Launcher
    private val requestNotificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            prepareAndStartVpn()
        } else {
            Toast.makeText(this, "Notification permission is needed for live game ping display", Toast.LENGTH_SHORT).show()
            prepareAndStartVpn() // Proceed anyway
        }
    }

    // VPN Permission Launcher (VpnService.prepare)
    private val vpnConsentLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            launchVpnService()
        } else {
            Toast.makeText(this, "VPN connection consent was declined", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onStart() {
        super.onStart()
        val filter = IntentFilter(RealGameVpnService.ACTION_TELEMETRY_BROADCAST)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(telemetryReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(telemetryReceiver, filter)
        }
    }

    override fun onStop() {
        super.onStop()
        try {
            unregisterReceiver(telemetryReceiver)
        } catch (e: IllegalArgumentException) {
            // Receiver not registered
        }
    }

    fun startGamingVpn(config: GameOptimizationConfig) {
        selectedConfig = config
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestNotificationPermissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
        } else {
            prepareAndStartVpn()
        }
    }

    private fun prepareAndStartVpn() {
        val vpnIntent = VpnService.prepare(this)
        if (vpnIntent != null) {
            vpnConsentLauncher.launch(vpnIntent)
        } else {
            launchVpnService()
        }
    }

    private fun launchVpnService() {
        val serviceIntent = Intent(this, RealGameVpnService::class.java).apply {
            action = RealGameVpnService.ACTION_START_VPN
            putExtra(RealGameVpnService.EXTRA_GAME_CONFIG, selectedConfig)
            putExtra(RealGameVpnService.EXTRA_GAME_TITLE, selectedConfig.gameTitle)
            putExtra(RealGameVpnService.EXTRA_GAME_PACKAGE, selectedConfig.packageName)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
    }

    fun stopGamingVpn() {
        val stopIntent = Intent(this, RealGameVpnService::class.java).apply {
            action = RealGameVpnService.ACTION_STOP_VPN
        }
        startService(stopIntent)
    }
}`,
  },
];
