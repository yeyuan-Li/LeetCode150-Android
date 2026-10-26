#!/usr/bin/env bash
# ============================================================
# build.sh —— 手工构建 LeetCode 150 打卡 APK
#
# 不依赖 Gradle / Android Studio，只用 SDK 自带命令行工具：
#   aapt2      编译资源 + 打包 assets
#   javac      编译 Java
#   d8         转 dex
#   zipalign   4 字节对齐
#   apksigner  签名
#
# 重要：aapt2 是原生程序，处理不了含中文的绝对路径（本工程位于
# 「微信web开发者工具」目录下）。因此实际构建在系统临时目录中完成，
# 全程只用相对路径，最后把产物拷回工程 out/ 目录。
#
# 用法：
#   ./build.sh            正式签名构建（首次会在有口令的前提下生成 keystore）
#   ./build.sh --debug    使用 Android 调试签名（快速验证）
#
# 签名口令来源（按优先级）：
#   环境变量 LC150_KS_PASS / LC150_KEY_PASS
#   本地文件 keystore/keystore.properties（storePassword= / keyPassword=，不入库）
# ============================================================
set -e

HERE="$(cd "$(dirname "$0")" && pwd)"

SDK="${ANDROID_SDK_ROOT:-D:/DEVELOP/Android/Sdk}"
BT="$SDK/build-tools/36.0.0"
PLATFORM="$SDK/platforms/android-34/android.jar"

NODE="${NODE_BIN:-C:/Users/lipengxin/.workbuddy/binaries/node/versions/22.22.2-6/node.exe}"
PY="${PYTHON_BIN:-C:/Users/lipengxin/.workbuddy/binaries/python/versions/3.13.12/python.exe}"

# 无中文的临时构建目录
WORK="$(cygpath -m "${TMPDIR:-/tmp}")/lc150-build"
OUT_DIR="$HERE/out"
KS_DIR="$HERE/keystore"
KS="$KS_DIR/lc150.jks"
KS_PROPS="$KS_DIR/keystore.properties"
KS_ALIAS="${LC150_KS_ALIAS:-lc150}"

# 签名口令不入库：优先读环境变量，其次读本地未提交的 keystore.properties
KS_PASS="${LC150_KS_PASS:-}"
KEY_PASS="${LC150_KEY_PASS:-}"
if [ -z "$KS_PASS" ] && [ -f "$KS_PROPS" ]; then
  KS_PASS="$(sed -n 's/^storePassword=//p' "$KS_PROPS" | head -1)"
fi
if [ -z "$KEY_PASS" ] && [ -f "$KS_PROPS" ]; then
  KEY_PASS="$(sed -n 's/^keyPassword=//p' "$KS_PROPS" | head -1)"
fi
[ -n "$KEY_PASS" ] || KEY_PASS="$KS_PASS"

echo "──────────────────────────────────────────────"
echo " LeetCode 150 打卡 · APK 构建"
echo "──────────────────────────────────────────────"

for f in "$BT/aapt2.exe" "$BT/lib/d8.jar" "$BT/zipalign.exe" "$BT/lib/apksigner.jar" "$PLATFORM"; do
  [ -e "$f" ] || { echo "✗ 缺少构建工具: $f"; echo "  需先安装 build-tools;36.0.0 与 platforms;android-34"; exit 1; }
done

# ------------------------------------------------------------
# 1. 生成 H5 bundle（复用小程序工程的 utils / data 源码）
# ------------------------------------------------------------
echo "[1/7] 打包业务逻辑 bundle.js"
"$NODE" "$HERE/tools/bundle.js"

# ------------------------------------------------------------
# 2. 准备无中文路径的构建沙箱
# ------------------------------------------------------------
echo "[2/7] 准备构建沙箱 $WORK"
rm -rf "$WORK"
mkdir -p "$WORK"
cp -r "$HERE/res" "$HERE/assets" "$HERE/java" "$HERE/AndroidManifest.xml" "$WORK/"
cd "$WORK"
mkdir -p classes dex

# 调试用的测量页不进 APK（assets/www/_*.html 仅用于本地诊断）
rm -f assets/www/_*.html

# ------------------------------------------------------------
# 3. 编译资源
# ------------------------------------------------------------
echo "[3/7] 编译资源 (aapt2 compile)"
"$BT/aapt2.exe" compile --dir res -o res.zip

echo "      链接资源并打包 assets (aapt2 link)"
"$BT/aapt2.exe" link \
  -o base.apk \
  -I "$(cygpath -m "$PLATFORM")" \
  --manifest AndroidManifest.xml \
  -A assets \
  --min-sdk-version 24 \
  --target-sdk-version 34 \
  res.zip

# ------------------------------------------------------------
# 4. 编译 Java
# ------------------------------------------------------------
echo "[4/7] 编译 Java (javac)"
JAVA_FILES=$(find java -name '*.java' | tr '\n' ' ')
# JDK 9+ 起 -bootclasspath 不再允许与 -target 组合，改用 --release + classpath 指向 android.jar
javac --release 8 -encoding UTF-8 -nowarn \
  -classpath "$(cygpath -m "$PLATFORM")" \
  -d classes $JAVA_FILES

# ------------------------------------------------------------
# 5. 转 dex
# ------------------------------------------------------------
echo "[5/7] 转换为 dex (d8)"
CLASS_FILES=$(find classes -name '*.class' | tr '\n' ' ')
# 直接调 d8.jar：.bat 会重排参数，且 build-tools 34 的 d8 在 JDK 21 下有匿名内部类崩溃问题
java -cp "$BT/lib/d8.jar" com.android.tools.r8.D8 \
  --lib "$(cygpath -m "$PLATFORM")" --min-api 24 --output dex $CLASS_FILES

# ------------------------------------------------------------
# 6. 合并 dex
# ------------------------------------------------------------
echo "[6/7] 合并 dex 到 apk"
"$PY" "$(cygpath -m "$HERE/tools/pack.py")" base.apk dex/classes.dex unsigned.apk

# ------------------------------------------------------------
# 7. 对齐 + 签名
# ------------------------------------------------------------
echo "[7/7] 对齐与签名"

if [ "$1" = "--debug" ]; then
  DKS="$HOME/.android/debug.keystore"
  if [ ! -e "$DKS" ]; then
    mkdir -p "$HOME/.android"
    keytool -genkeypair -keystore "$DKS" -storepass android -keypass android \
      -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 \
      -dname "CN=Android Debug,O=Android,C=US" >/dev/null 2>&1
  fi
  KS_ARG="$DKS"; KS_PASS_ARG="android"; KEY_PASS_ARG="android"; ALIAS_ARG="androiddebugkey"
else
  [ -d "$KS_DIR" ] || mkdir -p "$KS_DIR"
  if [ ! -e "$KS" ]; then
    if [ -z "$KS_PASS" ]; then
      echo "✗ 缺少签名口令，无法生成新密钥。"
      echo "  请设置环境变量 LC150_KS_PASS，或创建 $KS_PROPS："
      echo "      storePassword=你的口令"
      echo "      keyPassword=你的口令"
      exit 1
    fi
    echo "      首次构建：生成签名密钥"
    keytool -genkeypair -keystore "$(cygpath -m "$KS")" -storepass "$KS_PASS" -keypass "$KEY_PASS" \
      -alias "$KS_ALIAS" -keyalg RSA -keysize 2048 -validity 10000 \
      -dname "CN=LC150 Tracker, OU=Personal, O=Personal, L=Beijing, ST=Beijing, C=CN" >/dev/null 2>&1
  fi
  if [ -z "$KS_PASS" ]; then
    echo "✗ 已有 keystore 但读不到口令。"
    echo "  请设置环境变量 LC150_KS_PASS，或创建 $KS_PROPS（storePassword=... / keyPassword=...）"
    exit 1
  fi
  KS_ARG="$KS"; KS_PASS_ARG="$KS_PASS"; KEY_PASS_ARG="$KEY_PASS"; ALIAS_ARG="$KS_ALIAS"
fi

"$BT/zipalign.exe" -f -p 4 unsigned.apk aligned.apk

java -jar "$BT/lib/apksigner.jar" sign \
  --ks "$(cygpath -m "$KS_ARG")" \
  --ks-pass "pass:$KS_PASS_ARG" \
  --key-pass "pass:$KEY_PASS_ARG" \
  --out signed.apk \
  aligned.apk

mkdir -p "$OUT_DIR"
cp signed.apk "$OUT_DIR/lc150-tracker.apk"

echo ""
echo "      签名校验："
java -jar "$BT/lib/apksigner.jar" verify --print-certs signed.apk | head -5

SIZE=$(du -k "$OUT_DIR/lc150-tracker.apk" | cut -f1)
echo ""
echo "──────────────────────────────────────────────"
echo " ✓ 构建完成"
echo "   产物: $OUT_DIR/lc150-tracker.apk"
echo "   大小: ${SIZE} KB"
echo "──────────────────────────────────────────────"
