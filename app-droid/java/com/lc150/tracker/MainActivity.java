package com.lc150.tracker;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Vibrator;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * 主界面：一个 WebView 装载本地 H5 应用。
 *
 * 三个关键点：
 *
 * 1) 页面不用 file:// 加载，而是虚拟域名 https://appassets.local/，
 *    由 shouldInterceptRequest 从 assets 读取返回。
 *    原因：file:// origin 下 localStorage 在部分 WebView 版本上不可靠，
 *    换成真实 https origin 后，存储行为与线上网页完全一致。
 *
 * 2) 「打开题目」通过 JS 接口 openUrl 走 Intent.ACTION_VIEW，
 *    直接拉起系统浏览器——这是微信小程序做不到的能力。
 *
 * 3) 数据备份用系统文件选择器（SAF：ACTION_CREATE_DOCUMENT / ACTION_OPEN_DOCUMENT），
 *    不用任何存储权限，也不用 FileProvider（那要引 androidx）。
 *    用户点「导出」→ 系统弹保存框 → 存到下载目录或网盘；
 *    换机时把文件传过去，点「导入」→ 系统弹文件列表 → 选中即恢复。
 */
public class MainActivity extends Activity {

    private static final String ORIGIN = "https://appassets.local";
    private static final String START_URL = ORIGIN + "/index.html";

    private static final String COLOR_DARK = "#0E1116";
    private static final String COLOR_LIGHT = "#F2F4F8";

    /** 文件选择器的请求码 */
    private static final int REQ_EXPORT = 1001;
    private static final int REQ_IMPORT = 1002;

    /** 导入文件的体积上限：正常备份 30–120KB，超过 4MB 一定是选错文件了 */
    private static final int MAX_IMPORT_BYTES = 4 * 1024 * 1024;

    private WebView web;

    /** 等待写入文件的内容（用户选完保存位置后才落盘） */
    private String pendingExport = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        web = new WebView(this);
        web.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // localStorage 必需
        s.setDatabaseEnabled(true);
        s.setTextZoom(100);                    // 不跟随系统字体缩放，避免布局被撑坏
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setAllowFileAccess(false);           // 走虚拟域名，不需要文件访问
        s.setAllowContentAccess(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setMediaPlaybackRequiresUserGesture(true);
        if (Build.VERSION.SDK_INT >= 26) {
            s.setSafeBrowsingEnabled(false);
        }
        // Android 10+ 会按系统深色模式给网页强制反色，会毁掉应用自己的配色，显式关闭
        if (Build.VERSION.SDK_INT >= 29) {
            try {
                WebSettings.class.getMethod("setForceDark", int.class).invoke(s, 0);
            } catch (Exception ignored) {
            }
        }

        web.setBackgroundColor(Color.parseColor(COLOR_DARK));
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);

        web.setWebViewClient(new WebViewClient() {

            /** 虚拟域名 → assets/www 下的文件 */
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri == null || !"appassets.local".equals(uri.getHost())) return null;

                String path = uri.getPath();
                if (path == null || path.equals("/")) path = "/index.html";
                String assetPath = "www" + path;

                try {
                    InputStream is = getAssets().open(assetPath);
                    return new WebResourceResponse(mimeOf(assetPath), "UTF-8", is);
                } catch (IOException e) {
                    return new WebResourceResponse("text/plain", "UTF-8",
                            new java.io.ByteArrayInputStream("not found".getBytes()));
                }
            }

            /** 站外链接一律交给系统浏览器 */
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri == null) return false;

                String scheme = uri.getScheme() == null ? "" : uri.getScheme();
                String host = uri.getHost() == null ? "" : uri.getHost();

                // 本地页面内部跳转（hash 路由）放行
                if ("appassets.local".equals(host)) return false;

                // http / https 交给系统浏览器
                if (scheme.equals("http") || scheme.equals("https")) {
                    openInBrowser(uri);
                    return true;
                }

                // 其他 scheme（intent、tel 等）尝试外部处理
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {
                }
                return true;
            }
        });

        web.addJavascriptInterface(new Bridge(), "Android");

        applyStatusBar(false);
        web.loadUrl(START_URL);
    }

    /* ============================================================
     * JS 桥
     * ============================================================ */

    private class Bridge {

        /** 用系统浏览器打开题目链接 */
        @JavascriptInterface
        public void openUrl(final String url) {
            if (url == null || url.isEmpty()) return;
            runOnUiThread(new Runnable() {
                public void run() {
                    openInBrowser(Uri.parse(url));
                }
            });
        }

        /** 复制文本到剪贴板 */
        @JavascriptInterface
        public void copy(final String text) {
            if (text == null) return;
            runOnUiThread(new Runnable() {
                public void run() {
                    try {
                        ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                        cm.setPrimaryClip(ClipData.newPlainText("lc150", text));
                    } catch (Exception ignored) {
                    }
                }
            });
        }

        /** 退出应用（返回键在首页时触发） */
        @JavascriptInterface
        public void exit() {
            runOnUiThread(new Runnable() {
                public void run() {
                    finish();
                }
            });
        }

        /** 轻震动反馈 */
        @JavascriptInterface
        public void tap() {
            runOnUiThread(new Runnable() {
                public void run() {
                    try {
                        Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                        if (v != null && v.hasVibrator()) v.vibrate(8);
                    } catch (Exception ignored) {
                    }
                }
            });
        }

        /** 跟随应用内主题调整状态栏 */
        @JavascriptInterface
        public void setTheme(final boolean light) {
            runOnUiThread(new Runnable() {
                public void run() {
                    applyStatusBar(light);
                    web.setBackgroundColor(Color.parseColor(light ? COLOR_LIGHT : COLOR_DARK));
                }
            });
        }

        /* ---------------- 备份文件：导出 / 导入 ---------------- */

        /**
         * 把文本存成文件。
         * 走 ACTION_CREATE_DOCUMENT：系统弹出保存框，用户自己选位置
         * （下载目录 / 网盘 / 微信收藏都行），应用不需要任何存储权限。
         *
         * 完成后回调 window.__fileCb('export', ok, message)
         */
        @JavascriptInterface
        public void exportFile(final String suggestedName, final String content) {
            if (content == null || content.isEmpty()) {
                callJs("window.__fileCb&&window.__fileCb('export',false,'没有可保存的数据','')");
                return;
            }
            pendingExport = content;
            runOnUiThread(new Runnable() {
                public void run() {
                    try {
                        Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                        i.addCategory(Intent.CATEGORY_OPENABLE);
                        i.setType("application/json");
                        i.putExtra(Intent.EXTRA_TITLE,
                                (suggestedName == null || suggestedName.isEmpty())
                                        ? "lc150-backup.json" : suggestedName);
                        startActivityForResult(i, REQ_EXPORT);
                    } catch (Exception e) {
                        pendingExport = null;
                        failJs("export", "这台手机没有可用的文件保存界面，请改用「复制文本」");
                    }
                }
            });
        }

        /**
         * 让用户挑一个备份文件读回来。
         * 走 ACTION_OPEN_DOCUMENT，同样零权限。
         *
         * 完成后回调 window.__fileCb('import', ok, message, content)
         * 注意：这里只负责把文件内容交回 JS，校验与写入仍由 store.importJson 负责，
         * 保证「校验不通过绝不覆盖现有数据」这条不变。
         */
        @JavascriptInterface
        public void importFile() {
            runOnUiThread(new Runnable() {
                public void run() {
                    try {
                        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                        i.addCategory(Intent.CATEGORY_OPENABLE);
                        i.setType("*/*");   // 不少文件管理器把 .json 识别成 octet-stream，别限制类型
                        startActivityForResult(i, REQ_IMPORT);
                    } catch (Exception e) {
                        failJs("import", "这台手机没有可用的文件选择界面，请改用「粘贴文本」");
                    }
                }
            });
        }
    }

    /* ============================================================
     * 文件选择器回调
     * ============================================================ */

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_EXPORT) {
            handleExportResult(res, data);
            return;
        }
        if (req == REQ_IMPORT) {
            handleImportResult(res, data);
            return;
        }
        super.onActivityResult(req, res, data);
    }

    private void handleExportResult(int res, Intent data) {
        String content = pendingExport;
        pendingExport = null;

        if (res != RESULT_OK || data == null || data.getData() == null) {
            if (content != null && !content.isEmpty()) {
                callJs("window.__fileCb&&window.__fileCb('export',false,'已取消保存','')");
            }
            return;
        }

        Uri uri = data.getData();
        OutputStream os = null;
        try {
            os = getContentResolver().openOutputStream(uri, "wt");   // wt = 覆盖写入
            if (os == null) throw new IOException("无法打开输出流");
            os.write(content.getBytes("UTF-8"));
            os.flush();
            os.close();
            os = null;
            callJs("window.__fileCb&&window.__fileCb('export',true," +
                    JSONObject.quote("备份文件已保存") + "," +
                    JSONObject.quote(displayName(uri)) + ")");
        } catch (Exception e) {
            failJs("export", "保存失败：" + brief(e));
        } finally {
            if (os != null) {
                try { os.close(); } catch (Exception ignored) {
                }
            }
        }
    }

    private void handleImportResult(int res, Intent data) {
        if (res != RESULT_OK || data == null || data.getData() == null) {
            // 用户主动取消：回一个明确状态，JS 侧据此静默处理（不弹错误）
            failJs("import", "已取消");
            return;
        }

        Uri uri = data.getData();
        InputStream is = null;
        try {
            is = getContentResolver().openInputStream(uri);
            if (is == null) throw new IOException("无法打开文件");

            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            int total = 0;
            while ((n = is.read(buf)) > 0) {
                total += n;
                if (total > MAX_IMPORT_BYTES) {
                    throw new IOException("文件超过 4MB，可能选错了");
                }
                bos.write(buf, 0, n);
            }
            is.close();
            is = null;

            String text = bos.toString("UTF-8");
            callJs("window.__fileCb&&window.__fileCb('import',true," +
                    JSONObject.quote(displayName(uri)) + "," +
                    JSONObject.quote(text) + ")");
        } catch (Exception e) {
            failJs("import", "读取失败：" + brief(e));
        } finally {
            if (is != null) {
                try { is.close(); } catch (Exception ignored) {
                }
            }
        }
    }

    /** 取用户看到的文件名，用于回显 */
    private String displayName(Uri uri) {
        String p = uri.getLastPathSegment();
        if (p == null) return "备份文件";
        int slash = p.lastIndexOf('/');
        return slash >= 0 ? p.substring(slash + 1) : p;
    }

    private static String brief(Exception e) {
        String m = e.getMessage();
        return (m == null || m.isEmpty()) ? e.getClass().getSimpleName() : m;
    }

    /* ============================================================
     * 辅助
     * ============================================================ */

    /** 在主线程执行一段 JS（回调都走这里，避免线程问题） */
    private void callJs(final String js) {
        runOnUiThread(new Runnable() {
            public void run() {
                if (web != null) web.evaluateJavascript(js, null);
            }
        });
    }

    private void failJs(final String action, final String message) {
        callJs("window.__fileCb&&window.__fileCb(" +
                JSONObject.quote(action) + ",false," + JSONObject.quote(message) + ",'')");
    }

    private void openInBrowser(Uri uri) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, uri);
            i.addCategory(Intent.CATEGORY_BROWSABLE);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (Exception e) {
            Toast.makeText(this, "没有可用的浏览器", Toast.LENGTH_SHORT).show();
        }
    }

    private void applyStatusBar(boolean light) {
        int color = Color.parseColor(light ? COLOR_LIGHT : COLOR_DARK);
        try {
            getWindow().setStatusBarColor(color);
            if (Build.VERSION.SDK_INT >= 27) {
                getWindow().setNavigationBarColor(color);
            }
            // 浅色背景需要深色图标
            if (Build.VERSION.SDK_INT >= 23) {
                View decor = getWindow().getDecorView();
                int flags = decor.getSystemUiVisibility();
                if (light) {
                    flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                } else {
                    flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                }
                decor.setSystemUiVisibility(flags);
            }
        } catch (Exception ignored) {
        }
    }

    private static String mimeOf(String path) {
        Map<String, String> m = new HashMap<String, String>();
        m.put("html", "text/html");
        m.put("css", "text/css");
        m.put("js", "application/javascript");
        m.put("json", "application/json");
        m.put("png", "image/png");
        m.put("svg", "image/svg+xml");
        m.put("ico", "image/x-icon");

        int dot = path.lastIndexOf('.');
        String ext = dot >= 0 ? path.substring(dot + 1).toLowerCase() : "";
        String type = m.get(ext);
        return type != null ? type : "application/octet-stream";
    }

    /* ============================================================
     * 生命周期
     * ============================================================ */

    @Override
    public void onBackPressed() {
        // 交给 JS 先处理：关弹层 / 页面返回；处理不了时 JS 会调 exit()
        if (web != null) {
            web.evaluateJavascript("window.__handleBack && window.__handleBack()", null);
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.removeJavascriptInterface("Android");
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}
