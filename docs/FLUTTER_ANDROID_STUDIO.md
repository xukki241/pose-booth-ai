# Flutter + Android Studio Device Mirroring (Poco)

App mobile dùng C-Comic light-only (cùng token web: nền trắng, ink `#171717`, primary `#B42355`). Không dark theme.

## Điều kiện

- Docker API: `docker compose -f docker-compose.dev.yml up --build -d api`
- Flutter SDK (ổn định): `%LOCALAPPDATA%\flutter\bin` trên PATH
- Android Studio + plugin Flutter/Dart
- Poco: USB debugging + USB debugging (Security settings) + Install via USB, USB = File transfer

## Mở đúng project

Android Studio → Open → `apps/mobile` (không mở `apps/web/android` Capacitor).

View → Tool Windows → **Running Devices** → bật mirroring máy Poco.

## Reverse API rồi Run

```powershell
$env:Path = "$env:LOCALAPPDATA\flutter\bin;" + $env:Path
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb devices
& $adb reverse tcp:8000 tcp:8000
cd apps/mobile
flutter run -d <serial> --dart-define=API_BASE=http://127.0.0.1:8000
```

Trong Android Studio: Run configuration Additional run args = `--dart-define=API_BASE=http://127.0.0.1:8000`

Camera native không cần HTTPS. Không mở `http://192.168.x.x` khi đang reverse.
